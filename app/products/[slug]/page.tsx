import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CATALOG_ITEMS } from '@/lib/products'
import CartDrawer from '@/components/CartDrawer'
import NavWrapper from '@/components/NavWrapper'

export async function generateStaticParams() {
  return CATALOG_ITEMS.map(p => ({ slug: p.key }))
}

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = CATALOG_ITEMS.find(p => p.key === slug)
  if (!item) return { title: 'Prodotto non trovato — Briopack' }
  return {
    title: `${item.name} — Briopack Packaging`,
    openGraph: {
      title: `${item.name} — Briopack`,
      type: 'website',
      siteName: 'Briopack Packaging',
    },
    alternates: { canonical: `/products/${item.key}` },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const item = CATALOG_ITEMS.find(p => p.key === slug)
  if (!item) notFound()

  return (
    <>
      <NavWrapper />
      <div className="cfg-breadcrumb">
        <Link href="/">Home</Link>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        <Link href="/">Catalogo</Link>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        <span>{item.name}</span>
      </div>
      <main className="cfg-page-wrap">
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
          Configuratore prodotto disponibile nel catalogo principale.
        </div>
      </main>
      <CartDrawer />
    </>
  )
}
