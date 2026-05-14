import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

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
    // TODO: update order status in Supabase to 'refunded'
    console.log('Charge refunded:', event.data.object.id)
  }

  return NextResponse.json({ ok: true })
}

async function handleOrderPaid(pi: Stripe.PaymentIntent) {
  const m = pi.metadata ?? {}

  // Save order to Supabase
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const sb = await createClient()
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
      status:                'paid',
    })
  } catch (err) {
    console.error('Failed to save order to Supabase:', err)
  }

  // Send confirmation email to customer
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const toEmail   = m.customer_email

  if (!resendKey) {
    console.error('RESEND_API_KEY not set — emails not sent')
  }
  if (!toEmail) {
    console.error('customer_email missing from PaymentIntent metadata — customer email not sent')
  }

  if (resendKey && toEmail) {
    const resend = new Resend(resendKey)
    const total  = (pi.amount / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })
    const ref    = pi.id.slice(-12).toUpperCase()

    await resend.emails.send({
      from:    `Briopack <${fromEmail}>`,
      to:      [toEmail],
      subject: `Ordine confermato #${ref} — Briopack`,
      html: customerEmailHtml({ name: m.customer_name || '', total, ref, address: `${m.address}, ${m.zip} ${m.city} (${m.province})` }),
    }).catch((err: unknown) => console.error('Customer email send failed:', err))
  }

  // Notify the store owner
  const ownerEmail = process.env.CONTACT_TO_EMAIL
  if (resendKey && ownerEmail) {
    const resend = new Resend(resendKey)
    const total  = (pi.amount / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })
    const ref    = pi.id.slice(-12).toUpperCase()

    await resend.emails.send({
      from:    `Briopack <${fromEmail}>`,
      to:      [ownerEmail],
      subject: `Nuovo ordine #${ref} — €${total} da ${m.customer_name}`,
      html: ownerEmailHtml({ name: m.customer_name || '', email: m.customer_email || '', phone: m.customer_phone || '', address: `${m.address}, ${m.zip} ${m.city} (${m.province})`, notes: m.notes || '', total, ref }),
    }).catch((err: unknown) => console.error('Owner email send failed:', err))
  }
}

/* ─── Email templates ─────────────────────────────────────────────────────── */

function emailWrap(content: string) {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Briopack</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <!-- Logo bar -->
      <tr><td style="padding:0 0 24px;text-align:center;">
        <span style="font-size:22px;font-weight:800;color:#e8721a;letter-spacing:-0.5px;">BRIOPACK</span>
        <span style="font-size:13px;color:#9ca3af;margin-left:8px;">Packaging</span>
      </td></tr>
      <!-- Card -->
      <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
        ${content}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 0 0;text-align:center;font-size:11.5px;color:#9ca3af;line-height:1.7;">
        Briopack Srl &mdash; C.da Sodera 38, 66030 Poggiofiorito (CH)<br>
        P.IVA 02540090699 &mdash; <a href="mailto:info@briopack.com" style="color:#e8721a;text-decoration:none;">info@briopack.com</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:13.5px;color:#111827;">${value}</td>
  </tr>`
}

function customerEmailHtml({ name, total, ref, address }: { name: string; total: string; ref: string; address: string }) {
  return emailWrap(`
    <div style="background:linear-gradient(135deg,#c45a14,#e8721a);padding:32px 36px 28px;">
      <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:50%;width:48px;height:48px;line-height:48px;text-align:center;margin-bottom:16px;">
        <span style="font-size:22px;">✓</span>
      </div>
      <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;">Ordine confermato!</div>
      <div style="color:rgba(255,255,255,0.8);font-size:13.5px;">Il tuo pagamento è stato ricevuto.</div>
    </div>
    <div style="padding:32px 36px;">
      <p style="font-size:15px;color:#111827;margin:0 0 8px;font-weight:600;">Ciao ${name},</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 28px;">
        Grazie per il tuo ordine. Lo stiamo elaborando e ti contatteremo entro 24 ore lavorative.
        Riceverai aggiornamenti sulla spedizione a questo indirizzo email.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${row('Riferimento', `<span style="font-family:monospace;background:#f9fafb;padding:3px 8px;border-radius:4px;font-size:12.5px;">#${ref}</span>`)}
        ${row('Totale pagato', `<strong style="font-size:15px;color:#e8721a;">€${total}</strong>`)}
        ${row('Indirizzo', address)}
      </table>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;font-size:13px;color:#92400e;">
        Hai domande? Scrivi a <a href="mailto:info@briopack.com" style="color:#e8721a;font-weight:600;text-decoration:none;">info@briopack.com</a>
      </div>
    </div>
  `)
}

function ownerEmailHtml({ name, email, phone, address, notes, total, ref }: { name: string; email: string; phone: string; address: string; notes: string; total: string; ref: string }) {
  return emailWrap(`
    <div style="background:#1f2937;padding:24px 36px;">
      <div style="color:#e8721a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Nuovo ordine ricevuto</div>
      <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.4px;">€${total}</div>
      <div style="color:#9ca3af;font-size:13px;margin-top:2px;">#${ref}</div>
    </div>
    <div style="padding:32px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('Cliente', `<strong>${name}</strong>`)}
        ${row('Email', `<a href="mailto:${email}" style="color:#e8721a;text-decoration:none;">${email}</a>`)}
        ${row('Telefono', phone || '—')}
        ${row('Indirizzo', address)}
        ${row('Note', notes || '—')}
        ${row('Totale', `<strong style="color:#e8721a;font-size:15px;">€${total}</strong>`)}
      </table>
    </div>
  `)
}
