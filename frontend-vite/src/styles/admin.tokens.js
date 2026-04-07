// src/styles/admin.tokens.js
// Token system — Victoria Pecuarios Admin
// import { T, fmt, fmtShort, fdoc, estadoStyle, movimientoStyle } from '../styles/admin.tokens'

export const T = {
  canvas:"#f6f7f4", surface:"#ffffff", surfaceAlt:"#f2f3ef", surfaceHover:"#ebf2eb",
  sidebar:"#0c180c", sidebarBorder:"#1a2e1a", sidebarActive:"#162a16",
  sidebarText:"#7aa87a", sidebarTextHi:"#c4dcc4",
  brand:"#1a5c1a", brandMid:"#2d7a2d", brandLight:"#e6f3e6", brandBorder:"#b4d9b4",
  gold:"#b08a24", goldBg:"#fdf8eb", goldBorder:"#cca83a",
  text:"#191c18", textSec:"#48524a", textTer:"#788078", textMuted:"#a8b2a8",
  border:"rgba(0,0,0,0.07)", borderSub:"rgba(0,0,0,0.04)", borderStr:"rgba(0,0,0,0.12)",
  success:"#14532d", successBg:"#dcfce7", successBorder:"#86efac",
  warning:"#78350f", warningBg:"#fef3c7", warningBorder:"#fcd34d",
  danger:"#7f1d1d",  dangerBg:"#fee2e2",  dangerBorder:"#fca5a5",
  info:"#1e3a8a",    infoBg:"#dbeafe",    infoBorder:"#93c5fd",
};

export const shadow = {
  sm:"0 1px 2px rgba(0,0,0,0.05)",
  md:"0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  modal:"0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
};

export const font = {
  display:"'Playfair Display', Georgia, serif",
  mono:"'JetBrains Mono', 'Fira Code', monospace",
};

export const fmt = (n) =>
  new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(Number(n)||0);

export const fmtShort = (n) => {
  const v = Number(n)||0;
  if(v>=1_000_000) return `$${(v/1_000_000).toFixed(1)}M`;
  if(v>=1_000)     return `$${(v/1_000).toFixed(0)}k`;
  return `$${v}`;
};

export const fdoc = (d) =>
  new Date(d).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"});

export const estadoStyle = (e) => ({
  pendiente: {bg:T.warningBg, text:T.warning, border:T.warningBorder},
  pagada:    {bg:T.infoBg,    text:T.info,    border:T.infoBorder},
  procesando:{bg:"#f3e8ff",   text:"#6b21a8", border:"#d8b4fe"},
  enviada:   {bg:"#e0e7ff",   text:"#3730a3", border:"#a5b4fc"},
  entregada: {bg:T.successBg, text:T.success, border:T.successBorder},
  cancelada: {bg:T.dangerBg,  text:T.danger,  border:T.dangerBorder},
}[e]||{bg:T.surfaceAlt, text:T.textTer, border:T.border});

export const movimientoStyle = (t) => ({
  venta:        {bg:T.dangerBg,  text:T.danger,  border:T.dangerBorder,  signo:"-"},
  compra:       {bg:T.successBg, text:T.success, border:T.successBorder, signo:"+"},
  ajuste_manual:{bg:T.warningBg, text:T.warning, border:T.warningBorder, signo:"±"},
  devolucion:   {bg:T.infoBg,    text:T.info,    border:T.infoBorder,    signo:"+"},
  ajuste:       {bg:T.warningBg, text:T.warning, border:T.warningBorder, signo:"±"},
}[t]||{bg:T.surfaceAlt, text:T.textTer, border:T.border, signo:"·"});