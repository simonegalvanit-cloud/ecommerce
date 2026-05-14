import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy & Cookie Policy — Briopack',
  description: 'Informativa sulla privacy e cookie policy di Briopack Srl, ai sensi del GDPR (Reg. UE 2016/679).',
}

const S = {
  page:    { maxWidth: 780, margin: '0 auto', padding: '48px 24px 96px', fontFamily: 'var(--f)' } as React.CSSProperties,
  h1:      { fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-1.2px', marginBottom: 8 } as React.CSSProperties,
  lead:    { fontSize: 15, color: 'var(--ink-4)', lineHeight: 1.7, marginBottom: 48, marginTop: 8 } as React.CSSProperties,
  h2:      { fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.4px', marginTop: 48, marginBottom: 12 } as React.CSSProperties,
  h3:      { fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginTop: 24, marginBottom: 8 } as React.CSSProperties,
  p:       { fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: 14 } as React.CSSProperties,
  ul:      { paddingLeft: 20, marginBottom: 14 } as React.CSSProperties,
  li:      { fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: 4 } as React.CSSProperties,
  divider: { border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' } as React.CSSProperties,
  updated: { fontSize: 12, color: 'var(--ink-5)', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' } as React.CSSProperties,
}

export default function PrivacyPage() {
  return (
    <>
      {/* Minimal top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.3px' }}>
          ← Briopack
        </Link>
        <span style={{ fontSize: 12, color: 'var(--ink-5)' }}>Privacy & Cookie Policy</span>
      </div>

      <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <div style={S.page}>
          <h1 style={S.h1}>Privacy & Cookie Policy</h1>
          <p style={S.lead}>
            Informativa ai sensi dell&apos;art. 13 del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
          </p>

          {/* 1 */}
          <h2 style={S.h2}>1. Titolare del trattamento</h2>
          <p style={S.p}><strong>Briopack Srl</strong><br />C.da Sodera, 38 — 66030 Poggiofiorito (CH), Italia<br />P.IVA 02540090699 — REA CH-186673<br />Email: <a href="mailto:info@briopack.com" style={{ color: 'var(--accent)' }}>info@briopack.com</a><br />Tel: +39 0871 869378</p>

          <hr style={S.divider} />

          {/* 2 */}
          <h2 style={S.h2}>2. Dati raccolti e finalità</h2>

          <h3 style={S.h3}>2.1 Dati di navigazione</h3>
          <p style={S.p}>I sistemi informatici acquisiscono automaticamente alcuni dati la cui trasmissione è implicita nell&apos;uso dei protocolli di comunicazione Internet (es. indirizzi IP, tipo di browser, sistema operativo, pagine visitate). Questi dati vengono usati esclusivamente per finalità statistiche anonime e per garantire la sicurezza del sito.</p>

          <h3 style={S.h3}>2.2 Modulo di contatto</h3>
          <p style={S.p}>Quando compili il modulo di contatto raccogliamo: nome, azienda (opzionale), indirizzo email, numero di telefono (opzionale) e il testo del messaggio. Questi dati vengono usati esclusivamente per rispondere alla tua richiesta.</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Base giuridica:</strong> esecuzione di misure precontrattuali su richiesta dell&apos;interessato (art. 6 par. 1 lett. b GDPR)</li>
            <li style={S.li}><strong>Conservazione:</strong> i dati vengono conservati per il tempo strettamente necessario a gestire la comunicazione e, comunque, non oltre 12 mesi</li>
          </ul>

          <h3 style={S.h3}>2.3 Account cliente</h3>
          <p style={S.p}>In caso di registrazione raccogliamo email, nome e cognome. I dati sono necessari per gestire l&apos;account e gli ordini. La base giuridica è il contratto (art. 6 par. 1 lett. b GDPR). I dati sono conservati per tutta la durata del rapporto contrattuale e per i successivi 10 anni per obblighi fiscali.</p>

          <hr style={S.divider} />

          {/* 3 */}
          <h2 style={S.h2}>3. Cookie Policy</h2>
          <p style={S.p}>I cookie sono piccoli file di testo salvati nel tuo browser. Usiamo le seguenti categorie:</p>

          <h3 style={S.h3}>3.1 Cookie tecnici (sempre attivi)</h3>
          <p style={S.p}>Necessari al funzionamento del sito. Non richiedono consenso.</p>
          <ul style={S.ul}>
            <li style={S.li}><code style={{ background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4, fontSize: 13 }}>bp_cookie_consent</code> — memorizza la tua scelta sul consenso cookie (localStorage, scade dopo 365 giorni)</li>
            <li style={S.li}><code style={{ background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4, fontSize: 13 }}>bp_admin_bypass</code> — cookie di sessione per l&apos;area amministrativa (httpOnly, 8 ore)</li>
            <li style={S.li}>Cookie di sessione Supabase per l&apos;autenticazione dell&apos;account cliente</li>
          </ul>

          <h3 style={S.h3}>3.2 Cookie analitici (con consenso)</h3>
          <p style={S.p}>Attualmente non utilizziamo cookie analitici di terze parti. Qualora venissero introdotti, verrai informato e potrai prestare o revocare il consenso in qualsiasi momento.</p>

          <h3 style={S.h3}>3.3 Come gestire i cookie</h3>
          <p style={S.p}>Puoi bloccare o eliminare i cookie in qualsiasi momento dalle impostazioni del tuo browser. Si noti che la disabilitazione dei cookie tecnici potrebbe compromettere il corretto funzionamento del sito.</p>

          <hr style={S.divider} />

          {/* 4 */}
          <h2 style={S.h2}>4. Destinatari dei dati</h2>
          <p style={S.p}>I dati non vengono venduti né ceduti a terzi a scopo commerciale. Potremmo condividerli esclusivamente con:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Supabase Inc.</strong> (USA) — piattaforma di database e autenticazione, con trasferimento garantito da Clausole Contrattuali Standard UE</li>
            <li style={S.li}><strong>Resend Inc.</strong> (USA) — servizio di invio email transazionale, con trasferimento garantito da Clausole Contrattuali Standard UE</li>
            <li style={S.li}><strong>Vercel Inc.</strong> (USA) — hosting e CDN, con trasferimento garantito da Clausole Contrattuali Standard UE</li>
          </ul>

          <hr style={S.divider} />

          {/* 5 */}
          <h2 style={S.h2}>5. Diritti dell&apos;interessato</h2>
          <p style={S.p}>Ai sensi degli artt. 15–22 GDPR hai diritto di:</p>
          <ul style={S.ul}>
            <li style={S.li}>Accedere ai tuoi dati personali</li>
            <li style={S.li}>Richiederne la rettifica o la cancellazione («diritto all&apos;oblio»)</li>
            <li style={S.li}>Limitare od opporti al trattamento</li>
            <li style={S.li}>Ricevere i dati in formato strutturato (portabilità)</li>
            <li style={S.li}>Revocare il consenso in qualsiasi momento senza pregiudicare la liceità del trattamento precedente</li>
            <li style={S.li}>Proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>garanteprivacy.it</a>)</li>
          </ul>
          <p style={S.p}>Per esercitare i tuoi diritti scrivi a <a href="mailto:info@briopack.com" style={{ color: 'var(--accent)' }}>info@briopack.com</a>. Risponderemo entro 30 giorni.</p>

          <hr style={S.divider} />

          {/* 6 */}
          <h2 style={S.h2}>6. Sicurezza</h2>
          <p style={S.p}>Il sito utilizza connessioni cifrate (HTTPS/TLS). I dati di autenticazione sono protetti tramite cookie httpOnly non accessibili da JavaScript. Le password non sono mai memorizzate in chiaro.</p>

          <hr style={S.divider} />

          {/* 7 */}
          <h2 style={S.h2}>7. Modifiche alla presente informativa</h2>
          <p style={S.p}>Questa informativa può essere aggiornata per adeguarsi a modifiche normative o operative. La data di ultima modifica è riportata in calce. In caso di modifiche sostanziali verrà visualizzato un avviso sul sito.</p>

          <p style={S.updated}>Ultimo aggiornamento: maggio 2025 — Briopack Srl</p>
        </div>
      </div>
    </>
  )
}
