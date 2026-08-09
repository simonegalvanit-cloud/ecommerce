import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/checkout', '/conferma', '/api/'],
    },
    sitemap: 'https://briopack.com/sitemap.xml',
  }
}
