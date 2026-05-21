'use client'
import { useState } from 'react'

const SQL_USER_CARTS = `create table if not exists user_carts (
  user_id    uuid references auth.users primary key,
  items      jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table user_carts enable row level security;

-- Users can only read/write their own cart
create policy "User manages own cart"
  on user_carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`

const SQL_ORDERS = `create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  stripe_session_id     text unique not null,
  stripe_payment_intent text,
  customer_email        text not null,
  customer_name         text,
  customer_phone        text,
  address               text,
  city                  text,
  zip                   text,
  province              text,
  notes                 text,
  total_eur             numeric(10,2) not null default 0,
  cart_json             jsonb not null default '[]',
  status                text not null default 'pending'
                          check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  created_at            timestamptz not null default now()
);

alter table orders enable row level security;

-- Allow all operations (admin uses bypass token, webhook uses service role)
create policy "Service role manages orders"
  on orders for all using (true) with check (true);`

const SQL_ADD_TRACKING = `-- Add tracking number column to orders table
alter table orders add column if not exists tracking_number text;`

const SQL_FIX_STATUS_CONSTRAINT = `-- Run this if your orders table already exists with the old constraint
-- (only allows pending/paid/refunded/cancelled)

alter table orders drop constraint if exists orders_status_check;

alter table orders add constraint orders_status_check
  check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded'));`

const SQL_PROFILES = `create table if not exists profiles (
  id          uuid references auth.users primary key,
  full_name   text,
  company     text,
  phone       text,
  address     text,
  city        text,
  postal_code text,
  country     text default 'Italia',
  role        text not null default 'customer',
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- Users can read/write their own profile
create policy "User manages own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile row on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`

const STORAGE_ARTWORK_STEPS = `1. Vai su Supabase Dashboard → Storage → "New bucket"
2. Nome bucket: artwork
3. Public bucket: YES (spunta "Public bucket")
4. Clicca "Save"

Poi aggiungi questa variabile d'ambiente su Vercel:
  SUPABASE_SERVICE_ROLE_KEY  →  (trovala in Supabase → Settings → API → service_role key)`

const SQL_PRODUCTS = `create table if not exists products (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  name       text not null,
  cat        text not null default '',
  cat_key    text not null default '',
  price      numeric(10,2) not null default 0,
  moq        integer not null default 100,
  badge_label text,
  badge_type  text check (badge_type in ('top','eco')),
  description text not null default '',
  seo_desc    text not null default '',
  sizes        jsonb not null default '[]',
  colors       jsonb not null default '[]',
  print_options jsonb not null default '[]',
  qty_presets  jsonb not null default '[]',
  disc_tiers   jsonb not null default '[]',
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table products enable row level security;

-- Allow anyone to read active products (storefront)
create policy "Public read active products"
  on products for select using (active = true);

-- Allow all writes (admin panel uses bypass token, no Supabase session)
create policy "Admin write all"
  on products for all using (true) with check (true);`

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
          { label: 'Email admin',        key: 'admin_email', value: 'ADMIN_EMAIL (env var)' },
          { label: 'Token sessione',     key: 'token_key',  value: 'ADMIN_SESSION_TOKEN (env var)' },
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

      {/* SQL — user_carts */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Setup database — Carrello utenti</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>Necessaria per salvare il carrello degli utenti loggati tra sessioni diverse</div>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ background: '#0f1117', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>{SQL_USER_CARTS}</pre>
          <button onClick={() => { navigator.clipboard.writeText(SQL_USER_CARTS); setCopied('sql-carts'); setTimeout(() => setCopied(''), 2000) }}
            style={{ marginTop: 12, padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: copied === 'sql-carts' ? 'var(--green-bg)' : 'var(--surface)', color: copied === 'sql-carts' ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            {copied === 'sql-carts' ? '✓ Copiato' : 'Copia SQL'}
          </button>
        </div>
      </div>

      {/* SQL — orders */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Setup database — Tabella ordini</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>Necessaria per salvare gli ordini ricevuti tramite Stripe</div>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ background: '#0f1117', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>{SQL_ORDERS}</pre>
          <button onClick={() => { navigator.clipboard.writeText(SQL_ORDERS); setCopied('sql-orders'); setTimeout(() => setCopied(''), 2000) }}
            style={{ marginTop: 12, padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: copied === 'sql-orders' ? 'var(--green-bg)' : 'var(--surface)', color: copied === 'sql-orders' ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            {copied === 'sql-orders' ? '✓ Copiato' : 'Copia SQL'}
          </button>
        </div>
      </div>

      {/* SQL — tracking number */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Fix — Colonna tracking number</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>Aggiunge la colonna per il numero di tracciamento spedizioni</div>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ background: '#0f1117', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>{SQL_ADD_TRACKING}</pre>
          <button onClick={() => { navigator.clipboard.writeText(SQL_ADD_TRACKING); setCopied('sql-tracking'); setTimeout(() => setCopied(''), 2000) }}
            style={{ marginTop: 12, padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: copied === 'sql-tracking' ? 'var(--green-bg)' : 'var(--surface)', color: copied === 'sql-tracking' ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            {copied === 'sql-tracking' ? '✓ Copiato' : 'Copia SQL'}
          </button>
        </div>
      </div>

      {/* SQL — fix status constraint */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Fix — Constraint stato ordini</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>
            <strong style={{ color: 'var(--accent)' }}>OBBLIGATORIO se la tabella ordini esiste già.</strong> Aggiunge i nuovi stati (processing, shipped, delivered) al vincolo.
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ background: '#0f1117', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>{SQL_FIX_STATUS_CONSTRAINT}</pre>
          <button onClick={() => { navigator.clipboard.writeText(SQL_FIX_STATUS_CONSTRAINT); setCopied('sql-fix-status'); setTimeout(() => setCopied(''), 2000) }}
            style={{ marginTop: 12, padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: copied === 'sql-fix-status' ? 'var(--green-bg)' : 'var(--surface)', color: copied === 'sql-fix-status' ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            {copied === 'sql-fix-status' ? '✓ Copiato' : 'Copia SQL'}
          </button>
        </div>
      </div>

      {/* SQL — profiles */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Setup database — Profili utenti</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>Crea la tabella profili e il trigger che la popola automaticamente alla registrazione</div>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ background: '#0f1117', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>{SQL_PROFILES}</pre>
          <button onClick={() => { navigator.clipboard.writeText(SQL_PROFILES); setCopied('sql-profiles'); setTimeout(() => setCopied(''), 2000) }}
            style={{ marginTop: 12, padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: copied === 'sql-profiles' ? 'var(--green-bg)' : 'var(--surface)', color: copied === 'sql-profiles' ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            {copied === 'sql-profiles' ? '✓ Copiato' : 'Copia SQL'}
          </button>
        </div>
      </div>

      {/* Storage — artwork bucket */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Storage — Bucket artwork (upload file clienti)</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>Crea il bucket Supabase dove vengono salvati i file SVG/PDF caricati dai clienti</div>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ background: '#0f1117', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>{STORAGE_ARTWORK_STEPS}</pre>
          <button onClick={() => { navigator.clipboard.writeText(STORAGE_ARTWORK_STEPS); setCopied('storage-artwork'); setTimeout(() => setCopied(''), 2000) }}
            style={{ marginTop: 12, padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: copied === 'storage-artwork' ? 'var(--green-bg)' : 'var(--surface)', color: copied === 'storage-artwork' ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            {copied === 'storage-artwork' ? '✓ Copiato' : 'Copia istruzioni'}
          </button>
        </div>
      </div>

      {/* SQL — products */}
      <div style={sectionStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Setup database — Tabella prodotti</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>Esegui questo SQL nell&apos;editor di Supabase per abilitare la gestione prodotti</div>
        </div>
        <div style={{ padding: 20 }}>
          <pre style={{ background: '#0f1117', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>{SQL_PRODUCTS}</pre>
          <button onClick={() => { navigator.clipboard.writeText(SQL_PRODUCTS); setCopied('sql'); setTimeout(() => setCopied(''), 2000) }}
            style={{ marginTop: 12, padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: copied === 'sql' ? 'var(--green-bg)' : 'var(--surface)', color: copied === 'sql' ? 'var(--green)' : 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            {copied === 'sql' ? '✓ Copiato' : 'Copia SQL'}
          </button>
        </div>
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
