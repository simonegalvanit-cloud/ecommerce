import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PRODUCTS } from '@/lib/products'
import ProductConfigurator from '@/components/ProductConfigurator'
import CartDrawer from '@/components/CartDrawer'
import NavWrapper from '@/components/NavWrapper'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return PRODUCTS.map(p => ({ slug: p.key }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = PRODUCTS.find(p => p.key === params.slug)
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
    alternates: {
      canonical: `/products/${product.key}`,
    },
  }
}

export default function ProductPage({ params }: Props) {
  const product = PRODUCTS.find(p => p.key === params.slug)
  if (!product) notFound()

  return (
    <>
      <NavWrapper />

      {/* Breadcrumb */}
      <div className="cfg-breadcrumb">
        <Link href="/">Home</Link>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        <Link href="/#catalogo">Prodotti</Link>
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
