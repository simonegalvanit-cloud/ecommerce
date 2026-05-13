import type { ReactNode } from 'react'

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
  svg: ReactNode
}

export const PRODUCTS: Product[] = [
  {
    key: 'americanbox', name: 'Scatola Americana — Ondulato',
    cat: 'Imballaggi Industriali', catKey: 'industrial', price: 0.38, moq: 100,
    badge: { label: 'Più venduto', type: 'top' },
    desc: 'Cartone ondulato con stampa flessografica fino a 6 colori. Disponibile da XS a XXL, personalizzabile su misura.',
    seoDesc: 'Scatola americana in cartone ondulato personalizzabile. Stampa flessografica fino a 6 colori, formati da XS a XXL e su misura. MOQ 100 pz. Ordina online su Briopack.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="16" y="34" width="78" height="62" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <polygon points="16,34 55,16 94,34 55,52" fill="#e6e0d4" stroke="#b8924a" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    key: 'shopper', name: 'Shopper Lusso in Carta',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.65, moq: 250,
    desc: 'Borsa in carta con manico ritorto. Stampa litografica o digitale, plastificazione opaca o lucida.',
    seoDesc: 'Shopper in carta di lusso con manico ritorto. Stampa litografica o digitale, plastificazione opaca o lucida. MOQ 250 pz. Personalizzabile online su Briopack.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="20" y="38" width="70" height="58" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <path d="M36 38 Q36 20 55 20 Q74 20 74 38" stroke="#b8924a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <rect x="32" y="54" width="46" height="28" rx="2" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="3,2.5"/>
      </svg>
    ),
  },
  {
    key: 'winebox', name: 'Scatola Bottiglie da 1 a 6',
    cat: 'Wine Packaging', catKey: 'wine', price: 1.20, moq: 50,
    desc: 'Ondulato con alveari separatori. Da 1 a 6 bottiglie verticali o orizzontali. Stampa personalizzata.',
    seoDesc: 'Scatola vino in cartone ondulato con separatori alveare, da 1 a 6 bottiglie. Stampa personalizzata. MOQ 50 pz. Ordina il tuo packaging vino su Briopack.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="28" width="74" height="70" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <line x1="55" y1="28" x2="55" y2="98" stroke="#b8924a" strokeWidth="0.8"/>
        <line x1="18" y1="63" x2="92" y2="63" stroke="#b8924a" strokeWidth="0.8"/>
        <ellipse cx="36" cy="46" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
        <ellipse cx="74" cy="46" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
        <ellipse cx="36" cy="80" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
        <ellipse cx="74" cy="80" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: 'food', name: 'Scatola Food-Grade',
    cat: 'Food Delivery', catKey: 'food', price: 0.28, moq: 200,
    desc: 'Certificata per il contatto alimentare. Scatole e buste in carta e cartone per delivery e take away.',
    seoDesc: 'Scatola food-grade certificata per il contatto alimentare. Packaging pizza, delivery e take away in carta e cartone. MOQ 200 pz. Ordina su Briopack.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="46" width="74" height="50" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <path d="M18 58 L55 38 L92 58" stroke="#b8924a" strokeWidth="1.5" fill="none"/>
        <rect x="36" y="60" width="38" height="24" rx="2" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="3,2.5"/>
      </svg>
    ),
  },
  {
    key: 'eco', name: 'Scatola 100% Riciclata',
    cat: 'BrioGreenPack', catKey: 'eco', price: 0.45, moq: 100,
    badge: { label: 'Eco', type: 'eco' },
    desc: 'Packaging eco-certificato da materiale riciclato. Stessa qualità e configurabilità, zero impatto.',
    seoDesc: 'Scatola 100% riciclata certificata CONAI. Packaging sostenibile con stessa qualità e configurabilità del prodotto standard. MOQ 100 pz. BrioGreenPack by Briopack.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="15" y="34" width="80" height="65" rx="4" fill="#d4e6d9" stroke="#2d5a3d" strokeWidth="1.5"/>
        <polygon points="15,34 55,16 95,34 55,52" fill="#c6deca" stroke="#2d5a3d" strokeWidth="1.5"/>
        <circle cx="55" cy="74" r="14" fill="none" stroke="#2d5a3d" strokeWidth="1.5"/>
        <path d="M49 74 Q53 67 59 74 Q55 81 49 74" fill="#2d5a3d" opacity="0.5"/>
      </svg>
    ),
  },
  {
    key: 'mailer', name: 'Scatola Self-Seal Mailer',
    cat: 'E-commerce', catKey: 'ecom', price: 0.52, moq: 100,
    desc: 'Chiusura a click, nastro antieffrazione. Ideale per spedizioni corriere di qualsiasi tipo di prodotto.',
    seoDesc: 'Scatola mailer self-seal con chiusura a click e nastro antieffrazione. Ideale per e-commerce e spedizioni corriere. MOQ 100 pz. Personalizzabile su Briopack.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="15" y="30" width="80" height="68" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <path d="M15 52 L95 52" stroke="#b8924a" strokeWidth="0.8"/>
        <path d="M55 30 L55 52" stroke="#b8924a" strokeWidth="0.8"/>
        <rect x="30" y="60" width="50" height="26" rx="2" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="3,2.5"/>
        <path d="M44 30 Q44 22 55 22 Q66 22 66 30" stroke="#b8924a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export const CATEGORIES = [
  { key: 'all',        label: 'Tutti' },
  { key: 'industrial', label: 'Industriale' },
  { key: 'shopper',    label: 'Shopper' },
  { key: 'food',       label: 'Food Delivery' },
  { key: 'wine',       label: 'Wine' },
  { key: 'ecom',       label: 'E-commerce' },
  { key: 'eco',        label: 'BrioGreenPack' },
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
