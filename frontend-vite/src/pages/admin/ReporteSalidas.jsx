// src/pages/admin/ReporteSalidas.jsx
import { useState } from 'react';
import api from '../../services/api';
import { T, shadow, font, fmt, fdoc, movimientoStyle } from '../../styles/admin.tokens';

const TIPOS = ['todos','venta','compra','ajuste_manual','devolucion'];

export default function ReporteSalidas() {
  const [filtros, setFiltros]   = useState({ fecha_inicio:'', fecha_fin:'', tipo_movimiento:'todos' });
  const [datos, setDatos]       = useState(null);
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin)    params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.tipo_movimiento !== 'todos') params.append('tipo_movimiento', filtros.tipo_movimiento);
      const { data } = await api.get(`/reportes/stock-salidas?${params}`);
      setDatos(data);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold" style={{ color:T.text, fontFamily:font.display }}>Salidas de stock</h2>

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
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border:`1.5px solid ${T.border}`, background:T.surfaceAlt, color:T.text }}
              onFocus={e => e.target.style.borderColor = T.brand}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:T.textTer }}>Tipo movimiento</label>
          <select value={filtros.tipo_movimiento}
            onChange={e => setFiltros(f => ({ ...f, tipo_movimiento: e.target.value }))}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border:`1.5px solid ${T.border}`, background:T.surfaceAlt, color:T.text }}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={buscar}
          className="px-5 py-2 rounded-xl text-sm font-semibold"
          style={{ background:T.brand, color:'#fff' }}>
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {datos && (
        <>
          {/* Resumen por tipo */}
          <div className="flex flex-wrap gap-3">
            {datos.resumen.map(r => {
              const s = movimientoStyle(r.tipo_movimiento);
              return (
                <div key={r.tipo_movimiento} className="px-4 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>
                  <span className="capitalize">{r.tipo_movimiento}</span>
                  <span className="mx-1.5 opacity-50">·</span>
                  {r.total_movimientos} movs
                  <span className="mx-1.5 opacity-50">·</span>
                  {r.total_unidades} uds
                </div>
              );
            })}
          </div>

          {/* Tabla */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background:T.surface, border:`1px solid ${T.border}`, boxShadow:shadow.sm }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:`1px solid ${T.border}`, background:T.surfaceAlt }}>
                  {['Producto','Tipo','Stock ant.','Movimiento','Stock nuevo','Referencia','Usuario','Fecha'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color:T.textTer }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.movimientos.map((m, i) => {
                  const s = movimientoStyle(m.tipo_movimiento);
                  return (
                    <tr key={m.id} className="transition-colors"
                      style={{ borderBottom:`1px solid ${T.borderSub}`, background: i%2===0 ? T.surface : T.surfaceAlt }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? T.surface : T.surfaceAlt}>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color:T.text }}>{m.nombre_snap}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>
                          {m.tipo_movimiento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums" style={{ color:T.textTer }}>{m.stock_anterior}</td>
                      <td className="px-4 py-3 text-xs font-bold tabular-nums" style={{ color:s.text }}>
                        {s.signo}{m.cantidad}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums font-semibold" style={{ color:T.text }}>{m.stock_nuevo}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color:T.textMuted }}>{m.referencia_id || '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color:T.textSec }}>{m.usuario || '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color:T.textMuted }}>{fdoc(m.fecha)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {datos.movimientos.length === 0 && (
              <p className="text-center py-10 text-sm" style={{ color:T.textMuted }}>
                No hay movimientos en el período seleccionado
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
