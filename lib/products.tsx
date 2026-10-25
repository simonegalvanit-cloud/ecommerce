// ── Hierarchical catalog ──────────────────────────────────────────────────────

export interface MainCat {
  key: string
  label: string
  desc: string
  comingSoon?: boolean
}

export interface SubCat {
  key: string
  label: string
  mainCat: string
}

export interface CatalogItem {
  key: string
  name: string
  mainCat: string
  subCat: string
}

export const MAIN_CATS: MainCat[] = [
  { key: 'shopper', label: 'Shopper', desc: 'Shopper in carta personalizzabili: neutro, fantasia, colorati, lusso, take away, e-commerce e portabottiglie.' },
  { key: 'scatole', label: 'Scatole', desc: 'Scatole portabottiglia in kraft, onda e goffrate, cesti e scatole regalo su misura.' },
]

export const SHOPPER_SUBCATS: SubCat[] = [
  { key: 'neutro',         label: 'Neutro',         mainCat: 'shopper' },
  { key: 'fantasia',       label: 'Fantasia',        mainCat: 'shopper' },
  { key: 'colorati',       label: 'Colorati',        mainCat: 'shopper' },
  { key: 'colorati-elite', label: 'Colorati Elite',  mainCat: 'shopper' },
  { key: 'manuali-lusso',  label: 'Manuali Lusso',   mainCat: 'shopper' },
  { key: 'take-away',      label: 'Take Away',       mainCat: 'shopper' },
  { key: 'ecommerce',      label: 'E-Commerce',      mainCat: 'shopper' },
  { key: 'portabottiglie', label: 'Portabottiglie',  mainCat: 'shopper' },
]

export const SCATOLE_SUBCATS: SubCat[] = [
  { key: 'portabottiglia-kraft',    label: 'Portabottiglia Kraft',    mainCat: 'scatole' },
  { key: 'portabottiglia-onda',     label: 'Portabottiglia Onda',     mainCat: 'scatole' },
  { key: 'portabottiglia-goffrate', label: 'Portabottiglia Goffrate', mainCat: 'scatole' },
  { key: 'cesti-regalo',            label: 'Scatole e Cesti Regalo',  mainCat: 'scatole' },
]

export const CATALOG_ITEMS: CatalogItem[] = [
  // ── NEUTRO ──────────────────────────────────────────────────────────────
  { key: 'neutro-maniglia-piatta',         name: 'Maniglia Piatta',         mainCat: 'shopper', subCat: 'neutro' },
  { key: 'neutro-maniglia-ritorta',        name: 'Maniglia Ritorta',        mainCat: 'shopper', subCat: 'neutro' },
  { key: 'neutro-maniglia-ritorta-neutro', name: 'Maniglia Ritorta Neutro', mainCat: 'shopper', subCat: 'neutro' },
  { key: 'neutro-j-fold',                  name: 'J-Fold',                  mainCat: 'shopper', subCat: 'neutro' },
  // ── FANTASIA ────────────────────────────────────────────────────────────
  { key: 'fantasia-duo-italy',   name: 'Maniglia Ritorta Duo Italy',     mainCat: 'shopper', subCat: 'fantasia' },
  { key: 'fantasia-argento-oro', name: 'Maniglia Ritorta Argento & Oro', mainCat: 'shopper', subCat: 'fantasia' },
  // ── COLORATI ────────────────────────────────────────────────────────────
  { key: 'colorati-pastello', name: 'Maniglia Ritorta Colorati Pastello', mainCat: 'shopper', subCat: 'colorati' },
  { key: 'colorati-sealing',  name: 'Maniglia Ritorta Colorati Sealing',  mainCat: 'shopper', subCat: 'colorati' },
  { key: 'colorati-j-fold',   name: 'J-Fold Colorati',                   mainCat: 'shopper', subCat: 'colorati' },
  // ── COLORATI ELITE ──────────────────────────────────────────────────────
  { key: 'elite-j-fold-bronzo-platino', name: 'J-Fold Bronzo & Platino', mainCat: 'shopper', subCat: 'colorati-elite' },
  { key: 'elite-j-fold-bicolor',        name: 'J-Fold Bicolor',          mainCat: 'shopper', subCat: 'colorati-elite' },
  // ── MANUALI LUSSO ───────────────────────────────────────────────────────
  { key: 'lusso-natural',             name: 'Shopper Lusso Natural',             mainCat: 'shopper', subCat: 'manuali-lusso' },
  { key: 'lusso-monopatinato-opaco',  name: 'Shopper Lusso Monopatinato Opaco',  mainCat: 'shopper', subCat: 'manuali-lusso' },
  { key: 'lusso-monopatinato-lucido', name: 'Shopper Lusso Monopatinato Lucido', mainCat: 'shopper', subCat: 'manuali-lusso' },
  // ── TAKE AWAY ───────────────────────────────────────────────────────────
  { key: 'ta-maniglia-piatta',          name: 'Maniglia Piatta',                 mainCat: 'shopper', subCat: 'take-away' },
  { key: 'ta-maniglia-piatta-colorati', name: 'Maniglia Piatta Colorati',        mainCat: 'shopper', subCat: 'take-away' },
  { key: 'ta-flat-maxi-bags',           name: 'Flat Maxi / Flat Maxi Plus Bags', mainCat: 'shopper', subCat: 'take-away' },
  { key: 'ta-maniglia-ritorta',         name: 'Maniglia Ritorta',                mainCat: 'shopper', subCat: 'take-away' },
  { key: 'ta-surf-bags',                name: 'Surf Large / X-Large Bags',       mainCat: 'shopper', subCat: 'take-away' },
  { key: 'ta-food-delivery-kraft',      name: 'Shopper Food Delivery Kraft',     mainCat: 'shopper', subCat: 'take-away' },
  // ── E-COMMERCE ──────────────────────────────────────────────────────────
  { key: 'ec-light',             name: 'E-Commerce Light',             mainCat: 'shopper', subCat: 'ecommerce' },
  { key: 'ec-premium-envelopes', name: 'Premium E-Commerce Envelopes', mainCat: 'shopper', subCat: 'ecommerce' },
  { key: 'ec-basic-envelopes',   name: 'Basic E-Commerce Envelopes',   mainCat: 'shopper', subCat: 'ecommerce' },
  // ── PORTABOTTIGLIE ──────────────────────────────────────────────────────
  { key: 'pb-sealing-120g',         name: 'Buste in Carta Sealing 120g',        mainCat: 'shopper', subCat: 'portabottiglie' },
  { key: 'pb-finestra-pvc',         name: 'Sacchetti con Finestra in PVC',      mainCat: 'shopper', subCat: 'portabottiglie' },
  { key: 'pb-sacchetti-lusso',      name: 'Sacchetti Lusso',                    mainCat: 'shopper', subCat: 'portabottiglie' },
  { key: 'pb-sacchetti-lusso-nero', name: 'Sacchetti Lusso Nero',               mainCat: 'shopper', subCat: 'portabottiglie' },
  { key: 'pb-kraft-liscio',         name: 'Buste in Carta Kraft Liscio',        mainCat: 'shopper', subCat: 'portabottiglie' },
  { key: 'pb-kraft-lusso',          name: 'Buste Carta Kraft Lusso',            mainCat: 'shopper', subCat: 'portabottiglie' },
  { key: 'pb-lusso-lucida',         name: 'Buste Lusso Plastificazione Lucida', mainCat: 'shopper', subCat: 'portabottiglie' },
  { key: 'pb-lusso-opaca',          name: 'Buste Lusso Plastificazione Opaca',  mainCat: 'shopper', subCat: 'portabottiglie' },
  // ── SCATOLE PORTABOTTIGLIA KRAFT ────────────────────────────────────────
  { key: 'pbk-1bott',      name: '1 Bott. Kraft Avana Liscio',           mainCat: 'scatole', subCat: 'portabottiglia-kraft' },
  { key: 'pbk-2bott',      name: '2 Bott. Kraft Avana Liscio',           mainCat: 'scatole', subCat: 'portabottiglia-kraft' },
  { key: 'pbk-3bott',      name: '3 Bott. Kraft Avana Liscio',           mainCat: 'scatole', subCat: 'portabottiglia-kraft' },
  { key: 'pbk-champagne',  name: 'Champagne 1 Bott. Kraft Avana Liscio', mainCat: 'scatole', subCat: 'portabottiglia-kraft' },
  { key: 'pbk-magnum',     name: 'Magnum 1 Bott. Kraft Avana Liscio',    mainCat: 'scatole', subCat: 'portabottiglia-kraft' },
  { key: 'pbk-cantinetta', name: 'Cantinetta',                           mainCat: 'scatole', subCat: 'portabottiglia-kraft' },
  // ── SCATOLE PORTABOTTIGLIA ONDA ─────────────────────────────────────────
  { key: 'pbo-1bott', name: '1 Bott. Onda', mainCat: 'scatole', subCat: 'portabottiglia-onda' },
  { key: 'pbo-2bott', name: '2 Bott. Onda', mainCat: 'scatole', subCat: 'portabottiglia-onda' },
  { key: 'pbo-3bott', name: '3 Bott. Onda', mainCat: 'scatole', subCat: 'portabottiglia-onda' },
  // ── SCATOLE PORTABOTTIGLIA GOFFRATE ─────────────────────────────────────
  { key: 'pbg-1bott',      name: '1 Bott. Seta Nero',           mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-2bott',      name: '2 Bott. Seta Nero',           mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-3bott',      name: '3 Bott. Seta Nero',           mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-bordolese',  name: '1 Bott. Seta Nero Bordolese', mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-champagne',  name: '1 Bott. Seta Nero Champagne', mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-magnum',     name: '1 Bott. Seta Nero Magnum',    mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-cantinetta', name: 'Cantinetta',                  mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-gift-1bott', name: 'Gift 1 Bott. Seta Nero',      mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-gift-2bott', name: 'Gift 2 Bott. Seta Nero',      mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  { key: 'pbg-gift-3bott', name: 'Gift 3 Bott. Seta Nero',      mainCat: 'scatole', subCat: 'portabottiglia-goffrate' },
  // ── SCATOLE E CESTI REGALO ──────────────────────────────────────────────
  { key: 'sr-segreto-cordini', name: 'Segreto con Cordini Kraft Avana Liscio',  mainCat: 'scatole', subCat: 'cesti-regalo' },
  { key: 'sr-portapanettone',  name: 'Portapanettone + Bott. Kraft Avana',      mainCat: 'scatole', subCat: 'cesti-regalo' },
  { key: 'sr-segreto-kraft',   name: 'Segreto Kraft Avana Liscio',              mainCat: 'scatole', subCat: 'cesti-regalo' },
  { key: 'sr-cesto-incastro',  name: 'Cesto a Incastro c/Maniglie Onda Avana',  mainCat: 'scatole', subCat: 'cesti-regalo' },
]

// ── Product specs (configurable products) ────────────────────────────────────

export interface SpecSize {
  format: string   // e.g. "18+8×24"
  weightGr: number
  moq: number
}

export interface SpecColor {
  key: string
  label: string
  hex: string
  ref?: string
}

export interface FoilColor {
  key: string
  label: string
  hex: string
}

export interface ProductSpec {
  productKey: string
  name: string
  subtitle: string
  sizes: SpecSize[]
  colors: SpecColor[]
  foilColors: FoilColor[]
}

export const PRODUCT_SPECS: ProductSpec[] = [
  {
    productKey: 'neutro-maniglia-ritorta',
    name: 'Shopper Maniglia Ritorta',
    subtitle: 'Carta avana, bianca e sealing avana',
    sizes: [
      { format: '14+8,5×21',    weightGr: 100, moq: 400 },
      { format: '14+8,5×39,5',  weightGr: 110, moq: 250 },
      { format: '18+8×24',      weightGr: 100, moq: 250 },
      { format: '22+10×29',     weightGr: 100, moq: 250 },
      { format: '27+12×37',     weightGr: 100, moq: 200 },
      { format: '32+13×41',     weightGr: 100, moq: 200 },
      { format: '36+12×41',     weightGr: 100, moq: 150 },
      { format: '45+15×49',     weightGr: 110, moq: 200 },
      { format: '55+15×49',     weightGr: 110, moq: 150 },
    ],
    colors: [
      { key: 'avana',         label: 'Avana',        hex: '#C4956A', ref: '34' },
      { key: 'bianca',        label: 'Bianca',        hex: '#FFFFFF', ref: '35' },
      { key: 'sealing-avana', label: 'Sealing Avana', hex: '#D4AA82', ref: '36' },
    ],
    foilColors: [
      { key: 'oro',     label: 'Oro',     hex: '#C9A227' },
      { key: 'argento', label: 'Argento', hex: '#A8A9AD' },
      { key: 'rame',    label: 'Rame',    hex: '#B87333' },
      { key: 'bianco',  label: 'Bianco',  hex: '#F2F2F2' },
      { key: 'nero',    label: 'Nero',    hex: '#1C1C1C' },
      { key: 'rosso',   label: 'Rosso',   hex: '#C0392B' },
      { key: 'bordo',   label: 'Bordò',   hex: '#722F37' },
      { key: 'verde',   label: 'Verde',   hex: '#2E7D32' },
    ],
  },
  {
    productKey: 'neutro-maniglia-piatta',
    name: 'Shopper Maniglia Piatta',
    subtitle: 'Carta avana, bianca e sealing avana',
    sizes: [
      { format: '18+8×24',  weightGr: 80,  moq: 250 },
      { format: '22+10×29', weightGr: 80,  moq: 250 },
      { format: '27+12×37', weightGr: 90,  moq: 350 },
      { format: '32+13×41', weightGr: 90,  moq: 300 },
      { format: '32+17×45', weightGr: 90,  moq: 250 },
      { format: '45+15×49', weightGr: 110, moq: 200 },
    ],
    colors: [
      { key: 'avana',         label: 'Avana',         hex: '#C4956A', ref: '29' },
      { key: 'bianca',        label: 'Bianca',         hex: '#FFFFFF', ref: '30' },
      { key: 'sealing-avana', label: 'Sealing Avana',  hex: '#D4AA82', ref: '31' },
    ],
    foilColors: [
      { key: 'oro',     label: 'Oro',     hex: '#C9A227' },
      { key: 'argento', label: 'Argento', hex: '#A8A9AD' },
      { key: 'rame',    label: 'Rame',    hex: '#B87333' },
      { key: 'bianco',  label: 'Bianco',  hex: '#F2F2F2' },
      { key: 'nero',    label: 'Nero',    hex: '#1C1C1C' },
      { key: 'rosso',   label: 'Rosso',   hex: '#C0392B' },
      { key: 'bordo',   label: 'Bordò',   hex: '#722F37' },
      { key: 'verde',   label: 'Verde',   hex: '#2E7D32' },
    ],
  },
]

export function getProductSpec(productKey: string): ProductSpec | undefined {
  return PRODUCT_SPECS.find(s => s.productKey === productKey)
}
