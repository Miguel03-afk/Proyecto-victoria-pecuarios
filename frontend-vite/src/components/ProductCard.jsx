import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useState } from "react";

export default function ProductCard({ producto }) {
  const { agregar, items } = useCarrito();
  const navigate = useNavigate();
  const [agregado, setAgregado] = useState(false);

  const sinStock  = Number(producto.stock) === 0;
  const inactivo  = producto.activo === 0 || producto.activo === false;
  const noDisponible = sinStock || inactivo;

  // Cuántas unidades ya hay en el carrito
  const enCarrito = items.find(i => i.id === producto.id)?.cantidad || 0;
  const limiteAlcanzado = enCarrito >= Number(producto.stock);

  const descuento = producto.precio_antes
    ? Math.round(((producto.precio_antes - producto.precio) / producto.precio_antes) * 100)
    : null;

  const handleAgregar = (e) => {
    e.stopPropagation();
    if (noDisponible || limiteAlcanzado) return;
    agregar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden group flex flex-col
      ${noDisponible
        ? "border-gray-100 opacity-70"
        : "border-gray-100 hover:border-green-200 hover:shadow-md"}`}>

      {/* Imagen */}
      <div
        className={`relative overflow-hidden bg-gray-50 h-40 ${!noDisponible ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => !noDisponible && navigate(`/producto/${producto.slug}`)}>
        {producto.imagen_url
          ? <img src={producto.imagen_url} alt={producto.nombre}
              className={`w-full h-full object-cover transition-transform duration-300 ${!noDisponible ? "group-hover:scale-105" : ""}`} />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>
        }

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {descuento && !noDisponible && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">-{descuento}%</span>
          )}
          {producto.destacado === 1 && !noDisponible && (
            <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">★ Top</span>
          )}
        </div>

        {/* Overlay sin disponibilidad */}
        {noDisponible && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-xs bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              {inactivo ? "No disponible" : "Sin stock"}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 flex flex-col flex-1">
        {producto.categoria && (
          <span className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-0.5">{producto.categoria}</span>
        )}
        <h3
          onClick={() => !noDisponible && navigate(`/producto/${producto.slug}`)}
          className={`text-sm font-semibold text-gray-800 leading-snug mb-0.5 line-clamp-2
            ${!noDisponible ? "cursor-pointer hover:text-green-700 transition-colors" : ""}`}>
          {producto.nombre}
        </h3>
        {producto.marca && <p className="text-xs text-gray-400 mb-1.5">{producto.marca}</p>}

        <div className="mt-auto pt-2">
          {/* Precio */}
          <div className="flex items-end gap-1.5 mb-2.5">
            <span className={`text-base font-bold ${noDisponible ? "text-gray-400" : "text-green-700"}`}>
              ${Number(producto.precio).toLocaleString("es-CO")}
            </span>
            {producto.precio_antes && (
              <span className="text-xs text-gray-400 line-through mb-0.5">
                ${Number(producto.precio_antes).toLocaleString("es-CO")}
              </span>
            )}
          </div>

          {/* Indicador en carrito */}
          {enCarrito > 0 && !noDisponible && (
            <p className="text-xs text-green-600 font-medium mb-1.5">✓ {enCarrito} en tu carrito</p>
          )}

          {/* Botón */}
          <button
            onClick={handleAgregar}
            disabled={noDisponible || limiteAlcanzado}
            className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95
              ${noDisponible
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : limiteAlcanzado
                ? "bg-amber-100 text-amber-700 cursor-not-allowed"
                : agregado
                ? "bg-green-500 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"}`}>
            {noDisponible
              ? inactivo ? "No disponible" : "Sin stock"
              : limiteAlcanzado
              ? "Stock máximo en carrito"
              : agregado
              ? "✓ Agregado"
              : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}