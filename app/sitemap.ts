import { MetadataRoute } from 'next'
import { PRODUCTS } from '@/lib/products'

const BASE = 'https://briopack.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/catalogo`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/contatti`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/servizi`,     lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/termini`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ]

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map(p => ({
    url: `${BASE}/products/${p.key}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticPages, ...productPages]
}
