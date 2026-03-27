// frontend-vite/src/pages/admin/ReporteSalidas.jsx
import { useState } from 'react';
import api from '../../services/api';

const TIPOS = ['todos', 'venta', 'compra', 'ajuste_manual', 'devolucion'];

export default function ReporteSalidas() {
  const [filtros, setFiltros] = useState({
    fecha_inicio: '', fecha_fin: '', tipo_movimiento: 'todos'
  });
  const [datos, setDatos] = useState(null);
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
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const colorTipo = (tipo) => ({
    venta:         'bg-red-100 text-red-700',
    compra:        'bg-green-100 text-green-700',
    ajuste_manual: 'bg-yellow-100 text-yellow-700',
    devolucion:    'bg-blue-100 text-blue-700',
  }[tipo] || 'bg-gray-100 text-gray-700');

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reporte de Salidas de Stock</h2>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
          <input type="date" value={filtros.fecha_inicio}
            onChange={e => setFiltros(f => ({ ...f, fecha_inicio: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input type="date" value={filtros.fecha_fin}
            onChange={e => setFiltros(f => ({ ...f, fecha_fin: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo movimiento</label>
          <select value={filtros.tipo_movimiento}
            onChange={e => setFiltros(f => ({ ...f, tipo_movimiento: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={buscar}
          className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {datos && (
        <>
          {/* Resumen por tipo */}
          <div className="flex flex-wrap gap-3">
            {datos.resumen.map(r => (
              <div key={r.tipo_movimiento}
                className={`px-4 py-2 rounded-xl border text-sm font-medium ${colorTipo(r.tipo_movimiento)}`}>
                {r.tipo_movimiento}: {r.total_movimientos} movs · {r.total_unidades} uds
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Producto','Tipo','Stock ant.','Cantidad','Stock nuevo','Referencia','Usuario','Fecha'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datos.movimientos.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.nombre_snap}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorTipo(m.tipo_movimiento)}`}>
                        {m.tipo_movimiento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.stock_anterior}</td>
                    <td className={`px-4 py-3 font-bold ${m.tipo_movimiento === 'venta' ? 'text-red-600' : 'text-green-600'}`}>
                      {m.tipo_movimiento === 'venta' ? '-' : '+'}{m.cantidad}
                    </td>
                    <td className="px-4 py-3">{m.stock_nuevo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{m.referencia_id || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{m.usuario || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(m.fecha).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {datos.movimientos.length === 0 && (
              <p className="text-center py-8 text-gray-400">No hay movimientos en el período seleccionado</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}