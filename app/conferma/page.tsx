'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'

function ConfermaInner() {
  const params  = useSearchParams()
  const router  = useRouter()
  const { clearCart } = useCart()

  const redirectStatus = params.get('redirect_status')
  const paymentIntent  = params.get('payment_intent')

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    if (!paymentIntent) { router.replace('/'); return }

    if (redirectStatus === 'succeeded') {
      clearCart()
      setStatus('success')
    } else if (redirectStatus === 'failed' || redirectStatus === 'canceled') {
      setStatus('failed')
    } else {
      // pending / processing — treat as success, webhook will confirm
      clearCart()
      setStatus('success')
    }
  }, [paymentIntent, redirectStatus])

  if (status === 'loading') return null

  if (status === 'failed') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', height: 64, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
          <Link href="/"><Image src="/logo.png" alt="Briopack" width={120} height={30} style={{ height: 28, width: 'auto' }} /></Link>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: '56px 48px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <svg width="32" height="32" fill="none" stroke="#dc2626" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', marginBottom: 12 }}>Pagamento non riuscito</h1>
            <p style={{ fontSize: 14, color: 'var(--ink-4)', lineHeight: 1.7, marginBottom: 32 }}>
              Il pagamento non è andato a buon fine. Nessun addebito è stato effettuato.
            </p>
            <Link href="/checkout" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Riprova
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', height: 64, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <Link href="/"><Image src="/logo.png" alt="Briopack" width={120} height={30} style={{ height: 28, width: 'auto' }} /></Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: '56px 48px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>

          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.6px', marginBottom: 12 }}>
            Ordine confermato!
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-4)', lineHeight: 1.7, marginBottom: 8 }}>
            Grazie per il tuo acquisto. Hai ricevuto una email di conferma con tutti i dettagli.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-5)', marginBottom: 36, fontFamily: 'monospace' }}>
            Rif: {paymentIntent?.slice(-16).toUpperCase()}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
            {[
              { icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.95 11 19.8 19.8 0 01.88 2.38 2 2 0 012.86.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>, label: 'Ti contatteremo', sub: 'entro 24 ore lavorative' },
              { icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>, label: 'Tracking', sub: 'via email alla spedizione' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <div style={{ color: 'var(--accent)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{c.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalogo" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(232,114,26,0.3)' }}>
              Continua a fare acquisti
            </Link>
            <Link href="/contatti" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 24px', background: 'transparent', color: 'var(--ink-3)', border: '1.5px solid var(--border-2)', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Contattaci
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfermaPage() {
  return (
    <Suspense fallback={null}>
      <ConfermaInner />
    </Suspense>
  )
}
