// src/styles/admin.tokens.js — Victoria Pets Design System
// Paleta navy + lime (rediseño 2026-05).
// ThemeProvider y useTheme viven en ThemeProvider.jsx (necesitan JSX).
// IMPORTANTE: NO re-exportarlos aquí — causa dependencia circular.

/* ─── Identidad fija ─────────────────────────────────────────────────────── */
export const FONT = {
  display: '"Playfair Display", Georgia, serif',
  ui:      '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

/* Breakpoints unificados — duplicados en hooks/useMediaQuery.js
   para evitar import circular en archivos solo-JS. Si cambias uno,
   cambia el otro. */
export const BP = {
  mobile:  640,
  tablet:  1024,
  desktop: 1280,
};

/* ─── MODO CLARO — navy + lime sobre crema ───────────────────────────────── */
export const LIGHT = {
  mode: 'light',

  // Marca (navy editorial)
  brand:       '#1E3A8A',
  brandMid:    '#2C4DA0',
  brandDark:   '#0F2563',
  brandSoft:   '#E5EAFB',
  brandLight:  '#E5EAFB',      // alias legacy
  brandBorder: '#9DB1F0',

  // Acentos del diseño
  navy:        '#1E3A8A',
  navyDeep:    '#0F2563',
  lime:        '#7BC142',
  limeDark:    '#5DA328',
  limeDeep:    '#5DA328',
  limeSoft:    '#EEF7E3',
  limeLight:   '#EEF7E3',      // alias legacy
  red:         '#E63946',
  redDeep:     '#C42836',
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

  // Superficies — crema cálida
  canvas:       '#FAF7F0',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F2EDE0',
  surfaceHov:   '#EDE6D2',
  surfaceHover: '#EDE6D2',     // alias
  surfaceElev:  '#FFFFFF',

  // Sidebar (admin / cajero / vet) — navy profundo
  sidebar:       '#0F2563',
  sidebarBorder: '#1E3A8A',
  sidebarActive: '#1E3A8A',
  sidebarText:   '#9DB1F0',
  sidebarTextHi: '#D5DEFA',

  // Texto — neutro frío
  ink:       '#0A1426',
  ink2:      'rgba(10,20,38,0.72)',
  ink3:      'rgba(10,20,38,0.50)',
  inkSoft:   'rgba(10,20,38,0.72)',
  inkMuted:  'rgba(10,20,38,0.50)',
  muted:     'rgba(10,20,38,0.45)',
  text:      '#0A1426',         // alias
  textSec:   'rgba(10,20,38,0.72)',
  textTer:   'rgba(10,20,38,0.50)',
  textMuted: 'rgba(10,20,38,0.45)',
  onBrand:   '#FFFFFF',

  // Bordes
  line:        '#EAE3D2',
  lineStrong:  '#D6CDB7',
  border:      '#EAE3D2',
  borderSub:   'rgba(10,20,38,0.04)',
  borderMed:   'rgba(10,20,38,0.11)',
  borderStr:   'rgba(10,20,38,0.16)',

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
  info:          '#1E3A8A',
  infoBg:        '#DCE8F7',
  infoBorder:    '#93C5FD',

  // Oro (admin)
  gold:       '#B08A24',
  goldBg:     '#FDF8EB',
  goldBorder: '#CCA83A',

  // Morado (consultas médicas / insumos clínicos)
  purple:       '#9B5DE5',
  purpleDeep:   '#6b21a8',
  purpleSoft:   '#faf5ff',
  purpleBg:     '#f3e8ff',
  purpleBorder: '#e9d5ff',

  // Sombras
  shadowSm: '0 1px 3px rgba(10,20,38,0.04), 0 2px 8px rgba(10,20,38,0.04)',
  shadowMd: '0 4px 16px rgba(10,20,38,0.07), 0 2px 4px rgba(10,20,38,0.04)',
  shadowLg: '0 12px 32px rgba(10,20,38,0.09), 0 4px 12px rgba(10,20,38,0.05)',
  glow:     '0 0 0 4px rgba(30,58,138,0.14)',
};

/* ─── MODO OSCURO — navy profundo refinado ───────────────────────────────── */
export const DARK = {
  mode: 'dark',

  // Marca (azul vibrante sobre fondos oscuros)
  brand:       '#7BA1FF',
  brandMid:    '#5B85F0',
  brandDark:   '#0F2563',
  brandSoft:   'rgba(123,161,255,0.16)',
  brandLight:  'rgba(123,161,255,0.12)',
  brandBorder: 'rgba(123,161,255,0.32)',

  // Acentos del diseño
  navy:        '#7BA1FF',
  navyDeep:    '#0F2563',
  lime:        '#B4F26C',
  limeDark:    '#A4E36A',
  limeDeep:    '#A4E36A',
  limeSoft:    'rgba(180,242,108,0.14)',
  limeLight:   'rgba(180,242,108,0.10)',
  red:         '#FB7185',
  redDeep:     '#E63946',
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

  // Superficies — navy oscuro estratificado
  canvas:       '#0A0F1F',
  surface:      '#141A2E',
  surfaceAlt:   '#0E1426',
  surfaceHov:   '#1B2342',
  surfaceHover: '#1B2342',
  surfaceElev:  '#1A2238',

  // Sidebar
  sidebar:       '#06091A',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  sidebarActive: 'rgba(123,161,255,0.16)',
  sidebarText:   '#9AAAD1',
  sidebarTextHi: '#EAEFFA',

  // Texto — alto contraste
  ink:       '#FAF7F0',
  ink2:      'rgba(250,247,240,0.78)',
  ink3:      'rgba(250,247,240,0.55)',
  inkSoft:   'rgba(250,247,240,0.78)',
  inkMuted:  'rgba(250,247,240,0.55)',
  muted:     'rgba(250,247,240,0.45)',
  text:      '#FAF7F0',
  textSec:   'rgba(250,247,240,0.78)',
  textTer:   'rgba(250,247,240,0.55)',
  textMuted: 'rgba(250,247,240,0.45)',
  onBrand:   '#06091A',

  // Bordes
  line:        'rgba(255,255,255,0.10)',
  lineStrong:  'rgba(255,255,255,0.18)',
  border:      'rgba(255,255,255,0.10)',
  borderSub:   'rgba(255,255,255,0.05)',
  borderMed:   'rgba(255,255,255,0.13)',
  borderStr:   'rgba(255,255,255,0.20)',

  // Semánticos
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

  // Morado
  purple:       '#C084FC',
  purpleDeep:   '#A855F7',
  purpleSoft:   'rgba(192,132,252,0.08)',
  purpleBg:     'rgba(192,132,252,0.16)',
  purpleBorder: 'rgba(192,132,252,0.32)',

  // Sombras
  shadowSm: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
  shadowMd: '0 8px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
  shadowLg: '0 24px 56px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
  glow:     '0 0 0 4px rgba(123,161,255,0.22), 0 0 24px rgba(123,161,255,0.18)',
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
