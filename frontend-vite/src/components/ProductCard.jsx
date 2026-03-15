import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ producto }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const handleComprar = () => {
    if (!usuario) navigate("/login", { state: { desde: `/producto/${producto.slug}` } });
    else navigate(`/producto/${producto.slug}`);
  };

  const descuento = producto.precio_antes
    ? Math.round(((producto.precio_antes - producto.precio) / producto.precio_antes) * 100)
    : null;

  const sinStock = producto.stock === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col">

      {/* Imagen */}
      <div className="relative overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => navigate(`/producto/${producto.slug}`)}>
        <img
          src={producto.imagen_url || "https://placehold.co/300x200/e8f5e9/2e7d32?text=Producto"}
          alt={producto.nombre}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = "https://placehold.co/300x200/e8f5e9/2e7d32?text=Producto"; }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {descuento && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">-{descuento}%</span>
          )}
          {producto.destacado === 1 && (
            <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">★ Top</span>
          )}
        </div>
        {sinStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-xs bg-white px-3 py-1 rounded-full border">Sin stock</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 flex flex-col flex-1">
        {producto.categoria && (
          <span className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-0.5">{producto.categoria}</span>
        )}
        <h3 onClick={() => navigate(`/producto/${producto.slug}`)}
          className="text-sm font-semibold text-gray-800 leading-snug mb-0.5 cursor-pointer hover:text-green-700 transition-colors line-clamp-2">
          {producto.nombre}
        </h3>
        {producto.marca && <p className="text-xs text-gray-400 mb-1.5">{producto.marca}</p>}

        <div className="mt-auto pt-2">
          <div className="flex items-end gap-1.5 mb-2.5">
            <span className="text-base font-bold text-green-700">
              ${Number(producto.precio).toLocaleString("es-CO")}
            </span>
            {producto.precio_antes && (
              <span className="text-xs text-gray-400 line-through mb-0.5">
                ${Number(producto.precio_antes).toLocaleString("es-CO")}
              </span>
            )}
          </div>

          <button onClick={handleComprar} disabled={sinStock}
            className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95
              bg-green-600 hover:bg-green-700 text-white
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
            {sinStock ? "Sin stock" : usuario ? "Agregar al carrito" : "Comprar"}
          </button>
        </div>
      </div>
    </div>
  );
}
