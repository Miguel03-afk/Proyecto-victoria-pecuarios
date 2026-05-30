// src/pages/admin/ReporteVentas.jsx
import { useState } from 'react';
import api from '../../services/api';
import { shadow, font, fmt, fdoc, estadoStyle } from '../../styles/admin.tokens';
import { useTheme } from '../../styles/ThemeProvider.jsx';

const ESTADOS_FILTRO = ['todos','pendiente','pagada','procesando','enviada','entregada','cancelada'];

export default function ReporteVentas() {
  const { C: T } = useTheme();
  const [filtros, setFiltros] = useState({ fecha_inicio:'', fecha_fin:'', estado:'todos' });
  const [datos, setDatos]     = useState(null);
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin)    params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.estado !== 'todos') params.append('estado', filtros.estado);
      const { data } = await api.get(`/reportes/ventas?${params}`);
      setDatos(data);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const Badge = ({ estado }) => {
    const s = estadoStyle(estado, T);
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>{estado}</span>;
  };

  const tot = datos?.totales;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold" style={{ color:T.text, fontFamily:font.display }}>Reporte de ventas</h2>

      {/* Filtros */}
      <div className="rounded-2xl p-4 flex flex-wrap gap-4 items-end"
        style={{ background:T.surface, border:`1px solid ${T.border}`, boxShadow:shadow.sm }}>
        {[
          { label:'Fecha inicio', key:'fecha_inicio', type:'date' },
          { label:'Fecha fin',    key:'fecha_fin',    type:'date' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>{label}</label>
            <input type={type} value={filtros[key]}
              onChange={e => setFiltros(f => ({ ...f, [key]: e.target.value }))}
              className="border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border:`1.5px solid ${T.border}`, background:T.surfaceAlt, color:T.text }}
              onFocus={e => e.target.style.borderColor = T.brand}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>Estado</label>
          <select value={filtros.estado}
            onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border:`1.5px solid ${T.border}`, background:T.surfaceAlt, color:T.text }}>
            {ESTADOS_FILTRO.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <button onClick={buscar}
          className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background:T.brand, color:'#fff' }}>
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
        {datos && (
          <button onClick={() => window.print()}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors vp-no-print"
            style={{ background:T.lime, color:T.brandDark, border:`1px solid ${T.limeDark}` }}
            title="Imprimir o guardar como PDF (Ctrl/Cmd+P)">
            📄 Exportar PDF
          </button>
        )}
      </div>

      {/* Header solo visible al imprimir */}
      <div className="vp-print-only" style={{ display:'none', marginBottom:24, paddingBottom:16, borderBottom:'2px solid #1E3A8A' }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:'#1E3A8A', letterSpacing:'-0.02em' }}>
          Victoria Pets · Reporte de ventas
        </h1>
        <p style={{ margin:'4px 0 0', fontSize:12, color:'#6B7280' }}>
          {filtros.fecha_inicio ? `Desde ${filtros.fecha_inicio}` : 'Sin fecha inicio'}
          {' · '}{filtros.fecha_fin ? `Hasta ${filtros.fecha_fin}` : 'Sin fecha fin'}
          {' · '}Estado: {filtros.estado}
          {' · '}Generado: {new Date().toLocaleString('es-CO')}
        </p>
      </div>

      {datos && (
        <>
          {/* Resumen numérico */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Total órdenes',   value:tot.total_ordenes,                        accent:T.brand  },
              { label:'Ingresos totales', value:fmt(tot.ingresos_totales),               accent:T.brand  },
              { label:'IVA recaudado (19%)', value:fmt(tot.iva_total_periodo),           accent:T.info   },
              { label:'Ganancia neta',   value:fmt(tot.ganancia_total_periodo),          accent:T.success},
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-2xl p-4"
                style={{ background:T.surface, border:`1px solid ${T.border}`, boxShadow:shadow.sm }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color:T.textMuted }}>{label}</p>
                <p className="text-xl font-bold tabular-nums" style={{ color:accent }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background:T.surface, border:`1px solid ${T.border}`, boxShadow:shadow.sm }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:`1px solid ${T.border}`, background:T.surfaceAlt }}>
                  {['Código','Cliente','Fecha','Subtotal','IVA (19%)','Ganancia','Total','Estado'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color:T.textTer }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ '--tw-divide-color': T.borderSub }}>
                {datos.ordenes.map((o, i) => (
                  <tr key={o.id} className="transition-colors"
                    style={{ background: i%2===0 ? T.surface : T.surfaceAlt }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? T.surface : T.surfaceAlt}>
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color:T.brand }}>{o.codigo}</td>
                    <td className="px-4 py-3 text-xs" style={{ color:T.textSec }}>{o.cliente}</td>
                    <td className="px-4 py-3 text-xs" style={{ color:T.textMuted }}>{fdoc(o.created_at)}</td>
                    <td className="px-4 py-3 text-xs tabular-nums">{fmt(o.subtotal)}</td>
                    <td className="px-4 py-3 text-xs tabular-nums font-medium" style={{ color:T.info }}>{fmt(o.iva_total)}</td>
                    <td className="px-4 py-3 text-xs tabular-nums font-medium" style={{ color:T.success }}>{fmt(o.ganancia_total)}</td>
                    <td className="px-4 py-3 text-xs font-bold tabular-nums">{fmt(o.total)}</td>
                    <td className="px-4 py-3"><Badge estado={o.estado}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {datos.ordenes.length === 0 && (
              <p className="text-center py-10 text-sm" style={{ color:T.textMuted }}>
                No hay órdenes en el período seleccionado
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
