import { useState } from 'react';
import api from '../../services/api';

export default function ReporteVentas() {
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'todos'
  });
  const [datos, setDatos] = useState(null);
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
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(n);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reporte de Ventas</h2>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select value={filtros.estado}
            onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="enviada">Enviada</option>
            <option value="entregada">Entregada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <button onClick={buscar}
          className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Tarjetas resumen */}
      {datos && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total órdenes', value: datos.totales.total_ordenes },
              { label: 'Ingresos',      value: fmt(datos.totales.ingresos_totales) },
              { label: 'IVA recaudado', value: fmt(datos.totales.iva_total_periodo) },
              { label: 'Ganancia neta', value: fmt(datos.totales.ganancia_total_periodo) },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Código','Cliente','Fecha','Subtotal','IVA','Ganancia','Total','Estado'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datos.ordenes.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-green-700">{o.codigo}</td>
                    <td className="px-4 py-3 text-gray-800">{o.cliente}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3">{fmt(o.subtotal)}</td>
                    <td className="px-4 py-3 text-blue-600">{fmt(o.iva_total)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{fmt(o.ganancia_total)}</td>
                    <td className="px-4 py-3 font-bold">{fmt(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${o.estado === 'entregada' ? 'bg-green-100 text-green-700' :
                          o.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                        {o.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {datos.ordenes.length === 0 && (
              <p className="text-center py-8 text-gray-400">No hay órdenes en el período seleccionado</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}