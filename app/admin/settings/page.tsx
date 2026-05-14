'use client'
import { useState } from 'react'

const sectionStyle: React.CSSProperties = {
  background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', marginBottom: 16,
}
const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 20, padding: '14px 20px', borderBottom: '1px solid var(--border)',
}
const labelStyle: React.CSSProperties = {
  flex: '0 0 220px', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)',
}
const subStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--ink-4)', fontFamily: 'monospace', marginTop: 2,
}
const valStyle: React.CSSProperties = {
  flex: 1, fontSize: 13.5, color: 'var(--ink-3)',
}

interface InfoRow { label: string; key: string; value: string }

const SHOP_INFO: InfoRow[] = [
  { label: 'Nome azienda',   key: 'company_name',  value: 'Briopack Packaging' },
  { label: 'Email contatti', key: 'contact_email', value: 'info@briopack.com' },
  { label: 'Telefono',       key: 'contact_phone', value: '+39 02 000 0000' },
  { label: 'Sede',           key: 'address',       value: 'Italia' },
]

const PAYMENT_INFO: InfoRow[] = [
  { label: 'Stripe',       key: 'stripe_mode',  value: 'Test mode (configurare chiavi live per produzione)' },
  { label: 'IVA',         key: 'vat_rate',     value: '22%' },
  { label: 'Spedizione',  key: 'shipping',     value: 'Da definire (contattare il commerciale)' },
]

export default function SettingsPage() {
  const [copied, setCopied] = useState('')

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 1800)
    })
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Impostazioni</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Configurazione del negozio Briopack</div>
      </div>

      {/* Shop info */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Informazioni negozio</div>
        </div>
        {SHOP_INFO.map((row, idx) => (
          <div key={row.key} style={{ ...rowStyle, borderBottom: idx < SHOP_INFO.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={labelStyle}>
              {row.label}
              <div style={subStyle}>{row.key}</div>
            </div>
            <div style={valStyle}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* Payment & shipping */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Pagamenti e spedizione</div>
        </div>
        {PAYMENT_INFO.map((row, idx) => (
          <div key={row.key} style={{ ...rowStyle, borderBottom: idx < PAYMENT_INFO.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={labelStyle}>
              {row.label}
              <div style={subStyle}>{row.key}</div>
            </div>
            <div style={valStyle}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* Admin access */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Accesso amministratore</div>
        </div>
        {[
          { label: 'URL pannello admin', key: 'admin_url',  value: '/admin-panel' },
          { label: 'Email admin',        key: 'admin_email', value: 'simone@gmail.com' },
          { label: 'Token sessione',     key: 'token_key',  value: 'bp_admin_bypass' },
        ].map((row, idx, arr) => (
          <div key={row.key} style={{ ...rowStyle, borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={labelStyle}>
              {row.label}
              <div style={subStyle}>{row.key}</div>
            </div>
            <div style={{ ...valStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
              <code style={{ fontSize: 13, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 4 }}>{row.value}</code>
              <button
                onClick={() => copy(row.value, row.key)}
                style={{ padding: '4px 10px', fontSize: 11.5, fontWeight: 600, fontFamily: 'var(--f)', background: 'transparent', color: copied === row.key ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
                {copied === row.key ? '✓ Copiato' : 'Copia'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Link rapidi</div>
        </div>
        <div style={{ padding: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: '↗ Sito pubblico',       href: '/' },
            { label: '↗ Account cliente',     href: '/account' },
            { label: '↗ Checkout',            href: '/checkout' },
            { label: '↗ Prodotto esempio',    href: '/products/shopper' },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', textDecoration: 'none', background: 'var(--surface)' }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
