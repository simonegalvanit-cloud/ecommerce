'use client'
import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

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
const LS_KEY = 'bp_cart'

function readLocal(): CartItem[] {
  try {
    const s = localStorage.getItem(LS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function writeLocal(items: CartItem[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch {}
}

function clearLocal() {
  try { localStorage.removeItem(LS_KEY) } catch {}
}

function mergeItems(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const result = [...base]
  for (const item of incoming) {
    const idx = result.findIndex(i => i.id === item.id)
    if (idx >= 0) result[idx] = { ...result[idx], qty: result[idx].qty + item.qty }
    else result.push(item)
  }
  return result
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart]     = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── On mount: restore from localStorage ────────────────────────────────────
  useEffect(() => {
    setCart(readLocal())
  }, [])

  // ── Auth state: clear on logout, sync on login ──────────────────────────────
  useEffect(() => {
    const sb = createClient()

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        syncFromSupabase(session.user.id)
      }
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id)
        syncFromSupabase(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUserId(null)
        setCart([])
        clearLocal()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── When cart changes: persist ──────────────────────────────────────────────
  useEffect(() => {
    writeLocal(cart)

    // Debounced Supabase sync for logged-in users
    if (!userId) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      const sb = createClient()
      sb.from('user_carts')
        .upsert({ user_id: userId, items: cart, updated_at: new Date().toISOString() })
        .then()
    }, 800)
  }, [cart, userId])

  async function syncFromSupabase(uid: string) {
    try {
      const sb = createClient()
      const { data } = await sb.from('user_carts').select('items').eq('user_id', uid).single()
      const remote: CartItem[] = Array.isArray(data?.items) ? data.items : []
      // Merge remote cart with any local cart (e.g. added while logged out)
      const local = readLocal()
      const merged = mergeItems(remote, local)
      setCart(merged)
      writeLocal(merged)
    } catch {
      // table may not exist yet — fall back to localStorage only
    }
  }

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

  const clearCart = useCallback(() => {
    setCart([])
    clearLocal()
    if (userId) {
      const sb = createClient()
      sb.from('user_carts').upsert({ user_id: userId, items: [], updated_at: new Date().toISOString() }).then()
    }
  }, [userId])

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
