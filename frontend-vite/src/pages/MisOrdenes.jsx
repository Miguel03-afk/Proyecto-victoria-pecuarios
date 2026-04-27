// src/pages/MisOrdenes.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);

const fdoc = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const ESTADO = {
  pendiente:  { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", label: "Pendiente" },
  pagada:     { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd", label: "Pagada" },
  procesando: { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe", label: "Procesando" },
  enviada:    { bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc", label: "Enviada" },
  entregada:  { bg: "#dcfce7", text: "#14532d", border: "#86efac", label: "Entregada" },
  cancelada:  { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5", label: "Cancelada" },
};

const Badge = ({ estado }) => {
  const s = ESTADO[estado] || { bg: "#f0fdf4", text: "#166534", border: "#86efac", label: estado };
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

const SkeletonOrden = () => (
  <div className="rounded-2xl p-5 animate-pulse" style={{ background: "#fff", border: "1px solid #e6f3e6" }}>
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 w-32 rounded-full bg-blue-50" />
      <div className="h-6 w-20 rounded-full bg-blue-50" />
    </div>
    <div className="h-3 w-48 rounded-full bg-blue-50" />
  </div>
);

export default function MisOrdenes() {
  const [ordenes, setOrdenes]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [abierta, setAbierta]   = useState(null); // id de orden expandida

  useEffect(() => {
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenes(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#F5FAF7" }}>
      {/* Barra envío */}
      <div className="py-2.5" style={{ background: "#064E30" }}>
        <p className="text-center text-xs font-semibold text-white/70">
          🚚 Envíos gratis a partir de <span className="text-lime-400 font-bold">$80.000</span>
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#101F16", fontFamily: "'Playfair Display', Georgia, serif" }}>
              Mis órdenes
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#5A7A65" }}>
              Historial completo de tus compras
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/perfil"
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{ background: "#E4F5EC", color: "#0A6B40", border: "1px solid #95CCAD" }}>
              👤 Mi perfil
            </Link>
            <Link to="/tienda"
              className="text-xs font-semibold px-4 py-2 rounded-xl text-white transition-colors"
              style={{ background: "#0A6B40" }}>
              🛒 Seguir comprando
            </Link>
          </div>
        </div>

        {/* Contenido */}
        {cargando ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonOrden key={i} />)}
          </div>
        ) : ordenes.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mx-auto"
              style={{ background: "#E4F5EC" }}>📦</div>
            <h3 className="text-lg font-bold" style={{ color: "#101F16" }}>No tienes órdenes aún</h3>
            <p className="text-sm" style={{ color: "#5A7A65" }}>
              Cuando realices una compra, aparecerá aquí con todos los detalles.
            </p>
            <Link to="/tienda"
              className="inline-block mt-2 px-8 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "#0A6B40", boxShadow: "0 4px 14px rgba(10,107,64,0.25)" }}>
              Explorar tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Resumen */}
            <p className="text-xs font-medium mb-4" style={{ color: "#8FAA98" }}>
              {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""} registrada{ordenes.length !== 1 ? "s" : ""}
            </p>

            {ordenes.map(o => {
              const expandida = abierta === o.id;
              return (
                <div key={o.id} className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ background: "#fff", border: `1px solid ${expandida ? "#95CCAD" : "#E4F5EC"}` }}>
                  {/* Cabecera siempre visible */}
                  <button
                    onClick={() => setAbierta(expandida ? null : o.id)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = "#EDF6F1"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Código */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A7A65" }}>Orden</p>
                        <p className="text-sm font-bold" style={{ color: "#0A6B40", fontFamily: "monospace" }}>{o.codigo}</p>
                      </div>
                      {/* Fecha */}
                      <div className="hidden sm:block">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A7A65" }}>Fecha</p>
                        <p className="text-sm" style={{ color: "#101F16" }}>{fdoc(o.created_at)}</p>
                      </div>
                      {/* Método pago */}
                      {o.metodo_pago && (
                        <div className="hidden sm:block">
                          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A7A65" }}>Pago</p>
                          <p className="text-sm capitalize" style={{ color: "#101F16" }}>{o.metodo_pago}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold tabular-nums" style={{ color: "#101F16" }}>{fmt(o.total)}</p>
                        {o.items > 0 && (
                          <p className="text-xs" style={{ color: "#8FAA98" }}>{o.items} producto{o.items !== 1 ? "s" : ""}</p>
                        )}
                      </div>
                      <Badge estado={o.estado} />
                      <svg className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${expandida ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                        style={{ color: "#5A7A65" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  {expandida && (
                    <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid #95CCAD" }}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                        {[
                          { k: "Fecha",    v: fdoc(o.created_at) },
                          { k: "Estado",   v: o.estado },
                          { k: "Método",   v: o.metodo_pago || "—" },
                          ...(o.direccion_entrega ? [{ k: "Dirección", v: o.direccion_entrega }] : []),
                          ...(o.ciudad_entrega    ? [{ k: "Ciudad",    v: o.ciudad_entrega }]    : []),
                        ].map(({ k, v }) => (
                          <div key={k} className="px-4 py-3 rounded-xl"
                            style={{ background: "#EDF6F1", border: "1px solid #95CCAD" }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "#8FAA98" }}>{k}</p>
                            <p className="text-sm font-semibold capitalize" style={{ color: "#101F16" }}>{v}</p>
                          </div>
                        ))}
                      </div>

                      {/* Línea de estado visual */}
                      <div className="flex items-center gap-0 mt-2">
                        {["pendiente","pagada","procesando","enviada","entregada"].map((est, i, arr) => {
                          const idx = arr.indexOf(o.estado);
                          const hecho = i <= idx;
                          const activo = i === idx;
                          return (
                            <div key={est} className="flex items-center flex-1">
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${activo ? "w-3.5 h-3.5" : ""}`}
                                style={{ background: hecho ? "#0A6B40" : "#E4F5EC", border: activo ? "2px solid #138553" : "none" }} />
                              {i < arr.length - 1 && (
                                <div className="flex-1 h-0.5"
                                  style={{ background: i < idx ? "#0A6B40" : "#E4F5EC" }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between">
                        {["Pendiente","Pagada","Procesando","Enviada","Entregada"].map(l => (
                          <span key={l} className="text-xs" style={{ color: "#8FAA98" }}>{l}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}