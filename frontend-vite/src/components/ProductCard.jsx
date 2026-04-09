// src/components/ProductCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);

const descPct = (precio, antes) =>
  antes && Number(antes) > Number(precio)
    ? Math.round(((Number(antes) - Number(precio)) / Number(antes)) * 100)
    : null;

export default function ProductCard({ producto }) {
  const { agregar }   = useCarrito();
  const { usuario }   = useAuth();
  const navigate      = useNavigate();
  const [agregado, setAgregado] = useState(false);

  const dc = descPct(producto.precio, producto.precio_antes);
  const hayStock = producto.stock > 0;

  const handleAgregar = (e) => {
    e.preventDefault(); // no navegar al hacer click en el botón
    if (!usuario) { navigate("/login"); return; }
    if (!hayStock) return;
    agregar({
      id:          producto.id,
      producto_id: producto.id,
      variante_id: null,
      nombre:      producto.nombre,
      slug:        producto.slug,
      precio:      Number(producto.precio),
      imagen_url:  producto.imagen_url,
      stock:       producto.stock,
      activo:      1,
    }, 1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <Link
      to={`/producto/${producto.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 flex flex-col">

      {/* Imagen */}
      <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden flex items-center justify-center">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-400"
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <span className="text-6xl">🐾</span>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {dc && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
              -{dc}%
            </span>
          )}
          {producto.destacado ? (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
              ★ Top
            </span>
          ) : null}
        </div>

        {!hayStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">
          {producto.categoria}
        </span>
        <h3 className="text-sm font-semibold text-green-950 line-clamp-2 leading-snug mb-1 group-hover:text-green-700 transition-colors flex-1">
          {producto.nombre}
        </h3>
        {producto.marca && (
          <p className="text-xs text-green-600/50 mb-2">{producto.marca}</p>
        )}
        {producto.descripcion_corta && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {producto.descripcion_corta}
          </p>
        )}

        {/* Precio y CTA */}
        <div className="mt-auto">
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-base font-bold text-green-700 tabular-nums">{fmt(producto.precio)}</span>
            {producto.precio_antes && Number(producto.precio_antes) > 0 && (
              <span className="text-xs text-green-600/40 line-through tabular-nums">{fmt(producto.precio_antes)}</span>
            )}
          </div>

          <button
            onClick={handleAgregar}
            disabled={!hayStock}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
              agregado
                ? "bg-green-600 text-white"
                : hayStock
                ? "bg-green-700 hover:bg-green-800 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}>
            {agregado ? "✓ Agregado" : hayStock ? "Agregar al carrito" : "Sin stock"}
          </button>
        </div>
      </div>
    </Link>
  );
}
