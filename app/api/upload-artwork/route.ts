import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Storage non configurato. Aggiungi SUPABASE_SERVICE_ROLE_KEY nelle variabili d\'ambiente.' },
      { status: 500 }
    )
  }

  const sb = createClient(supabaseUrl, serviceRoleKey)

  let form: FormData
  try { form = await req.formData() }
  catch { return NextResponse.json({ error: 'Form data non valido.' }, { status: 400 }) }

  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Nessun file fornito.' }, { status: 400 })

  // Allow only SVG and PDF
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = file.type.toLowerCase()
  const okExt  = ['svg', 'pdf'].includes(ext)
  const okMime = ['image/svg+xml', 'application/pdf', 'text/plain', 'text/xml', 'application/xml'].includes(mime)

  if (!okExt && !okMime) {
    return NextResponse.json({ error: 'Solo file SVG o PDF sono accettati.' }, { status: 400 })
  }

  // 50 MB limit
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File troppo grande. Massimo 50 MB.' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const bytes  = new Uint8Array(buffer)

  // Sanitize filename: keep only safe chars
  const safe = file.name
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 120)
  const path = `${crypto.randomUUID()}-${safe}`

  const contentType =
    ext === 'pdf' ? 'application/pdf' :
    ext === 'svg' ? 'image/svg+xml'   :
    mime || 'application/octet-stream'

  const { error } = await sb.storage.from('artwork').upload(path, bytes, {
    contentType,
    upsert: false,
  })

  if (error) {
    console.error('Artwork upload failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = sb.storage.from('artwork').getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl, name: file.name })
}
