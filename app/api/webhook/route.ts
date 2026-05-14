import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import type { CartItem } from '@/lib/cart-context'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secretKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe env vars not configured.' }, { status: 500 })
  }

  const stripe = new Stripe(secretKey)
  const body   = await req.text()
  const sig    = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    await handleOrderPaid(pi)
  }

  if (event.type === 'payment_intent.payment_failed') {
    console.log('Payment failed:', event.data.object.id)
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const sb = await createClient()
      await sb.from('orders').update({ status: 'refunded' }).eq('stripe_payment_intent', charge.payment_intent as string)
    } catch {}
  }

  return NextResponse.json({ ok: true })
}

async function handleOrderPaid(pi: Stripe.PaymentIntent) {
  const m = pi.metadata ?? {}

  // Update order status to 'paid' and read cart items
  let cartItems: CartItem[] = []
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const sb = await createClient()

    // Read existing order (pre-saved at checkout creation) to get cart items
    const { data: existing } = await sb
      .from('orders')
      .select('cart_json')
      .eq('stripe_session_id', pi.id)
      .single()

    if (existing) {
      cartItems = Array.isArray(existing.cart_json) ? existing.cart_json : []
      await sb.from('orders').update({ status: 'paid' }).eq('stripe_session_id', pi.id)
    } else {
      // Fallback: insert if pre-save failed
      await sb.from('orders').insert({
        stripe_session_id:     pi.id,
        stripe_payment_intent: pi.id,
        customer_email:        m.customer_email,
        customer_name:         m.customer_name,
        customer_phone:        m.customer_phone,
        address:               m.address,
        city:                  m.city,
        zip:                   m.zip,
        province:              m.province,
        notes:                 m.notes,
        total_eur:             pi.amount / 100,
        cart_json:             [],
        status:                'paid',
      })
    }
  } catch (err) {
    console.error('Failed to update order in Supabase:', err)
  }

  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const total     = (pi.amount / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })
  const ref       = pi.id.slice(-12).toUpperCase()

  if (!resendKey) {
    console.error('RESEND_API_KEY not set — emails not sent')
    return
  }

  const toEmail = m.customer_email
  if (!toEmail) {
    console.error('customer_email missing from PaymentIntent metadata')
  }

  const resend = new Resend(resendKey)

  // Customer confirmation
  if (toEmail) {
    await resend.emails.send({
      from:    `Briopack <${fromEmail}>`,
      to:      [toEmail],
      subject: `Ordine confermato #${ref} — Briopack`,
      html:    customerEmailHtml({ name: m.customer_name || '', total, ref, siteUrl, cartItems, address: `${m.address}, ${m.zip} ${m.city} (${m.province})` }),
    }).catch((err: unknown) => console.error('Customer email send failed:', err))
  }

  // Owner notification
  const ownerEmail = process.env.CONTACT_TO_EMAIL
  if (ownerEmail) {
    await resend.emails.send({
      from:    `Briopack <${fromEmail}>`,
      to:      [ownerEmail],
      subject: `Nuovo ordine #${ref} — €${total} da ${m.customer_name}`,
      html:    ownerEmailHtml({ name: m.customer_name || '', email: m.customer_email || '', phone: m.customer_phone || '', address: `${m.address}, ${m.zip} ${m.city} (${m.province})`, notes: m.notes || '', total, ref, cartItems }),
    }).catch((err: unknown) => console.error('Owner email send failed:', err))
  }
}

/* ─── Email helpers ───────────────────────────────────────────────────────── */

function fmtPrice(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function cartTable(items: CartItem[]) {
  if (!items.length) return ''
  const rows = items.map(i => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:13.5px;color:#111827;">${i.name}${i.size ? ` <span style="color:#9ca3af;font-size:12px;">· ${i.size}</span>` : ''}</td>
      <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;white-space:nowrap;">${i.qty.toLocaleString('it-IT')} pz</td>
      <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:13.5px;font-weight:600;color:#111827;text-align:right;white-space:nowrap;">€${fmtPrice(i.unitPrice * i.qty + i.setupCost)}</td>
    </tr>
  `).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <thead>
        <tr>
          <th style="padding:8px 0;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;text-align:left;border-bottom:2px solid #f3f4f6;">Prodotto</th>
          <th style="padding:8px 0;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;text-align:center;border-bottom:2px solid #f3f4f6;">Q.tà</th>
          <th style="padding:8px 0;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:2px solid #f3f4f6;">Importo</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function emailWrap(content: string, siteUrl: string) {
  const logo = siteUrl
    ? `<img src="${siteUrl}/logo.png" alt="Briopack" style="height:28px;width:auto;" />`
    : `<span style="font-size:20px;font-weight:800;color:#e8721a;letter-spacing:-0.5px;">BRIOPACK</span>`

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
      <tr><td style="padding:0 0 20px;text-align:center;">${logo}</td></tr>
      <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
        ${content}
      </td></tr>
      <tr><td style="padding:24px 0 0;text-align:center;font-size:12px;color:#9ca3af;line-height:1.8;">
        Briopack Srl &mdash; C.da Sodera 38, 66030 Poggiofiorito (CH) &mdash; P.IVA 02540090699<br>
        <a href="mailto:info@briopack.com" style="color:#e8721a;text-decoration:none;">info@briopack.com</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.4px;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13.5px;color:#111827;">${value}</td>
  </tr>`
}

function customerEmailHtml({ name, total, ref, siteUrl, cartItems, address }: { name: string; total: string; ref: string; siteUrl: string; cartItems: CartItem[]; address: string }) {
  return emailWrap(`
    <div style="background:linear-gradient(135deg,#c45a14 0%,#e8721a 60%,#f08a3a 100%);padding:36px 36px 32px;">
      <div style="width:52px;height:52px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
        <span style="color:#fff;font-size:24px;font-weight:700;line-height:52px;display:block;text-align:center;">✓</span>
      </div>
      <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:6px;">Ordine confermato!</div>
      <div style="color:rgba(255,255,255,0.85);font-size:14px;">Il tuo pagamento è stato ricevuto con successo.</div>
    </div>
    <div style="padding:32px 36px 36px;">
      <p style="font-size:15px;color:#111827;margin:0 0 6px;font-weight:600;">Ciao ${name},</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 28px;">
        Grazie per il tuo ordine. Lo stiamo elaborando e ti contatteremo entro 24 ore lavorative.
      </p>

      ${cartTable(cartItems)}

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${infoRow('Riferimento', `<span style="font-family:monospace;background:#f9fafb;padding:3px 8px;border-radius:4px;font-size:12.5px;">#${ref}</span>`)}
        ${infoRow('Totale', `<strong style="font-size:15px;color:#e8721a;">€${total}</strong>`)}
        ${infoRow('Consegna', address)}
      </table>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;font-size:13.5px;color:#92400e;line-height:1.6;">
        Per qualsiasi domanda scrivi a
        <a href="mailto:info@briopack.com" style="color:#e8721a;font-weight:600;text-decoration:none;">info@briopack.com</a>
      </div>
    </div>
  `, siteUrl)
}

function ownerEmailHtml({ name, email, phone, address, notes, total, ref, cartItems }: { name: string; email: string; phone: string; address: string; notes: string; total: string; ref: string; cartItems: CartItem[] }) {
  return emailWrap(`
    <div style="background:#111827;padding:28px 36px;">
      <div style="color:#e8721a;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:8px;">Nuovo ordine ricevuto</div>
      <div style="color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">€${total}</div>
      <div style="color:#6b7280;font-size:13px;margin-top:4px;font-family:monospace;">#${ref}</div>
    </div>
    <div style="padding:32px 36px 36px;">
      ${cartTable(cartItems)}
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow('Cliente', `<strong>${name}</strong>`)}
        ${infoRow('Email', `<a href="mailto:${email}" style="color:#e8721a;text-decoration:none;">${email}</a>`)}
        ${infoRow('Telefono', phone || '—')}
        ${infoRow('Indirizzo', address)}
        ${infoRow('Note', notes || '—')}
        ${infoRow('Totale', `<strong style="color:#e8721a;font-size:15px;">€${total}</strong>`)}
      </table>
    </div>
  `, '')
}
