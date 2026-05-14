import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'simone@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const { name, company, email, phone, subject, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti.' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'Briopack Contatti <onboarding@resend.dev>',
      to: [TO_EMAIL],
      replyTo: email,
      subject: `[Briopack] ${subject || 'Nuovo messaggio'} — ${name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: #e8721a; padding: 28px 32px;">
            <div style="color: #fff; font-size: 20px; font-weight: 700; letter-spacing: -0.4px;">Nuovo messaggio dal sito</div>
            <div style="color: rgba(255,255,255,0.75); font-size: 13px; margin-top: 4px;">briopack.com/contatti</div>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.4px; width: 140px;">Nome</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111; font-weight: 500;">${name}</td></tr>
              ${company ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.4px;">Azienda</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111;">${company}</td></tr>` : ''}
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.4px;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111;"><a href="mailto:${email}" style="color: #e8721a;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.4px;">Telefono</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111;">${phone}</td></tr>` : ''}
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.4px;">Oggetto</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #111;">${subject || '—'}</td></tr>
            </table>
            <div style="font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 10px;">Messaggio</div>
            <div style="background: #faf9f7; border-radius: 8px; padding: 18px; font-size: 14.5px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message}</div>
          </div>
          <div style="padding: 16px 32px; background: #faf9f7; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
            Ricevuto tramite il modulo di contatto Briopack · Rispondi direttamente a questa email per contattare ${name}
          </div>
        </div>
      `,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
