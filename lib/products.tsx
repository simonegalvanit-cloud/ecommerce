import type { ReactNode } from 'react'

export interface ProductSize  { label: string; dim: string; price: number | null }
export interface ProductColor { label: string; hex: string; border?: boolean }
export interface ProductDiscTier { min: number; max: number | null; label: string; disc: string | null }

export interface Product {
  key: string
  name: string
  cat: string
  catKey: string
  price: number
  moq: number
  badge?: { label: string; type: 'top' | 'eco' }
  desc: string
  seoDesc: string
  image?: string
  images?: Record<string, string>  // color label → image path
  svg?: ReactNode
  // Optional per-product config — falls back to global constants when absent
  sizes?: ProductSize[]
  colors?: ProductColor[]
  printOptions?: string[]
  qtyPresets?: number[]
  discTiers?: ProductDiscTier[]
}

export const PRODUCTS: Product[] = [
  {
    key: 'shopper', name: 'Shopper Lusso Monopatinato Lucido',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.65, moq: 100,
    badge: { label: 'Più venduto', type: 'top' },
    desc: 'Bordo risvoltato · Plastificazione lucida · Maniglia di cotone in tinta. Disponibile in 6 formati e 4 colori, 190 g/m².',
    seoDesc: 'Shopper lusso monopatinato lucido con bordo risvoltato, plastificazione lucida e maniglia di cotone. 6 formati dal 11+11×40 al 54+13×45 cm. Personalizzabile online su Briopack.',
    sizes: [
      { label: '11+11×40 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '16+8×24 cm',  dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '24+10×32 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '32+10×27 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '42+13×36 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '54+13×45 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Bianco',   hex: '#f5f4f2', border: true },
      { label: 'Nero',     hex: '#1a1a1a' },
      { label: 'Tortora',  hex: '#b0a090' },
      { label: 'Rosso',    hex: '#c0281e' },
    ],
    printOptions: [
      'Senza Stampa', 'Flexo 1 colore', 'Flexo 4 colori', 'Stampa Digitale',
    ],
    qtyPresets: [100, 250, 500, 1000, 2500],
    image: '/products/shopper-lusso-bianco.png',
    images: {
      'Bianco':  '/products/shopper-lusso-bianco.png',
      'Nero':    '/products/shopper-lusso-nero.png',
      'Tortora': '/products/shopper-lusso-tortora.png',
      'Rosso':   '/products/shopper-lusso-rosso.png',
    },
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        {/* Bag body */}
        <rect x="18" y="34" width="74" height="66" rx="3" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        {/* Folded top edge (bordo risvoltato) */}
        <rect x="18" y="34" width="74" height="9" rx="3" fill="#e4ddd2" stroke="#b8924a" strokeWidth="1.2"/>
        <line x1="18" y1="43" x2="92" y2="43" stroke="#b8924a" strokeWidth="0.8"/>
        {/* Cotton cord handles - left */}
        <path d="M32 34 Q32 17 42 17 Q52 17 52 34" stroke="#b8924a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* Cotton cord handles - right */}
        <path d="M58 34 Q58 17 68 17 Q78 17 78 34" stroke="#b8924a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* Glossy shine highlight */}
        <path d="M26 56 Q42 48 58 54" stroke="rgba(255,255,255,0.55)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Side gusset line */}
        <line x1="28" y1="43" x2="28" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
        <line x1="82" y1="43" x2="82" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    key: 'maniglia-piatta', name: 'Shopper Maniglia Piatta',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.65, moq: 200,
    desc: 'Maniglia piatta in carta. Disponibile in carta avana, bianca e sealing avana. 6 formati dal 18+8×24 al 45+15×49 cm.',
    seoDesc: 'Shopper maniglia piatta in carta avana, bianca e sealing avana. 6 formati disponibili, senza stampa. MOQ 200 pz. Ordina su Briopack.',
    sizes: [
      { label: '18+8×24 cm',  dim: '80 g · 250 pz/scatola',  price: null },
      { label: '22+10×29 cm', dim: '80 g · 250 pz/scatola',  price: null },
      { label: '27+12×37 cm', dim: '90 g · 350 pz/scatola',  price: null },
      { label: '32+13×41 cm', dim: '90 g · 300 pz/scatola',  price: null },
      { label: '32+17×45 cm', dim: '90 g · 250 pz/scatola',  price: null },
      { label: '45+15×49 cm', dim: '110 g · 200 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Avana',         hex: '#c4a060' },
      { label: 'Bianco',        hex: '#f5f4f2', border: true },
      { label: 'Sealing Avana', hex: '#a07840' },
    ],
    printOptions: ['Senza Stampa'],
    qtyPresets: [200, 300, 350, 500, 1000],
    image: '/products/maniglia-piatta-avana.png',
    images: {
      'Avana':         '/products/maniglia-piatta-avana.png',
      'Bianco':        '/products/maniglia-piatta-bianco.png',
      'Sealing Avana': '/products/maniglia-piatta-avana.png',
    },
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        {/* Bag body */}
        <rect x="18" y="32" width="74" height="68" rx="3" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        {/* Flat handle left */}
        <rect x="30" y="20" width="18" height="14" rx="2" fill="#e4ddd2" stroke="#b8924a" strokeWidth="1.3"/>
        {/* Flat handle right */}
        <rect x="62" y="20" width="18" height="14" rx="2" fill="#e4ddd2" stroke="#b8924a" strokeWidth="1.3"/>
        {/* Handle attachment lines */}
        <line x1="33" y1="34" x2="33" y2="32" stroke="#b8924a" strokeWidth="1"/>
        <line x1="45" y1="34" x2="45" y2="32" stroke="#b8924a" strokeWidth="1"/>
        <line x1="65" y1="34" x2="65" y2="32" stroke="#b8924a" strokeWidth="1"/>
        <line x1="77" y1="34" x2="77" y2="32" stroke="#b8924a" strokeWidth="1"/>
        {/* Gusset lines */}
        <line x1="28" y1="32" x2="28" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
        <line x1="82" y1="32" x2="82" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  // ── NUOVI PRODOTTI DA CATALOGO 2025 ──────────────────────────────────────
  {
    key: 'maniglia-ritorta', name: 'Shopper Maniglia Ritorta',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.28, moq: 150,
    desc: 'Manico ritorto in carta avana, bianca o sealing avana. 9 formati dal 14+8,5×21 al 55+15×49 cm.',
    seoDesc: 'Shopper maniglia ritorta in carta avana, bianca e sealing avana. 9 formati disponibili, stampabile in digitale e a caldo. MOQ 150 pz. Ordina su Briopack.',
    sizes: [
      { label: '14+8,5×21 cm',   dim: '100 g · 400 pz/scatola', price: null },
      { label: '14+8,5×39,5 cm', dim: '110 g · 250 pz/scatola', price: null },
      { label: '18+8×24 cm',     dim: '100 g · 250 pz/scatola', price: null },
      { label: '22+10×29 cm',    dim: '100 g · 250 pz/scatola', price: null },
      { label: '27+12×37 cm',    dim: '100 g · 200 pz/scatola', price: null },
      { label: '32+13×41 cm',    dim: '100 g · 200 pz/scatola', price: null },
      { label: '36+12×41 cm',    dim: '100 g · 150 pz/scatola', price: null },
      { label: '45+15×49 cm',    dim: '110 g · 200 pz/scatola', price: null },
      { label: '55+15×49 cm',    dim: '110 g · 150 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Avana',         hex: '#c4a060' },
      { label: 'Bianco',        hex: '#f5f4f2', border: true },
      { label: 'Sealing Avana', hex: '#a07840' },
    ],
    printOptions: ['Senza Stampa', 'Stampa Digitale', 'Stampa a Caldo'],
    qtyPresets: [150, 250, 500, 1000, 2500],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="34" width="74" height="66" rx="3" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <path d="M34 34 Q34 18 44 18 Q54 18 54 34" stroke="#b8924a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M56 34 Q56 18 66 18 Q76 18 76 34" stroke="#b8924a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="28" y1="34" x2="28" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
        <line x1="82" y1="34" x2="82" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    key: 'shopper-colorati', name: 'Shopper Colorati',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.32, moq: 150,
    desc: 'Maniglia ritorta colorata, oltre 15 colori disponibili. 7 formati, carta bianca o sealing. Personalizzabile a caldo.',
    seoDesc: 'Shopper colorati con maniglia ritorta. 16 colori pastello e sealing, 7 formati dal 14+8,5×21,5 al 55+15×49 cm. Personalizzabile a caldo. MOQ 150 pz.',
    sizes: [
      { label: '14+8,5×21,5 cm', dim: '100 g · 400 pz/scatola', price: null },
      { label: '18+8×24 cm',     dim: '100 g · 250 pz/scatola', price: null },
      { label: '22+10×29 cm',    dim: '100 g · 250 pz/scatola', price: null },
      { label: '27+12×37 cm',    dim: '100 g · 250 pz/scatola', price: null },
      { label: '36+12×41 cm',    dim: '100 g · 200 pz/scatola', price: null },
      { label: '45+15×49 cm',    dim: '110 g · 200 pz/scatola', price: null },
      { label: '55+15×49 cm',    dim: '110 g · 150 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Crema',       hex: '#f5ecc0', border: true },
      { label: 'Turchese',    hex: '#2eb8b0' },
      { label: 'Rosa',        hex: '#f4a0b0' },
      { label: 'Arancio',     hex: '#e8721a' },
      { label: 'Verde',       hex: '#7dc87a' },
      { label: 'Giallo',      hex: '#f5d840' },
      { label: 'Viola',       hex: '#7b3fa0' },
      { label: 'Blu',         hex: '#2040b0' },
      { label: 'Fucsia',      hex: '#e0206a' },
      { label: 'Nero',        hex: '#1a1a1a' },
      { label: 'Grigio',      hex: '#808080' },
      { label: 'Rosso',       hex: '#c0281e' },
      { label: 'Verde Scuro', hex: '#1a5230' },
      { label: 'Bordeaux',    hex: '#7c2032' },
      { label: 'Blu Notte',   hex: '#1a2050' },
      { label: 'Marrone',     hex: '#6b3a2a' },
    ],
    printOptions: ['Senza Stampa', 'Stampa a Caldo'],
    qtyPresets: [150, 250, 500, 1000],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="34" width="74" height="66" rx="3" fill="#e8721a" stroke="#c05010" strokeWidth="1.5"/>
        <path d="M34 34 Q34 18 44 18 Q54 18 54 34" stroke="#c05010" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M56 34 Q56 18 66 18 Q76 18 76 34" stroke="#c05010" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="28" y1="34" x2="28" y2="100" stroke="#c05010" strokeWidth="0.7" strokeDasharray="2,2"/>
        <line x1="82" y1="34" x2="82" y2="100" stroke="#c05010" strokeWidth="0.7" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    key: 'lusso-natural', name: 'Shopper Lusso Natural',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.48, moq: 100,
    desc: 'Bordo risvoltato, maniglia in tinta, carta 186 g/m². Bianco, nero e avana. 8 formati fino a 70+30×60 cm.',
    seoDesc: 'Shopper lusso natural con bordo risvoltato e maniglia in tinta. 8 formati dal 11+11×40 al 70+30×60 cm. Carta 186 g/m². MOQ 100 pz. Briopack.',
    sizes: [
      { label: '11+11×40 cm', dim: '186 g/m² · 100 pz/scatola', price: null },
      { label: '16+8×24 cm',  dim: '186 g/m² · 100 pz/scatola', price: null },
      { label: '24+10×32 cm', dim: '186 g/m² · 100 pz/scatola', price: null },
      { label: '32+10×27 cm', dim: '186 g/m² · 100 pz/scatola', price: null },
      { label: '42+13×36 cm', dim: '186 g/m² · 100 pz/scatola', price: null },
      { label: '54+13×45 cm', dim: '186 g/m² · 100 pz/scatola', price: null },
      { label: '60+15×50 cm', dim: '186 g/m² · 100 pz/scatola', price: null },
      { label: '70+30×60 cm', dim: '186 g/m² · 50 pz/scatola',  price: null },
    ],
    colors: [
      { label: 'Bianco', hex: '#f5f4f2', border: true },
      { label: 'Nero',   hex: '#1a1a1a' },
      { label: 'Avana',  hex: '#c4a060' },
    ],
    printOptions: ['Senza Stampa', 'Stampa Digitale', 'Stampa a Caldo'],
    qtyPresets: [100, 250, 500, 1000],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="34" width="74" height="66" rx="3" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <rect x="18" y="34" width="74" height="8" rx="3" fill="#e0d8cc" stroke="#b8924a" strokeWidth="1.2"/>
        <line x1="18" y1="42" x2="92" y2="42" stroke="#b8924a" strokeWidth="0.8"/>
        <path d="M32 34 Q32 17 42 17 Q52 17 52 34" stroke="#b8924a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M58 34 Q58 17 68 17 Q78 17 78 34" stroke="#b8924a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <line x1="28" y1="42" x2="28" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
        <line x1="82" y1="42" x2="82" y2="100" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    key: 'lusso-opaco', name: 'Shopper Lusso Monopatinato Opaco',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.58, moq: 100,
    desc: 'Bordo risvoltato · Plastificazione opaca · Maniglia cotone. 5 colori, 7 formati, 190 g/m².',
    seoDesc: 'Shopper lusso monopatinato opaco con bordo risvoltato, plastificazione opaca e maniglia di cotone. 5 colori, 7 formati. MOQ 100 pz. Briopack.',
    sizes: [
      { label: '16+8×24 cm',  dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '24+10×32 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '32+10×27 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '42+13×36 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '54+13×45 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '60+15×50 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
      { label: '60+20×50 cm', dim: '190 g/m² · 100 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Bianco',  hex: '#f5f4f2', border: true },
      { label: 'Nero',    hex: '#1a1a1a' },
      { label: 'Giallo',  hex: '#f5d840' },
      { label: 'Arancio', hex: '#e8721a' },
      { label: 'Marrone', hex: '#6b3a2a' },
    ],
    printOptions: ['Senza Stampa', 'Stampa a Caldo'],
    qtyPresets: [100, 250, 500, 1000],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="34" width="74" height="66" rx="3" fill="#1a1a1a" stroke="#444" strokeWidth="1.5"/>
        <rect x="18" y="34" width="74" height="8" rx="3" fill="#2a2a2a" stroke="#444" strokeWidth="1.2"/>
        <line x1="18" y1="42" x2="92" y2="42" stroke="#555" strokeWidth="0.8"/>
        <path d="M32 34 Q32 17 42 17 Q52 17 52 34" stroke="#666" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M58 34 Q58 17 68 17 Q78 17 78 34" stroke="#666" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M26 60 Q42 52 58 58" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'take-away', name: 'Shopper Take Away',
    cat: 'Food Delivery', catKey: 'food', price: 0.32, moq: 250,
    desc: 'Shopper in carta per asporto con maniglia piatta o ritorta. Avana e bianca. Ideale per ristoranti e delivery.',
    seoDesc: 'Shopper take away in carta avana e bianca, maniglia piatta o ritorta. 7 formati per ristorazione e food delivery. MOQ 250 pz. Briopack.',
    sizes: [
      { label: '27+17×29 cm — piatta',  dim: '90 g · 300 pz/scatola',  price: null },
      { label: '32+17×29 cm — piatta',  dim: '90 g · 300 pz/scatola',  price: null },
      { label: '32+22×34 cm — piatta',  dim: '90 g · 250 pz/scatola',  price: null },
      { label: '35+25×27 cm — piatta',  dim: '90 g · 250 pz/scatola',  price: null },
      { label: '27+17×29 cm — ritorta', dim: '100 g · 250 pz/scatola', price: null },
      { label: '36+22×33 cm — ritorta', dim: '100 g · 150 pz/scatola', price: null },
      { label: '35+35×40 cm — ritorta', dim: '120 g · 150 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Avana',  hex: '#c4a060' },
      { label: 'Bianco', hex: '#f5f4f2', border: true },
    ],
    printOptions: ['Senza Stampa', 'Stampa Digitale', 'Stampa a Caldo'],
    qtyPresets: [250, 300, 500, 1000],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="14" y="38" width="82" height="60" rx="3" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <rect x="30" y="24" width="22" height="16" rx="2" fill="#e4ddd2" stroke="#b8924a" strokeWidth="1.3"/>
        <rect x="58" y="24" width="22" height="16" rx="2" fill="#e4ddd2" stroke="#b8924a" strokeWidth="1.3"/>
        <line x1="14" y1="38" x2="96" y2="38" stroke="#b8924a" strokeWidth="0.8"/>
        <line x1="24" y1="38" x2="24" y2="98" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
        <line x1="86" y1="38" x2="86" y2="98" stroke="#b8924a" strokeWidth="0.7" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    key: 'busta-ecommerce', name: 'Busta E-Commerce in Carta',
    cat: 'E-commerce', catKey: 'ecom', price: 0.35, moq: 200,
    desc: 'Due bande adesive e apertura facilitata. Versione Light, Basic e Premium. Carta avana impermeabilizzata.',
    seoDesc: 'Busta e-commerce in carta avana con doppia banda adesiva. Versione Light (100g), Basic (110g), Premium (135g). 6 formati. MOQ 200 pz. Briopack.',
    sizes: [
      { label: 'Light 30+6×40+8 cm',   dim: '100 g · 400 pz/scatola', price: null },
      { label: 'Light 45+6×50+8 cm',   dim: '100 g · 250 pz/scatola', price: null },
      { label: 'Basic 26×8×35+8 cm',   dim: '110 g · 200 pz/scatola', price: null },
      { label: 'Basic 34×8×41+8 cm',   dim: '110 g · 200 pz/scatola', price: null },
      { label: 'Premium 26×8×35+8 cm', dim: '135 g · 200 pz/scatola', price: null },
      { label: 'Premium 34×8×41+8 cm', dim: '135 g · 200 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Avana', hex: '#c4a060' },
    ],
    printOptions: ['Senza Stampa', 'Stampa Digitale'],
    qtyPresets: [200, 400, 500, 1000],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="12" y="28" width="86" height="60" rx="3" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <line x1="12" y1="50" x2="98" y2="50" stroke="#b8924a" strokeWidth="1.2"/>
        <line x1="12" y1="54" x2="98" y2="54" stroke="#b8924a" strokeWidth="0.6" strokeDasharray="3,2"/>
        <rect x="28" y="62" width="54" height="20" rx="2" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="3,2"/>
        <path d="M42 28 Q42 18 55 18 Q68 18 68 28" stroke="#b8924a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'portabottiglie-carta', name: 'Portabottiglie in Carta',
    cat: 'Wine Packaging', catKey: 'wine', price: 0.65, moq: 70,
    desc: 'Sacchetti lusso in carta per 1–2 bottiglie e Magnum. Avana kraft, nero e bordeaux. Personalizzabili.',
    seoDesc: 'Portabottiglie in carta lusso per 1-2 bottiglie e Magnum. Carta 210g, disponibile in avana, nero e bordeaux. Stampabile in digitale e a caldo. MOQ 70 pz.',
    sizes: [
      { label: '1 bott. 10×9×39 cm',            dim: '210 g · 150 pz/scatola', price: null },
      { label: '2 bott. 17,5×9×39 cm',          dim: '210 g · 70 pz/scatola',  price: null },
      { label: '1 bott. Magnum 11,5×11,5×42 cm', dim: '210 g · 100 pz/scatola', price: null },
      { label: '1 bott. 7,2×6,8×31 cm (PVC)',   dim: '210 g · 100 pz/scatola', price: null },
      { label: '2 bott. 17,5×8,5×37 cm (PVC)',  dim: '210 g · 100 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Avana',    hex: '#c4a060' },
      { label: 'Nero',     hex: '#1a1a1a' },
      { label: 'Bordeaux', hex: '#7c2032' },
    ],
    printOptions: ['Senza Stampa', 'Stampa Digitale', 'Stampa a Caldo'],
    qtyPresets: [70, 100, 150, 300],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="30" y="24" width="50" height="78" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <rect x="30" y="24" width="50" height="9" rx="4" fill="#e0d8cc" stroke="#b8924a" strokeWidth="1.2"/>
        <line x1="30" y1="33" x2="80" y2="33" stroke="#b8924a" strokeWidth="0.8"/>
        <path d="M40 24 Q40 14 55 14 Q70 14 70 24" stroke="#b8924a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <ellipse cx="55" cy="72" rx="12" ry="18" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    key: 'scatola-portabottiglia', name: 'Scatola Portabottiglia Kraft',
    cat: 'Wine Packaging', catKey: 'wine', price: 0.75, moq: 50,
    desc: 'Kraft avana per 1–6 bottiglie, verticali o orizzontali. Disponibile per Bordolese, Magnum e Champagne.',
    seoDesc: 'Scatola portabottiglia in kraft avana da 1 a 6 bottiglie, verticale o orizzontale. Anche per Magnum e Champagne. Stampabile a caldo. MOQ 50 pz.',
    sizes: [
      { label: '1 bott. vert. 9×9×38,5 cm',       dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '2 bott. vert. 18×9×38,5 cm',      dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '3 bott. vert. 27×9×38,5 cm',      dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '1 bott. orizz. 34×9×9 cm',        dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '2 bott. orizz. 34×18,5×9 cm',     dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '3 bott. orizz. 34×28×9 cm',       dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '4 bott. orizz. 34×37×9 cm',       dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '6 bott. orizz. 34×56×9 cm',       dim: 'Kraft avana · 50+ pz/ord.', price: null },
      { label: '1 bott. Magnum 11,5×11,5×43 cm',  dim: 'Kraft avana · 50+ pz/ord.', price: null },
    ],
    colors: [
      { label: 'Avana Kraft', hex: '#c4a060' },
    ],
    printOptions: ['Senza Stampa', 'Stampa a Caldo'],
    qtyPresets: [50, 100, 200, 500],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="22" y="22" width="66" height="80" rx="3" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <line x1="55" y1="22" x2="55" y2="102" stroke="#b8924a" strokeWidth="0.8"/>
        <ellipse cx="38" cy="55" rx="9" ry="22" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="2,2"/>
        <ellipse cx="72" cy="55" rx="9" ry="22" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    key: 'tnt-bag', name: 'TNT Bag Riutilizzabile',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.85, moq: 100,
    desc: 'Borsa riutilizzabile in tessuto TNT plastificato. Con soffietto, con zip e soffietto, o senza. Nero e bianco.',
    seoDesc: 'TNT bag riutilizzabile in tessuto plastificato. 3 modelli: con soffietto, con zip, senza soffietto. Nero e bianco, stampabile a caldo. MOQ 100 pz.',
    sizes: [
      { label: 'Con Soffietto 45×15×35 cm',      dim: 'TNT plastificato · 100 pz/scatola', price: null },
      { label: 'Con Zip e Soffietto 45×15×35 cm', dim: 'TNT plastificato · 100 pz/scatola', price: null },
      { label: 'Senza Soffietto 38×42 cm',        dim: 'TNT plastificato · 100 pz/scatola', price: null },
    ],
    colors: [
      { label: 'Nero',   hex: '#1a1a1a' },
      { label: 'Bianco', hex: '#f5f4f2', border: true },
    ],
    printOptions: ['Senza Stampa', 'Stampa a Caldo'],
    qtyPresets: [100, 250, 500, 1000],
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="30" width="74" height="72" rx="5" fill="#1a1a1a" stroke="#555" strokeWidth="1.5"/>
        <line x1="18" y1="50" x2="92" y2="50" stroke="#555" strokeWidth="0.8"/>
        <line x1="38" y1="30" x2="38" y2="102" stroke="#444" strokeWidth="0.7" strokeDasharray="2,2"/>
        <line x1="72" y1="30" x2="72" y2="102" stroke="#444" strokeWidth="0.7" strokeDasharray="2,2"/>
        <rect x="36" y="14" width="38" height="18" rx="3" fill="none" stroke="#555" strokeWidth="1.3"/>
        <line x1="44" y1="14" x2="44" y2="30" stroke="#555" strokeWidth="1.3"/>
        <line x1="66" y1="14" x2="66" y2="30" stroke="#555" strokeWidth="1.3"/>
      </svg>
    ),
  },
]

export const CATEGORIES = [
  { key: 'all',     label: 'Tutti' },
  { key: 'shopper', label: 'Shopper' },
  { key: 'food',    label: 'Food Delivery' },
  { key: 'wine',    label: 'Wine' },
  { key: 'ecom',    label: 'E-commerce' },
]

export const SIZES = [
  { label: 'XS',     dim: '200×150×100 mm', price: 0.38 },
  { label: 'S',      dim: '300×200×150 mm', price: 0.48 },
  { label: 'M',      dim: '400×300×200 mm', price: 0.62 },
  { label: 'L',      dim: '500×400×300 mm', price: 0.78 },
  { label: 'XL',     dim: '600×450×350 mm', price: 0.98 },
  { label: 'Custom', dim: 'misura libera',  price: null  },
]

export const PRINT_OPTIONS = [
  'Senza Stampa', 'Flexo 1 colore', 'Flexo 4 colori', 'Stampa Digitale',
  'Plastif. Opaca', 'Plastif. Lucida', 'Lucidatura UV', 'Stampa a Caldo',
]

export const QTY_PRESETS = [100, 250, 500, 1000, 5000]

export const COLORS = [
  { label: 'Naturale', hex: '#d4c8b0' },
  { label: 'Bianco',   hex: '#f5f4f2', border: true },
  { label: 'Nero',     hex: '#1e1e1c' },
  { label: 'Verde',    hex: '#1a4228' },
  { label: 'Bordeaux', hex: '#7c2032' },
  { label: 'Blu',      hex: '#1c3a5e' },
]

export const DISC_TIERS = [
  { min: 100,  max: 499,      label: '100–499',     disc: null  },
  { min: 500,  max: 999,      label: '500–999',     disc: '-10%' },
  { min: 1000, max: 4999,     label: '1.000–4.999', disc: '-20%' },
  { min: 5000, max: Infinity, label: '5.000+',      disc: '-32%' },
]
