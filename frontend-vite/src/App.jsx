// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { RutaProtegida, RutaAdmin } from "./components/RutaProtegida";
import CarritoPanel from "./components/CarritoPanel";
import Navbar       from "./components/Navbar";
import AgendarCita      from "./pages/AgendarCita";
import MisCitas         from "./pages/MisCitas";
import PanelVeterinario from "./pages/PanelVeterinario";

// Páginas
import Landing    from "./pages/Landing";
import Home       from "./pages/Home";
import { Login, Registro } from "./pages/Auth";
import Admin      from "./pages/Admin";
import Carrito    from "./pages/Carrito";
import Producto   from "./pages/Producto";
import Perfil     from "./pages/Perfil";
import MisOrdenes from "./pages/MisOrdenes";

const NoEncontrado = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4"
    style={{ background: "#f6f7f4" }}>
    <div className="text-7xl select-none">🐾</div>
    <h1 className="text-3xl font-bold" style={{ color: "#191c18" }}>Página no encontrada</h1>
    <p className="text-sm" style={{ color: "#788078" }}>La página que buscas no existe o fue movida.</p>
    <a href="/"
      className="mt-2 px-6 py-2.5 rounded-2xl font-semibold text-sm text-white transition-colors"
      style={{ background: "#1a5c1a" }}>
      Volver al inicio
    </a>
  </div>
);

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
        <CarritoProvider>
          {/* Panel carrito global */}
          <CarritoPanel />

          <Routes>
            {/* Landing — sin Navbar */}
            <Route path="/"         element={<Landing />} />

            {/* Auth — sin Navbar */}
            <Route path="/login"    element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Admin — ruta protegida por rol */}
            <Route path="/admin/*"  element={<RutaAdmin><Admin /></RutaAdmin>} />

            {/* Tienda y páginas con Navbar */}
            <Route path="/tienda"
              element={<LayoutConNav><Home /></LayoutConNav>} />

            <Route path="/producto/:slug"
              element={<LayoutConNav><Producto /></LayoutConNav>} />

            <Route path="/carrito"
              element={<LayoutConNav><Carrito /></LayoutConNav>} />

            <Route path="/perfil"
              element={<RutaProtegida><LayoutConNav><Perfil /></LayoutConNav></RutaProtegida>} />

            <Route path="/mis-ordenes"
              element={<RutaProtegida><LayoutConNav><MisOrdenes /></LayoutConNav></RutaProtegida>} />

            <Route path="/agendar-cita"
                element={<AgendarCita />} />

            <Route path="/mis-citas"
                   element={<RutaProtegida><MisCitas /></RutaProtegida>} />

            <Route path="/veterinario"
                 element={<RutaProtegida><PanelVeterinario /></RutaProtegida>} />
                 

            {/* 404 */}
            <Route path="*" element={<NoEncontrado />} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}