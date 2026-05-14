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
  if (!secretKey) return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured.' }, { status: 500 })

  const stripe = new Stripe(secretKey)
  const body: CheckoutBody = await req.json()
  const { cart, form, total } = body

  if (!cart?.length) return NextResponse.json({ error: 'Carrello vuoto.' }, { status: 400 })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: 'eur',
    payment_method_types: ['card'], // disables Stripe Link
    receipt_email: form.email,
    description: `Ordine Briopack — ${form.firstName} ${form.lastName}`,
    metadata: {
      customer_name:  `${form.firstName} ${form.lastName}`,
      customer_email: form.email,
      customer_phone: form.phone || '',
      address:        form.address,
      city:           form.city,
      zip:            form.zip,
      province:       form.province,
      notes:          form.notes || '',
    },
  })

  // Pre-save order to Supabase with cart details (status: pending)
  // This lets the webhook read cart items for the confirmation email
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const sb = await createClient()
    await sb.from('orders').insert({
      stripe_session_id:     paymentIntent.id,
      stripe_payment_intent: paymentIntent.id,
      customer_email:        form.email,
      customer_name:         `${form.firstName} ${form.lastName}`,
      customer_phone:        form.phone || '',
      address:               form.address,
      city:                  form.city,
      zip:                   form.zip,
      province:              form.province,
      notes:                 form.notes || '',
      total_eur:             total,
      cart_json:             cart,
      status:                'pending',
    })
  } catch (err) {
    console.error('Failed to pre-save order:', err)
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
