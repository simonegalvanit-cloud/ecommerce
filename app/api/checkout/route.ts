import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { CartItem } from '@/lib/cart-context'

interface CheckoutBody {
  cart: CartItem[]
  form: {
    firstName: string; lastName: string; email: string; phone: string
    address: string; city: string; zip: string; province: string; notes: string
  }
  shipping: number
  iva: number
  total: number
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL

  if (!secretKey) return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured.' }, { status: 500 })
  if (!siteUrl)   return NextResponse.json({ error: 'NEXT_PUBLIC_SITE_URL not configured.' }, { status: 500 })

  const stripe = new Stripe(secretKey)

  const body: CheckoutBody = await req.json()
  const { cart, form, shipping, iva } = body

  if (!cart?.length) return NextResponse.json({ error: 'Carrello vuoto.' }, { status: 400 })

  // Build Stripe line items from cart
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  for (const item of cart) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: [item.cat, item.size].filter(Boolean).join(' · ') || undefined,
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.qty,
    })

    if (item.setupCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: `Avviamento stampa — ${item.name}` },
          unit_amount: Math.round(item.setupCost * 100),
        },
        quantity: 1,
      })
    }
  }

  // IVA as a line item
  lineItems.push({
    price_data: {
      currency: 'eur',
      product_data: { name: 'IVA 22%' },
      unit_amount: Math.round(iva * 100),
    },
    quantity: 1,
  })

  // Shipping as a line item
  lineItems.push({
    price_data: {
      currency: 'eur',
      product_data: { name: 'Spedizione' },
      unit_amount: Math.round(shipping * 100),
    },
    quantity: 1,
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: form.email,
    metadata: {
      customer_name:  `${form.firstName} ${form.lastName}`,
      customer_phone: form.phone || '',
      address:        form.address,
      city:           form.city,
      zip:            form.zip,
      province:       form.province,
      notes:          form.notes || '',
    },
    payment_intent_data: {
      description: `Ordine Briopack — ${form.firstName} ${form.lastName}`,
      metadata: {
        customer_email: form.email,
        city: form.city,
      },
    },
    success_url: `${siteUrl}/conferma?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${siteUrl}/checkout`,
    locale: 'it',
  })

  return NextResponse.json({ url: session.url })
}
