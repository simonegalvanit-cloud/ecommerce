import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const STATUS_LABEL: Record<string, string> = {
  pending:    'In attesa di pagamento',
  paid:       'Pagamento confermato',
  processing: 'In lavorazione',
  shipped:    'Spedito',
  delivered:  'Consegnato',
  cancelled:  'Annullato',
  refunded:   'Rimborsato',
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('bp_admin_bypass')?.value
  if (!token || token !== process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId, status, customerEmail, customerName, orderRef } = await req.json()

  // Update DB
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const sb = await createClient()
    const { error } = await sb.from('orders').update({ status }).eq('id', orderId)
    if (error) throw error
  } catch (err: any) {
    console.error('Order status update failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  // Email customer
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  if (resendKey && customerEmail) {
    const resend  = new Resend(resendKey)
    const label   = STATUS_LABEL[status] || status
    const ref     = (orderRef as string).slice(-12).toUpperCase()

    const statusColor: Record<string, string> = {
      paid: '#16a34a', processing: '#2563eb', shipped: '#e8721a',
      delivered: '#16a34a', cancelled: '#dc2626', refunded: '#6b7280',
    }
    const color = statusColor[status] || '#374151'

    const logo = siteUrl
      ? `<img src="${siteUrl}/logo.png" alt="Briopack" style="height:28px;width:auto;" />`
      : `<span style="font-size:20px;font-weight:800;color:#e8721a;">BRIOPACK</span>`

    await resend.emails.send({
      from:    `Briopack <${fromEmail}>`,
      to:      [customerEmail],
      subject: `Aggiornamento ordine #${ref} — ${label}`,
      html: `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding:0 0 20px;text-align:center;">${logo}</td></tr>
      <tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
        <div style="background:${color};padding:32px 36px;">
          <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;">${label}</div>
          <div style="color:rgba(255,255,255,0.85);font-size:14px;">Il tuo ordine è stato aggiornato.</div>
        </div>
        <div style="padding:32px 36px;">
          <p style="font-size:15px;color:#111827;margin:0 0 8px;font-weight:600;">Ciao ${customerName || ''},</p>
          <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
            Lo stato del tuo ordine <span style="font-family:monospace;background:#f9fafb;padding:2px 7px;border-radius:4px;">#${ref}</span> è stato aggiornato a <strong>${label}</strong>.
          </p>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;font-size:13.5px;color:#92400e;">
            Per qualsiasi domanda scrivi a <a href="mailto:info@briopack.com" style="color:#e8721a;font-weight:600;text-decoration:none;">info@briopack.com</a>
          </div>
        </div>
        <div style="padding:14px 32px;background:#faf9f7;border-top:1px solid #f3f4f6;font-size:11.5px;color:#9ca3af;text-align:center;">
          Briopack Srl &mdash; C.da Sodera 38, 66030 Poggiofiorito (CH) &mdash; P.IVA 02540090699
        </div>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`,
    }).catch((err: unknown) => console.error('Status email failed:', err))
  }

  return NextResponse.json({ ok: true })
}
