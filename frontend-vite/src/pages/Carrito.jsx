import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

// ── Pasos ─────────────────────────────────────────────────────
const PASOS = ["Carrito", "Envío", "Pago"];

function PasoIndicador({ paso }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {PASOS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${i < paso ? "bg-green-600 text-white" :
                i === paso ? "bg-green-700 text-white ring-4 ring-green-100" :
                "bg-gray-100 text-gray-400"}`}>
              {i < paso ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-semibold ${i === paso ? "text-green-700" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < PASOS.length - 1 && (
            <div className={`w-16 h-0.5 mb-4 transition-colors ${i < paso ? "bg-green-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Paso 1: Carrito ───────────────────────────────────────────
function PasoCarrito({ onContinuar }) {
  const { items, quitar, cambiarCantidad, totalItems, totalPrecio } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [guardados, setGuardados] = useState(() => {
    try { return JSON.parse(localStorage.getItem("guardados_later") || "[]"); }
    catch { return []; }
  });

  const guardarParaDespues = (item) => {
    quitar(item.id);
    const nuevos = [...guardados, item];
    setGuardados(nuevos);
    localStorage.setItem("guardados_later", JSON.stringify(nuevos));
  };

  const moverAlCarrito = (item) => {
    const { agregar } = useCarritoFn();
    const nuevos = guardados.filter(g => g.id !== item.id);
    setGuardados(nuevos);
    localStorage.setItem("guardados_later", JSON.stringify(nuevos));
  };

  const envioGratis = totalPrecio >= 80000;
  const costoEnvio  = envioGratis ? 0 : 8900;
  const total       = totalPrecio + costoEnvio;

  if (items.length === 0 && guardados.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Agrega productos para continuar</p>
        <Link to="/tienda" className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lista de productos */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="font-bold text-gray-800 text-lg mb-4">
          {items.length} {items.length === 1 ? "producto" : "productos"} en tu carrito
        </h2>

        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
            {/* Imagen */}
            <div
              className="w-24 h-24 rounded-xl overflow-hidden bg-green-50 border border-green-100 flex-shrink-0 cursor-pointer"
              onClick={() => navigate(`/producto/${item.slug}`)}>
              {item.imagen_url
                ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-gray-800 text-sm mb-1 cursor-pointer hover:text-green-700 transition-colors line-clamp-2"
                onClick={() => navigate(`/producto/${item.slug}`)}>
                {item.nombre}
              </h3>
              <p className="text-xs text-gray-400 mb-3">Stock disponible: {item.stock} unidades</p>

              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Cantidad */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 p-1">
                  <button onClick={() => cambiarCantidad(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100 text-green-700 font-bold transition-colors text-lg">−</button>
                  <span className="text-sm font-bold text-gray-800 min-w-[24px] text-center">{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id, +1)}
                    disabled={item.cantidad >= item.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100 text-green-700 font-bold transition-colors disabled:opacity-40 text-lg">+</button>
                </div>

                {/* Precio */}
                <div className="text-right">
                  <div className="font-bold text-green-700 text-lg">{fmt(item.precio * item.cantidad)}</div>
                  {item.cantidad > 1 && (
                    <div className="text-xs text-gray-400">{fmt(item.precio)} c/u</div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 mt-3">
                <button onClick={() => quitar(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={() => guardarParaDespues(item)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                  🔖 Guardar para más tarde
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Guardados para más tarde */}
        {guardados.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-gray-700 text-base mb-4 flex items-center gap-2">
              🔖 Guardados para más tarde
              <span className="text-xs font-normal text-gray-400">({guardados.length})</span>
            </h3>
            <div className="space-y-3">
              {guardados.map(item => {
                const { agregar } = require ? null : null;
                return (
                  <GuardadoItem
                    key={item.id}
                    item={item}
                    onMover={() => {
                      const nuevos = guardados.filter(g => g.id !== item.id);
                      setGuardados(nuevos);
                      localStorage.setItem("guardados_later", JSON.stringify(nuevos));
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resumen del pedido */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
          <h3 className="font-bold text-gray-800 mb-4">Resumen del pedido</h3>

          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{item.nombre} x{item.cantidad}</span>
                <span className="font-medium text-gray-800 flex-shrink-0">{fmt(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{fmt(totalPrecio)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Envío</span>
              <span className={envioGratis ? "text-green-600 font-semibold" : ""}>
                {envioGratis ? "Gratis 🎉" : fmt(costoEnvio)}
              </span>
            </div>
            {!envioGratis && (
              <p className="text-xs text-gray-400">
                Te faltan {fmt(80000 - totalPrecio)} para envío gratis
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex justify-between font-bold text-gray-800 text-lg mb-4">
              <span>Total</span>
              <span className="text-green-700">{fmt(total)}</span>
            </div>
            <button onClick={onContinuar}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-sm">
              Realizar pedido →
            </button>
            <Link to="/tienda"
              className="block text-center text-xs text-gray-500 hover:text-gray-700 font-medium mt-3">
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Item guardado para más tarde
function GuardadoItem({ item, onMover }) {
  const { agregar } = useCarrito();
  const navigate = useNavigate();

  const handleMover = () => {
    agregar(item, item.cantidad);
    onMover();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 opacity-80">
      <div
        className="w-16 h-16 rounded-xl overflow-hidden bg-green-50 border border-green-100 flex-shrink-0 cursor-pointer"
        onClick={() => navigate(`/producto/${item.slug}`)}>
        {item.imagen_url
          ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-700 text-sm line-clamp-1 mb-1">{item.nombre}</h4>
        <p className="text-green-700 font-bold text-sm mb-2">{fmt(item.precio)}</p>
        <button onClick={handleMover}
          className="text-xs bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-3 py-1.5 rounded-lg transition-colors">
          Mover al carrito
        </button>
      </div>
    </div>
  );
}

// ── Paso 2: Envío ─────────────────────────────────────────────
function PasoEnvio({ onContinuar, onVolver, datosEnvio, setDatosEnvio }) {
  const set = k => e => setDatosEnvio({ ...datosEnvio, [k]: e.target.value });

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 focus:bg-white transition-all";

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="font-bold text-gray-800 text-lg mb-6">Información de envío</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre</label>
            <input className={inputCls} value={datosEnvio.nombre} onChange={set("nombre")} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Apellido</label>
            <input className={inputCls} value={datosEnvio.apellido} onChange={set("apellido")} placeholder="Tu apellido" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Teléfono</label>
          <input className={inputCls} value={datosEnvio.telefono} onChange={set("telefono")} placeholder="300 000 0000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dirección</label>
          <input className={inputCls} value={datosEnvio.direccion} onChange={set("direccion")} placeholder="Cra. 15 #85-23" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ciudad</label>
            <input className={inputCls} value={datosEnvio.ciudad} onChange={set("ciudad")} placeholder="Bogotá" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Departamento</label>
            <input className={inputCls} value={datosEnvio.departamento} onChange={set("departamento")} placeholder="Cundinamarca" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notas adicionales</label>
          <textarea className={inputCls} value={datosEnvio.notas} onChange={set("notas")} placeholder="Apto, torre, indicaciones..." rows={2} />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onVolver} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors">
          ← Volver
        </button>
        <button onClick={onContinuar}
          disabled={!datosEnvio.nombre || !datosEnvio.direccion || !datosEnvio.ciudad}
          className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          Continuar al pago →
        </button>
      </div>
    </div>
  );
}

// ── Paso 3: Pago ──────────────────────────────────────────────
function PasoPago({ onVolver, datosEnvio }) {
  const { items, totalPrecio, vaciar } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState("efectivo");
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  const envioGratis = totalPrecio >= 80000;
  const costoEnvio  = envioGratis ? 0 : 8900;
  const total       = totalPrecio + costoEnvio;

  const handlePagar = async () => {
    if (!usuario) {
      navigate("/login", { state: { desde: "/carrito" } });
      return;
    }
    setProcesando(true);
    // Simulación — aquí irá la integración con pasarela de pagos
    await new Promise(r => setTimeout(r, 2000));
    setExito(true);
    vaciar();
    setProcesando(false);
  };

  if (exito) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">¡Pedido realizado!</h2>
        <p className="text-gray-500 mb-6">Te enviaremos la confirmación a tu correo pronto.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/mis-ordenes" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors">
            Ver mis órdenes
          </Link>
          <Link to="/tienda" className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:border-gray-400 transition-colors">
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-5">
        <h2 className="font-bold text-gray-800 text-lg">Método de pago</h2>

        {!usuario && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Debes iniciar sesión para pagar</p>
              <p className="text-xs text-amber-700 mt-1">Tu carrito se guardará automáticamente.</p>
              <button onClick={() => navigate("/login", { state: { desde: "/carrito" } })}
                className="mt-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-lg transition-colors">
                Iniciar sesión
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          {[
            { id:"efectivo",      label:"Efectivo / Contraentrega", icono:"💵" },
            { id:"transferencia", label:"Transferencia bancaria",   icono:"🏦" },
            { id:"pse",           label:"PSE",                      icono:"💳" },
            { id:"tarjeta",       label:"Tarjeta débito/crédito",   icono:"💳" },
          ].map(m => (
            <label key={m.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                ${metodo === m.id ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
              <input type="radio" name="metodo" value={m.id} checked={metodo === m.id}
                onChange={() => setMetodo(m.id)} className="sr-only" />
              <span className="text-xl">{m.icono}</span>
              <span className="text-sm font-semibold text-gray-700">{m.label}</span>
              {metodo === m.id && <span className="ml-auto text-green-600">✓</span>}
            </label>
          ))}
        </div>

        {/* Dirección confirmada */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700 text-sm">Dirección de entrega</h4>
            <button onClick={onVolver} className="text-xs text-green-600 hover:underline">Cambiar</button>
          </div>
          <p className="text-sm text-gray-600">{datosEnvio.nombre} {datosEnvio.apellido}</p>
          <p className="text-sm text-gray-600">{datosEnvio.direccion}, {datosEnvio.ciudad}</p>
          {datosEnvio.telefono && <p className="text-sm text-gray-600">{datosEnvio.telefono}</p>}
        </div>
      </div>

      {/* Resumen final */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
          <h3 className="font-bold text-gray-800 mb-4">Resumen final</h3>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-xs text-gray-600">
                <span className="line-clamp-1 flex-1 mr-2">{item.nombre} x{item.cantidad}</span>
                <span className="font-medium flex-shrink-0">{fmt(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{fmt(totalPrecio)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Envío</span>
              <span className={envioGratis ? "text-green-600 font-semibold" : ""}>{envioGratis ? "Gratis 🎉" : fmt(costoEnvio)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-lg pt-2 border-t border-gray-100">
              <span>Total</span><span className="text-green-700">{fmt(total)}</span>
            </div>
          </div>
          <button onClick={handlePagar} disabled={procesando || !usuario}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-sm mt-4 flex items-center justify-center gap-2">
            {procesando ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg> Procesando...</>
            ) : usuario ? "Confirmar pedido ✓" : "Inicia sesión para pagar"}
          </button>
          <button onClick={onVolver} className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2 py-1">← Volver</button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function Carrito() {
  const [paso, setPaso] = useState(0);
  const [datosEnvio, setDatosEnvio] = useState({
    nombre:"", apellido:"", telefono:"", direccion:"", ciudad:"", departamento:"", notas:"",
  });
  const { usuario } = useAuth();

  const irPaso2 = () => {
    if (!usuario) {
      // Pre-llenar con datos del usuario si está logueado
    }
    setPaso(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PasoIndicador paso={paso} />
        {paso === 0 && <PasoCarrito onContinuar={irPaso2} />}
        {paso === 1 && <PasoEnvio onContinuar={() => setPaso(2)} onVolver={() => setPaso(0)} datosEnvio={datosEnvio} setDatosEnvio={setDatosEnvio} />}
        {paso === 2 && <PasoPago onVolver={() => setPaso(1)} datosEnvio={datosEnvio} />}
      </div>
    </div>
  );
}