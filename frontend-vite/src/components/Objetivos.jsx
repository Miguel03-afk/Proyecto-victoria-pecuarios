import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
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

const BAR_COLOR = { verde:"#0A6B40", gris:"#d1d5db" };

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

      {/* Gráfica histórica */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Meta vs real — últimos 6 meses</h3>
        {historial.length === 0
          ? <p className="text-sm text-gray-400 text-center py-8">Sin datos históricos aún</p>
          : <ResponsiveContainer width="100%" height={220}>
              <BarChart data={historial.map(h => ({ ...h, mes: mesLabel(h.mes) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius:12, border:"1px solid #e5e7eb", fontSize:12 }} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="meta_ventas" name="Meta" fill={BAR_COLOR.gris} radius={[4,4,0,0]} />
                <Bar dataKey="ventas_real" name="Real" fill={BAR_COLOR.verde} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
        }
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