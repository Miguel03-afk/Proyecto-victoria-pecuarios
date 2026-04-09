// src/components/admin/VariantesEditor.jsx
// Componente reutilizable para crear/editar variantes de un producto
// Uso: <VariantesEditor variantes={variantes} onChange={setVariantes} />

import { T, fmt } from "../../styles/admin.tokens";

const IVA = 19;

const VACIO = {
  nombre: "", precio: "", precio_antes: "", precio_costo: "",
  stock: "", stock_minimo: "5", sku: "", orden: 0,
};

export default function VariantesEditor({ variantes = [], onChange }) {
  const agregar = () => onChange([...variantes, { ...VACIO, orden: variantes.length }]);

  const actualizar = (i, campo, valor) => {
    const copia = variantes.map((v, idx) => idx === i ? { ...v, [campo]: valor } : v);
    onChange(copia);
  };

  const eliminar = (i) => onChange(variantes.filter((_, idx) => idx !== i));

  const mover = (i, dir) => {
    const copia = [...variantes];
    const dest = i + dir;
    if (dest < 0 || dest >= copia.length) return;
    [copia[i], copia[dest]] = [copia[dest], copia[i]];
    onChange(copia.map((v, idx) => ({ ...v, orden: idx })));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.textTer }}>
            Presentaciones / Variantes
          </p>
          <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
            Ej: 500ml, 1kg, Perros, Gatos — cada una con su precio y stock propio
          </p>
        </div>
        <button
          type="button"
          onClick={agregar}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: T.brandLight, color: T.brand, border: `1px solid ${T.brandBorder}` }}>
          + Agregar
        </button>
      </div>

      {variantes.length === 0 && (
        <div className="rounded-xl px-4 py-5 text-center text-xs"
          style={{ background: T.surfaceAlt, border: `1px dashed ${T.border}`, color: T.textMuted }}>
          Sin variantes — el producto usará su precio y stock principal.<br />
          Agrega variantes si este producto tiene diferentes presentaciones.
        </div>
      )}

      {variantes.map((v, i) => {
        const precioNum = Number(v.precio) || 0;
        const costoNum  = Number(v.precio_costo) || 0;
        const conIva    = precioNum * 1.19;
        const ganancia  = precioNum - costoNum;

        return (
          <div key={i} className="rounded-xl p-4 space-y-3"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {/* Controles de orden y eliminar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: T.textTer }}>
                Variante {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-xs transition-colors disabled:opacity-30"
                  style={{ background: T.surfaceAlt, color: T.textTer }}>↑</button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === variantes.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-xs transition-colors disabled:opacity-30"
                  style={{ background: T.surfaceAlt, color: T.textTer }}>↓</button>
                <button type="button" onClick={() => eliminar(i)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-xs transition-colors ml-1"
                  style={{ background: T.dangerBg, color: T.danger }}>×</button>
              </div>
            </div>

            {/* Nombre y SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: T.textTer }}>Nombre *</label>
                <input
                  value={v.nombre}
                  onChange={e => actualizar(i, "nombre", e.target.value)}
                  placeholder="ej: 500ml, 1kg, Perros"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: T.textTer }}>SKU (opcional)</label>
                <input
                  value={v.sku}
                  onChange={e => actualizar(i, "sku", e.target.value)}
                  placeholder="código interno"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: T.textTer }}>Precio venta *</label>
                <input type="number" min="0"
                  value={v.precio}
                  onChange={e => actualizar(i, "precio", e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: T.textTer }}>Precio antes</label>
                <input type="number" min="0"
                  value={v.precio_antes}
                  onChange={e => actualizar(i, "precio_antes", e.target.value)}
                  placeholder="opcional"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: T.textTer }}>Precio costo</label>
                <input type="number" min="0"
                  value={v.precio_costo}
                  onChange={e => actualizar(i, "precio_costo", e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: T.textTer }}>Stock</label>
                <input type="number" min="0"
                  value={v.stock}
                  onChange={e => actualizar(i, "stock", e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: T.textTer }}>Stock mínimo</label>
                <input type="number" min="0"
                  value={v.stock_minimo}
                  onChange={e => actualizar(i, "stock_minimo", e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ border: `1.5px solid ${T.border}`, background: T.surfaceAlt, color: T.text }} />
              </div>
            </div>

            {/* Preview financiero */}
            {precioNum > 0 && (
              <div className="rounded-xl px-3 py-2 flex items-center gap-4 flex-wrap text-xs"
                style={{ background: T.infoBg, border: `1px solid ${T.infoBorder}`, color: T.info }}>
                <span>Con IVA (19%): <strong>{fmt(conIva)}</strong></span>
                {costoNum > 0 && (
                  <span style={{ color: T.success }}>
                    Ganancia: <strong>{fmt(ganancia)}</strong>
                    {" "}({precioNum > 0 ? Math.round((ganancia / precioNum) * 100) : 0}% margen)
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {variantes.length > 0 && (
        <button type="button" onClick={agregar}
          className="w-full py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed transition-colors"
          style={{ borderColor: T.brandBorder, color: T.brand }}
          onMouseEnter={e => e.currentTarget.style.background = T.brandLight}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          + Agregar otra presentación
        </button>
      )}
    </div>
  );
}
