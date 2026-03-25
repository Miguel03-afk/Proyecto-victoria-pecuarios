import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { useState } from "react";

export default function Navbar() {
  const { usuario, logout, esAdmin } = useAuth();
  const { totalItems, setAbierto } = useCarrito();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const handleLogout = () => { logout(); navigate("/"); };

  const handleBuscar = (e) => {
    if (e.key === "Enter" && busqueda.trim())
      navigate(`/tienda?buscar=${busqueda.trim()}`);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <span className="text-green-800 font-bold text-sm hidden sm:block">Victoria Pecuarios</span>
        </Link>

        {/* Buscador */}
        <div className="flex-1 max-w-lg mx-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={handleBuscar}
              placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition-all placeholder-gray-400" />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Botón carrito */}
          <button onClick={() => setAbierto(true)} title="Carrito"
            className="relative p-2 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {usuario ? (
            <div className="relative">
              <button onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-green-300 transition-colors text-sm text-gray-700 hover:bg-green-50">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[72px] truncate text-xs font-medium">{usuario.nombre}</span>
                <svg className={`w-3 h-3 text-gray-400 transition-transform ${menuAbierto ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {menuAbierto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
                  <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-800 truncate">{usuario.nombre} {usuario.apellido}</p>
                      <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
                    </div>
                    {[
                      { to:"/perfil",      label:"Mi perfil" },
                      { to:"/mis-ordenes", label:"Mis órdenes" },
                      ...(esAdmin ? [{ to:"/admin", label:"Panel admin" }] : []),
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} onClick={() => setMenuAbierto(false)}
                        className="block px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors">
                        {label}
                      </Link>
                    ))}
                    <hr className="my-1 border-gray-50" />
                    <button onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login" className="text-xs text-gray-600 hover:text-green-700 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
