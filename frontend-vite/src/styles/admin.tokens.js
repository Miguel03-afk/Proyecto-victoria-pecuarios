// src/styles/admin.tokens.js — Victoria Pets Design System
// ThemeProvider y useTheme viven en ThemeProvider.jsx (necesitan JSX).
// IMPORTANTE: NO re-exportarlos aquí — causa dependencia circular.
// Para usarlos: import { useTheme } from "@/styles/ThemeProvider.jsx";

/* ─── Identidad fija ─────────────────────────────────────────────────────── */
export const FONT = {
  display: '"Playfair Display", Georgia, serif',
  ui:      '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

/* ─── MODO CLARO ─────────────────────────────────────────────────────────── */
export const LIGHT = {
  mode: 'light',

  // Marca
  brand:       '#0A6B40',
  brandMid:    '#138553',
  brandDark:   '#064E30',
  brandSoft:   '#E4F5EC',
  brandLight:  '#E4F5EC',      // alias legacy
  brandBorder: '#95CCAD',

  // Acentos
  lime:        '#7AC143',
  limeDark:    '#5A9030',
  limeSoft:    '#EEF7E3',
  limeLight:   '#EEF7E3',      // alias legacy
  pink:        '#D4457A',
  coral:       '#D97757',
  coralSoft:   '#FBE8DE',
  amber:       '#D97706',
  amberSoft:   '#FFFBEB',
  rose:        '#D4457A',
  roseSoft:    '#FFF0F5',
  roseMid:     '#E8608A',
  roseDark:    '#A83260',
  roseBorder:  '#F9C0D0',
  roseLight:   '#FFF0F5',

  // Superficies
  canvas:       '#F5FAF7',
  surface:      '#FFFFFF',
  surfaceAlt:   '#EDF6F1',
  surfaceHov:   '#DFF0E6',
  surfaceHover: '#DFF0E6',     // alias
  surfaceElev:  '#FFFFFF',

  // Sidebar (admin / cajero / vet)
  sidebar:       '#064E30',
  sidebarBorder: '#0A5C38',
  sidebarActive: '#0A6B40',
  sidebarText:   '#7ABF99',
  sidebarTextHi: '#C4E8D5',

  // Texto
  ink:       '#101F16',
  ink2:      '#2D4A38',
  ink3:      '#5A7A65',
  muted:     '#8FAA98',
  text:      '#101F16',         // alias
  textSec:   '#2D4A38',         // alias
  textTer:   '#5A7A65',         // alias
  textMuted: '#8FAA98',         // alias
  onBrand:   '#FFFFFF',

  // Bordes
  line:        'rgba(0,0,0,0.07)',
  lineStrong:  'rgba(0,0,0,0.12)',
  border:      'rgba(0,0,0,0.07)',
  borderSub:   'rgba(0,0,0,0.04)',
  borderMed:   'rgba(0,0,0,0.11)',
  borderStr:   'rgba(0,0,0,0.16)',

  // Semánticos
  success:       '#14532D',
  successBg:     '#DCFCE7',
  successBorder: '#86EFAC',
  warn:          '#78350F',
  warnBg:        '#FEF3C7',
  warning:       '#78350F',     // alias
  warningBg:     '#FEF3C7',     // alias
  warningBorder: '#FCD34D',
  danger:        '#7F1D1D',
  dangerBg:      '#FEE2E2',
  dangerBorder:  '#FCA5A5',
  info:          '#1B4F8A',
  infoBg:        '#DCE8F7',
  infoBorder:    '#93C5FD',

  // Oro (admin)
  gold:       '#B08A24',
  goldBg:     '#FDF8EB',
  goldBorder: '#CCA83A',

  // Morado (consultas médicas / insumos clínicos)
  purple:       '#7c3aed',
  purpleDeep:   '#6b21a8',
  purpleSoft:   '#faf5ff',
  purpleBg:     '#f3e8ff',
  purpleBorder: '#e9d5ff',

  // Sombras
  shadowSm: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg: '0 12px 32px rgba(0,0,0,0.09), 0 4px 12px rgba(0,0,0,0.05)',
  glow:     '0 0 0 4px rgba(10,107,64,0.14)',
};

/* ─── MODO OSCURO — verde-petróleo profundo refinado ─────────────────────── */
export const DARK = {
  mode: 'dark',

  // Marca (verde claro vibrante sobre fondos oscuros)
  brand:       '#4DD493',     // verde más vivo
  brandMid:    '#3FBD7A',
  brandDark:   '#0E2520',     // OSCURO para banners/hero (en dark se mantiene oscuro)
  brandSoft:   'rgba(77,212,147,0.16)',
  brandLight:  'rgba(77,212,147,0.12)',
  brandBorder: 'rgba(77,212,147,0.32)',

  // Acentos
  lime:        '#B4F26C',
  limeDark:    '#A4E36A',
  limeSoft:    'rgba(180,242,108,0.14)',
  limeLight:   'rgba(180,242,108,0.10)',
  pink:        '#F472B6',
  coral:       '#FB8C5C',
  coralSoft:   'rgba(251,140,92,0.16)',
  amber:       '#FBBF24',
  amberSoft:   'rgba(251,191,36,0.14)',
  rose:        '#F472B6',
  roseSoft:    'rgba(244,114,182,0.14)',
  roseMid:     '#F472B6',
  roseDark:    '#EC4899',
  roseBorder:  'rgba(244,114,182,0.32)',
  roseLight:   'rgba(244,114,182,0.10)',

  // Superficies — niveles de elevación bien diferenciados
  canvas:       '#0D1F18',     // fondo de página (no negro puro, verde-petróleo)
  surface:      '#152C23',     // tarjetas (claramente más claro que canvas)
  surfaceAlt:   '#1B362C',     // inputs, hover
  surfaceHov:   '#214035',
  surfaceHover: '#214035',
  surfaceElev:  '#1F3A2F',     // modales (más elevados)

  // Sidebar (verde profundo, MÁS oscuro que canvas)
  sidebar:       '#081813',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  sidebarActive: 'rgba(77,212,147,0.16)',
  sidebarText:   '#8DAA9C',
  sidebarTextHi: '#EAF5EE',

  // Texto — alto contraste
  ink:       '#F0F7F3',
  ink2:      '#C8DCD0',
  ink3:      '#92AC9F',
  muted:     '#647C72',
  text:      '#F0F7F3',
  textSec:   '#C8DCD0',
  textTer:   '#92AC9F',
  textMuted: '#647C72',
  onBrand:   '#08170F',

  // Bordes — un poco más visibles para definir mejor las cards
  line:        'rgba(255,255,255,0.08)',
  lineStrong:  'rgba(255,255,255,0.16)',
  border:      'rgba(255,255,255,0.08)',
  borderSub:   'rgba(255,255,255,0.05)',
  borderMed:   'rgba(255,255,255,0.13)',
  borderStr:   'rgba(255,255,255,0.20)',

  // Semánticos — mejor contraste
  success:       '#86EFAC',
  successBg:     'rgba(34,197,94,0.16)',
  successBorder: 'rgba(34,197,94,0.40)',
  warn:          '#FBBF24',
  warnBg:        'rgba(251,191,36,0.16)',
  warning:       '#FBBF24',
  warningBg:     'rgba(251,191,36,0.16)',
  warningBorder: 'rgba(251,191,36,0.40)',
  danger:        '#FCA5A5',
  dangerBg:      'rgba(248,113,113,0.16)',
  dangerBorder:  'rgba(248,113,113,0.40)',
  info:          '#93C5FD',
  infoBg:        'rgba(147,197,253,0.16)',
  infoBorder:    'rgba(147,197,253,0.40)',

  // Oro
  gold:       '#FBBF24',
  goldBg:     'rgba(251,191,36,0.14)',
  goldBorder: 'rgba(251,191,36,0.36)',

  // Morado (consultas médicas) — adaptado a dark
  purple:       '#C084FC',
  purpleDeep:   '#A855F7',
  purpleSoft:   'rgba(192,132,252,0.08)',
  purpleBg:     'rgba(192,132,252,0.16)',
  purpleBorder: 'rgba(192,132,252,0.32)',

  // Sombras — sutiles pero presentes
  shadowSm: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
  shadowMd: '0 8px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
  shadowLg: '0 24px 56px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
  glow:     '0 0 0 4px rgba(77,212,147,0.22), 0 0 24px rgba(77,212,147,0.18)',
};

/* ─── Legacy T (compatibilidad con imports antiguos) ─────────────────────── */
export const T = LIGHT;

export const shadow = {
  sm:    LIGHT.shadowSm,
  md:    LIGHT.shadowMd,
  modal: LIGHT.shadowLg,
};

export const font = {
  display: FONT.display,
  mono:    FONT.mono,
};

/* ─── Utilidades de formato ──────────────────────────────────────────────── */
export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(n) || 0);

export const fmtShort = (n) =>
  '$' + new Intl.NumberFormat('es-CO').format(Number(n) || 0);

export const fmtMil = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`;
  return `$${v}`;
};

export const fdoc = (d) =>
  new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

/* ─── Mapas de color tema-aware ──────────────────────────────────────────── */
export const estadoStyle = (e, C = LIGHT) => ({
  pendiente:  { bg: C.warningBg, text: C.warning, border: C.warningBorder },
  pagada:     { bg: C.infoBg,    text: C.info,    border: C.infoBorder    },
  procesando: { bg: '#f3e8ff',   text: '#6b21a8', border: '#d8b4fe'       },
  enviada:    { bg: '#e0e7ff',   text: '#3730a3', border: '#a5b4fc'       },
  entregada:  { bg: C.successBg, text: C.success, border: C.successBorder },
  cancelada:  { bg: C.dangerBg,  text: C.danger,  border: C.dangerBorder  },
}[e] || { bg: C.surfaceAlt, text: C.textTer, border: C.border });

export const movimientoStyle = (t, C = LIGHT) => ({
  venta:         { bg: C.dangerBg,  text: C.danger,  border: C.dangerBorder,  signo: '-' },
  compra:        { bg: C.successBg, text: C.success, border: C.successBorder, signo: '+' },
  ajuste_manual: { bg: C.warningBg, text: C.warning, border: C.warningBorder, signo: '±' },
  devolucion:    { bg: C.infoBg,    text: C.info,    border: C.infoBorder,    signo: '+' },
  ajuste:        { bg: C.warningBg, text: C.warning, border: C.warningBorder, signo: '±' },
}[t] || { bg: C.surfaceAlt, text: C.textTer, border: C.border, signo: '·' });
