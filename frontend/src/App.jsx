// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider }    from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { ThemeProvider, useTheme } from "./styles/ThemeProvider.jsx";
import { FONT } from "./styles/admin.tokens";
import { RutaProtegida, RutaAdmin, RutaCajero } from "./components/RutaProtegida";
import CarritoPanel from "./components/CarritoPanel";
import Navbar       from "./components/Navbar";
import ChatbotWidget from "./components/ChatbotWidget";
import AgendarCita      from "./pages/AgendarCita";
import MisCitas         from "./pages/MisCitas";
import PanelVeterinario from "./pages/PanelVeterinario";
import PanelCajero      from "./pages/PanelCajero";

// Páginas
import Landing    from "./pages/Landing";
import Home       from "./pages/Home";
import Login        from "./pages/auth/Login";
import Registro     from "./pages/auth/Registro";
import VerificarOTP from "./pages/auth/VerificarOTP";
import SolicitarReset       from "./pages/auth/SolicitarReset";
import RestablecerPassword  from "./pages/auth/RestablecerPassword";
import Admin      from "./pages/Admin";
import Carrito    from "./pages/Carrito";
import Producto   from "./pages/Producto";
import Perfil     from "./pages/Perfil";
import MisOrdenes     from "./pages/MisOrdenes";
import PagoRespuesta  from "./pages/PagoRespuesta";
import Equipo     from "./pages/Equipo";
import Contacto   from "./pages/Contacto";
import Galeria    from "./pages/Galeria";

const NoEncontrado = () => {
  const { C } = useTheme();
  return (
    <div style={{
      minHeight: "100vh",
      background: C.canvas, color: C.ink,
      fontFamily: FONT.ui,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 18, textAlign: "center", padding: 24,
    }}>
      <div style={{ fontSize: 72 }}>🐾</div>
      <h1 style={{
        margin: 0,
        fontFamily: FONT.display,
        fontWeight: 700, fontSize: 38, color: C.ink,
        letterSpacing: '-0.025em', lineHeight: 1.05,
      }}>
        Página no encontrada
      </h1>
      <p style={{ margin: 0, fontSize: 14, color: C.ink3 }}>
        La página que buscas no existe o fue movida.
      </p>
      <a href="/" style={{
        marginTop: 8, padding: "12px 26px", borderRadius: 12,
        background: C.brand, color: C.canvas, textDecoration: "none",
        fontSize: 14, fontWeight: 600,
      }}>
        Volver al inicio
      </a>
    </div>
  );
};

function LayoutConNav({ children }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  );
}

/* Renderiza el chatbot solo en rutas públicas/cliente.
   Lo oculta en paneles internos (/admin, /cajero, /veterinario). */
function ChatbotConditional() {
  const location = useLocation();
  const ocultarEn = ["/admin", "/cajero", "/veterinario"];
  const oculto = ocultarEn.some((prefix) => location.pathname.startsWith(prefix));
  if (oculto) return null;
  return <ChatbotWidget />;
}

/* Wrapper de transición fade entre rutas */
function PageFade({ children }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [displayedPath, setDisplayedPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== displayedPath) {
      setVisible(false);
      const t = setTimeout(() => {
        setDisplayedPath(location.pathname);
        setVisible(true);
      }, 160);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    }
  }, [location.pathname, displayedPath]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <CarritoProvider>
          {/* Panel carrito global */}
          <CarritoPanel />

          <PageFade>
          <Routes>
            {/* Landing — sin Navbar (lo integra él mismo) */}
            <Route path="/"         element={<Landing />} />

            {/* Páginas públicas con Navbar+Footer integrados */}
            <Route path="/equipo"   element={<Equipo />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/galeria"  element={<Galeria />} />

            {/* Auth — sin Navbar (layout fullscreen propio) */}
            <Route path="/login"                 element={<Login />} />
            <Route path="/registro"              element={<Registro />} />
            <Route path="/verificar-email"       element={<VerificarOTP />} />
            <Route path="/solicitar-reset"       element={<SolicitarReset />} />
            <Route path="/restablecer-password"  element={<RestablecerPassword />} />

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
              element={<RutaProtegida><Perfil /></RutaProtegida>} />

            <Route path="/mis-ordenes"
              element={<RutaProtegida><LayoutConNav><MisOrdenes /></LayoutConNav></RutaProtegida>} />

            {/* Respuesta de pago ePayco — sin Navbar, sin protección (puede llegar sin sesión) */}
            <Route path="/pago/respuesta" element={<PagoRespuesta />} />

            <Route path="/agendar-cita"
                element={<AgendarCita />} />

            <Route path="/mis-citas"
                   element={<RutaProtegida><MisCitas /></RutaProtegida>} />

            <Route path="/veterinario"
                 element={<RutaProtegida><PanelVeterinario /></RutaProtegida>} />

            <Route path="/cajero"
                 element={<RutaCajero><PanelCajero /></RutaCajero>} />
                 

            {/* 404 */}
            <Route path="*" element={<NoEncontrado />} />
          </Routes>
          </PageFade>

          {/* Chatbot Coco — solo en rutas públicas/cliente */}
          <ChatbotConditional />
        </CarritoProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}