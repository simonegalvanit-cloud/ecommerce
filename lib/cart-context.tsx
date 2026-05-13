'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  cat: string
  size: string
  qty: number
  unitPrice: number
  setupCost: number
}

interface CartCtx {
  cart: CartItem[]
  cartOpen: boolean
  setCartOpen: (v: boolean) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, delta: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const addItem = useCallback((item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty }
        return next
      }
      return [...prev, item]
    })
    setCartOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.qty + i.setupCost, 0)

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, addItem, removeItem, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
