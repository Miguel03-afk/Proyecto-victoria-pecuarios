import { useState, useEffect } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import api from "../services/api";
import { font, fmtMil, LIGHT } from "../styles/admin.tokens";
import { useTheme } from "../styles/ThemeProvider.jsx";

const fmtCOP = (n) => "$" + new Intl.NumberFormat("es-CO").format(Number(n) || 0);
const pct    = (real, meta) => meta > 0 ? Math.min(Math.round((real / meta) * 100), 100) : 0;
const mesHoy  = () => new Date().toISOString().slice(0, 7);
const mesLabel = (m) => {
  const [y, mo] = m.split("-");
  const meses = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${meses[Number(mo)]} ${y}`;
};

// ─── Anillo SVG de progreso ─────────────────────────────────
function Anillo({ porcentaje, color, size = 88, grosor = 9 }) {
  const r   = (size - grosor) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(porcentaje, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={`${color}22`} strokeWidth={grosor} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={grosor}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
}

// ─── KPI con anillo ─────────────────────────────────────────
function KPIRing({ label, real, meta, formato = "numero", color }) {
  const { C: T } = useTheme();
  if (!color) color = T.brand;
  const porcentaje = pct(real, meta);
  const realFmt    = formato === "dinero" ? fmtCOP(real) : real.toLocaleString("es-CO");
  const metaFmt    = formato === "dinero" ? fmtCOP(meta) : meta.toLocaleString("es-CO");
  const estado     = porcentaje >= 100 ? "Completado" : porcentaje >= 70 ? "En progreso" : "Por mejorar";
  const estadoColor= porcentaje >= 100 ? T.success : porcentaje >= 70 ? T.warning : T.danger;
  const estadoBg   = porcentaje >= 100 ? T.successBg : porcentaje >= 70 ? T.warningBg : T.dangerBg;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textTer }}>{label}</p>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: estadoBg, color: estadoColor }}>{estado}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Anillo porcentaje={porcentaje} color={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold tabular-nums" style={{ color, fontFamily: font.mono }}>
              {porcentaje}%
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold tabular-nums leading-tight" style={{ color: T.text, fontFamily: font.mono }}>
            {realFmt}
          </p>
          <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Meta: {metaFmt}</p>
          {meta > 0 && real < meta && (
            <p className="text-xs mt-1 font-medium" style={{ color: T.textTer }}>
              Falta: {formato === "dinero" ? fmtCOP(meta - real) : (meta - real).toLocaleString("es-CO")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tooltip de gráfica ─────────────────────────────────────
function VPTooltip({ active, payload, label }) {
  const { C: T } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "10px 14px", fontSize: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    }}>
      <p style={{ color: T.textMuted, marginBottom: 6, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "block", flexShrink: 0 }} />
          <span style={{ color: T.textSec, fontSize: 11 }}>{p.name}:</span>
          <span style={{ color: T.text, fontWeight: 700, fontFamily: "monospace" }}>
            {typeof p.value === "number" ? fmtCOP(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Tarjeta comparación mes ─────────────────────────────────
function CompCard({ label, real, ant, variacion, formato = "numero" }) {
  const { C: T } = useTheme();
  const realFmt = formato === "dinero" ? fmtCOP(real) : Number(real).toLocaleString("es-CO");
  const antFmt  = formato === "dinero" ? fmtCOP(ant)  : Number(ant).toLocaleString("es-CO");
  const up = variacion !== null && Number(variacion) >= 0;
  return (
    <div className="rounded-2xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: T.textTer }}>{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color: T.text, fontFamily: font.mono }}>{realFmt}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-xs" style={{ color: T.textMuted }}>Anterior: {antFmt}</span>
        {variacion !== null && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: up ? T.successBg : T.dangerBg, color: up ? T.success : T.danger }}>
            {up ? "▲" : "▼"} {Math.abs(Number(variacion))}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────
export default function Objetivos() {
  const { C: T } = useTheme();
  const [mes, setMes]               = useState(mesHoy());
  const [datos, setDatos]           = useState(null);
  const [historial, setHistorial]   = useState([]);
  const [modalAbierto, setModal]    = useState(false);
  const [form, setForm]             = useState({ meta_ventas: "", meta_ordenes: "", meta_clientes: "", meta_productos: "" });
  const [guardando, setGuardando]   = useState(false);
  const [msg, setMsg]               = useState("");
  const [cargando, setCargando]     = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const [{ data: d }, { data: h }] = await Promise.all([
        api.get(`/metas?mes=${mes}`),
        api.get("/metas/historial"),
      ]);
      setDatos(d);
      setHistorial(h);
      setForm({
        meta_ventas:    d.meta.meta_ventas    || "",
        meta_ordenes:   d.meta.meta_ordenes   || "",
        meta_clientes:  d.meta.meta_clientes  || "",
        meta_productos: d.meta.meta_productos || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [mes]);

  const guardar = async () => {
    setGuardando(true);
    try {
      await api.post("/metas", {
        mes,
        meta_ventas:    Number(form.meta_ventas)    || 0,
        meta_ordenes:   Number(form.meta_ordenes)   || 0,
        meta_clientes:  Number(form.meta_clientes)  || 0,
        meta_productos: Number(form.meta_productos) || 0,
      });
      setMsg("Metas guardadas correctamente.");
      setModal(false);
      cargar();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const descargarPDF = () => {
    if (!datos) return;
    const { meta, real, anterior } = datos;
    const varVentas  = anterior.ventas  > 0 ? (((real.ventas  - anterior.ventas)  / anterior.ventas)  * 100).toFixed(1) : "N/A";
    const varOrdenes = anterior.ordenes > 0 ? (((real.ordenes - anterior.ordenes) / anterior.ordenes) * 100).toFixed(1) : "N/A";

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Reporte ${mesLabel(mes)}</title>
<style>
  body{font-family:Arial,sans-serif;margin:40px;color:#1f2937}
  h1{color:#0A6B40;font-size:22px;margin-bottom:4px}
  .sub{color:#6b7280;font-size:13px;margin-bottom:32px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}
  .card-title{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
  .card-val{font-size:22px;font-weight:bold;color:#0A6B40}
  .card-meta{font-size:12px;color:#6b7280;margin-top:4px}
  .barra-wrap{height:8px;background:#f3f4f6;border-radius:999px;overflow:hidden;margin:8px 0}
  .barra{height:100%;border-radius:999px}
  .pct{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:bold}
  .ok{background:#dcfce7;color:#0A6B40}.warn{background:#fef9c3;color:#854d0e}.bad{background:#fee2e2;color:#991b1b}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:8px 12px;background:#f9fafb;font-size:11px;color:#6b7280;text-transform:uppercase}
  td{padding:10px 12px;border-bottom:1px solid #f3f4f6}
  .footer{margin-top:40px;font-size:11px;color:#9ca3af;text-align:center}
</style></head><body>
  <h1>Reporte de objetivos — ${mesLabel(mes)}</h1>
  <div class="sub">Generado el ${new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"})} · Victoria Pets</div>
  <div class="grid">
    ${[
      {titulo:"Ventas del mes",real:fmtCOP(real.ventas),meta:fmtCOP(meta.meta_ventas),p:pct(real.ventas,meta.meta_ventas)},
      {titulo:"Órdenes",real:real.ordenes,meta:meta.meta_ordenes,p:pct(real.ordenes,meta.meta_ordenes)},
      {titulo:"Nuevos clientes",real:real.clientes,meta:meta.meta_clientes,p:pct(real.clientes,meta.meta_clientes)},
      {titulo:"Productos vendidos",real:real.productos,meta:meta.meta_productos,p:pct(real.productos,meta.meta_productos)},
    ].map(({titulo,real,meta,p})=>`
      <div class="card">
        <div class="card-title">${titulo}</div>
        <div class="card-val">${real}</div>
        <div class="card-meta">Meta: ${meta}</div>
        <div class="barra-wrap"><div class="barra" style="width:${p}%;background:${p>=100?"#0A6B40":p>=70?"#f59e0b":"#ef4444"}"></div></div>
        <span class="pct ${p>=100?"ok":p>=70?"warn":"bad"}">${p}%</span>
      </div>`).join("")}
  </div>
  <h2 style="font-size:15px;margin-bottom:12px">Comparación con mes anterior</h2>
  <table>
    <thead><tr><th>Métrica</th><th>Mes anterior</th><th>Este mes</th><th>Variación</th></tr></thead>
    <tbody>
      <tr><td>Ventas</td><td>${fmtCOP(anterior.ventas)}</td><td>${fmtCOP(real.ventas)}</td>
        <td style="color:${varVentas!=="N/A"&&Number(varVentas)>=0?"#0A6B40":"#dc2626"}">${varVentas!=="N/A"?`${varVentas}%`:"Sin datos"}</td></tr>
      <tr><td>Órdenes</td><td>${anterior.ordenes}</td><td>${real.ordenes}</td>
        <td style="color:${varOrdenes!=="N/A"&&Number(varOrdenes)>=0?"#0A6B40":"#dc2626"}">${varOrdenes!=="N/A"?`${varOrdenes}%`:"Sin datos"}</td></tr>
      <tr><td>Nuevos clientes</td><td>${anterior.clientes}</td><td>${real.clientes}</td><td>—</td></tr>
    </tbody>
  </table>
  <div class="footer">Victoria Pets · Panel Administrativo · ${new Date().getFullYear()}</div>
</body></html>`;
    const ventana = window.open("", "_blank");
    ventana.document.write(html);
    ventana.document.close();
    setTimeout(() => ventana.print(), 500);
  };

  if (cargando) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full animate-spin"
        style={{ border: `2px solid ${T.brandLight}`, borderTopColor: T.brand }} />
    </div>
  );

  const { meta, real, anterior } = datos || { meta: {}, real: {}, anterior: {} };

  const varVentas  = anterior.ventas  > 0 ? (((real.ventas  - anterior.ventas)  / anterior.ventas)  * 100).toFixed(1) : null;
  const varOrdenes = anterior.ordenes > 0 ? (((real.ordenes - anterior.ordenes) / anterior.ordenes) * 100).toFixed(1) : null;

  const totalHistReal = historial.reduce((a, h) => a + (h.ventas_real || 0), 0);
  const totalHistMeta = historial.reduce((a, h) => a + (h.meta_ventas || 0), 0);
  const cumplimiento  = totalHistMeta > 0 ? Math.round((totalHistReal / totalHistMeta) * 100) : 0;
  const mejorMes      = historial.length ? [...historial].sort((a, b) => (b.ventas_real || 0) - (a.ventas_real || 0))[0] : null;
  const avgReal       = historial.length ? Math.round(totalHistReal / historial.length) : 0;

  const chartData = historial.map(h => ({
    mes:      mesLabel(h.mes),
    real:     h.ventas_real  || 0,
    meta:     h.meta_ventas  || 0,
    ordenes:  h.ordenes_real || 0,
  }));

  return (
    <div className="space-y-5">
      {msg && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` }}>
          {msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl outline-none"
            style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
          <span className="text-sm font-semibold" style={{ color: T.textSec }}>{mesLabel(mes)}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={descargarPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors"
            style={{ background: T.surfaceAlt, color: T.textSec, border: `1px solid ${T.border}` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brandBorder; e.currentTarget.style.color = T.brand; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec; }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors"
            style={{ background: T.brand, color: "#fff" }}
            onMouseEnter={e => e.currentTarget.style.background = T.brandMid}
            onMouseLeave={e => e.currentTarget.style.background = T.brand}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Configurar metas
          </button>
        </div>
      </div>

      {/* KPI con anillos — 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <KPIRing label="Ventas del mes"      real={real.ventas    || 0} meta={Number(meta.meta_ventas    || 0)} formato="dinero"  color={T.brand}    />
        <KPIRing label="Órdenes"             real={real.ordenes   || 0} meta={Number(meta.meta_ordenes   || 0)} formato="numero"  color={T.gold}     />
        <KPIRing label="Nuevos clientes"     real={real.clientes  || 0} meta={Number(meta.meta_clientes  || 0)} formato="numero"  color="#7c3aed"    />
        <KPIRing label="Productos vendidos"  real={real.productos || 0} meta={Number(meta.meta_productos || 0)} formato="numero"  color="#0891b2"    />
      </div>

      {/* Comparación mes anterior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CompCard label="Ventas"          real={real.ventas   || 0} ant={anterior.ventas   || 0} variacion={varVentas}  formato="dinero" />
        <CompCard label="Órdenes"         real={real.ordenes  || 0} ant={anterior.ordenes  || 0} variacion={varOrdenes} />
        <CompCard label="Clientes nuevos" real={real.clientes || 0} ant={anterior.clientes || 0} variacion={null} />
      </div>

      {/* Gráfica histórica — VP brand, fondo claro */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>

        {/* Header gráfica */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>
                Análisis histórico · Ventas reales vs Meta
              </p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: T.text, fontFamily: font.mono }}>
                {fmtCOP(totalHistReal)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                Total acumulado en historial ({historial.length} meses)
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[
                { color: T.brand, label: "Ventas reales", dash: false },
                { color: T.gold,  label: "Meta",          dash: true  },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  {l.dash
                    ? <span style={{ width: 16, display: "block", borderTop: `2px dashed ${l.color}` }} />
                    : <span style={{ width: 12, height: 3, borderRadius: 2, background: l.color, display: "block" }} />}
                  <span style={{ fontSize: 10, color: T.textTer, fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ padding: "20px 16px 8px" }}>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.surfaceAlt, fontSize: 20 }}>📊</div>
              <p className="text-sm" style={{ color: T.textMuted }}>Sin datos históricos aún</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gVentasReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={T.brand} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={T.brand} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={`${T.border}`} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: T.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtMil(v)} width={62} />
                <Tooltip content={<VPTooltip />} />
                {totalHistMeta > 0 && (
                  <ReferenceLine y={avgReal} stroke={T.border} strokeDasharray="4 4"
                    label={{ value: "Prom.", fill: T.textMuted, fontSize: 9, position: "insideTopLeft" }} />
                )}
                <Line type="monotone" dataKey="meta" stroke={T.gold} strokeWidth={1.5}
                  strokeDasharray="6 4" dot={false} name="Meta" />
                <Area type="monotone" dataKey="real" stroke={T.brand} strokeWidth={2.5}
                  fill="url(#gVentasReal)" dot={false}
                  activeDot={{ r: 4, fill: T.brand, stroke: "#fff", strokeWidth: 2 }} name="Ventas reales" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Métricas resumen bajo la gráfica */}
        {historial.length > 0 && (
          <div className="grid grid-cols-4 divide-x" style={{ borderTop: `1px solid ${T.border}`, '--tw-divide-opacity': 1 }}>
            {[
              { label: "Total real",   value: fmtCOP(totalHistReal),                             color: T.brand   },
              { label: "Prom./mes",    value: fmtCOP(avgReal),                                    color: T.brandMid},
              { label: "Cumplimiento", value: `${cumplimiento}%`,                                 color: cumplimiento>=100?T.success:cumplimiento>=70?T.warning:T.danger },
              { label: "Mejor mes",    value: mejorMes ? mesLabel(mejorMes.mes) : "—",            color: T.gold    },
            ].map((s, i) => (
              <div key={s.label} className="text-center py-3 px-2"
                style={{ borderRight: i < 3 ? `1px solid ${T.border}` : "none" }}>
                <p className="text-xs font-bold tabular-nums" style={{ color: s.color, fontFamily: font.mono }}>{s.value}</p>
                <p style={{ fontSize: 9, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal configurar metas */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setModal(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div>
                <p className="text-sm font-bold" style={{ color: T.text }}>Configurar metas</p>
                <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{mesLabel(mes)}</p>
              </div>
              <button onClick={() => setModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg transition-colors"
                style={{ color: T.textTer }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>×</button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: "meta_ventas",    label: "Meta de ventas ($)",         placeholder: "ej: 5000000" },
                { key: "meta_ordenes",   label: "Meta de órdenes",            placeholder: "ej: 50" },
                { key: "meta_clientes",  label: "Meta de nuevos clientes",    placeholder: "ej: 20" },
                { key: "meta_productos", label: "Meta de productos vendidos", placeholder: "ej: 100" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.textTer }}>{label}</label>
                  <input type="number" min={0} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }}
                    onFocus={e => { e.target.style.borderColor = T.brand; e.target.style.background = T.surface; }}
                    onBlur={e  => { e.target.style.borderColor = T.border; e.target.style.background = T.surfaceAlt; }} />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors"
                  style={{ background: T.surfaceAlt, color: T.textSec }}>
                  Cancelar
                </button>
                <button onClick={guardar} disabled={guardando}
                  className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                  style={{ background: T.brand, color: "#fff" }}>
                  {guardando ? "Guardando..." : "Guardar metas"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
