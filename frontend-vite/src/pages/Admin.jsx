// src/pages/Admin.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LineChart, Line, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Objetivos from "../components/Objetivos.jsx";
import ReporteVentas from "./admin/ReporteVentas.jsx";
import GaleriaAdmin from "./admin/GaleriaAdmin";
import ReporteSalidas from "./admin/ReporteSalidas.jsx";
import { T, shadow, font, fmt, fmtShort, fmtMil, fdoc, estadoStyle } from "../styles/admin.tokens";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck, faCheck, faCircleCheck, faPills, faLocationDot, faCreditCard,
  faBell, faMagnifyingGlass, faSun, faMoon, faPlus,
} from "@fortawesome/free-solid-svg-icons";
import logoVP from "../assets/WhatsApp Image 2026-04-22 at 1.19.17 PM.jpeg";

// ─── Constantes ───────────────────────────────────────────────
const ESTADOS = ["pendiente","pendiente_pago","pagada","procesando","enviada","entregada","cancelada","rechazada"];
const ESTADO_LABEL = {
  pendiente:      "Pendiente",
  pendiente_pago: "Pago pendiente",
  pagada:         "Pagada",
  procesando:     "Procesando",
  enviada:        "Enviada",
  entregada:      "Entregada",
  cancelada:      "Cancelada",
  rechazada:      "Rechazada",
};

const NAV = [
  {id:"dashboard",       label:"Dashboard",     d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},
  {id:"usuarios",        label:"Usuarios",       d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"},
  {id:"productos",       label:"Productos",      d:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"},
  {id:"ordenes",         label:"Órdenes",        d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"},
  {id:"cajeros",         label:"Cajeros",        d:"M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"},
  {id:"objetivos",       label:"Objetivos",      d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"},
  {id:"reporte-ventas",  label:"Rep. ventas",    d:"M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"},
  {id:"reporte-salidas", label:"Salidas stock",  d:"M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"},
  // ── Galería de imágenes ──
  {id:"galeria",         label:"Galería",        d:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"},
  {id:"proveedores",     label:"Proveedores",    d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},
  {id:"veterinarios",    label:"Veterinarios",   d:"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"},
];

const TITULOS = {
  dashboard:"Dashboard", usuarios:"Usuarios", productos:"Productos",
  ordenes:"Órdenes", cajeros:"Cajeros", objetivos:"Objetivos",
  "reporte-ventas":"Reporte de ventas", "reporte-salidas":"Salidas de stock",
  // ── Galería ──
  galeria:"Galería de imágenes",
  proveedores:"Proveedores",
  veterinarios:"Veterinarios & Citas",
};

// ─── Componentes base ─────────────────────────────────────────
const NavIcon = ({d}) => (
  <svg className="w-[15px] h-[15px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
  </svg>
);

const Badge = ({estado}) => {
  const s = estadoStyle(estado);
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
    style={{background:s.bg,color:s.text,border:`1px solid ${s.border}`}}>{estado}</span>;
};

const Card = ({children, className=""}) => (
  <div className={`rounded-2xl ${className}`}
    style={{background:T.surface,border:`1px solid ${T.border}`,boxShadow:shadow.sm}}>
    {children}
  </div>
);

const SecTitle = ({children, sub}) => (
  <div className="mb-5">
    <h2 className="text-[15px] font-bold" style={{color:T.text,fontFamily:font.display}}>{children}</h2>
    {sub && <p className="text-xs mt-0.5" style={{color:T.textMuted}}>{sub}</p>}
    <div className="mt-2 h-0.5 w-8 rounded-full" style={{background:T.gold}}/>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-7 h-7 rounded-full animate-spin"
      style={{border:`2px solid ${T.brandLight}`,borderTopColor:T.brand}}/>
  </div>
);

const Msg = ({texto, tipo="ok"}) => !texto ? null : (
  <div className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
    style={tipo==="ok"
      ? {background:T.successBg,color:T.success,border:`1px solid ${T.successBorder}`}
      : {background:T.dangerBg, color:T.danger, border:`1px solid ${T.dangerBorder}`}}>
    {tipo==="ok"?"✓":"✕"} {texto}
  </div>
);

// Errores de campo en modal producto — inline y claro
const FieldError = ({msg}) => !msg ? null : (
  <p className="text-xs mt-1 font-medium flex items-center gap-1" style={{color:T.danger}}>
    <span>⚠</span> {msg}
  </p>
);

const Btn = ({onClick,children,variant="primary",size="sm",disabled=false,type="button"}) => {
  const sizes = {xs:"px-3 py-1.5 text-xs rounded-lg",sm:"px-4 py-2 text-xs rounded-xl",md:"px-5 py-2.5 text-sm rounded-xl"};
  const styles = {
    primary:{background:T.brand,color:"#fff",boxShadow:shadow.sm},
    outline:{background:"transparent",color:T.gold,border:`1.5px solid ${T.goldBorder}`},
    ghost:  {background:"transparent",color:T.textTer},
    danger: {background:T.danger,color:"#fff"},
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${sizes[size]}`}
      style={styles[variant]}>{children}</button>
  );
};

const Input = ({label,value,onChange,type="text",placeholder="",required=false,error=""}) => (
  <div>
    {label && <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textTer}}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all"
      style={{border:`1.5px solid ${error ? T.dangerBorder : T.border}`,background:T.surfaceAlt,color:T.text}}
      onFocus={e=>{e.target.style.borderColor=error?T.dangerBorder:T.brand; e.target.style.background=T.surface;}}
      onBlur={e=>{e.target.style.borderColor=error?T.dangerBorder:T.border; e.target.style.background=T.surfaceAlt;}}/>
    <FieldError msg={error}/>
  </div>
);

const Sel = ({label,value,onChange,children}) => (
  <div>
    {label && <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textTer}}>{label}</label>}
    <select value={value} onChange={onChange}
      className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all"
      style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}>
      {children}
    </select>
  </div>
);

const Modal = ({abierto,onClose,titulo,children,ancho="max-w-lg"}) => {
  if(!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div className={`w-full ${ancho} max-h-[90vh] overflow-y-auto rounded-2xl`}
        style={{background:T.surface,border:`1px solid ${T.border}`,boxShadow:shadow.modal}}
        onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 rounded-t-2xl"
          style={{borderBottom:`1px solid ${T.border}`,background:T.surface}}>
          <h3 className="font-bold text-sm" style={{color:T.text,fontFamily:font.display}}>{titulo}</h3>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-lg transition-colors"
            style={{color:T.textTer}}
            onMouseEnter={e=>e.target.style.background=T.surfaceAlt}
            onMouseLeave={e=>e.target.style.background="transparent"}>×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Paginacion = ({pagina,total,limite,onChange}) => {
  const tot = Math.ceil(total/limite);
  if(tot<=1) return null;
  return (
    <div className="flex items-center justify-between pt-4 mt-2" style={{borderTop:`1px solid ${T.border}`}}>
      <span className="text-xs" style={{color:T.textMuted}}>{total} registros · pág {pagina}/{tot}</span>
      <div className="flex gap-1.5">
        <Btn variant="outline" size="xs" disabled={pagina===1} onClick={()=>onChange(pagina-1)}>←</Btn>
        <Btn variant="outline" size="xs" disabled={pagina===tot} onClick={()=>onChange(pagina+1)}>→</Btn>
      </div>
    </div>
  );
};

const THead = ({cols}) => (
  <thead>
    <tr style={{borderBottom:`1px solid ${T.border}`,background:T.surfaceAlt}}>
      {cols.map(c=>(
        <th key={c} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
          style={{color:T.textTer}}>{c}</th>
      ))}
    </tr>
  </thead>
);

// ─── DASHBOARD ────────────────────────────────────────────────
function SparkLine({ data, dataKey, color, height=36 }) {
  const { C: T } = useTheme();
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{top:2,right:0,bottom:0,left:0}}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartTooltip({ active, payload, label }) {
  const { C: T } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:shadow.sm }}>
      <p style={{ color:T.textMuted, marginBottom:6, fontSize:10, textTransform:"uppercase", letterSpacing:0.8 }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:i < payload.length-1 ? 4 : 0 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.color, display:"block", flexShrink:0 }}/>
          <span style={{ color:T.textSec, fontSize:11 }}>{p.name}:</span>
          <span style={{ color:T.text, fontWeight:700, fontFamily:"monospace" }}>
            {p.name === "Ingresos" ? fmtShort(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { C: T } = useTheme();
  const [stats,    setStats]    = useState(null);
  const [citas,    setCitas]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);
  const [rango,    setRango]    = useState("15d");

  const cargar = () => {
    setCargando(true); setError(null);
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/citas/stats").catch(() => ({ data: {} })),
    ])
    .then(([s, c]) => {
      setStats(s.data);
      const d = c.data || {};
      setCitas({
        total:       Number(d.total       ?? 0),
        pendientes:  Number(d.pendientes  ?? 0),
        confirmadas: Number(d.confirmadas ?? 0),
        completadas: Number(d.completadas ?? 0),
        hoy:         Number(d.hoy         ?? 0),
      });
    })
    .catch(err => setError(err.response?.data?.error || "Error al cargar el dashboard"))
    .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  if (cargando) return <Spinner/>;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{background:T.dangerBg}}>⚠️</div>
      <p className="text-sm font-semibold" style={{color:T.danger}}>{error}</p>
      <p className="text-xs max-w-xs" style={{color:T.textMuted}}>Verifica que el backend esté corriendo y que hayas ejecutado las migraciones en phpMyAdmin</p>
      <Btn onClick={cargar}>Reintentar</Btn>
    </div>
  );
  if (!stats) return null;

  // ── PDF style dashboard ─────────────────────────────────────────
  // Saludo según hora
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
  const nombre = stats.admin_nombre || "Andrea";

  // Datos de gráfica
  const allData = (stats.ventas_mes||[]).map(m => ({
    mes:     m.mes?.slice(5) || m.mes,
    ventas:  Number(m.total   || 0),
    ordenes: Number(m.ordenes || 0),
    ganancia:Number(m.ganancia|| 0),
  }));
  // Mapeo de rangos del PDF (7d/15d/30d/90d) a meses disponibles
  const mesesRango = rango === "7d" ? 1 : rango === "30d" ? 1 : rango === "90d" ? 3 : 1;
  const chartData = allData.slice(-Math.max(mesesRango, 6));

  // Calcular promedios para reference lines
  const avgVentas  = chartData.length ? Math.round(chartData.reduce((a,b) => a + b.ventas,  0) / chartData.length) : 0;
  const avgOrdenes = chartData.length ? Math.round(chartData.reduce((a,b) => a + b.ordenes, 0) / chartData.length) : 0;

  // Tendencia (último mes vs anterior)
  const tendVentas = chartData.length >= 2
    ? ((chartData[chartData.length-1].ventas - chartData[chartData.length-2].ventas) / Math.max(chartData[chartData.length-2].ventas,1) * 100).toFixed(1)
    : null;

  const metrics = [
    { label:"Clientes",   value: stats.total_usuarios  ?? 0,   accent:T.brand,    bg:`${T.brand}12`,   icon:"👥", spark: null },
    { label:"Productos",  value: stats.total_productos ?? 0,   accent:T.brandMid, bg:`${T.brandMid}12`,icon:"📦", spark: null },
    { label:"Órdenes",    value: stats.total_ordenes   ?? 0,   accent:T.gold,     bg:`${T.gold}12`,    icon:"🛒", spark: chartData.map(d=>({v:d.ordenes})) },
    { label:"Ingresos",   value: fmtShort(stats.ingresos),     accent:"#10b981",  bg:"#10b98112",      icon:"💰", spark: chartData.map(d=>({v:d.ventas})) },
    { label:"Stock bajo", value: stats.stock_bajo ?? 0,        accent:"#dc2626",  bg:"#dc262612",      icon:"⚠️", spark: null },
  ];

  const metricsCitas = citas ? [
    { label:"Total",      value: citas.total,       accent:"#7c3aed", bg:"#7c3aed12" },
    { label:"Pendientes", value: citas.pendientes,  accent:"#d97706", bg:"#d9770612" },
    { label:"Confirmadas",value: citas.confirmadas, accent:T.info,    bg:`${T.info}12` },
    { label:"Completadas",value: citas.completadas, accent:T.success, bg:`${T.success}12` },
    { label:"Hoy",        value: citas.hoy,         accent:T.brand,   bg:`${T.brand}12` },
  ] : [];

  const RANGOS = [
    { id:"7d",  label:"7d"  },
    { id:"15d", label:"15d" },
    { id:"30d", label:"30d" },
    { id:"90d", label:"90d" },
  ];

  // Datos del PDF — KPIs (todos REALES del backend)
  const tendenciaHoyRaw = stats.tendencia_hoy;
  const KPIs_PDF = [
    {
      label: "Ventas hoy",
      value: fmtShort(stats.ventas_hoy || 0),
      tendencia: tendenciaHoyRaw,
      sub: `${stats.ventas_hoy_count || 0} transacciones`,
      color: T.brand,
      spark: chartData.length > 1 ? chartData.map(d => ({ v: d.ventas })) : null,
      sparkColor: T.brand,
    },
    {
      label: "Tienda online",
      value: fmtShort(stats.ventas_online_hoy || 0),
      tendencia: null,
      sub: `${stats.pedidos_online_pendientes || 0} pedidos pendientes`,
      color: T.success,
      spark: chartData.length > 1 ? chartData.map(d => ({ v: d.ventas })) : null,
      sparkColor: T.success,
    },
    {
      label: "Citas agendadas",
      value: stats.citas_total ?? citas?.total ?? 0,
      tendencia: null,
      sub: `${stats.citas_hoy ?? 0} hoy · ${stats.citas_pendientes ?? 0} sin confirmar`,
      color: T.info,
      spark: chartData.length > 1 ? chartData.map(d => ({ v: d.ordenes })) : null,
      sparkColor: T.info,
    },
    {
      label: "Stock crítico",
      value: stats.stock_bajo || 0,
      tendencia: null,
      sub: "Reorden requerido",
      color: T.danger,
      spark: null,
      tag: "productos",
    },
  ];

  // Ventas por canal — DATOS REALES del backend
  const canalData = stats.ventas_canal || { pos: 0, online: 0, servicios: 0 };
  const totalCanales = canalData.pos + canalData.online + canalData.servicios;
  const canales = [
    {
      label: "Tienda física (POS)",
      valor: canalData.pos,
      porc:  totalCanales > 0 ? Math.round((canalData.pos / totalCanales) * 100) : 0,
      color: T.brand,
    },
    {
      label: "Tienda online",
      valor: canalData.online,
      porc:  totalCanales > 0 ? Math.round((canalData.online / totalCanales) * 100) : 0,
      color: T.success,
    },
    {
      label: "Servicios médicos",
      valor: canalData.servicios,
      porc:  totalCanales > 0 ? Math.round((canalData.servicios / totalCanales) * 100) : 0,
      color: T.coral,
    },
  ];
  const ticketPromedio = stats.ticket_promedio || 0;

  const ordenesRecientes = (stats.ordenes_recientes || []).slice(0, 5);
  const stockBajo = (stats.productos_stock_bajo || []).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 4 }}>

      {/* ── KPIs PDF (4 grandes con sparklines) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
      }}>
        {KPIs_PDF.map(kpi => (
          <div key={kpi.label} style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 18,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: T.textTer }}>
                {kpi.label}
              </p>
              {kpi.spark && kpi.spark.length > 1 && (
                <div style={{ width: 70, height: 28, marginLeft: 8 }}>
                  <SparkLine data={kpi.spark} dataKey="v" color={kpi.sparkColor} height={28}/>
                </div>
              )}
            </div>
            <div style={{
              fontFamily: font.display,
              fontWeight: 700, fontSize: 28,
              color: T.text, letterSpacing: -0.5,
              marginBottom: 6, lineHeight: 1.1,
            }}>
              {kpi.value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.textTer, flexWrap: "wrap" }}>
              {kpi.tendencia && (
                <span style={{
                  padding: "2px 7px", borderRadius: 999,
                  background: kpi.tendencia.startsWith("+") || kpi.tendencia.startsWith("▲") ? T.successBg : T.dangerBg,
                  color: kpi.tendencia.startsWith("+") || kpi.tendencia.startsWith("▲") ? T.success : T.danger,
                  fontSize: 10, fontWeight: 700,
                }}>
                  {kpi.tendencia.startsWith("-") ? "▼" : "▲"} {kpi.tendencia.replace(/[+%▲▼]/g, "")}%
                </span>
              )}
              {kpi.tag && (
                <span style={{
                  padding: "2px 8px", borderRadius: 6,
                  background: T.coralSoft, color: T.coral,
                  fontSize: 10, fontWeight: 700,
                }}>
                  {kpi.tag}
                </span>
              )}
              <span>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Fila chart + canales ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 16,
      }} className="vp-admin-row">

        {/* Chart ingresos */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 22,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: T.textTer, fontWeight: 500 }}>
                Ingresos · últimos {rango === "7d" ? 7 : rango === "15d" ? 15 : rango === "30d" ? 30 : 90} días
              </p>
              <div style={{
                marginTop: 6,
                fontFamily: font.display,
                fontWeight: 700, fontSize: 30,
                color: T.text, letterSpacing: -0.5,
              }}>
                {fmtShort(chartData.reduce((a, b) => a + b.ventas, 0))}
              </div>
            </div>
            <div style={{
              display: "inline-flex",
              borderRadius: 8, overflow: "hidden",
              border: `1px solid ${T.border}`,
            }}>
              {RANGOS.map(r => {
                const activo = rango === r.id;
                return (
                  <button key={r.id} onClick={() => setRango(r.id)} style={{
                    padding: "6px 12px",
                    fontSize: 11, fontWeight: 600,
                    background: activo ? T.text : "transparent",
                    color: activo ? T.canvas : T.textTer,
                    border: "none", cursor: "pointer",
                    fontFamily: font.mono,
                  }}>{r.label}</button>
                );
              })}
            </div>
          </div>

          {chartData.length === 0 ? (
            <p style={{ textAlign: "center", padding: 40, color: T.textMuted, fontSize: 13 }}>
              Sin datos registrados aún
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gIngresosPDF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.success} stopOpacity={0.18}/>
                    <stop offset="100%" stopColor={T.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.borderSub} vertical={false}/>
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 9, fill: T.textMuted }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtMil(v)} width={45}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Area type="monotone" dataKey="ventas"
                  stroke={T.success} strokeWidth={2} fill="url(#gIngresosPDF)"
                  dot={false} activeDot={{ r: 4, fill: T.success, stroke: "#fff", strokeWidth: 2 }}/>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ventas por canal */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 22,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 11, color: T.textTer, fontWeight: 500 }}>
              Ventas por canal
            </p>
            <p style={{ margin: 0, fontSize: 11, color: T.textMuted, fontFamily: font.mono }}>
              hoy
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
            {canales.map(c => (
              <div key={c.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{c.label}</span>
                  <span style={{ fontSize: 12, color: T.text, fontWeight: 700, fontFamily: font.mono }}>
                    {fmtShort(c.valor)}
                  </span>
                </div>
                <div style={{
                  width: "100%", height: 4, borderRadius: 2,
                  background: T.surfaceAlt, overflow: "hidden",
                }}>
                  <div style={{
                    width: `${c.porc}%`, height: "100%",
                    background: c.color,
                    transition: "width 0.6s",
                  }}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            paddingTop: 14, borderTop: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
          }}>
            <span style={{ fontSize: 12, color: T.textTer }}>Ticket promedio</span>
            <span style={{
              fontFamily: font.mono,
              fontSize: 14, fontWeight: 700,
              color: T.text,
            }}>
              {fmtShort(ticketPromedio)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Pedidos recientes + Stock bajo ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 16,
      }} className="vp-admin-row">

        {/* Pedidos recientes */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 22,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{
              margin: 0,
              fontFamily: font.display, fontStyle: "italic",
              fontWeight: 600, fontSize: 18, color: T.text,
            }}>
              Pedidos recientes
            </h3>
            <a href="#" onClick={e => e.preventDefault()} style={{
              fontSize: 11, color: T.brand,
              textDecoration: "none", fontWeight: 600,
            }}>
              Ver todos →
            </a>
          </div>

          {ordenesRecientes.length === 0 ? (
            <p style={{ textAlign: "center", padding: 30, color: T.textMuted, fontSize: 13 }}>
              Sin órdenes recientes
            </p>
          ) : (
            <div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 50px 100px 110px",
                gap: 10,
                padding: "10px 4px",
                borderBottom: `1px solid ${T.border}`,
                fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 1.2,
                color: T.textTer,
              }}>
                <span>Pedido</span>
                <span>Cliente</span>
                <span>Items</span>
                <span style={{ textAlign: "right" }}>Total</span>
                <span>Estado</span>
              </div>
              {ordenesRecientes.map(o => (
                <div key={o.id} style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 50px 100px 110px",
                  gap: 10,
                  padding: "12px 4px",
                  borderBottom: `1px solid ${T.borderSub}`,
                  alignItems: "center",
                  fontSize: 12,
                }}>
                  <span style={{ fontFamily: font.mono, color: T.text, fontWeight: 600 }}>
                    #{o.codigo}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: T.coral, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, flexShrink: 0,
                    }}>
                      {(o.cliente_nombre?.[0] || "U").toUpperCase()}{(o.cliente_apellido?.[0] || "").toUpperCase()}
                    </span>
                    <span style={{
                      color: T.text,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {o.cliente_nombre} {o.cliente_apellido}
                    </span>
                  </div>
                  <span style={{ color: T.textTer, fontFamily: font.mono }}>
                    {o.cantidad_items || 1}
                  </span>
                  <span style={{ color: T.text, fontWeight: 700, fontFamily: font.mono, textAlign: "right" }}>
                    {fmtShort(o.total)}
                  </span>
                  <Badge estado={o.estado}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 22,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{
              margin: 0,
              fontFamily: font.display, fontStyle: "italic",
              fontWeight: 600, fontSize: 18, color: T.text,
            }}>
              Stock bajo
            </h3>
            <span style={{
              padding: "2px 8px", borderRadius: 6,
              background: T.coralSoft, color: T.coral,
              fontSize: 10, fontWeight: 700,
            }}>
              {stockBajo.length} productos
            </span>
          </div>

          {stockBajo.length === 0 ? (
            <p style={{ textAlign: "center", padding: 30, color: T.textMuted, fontSize: 13 }}>
              Sin productos con stock crítico
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {stockBajo.map(p => {
                const min = p.stock_minimo || 5;
                const max = min * 10;
                const porc = Math.min(100, Math.round((p.stock / max) * 100));
                const danger = p.stock <= min;
                return (
                  <div key={p.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        {p.marca && (
                          <p style={{
                            margin: 0, fontSize: 9, fontWeight: 700,
                            color: T.textMuted, textTransform: "uppercase", letterSpacing: 1.2,
                            fontFamily: font.mono,
                          }}>
                            {p.marca}
                          </p>
                        )}
                        <p style={{
                          margin: 0, fontSize: 12, fontWeight: 600, color: T.text,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {p.nombre}
                        </p>
                      </div>
                      <span style={{
                        marginLeft: 10,
                        fontSize: 12, fontWeight: 700,
                        color: danger ? T.danger : T.warning,
                        fontFamily: font.mono,
                        whiteSpace: "nowrap",
                      }}>
                        {p.stock}/{max}
                      </span>
                    </div>
                    <div style={{
                      width: "100%", height: 4, borderRadius: 2,
                      background: T.surfaceAlt, overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${porc}%`, height: "100%",
                        background: danger ? T.danger : T.warning,
                        transition: "width 0.6s",
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .vp-admin-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Dashboard antiguo (deshabilitado) ─────────────────────────
function DashboardLegacy() {
  const { C: T } = useTheme();
  const stats = {};
  const citas = {};
  const chartData = [];
  const avgVentas = 0;
  const avgOrdenes = 0;
  const tendVentas = null;
  const metrics = [];
  const metricsCitas = [];
  const RANGOS = [];
  const rango = "6m";
  const setRango = () => {};
  const mesesRango = 6;
  return (
    <div style={{display:"none"}}>

      {/* ── FILA 1: Métricas KPI con sparklines ── */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {metrics.map(({label,value,accent,bg,icon,spark}) => (
          <Card key={label} className="p-4 hover:scale-[1.01] transition-transform duration-150 cursor-default overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{background:bg, border:`1px solid ${accent}22`}}>
                {icon}
              </div>
              {tendVentas && (label==="Ingresos") && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{background: Number(tendVentas)>=0 ? T.successBg : T.dangerBg, color: Number(tendVentas)>=0 ? T.success : T.danger}}>
                  {Number(tendVentas)>=0 ? "▲" : "▼"} {Math.abs(Number(tendVentas))}%
                </span>
              )}
            </div>
            <p className="text-xl font-bold tabular-nums leading-none" style={{color:T.text,fontFamily:font.mono}}>{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-1 mb-2" style={{color:T.textMuted}}>{label}</p>
            {spark && spark.length > 1 && (
              <SparkLine data={spark} dataKey="v" color={accent} height={32}/>
            )}
          </Card>
        ))}
      </div>

      {/* ── FILA 2: Gráfica de rendimiento ── */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <SecTitle sub={`Período: últimos ${mesesRango} meses · Ingresos reales (órdenes no canceladas)`}>Rendimiento del negocio</SecTitle>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold tabular-nums" style={{color:T.text,fontFamily:font.mono}}>
                {fmtShort(chartData.reduce((a,b)=>a+b.ventas,0))}
              </p>
              {tendVentas && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{background: Number(tendVentas)>=0 ? T.successBg : T.dangerBg, color: Number(tendVentas)>=0 ? T.success : T.danger}}>
                  {Number(tendVentas)>=0 ? "▲" : "▼"} {Math.abs(Number(tendVentas))}%
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {[{color:T.brand,label:"Ingresos"},{color:T.gold,label:"Órdenes"}].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span style={{width:10,height:3,borderRadius:2,background:l.color,display:"block"}}/>
                  <span style={{fontSize:10,color:T.textTer,fontWeight:600}}>{l.label}</span>
                </div>
              ))}
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{border:`1.5px solid ${T.border}`}}>
              {RANGOS.map(r => (
                <button key={r.id} onClick={() => setRango(r.id)}
                  className="px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: rango===r.id ? T.brand : "transparent",
                    color:      rango===r.id ? "#fff" : T.textTer,
                  }}>{r.label}</button>
              ))}
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="text-sm text-center py-12" style={{color:T.textMuted}}>Sin datos registrados aún</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData} margin={{top:10,right:10,bottom:0,left:0}}>
              <defs>
                <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={T.brand} stopOpacity={0.15}/>
                  <stop offset="100%" stopColor={T.brand} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderSub} vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="ventas" tick={{fontSize:10,fill:T.textMuted}} axisLine={false} tickLine={false}
                tickFormatter={v => fmtMil(v)} width={56}/>
              <YAxis yAxisId="ordenes" orientation="right" tick={{fontSize:10,fill:T.textMuted}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip content={<ChartTooltip/>}/>
              <ReferenceLine yAxisId="ventas" y={avgVentas} stroke={T.border} strokeDasharray="4 4"
                label={{value:"Prom.",fill:T.textMuted,fontSize:9,position:"insideTopLeft"}}/>
              <Area yAxisId="ventas" type="monotone" dataKey="ventas"
                stroke={T.brand} strokeWidth={2.5} fill="url(#gIngresos)"
                dot={false} activeDot={{r:4,fill:T.brand,stroke:"#fff",strokeWidth:2}} name="Ingresos"/>
              <Line yAxisId="ordenes" type="monotone" dataKey="ordenes"
                stroke={T.gold} strokeWidth={1.5} dot={{r:3,fill:T.gold,stroke:"#fff",strokeWidth:1.5}}
                activeDot={{r:5,fill:T.gold,stroke:"#fff",strokeWidth:1.5}} name="Órdenes"/>
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {chartData.length > 0 && (
          <div className="grid grid-cols-4 gap-0 mt-4 pt-4" style={{borderTop:`1px solid ${T.border}`}}>
            {[
              { label:"Ingreso prom./mes", value:fmtShort(avgVentas),  color:T.brand },
              { label:"Órd. prom./mes",   value:avgOrdenes,            color:T.gold },
              { label:"Mejor mes",        value:fmtShort(Math.max(...chartData.map(d=>d.ventas))), color:T.success },
              { label:"Tendencia",        value:tendVentas ? `${Number(tendVentas)>0?"+":""}${tendVentas}%` : "—", color: Number(tendVentas)>=0?T.success:T.danger },
            ].map((m,i) => (
              <div key={m.label} className="text-center"
                style={{borderRight: i<3?`1px solid ${T.border}`:"none", padding:"6px 10px"}}>
                <p className="text-xs font-bold tabular-nums" style={{color:m.color,fontFamily:font.mono}}>{m.value}</p>
                <p style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── FILA 3: KPIs mes + citas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(stats.ganancia_mes != null || stats.iva_mes != null) && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <SecTitle sub={new Date().toLocaleDateString("es-CO",{month:"long",year:"numeric"})}>Este mes</SecTitle>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Ganancia",    value:fmtShort(stats.ganancia_mes||0), color:T.success, bg:T.successBg,  icon:"📈" },
                { label:"IVA (19%)",   value:fmtShort(stats.iva_mes||0),      color:T.info,    bg:T.infoBg,     icon:"🧾" },
                { label:"Ingresos",    value:fmtShort(stats.ingresos||0),     color:T.brand,   bg:T.brandLight, icon:"💰" },
                { label:"Órdenes hoy", value: stats.ordenes_recientes?.filter(o=>{
                    const hoy = new Date().toISOString().split("T")[0];
                    return o.created_at?.startsWith(hoy);
                  }).length ?? "—", color:T.gold, bg:T.goldBg, icon:"🛒" },
              ].map(k => (
                <div key={k.label} className="rounded-xl px-3 py-3 flex items-center gap-3"
                  style={{background:k.bg, border:`1px solid ${k.color}22`}}>
                  <span className="text-xl flex-shrink-0">{k.icon}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{color:k.color,opacity:0.8}}>{k.label}</p>
                    <p className="text-sm font-bold tabular-nums leading-none mt-0.5" style={{color:k.color,fontFamily:font.mono}}>{k.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {citas && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <SecTitle sub="Estado general">Citas veterinarias</SecTitle>
              {citas.pendientes > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{background:"#fef3c7", color:"#92400e"}}>
                  ⚠ {citas.pendientes} por confirmar
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metricsCitas.map(k => (
                <div key={k.label} className="rounded-xl px-3 py-3 flex items-center gap-3"
                  style={{background:k.bg, border:`1px solid ${k.accent}22`}}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{background:`${k.accent}22`}}>
                    <span style={{color:k.accent, fontSize:12, fontWeight:800}}>{k.value}</span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{color:k.accent, opacity:0.85}}>{k.label}</p>
                </div>
              ))}
            </div>
            {citas.total > 0 && (
              <div className="mt-4 pt-4" style={{borderTop:`1px solid ${T.border}`}}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs" style={{color:T.textMuted}}>Tasa completadas</p>
                  <p className="text-xs font-bold tabular-nums" style={{color:T.text,fontFamily:font.mono}}>
                    {Math.round((citas.completadas/citas.total)*100)}%
                  </p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{background:T.border}}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{width:`${Math.round((citas.completadas/citas.total)*100)}%`, background:`linear-gradient(90deg,${T.brand},#10b981)`}}/>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ── FILA 4: Órdenes recientes + Stock crítico + Citas pendientes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <SecTitle sub="Últimas transacciones">Órdenes recientes</SecTitle>
          {!stats.ordenes_recientes?.length
            ? <p className="text-sm text-center py-8" style={{color:T.textMuted}}>Sin órdenes aún</p>
            : <div className="space-y-1.5">
                {stats.ordenes_recientes.slice(0,6).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 px-3 rounded-xl"
                    style={{background:T.surfaceAlt,border:`1px solid ${T.borderSub}`}}>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate" style={{color:T.brand,fontFamily:font.mono}}>{o.codigo}</p>
                      <p className="text-xs truncate" style={{color:T.textMuted}}>{o.cliente}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                      <p className="text-xs font-bold tabular-nums" style={{color:T.text,fontFamily:font.mono}}>{fmt(o.total)}</p>
                      <Badge estado={o.estado}/>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>

        <Card className="p-5">
          <SecTitle sub="Productos por reponer">Stock crítico</SecTitle>
          {!stats.productos_stock_bajo?.length
            ? <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base" style={{background:T.successBg}}>✓</div>
                <p className="text-sm font-medium" style={{color:T.success}}>Todo el stock está bien</p>
              </div>
            : <div className="space-y-1.5">
                {stats.productos_stock_bajo.map(p => (
                  <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-xl"
                    style={{background:T.dangerBg,border:`1px solid ${T.dangerBorder}`}}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{color:T.text}}>{p.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full" style={{background:T.border}}>
                          <div className="h-full rounded-full"
                            style={{width:`${Math.min(100,Math.round((p.stock/Math.max(p.stock_minimo,1))*100))}%`,background:T.danger}}/>
                        </div>
                        <span className="text-xs font-bold tabular-nums flex-shrink-0"
                          style={{color:T.danger,fontFamily:font.mono}}>{p.stock}/{p.stock_minimo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>

        <Card className="p-5">
          <SecTitle sub="Esperan confirmación">Citas pendientes</SecTitle>
          {!citas || citas.pendientes === 0
            ? <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base" style={{background:T.successBg}}>✓</div>
                <p className="text-sm font-medium" style={{color:T.success}}>Sin citas pendientes</p>
              </div>
            : <div className="space-y-1.5">
                {[
                  { label:"Pendientes de confirmar", val:citas.pendientes, color:"#d97706", bg:"#fef3c7" },
                  { label:"Confirmadas",             val:citas.confirmadas,color:T.info,    bg:T.infoBg },
                  { label:"Citas hoy",               val:citas.hoy,        color:T.brand,   bg:T.brandLight },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                    style={{background:r.bg, border:`1px solid ${r.color}22`}}>
                    <p className="text-xs font-medium" style={{color:r.color}}>{r.label}</p>
                    <p className="text-sm font-bold tabular-nums" style={{color:r.color,fontFamily:font.mono}}>{r.val}</p>
                  </div>
                ))}
                <button className="w-full text-xs font-semibold py-2 mt-1 rounded-xl transition-colors"
                  style={{background:T.brandLight, color:T.brand, border:`1px solid ${T.brandBorder}`}}>
                  Ver panel veterinario →
                </button>
              </div>
          }
        </Card>
      </div>

    </div>
  );
}

// ─── USUARIOS ─────────────────────────────────────────────────
function Usuarios() {
  const { C: T } = useTheme();
  const [lista,setLista]=useState([]); const [total,setTotal]=useState(0);
  const [pagina,setPagina]=useState(1); const [buscar,setBuscar]=useState("");
  const [cargando,setCargando]=useState(true);
  const [detalle,setDetalle]=useState(null); const [editando,setEditando]=useState(null);
  const [formEdit,setFormEdit]=useState({}); const [modalPwd,setModalPwd]=useState(null);
  const [nuevaPwd,setNuevaPwd]=useState(""); const [msg,setMsg]=useState({});

  const cargar = useCallback(async()=>{
    setCargando(true);
    try{ const {data}=await api.get(`/admin/usuarios?pagina=${pagina}&buscar=${buscar}&limite=12`);
      setLista(data.usuarios); setTotal(data.total); }
    finally{setCargando(false);}
  },[pagina,buscar]);

  useEffect(()=>{cargar();},[cargar]);
  const showMsg=(texto,tipo="ok")=>{setMsg({texto,tipo});setTimeout(()=>setMsg({}),3000);};
  const abrirDetalle=async(id)=>{const{data}=await api.get(`/admin/usuarios/${id}`);setDetalle(data);};
  const abrirEditar=(u)=>{
    setFormEdit({nombre:u.nombre,apellido:u.apellido,email:u.email,
      telefono:u.telefono||"",tipo_documento:u.tipo_documento,
      numero_documento:u.numero_documento||"",rol:u.rol});
    setEditando(u);
  };
  const guardarEditar=async()=>{
    await api.put(`/admin/usuarios/${editando.id}`,formEdit);
    showMsg("Usuario actualizado."); setEditando(null); cargar();
  };
  const cambiarPwd=async()=>{
    if(nuevaPwd.length<6) return;
    await api.patch(`/admin/usuarios/${modalPwd.id}/password`,{nueva_password:nuevaPwd});
    showMsg("Contraseña actualizada."); setModalPwd(null); setNuevaPwd("");
  };
  const toggleActivo=async(u)=>{await api.put(`/admin/usuarios/${u.id}`,{activo:u.activo?0:1});cargar();};
  const fe=k=>e=>setFormEdit({...formEdit,[k]:e.target.value});

  const rolSt=(rol)=>({
    superadmin:{bg:"#f3e8ff",text:"#6b21a8",border:"#d8b4fe"},
    admin:{bg:T.infoBg,text:T.info,border:T.infoBorder},
    cliente:{bg:T.surfaceAlt,text:T.textTer,border:T.border},
  }[rol]||{bg:T.surfaceAlt,text:T.textTer,border:T.border});

  return (
    <div className="space-y-5">
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <div className="flex gap-3 items-center justify-between flex-wrap">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:T.textMuted}}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={buscar} placeholder="Buscar nombre, email, documento..."
            onChange={e=>{setBuscar(e.target.value);setPagina(1);}}
            className="pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none w-72"
            style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}/>
        </div>
        <span className="text-xs font-medium" style={{color:T.textMuted}}>{total} usuarios</span>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Usuario","Documento","Email","Teléfono","Rol","Estado","Acciones"]}/>
            <tbody>
              {cargando ? <tr><td colSpan={7}><Spinner/></td></tr>
              : lista.length===0 ? <tr><td colSpan={7} className="text-center py-16 text-sm" style={{color:T.textMuted}}>Sin usuarios</td></tr>
              : lista.map((u,i)=>{
                const rs=rolSt(u.rol);
                return (
                  <tr key={u.id} className="transition-colors"
                    style={{borderBottom:`1px solid ${T.borderSub}`,background:i%2===0?T.surface:T.surfaceAlt}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?T.surface:T.surfaceAlt}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{background:`linear-gradient(135deg,${T.brand},${T.brandMid})`}}>
                          {u.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{color:T.text}}>{u.nombre} {u.apellido}</p>
                          <p className="text-xs" style={{color:T.textMuted}}>#{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textSec}}>{u.tipo_documento} {u.numero_documento||"—"}</td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textSec}}>{u.email}</td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textTer}}>{u.telefono||"—"}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={{background:rs.bg,color:rs.text,border:`1px solid ${rs.border}`}}>{u.rol}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={()=>toggleActivo(u)}
                        className="px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors"
                        style={u.activo
                          ?{background:T.successBg,color:T.success,borderColor:T.successBorder}
                          :{background:T.dangerBg,color:T.danger,borderColor:T.dangerBorder}}>
                        {u.activo?"Activo":"Inactivo"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-3">
                        <button onClick={()=>abrirDetalle(u.id)} className="text-xs font-semibold hover:underline" style={{color:T.brand}}>Ver</button>
                        <button onClick={()=>abrirEditar(u)} className="text-xs font-semibold hover:underline" style={{color:T.info}}>Editar</button>
                        <button onClick={()=>setModalPwd(u)} className="text-xs font-semibold hover:underline" style={{color:T.gold}}>Pwd</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4"><Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina}/></div>
      </Card>

      <Modal abierto={!!detalle} onClose={()=>setDetalle(null)}
        titulo={detalle?`${detalle.nombre} ${detalle.apellido}`:""} ancho="max-w-xl">
        {detalle&&(
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[["Email",detalle.email],["Teléfono",detalle.telefono||"—"],
                ["Documento",`${detalle.tipo_documento} ${detalle.numero_documento||"—"}`],
                ["Rol",detalle.rol],["Estado",detalle.activo?"Activo":"Inactivo"],
                ["Registrado",fdoc(detalle.created_at)],
                ["Total gastado",fmt(detalle.total_gastado)],["Órdenes",detalle.ordenes?.length||0],
              ].map(([k,v])=>(
                <div key={k} className="rounded-xl px-4 py-3" style={{background:T.surfaceAlt,border:`1px solid ${T.borderSub}`}}>
                  <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{color:T.textMuted}}>{k}</p>
                  <p className="text-sm font-bold capitalize" style={{color:T.text}}>{v}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{color:T.text}}>Historial ({detalle.ordenes?.length||0})</h4>
              {!detalle.ordenes?.length
                ? <p className="text-xs text-center py-4" style={{color:T.textMuted}}>Sin órdenes</p>
                : <div className="space-y-2 max-h-52 overflow-y-auto">
                    {detalle.ordenes.map(o=>(
                      <div key={o.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{background:T.surfaceAlt,border:`1px solid ${T.borderSub}`}}>
                        <div>
                          <p className="font-mono text-xs font-bold" style={{color:T.brand}}>{o.codigo}</p>
                          <p className="text-xs mt-0.5" style={{color:T.textMuted}}>{o.items} productos · {fdoc(o.created_at)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs font-bold" style={{color:T.text}}>{fmt(o.total)}</p>
                          <Badge estado={o.estado}/>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}
      </Modal>

      <Modal abierto={!!editando} onClose={()=>setEditando(null)} titulo="Editar usuario">
        {editando&&(
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre" value={formEdit.nombre} onChange={fe("nombre")}/>
              <Input label="Apellido" value={formEdit.apellido} onChange={fe("apellido")}/>
            </div>
            <Input label="Email" type="email" value={formEdit.email} onChange={fe("email")}/>
            <Input label="Teléfono" value={formEdit.telefono} onChange={fe("telefono")}/>
            <div className="grid grid-cols-2 gap-3">
              <Sel label="Tipo doc." value={formEdit.tipo_documento} onChange={fe("tipo_documento")}>
                {["CC","TI","CE","PASAPORTE"].map(t=><option key={t} value={t}>{t}</option>)}
              </Sel>
              <Input label="Número doc." value={formEdit.numero_documento} onChange={fe("numero_documento")}/>
            </div>
            <Sel label="Rol" value={formEdit.rol} onChange={fe("rol")}>
              <option value="cliente">Cliente</option>
              <option value="cajero">Cajero</option>
              <option value="veterinario">Veterinario</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </Sel>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={()=>setEditando(null)}>Cancelar</Btn>
              <Btn onClick={guardarEditar}>Guardar</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal abierto={!!modalPwd} onClose={()=>{setModalPwd(null);setNuevaPwd("");}}>
        <div className="space-y-4">
          <Input label="Nueva contraseña" type="password" value={nuevaPwd}
            onChange={e=>setNuevaPwd(e.target.value)} placeholder="Mínimo 6 caracteres"/>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={()=>{setModalPwd(null);setNuevaPwd("");}}>Cancelar</Btn>
            <Btn onClick={cambiarPwd} disabled={nuevaPwd.length<6}>Actualizar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── PRODUCTOS ────────────────────────────────────────────────
function Productos() {
  const { C: T } = useTheme();
  const [lista,setLista]=useState([]); const [total,setTotal]=useState(0);
  const [pagina,setPagina]=useState(1); const [buscar,setBuscar]=useState("");
  const [catFiltro,setCatFiltro]=useState(""); const [cargando,setCargando]=useState(true);
  const [modal,setModal]=useState(false); const [editando,setEditando]=useState(null);
  const [categorias,setCategorias]=useState([]); const [proveedores,setProveedores]=useState([]);
  const [msg,setMsg]=useState({}); const [fieldErrors,setFieldErrors]=useState({});

  const VACIO={nombre:"",slug:"",descripcion:"",descripcion_corta:"",categoria_id:"",proveedor_id:"",
    precio:"",precio_antes:"",precio_costo:"",stock:"",stock_minimo:"5",imagen_url:"",
    imagen_v2:"",imagen_v3:"",imagen_v4:"",imagen_v5:"",
    marca:"",unidad:"",especie:"",destacado:false,activo:true,requiere_formula:false,uso_clinico:false,codigo_barra:""};
  const [form,setForm]=useState(VACIO);
  const barraRef=useRef(null);
  const [scanEstado,setScanEstado]=useState(null); // null | "ok"

  const cargar=useCallback(async()=>{
    setCargando(true);
    try{
      const[rP,rC,rProv]=await Promise.all([
        api.get(`/admin/productos?pagina=${pagina}&buscar=${buscar}&limite=10&categoria_id=${catFiltro}`),
        api.get("/categorias"),
        api.get("/admin/proveedores"),
      ]);
      setLista(rP.data.productos); setTotal(rP.data.total);
      setCategorias(rC.data); setProveedores(rProv.data);
    }finally{setCargando(false);}
  },[pagina,buscar,catFiltro]);

  useEffect(()=>{cargar();},[cargar]);
  const showMsg=(texto,tipo="ok")=>{setMsg({texto,tipo});setTimeout(()=>setMsg({}),4000);};
  const abrirNuevo=()=>{
    setForm(VACIO);setEditando(null);setFieldErrors({});setScanEstado(null);setModal(true);
    setTimeout(()=>barraRef.current?.focus(),80);
  };
  const abrirEditar=(p)=>{
    // imagenes_extra puede llegar como JSON string, array, o null
    let extras = [];
    try {
      const raw = p.imagenes_extra;
      if (Array.isArray(raw))      extras = raw;
      else if (typeof raw === "string" && raw.trim()) extras = JSON.parse(raw);
    } catch { extras = []; }
    const [v2="", v3="", v4="", v5=""] = extras;

    setForm({nombre:p.nombre,slug:p.slug||"",descripcion:p.descripcion||"",
      descripcion_corta:p.descripcion_corta||"",categoria_id:p.categoria_id||"",proveedor_id:p.proveedor_id||"",
      precio:p.precio,precio_antes:p.precio_antes||"",precio_costo:p.precio_costo||"",
      stock:p.stock,stock_minimo:p.stock_minimo||5,imagen_url:p.imagen_url||"",
      imagen_v2:v2,imagen_v3:v3,imagen_v4:v4,imagen_v5:v5,
      marca:p.marca||"",unidad:p.unidad||"",especie:p.especie||"",
      destacado:!!p.destacado,activo:p.activo!==0,requiere_formula:!!p.requiere_formula,
      uso_clinico:!!p.uso_clinico,
      codigo_barra:p.codigo_barra||""});
    setEditando(p); setFieldErrors({}); setScanEstado(p.codigo_barra?"ok":null); setModal(true);
    setTimeout(()=>barraRef.current?.focus(),80);
  };

  // Validación con mensajes por campo
  const validar=()=>{
    const e={};
    if(!form.nombre.trim())        e.nombre="El nombre es obligatorio";
    if(!form.categoria_id)         e.categoria_id="Selecciona una categoría";
    if(form.precio===""||isNaN(Number(form.precio))||Number(form.precio)<0)
      e.precio="Ingresa un precio válido (número ≥ 0)";
    if(form.stock===""||isNaN(Number(form.stock))||Number(form.stock)<0)
      e.stock="Ingresa un stock válido (número ≥ 0)";
    if(form.precio_antes!==""&&Number(form.precio_antes)<=Number(form.precio))
      e.precio_antes="El precio anterior debe ser mayor al precio actual";
    setFieldErrors(e);
    return Object.keys(e).length===0;
  };

  const guardar=async()=>{
    if(!validar()) return;
    try{
      const p={};
      if(form.nombre)            p.nombre=form.nombre;
      if(form.slug)              p.slug=form.slug;
      if(form.descripcion)       p.descripcion=form.descripcion;
      if(form.descripcion_corta) p.descripcion_corta=form.descripcion_corta;
      if(form.categoria_id)      p.categoria_id=Number(form.categoria_id);
      if(form.proveedor_id)      p.proveedor_id=Number(form.proveedor_id);
      if(form.precio!=="")       p.precio=Number(form.precio);
      if(form.precio_antes!=="") p.precio_antes=Number(form.precio_antes);
      if(form.precio_costo!=="") p.precio_costo=Number(form.precio_costo);
      if(form.stock!=="")        p.stock=Number(form.stock);
      if(form.stock_minimo!=="") p.stock_minimo=Number(form.stock_minimo);
      if(form.imagen_url)        p.imagen_url=form.imagen_url;
      // Imágenes extra: enviar siempre como array (vacío para borrar)
      p.imagenes_extra = [form.imagen_v2, form.imagen_v3, form.imagen_v4, form.imagen_v5]
        .map(u => (u || "").trim())
        .filter(u => u.length > 0);
      if(form.marca)             p.marca=form.marca;
      if(form.unidad)            p.unidad=form.unidad;
      if(form.especie)           p.especie=form.especie;
      if(form.codigo_barra)      p.codigo_barra=form.codigo_barra;
      else                       p.codigo_barra=null;
      p.destacado=form.destacado?1:0; p.activo=form.activo?1:0; p.requiere_formula=form.requiere_formula?1:0;
      p.uso_clinico=form.uso_clinico?1:0;
      if(!p.slug&&p.nombre) p.slug=p.nombre.toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
      if(editando){await api.put(`/productos/${editando.id}`,p);showMsg("Producto actualizado.");}
      else{await api.post("/productos",p);showMsg("Producto creado.");}
      setModal(false); cargar();
    }catch(err){
      // Mostrar error del backend de forma legible
      const msg=err.response?.data?.error||"";
      if(msg.includes("slug")) setFieldErrors({slug:"Este slug ya existe, cámbialo o déjalo vacío para auto-generar"});
      else if(msg.includes("categoria")) setFieldErrors({categoria_id:"Categoría inválida"});
      else showMsg(msg||"Error al guardar el producto","err");
    }
  };

  const toggleActivo=async(p)=>{await api.put(`/productos/${p.id}`,{activo:p.activo?0:1});cargar();};
  const ff=k=>e=>setForm({...form,[k]:e.target.value});
  const fc=k=>e=>setForm({...form,[k]:e.target.checked});
  const handleScanBarra=e=>{
    if(e.key==="Enter"&&form.codigo_barra.trim()){
      e.preventDefault();
      setScanEstado("ok");
    }
  };
  const limpiarBarra=()=>{setForm(f=>({...f,codigo_barra:""}));setScanEstado(null);setTimeout(()=>barraRef.current?.focus(),50);};

  return (
    <div className="space-y-5">
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <div className="flex gap-3 items-center justify-between flex-wrap">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:T.textMuted}}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input value={buscar} placeholder="Buscar producto..."
              onChange={e=>{setBuscar(e.target.value);setPagina(1);}}
              className="pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none w-56"
              style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}/>
          </div>
          <select value={catFiltro} onChange={e=>{setCatFiltro(e.target.value);setPagina(1);}}
            className="px-3.5 py-2.5 text-sm rounded-xl outline-none"
            style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}>
            <option value="">Todas las categorías</option>
            {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <Btn onClick={abrirNuevo} size="md">+ Nuevo producto</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Producto","Categoría","Precio","Costo","Stock","Estado","★","Acciones"]}/>
            <tbody>
              {cargando ? <tr><td colSpan={8}><Spinner/></td></tr>
              : lista.map((p,i)=>(
                <tr key={p.id} className="transition-colors"
                  style={{borderBottom:`1px solid ${T.borderSub}`,background:i%2===0?T.surface:T.surfaceAlt}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?T.surface:T.surfaceAlt}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img src={p.imagen_url||"https://placehold.co/40x40/e6f3e6/1a5c1a?text=P"}
                        className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                        style={{border:`1px solid ${T.border}`}}
                        onError={e=>{e.target.src="https://placehold.co/40x40/e6f3e6/1a5c1a?text=P";}}/>
                      <div>
                        <p className="text-xs font-semibold line-clamp-1 max-w-[150px]" style={{color:T.text}}>{p.nombre}</p>
                        <p className="text-xs" style={{color:T.textMuted}}>{p.marca||""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs" style={{color:T.textTer}}>{p.categoria}</td>
                  <td className="py-3.5 px-4">
                    <p className="text-xs font-bold tabular-nums" style={{color:T.brand}}>{fmt(p.precio)}</p>
                    {p.precio_antes&&<p className="text-xs line-through tabular-nums" style={{color:T.textMuted}}>{fmt(p.precio_antes)}</p>}
                  </td>
                  <td className="py-3.5 px-4 text-xs tabular-nums" style={{color:T.textTer}}>{p.precio_costo?fmt(p.precio_costo):"—"}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-bold tabular-nums"
                      style={{color:p.stock<=p.stock_minimo?T.danger:T.text}}>
                      {p.stock}{p.stock<=p.stock_minimo?" ⚠️":""}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button onClick={()=>toggleActivo(p)}
                      className="px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors"
                      style={p.activo
                        ?{background:T.successBg,color:T.success,borderColor:T.successBorder}
                        :{background:T.surfaceAlt,color:T.textTer,borderColor:T.border}}>
                      {p.activo?"Activo":"Inactivo"}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-center" style={{color:p.destacado?T.gold:T.textMuted}}>
                    {p.destacado?"★":"☆"}
                  </td>
                  <td className="py-3.5 px-4">
                    <button onClick={()=>abrirEditar(p)} className="text-xs font-semibold hover:underline" style={{color:T.brand}}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4"><Paginacion pagina={pagina} total={total} limite={10} onChange={setPagina}/></div>
      </Card>

      {/* Modal crear/editar con errores por campo */}
      <Modal abierto={modal} onClose={()=>setModal(false)}
        titulo={editando?"Editar producto":"Nuevo producto"} ancho="max-w-2xl">
        <div className="space-y-4">
          {/* Error general si hay múltiples */}
          {Object.keys(fieldErrors).length>0&&(
            <div className="rounded-xl px-4 py-3 flex items-start gap-2"
              style={{background:T.dangerBg,border:`1px solid ${T.dangerBorder}`}}>
              <span style={{color:T.danger}}>⚠</span>
              <div>
                <p className="text-xs font-bold" style={{color:T.danger}}>Corrige los siguientes campos:</p>
                <ul className="mt-1 space-y-0.5">
                  {Object.values(fieldErrors).map((e,i)=>(
                    <li key={i} className="text-xs" style={{color:T.danger}}>· {e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Lector de código de barras ── */}
          <div className="rounded-xl p-3.5 transition-all duration-300"
            style={{background:scanEstado==="ok"?T.successBg:T.surfaceAlt,
              border:`1.5px solid ${scanEstado==="ok"?T.successBorder:T.border}`}}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{color:scanEstado==="ok"?T.success:T.brand}}>
                <path strokeLinecap="round" d="M4 6h1v12H4zm3 0h1v12H7zm3 0h2v12h-2zm4 0h1v12h-1zm3 0h1v12h-1zm3 0h1v12h-1z"/>
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider"
                style={{color:scanEstado==="ok"?T.success:T.textTer}}>
                {scanEstado==="ok"?"Código de barras registrado ✓":"Código de barras"}
              </span>
              {scanEstado==="ok"&&(
                <button onClick={limpiarBarra}
                  className="ml-auto text-xs px-2 py-0.5 rounded-lg"
                  style={{background:T.dangerBg,color:T.danger,border:`1px solid ${T.dangerBorder}`}}>
                  Limpiar
                </button>
              )}
            </div>
            <input ref={barraRef} value={form.codigo_barra}
              onChange={e=>{setForm(f=>({...f,codigo_barra:e.target.value}));if(scanEstado==="ok")setScanEstado(null);}}
              onKeyDown={handleScanBarra}
              placeholder="Enfoca aquí y escanea, o escribe el código y presiona Enter..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
              style={{border:`1.5px solid ${scanEstado==="ok"?T.successBorder:T.border}`,
                background:T.surface,color:T.text,fontFamily:"monospace"}}/>
            <p className="text-xs mt-1.5" style={{color:T.textMuted}}>
              {scanEstado==="ok"
                ?`Código capturado: ${form.codigo_barra} · Puedes editarlo manualmente`
                :"Escanea con el lector inalámbrico o escribe el código y presiona Enter"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Nombre del producto *" value={form.nombre} onChange={ff("nombre")}
                placeholder="ej: Antipulgas Frontline Combo" error={fieldErrors.nombre}/>
            </div>
            <Input label="Slug URL" value={form.slug} onChange={ff("slug")}
              placeholder="auto-generado si vacío" error={fieldErrors.slug}/>
            <div/>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textTer}}>Descripción corta</label>
            <textarea value={form.descripcion_corta} onChange={ff("descripcion_corta")} rows={2}
              placeholder="Resumen para la tarjeta de producto..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none"
              style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Sel label="Categoría *" value={form.categoria_id} onChange={ff("categoria_id")}>
                <option value="">Selecciona categoría</option>
                {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Sel>
              <FieldError msg={fieldErrors.categoria_id}/>
            </div>
            <Input label="Unidad" value={form.unidad} onChange={ff("unidad")} placeholder="ej: frasco, caja"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Sel label="Proveedor" value={form.proveedor_id} onChange={ff("proveedor_id")}>
              <option value="">Sin proveedor</option>
              {proveedores.map(pv=><option key={pv.id} value={pv.id}>{pv.nombre}</option>)}
            </Sel>
            <Input label="Marca" value={form.marca} onChange={ff("marca")} placeholder="ej: Frontline"/>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Precio venta *" type="number" value={form.precio} onChange={ff("precio")}
              placeholder="0" error={fieldErrors.precio}/>
            <Input label="Precio antes (tachado)" type="number" value={form.precio_antes}
              onChange={ff("precio_antes")} placeholder="Opcional" error={fieldErrors.precio_antes}/>
            <Input label="Costo (precio compra)" type="number" value={form.precio_costo}
              onChange={ff("precio_costo")} placeholder="Para calcular ganancia"/>
          </div>

          {/* Info IVA — explicación clara */}
          {form.precio&&Number(form.precio)>0&&(
            <div className="rounded-xl px-4 py-3 text-xs space-y-0.5"
              style={{background:T.infoBg,border:`1px solid ${T.infoBorder}`,color:T.info}}>
              <p className="font-semibold">💡 IVA en Colombia (19%)</p>
              <p>El IVA se calcula automáticamente al facturar. Sobre este precio de {fmt(form.precio)}:</p>
              <p>· IVA = <strong>{fmt(Number(form.precio)*0.19)}</strong> · Total con IVA = <strong>{fmt(Number(form.precio)*1.19)}</strong></p>
              {form.precio_costo&&Number(form.precio_costo)>0&&(
                <p>· Ganancia bruta = <strong>{fmt(Number(form.precio)-Number(form.precio_costo))}</strong></p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock *" type="number" value={form.stock} onChange={ff("stock")}
              placeholder="0" error={fieldErrors.stock}/>
            <Input label="Stock mínimo (alerta)" type="number" value={form.stock_minimo}
              onChange={ff("stock_minimo")} placeholder="5"/>
          </div>
          {/* ── Galería de imágenes (1 principal + 4 referencias) ── */}
          <div style={{
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 16,
            background: T.surfaceAlt,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: T.textTer }}>
                Galería · Imágenes del producto
              </p>
              <span style={{ fontSize: 10, color: T.textMuted }}>
                1 principal + 4 referencias (URLs)
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}>
              {[
                { k: "imagen_url", label: "Principal", required: true },
                { k: "imagen_v2",  label: "V2" },
                { k: "imagen_v3",  label: "V3" },
                { k: "imagen_v4",  label: "V4" },
                { k: "imagen_v5",  label: "V5" },
              ].map(img => {
                const url = form[img.k];
                return (
                  <div key={img.k} style={{
                    aspectRatio: "1 / 1",
                    borderRadius: 10,
                    border: `1.5px solid ${url ? T.brandBorder : T.border}`,
                    background: T.surface,
                    overflow: "hidden",
                    position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {url ? (
                      <img src={url} alt={img.label}
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: T.textMuted, letterSpacing: 1,
                      }}>
                        {img.label.toUpperCase()}
                      </span>
                    )}
                    {img.required && (
                      <span style={{
                        position: "absolute", top: 4, left: 4,
                        padding: "1px 5px", borderRadius: 4,
                        background: T.brand, color: "#fff",
                        fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
                      }}>
                        PRINCIPAL
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { k: "imagen_url", label: "URL imagen principal",   placeholder: "https://… o /imagenes/producto.jpg" },
                { k: "imagen_v2",  label: "URL imagen referencia 2", placeholder: "https://… (opcional)" },
                { k: "imagen_v3",  label: "URL imagen referencia 3", placeholder: "https://… (opcional)" },
                { k: "imagen_v4",  label: "URL imagen referencia 4", placeholder: "https://… (opcional)" },
                { k: "imagen_v5",  label: "URL imagen referencia 5", placeholder: "https://… (opcional)" },
              ].map(img => (
                <div key={img.k}>
                  <label style={{
                    display: "block", fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1,
                    color: T.textTer, marginBottom: 4,
                  }}>
                    {img.label}
                  </label>
                  <input
                    value={form[img.k]}
                    onChange={ff(img.k)}
                    placeholder={img.placeholder}
                    style={{
                      width: "100%", height: 36,
                      padding: "0 12px",
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.surface, color: T.text,
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textTer}}>Especie (separadas por coma)</label>
            <input value={form.especie} onChange={ff("especie")} placeholder="ej: perros,gatos"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
              style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}/>
          </div>
          <div className="flex gap-6 pt-1 flex-wrap">
            {[
              {key:"activo",label:"Activo"},
              {key:"destacado",label:"Destacado ★"},
              {key:"requiere_formula",label:"Requiere fórmula"},
            ].map(({key,label})=>(
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[key]} onChange={fc(key)} className="rounded accent-green-700"/>
                <span className="text-sm" style={{color:T.text}}>{label}</span>
              </label>
            ))}
          </div>

          {/* Toggle "Uso clínico" — destacado en morado */}
          <div style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: form.uso_clinico ? "#f3e8ff" : T.surfaceAlt,
            border: `1.5px solid ${form.uso_clinico ? "#a855f7" : T.border}`,
            display: "flex", alignItems: "center", gap: 12,
            transition: "all 0.18s",
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
              <input
                type="checkbox"
                checked={!!form.uso_clinico}
                onChange={fc("uso_clinico")}
                style={{ accentColor: "#7c3aed", width: 18, height: 18 }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.uso_clinico ? "#6b21a8" : T.text }}>
                  <FontAwesomeIcon icon={faPills} style={{ marginRight: 6, color: "#7c3aed" }}/>
                  Uso clínico / Farmacéutico
                </div>
                <div style={{ fontSize: 11, color: form.uso_clinico ? "#7c3aed" : T.textMuted, marginTop: 2 }}>
                  Solo productos marcados aparecerán en el panel del veterinario al agregar insumos a una consulta
                </div>
              </div>
            </label>
            {form.uso_clinico && (
              <span style={{
                padding: "3px 10px", borderRadius: 999,
                background: "#7c3aed", color: "#fff",
                fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              }}>
                CLÍNICO
              </span>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2" style={{borderTop:`1px solid ${T.border}`}}>
            <Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
            <Btn onClick={guardar} size="md">{editando?"Guardar cambios":"Crear producto"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── ÓRDENES ──────────────────────────────────────────────────
function Ordenes() {
  const { C: T } = useTheme();
  const [lista,setLista]=useState([]); const [total,setTotal]=useState(0);
  const [pagina,setPagina]=useState(1); const [filtro,setFiltro]=useState("");
  const [cargando,setCargando]=useState(true);
  const [detalle,setDetalle]=useState(null);
  const [cargandoDetalle,setCargandoDetalle]=useState(false);
  const [nuevoEnvio,setNuevoEnvio]=useState("");
  const [guardandoEnvio,setGuardandoEnvio]=useState(false);
  const [msgEnvio,setMsgEnvio]=useState("");

  const cargar=useCallback(async()=>{
    setCargando(true);
    try{const{data}=await api.get(`/admin/ordenes?pagina=${pagina}&estado=${filtro}&limite=12`);
      setLista(data.ordenes); setTotal(data.total);}
    finally{setCargando(false);}
  },[pagina,filtro]);

  useEffect(()=>{cargar();},[cargar]);

  const cambiarEstado=async(id,estado)=>{
    await api.patch(`/admin/ordenes/${id}/estado`,{estado});
    cargar();
    if(detalle?.id===id) setDetalle(p=>({...p,estado}));
  };

  const abrirDetalle=async(id)=>{
    setCargandoDetalle(true);
    setDetalle(null); setMsgEnvio("");
    try{
      const{data}=await api.get(`/admin/ordenes/${id}`);
      setDetalle(data);
      setNuevoEnvio(String(data.costo_envio??0));
    }finally{setCargandoDetalle(false);}
  };

  const guardarEnvio=async()=>{
    const costo=parseFloat(nuevoEnvio);
    if(isNaN(costo)||costo<0){setMsgEnvio("err:Valor inválido.");return;}
    setGuardandoEnvio(true); setMsgEnvio("");
    try{
      const{data}=await api.patch(`/admin/ordenes/${detalle.id}/envio`,{costo_envio:costo});
      setDetalle(p=>({...p,costo_envio:data.costo_envio,total:data.total}));
      setMsgEnvio("ok:Envío actualizado.");
      cargar();
    }catch(err){
      setMsgEnvio("err:"+(err.response?.data?.error||"Error."));
    }finally{setGuardandoEnvio(false);}
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-center flex-wrap">
        <Sel value={filtro} onChange={e=>{setFiltro(e.target.value);setPagina(1);}}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e=><option key={e} value={e}>{ESTADO_LABEL[e] || e}</option>)}
        </Sel>
        <span className="text-xs font-medium" style={{color:T.textMuted}}>{total} órdenes</span>
      </div>

      <div className="flex gap-4 items-start">
        {/* Tabla */}
        <Card className="flex-1 min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Código","Cliente","Total","Estado","Fecha","Estado →"]}/>
              <tbody>
                {cargando ? <tr><td colSpan={6}><Spinner/></td></tr>
                : lista.length===0 ? <tr><td colSpan={6} className="text-center py-16 text-sm" style={{color:T.textMuted}}>Sin órdenes</td></tr>
                : lista.map((o,i)=>{
                  const activa=detalle?.id===o.id;
                  return(
                  <tr key={o.id} className="transition-colors cursor-pointer"
                    style={{borderBottom:`1px solid ${T.borderSub}`,background:activa?T.brandLight:i%2===0?T.surface:T.surfaceAlt}}
                    onClick={()=>abrirDetalle(o.id)}
                    onMouseEnter={e=>{if(!activa)e.currentTarget.style.background=T.surfaceHover;}}
                    onMouseLeave={e=>{if(!activa)e.currentTarget.style.background=i%2===0?T.surface:T.surfaceAlt;}}>
                    <td className="py-3 px-4 font-mono text-xs font-bold" style={{color:T.brand}}>{o.codigo}</td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-semibold" style={{color:T.text}}>{o.cliente}</p>
                      <p className="text-xs" style={{color:T.textMuted}}>{o.email}</p>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold tabular-nums" style={{color:T.text}}>{fmt(o.total)}</td>
                    <td className="py-3 px-4"><Badge estado={o.estado||"pendiente"}/></td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap" style={{color:T.textMuted}}>{fdoc(o.created_at)}</td>
                    <td className="py-3 px-4" onClick={e=>e.stopPropagation()}>
                      <select value={o.estado||"pendiente"} onChange={e=>cambiarEstado(o.id,e.target.value)}
                        className="text-xs rounded-lg px-2 py-1.5 outline-none"
                        style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}>
                        {ESTADOS.map(e=><option key={e} value={e}>{ESTADO_LABEL[e]||e}</option>)}
                      </select>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4"><Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina}/></div>
        </Card>

        {/* Panel detalle */}
        {(cargandoDetalle || detalle) && (
          <div style={{width:320,flexShrink:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",position:"sticky",top:24}}>
            {cargandoDetalle ? <Spinner/> : detalle && (<>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${T.border}`}}>
                <div>
                  <p className="text-xs font-mono font-bold" style={{color:T.brand}}>{detalle.codigo}</p>
                  <p className="text-xs" style={{color:T.textMuted}}>{fdoc(detalle.created_at)}</p>
                </div>
                <button onClick={()=>setDetalle(null)} className="text-lg leading-none" style={{color:T.textMuted,background:"none",border:"none",cursor:"pointer"}}>✕</button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Cliente */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color:T.textMuted}}>Cliente</p>
                  <p className="text-sm font-semibold" style={{color:T.text}}>{detalle.cliente}</p>
                  <p className="text-xs" style={{color:T.textMuted}}>{detalle.email}</p>
                  {detalle.telefono && <p className="text-xs" style={{color:T.textMuted}}>{detalle.telefono}</p>}
                  {detalle.direccion_entrega && (
                    <p className="text-xs mt-1" style={{color:T.textTer}}>
                      <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 6, color: T.brand }}/>
                      {detalle.direccion_entrega}{detalle.ciudad_entrega?`, ${detalle.ciudad_entrega}`:""}
                    </p>
                  )}
                </div>

                {/* Estado + método */}
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge estado={detalle.estado||"pendiente"}/>
                  <span className="text-xs capitalize" style={{color:T.textTer}}>{detalle.metodo_pago||"—"}</span>
                </div>

                {/* Cambiar estado inline */}
                <select value={detalle.estado||"pendiente"} onChange={e=>cambiarEstado(detalle.id,e.target.value)}
                  className="w-full text-xs rounded-xl px-3 py-2 outline-none"
                  style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}>
                  {ESTADOS.map(e=><option key={e} value={e}>{ESTADO_LABEL[e]||e}</option>)}
                </select>

                {/* Atajos de acción según estado actual */}
                {detalle.estado === "pagada" && (
                  <button onClick={() => cambiarEstado(detalle.id, "enviada")}
                    style={{
                      width: "100%", padding: "10px 14px",
                      borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                      color: "#fff", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                    }}>
                    <FontAwesomeIcon icon={faTruck} style={{ fontSize: 12 }}/>
                    Marcar como enviada
                  </button>
                )}

                {detalle.estado === "enviada" && (
                  <div style={{
                    padding: "14px 16px", borderRadius: 12,
                    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                    color: "#fff",
                  }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1.2 }}>
                      Código de entrega (cliente)
                    </p>
                    <p style={{
                      margin: "4px 0 12px",
                      fontFamily: font.mono,
                      fontSize: 18, fontWeight: 800, color: "#fff",
                      letterSpacing: 1.5,
                    }}>
                      {detalle.codigo}
                    </p>
                    <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                      El repartidor debe confirmar este código con el cliente al entregar.
                    </p>
                    <button onClick={() => cambiarEstado(detalle.id, "entregada")}
                      style={{
                        width: "100%", padding: "10px 14px",
                        borderRadius: 10, border: "none",
                        background: "#fff", color: "#1e3a8a",
                        fontSize: 12, fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                      <FontAwesomeIcon icon={faCheck}/>
                      Verificar entrega
                    </button>
                  </div>
                )}

                {detalle.estado === "entregada" && (
                  <div style={{
                    padding: "12px 14px", borderRadius: 12,
                    background: T.successBg, border: `1px solid ${T.successBorder}`,
                    color: T.success, fontSize: 12, fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 8,
                    width: "100%",
                  }}>
                    <FontAwesomeIcon icon={faCircleCheck}/> Entrega verificada · Pedido completado
                  </div>
                )}

                {/* Ítems */}
                {detalle.items?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{color:T.textMuted}}>Productos</p>
                    <div className="space-y-1">
                      {detalle.items.map((it,i)=>(
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span style={{color:T.textSec}}>{it.nombre_snap} ×{it.cantidad}</span>
                          <span className="font-semibold tabular-nums" style={{color:T.text,fontFamily:font.mono}}>{fmt(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totales */}
                <div className="rounded-xl p-3 space-y-1.5" style={{background:T.surfaceAlt,border:`1px solid ${T.border}`}}>
                  <div className="flex justify-between text-xs" style={{color:T.textTer}}>
                    <span>Subtotal</span><span className="tabular-nums">{fmt(detalle.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{color:T.textTer}}>
                    <span>Envío</span>
                    <span className="tabular-nums" style={{color:detalle.costo_envio>0?T.warning:T.success}}>
                      {detalle.costo_envio>0?fmt(detalle.costo_envio):"Gratis"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold" style={{color:T.text,borderTop:`1px solid ${T.border}`,paddingTop:6,marginTop:4}}>
                    <span>Total</span><span className="tabular-nums" style={{fontFamily:font.mono}}>{fmt(detalle.total)}</span>
                  </div>
                </div>

                {/* Editar costo envío */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{color:T.textMuted}}>Ajustar costo de envío</p>
                  <div className="flex gap-2">
                    <input
                      type="number" min="0" step="100"
                      value={nuevoEnvio}
                      onChange={e=>setNuevoEnvio(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-xl outline-none tabular-nums"
                      style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}
                      onFocus={e=>e.target.style.borderColor=T.brand}
                      onBlur={e=>e.target.style.borderColor=T.border}
                      placeholder="0"
                    />
                    <Btn onClick={guardarEnvio} disabled={guardandoEnvio} size="sm">
                      {guardandoEnvio?"...":"Guardar"}
                    </Btn>
                  </div>
                  <p className="text-xs mt-1" style={{color:T.textMuted}}>0 = envío gratis. Actualiza el total automáticamente.</p>
                  {msgEnvio && (
                    <Msg texto={msgEnvio.slice(4)} tipo={msgEnvio.startsWith("ok")?"ok":"err"}/>
                  )}
                </div>
              </div>
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CAJEROS ──────────────────────────────────────────────────
function Cajeros({ onIrUsuarios }) {
  const { C: T } = useTheme();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    api.get("/admin/cajeros")
      .then(({ data }) => setLista(data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs" style={{ color: T.textMuted }}>
            Los cajeros se asignan cambiando el rol del usuario en la sección <strong>Usuarios</strong>.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: T.goldBg, color: T.gold, border: `1px solid ${T.goldBorder}` }}>
          {lista.length} cajero{lista.length !== 1 ? "s" : ""} registrado{lista.length !== 1 ? "s" : ""}
        </span>
      </div>

      {!lista.length ? (
        <Card className="p-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: T.goldBg }}>💳</div>
          <p className="text-sm font-semibold" style={{ color: T.textSec }}>Sin cajeros registrados</p>
          <p className="text-xs text-center max-w-xs" style={{ color: T.textMuted }}>
            Ve a Usuarios, edita un usuario y cambia su rol a <strong>Cajero</strong>.
          </p>
          <Btn size="sm" variant="outline" onClick={onIrUsuarios}>Ir a Usuarios</Btn>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Cajero", "Email", "Ventas hoy", "Total ventas", "Total facturado", "Estado"]} />
              <tbody>
                {lista.map((c, i) => (
                  <tr key={c.id} className="transition-colors"
                    style={{ borderBottom: `1px solid ${T.borderSub}`, background: i % 2 === 0 ? T.surface : T.surfaceAlt }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.surface : T.surfaceAlt}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: T.goldBg, color: T.gold, border: `1px solid ${T.goldBorder}` }}>
                          {c.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: T.text }}>{c.nombre} {c.apellido}</p>
                          <p className="text-xs" style={{ color: T.textMuted }}>#{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: T.textSec }}>{c.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold tabular-nums" style={{ color: T.gold, fontFamily: font.mono }}>
                        {c.ventas_hoy}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs tabular-nums font-semibold" style={{ color: T.text, fontFamily: font.mono }}>
                      {c.total_ventas}
                    </td>
                    <td className="py-3.5 px-4 text-xs tabular-nums font-bold" style={{ color: T.brand, fontFamily: font.mono }}>
                      {fmt(c.total_facturado)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={c.activo
                          ? { background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` }
                          : { background: T.dangerBg,  color: T.danger,  border: `1px solid ${T.dangerBorder}` }}>
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── PROVEEDORES ──────────────────────────────────────────────
function Proveedores() {
  const { C: T } = useTheme();
  const VACIO = { nombre:"", contacto:"", telefono:"", email:"" };
  const [lista,      setLista]      = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [form,       setForm]       = useState(VACIO);
  const [msg,        setMsg]        = useState({});
  const [confirmElim,setConfirmElim]= useState(null);

  const cargar = async () => {
    setCargando(true);
    try { const {data} = await api.get("/admin/proveedores"); setLista(data); }
    finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);

  const showMsg = (texto, tipo="ok") => { setMsg({texto,tipo}); setTimeout(()=>setMsg({}),3500); };
  const abrirNuevo  = () => { setForm(VACIO); setEditando(null); setModal(true); };
  const abrirEditar = (p) => { setForm({nombre:p.nombre,contacto:p.contacto||"",telefono:p.telefono||"",email:p.email||""}); setEditando(p); setModal(true); };
  const ff = k => e => setForm({...form,[k]:e.target.value});

  const guardar = async () => {
    if (!form.nombre.trim()) return showMsg("El nombre es obligatorio.", "err");
    try {
      if (editando) { await api.put(`/admin/proveedores/${editando.id}`, form); showMsg("Proveedor actualizado."); }
      else          { await api.post("/admin/proveedores", form);               showMsg("Proveedor creado."); }
      setModal(false); cargar();
    } catch (err) { showMsg(err.response?.data?.error || "Error al guardar.", "err"); }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/admin/proveedores/${id}`);
      showMsg("Proveedor eliminado."); setConfirmElim(null); cargar();
    } catch (err) { showMsg(err.response?.data?.error || "Error al eliminar.", "err"); setConfirmElim(null); }
  };

  const toggleActivo = async (p) => {
    await api.put(`/admin/proveedores/${p.id}`, { activo: p.activo ? 0 : 1 }); cargar();
  };

  return (
    <div className="space-y-5">
      <Msg texto={msg.texto} tipo={msg.tipo}/>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs" style={{color:T.textMuted}}>
          Los proveedores se asignan a los productos al crearlos o editarlos.
        </p>
        <Btn onClick={abrirNuevo} size="md">+ Nuevo proveedor</Btn>
      </div>

      {cargando ? <Spinner/> : lista.length === 0 ? (
        <Card className="p-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{background:T.brandLight}}>🏭</div>
          <p className="text-sm font-semibold" style={{color:T.textSec}}>Sin proveedores registrados</p>
          <p className="text-xs text-center max-w-xs" style={{color:T.textMuted}}>Agrega los proveedores para asignarlos a tus productos.</p>
          <Btn size="sm" onClick={abrirNuevo}>Agregar el primero</Btn>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Proveedor","Contacto","Teléfono","Email","Productos","Estado","Acciones"]}/>
              <tbody>
                {lista.map((p,i) => (
                  <tr key={p.id} className="transition-colors"
                    style={{borderBottom:`1px solid ${T.borderSub}`,background:i%2===0?T.surface:T.surfaceAlt}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?T.surface:T.surfaceAlt}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{background:T.brandLight,color:T.brand,border:`1px solid ${T.brandBorder}`}}>
                          {p.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{color:T.text}}>{p.nombre}</p>
                          <p className="text-xs" style={{color:T.textMuted}}>#{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textSec}}>{p.contacto||"—"}</td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textSec}}>{p.telefono||"—"}</td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textSec}}>{p.email||"—"}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
                        style={{background:T.brandLight,color:T.brand}}>
                        {p.total_productos ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={()=>toggleActivo(p)}
                        className="px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors"
                        style={p.activo
                          ?{background:T.successBg,color:T.success,borderColor:T.successBorder}
                          :{background:T.dangerBg, color:T.danger, borderColor:T.dangerBorder}}>
                        {p.activo?"Activo":"Inactivo"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-3">
                        <button onClick={()=>abrirEditar(p)} className="text-xs font-semibold hover:underline" style={{color:T.brand}}>Editar</button>
                        <button onClick={()=>setConfirmElim(p)} className="text-xs font-semibold hover:underline" style={{color:T.danger}}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal abierto={modal} onClose={()=>setModal(false)}
        titulo={editando?"Editar proveedor":"Nuevo proveedor"}>
        <div className="space-y-4">
          <Input label="Nombre *" value={form.nombre} onChange={ff("nombre")} placeholder="ej: Icofarma"/>
          <Input label="Contacto (representante)" value={form.contacto} onChange={ff("contacto")} placeholder="Nombre del representante"/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Teléfono" value={form.telefono} onChange={ff("telefono")} placeholder="300 000 0000"/>
            <Input label="Email" type="email" value={form.email} onChange={ff("email")} placeholder="ventas@proveedor.com"/>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
            <Btn onClick={guardar} size="md">{editando?"Guardar cambios":"Crear proveedor"}</Btn>
          </div>
        </div>
      </Modal>

      <Modal abierto={!!confirmElim} onClose={()=>setConfirmElim(null)} titulo="Confirmar eliminación">
        {confirmElim && (
          <div className="space-y-4">
            <p className="text-sm" style={{color:T.textSec}}>
              ¿Eliminar a <strong style={{color:T.text}}>{confirmElim.nombre}</strong>?
              Fallará si hay productos con este proveedor asignado.
            </p>
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={()=>setConfirmElim(null)}>Cancelar</Btn>
              <Btn variant="danger" onClick={()=>eliminar(confirmElim.id)}>Sí, eliminar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── VETERINARIOS & CITAS ─────────────────────────────────────
const CITA_ESTADOS = {
  pendiente:         { bg:"#fef3c7", text:"#92400e", border:"#fde68a", label:"Pendiente" },
  confirmada:        { bg:"#dbeafe", text:"#1e40af", border:"#bfdbfe", label:"Confirmada" },
  completada:        { bg:"#dcfce7", text:"#14532d", border:"#bbf7d0", label:"Completada" },
  rechazada:         { bg:"#fee2e2", text:"#7f1d1d", border:"#fecaca", label:"Rechazada" },
  cancelada_cliente: { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", label:"Cancelada cliente" },
  no_asistio:        { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", label:"No asistió" },
};

function BadgeCita({ estado }) {
  const { C: T } = useTheme();
  const s = CITA_ESTADOS[estado] || CITA_ESTADOS.pendiente;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>
      {s.label || estado}
    </span>
  );
}

function Veterinarios() {
  const { C: T } = useTheme();
  const [vets, setVets]       = useState([]);
  const [citas, setCitas]     = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [cargando, setCargando] = useState(true);
  const [tab, setTab]         = useState("citas");
  const [msg, setMsg]         = useState({});
  const [modalVet, setModalVet] = useState(null);
  const [formVet, setFormVet] = useState({ especialidad:"", duracion_cita:30, descripcion:"" });
  const [candidatos, setCandidatos] = useState([]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [formNuevo, setFormNuevo]   = useState({ usuario_id:"", especialidad:"Medicina General", duracion_cita:30, descripcion:"" });
  const [modalReagendar, setModalReagendar] = useState(null);
  const [formReagendar, setFormReagendar]   = useState({ motivo:"", nueva_fecha:"", nueva_hora:"", proponer_fecha:false });
  const [enviandoReagendamiento, setEnviandoReagendamiento] = useState(false);
  const [modalDesactivarVet, setModalDesactivarVet] = useState(null); // { vet, citas }
  const [desactivarForm, setDesactivarForm]         = useState({ motivo:"", citasData:{} });
  const [desactivando, setDesactivando]             = useState(false);

  const cargarVets = async () => {
    const { data } = await api.get("/admin/veterinarios");
    setVets(data);
  };

  const cargarCitas = async (estado) => {
    const { data } = await api.get(`/admin/citas?estado=${estado}`);
    setCitas(data);
  };

  const cargarCandidatos = async () => {
    const { data } = await api.get("/admin/veterinarios/candidatos");
    setCandidatos(data);
  };

  useEffect(() => {
    setCargando(true);
    Promise.all([cargarVets(), cargarCitas(filtroEstado)])
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargarCitas(filtroEstado); }, [filtroEstado]);

  const guardarVet = async () => {
    if (!modalVet) return;
    try {
      await api.put(`/admin/veterinarios/${modalVet.vet_id}`, formVet);
      setMsg({ texto:"Perfil actualizado.", tipo:"ok" });
      setModalVet(null);
      cargarVets();
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error.", tipo:"err" });
    }
  };

  const crearVet = async () => {
    if (!formNuevo.usuario_id) return;
    try {
      await api.post("/admin/veterinarios", formNuevo);
      setMsg({ texto:"Veterinario creado.", tipo:"ok" });
      setModalNuevo(false);
      cargarVets(); cargarCandidatos();
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error.", tipo:"err" });
    }
  };

  const enviarReagendamiento = async () => {
    if (!formReagendar.motivo.trim()) return;
    setEnviandoReagendamiento(true);
    try {
      await api.post(`/admin/citas/${modalReagendar.id}/reagendar`, {
        motivo:      formReagendar.motivo.trim(),
        nueva_fecha: formReagendar.proponer_fecha ? formReagendar.nueva_fecha : null,
        nueva_hora:  formReagendar.proponer_fecha ? formReagendar.nueva_hora  : null,
      });
      setMsg({ texto:"Notificación de reagendamiento enviada al cliente.", tipo:"ok" });
      setModalReagendar(null);
      setFormReagendar({ motivo:"", nueva_fecha:"", nueva_hora:"", proponer_fecha:false });
      cargarCitas(filtroEstado);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al enviar notificación.", tipo:"err" });
    } finally {
      setEnviandoReagendamiento(false);
    }
  };

  const iniciarDesactivacion = async (v) => {
    try {
      const { data: citasHoy } = await api.get(`/admin/veterinarios/${v.vet_id}/citas-hoy`);
      // Inicializar fechas vacías para cada cita
      const citasData = {};
      citasHoy.forEach(c => { citasData[c.id] = { nueva_fecha:"", nueva_hora:"" }; });
      setDesactivarForm({ motivo:"", citasData });
      setModalDesactivarVet({ vet: v, citas: citasHoy });
    } catch {
      setMsg({ texto:"Error al verificar citas del día.", tipo:"err" });
    }
  };

  const setCitaFecha = (id, campo, valor) => {
    setDesactivarForm(prev => ({
      ...prev,
      citasData: { ...prev.citasData, [id]: { ...prev.citasData[id], [campo]: valor } },
    }));
  };

  const confirmarDesactivacion = async () => {
    if (!modalDesactivarVet) return;
    const { vet, citas } = modalDesactivarVet;
    setDesactivando(true);
    try {
      if (citas.length > 0) {
        const citasPayload = citas.map(c => ({
          id: c.id,
          nueva_fecha: desactivarForm.citasData[c.id]?.nueva_fecha || null,
          nueva_hora:  desactivarForm.citasData[c.id]?.nueva_hora  || null,
        }));
        const { data } = await api.post(`/admin/veterinarios/${vet.vet_id}/desactivar`, {
          motivo: desactivarForm.motivo,
          citas:  citasPayload,
        });
        setMsg({ texto: data.mensaje, tipo:"ok" });
      } else {
        await api.patch(`/admin/veterinarios/${vet.vet_id}/activo`);
        setMsg({ texto:"Veterinario desactivado.", tipo:"ok" });
      }
      setModalDesactivarVet(null);
      cargarVets();
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al desactivar.", tipo:"err" });
    } finally {
      setDesactivando(false);
    }
  };

  const FILTROS_CITA = [
    { k:"pendiente",  l:"Pendientes" },
    { k:"confirmada", l:"Confirmadas" },
    { k:"completada", l:"Completadas" },
    { k:"rechazada",  l:"Rechazadas" },
    { k:"",           l:"Todas" },
  ];

  return (
    <div className="space-y-5">
      {/* Modal editar vet */}
      {modalVet && (
        <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={() => setModalVet(null)}>
          <div style={{ background:T.surface,borderRadius:20,width:"100%",maxWidth:440,padding:28,boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4" style={{ color:T.text }}>
              Editar perfil — {modalVet.nombre} {modalVet.apellido}
            </h3>
            <div className="space-y-3">
              <Input label="Especialidad" value={formVet.especialidad}
                onChange={e => setFormVet(p=>({...p,especialidad:e.target.value}))}/>
              <Input label="Duración de cita (min)" type="number" value={formVet.duracion_cita}
                onChange={e => setFormVet(p=>({...p,duracion_cita:Number(e.target.value)}))}/>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>Descripción</label>
                <textarea rows={3} value={formVet.descripcion}
                  onChange={e => setFormVet(p=>({...p,descripcion:e.target.value}))}
                  placeholder="Descripción visible para los clientes..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none"
                  style={{ border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text }}/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Btn variant="outline" onClick={() => setModalVet(null)}>Cancelar</Btn>
              <Btn onClick={guardarVet}>Guardar cambios</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo vet */}
      {modalNuevo && (
        <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={() => setModalNuevo(false)}>
          <div style={{ background:T.surface,borderRadius:20,width:"100%",maxWidth:440,padding:28 }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4" style={{ color:T.text }}>Asignar veterinario</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>Usuario</label>
                <select value={formNuevo.usuario_id}
                  onChange={e => setFormNuevo(p=>({...p,usuario_id:e.target.value}))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                  style={{ border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text }}>
                  <option value="">Seleccionar usuario...</option>
                  {candidatos.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.email})</option>
                  ))}
                </select>
              </div>
              <Input label="Especialidad" value={formNuevo.especialidad}
                onChange={e => setFormNuevo(p=>({...p,especialidad:e.target.value}))}/>
              <Input label="Duración cita (min)" type="number" value={formNuevo.duracion_cita}
                onChange={e => setFormNuevo(p=>({...p,duracion_cita:Number(e.target.value)}))}/>
            </div>
            <div className="flex gap-3 mt-5">
              <Btn variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Btn>
              <Btn onClick={crearVet} disabled={!formNuevo.usuario_id}>Crear perfil</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Modal reagendar cita */}
      {modalReagendar && (
        <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
          onClick={() => setModalReagendar(null)}>
          <div style={{ background:T.surface,borderRadius:20,width:"100%",maxWidth:500,padding:28,boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-1" style={{ color:T.text }}>Notificar reagendamiento</h3>
            <p className="text-xs mb-5" style={{ color:T.textMuted }}>
              Cita <strong style={{color:T.brand}}>{modalReagendar.codigo}</strong> · {modalReagendar.cliente_nombre} {modalReagendar.cliente_apellido} · {modalReagendar.nombre_mascota}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>
                  Mensaje / motivo para el cliente *
                </label>
                <textarea rows={4} value={formReagendar.motivo}
                  onChange={e => setFormReagendar(p=>({...p,motivo:e.target.value}))}
                  placeholder="Ejemplo: Lamentamos informarte que el Dr. García no podrá atenderte el día de tu cita por un percance de salud. Pedimos disculpas por los inconvenientes."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none"
                  style={{ border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text,lineHeight:1.6 }}
                  onFocus={e=>{e.target.style.borderColor=T.brand;}} onBlur={e=>{e.target.style.borderColor=T.border;}}
                  autoFocus/>
              </div>

              <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 14px",borderRadius:10,background:T.surfaceAlt,border:`1px solid ${T.border}` }}>
                <input type="checkbox" checked={formReagendar.proponer_fecha}
                  onChange={e => setFormReagendar(p=>({...p,proponer_fecha:e.target.checked}))}
                  style={{ width:16,height:16,accentColor:T.brand,cursor:"pointer" }}/>
                <span className="text-sm font-medium" style={{ color:T.textSec }}>Proponer nueva fecha y hora</span>
              </label>

              {formReagendar.proponer_fecha && (
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1" style={{ minWidth:140 }}>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>Nueva fecha</label>
                    <input type="date" value={formReagendar.nueva_fecha}
                      onChange={e => setFormReagendar(p=>({...p,nueva_fecha:e.target.value}))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                      style={{ border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text }}
                      onFocus={e=>{e.target.style.borderColor=T.brand;}} onBlur={e=>{e.target.style.borderColor=T.border;}}/>
                  </div>
                  <div className="flex-1" style={{ minWidth:120 }}>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>Nueva hora</label>
                    <input type="time" value={formReagendar.nueva_hora}
                      onChange={e => setFormReagendar(p=>({...p,nueva_hora:e.target.value}))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
                      style={{ border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text }}
                      onFocus={e=>{e.target.style.borderColor=T.brand;}} onBlur={e=>{e.target.style.borderColor=T.border;}}/>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Btn variant="outline" onClick={() => setModalReagendar(null)}>Cancelar</Btn>
              <Btn onClick={enviarReagendamiento}
                disabled={!formReagendar.motivo.trim() || enviandoReagendamiento ||
                  (formReagendar.proponer_fecha && (!formReagendar.nueva_fecha || !formReagendar.nueva_hora))}>
                {enviandoReagendamiento ? "Enviando..." : "Enviar notificación al cliente"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Modal desactivar vet */}
      {modalDesactivarVet && (
        <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
          onClick={() => setModalDesactivarVet(null)}>
          <div style={{ background:T.surface,borderRadius:20,width:"100%",maxWidth:700,boxShadow:"0 24px 64px rgba(0,0,0,0.22)",maxHeight:"90vh",display:"flex",flexDirection:"column" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding:"22px 28px 18px",borderBottom:`1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background:T.dangerBg }}>⚠️</div>
                <div>
                  <h3 className="text-base font-bold" style={{ color:T.text }}>Desactivar veterinario</h3>
                  <p className="text-xs" style={{ color:T.textMuted }}>
                    {modalDesactivarVet.vet.nombre} {modalDesactivarVet.vet.apellido} · {modalDesactivarVet.vet.especialidad || "Sin especialidad"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cuerpo scrolleable */}
            <div style={{ flex:1,overflowY:"auto",padding:"20px 28px" }}>
              {modalDesactivarVet.citas.length === 0 ? (
                <div className="p-4 rounded-xl" style={{ background:T.successBg, border:`1px solid ${T.successBorder}` }}>
                  <p className="text-sm font-semibold" style={{ color:T.success }}>✓ Sin citas confirmadas para hoy</p>
                  <p className="text-xs mt-1" style={{ color:"#166534" }}>El veterinario puede desactivarse sin necesidad de notificar clientes.</p>
                </div>
              ) : (
                <>
                  {/* Alerta */}
                  <div className="p-4 rounded-xl mb-5" style={{ background:T.warningBg, border:`1px solid ${T.warningBorder}` }}>
                    <p className="text-sm font-bold" style={{ color:T.warning }}>
                      ⚠ {modalDesactivarVet.citas.length} cita{modalDesactivarVet.citas.length > 1 ? "s" : ""} confirmada{modalDesactivarVet.citas.length > 1 ? "s" : ""} para hoy
                    </p>
                    <p className="text-xs mt-1" style={{ color:"#78350f" }}>
                      Asigna una nueva fecha y hora para cada cita. El cliente recibirá el correo con la propuesta y tendrá <strong>1 hora</strong> para confirmar o rechazar.
                    </p>
                  </div>

                  {/* Motivo global */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>
                      Mensaje / motivo para todos los clientes *
                    </label>
                    <textarea rows={3} value={desactivarForm.motivo}
                      onChange={e => setDesactivarForm(p=>({...p,motivo:e.target.value}))}
                      placeholder="Ej: El Dr. García no podrá atender hoy por un percance de salud. Lamentamos los inconvenientes."
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none"
                      style={{ border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text,lineHeight:1.6 }}
                      onFocus={e=>{e.target.style.borderColor=T.warning;}} onBlur={e=>{e.target.style.borderColor=T.border;}}/>
                  </div>

                  {/* Tabla de citas con pickers */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:T.textTer }}>
                      Proponer nueva fecha y hora por cita
                    </label>
                    <div style={{ border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden" }}>
                      <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:T.surfaceAlt }}>
                            {["Cliente","Mascota","Hora orig.","Nueva fecha","Nueva hora"].map((h,i) => (
                              <th key={h} style={{ textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,color:T.textTer,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {modalDesactivarVet.citas.map((c,i) => {
                            const fd = desactivarForm.citasData[c.id] || {};
                            return (
                              <tr key={c.id} style={{ borderBottom: i < modalDesactivarVet.citas.length-1?`1px solid ${T.borderSub}`:"none", background:i%2===0?T.surface:T.surfaceAlt }}>
                                <td style={{ padding:"10px 14px" }}>
                                  <p style={{ margin:0,fontSize:12,fontWeight:700,color:T.text }}>{c.cliente_nombre} {c.cliente_apellido}</p>
                                  <p style={{ margin:0,fontSize:10,color:T.textMuted }}>{c.cliente_email}</p>
                                </td>
                                <td style={{ padding:"10px 14px",fontSize:12,color:T.textSec }}>{c.nombre_mascota}</td>
                                <td style={{ padding:"10px 14px",fontSize:13,fontWeight:700,color:T.brand,fontFamily:"monospace" }}>
                                  {c.hora?.slice(0,5)}
                                </td>
                                <td style={{ padding:"8px 10px" }}>
                                  <input type="date" value={fd.nueva_fecha||""}
                                    onChange={e => setCitaFecha(c.id,"nueva_fecha",e.target.value)}
                                    style={{ width:"100%",padding:"7px 10px",borderRadius:8,border:`1.5px solid ${T.border}`,background:T.surface,color:T.text,fontSize:12,outline:"none" }}
                                    onFocus={e=>{e.target.style.borderColor=T.brand;}} onBlur={e=>{e.target.style.borderColor=T.border;}}/>
                                </td>
                                <td style={{ padding:"8px 10px" }}>
                                  <input type="time" value={fd.nueva_hora||""}
                                    onChange={e => setCitaFecha(c.id,"nueva_hora",e.target.value)}
                                    style={{ width:"100%",padding:"7px 10px",borderRadius:8,border:`1.5px solid ${T.border}`,background:T.surface,color:T.text,fontSize:12,outline:"none" }}
                                    onFocus={e=>{e.target.style.borderColor=T.brand;}} onBlur={e=>{e.target.style.borderColor=T.border;}}/>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs mt-2" style={{ color:T.textMuted }}>
                      Las fechas propuestas bloquean ese horario para nuevas citas. El cliente tiene 1 hora para responder.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding:"16px 28px 22px",borderTop:`1px solid ${T.border}`,display:"flex",gap:12 }}>
              <Btn variant="outline" onClick={() => setModalDesactivarVet(null)}>Cancelar</Btn>
              <button
                onClick={confirmarDesactivacion}
                disabled={desactivando || (modalDesactivarVet.citas.length > 0 && !desactivarForm.motivo.trim())}
                className="flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                style={{ background:T.danger, color:"#fff" }}>
                {desactivando
                  ? "Desactivando..."
                  : modalDesactivarVet.citas.length > 0
                    ? `Desactivar y notificar ${modalDesactivarVet.citas.length} cliente${modalDesactivarVet.citas.length > 1 ? "s" : ""}`
                    : "Confirmar desactivación"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Msg texto={msg.texto} tipo={msg.tipo}/>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{k:"citas",l:"Citas"},{k:"perfiles",l:"Perfiles"}].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className="px-4 py-2 text-xs font-semibold rounded-xl transition-all"
            style={{ background:tab===t.k?T.brand:T.surfaceAlt, color:tab===t.k?"#fff":T.textSec, border:`1.5px solid ${tab===t.k?T.brand:T.border}` }}>
            {t.l}
          </button>
        ))}
        {tab === "citas" && (
          <div className="flex gap-1.5 flex-wrap">
            {FILTROS_CITA.map(f => (
              <button key={f.k} onClick={() => setFiltroEstado(f.k)}
                className="px-3 py-1.5 text-xs rounded-lg transition-all"
                style={{ background:filtroEstado===f.k?T.brandLight:T.surface, color:filtroEstado===f.k?T.brand:T.textSec, border:`1.5px solid ${filtroEstado===f.k?T.brand:T.border}`, fontWeight:filtroEstado===f.k?700:400 }}>
                {f.l}
              </button>
            ))}
          </div>
        )}
        {tab === "perfiles" && (
          <button className="ml-auto px-4 py-2 text-xs font-semibold rounded-xl"
            style={{ background:T.brand,color:"#fff" }}
            onClick={() => { cargarCandidatos(); setModalNuevo(true); }}>
            + Asignar veterinario
          </button>
        )}
      </div>

      {/* Contenido */}
      {cargando ? <Spinner/> : tab === "citas" ? (
        <Card>
          {citas.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color:T.textMuted }}>
              Sin citas con ese filtro
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <THead cols={["Código","Cliente","Mascota","Veterinario","Fecha","Hora","Estado","Acción"]}/>
                <tbody>
                  {citas.map((c,i) => (
                    <tr key={c.id} style={{ borderBottom:`1px solid ${T.borderSub}`,background:c.reagendamiento_estado==="aceptada"?"#eff6ff":c.reagendamiento_estado==="propuesta"?"#fffbeb":i%2===0?T.surface:T.surfaceAlt }}>
                      <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color:T.brand }}>{c.codigo}</td>
                      <td className="py-3 px-4">
                        <p className="text-xs font-semibold" style={{ color:T.text }}>{c.cliente_nombre} {c.cliente_apellido}</p>
                        <p className="text-xs" style={{ color:T.textMuted }}>{c.cliente_email}</p>
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color:T.textSec }}>
                        {c.nombre_mascota} <span style={{ color:T.textMuted }}>({c.especie_mascota})</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs font-semibold" style={{ color:T.text }}>{c.vet_nombre} {c.vet_apellido}</p>
                        <p className="text-xs" style={{ color:T.textMuted }}>{c.especialidad}</p>
                      </td>
                      <td className="py-3 px-4 text-xs tabular-nums" style={{ color:T.textSec }}>{c.fecha}</td>
                      <td className="py-3 px-4 text-xs tabular-nums" style={{ color:T.textSec }}>{c.hora?.slice(0,5)}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <BadgeCita estado={c.estado}/>
                          {c.reagendamiento_estado === "propuesta" && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background:"#fef3c7",color:"#92400e",border:"1px solid #fde68a" }}>
                              Esperando cliente
                            </span>
                          )}
                          {c.reagendamiento_estado === "aceptada" && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background:"#dcfce7",color:"#14532d",border:"1px solid #bbf7d0" }}>
                              Reagendada ✓
                            </span>
                          )}
                          {c.reagendamiento_estado === "rechazada" && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background:"#fee2e2",color:"#7f1d1d",border:"1px solid #fecaca" }}>
                              Propuesta rechazada
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {["pendiente","confirmada"].includes(c.estado) && c.reagendamiento_estado !== "propuesta" && (
                          <button
                            onClick={() => {
                              setModalReagendar(c);
                              setFormReagendar({ motivo:"", nueva_fecha:"", nueva_hora:"", proponer_fecha:false });
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                            style={{ background:T.warningBg,color:T.warning,border:`1.5px solid ${T.warningBorder}` }}
                            onMouseEnter={e=>{e.currentTarget.style.background=T.warning;e.currentTarget.style.color="#fff";}}
                            onMouseLeave={e=>{e.currentTarget.style.background=T.warningBg;e.currentTarget.style.color=T.warning;}}>
                            Reagendar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        /* Perfiles */
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))" }}>
          {vets.length === 0 ? (
            <Card className="p-10 text-center col-span-full">
              <p className="text-sm font-semibold mb-1" style={{ color:T.text }}>Sin veterinarios registrados</p>
              <p className="text-xs" style={{ color:T.textMuted }}>Usa el botón "Asignar veterinario" para agregar uno.</p>
            </Card>
          ) : vets.map(v => (
            <Card key={v.usuario_id} className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background:T.brandLight, color:T.brand }}>
                  {v.nombre?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color:T.text }}>{v.nombre} {v.apellido}</p>
                  <p className="text-xs truncate" style={{ color:T.textMuted }}>{v.email}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color:T.brand }}>{v.especialidad || "Sin especialidad"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label:"Citas totales", value:v.total_citas ?? 0 },
                  { label:"Pendientes",    value:v.citas_pendientes ?? 0, highlight:true },
                  { label:"Duración",      value:`${v.duracion_cita ?? 30} min` },
                  { label:"Estado",        value:v.vet_activo ? "Activo" : "Inactivo" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg px-3 py-2"
                    style={{ background:s.highlight&&s.value>0?T.warningBg:T.surfaceAlt, border:`1px solid ${s.highlight&&s.value>0?T.warningBorder:T.border}` }}>
                    <p className="text-xs" style={{ color:T.textMuted }}>{s.label}</p>
                    <p className="text-sm font-bold tabular-nums" style={{ color:s.highlight&&s.value>0?T.warning:T.text }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {v.vet_id ? (
                <div className="flex gap-2 flex-wrap">
                  <Btn size="xs" variant="outline" onClick={() => {
                    setModalVet(v);
                    setFormVet({ especialidad:v.especialidad||"", duracion_cita:v.duracion_cita||30, descripcion:v.descripcion||"" });
                  }}>
                    Editar perfil
                  </Btn>
                  <button
                    onClick={async () => {
                      if (v.vet_activo) {
                        // Desactivar: verificar citas del día primero
                        await iniciarDesactivacion(v);
                      } else {
                        // Activar: toggle directo
                        try {
                          await api.patch(`/admin/veterinarios/${v.vet_id}/activo`);
                          cargarVets();
                        } catch (err) {
                          setMsg({ texto: err.response?.data?.error || "Error.", tipo:"err" });
                        }
                      }
                    }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
                    style={{
                      background: v.vet_activo ? T.dangerBg : T.successBg,
                      color: v.vet_activo ? T.danger : T.success,
                      border: `1.5px solid ${v.vet_activo ? T.dangerBorder : T.successBorder}`,
                    }}>
                    {v.vet_activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              ) : (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background:T.dangerBg, color:T.danger, border:`1px solid ${T.dangerBorder}` }}>
                  Sin perfil veterinario — usa "Asignar veterinario"
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LAYOUT PRINCIPAL ─────────────────────────────────────────
export default function Admin() {
  const { C: T } = useTheme();
  const {usuario,esAdmin}=useAuth();
  const navigate=useNavigate();
  const [seccion,setSeccion]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [notifs,setNotifs]=useState({total:0,items:[],conteos:{}});
  const [bellAbierto,setBellAbierto]=useState(false);
  const bellRef=useRef(null);

  useEffect(()=>{if(!esAdmin) navigate("/");},[esAdmin,navigate]);

  const cargarNotifs=()=>{
    api.get("/admin/notificaciones").then(r=>setNotifs(r.data)).catch(()=>{});
  };
  useEffect(()=>{
    cargarNotifs();
    const iv=setInterval(cargarNotifs,60_000);
    return()=>clearInterval(iv);
  },[]);
  useEffect(()=>{
    if(!bellAbierto)return;
    const handler=e=>{if(bellRef.current&&!bellRef.current.contains(e.target))setBellAbierto(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[bellAbierto]);

  const renderSeccion=()=>{
    if(seccion==="dashboard")       return <Dashboard/>;
    if(seccion==="usuarios")        return <Usuarios/>;
    if(seccion==="productos")       return <Productos/>;
    if(seccion==="ordenes")         return <Ordenes/>;
    if(seccion==="cajeros")         return <Cajeros onIrUsuarios={()=>setSeccion("usuarios")}/>;
    if(seccion==="objetivos")       return <Objetivos/>;
    if(seccion==="reporte-ventas")  return <ReporteVentas/>;
    if(seccion==="reporte-salidas") return <ReporteSalidas/>;
    // ── Galería de imágenes ──
    if(seccion==="galeria")         return <GaleriaAdmin T={T}/>;
    if(seccion==="proveedores")     return <Proveedores/>;
    if(seccion==="veterinarios")    return <Veterinarios/>;
  };

  return (
    <>
    <style>{`
      @keyframes sideIn  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
      @keyframes mainIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes shimmer { to{background-position:-200% 0} }
      @keyframes spin    { to{transform:rotate(360deg)} }
      .vp-admin-side { animation: sideIn 0.35s cubic-bezier(0.16,1,0.3,1); }
      .vp-admin-main { animation: mainIn 0.4s cubic-bezier(0.16,1,0.3,1); }
      .vp-section    { animation: fadeUp 0.3s ease; }
    `}</style>
    <div className="min-h-screen flex" style={{background:T.canvas}}>
      {/* Sidebar */}
      <aside className={`vp-admin-side ${collapsed?"w-14":"w-52"} flex flex-col flex-shrink-0 transition-all duration-200`}
        style={{background:T.sidebar,borderRight:`1px solid ${T.sidebarBorder}`}}>

        {/* Logo */}
        <div className="px-3 py-4" style={{borderBottom:`1px solid ${T.sidebarBorder}`}}>
          {!collapsed
            ? <Link to="/" className="flex items-center gap-2.5 group" style={{textDecoration:"none"}}>
                <img src={logoVP} alt="Victoria Pets"
                  style={{width:36,height:36,borderRadius:10,objectFit:"cover",border:"2px solid rgba(196,232,213,0.25)",flexShrink:0,transition:"border-color 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(196,232,213,0.55)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(196,232,213,0.25)"}
                />
                <div>
                  <p className="text-sm font-bold leading-none" style={{color:T.sidebarTextHi,fontFamily:font.display,fontStyle:"italic"}}>Victoria Pets</p>
                  <p style={{fontSize:9,letterSpacing:1.8,textTransform:"uppercase",color:T.sidebarText,marginTop:3,fontWeight:700}}>Panel Admin</p>
                </div>
              </Link>
            : <Link to="/" className="flex justify-center" style={{textDecoration:"none"}}>
                <img src={logoVP} alt="Victoria Pets"
                  style={{width:34,height:34,borderRadius:10,objectFit:"cover",border:"2px solid rgba(196,232,213,0.25)"}}
                />
              </Link>
          }
        </div>

        {/* Usuario */}
        {!collapsed&&usuario&&(
          <div className="px-3 py-3" style={{borderBottom:`1px solid ${T.sidebarBorder}`}}>
            <div className="flex items-center gap-2 rounded-xl px-2.5 py-2"
              style={{background:"rgba(10,107,64,0.35)",border:`1px solid rgba(149,204,173,0.15)`}}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{background:`linear-gradient(135deg,${T.brand},${T.brandMid})`,color:"#fff",border:"1.5px solid rgba(196,232,213,0.3)"}}>
                {usuario.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{color:T.sidebarTextHi}}>{usuario.nombre}</p>
                <p className="text-xs capitalize" style={{color:T.lime,opacity:0.8,fontSize:10}}>{usuario.rol}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {NAV.map(s=>(
            <button key={s.id} onClick={()=>setSeccion(s.id)} title={collapsed?s.label:undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${seccion===s.id?"font-bold":"font-medium"}`}
              style={{
                background: seccion===s.id?T.sidebarActive:"transparent",
                color: seccion===s.id?T.sidebarTextHi:T.sidebarText,
                borderLeft: seccion===s.id?`2px solid ${T.gold}`:"2px solid transparent",
              }}
              onMouseEnter={e=>{if(seccion!==s.id)e.currentTarget.style.background=T.sidebarActive;}}
              onMouseLeave={e=>{if(seccion!==s.id)e.currentTarget.style.background="transparent";}}>
              <NavIcon d={s.d}/>
              {!collapsed&&<span>{s.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-2" style={{borderTop:`1px solid ${T.sidebarBorder}`}}>
          {/* Ir a la tienda */}
          <Link to="/" title={collapsed?"Ir a la tienda":undefined}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all mb-1"
            style={{color:T.sidebarText,textDecoration:"none"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(10,107,64,0.45)";e.currentTarget.style.color=T.sidebarTextHi;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.sidebarText;}}>
            <svg className="w-[15px] h-[15px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            {!collapsed&&<span>Ir a la tienda</span>}
          </Link>

          {/* Colapsar / expandir */}
          <button onClick={()=>setCollapsed(!collapsed)} title={collapsed?"Expandir sidebar":"Colapsar sidebar"}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{color:T.sidebarText,background:"transparent"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(10,107,64,0.45)";e.currentTarget.style.color=T.sidebarTextHi;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.sidebarText;}}>
            <svg className="w-[15px] h-[15px] flex-shrink-0 transition-transform duration-300"
              style={{transform:collapsed?"rotate(180deg)":"rotate(0deg)"}}
              fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7"/>
            </svg>
            {!collapsed&&<span>Colapsar panel</span>}
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="vp-admin-main flex-1 min-w-0 flex flex-col">
        <header className="px-8 py-4 flex items-center justify-between"
          style={{background:T.surface,borderBottom:`1px solid ${T.border}`}}>
          <div>
            <h1 className="text-base font-bold" style={{color:T.text,fontFamily:font.display}}>
              {TITULOS[seccion]}
            </h1>
            <p className="text-xs mt-0.5" style={{color:T.textMuted}}>
              {new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sistema activo */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:T.success}}/>
              <span className="text-xs font-medium" style={{color:T.textMuted}}>Sistema activo</span>
            </div>

            {/* Campanita */}
            <div className="relative" ref={bellRef}>
              <button onClick={()=>setBellAbierto(p=>!p)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                style={{background:bellAbierto?T.surfaceAlt:T.surfaceAlt, border:`1px solid ${T.border}`}}
                onMouseEnter={e=>{e.currentTarget.style.background=T.surfaceHover;e.currentTarget.style.borderColor=T.brandBorder;}}
                onMouseLeave={e=>{e.currentTarget.style.background=T.surfaceAlt;e.currentTarget.style.borderColor=T.border;}}>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"
                  style={{color:notifs.total>0?T.warning:T.textTer}}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {notifs.total > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-bold"
                    style={{width:17,height:17,fontSize:9,background:"#dc2626",border:`2px solid ${T.surface}`,lineHeight:1}}>
                    {notifs.total > 9 ? "9+" : notifs.total}
                  </span>
                )}
              </button>

              {/* Dropdown notificaciones */}
              {bellAbierto && (
                <div className="absolute right-0 top-11 z-50 rounded-2xl overflow-hidden"
                  style={{width:320,background:T.surface,border:`1px solid ${T.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:`1px solid ${T.border}`}}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{color:T.text}}>Notificaciones</p>
                      {notifs.total > 0
                        ? <p className="text-xs" style={{color:T.textMuted}}>{notifs.total} asunto{notifs.total>1?"s":""} requieren atención</p>
                        : <p className="text-xs" style={{color:T.textMuted}}>Todo al día</p>}
                    </div>
                    <button onClick={()=>{cargarNotifs();}} title="Actualizar"
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                      style={{background:T.surfaceAlt}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover}
                      onMouseLeave={e=>e.currentTarget.style.background=T.surfaceAlt}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{color:T.textTer}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </button>
                  </div>

                  <div className="py-1 max-h-72 overflow-y-auto">
                    {notifs.items.length === 0 ? (
                      <div className="flex flex-col items-center py-8 gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{background:T.successBg}}>✓</div>
                        <p className="text-xs font-medium" style={{color:T.success}}>Sin alertas pendientes</p>
                      </div>
                    ) : notifs.items.map((it,i) => {
                      const colors = {
                        warning: {bg:T.warningBg, text:T.warning, border:T.warningBorder},
                        danger:  {bg:T.dangerBg,  text:T.danger,  border:T.dangerBorder},
                        info:    {bg:T.infoBg,    text:T.info,    border:T.infoBorder},
                      }[it.nivel] || {bg:T.surfaceAlt, text:T.textSec, border:T.border};
                      const iconos = { cita:"🐾", reagendamiento:"📅", orden:"🛒", stock:"⚠️" };
                      return (
                        <div key={i} className="mx-2 my-1 flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                          style={{background:colors.bg, border:`1px solid ${colors.border}`}}>
                          <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{iconos[it.tipo]||"•"}</span>
                          <p className="text-xs leading-relaxed font-medium" style={{color:colors.text}}>{it.texto}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Accesos rápidos */}
                  <div className="px-3 py-2.5 flex gap-1.5" style={{borderTop:`1px solid ${T.border}`}}>
                    {notifs.conteos?.citas > 0 && (
                      <button onClick={()=>{setSeccion("veterinarios");setBellAbierto(false);}}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{background:T.warningBg,color:T.warning}}>
                        Ver citas
                      </button>
                    )}
                    {notifs.conteos?.ordenes > 0 && (
                      <button onClick={()=>{setSeccion("ordenes");setBellAbierto(false);}}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{background:T.infoBg,color:T.info}}>
                        Ver órdenes
                      </button>
                    )}
                    {notifs.conteos?.stock > 0 && (
                      <button onClick={()=>{setSeccion("productos");setBellAbierto(false);}}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{background:T.dangerBg,color:T.danger}}>
                        Ver stock
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="vp-section" key={seccion}>
            {renderSeccion()}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}