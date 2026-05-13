'use client'
import Nav from './Nav'
import { useCart } from '@/lib/cart-context'

export default function NavWrapper({ activeLink }: { activeLink?: string }) {
  const { cartCount, setCartOpen } = useCart()
  return <Nav cartCount={cartCount} onCartClick={() => setCartOpen(true)} activeLink={activeLink} />
}
