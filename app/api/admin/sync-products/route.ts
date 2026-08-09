import { NextRequest, NextResponse } from 'next/server'
import { PRODUCTS, SIZES, COLORS, PRINT_OPTIONS, QTY_PRESETS, DISC_TIERS } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('bp_admin_bypass')?.value
  if (token && token === process.env.ADMIN_SESSION_TOKEN) return true
  try {
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return false
    const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).single()
    return prof?.role === 'admin'
  } catch { return false }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = await createClient()

  const rows = PRODUCTS.map(p => ({
    key: p.key,
    name: p.name,
    cat: p.cat,
    cat_key: p.catKey,
    price: p.price,
    moq: p.moq,
    badge_label: p.badge?.label ?? null,
    badge_type: p.badge?.type ?? null,
    description: p.desc,
    seo_desc: p.seoDesc,
    active: true,
    sizes:        p.sizes        ?? SIZES.map(s => ({ label: s.label, dim: s.dim, price: s.price })),
    colors:       p.colors       ?? COLORS.map(c => ({ label: c.label, hex: c.hex, border: c.border ?? false })),
    print_options: p.printOptions ?? PRINT_OPTIONS,
    qty_presets:  p.qtyPresets   ?? QTY_PRESETS,
    disc_tiers:   (p.discTiers ?? DISC_TIERS).map(t => ({
      min: t.min,
      max: t.max === Infinity ? null : t.max,
      label: t.label,
      disc: t.disc ?? null,
    })),
  }))

  const { error, count } = await sb
    .from('products')
    .upsert(rows, { onConflict: 'key', ignoreDuplicates: true, count: 'exact' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, synced: rows.length, inserted: count })
}
