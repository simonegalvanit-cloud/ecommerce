'use client'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

function fmt(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeItem, updateQty, cartTotal } = useCart()
  const router = useRouter()

  return (
    <>
      <div className={`cart-overlay${cartOpen ? ' open' : ''}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer${cartOpen ? ' open' : ''}`} aria-label="Carrello">
        <div className="cart-drawer-head">
          <div className="cart-drawer-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Carrello
            {cart.length > 0 && <span className="cart-drawer-badge">{cart.length}</span>}
          </div>
          <button className="cart-drawer-close" onClick={() => setCartOpen(false)} aria-label="Chiudi">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" opacity=".25">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p>Il tuo carrello è vuoto</p>
              <button className="cart-shop-btn" onClick={() => setCartOpen(false)}>Sfoglia il catalogo</button>
            </div>
          ) : (
            <ul className="cart-items">
              {cart.map(item => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-meta">{item.cat}{item.size ? ` · ${item.size}` : ''}</div>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-qty">
                      <button onClick={() => updateQty(item.id, -50)} aria-label="Diminuisci">−</button>
                      <span>{item.qty.toLocaleString('it-IT')}</span>
                      <button onClick={() => updateQty(item.id, 50)} aria-label="Aumenta">+</button>
                    </div>
                    <div className="cart-item-price">€{fmt(item.unitPrice * item.qty + item.setupCost)}</div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id)} aria-label="Rimuovi">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-foot">
            <div className="cart-foot-row">
              <span>Subtotale</span>
              <span className="cart-foot-total">€{fmt(cartTotal)}</span>
            </div>
            <p className="cart-foot-note">IVA e spedizione calcolate al checkout</p>
            <button
              className="cart-checkout-btn"
              onClick={() => { setCartOpen(false); router.push('/checkout') }}
            >
              Procedi al checkout
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="cart-continue-btn" onClick={() => setCartOpen(false)}>
              Continua a comprare
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
