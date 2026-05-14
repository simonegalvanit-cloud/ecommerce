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

    await resend.emails.send({
      from:    `Briopack <${fromEmail}>`,
      to:      [toEmail],
      subject: `Conferma ordine Briopack — €${total}`,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <div style="background:#e8721a;padding:24px 32px;">
            <div style="color:#fff;font-size:18px;font-weight:700;">Ordine confermato!</div>
            <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Briopack Packaging</div>
          </div>
          <div style="padding:28px 32px;">
            <p style="font-size:15px;color:#111;margin:0 0 16px;">Ciao ${m.customer_name || ''},</p>
            <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 24px;">
              Il tuo pagamento di <strong>€${total}</strong> è stato ricevuto con successo.
              Stiamo elaborando il tuo ordine e riceverai aggiornamenti sulla spedizione a questo indirizzo email.
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;width:140px;">Riferimento</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;font-family:monospace;">${pi.id}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Totale</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;font-weight:700;">€${total}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;">Consegna</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;">${m.address}, ${m.zip} ${m.city} (${m.province})</td></tr>
            </table>
            <p style="font-size:13px;color:#555;margin:0;">Per qualsiasi domanda scrivi a <a href="mailto:info@briopack.com" style="color:#e8721a;">info@briopack.com</a></p>
          </div>
          <div style="padding:14px 32px;background:#faf9f7;border-top:1px solid #f3f4f6;font-size:11px;color:#9ca3af;">
            Briopack Srl — C.da Sodera 38, 66030 Poggiofiorito (CH) — P.IVA 02540090699
          </div>
        </div>
      `,
    }).catch((err: unknown) => console.error('Customer email send failed:', err))
  }

  // Notify the store owner
  const ownerEmail = process.env.CONTACT_TO_EMAIL
  if (resendKey && ownerEmail) {
    const resend = new Resend(resendKey)
    const total  = (pi.amount / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })
    await resend.emails.send({
      from:    `Briopack <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`,
      to:      [ownerEmail],
      subject: `[Briopack] Nuovo ordine pagato — €${total} da ${m.customer_name}`,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:480px;">
          <h2 style="color:#e8721a;">Nuovo ordine ricevuto</h2>
          <p><strong>Cliente:</strong> ${m.customer_name} (${m.customer_email})</p>
          <p><strong>Telefono:</strong> ${m.customer_phone || '—'}</p>
          <p><strong>Indirizzo:</strong> ${m.address}, ${m.zip} ${m.city} (${m.province})</p>
          <p><strong>Note:</strong> ${m.notes || '—'}</p>
          <p><strong>Totale pagato:</strong> €${total}</p>
          <p><strong>Payment Intent:</strong> <code>${pi.id}</code></p>
        </div>
      `,
    }).catch((err: unknown) => console.error('Owner email send failed:', err))
  }
}
