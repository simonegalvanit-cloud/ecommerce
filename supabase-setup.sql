-- =============================================================
-- Briopack Ecommerce — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- =============================================================

-- ─── PROFILES ────────────────────────────────────────────────
-- Extends auth.users. Created automatically on signup via trigger.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  full_name   text,
  company     text,
  phone       text,
  address     text,
  city        text,
  postal_code text,
  country     text default 'Italia',
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "profiles: owner read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = id);
-- Admins can read all profiles
create policy "profiles: admin read"   on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── PRODUCTS ────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text,
  price       numeric(10,2) not null,
  moq         integer not null default 100,   -- minimum order quantity
  unit        text default 'pz',
  stock       integer default 0,
  image_url   text,
  active      boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.products enable row level security;

-- Anyone can read active products
create policy "products: public read" on public.products for select using (active = true);
-- Admins have full control
create policy "products: admin all" on public.products using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Seed a few initial products matching the existing storefront
insert into public.products (name, category, price, moq, unit, description, active) values
  ('Shopper Kraft Naturale',  'Shopper',  0.18, 500,  'pz', 'Sacchetto in carta kraft naturale con manico ritorto', true),
  ('Box Pizza Avana 33cm',    'Food Box',  0.22, 300,  'pz', 'Scatola pizza in cartone avana ondulato', true),
  ('Busta PE Trasparente',    'Buste',     0.08, 1000, 'pz', 'Busta polietilene trasparente con soffietto', true),
  ('Vassoio Alveolato 6',     'Alveolari', 0.31, 200,  'pz', 'Vassoio alveolato per 6 uova in cartone riciclato', true),
  ('Rotolo Carta da Pacco',   'Carta',     12.50, 10,  'rotolo', 'Carta da imballo avana 80g/m² 70cm x 300m', true),
  ('Nastro Adesivo Trasparente', 'Nastri', 1.20, 50,  'pz', 'Nastro in BOPP trasparente 48mm x 100m', true);


-- ─── ORDERS ──────────────────────────────────────────────────
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  status      text not null default 'pending'
              check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  notes       text,
  total       numeric(10,2),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.orders enable row level security;

-- Customers see only their own orders
create policy "orders: owner read"   on public.orders for select using (auth.uid() = customer_id);
create policy "orders: owner insert" on public.orders for insert with check (auth.uid() = customer_id);
-- Admins have full access
create policy "orders: admin all" on public.orders using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- ─── ORDER ITEMS ─────────────────────────────────────────────
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name       text not null,  -- snapshot in case product changes
  quantity   integer not null,
  unit_price numeric(10,2) not null
);

alter table public.order_items enable row level security;

-- Access mirrors parent order
create policy "order_items: owner read" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and customer_id = auth.uid())
);
create policy "order_items: owner insert" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and customer_id = auth.uid())
);
create policy "order_items: admin all" on public.order_items using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- ─── SITE SETTINGS ───────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  label      text,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

-- Anyone can read settings (used for storefront display)
create policy "settings: public read" on public.site_settings for select using (true);
-- Only admins can write
create policy "settings: admin write" on public.site_settings using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

insert into public.site_settings (key, value, label) values
  ('hero_title',    'Packaging<br>professionale,<br>al giusto prezzo.',  'Titolo hero'),
  ('hero_subtitle', 'Shopper, scatole pizza, buste, alveolari e molto altro. Ordina online con MOQ accessibili e spedizione rapida in tutta Italia.', 'Sottotitolo hero'),
  ('hero_cta',      'Scopri i prodotti',    'CTA hero'),
  ('whatsapp',      '+39 000 000 0000',     'Numero WhatsApp'),
  ('email',         'info@briopack.it',      'Email contatti'),
  ('free_shipping_threshold', '150',         'Soglia spedizione gratuita (€)');


-- ─── HELPER: promote user to admin ───────────────────────────
-- Run this manually in SQL Editor to make someone an admin:
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
--
-- =============================================================
