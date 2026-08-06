import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'Briopack — Packaging su Misura',
  description: 'Packaging professionale per aziende. Scatole, shopper, imballaggi food e molto altro. Ordina online con MOQ accessibili.',
  openGraph: {
    title: 'Briopack — Packaging professionale su misura',
    description: 'Shopper, wine box, buste e-commerce e molto altro — configura, quantifica, ordina online.',
    siteName: 'Briopack',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Briopack — Packaging professionale su misura',
    description: 'Shopper, wine box, buste e-commerce e molto altro — configura, quantifica, ordina online.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <CartProvider>
          {children}
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  )
}
