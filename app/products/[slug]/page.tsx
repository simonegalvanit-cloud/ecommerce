import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PRODUCTS, SIZES, COLORS, PRINT_OPTIONS, QTY_PRESETS, DISC_TIERS, type Product } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'
import ProductConfigurator from '@/components/ProductConfigurator'
import CartDrawer from '@/components/CartDrawer'
import NavWrapper from '@/components/NavWrapper'

// Pre-build all hardcoded product pages at deploy time
export async function generateStaticParams() {
  return PRODUCTS.map(p => ({ slug: p.key }))
}

// Revalidate admin-added products in the background every 60s
export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

// cache() deduplicates calls within the same render (metadata + page share one fetch)
const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const local = PRODUCTS.find(p => p.key === slug)

  // Try DB first — picks up admin edits to price/desc/badges etc.
  try {
    const sb = await createClient()
    const { data } = await sb
      .from('products')
      .select('*')
      .eq('key', slug)
      .eq('active', true)
      .single()
    if (data) {
      return {
        key: data.key,
        name: data.name,
        cat: data.cat,
        catKey: data.cat_key,
        price: data.price,
        moq: data.moq,
        badge: data.badge_label ? { label: data.badge_label, type: data.badge_type } : undefined,
        desc: data.description,
        seoDesc: data.seo_desc,
        sizes:        data.sizes?.length        ? data.sizes        : (local?.sizes  ?? SIZES),
        colors:       data.colors?.length       ? data.colors       : (local?.colors ?? COLORS),
        printOptions: data.print_options?.length ? data.print_options : (local?.printOptions ?? PRINT_OPTIONS),
        qtyPresets:   data.qty_presets?.length  ? data.qty_presets  : (local?.qtyPresets ?? QTY_PRESETS),
        discTiers:    data.disc_tiers?.length   ? data.disc_tiers   : (local?.discTiers ?? DISC_TIERS),
        // Visual fields always come from local code (not stored in DB)
        image:      local?.image,
        images:     local?.images,
        svg:        local?.svg,
        sizeColors: local?.sizeColors,
      }
    }
  } catch { /* products table may not exist yet */ }

  // Fall back to local hardcoded product
  return local ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Prodotto non trovato — Briopack' }
  return {
    title: `${product.name} — Briopack Packaging`,
    description: product.seoDesc,
    openGraph: {
      title: `${product.name} — Briopack`,
      description: product.seoDesc,
      type: 'website',
      siteName: 'Briopack Packaging',
    },
    alternates: { canonical: `/products/${product.key}` },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <>
      <NavWrapper />
      <div className="cfg-breadcrumb">
        <Link href="/">Home</Link>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        <Link href="/catalogo">Catalogo</Link>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        <span>{product.name}</span>
      </div>
      <main className="cfg-page-wrap">
        <ProductConfigurator product={product} />
      </main>
      <CartDrawer />
    </>
  )
}
