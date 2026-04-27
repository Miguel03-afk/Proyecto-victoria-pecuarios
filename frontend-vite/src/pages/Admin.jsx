// src/pages/Admin.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Objetivos from "../components/Objetivos.jsx";
import ReporteVentas from "./admin/ReporteVentas.jsx";
import GaleriaAdmin from "./admin/GaleriaAdmin";
import ReporteSalidas from "./admin/ReporteSalidas.jsx";
import { T, shadow, font, fmt, fmtShort, fdoc, estadoStyle } from "../styles/admin.tokens";
import logoVP from "../assets/WhatsApp Image 2026-04-22 at 1.19.17 PM.jpeg";

// ─── Constantes ───────────────────────────────────────────────
const ESTADOS = ["pendiente","pagada","procesando","enviada","entregada","cancelada"];

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
];

const TITULOS = {
  dashboard:"Dashboard", usuarios:"Usuarios", productos:"Productos",
  ordenes:"Órdenes", cajeros:"Cajeros", objetivos:"Objetivos",
  "reporte-ventas":"Reporte de ventas", "reporte-salidas":"Salidas de stock",
  // ── Galería ──
  galeria:"Galería de imágenes",
  proveedores:"Proveedores",
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
function Dashboard() {
  const [stats,    setStats]    = useState(null);
  const [citas,    setCitas]    = useState(null);  // stats de citas
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);
  const [tabGraf,  setTabGraf]  = useState("ventas"); // "ventas" | "ordenes"

  const cargar = () => {
    setCargando(true); setError(null);
    Promise.all([
      api.get("/admin/stats"),
      // Citas: intenta cargar, falla silenciosamente si no existe el endpoint
      api.get("/veterinario/agenda", { params:{ estado:"todas" } })
        .catch(() => ({ data: [] })),
    ])
    .then(([s, c]) => {
      setStats(s.data);
      // Calcular métricas de citas desde el array
      const arr = Array.isArray(c.data) ? c.data : [];
      setCitas({
        total:      arr.length,
        pendientes: arr.filter(x => x.estado === "pendiente").length,
        confirmadas:arr.filter(x => x.estado === "confirmada").length,
        completadas:arr.filter(x => x.estado === "completada").length,
        hoy:        arr.filter(x => x.fecha === new Date().toISOString().split("T")[0]).length,
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
      <p className="text-xs max-w-xs" style={{color:T.textMuted}}>
        Verifica que el backend esté corriendo y que hayas ejecutado las migraciones en phpMyAdmin
      </p>
      <Btn onClick={cargar}>Reintentar</Btn>
    </div>
  );
  if (!stats) return null;

  // Datos de gráfica de ventas (últimos 6 meses)
  const chartData = (stats.ventas_mes||[]).map(m => ({
    mes:    m.mes?.slice(5),
    ventas: Number(m.total   || 0),
    ordenes:Number(m.ordenes || 0),
  }));

  // ── Métricas principales ──────────────────────────────────────
  const metrics = [
    { label:"Clientes",   value: stats.total_usuarios  ?? 0,        accent:T.brand,    bg:`${T.brand}12`,   d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label:"Productos",  value: stats.total_productos ?? 0,        accent:T.brandMid, bg:`${T.brandMid}12`,d:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { label:"Órdenes",    value: stats.total_ordenes   ?? 0,        accent:T.gold,     bg:`${T.gold}12`,    d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" },
    { label:"Ingresos",   value: fmtShort(stats.ingresos),          accent:T.brand,    bg:`${T.brand}10`,   d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1" },
    { label:"Stock bajo", value: stats.stock_bajo      ?? 0,        accent:"#dc2626",  bg:"#dc262612",      d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  // ── Métricas de citas ─────────────────────────────────────────
  const metricsCitas = citas ? [
    { label:"Total citas",   value: citas.total,      accent:"#7c3aed", bg:"#7c3aed12" },
    { label:"Pendientes",    value: citas.pendientes, accent:"#d97706", bg:"#d9770612" },
    { label:"Confirmadas",   value: citas.confirmadas,accent:T.info,    bg:`${T.info}12` },
    { label:"Completadas",   value: citas.completadas,accent:T.success, bg:`${T.success}12` },
    { label:"Hoy",           value: citas.hoy,        accent:T.brand,   bg:`${T.brand}12` },
  ] : [];

  // ── Estado del mes (barra de progreso vs objetivo) ────────────
  const ingresosNum = Number(String(stats.ingresos||"0").replace(/[^0-9]/g,"")) || 0;

  return (
    <div className="space-y-5">

      {/* ── FILA 1: Métricas principales ── */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {metrics.map(({label,value,accent,bg,d}) => (
          <Card key={label} className="p-4 hover:scale-[1.01] transition-transform duration-150 cursor-default">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{background:bg, border:`1px solid ${accent}22`}}>
              <svg className="w-3.5 h-3.5" fill="none" stroke={accent} strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
              </svg>
            </div>
            <p className="text-xl font-bold tabular-nums leading-none" style={{color:T.text,fontFamily:font.mono}}>{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-1.5" style={{color:T.textMuted}}>{label}</p>
          </Card>
        ))}
      </div>

      {/* ── FILA 2: KPIs del mes + métricas de citas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* KPIs financieros del mes */}
        {(stats.ganancia_mes != null || stats.iva_mes != null) && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider" style={{color:T.textMuted}}>Este mes</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{background:T.brandLight, color:T.brand}}>
                {new Date().toLocaleDateString("es-CO",{month:"long",year:"numeric"})}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Ganancia",      value:fmtShort(stats.ganancia_mes||0), color:T.success, bg:T.successBg,  icon:"📈" },
                { label:"IVA (19%)",     value:fmtShort(stats.iva_mes||0),      color:T.info,    bg:T.infoBg,     icon:"🧾" },
                { label:"Ingresos",      value:fmtShort(stats.ingresos||0),     color:T.brand,   bg:T.brandLight, icon:"💰" },
                { label:"Órdenes hoy",   value: stats.ordenes_recientes?.filter(o=>{
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

        {/* Métricas de citas */}
        {citas && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider" style={{color:T.textMuted}}>Citas veterinarias</p>
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
            {/* Mini barra de estado de citas */}
            {citas.total > 0 && (
              <div className="mt-4 pt-4" style={{borderTop:`1px solid ${T.border}`}}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs" style={{color:T.textMuted}}>Tasa de completadas</p>
                  <p className="text-xs font-bold tabular-nums" style={{color:T.text,fontFamily:font.mono}}>
                    {Math.round((citas.completadas/citas.total)*100)}%
                  </p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{background:T.border}}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{width:`${Math.round((citas.completadas/citas.total)*100)}%`, background:T.brand}}/>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ── FILA 3: Gráfica dual ventas / órdenes ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SecTitle sub="Últimos 6 meses">Tendencia</SecTitle>
          {/* Tabs de la gráfica */}
          <div className="flex rounded-lg overflow-hidden" style={{border:`1px solid ${T.border}`}}>
            {[{k:"ventas",label:"Ingresos"},{k:"ordenes",label:"Órdenes"}].map(t => (
              <button key={t.k} onClick={() => setTabGraf(t.k)}
                className="text-xs font-semibold px-3 py-1.5 transition-colors"
                style={{
                  background: tabGraf===t.k ? T.brand : T.surface,
                  color:      tabGraf===t.k ? "#fff" : T.textTer,
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <p className="text-sm" style={{color:T.textMuted}}>Sin datos registrados aún</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{top:4,right:4,bottom:0,left:0}}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.brand} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={T.brand} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="go" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.gold}  stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={T.gold}  stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="mes" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}
                tickFormatter={v => tabGraf==="ventas" ? fmtShort(v) : v}/>
              <Tooltip
                formatter={v => tabGraf==="ventas" ? [fmt(v),"Ingresos"] : [v,"Órdenes"]}
                contentStyle={{borderRadius:10,border:`1px solid ${T.border}`,fontSize:12,background:T.surface}}/>
              {tabGraf === "ventas"
                ? <Area type="monotone" dataKey="ventas"  stroke={T.brand} strokeWidth={2} fill="url(#gv)" name="Ingresos"/>
                : <Area type="monotone" dataKey="ordenes" stroke={T.gold}  strokeWidth={2} fill="url(#go)" name="Órdenes"/>
              }
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── FILA 4: Órdenes recientes + Stock crítico + Citas pendientes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Órdenes recientes */}
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

        {/* Stock crítico */}
        <Card className="p-5">
          <SecTitle sub="Productos por reponer">Stock crítico</SecTitle>
          {!stats.productos_stock_bajo?.length
            ? <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                  style={{background:T.successBg}}>✓</div>
                <p className="text-sm font-medium" style={{color:T.success}}>Todo el stock está bien</p>
              </div>
            : <div className="space-y-1.5">
                {stats.productos_stock_bajo.map(p => (
                  <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-xl"
                    style={{background:T.dangerBg,border:`1px solid ${T.dangerBorder}`}}>
                    {/* Barra de stock visual */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{color:T.text}}>{p.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full" style={{background:T.border}}>
                          <div className="h-full rounded-full"
                            style={{
                              width:`${Math.min(100,Math.round((p.stock/Math.max(p.stock_minimo,1))*100))}%`,
                              background:T.danger,
                            }}/>
                        </div>
                        <span className="text-xs font-bold tabular-nums flex-shrink-0"
                          style={{color:T.danger,fontFamily:font.mono}}>
                          {p.stock}/{p.stock_minimo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>

        {/* Citas pendientes de confirmación */}
        <Card className="p-5">
          <SecTitle sub="Esperan confirmación del veterinario">Citas pendientes</SecTitle>
          {!citas || citas.pendientes === 0
            ? <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                  style={{background:T.successBg}}>✓</div>
                <p className="text-sm font-medium" style={{color:T.success}}>Sin citas pendientes</p>
              </div>
            : <div className="space-y-1.5">
                {/* Resumen por estado */}
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
                <button
                  onClick={() => {/* navegar a veterinarios */}}
                  className="w-full text-xs font-semibold py-2 mt-1 rounded-xl transition-colors"
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
  const [lista,setLista]=useState([]); const [total,setTotal]=useState(0);
  const [pagina,setPagina]=useState(1); const [buscar,setBuscar]=useState("");
  const [catFiltro,setCatFiltro]=useState(""); const [cargando,setCargando]=useState(true);
  const [modal,setModal]=useState(false); const [editando,setEditando]=useState(null);
  const [categorias,setCategorias]=useState([]); const [proveedores,setProveedores]=useState([]);
  const [msg,setMsg]=useState({}); const [fieldErrors,setFieldErrors]=useState({});

  const VACIO={nombre:"",slug:"",descripcion:"",descripcion_corta:"",categoria_id:"",proveedor_id:"",
    precio:"",precio_antes:"",precio_costo:"",stock:"",stock_minimo:"5",imagen_url:"",
    marca:"",unidad:"",especie:"",destacado:false,activo:true,requiere_formula:false};
  const [form,setForm]=useState(VACIO);

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
  const abrirNuevo=()=>{setForm(VACIO);setEditando(null);setFieldErrors({});setModal(true);};
  const abrirEditar=(p)=>{
    setForm({nombre:p.nombre,slug:p.slug||"",descripcion:p.descripcion||"",
      descripcion_corta:p.descripcion_corta||"",categoria_id:p.categoria_id||"",proveedor_id:p.proveedor_id||"",
      precio:p.precio,precio_antes:p.precio_antes||"",precio_costo:p.precio_costo||"",
      stock:p.stock,stock_minimo:p.stock_minimo||5,imagen_url:p.imagen_url||"",
      marca:p.marca||"",unidad:p.unidad||"",especie:p.especie||"",
      destacado:!!p.destacado,activo:p.activo!==0,requiere_formula:!!p.requiere_formula});
    setEditando(p); setFieldErrors({}); setModal(true);
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
      if(form.marca)             p.marca=form.marca;
      if(form.unidad)            p.unidad=form.unidad;
      if(form.especie)           p.especie=form.especie;
      p.destacado=form.destacado?1:0; p.activo=form.activo?1:0; p.requiere_formula=form.requiere_formula?1:0;
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
          <Input label="URL imagen" value={form.imagen_url} onChange={ff("imagen_url")}
            placeholder="/imagenes/producto.jpg"/>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textTer}}>Especie (separadas por coma)</label>
            <input value={form.especie} onChange={ff("especie")} placeholder="ej: perros,gatos"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
              style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}/>
          </div>
          <div className="flex gap-6 pt-1">
            {[{key:"activo",label:"Activo"},{key:"destacado",label:"Destacado ★"},{key:"requiere_formula",label:"Requiere fórmula"}].map(({key,label})=>(
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[key]} onChange={fc(key)} className="rounded accent-green-700"/>
                <span className="text-sm" style={{color:T.text}}>{label}</span>
              </label>
            ))}
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
  const [lista,setLista]=useState([]); const [total,setTotal]=useState(0);
  const [pagina,setPagina]=useState(1); const [filtro,setFiltro]=useState("");
  const [cargando,setCargando]=useState(true);

  const cargar=useCallback(async()=>{
    setCargando(true);
    try{const{data}=await api.get(`/admin/ordenes?pagina=${pagina}&estado=${filtro}&limite=12`);
      setLista(data.ordenes); setTotal(data.total);}
    finally{setCargando(false);}
  },[pagina,filtro]);

  useEffect(()=>{cargar();},[cargar]);
  const cambiarEstado=async(id,estado)=>{await api.patch(`/admin/ordenes/${id}/estado`,{estado});cargar();};

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-center flex-wrap">
        <Sel value={filtro} onChange={e=>{setFiltro(e.target.value);setPagina(1);}}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e=><option key={e} value={e} className="capitalize">{e}</option>)}
        </Sel>
        <span className="text-xs font-medium" style={{color:T.textMuted}}>{total} órdenes</span>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Código","Cliente","Total","Método","Estado","Fecha","Cambiar estado"]}/>
            <tbody>
              {cargando ? <tr><td colSpan={7}><Spinner/></td></tr>
              : lista.length===0 ? <tr><td colSpan={7} className="text-center py-16 text-sm" style={{color:T.textMuted}}>Sin órdenes</td></tr>
              : lista.map((o,i)=>(
                <tr key={o.id} className="transition-colors"
                  style={{borderBottom:`1px solid ${T.borderSub}`,background:i%2===0?T.surface:T.surfaceAlt}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?T.surface:T.surfaceAlt}>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold" style={{color:T.brand}}>{o.codigo}</td>
                  <td className="py-3.5 px-4">
                    <p className="text-xs font-semibold" style={{color:T.text}}>{o.cliente}</p>
                    <p className="text-xs" style={{color:T.textMuted}}>{o.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-bold tabular-nums" style={{color:T.text}}>{fmt(o.total)}</td>
                  <td className="py-3.5 px-4 text-xs capitalize" style={{color:T.textTer}}>{o.metodo_pago||"—"}</td>
                  <td className="py-3.5 px-4"><Badge estado={o.estado}/></td>
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap" style={{color:T.textMuted}}>{fdoc(o.created_at)}</td>
                  <td className="py-3.5 px-4">
                    <select value={o.estado} onChange={e=>cambiarEstado(o.id,e.target.value)}
                      className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
                      style={{border:`1.5px solid ${T.border}`,background:T.surfaceAlt,color:T.text}}>
                      {ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4"><Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina}/></div>
      </Card>
    </div>
  );
}

// ─── CAJEROS ──────────────────────────────────────────────────
function Cajeros({ onIrUsuarios }) {
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

// ─── LAYOUT PRINCIPAL ─────────────────────────────────────────
export default function Admin() {
  const {usuario,esAdmin}=useAuth();
  const navigate=useNavigate();
  const [seccion,setSeccion]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);

  useEffect(()=>{if(!esAdmin) navigate("/");},[esAdmin,navigate]);

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
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:T.success}}/>
            <span className="text-xs font-medium" style={{color:T.textMuted}}>Sistema activo</span>
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