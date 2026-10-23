import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termini di Servizio — Briopack',
  description: 'Condizioni generali di vendita e termini di servizio di Briopack Srl.',
}

const S = {
  page:    { maxWidth: 780, margin: '0 auto', padding: '48px 24px 96px', fontFamily: 'var(--f)' } as React.CSSProperties,
  h1:      { fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-1.2px', marginBottom: 8 } as React.CSSProperties,
  lead:    { fontSize: 15, color: 'var(--ink-4)', lineHeight: 1.7, marginBottom: 48, marginTop: 8 } as React.CSSProperties,
  h2:      { fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.4px', marginTop: 48, marginBottom: 12 } as React.CSSProperties,
  p:       { fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: 14 } as React.CSSProperties,
  ul:      { paddingLeft: 20, marginBottom: 14 } as React.CSSProperties,
  li:      { fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: 4 } as React.CSSProperties,
  divider: { border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' } as React.CSSProperties,
  updated: { fontSize: 12, color: 'var(--ink-5)', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' } as React.CSSProperties,
}

export default function TerminiPage() {
  return (
    <>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.3px' }}>
          ← Briopack
        </Link>
        <span style={{ fontSize: 12, color: 'var(--ink-5)' }}>Termini di Servizio</span>
      </div>

      <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <div style={S.page}>
          <h1 style={S.h1}>Termini di Servizio</h1>
          <p style={S.lead}>
            Condizioni generali di vendita di Briopack Srl, applicabili a tutti gli ordini effettuati tramite il sito briopack.com o a mezzo contatto diretto.
          </p>

          <h2 style={S.h2}>1. Venditore</h2>
          <p style={S.p}>
            <strong>Briopack Srl</strong><br />
            C.da Sodera, 38 — 66030 Poggiofiorito (CH), Italia<br />
            P.IVA 02540090699 — REA CH-186673<br />
            Email: <a href="mailto:info@briopack.com" style={{ color: 'var(--accent)' }}>info@briopack.com</a> · Tel: +39 0871 869378<br />
            PEC: briopack@pec.it
          </p>
          <p style={S.p}>
            Il sito è destinato esclusivamente a operatori professionali (B2B). L&apos;acquisto implica che il cliente agisca nell&apos;esercizio della propria attività imprenditoriale, commerciale o professionale.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>2. Ordini e conferma</h2>
          <p style={S.p}>
            L&apos;ordine inviato tramite il sito costituisce una proposta di acquisto. Il contratto si conclude solo con la conferma scritta (email) da parte di Briopack Srl, nella quale vengono indicati quantità, prezzo definitivo, tempi di consegna e modalità di pagamento.
          </p>
          <p style={S.p}>
            Briopack si riserva il diritto di rifiutare ordini in caso di indisponibilità del prodotto, errori di prezzo o mancato rispetto delle condizioni di pagamento pregresse.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>3. Prezzi e pagamento</h2>
          <p style={S.p}>
            Tutti i prezzi indicati sul sito sono in euro e si intendono IVA esclusa, salvo diversa indicazione. I prezzi sono soggetti a variazione senza preavviso fino alla conferma d&apos;ordine.
          </p>
          <ul style={S.ul}>
            <li style={S.li}>Bonifico bancario anticipato (salvo accordi diversi)</li>
            <li style={S.li}>Carte di credito / circuiti online (ove disponibile)</li>
            <li style={S.li}>RiBa o pagamento a 30/60 giorni per clienti con affidamento approvato</li>
          </ul>
          <p style={S.p}>
            In caso di ritardo nel pagamento si applicano gli interessi di mora ai sensi del D.Lgs. 231/2002.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>4. Produzione e tempi di consegna</h2>
          <p style={S.p}>
            I tempi di consegna indicati sono puramente orientativi e decorrono dalla conferma dell&apos;ordine e dal ricevimento del pagamento (o dalla firma del contratto per clienti con affidamento). Briopack non è responsabile per ritardi imputabili a terzi (corrieri, fornitori di materie prime, eventi di forza maggiore).
          </p>
          <p style={S.p}>
            Per prodotti personalizzati il cliente è responsabile della correttezza dei file di stampa forniti. Briopack non risponde di errori grafici non segnalati prima dell&apos;approvazione delle prove di stampa.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>5. Diritto di recesso</h2>
          <p style={S.p}>
            Il sito è destinato esclusivamente a operatori professionali (B2B). Il diritto di recesso di 14 giorni previsto dal Codice del Consumo (D.Lgs. 206/2005, artt. 52–59) è riservato ai consumatori finali e <strong>non si applica</strong> agli acquisti effettuati nell&apos;esercizio di un&apos;attività imprenditoriale, commerciale, artigianale o professionale.
          </p>
          <p style={S.p}>
            Qualora un consumatore finale acceda eccezionalmente al sito e concluda un acquisto, gli si riconosce il diritto di recedere dal contratto entro <strong>14 giorni</strong> dalla ricezione della merce, senza necessità di motivazione, fatto salvo che i prodotti non siano stati realizzati su misura o personalizzati (art. 59 lett. c D.Lgs. 206/2005). Per esercitare il recesso il consumatore deve inviare comunicazione scritta prima della scadenza del termine a <a href="mailto:info@briopack.com" style={{ color: 'var(--accent)' }}>info@briopack.com</a>. Il rimborso è effettuato entro 14 giorni dal ricevimento dei beni o della prova di spedizione, con lo stesso mezzo di pagamento usato per l&apos;acquisto.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>5a. Garanzia legale</h2>
          <p style={S.p}>
            <strong>Clienti B2B (operatori professionali):</strong> si applica la garanzia per vizi della cosa venduta ai sensi degli artt. 1490–1495 del Codice Civile. I vizi devono essere denunciati entro <strong>8 giorni dalla scoperta</strong> (art. 1495 c.c.) e l&apos;azione si prescrive in un anno dalla consegna. La denuncia deve essere inviata con descrizione dettagliata e documentazione fotografica a <a href="mailto:info@briopack.com" style={{ color: 'var(--accent)' }}>info@briopack.com</a>.
          </p>
          <p style={S.p}>
            <strong>Consumatori finali:</strong> si applica la garanzia legale di conformità prevista dagli artt. 128–135 del Codice del Consumo (D.Lgs. 206/2005). In caso di difetto di conformità manifestatosi entro <strong>2 anni</strong> dalla consegna, il consumatore ha diritto — a sua scelta — al ripristino della conformità, alla sostituzione, a una riduzione del prezzo o alla risoluzione del contratto, alle condizioni previste dalla legge. I difetti devono essere segnalati entro 2 mesi dalla scoperta.</p>

          <hr style={S.divider} />

          <h2 style={S.h2}>5b. Reclami</h2>
          <p style={S.p}>
            Per qualsiasi contestazione relativa a prodotti difettosi o non conformi contattare <a href="mailto:info@briopack.com" style={{ color: 'var(--accent)' }}>info@briopack.com</a> allegando documentazione fotografica della merce ricevuta. Risponderemo entro 5 giorni lavorativi con una proposta di risoluzione.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>6. Proprietà intellettuale e file grafici</h2>
          <p style={S.p}>
            Il cliente garantisce di essere titolare o di aver ottenuto tutte le licenze necessarie per l&apos;utilizzo dei marchi, loghi e contenuti grafici forniti a Briopack per la stampa. Il cliente tiene indenne Briopack da qualsiasi pretesa di terzi relativa alla violazione di diritti di proprietà intellettuale.
          </p>
          <p style={S.p}>
            I file grafici forniti dal cliente sono conservati per il periodo strettamente necessario alla produzione e cancellati entro 12 mesi salvo diversa richiesta scritta.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>7. Limitazione di responsabilità</h2>
          <p style={S.p}>
            La responsabilità di Briopack per qualsiasi danno derivante dall&apos;acquisto o dall&apos;utilizzo dei prodotti è limitata al valore dell&apos;ordine. Sono esclusi i danni indiretti, consequenziali o il lucro cessante.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>8. Legge applicabile e foro competente</h2>
          <p style={S.p}>
            I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente in via esclusiva il Tribunale di Chieti.
          </p>

          <hr style={S.divider} />

          <h2 style={S.h2}>9. Modifiche</h2>
          <p style={S.p}>
            Briopack si riserva il diritto di aggiornare i presenti Termini in qualsiasi momento. Le modifiche entrano in vigore dalla data di pubblicazione sul sito. Gli ordini già confermati rimangono soggetti ai Termini vigenti al momento della conferma.
          </p>

          <p style={S.updated}>
            Ultimo aggiornamento: ottobre 2025 · Per domande: <a href="mailto:info@briopack.com" style={{ color: 'var(--accent)' }}>info@briopack.com</a>
          </p>
        </div>
      </div>
    </>
  )
}
