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
  artworkUrl?: string
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
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : [] } catch { return [] }
}
function writeLocal(items: CartItem[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch {}
}
function clearLocal() {
  try { localStorage.removeItem(LS_KEY) } catch {}
}
function mergeItems(base: CartItem[], extra: CartItem[]): CartItem[] {
  const result = [...base]
  for (const item of extra) {
    const idx = result.findIndex(i => i.id === item.id)
    // Use max qty (not sum) — prevents doubling when same cart exists on both sides
    if (idx >= 0) result[idx] = { ...result[idx], qty: Math.max(result[idx].qty, item.qty) }
    else result.push(item)
  }
  return result
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart]         = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [userId, setUserId]     = useState<string | null>(null)
  const syncTimer               = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track which userId was already handled by INITIAL_SESSION to prevent
  // Supabase double-firing both INITIAL_SESSION + SIGNED_IN on page load,
  // which caused mergeWithRemote to double quantities on every page refresh.
  const handledUserRef          = useRef<string | null>(null)

  // ── Restore anonymous cart immediately on mount ─────────────────────────────
  useEffect(() => {
    setCart(readLocal())
  }, [])

  // ── Auth state ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const sb = createClient()

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          handledUserRef.current = session.user.id
          setUserId(session.user.id)
          loadRemote(session.user.id)   // fire-and-forget — do NOT await in callback
        }
        // anonymous: cart already set from localStorage above
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Supabase sometimes fires SIGNED_IN right after INITIAL_SESSION on page
        // load — skip if we already handled this user to avoid doubling quantities
        if (handledUserRef.current === session.user.id) return
        handledUserRef.current = session.user.id
        const localBefore = readLocal()
        setUserId(session.user.id)
        mergeWithRemote(session.user.id, localBefore)   // fire-and-forget
      } else if (event === 'SIGNED_OUT') {
        handledUserRef.current = null
        setUserId(null)
        setCart([])
        clearLocal()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Persist cart changes ────────────────────────────────────────────────────
  useEffect(() => {
    writeLocal(cart)
    if (!userId) return
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(async () => {
      const sb = createClient()
      await sb.from('user_carts')
        .upsert({ user_id: userId, items: cart, updated_at: new Date().toISOString() })
    }, 800)
  }, [cart, userId])

  async function loadRemote(uid: string) {
    try {
      const sb = createClient()
      const { data } = await sb.from('user_carts').select('items').eq('user_id', uid).single()
      const remote: CartItem[] = Array.isArray(data?.items) ? data.items : []
      setCart(remote)
      writeLocal(remote)
    } catch {
      setCart(readLocal())
    }
  }

  async function mergeWithRemote(uid: string, localItems: CartItem[]) {
    try {
      const sb = createClient()
      const { data } = await sb.from('user_carts').select('items').eq('user_id', uid).single()
      const remote: CartItem[] = Array.isArray(data?.items) ? data.items : []
      const merged = localItems.length > 0 ? mergeItems(remote, localItems) : remote
      setCart(merged)
      writeLocal(merged)
      await sb.from('user_carts').upsert({ user_id: uid, items: merged, updated_at: new Date().toISOString() })
    } catch {
      setCart(localItems.length > 0 ? localItems : readLocal())
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

  const removeItem = useCallback((id: string) => setCart(prev => prev.filter(i => i.id !== id)), [])

  const updateQty = useCallback((id: string, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)), [])

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
