import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'

export const metadata: Metadata = {
  title: 'Briopack — Packaging su Misura',
  description: 'Packaging professionale per aziende. Scatole, shopper, imballaggi food e molto altro. Ordina online con MOQ accessibili.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
