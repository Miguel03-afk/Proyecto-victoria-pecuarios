import { useState, useEffect } from "react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import api from "../services/api";

const fmt     = (n) => `$${Number(n||0).toLocaleString("es-CO")}`;
const pct     = (real, meta) => meta > 0 ? Math.min(Math.round((real / meta) * 100), 100) : 0;
const mesHoy  = () => new Date().toISOString().slice(0, 7);
const mesLabel = (m) => {
  const [y, mo] = m.split("-");
  const meses = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${meses[Number(mo)]} ${y}`;
};

function TradingTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0a1628", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
      <p style={{ color:"rgba(255,255,255,0.5)", marginBottom:6, fontSize:10, textTransform:"uppercase", letterSpacing:0.8 }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:i < payload.length-1 ? 4 : 0 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.color, display:"block", flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>{p.name}:</span>
          <span style={{ color:"#fff", fontWeight:700, fontFamily:"monospace" }}>
            {typeof p.value === "number" && p.value > 10000 ? `$${Number(p.value).toLocaleString("es-CO")}` : p.value?.toLocaleString?.("es-CO") ?? p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarraProgreso({ label, real, meta, formato = "numero", color = "#0A6B40" }) {
  const porcentaje = pct(real, meta);
  const realFmt = formato === "dinero" ? fmt(real) : real.toLocaleString("es-CO");
  const metaFmt = formato === "dinero" ? fmt(meta) : meta.toLocaleString("es-CO");
  const estado  = porcentaje >= 100 ? "✅" : porcentaje >= 70 ? "🔶" : "🔴";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">{estado} {label}</span>
        <span className="text-xs text-gray-500">
          <span className="font-bold text-gray-800">{realFmt}</span> / {metaFmt}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${porcentaje}%`,
            backgroundColor: porcentaje >= 100 ? "#0A6B40" : porcentaje >= 70 ? "#f59e0b" : "#ef4444"
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-400">{porcentaje}% completado</span>
        {meta > 0 && real < meta && (
          <span className="text-xs text-gray-400">
            Falta: {formato === "dinero" ? fmt(meta - real) : (meta - real).toLocaleString("es-CO")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Objetivos() {
  const [mes, setMes]           = useState(mesHoy());
  const [datos, setDatos]       = useState(null);
  const [historial, setHistorial] = useState([]);
  const [modalAbierto, setModal] = useState(false);
  const [form, setForm]         = useState({ meta_ventas:"", meta_ordenes:"", meta_clientes:"", meta_productos:"" });
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg]           = useState("");
  const [cargando, setCargando] = useState(true);

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
        meta_ventas:    d.meta.meta_ventas   || "",
        meta_ordenes:   d.meta.meta_ordenes  || "",
        meta_clientes:  d.meta.meta_clientes || "",
        meta_productos: d.meta.meta_productos|| "",
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
    } catch (err) {
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

    const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Reporte ${mesLabel(mes)}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1f2937; }
  h1 { color: #0A6B40; font-size: 22px; margin-bottom: 4px; }
  .sub { color: #6b7280; font-size: 13px; margin-bottom: 32px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
  .card-title { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .card-val { font-size: 22px; font-weight: bold; color: #0A6B40; }
  .card-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .card-pct { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: bold; }
  .ok { background: #dcfce7; color: #0A6B40; }
  .warn { background: #fef9c3; color: #854d0e; }
  .bad { background: #fee2e2; color: #991b1b; }
  .barra-wrap { height: 8px; background: #f3f4f6; border-radius: 999px; overflow: hidden; margin: 8px 0; }
  .barra { height: 100%; border-radius: 999px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; background: #f9fafb; font-size: 11px; color: #6b7280; text-transform: uppercase; }
  td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
  .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; }
</style></head><body>
  <h1>📊 Reporte de objetivos — ${mesLabel(mes)}</h1>
  <div class="sub">Generado el ${new Date().toLocaleDateString("es-CO", { day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })} · Victoria Pets</div>

  <div class="grid">
    ${[
      { titulo:"Ventas del mes", real: fmt(real.ventas), meta: fmt(meta.meta_ventas), p: pct(real.ventas, meta.meta_ventas) },
      { titulo:"Órdenes",        real: real.ordenes,      meta: meta.meta_ordenes,   p: pct(real.ordenes, meta.meta_ordenes) },
      { titulo:"Nuevos clientes",real: real.clientes,     meta: meta.meta_clientes,  p: pct(real.clientes, meta.meta_clientes) },
      { titulo:"Productos vendidos", real: real.productos, meta: meta.meta_productos, p: pct(real.productos, meta.meta_productos) },
    ].map(({ titulo, real, meta, p }) => `
      <div class="card">
        <div class="card-title">${titulo}</div>
        <div class="card-val">${real}</div>
        <div class="card-meta">Meta: ${meta}</div>
        <div class="barra-wrap">
          <div class="barra" style="width:${p}%;background:${p>=100?"#0A6B40":p>=70?"#f59e0b":"#ef4444"}"></div>
        </div>
        <span class="card-pct ${p>=100?"ok":p>=70?"warn":"bad"}">${p}%</span>
      </div>`).join("")}
  </div>

  <h2 style="font-size:15px;margin-bottom:12px;">Comparación con mes anterior</h2>
  <table>
    <thead><tr><th>Métrica</th><th>Mes anterior</th><th>Este mes</th><th>Variación</th></tr></thead>
    <tbody>
      <tr><td>Ventas</td><td>${fmt(anterior.ventas)}</td><td>${fmt(real.ventas)}</td>
        <td style="color:${varVentas!=="N/A"&&Number(varVentas)>=0?"#0A6B40":"#dc2626"}">${varVentas !== "N/A" ? `${varVentas}%` : "Sin datos"}</td></tr>
      <tr><td>Órdenes</td><td>${anterior.ordenes}</td><td>${real.ordenes}</td>
        <td style="color:${varOrdenes!=="N/A"&&Number(varOrdenes)>=0?"#0A6B40":"#dc2626"}">${varOrdenes !== "N/A" ? `${varOrdenes}%` : "Sin datos"}</td></tr>
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
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { meta, real, anterior } = datos || { meta:{}, real:{}, anterior:{} };

  const varVentas  = anterior.ventas  > 0 ? (((real.ventas  - anterior.ventas)  / anterior.ventas)  * 100).toFixed(1) : null;
  const varOrdenes = anterior.ordenes > 0 ? (((real.ordenes - anterior.ordenes) / anterior.ordenes) * 100).toFixed(1) : null;

  return (
    <div className="space-y-5">
      {msg && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <input type="month" value={mes} onChange={e => setMes(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
          <span className="text-sm font-semibold text-gray-700">{mesLabel(mes)}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={descargarPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-xs font-semibold text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Configurar metas
          </button>
        </div>
      </div>

      {/* Barras de progreso */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-5">Progreso del mes</h3>
        <div className="space-y-5">
          <BarraProgreso label="Ventas"             real={real.ventas}    meta={Number(meta.meta_ventas||0)}    formato="dinero" />
          <BarraProgreso label="Órdenes"            real={real.ordenes}   meta={Number(meta.meta_ordenes||0)} />
          <BarraProgreso label="Nuevos clientes"    real={real.clientes}  meta={Number(meta.meta_clientes||0)} />
          <BarraProgreso label="Productos vendidos" real={real.productos} meta={Number(meta.meta_productos||0)} />
        </div>
      </div>

      {/* Comparación mes anterior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label:"Ventas", real: fmt(real.ventas), ant: fmt(anterior.ventas), var: varVentas },
          { label:"Órdenes", real: real.ordenes, ant: anterior.ordenes, var: varOrdenes },
          { label:"Clientes nuevos", real: real.clientes, ant: anterior.clientes, var: null },
        ].map(({ label, real, ant, var: v }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-800">{real}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Anterior: {ant}</span>
              {v !== null && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${Number(v) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {Number(v) >= 0 ? "▲" : "▼"} {Math.abs(v)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gráfica histórica — estilo trading */}
      <div style={{
        background:"#0a1628",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:16,
        overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap"}}>
            <div>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                <div style={{width:8, height:8, borderRadius:"50%", background:"#10b981"}}/>
                <span style={{fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"rgba(255,255,255,0.4)"}}>
                  Análisis histórico · Ventas vs Meta
                </span>
              </div>
              <p style={{fontSize:20, fontWeight:700, color:"#fff", fontFamily:"monospace", margin:0}}>
                {fmt(historial.reduce((a,h)=>a+(h.ventas_real||0),0))}
              </p>
              <p style={{fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2}}>Total acumulado en historial</p>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:16}}>
              <div style={{display:"flex", alignItems:"center", gap:6}}>
                <span style={{width:12, height:3, borderRadius:2, display:"block", background:"#10b981"}}/>
                <span style={{fontSize:10, color:"rgba(255,255,255,0.45)", fontWeight:600}}>Real</span>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:6}}>
                <span style={{width:14, display:"block", borderTop:"2px dashed rgba(255,255,255,0.35)"}}/>
                <span style={{fontSize:10, color:"rgba(255,255,255,0.45)", fontWeight:600}}>Meta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{padding:"24px 16px 16px"}}>
          {historial.length === 0 ? (
            <p style={{color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"48px 0", fontSize:13, margin:0}}>
              Sin datos históricos aún
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={historial.map(h => ({ ...h, mes: mesLabel(h.mes) }))} margin={{top:10,right:10,bottom:0,left:0}}>
                <defs>
                  <linearGradient id="gVentasObj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:"rgba(255,255,255,0.35)",fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"rgba(255,255,255,0.25)"}} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={52}/>
                <Tooltip content={<TradingTooltip/>}/>
                <Line type="monotone" dataKey="meta_ventas" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}
                  strokeDasharray="6 4" dot={false} name="Meta"/>
                <Area type="monotone" dataKey="ventas_real" stroke="#10b981" strokeWidth={2.5}
                  fill="url(#gVentasObj)" dot={false}
                  activeDot={{r:4,fill:"#10b981",stroke:"#fff",strokeWidth:2}} name="Real"/>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer métricas */}
        {historial.length > 0 && (() => {
          const totalReal = historial.reduce((a,h)=>a+(h.ventas_real||0),0);
          const totalMeta = historial.reduce((a,h)=>a+(h.meta_ventas||0),0);
          const cumpl = totalMeta > 0 ? Math.round((totalReal/totalMeta)*100) : 0;
          const mejor = [...historial].sort((a,b)=>(b.ventas_real||0)-(a.ventas_real||0))[0];
          const stats = [
            { label:"Total real",   value:fmt(totalReal),               color:"#10b981" },
            { label:"Total meta",   value:fmt(totalMeta),               color:"rgba(255,255,255,0.4)" },
            { label:"Cumplimiento", value:`${cumpl}%`,                  color: cumpl>=100?"#10b981":cumpl>=70?"#f59e0b":"#ef4444" },
            { label:"Mejor mes",    value:mejor?mesLabel(mejor.mes):"—", color:"#6366f1" },
          ];
          return (
            <div style={{display:"flex", borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              {stats.map((s,i) => (
                <div key={s.label} style={{flex:1, textAlign:"center", borderRight: i<3?"1px solid rgba(255,255,255,0.05)":"none", padding:"10px 8px"}}>
                  <p style={{fontSize:12, fontWeight:700, fontFamily:"monospace", color:s.color, margin:0}}>{s.value}</p>
                  <p style={{fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:0.5, marginTop:3, marginBottom:0}}>{s.label}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Modal configurar metas */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Configurar metas — {mesLabel(mes)}</h3>
              <button onClick={() => setModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key:"meta_ventas",    label:"Meta de ventas ($)",          placeholder:"ej: 5000000" },
                { key:"meta_ordenes",   label:"Meta de órdenes",             placeholder:"ej: 50" },
                { key:"meta_clientes",  label:"Meta de nuevos clientes",     placeholder:"ej: 20" },
                { key:"meta_productos", label:"Meta de productos vendidos",  placeholder:"ej: 100" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                  <input type="number" min={0} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 focus:bg-white" />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={guardar} disabled={guardando}
                  className="px-4 py-2 text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl transition-colors active:scale-95">
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