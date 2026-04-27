// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { useState } from "react";
import logoVP from "../assets/WhatsApp Image 2026-04-22 at 1.19.17 PM.jpeg";

const VP = {
  brand:       "#0A6B40",
  brandMid:    "#138553",
  brandDark:   "#064E30",
  brandLight:  "#E4F5EC",
  brandBorder: "#95CCAD",
  lime:        "#7AC143",
  limeDark:    "#5a9030",
  surface:     "#ffffff",
  border:      "rgba(0,0,0,0.08)",
  text:        "#101F16",
  textSec:     "#2D4A38",
  textMuted:   "#8FAA98",
};

const NAVBAR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  nav { animation: slideDown 0.4s cubic-bezier(0.16,1,0.3,1); }
  .vp-topbar { animation: fadeIn 0.6s ease; }
`;

export default function Navbar() {
  const { usuario, logout, esAdmin, esCajero } = useAuth();
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
    <>
      <style>{NAVBAR_STYLE}</style>
      {/* Topbar verde lima */}
      <div className="vp-topbar" style={{
        background: VP.lime,
        textAlign: "center",
        padding: "5px 16px",
        fontSize: 11,
        fontWeight: 600,
        color: VP.brandDark,
        letterSpacing: 0.3,
      }}>
        🚚 Envío gratis en compras mayores a{" "}
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>$80.000</span>
        {" "}— Solo dentro de Ibagué
      </div>

      {/* Navbar principal */}
      <nav style={{
        background: VP.brand,
        borderBottom: `1px solid ${VP.brandDark}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 20px",
          height: 58,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <img
              src={logoVP}
              alt="Victoria Pets"
              style={{ height: 36, width: 36, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)" }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: 15,
                color: "#fff",
              }}>Victoria Pets</span>
              <span style={{ fontSize: 9, color: VP.lime, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
                Veterinaria
              </span>
            </div>
          </Link>

          {/* Buscador */}
          <div style={{ flex: 1, maxWidth: 480, margin: "0 8px" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "rgba(255,255,255,0.5)", pointerEvents: "none" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onKeyDown={handleBuscar}
                placeholder="Buscar productos..."
                style={{
                  width: "100%",
                  paddingLeft: 34,
                  paddingRight: 14,
                  paddingTop: 8,
                  paddingBottom: 8,
                  fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  outline: "none",
                  transition: "all 0.15s",
                }}
                onFocus={e => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.borderColor = "rgba(255,255,255,0.4)"; }}
                onBlur={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(255,255,255,0.18)"; }}
              />
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

            {/* Carrito */}
            <button
              onClick={() => setAbierto(true)}
              title="Carrito"
              style={{
                position: "relative",
                padding: "7px 9px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 8,
                cursor: "pointer",
                color: "#fff",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
            >
              <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 17,
                  height: 17,
                  background: VP.lime,
                  color: VP.brandDark,
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Usuario autenticado */}
            {usuario ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 10px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "#fff",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: VP.lime,
                    color: VP.brandDark,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {usuario.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {usuario.nombre}
                  </span>
                </button>

                {menuAbierto && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setMenuAbierto(false)} />
                    <div style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: 200,
                      background: VP.surface,
                      border: `1px solid ${VP.brandBorder}`,
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(27,79,138,0.12)",
                      zIndex: 50,
                      overflow: "hidden",
                    }}>
                      {/* Cabecera */}
                      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${VP.brandLight}`, background: VP.brandLight }}>
                        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: VP.brand }}>{usuario.nombre} {usuario.apellido}</p>
                        <p style={{ margin: 0, fontSize: 11, color: VP.brandMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{usuario.email}</p>
                      </div>

                      {/* Links */}
                      <div style={{ padding: "4px 0" }}>
                        {[
                          { to: "/perfil",       label: "Mi perfil" },
                          { to: "/mis-ordenes",  label: "Mis órdenes" },
                          { to: "/mis-citas",    label: "Mis citas" },
                          { to: "/agendar-cita", label: "Agendar cita" },
                        ].map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMenuAbierto(false)}
                            style={{ display: "block", padding: "8px 14px", fontSize: 12, color: VP.textSec, textDecoration: "none", transition: "all 0.12s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = VP.brandLight; e.currentTarget.style.color = VP.brand; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = VP.textSec; }}
                          >
                            {item.label}
                          </Link>
                        ))}

                        {usuario?.rol === "veterinario" && (
                          <Link to="/veterinario" onClick={() => setMenuAbierto(false)}
                            style={{ display: "block", padding: "8px 14px", fontSize: 12, color: VP.brand, fontWeight: 700, textDecoration: "none", transition: "all 0.12s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = VP.brandLight; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                            Panel veterinario
                          </Link>
                        )}

                        {esCajero && (
                          <Link to="/cajero" onClick={() => setMenuAbierto(false)}
                            style={{ display: "block", padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#b45309", textDecoration: "none", transition: "all 0.12s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fef3c7"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                            Punto de venta
                          </Link>
                        )}

                        {esAdmin && (
                          <Link to="/admin" onClick={() => setMenuAbierto(false)}
                            style={{ display: "block", padding: "8px 14px", fontSize: 12, fontWeight: 700, color: VP.brand, textDecoration: "none", transition: "all 0.12s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = VP.brandLight; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                            Panel admin
                          </Link>
                        )}
                      </div>

                      <div style={{ borderTop: `1px solid ${VP.brandLight}`, padding: "4px 0" }}>
                        <button
                          onClick={handleLogout}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", transition: "all 0.12s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.22)",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    background: "rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: VP.lime,
                    color: VP.brandDark,
                    textDecoration: "none",
                    border: `1px solid ${VP.limeDark}`,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = VP.limeDark; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = VP.lime; e.currentTarget.style.color = VP.brandDark; }}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
