// src/styles/admin.tokens.js
// Token system — Victoria Pets
// import { T, fmt, fmtShort, fdoc, estadoStyle, movimientoStyle } from '../styles/admin.tokens'

export const T = {
  // Superficies — Green-breath canvas, firma VP
  canvas:       "#F5FAF7",
  surface:      "#ffffff",
  surfaceAlt:   "#EDF6F1",
  surfaceHover: "#dff0e6",

  // Sidebar — bosque profundo, identidad clínica inmediata
  sidebar:       "#064E30",
  sidebarBorder: "#0a5c38",
  sidebarActive: "#0A6B40",
  sidebarText:   "#7abf99",
  sidebarTextHi: "#c4e8d5",

  // Brand — esmeralda profundo (verde replaza azul como dominante)
  brand:       "#0A6B40",
  brandMid:    "#138553",
  brandDark:   "#064E30",
  brandLight:  "#E4F5EC",
  brandBorder: "#95CCAD",

  // CTA — verde lima VP (sin cambio)
  lime:      "#7AC143",
  limeDark:  "#5a9030",
  limeLight: "#eef7e3",

  // Texto — temperatura verde, no neutro-gris
  text:      "#101F16",
  textSec:   "#2D4A38",
  textTer:   "#5A7A65",
  textMuted: "#8FAA98",

  // Bordes
  border:    "rgba(0,0,0,0.07)",
  borderSub: "rgba(0,0,0,0.04)",
  borderStr: "rgba(0,0,0,0.12)",

  // Semánticos
  success:       "#14532d",
  successBg:     "#dcfce7",
  successBorder: "#86efac",
  warning:       "#78350f",
  warningBg:     "#fef3c7",
  warningBorder: "#fcd34d",
  danger:        "#7f1d1d",
  dangerBg:      "#fee2e2",
  dangerBorder:  "#fca5a5",
  info:          "#1B4F8A",
  infoBg:        "#dce8f7",
  infoBorder:    "#93c5fd",

  // Oro — compatibilidad Admin
  gold:       "#b08a24",
  goldBg:     "#fdf8eb",
  goldBorder: "#cca83a",
};

// Borders-only depth — sin sombras dramáticas
export const shadow = {
  sm:    "none",
  md:    "none",
  modal: "0 4px 24px rgba(0,0,0,0.08)",
};

export const font = {
  display: "'Playfair Display', Georgia, serif",
  mono:    "'JetBrains Mono', 'Fira Code', monospace",
};

export const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0 }).format(Number(n) || 0);

export const fmtShort = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
};

export const fdoc = (d) =>
  new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" });

export const estadoStyle = (e) => ({
  pendiente:  { bg:T.warningBg,  text:T.warning,  border:T.warningBorder },
  pagada:     { bg:T.infoBg,     text:T.info,     border:T.infoBorder    },
  procesando: { bg:"#f3e8ff",    text:"#6b21a8",  border:"#d8b4fe"       },
  enviada:    { bg:"#e0e7ff",    text:"#3730a3",  border:"#a5b4fc"       },
  entregada:  { bg:T.successBg,  text:T.success,  border:T.successBorder },
  cancelada:  { bg:T.dangerBg,   text:T.danger,   border:T.dangerBorder  },
}[e] || { bg:T.surfaceAlt, text:T.textTer, border:T.border });

export const movimientoStyle = (t) => ({
  venta:         { bg:T.dangerBg,  text:T.danger,  border:T.dangerBorder,  signo:"-" },
  compra:        { bg:T.successBg, text:T.success, border:T.successBorder, signo:"+" },
  ajuste_manual: { bg:T.warningBg, text:T.warning, border:T.warningBorder, signo:"±" },
  devolucion:    { bg:T.infoBg,    text:T.info,    border:T.infoBorder,    signo:"+" },
  ajuste:        { bg:T.warningBg, text:T.warning, border:T.warningBorder, signo:"±" },
}[t] || { bg:T.surfaceAlt, text:T.textTer, border:T.border, signo:"·" });
