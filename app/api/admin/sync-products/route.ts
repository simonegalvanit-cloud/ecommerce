import { NextRequest, NextResponse } from 'next/server'
import { CATALOG_ITEMS } from '@/lib/products'
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

  const rows = CATALOG_ITEMS.map(p => ({
    key: p.key,
    name: p.name,
    cat: p.mainCat,
    cat_key: p.subCat,
    active: true,
  }))

  const { error, count } = await sb
    .from('products')
    .upsert(rows, { onConflict: 'key', ignoreDuplicates: true, count: 'exact' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, synced: rows.length, inserted: count })
}
