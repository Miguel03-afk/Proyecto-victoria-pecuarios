import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RutaProtegida, RutaAdmin } from "./components/RutaProtegida";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import { Login, Registro } from "./pages/Auth";
import Admin from "./pages/Admin";

const Perfil     = () => <div className="p-8 text-center text-gray-500">Perfil — próximamente</div>;
const MisOrdenes = () => <div className="p-8 text-center text-gray-500">Mis órdenes — próximamente</div>;
const Carrito    = () => <div className="p-8 text-center text-gray-500">Carrito — próximamente</div>;
const Producto   = () => <div className="p-8 text-center text-gray-500">Detalle producto — próximamente</div>;
const NoEncontrado = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
    <div className="text-7xl">🐾</div>
    <h1 className="text-3xl font-bold text-gray-800">Página no encontrada</h1>
    <a href="/" className="bg-green-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-green-700 transition-colors">
      Volver al inicio
    </a>
  </div>
);

// Layout con Navbar (tienda y páginas internas)
function LayoutConNav({ children }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing — sin Navbar del carrito */}
          <Route path="/" element={<Landing />} />

          {/* Auth — sin Navbar */}
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Admin — layout propio */}
          <Route path="/admin/*" element={<RutaAdmin><Admin /></RutaAdmin>} />

          {/* Tienda y páginas con Navbar */}
          <Route path="/tienda" element={<LayoutConNav><Home /></LayoutConNav>} />
          <Route path="/producto/:slug" element={<LayoutConNav><Producto /></LayoutConNav>} />
          <Route path="/carrito"    element={<RutaProtegida><LayoutConNav><Carrito /></LayoutConNav></RutaProtegida>} />
          <Route path="/perfil"     element={<RutaProtegida><LayoutConNav><Perfil /></LayoutConNav></RutaProtegida>} />
          <Route path="/mis-ordenes" element={<RutaProtegida><LayoutConNav><MisOrdenes /></LayoutConNav></RutaProtegida>} />

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
