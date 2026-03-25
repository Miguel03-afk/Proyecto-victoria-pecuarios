import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

export default function CarritoPanel() {
  const {
    items, abierto, setAbierto, quitar, cambiarCantidad,
    vaciar, quitarNoDisponibles, totalItems, totalPrecio,
    hayNoDisponibles, validando,
  } = useCarrito();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setAbierto(false);
    navigate("/carrito");
  };

  return (
    <>
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:998 }}
        />
      )}

      <div style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:"100%", maxWidth:"400px",
        background:"#fff", zIndex:999,
        display:"flex", flexDirection:"column",
        boxShadow:"-4px 0 32px rgba(0,0,0,0.12)",
        transform: abierto ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-bold text-gray-800 text-base">Tu carrito</h2>
            {totalItems > 0 && (
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
            )}
            {validando && <span className="text-xs text-gray-400 animate-pulse">Verificando...</span>}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={vaciar} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                Vaciar
              </button>
            )}
            <button onClick={() => setAbierto(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors text-xl leading-none">
              ×
            </button>
          </div>
        </div>

        {/* Alerta productos no disponibles */}
        {hayNoDisponibles && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
            <p className="text-xs text-red-600 font-medium">⚠️ Hay productos sin stock o no disponibles</p>
            <button onClick={quitarNoDisponibles}
              className="text-xs text-red-600 hover:text-red-800 font-bold underline flex-shrink-0">
              Quitar
            </button>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="text-6xl">🛒</div>
              <p className="font-semibold text-gray-700">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400">Agrega productos para continuar</p>
              <button onClick={() => setAbierto(false)}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(item => {
                const noDisp = item.activo === false || item.stock === 0;
                return (
                  <div key={item.id}
                    className={`flex gap-3 p-3 rounded-2xl border transition-all ${noDisp ? "bg-red-50 border-red-200 opacity-80" : "bg-gray-50 border-gray-100"}`}>

                    <div
                      className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-green-100 cursor-pointer"
                      onClick={() => { setAbierto(false); navigate(`/producto/${item.slug}`); }}>
                      {item.imagen_url
                        ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                        : <span className="text-2xl">🐾</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      {noDisp && (
                        <span className="inline-block text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-lg mb-1">
                          {item.stock === 0 ? "Sin stock" : "No disponible"}
                        </span>
                      )}
                      <p
                        className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1 cursor-pointer hover:text-green-700 transition-colors"
                        onClick={() => { setAbierto(false); navigate(`/producto/${item.slug}`); }}>
                        {item.nombre}
                      </p>
                      <span className="text-sm font-bold text-green-700">{fmt(item.precio)}</span>

                      <div className="flex items-center justify-between mt-2">
                        <div className={`flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-0.5 ${noDisp ? "opacity-40 pointer-events-none" : ""}`}>
                          <button onClick={() => cambiarCantidad(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-700 font-bold transition-colors">−</button>
                          <span className="text-sm font-bold text-gray-800 min-w-[20px] text-center">{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(item.id, +1)}
                            disabled={item.cantidad >= item.stock}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-700 font-bold transition-colors disabled:opacity-40">+</button>
                        </div>
                        <div className="flex items-center gap-2">
                          {!noDisp && <span className="text-xs font-bold text-gray-700">{fmt(item.precio * item.cantidad)}</span>}
                          <button onClick={() => quitar(item.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total ({totalItems} disponibles)</span>
              <span className="text-green-700 text-lg">{fmt(totalPrecio)}</span>
            </div>
            {totalPrecio >= 80000 && (
              <p className="text-xs text-green-600 font-semibold text-center">🎉 ¡Envío gratis aplicado!</p>
            )}
            <button
              onClick={handleCheckout}
              disabled={hayNoDisponibles || totalItems === 0}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm">
              {hayNoDisponibles ? "Retira productos no disponibles" : "Ver carrito completo →"}
            </button>
            <button onClick={() => setAbierto(false)} className="w-full text-xs text-gray-500 hover:text-gray-700 font-medium py-1">
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}