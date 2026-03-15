import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RutaProtegida, RutaAdmin } from "./components/RutaProtegida";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Login, Registro } from "./pages/Auth";

// Páginas pendientes (las construimos en el siguiente paso)
const Perfil      = () => <div className="p-8 text-center text-gray-500">Perfil — próximamente</div>;
const MisOrdenes  = () => <div className="p-8 text-center text-gray-500">Mis órdenes — próximamente</div>;
const Carrito     = () => <div className="p-8 text-center text-gray-500">Carrito — próximamente</div>;
const Producto    = () => <div className="p-8 text-center text-gray-500">Detalle producto — próximamente</div>;
import Admin from "./pages/Admin.jsx";
const NoEncontrado = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
    <div className="text-7xl">🐾</div>
    <h1 className="text-3xl font-bold text-gray-800">Página no encontrada</h1>
    <p className="text-gray-500">La página que buscas no existe o fue movida.</p>
    <a href="/" className="bg-green-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-green-700 transition-colors">
      Volver a la tienda
    </a>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Públicas */}
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/registro"  element={<Registro />} />
            <Route path="/producto/:slug" element={<Producto />} />

            {/* Requieren login */}
            <Route path="/carrito"   element={<RutaProtegida><Carrito /></RutaProtegida>} />
            <Route path="/perfil"    element={<RutaProtegida><Perfil /></RutaProtegida>} />
            <Route path="/mis-ordenes" element={<RutaProtegida><MisOrdenes /></RutaProtegida>} />

            {/* Solo admin/superadmin */}
            <Route path="/admin/*"   element={<RutaAdmin><Admin /></RutaAdmin>} />

            <Route path="*"          element={<NoEncontrado />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
