// src/components/Navbar.jsx — Victoria Pets · diseño PDF
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faUser, faCartShopping, faBars, faXmark,
  faPaw, faSun, faMoon, faChevronDown, faRightFromBracket,
  faPhone, faTruck, faLocationDot, faClock,
  faBoxOpen, faCalendarCheck, faStethoscope, faGear, faCashRegister,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import logoVP from "../assets/WhatsApp Image 2026-04-22 at 1.19.17 PM.jpeg";

const NAV_LINKS = [
  { to: "/",             label: "Inicio"     },
  { to: "/tienda",       label: "Tienda"     },
  { to: "/#servicios",   label: "Servicios"  },
  { to: "/equipo",       label: "Equipo"     },
  { to: "/agendar-cita", label: "Citas"      },
  { to: "/contacto",     label: "Contacto"   },
];

/* ─── Toggle modo claro/oscuro ───────────────────────────────────────────── */
function ThemeToggle() {
  const { mode, toggle, C } = useTheme();
  return (
    <button
      onClick={toggle}
      title={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      style={{
        width: 38, height: 38, borderRadius: "50%",
        border: `1px solid ${C.lineStrong}`,
        background: C.surface,
        color: C.ink2,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14,
        transition: "all 0.25s",
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = C.brandSoft; e.currentTarget.style.color = C.brand; e.currentTarget.style.borderColor = C.brandBorder; }}
      onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.ink2; e.currentTarget.style.borderColor = C.lineStrong; }}
    >
      <FontAwesomeIcon icon={mode === "dark" ? faSun : faMoon}
        style={{ transition: "transform 0.35s", transform: `rotate(${mode === "dark" ? 360 : 0}deg)` }}/>
    </button>
  );
}

export default function Navbar() {
  const { C } = useTheme();
  const { usuario, logout, esAdmin, esCajero } = useAuth();
  const { totalItems, setAbierto } = useCarrito();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [pagoPendiente, setPagoPendiente] = useState(null);
  const [movilOpen, setMovilOpen] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Banner pago pendiente
  useEffect(() => {
    const check = () => {
      const raw = sessionStorage.getItem("vp_pago_pendiente");
      try { setPagoPendiente(raw ? JSON.parse(raw) : null); } catch { setPagoPendiente(null); }
    };
    check();
    window.addEventListener("pageshow", check);
    return () => window.removeEventListener("pageshow", check);
  }, []);

  const handleLogout   = () => { logout(); navigate("/"); };
  const cerrarBanner   = () => { sessionStorage.removeItem("vp_pago_pendiente"); setPagoPendiente(null); };

  const handleBuscar = (e) => {
    if (e.key === "Enter" && busqueda.trim()) {
      navigate(`/tienda?buscar=${encodeURIComponent(busqueda.trim())}`);
      setBusqueda("");
    }
  };

  const esActivo = (path) => {
    if (path.startsWith("/#")) return false; // anchors no se marcan activos
    return location.pathname === path;
  };

  return (
    <>
      <style>{`
        @keyframes vp-fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes vp-slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vp-bounce    { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .vp-badge-cart { animation: vp-bounce 0.4s ease; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Banner recuperación pago ── */}
      {pagoPendiente && (
        <div style={{
          background: C.brandDark, color: "#fff",
          padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 12, flexWrap: "wrap", fontSize: 13,
          fontFamily: FONT.ui,
        }}>
          <span>
            Orden <strong style={{ fontFamily: FONT.mono }}>{pagoPendiente.codigo}</strong> pendiente. Ve a <strong>Mis órdenes</strong> y pega la referencia ePayco.
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { navigate("/mis-ordenes"); cerrarBanner(); }}
              style={{ padding: "5px 14px", borderRadius: RADIUS.pill, background: C.lime, color: C.brandDark, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: FONT.ui }}
            >
              Mis órdenes →
            </button>
            <button
              onClick={cerrarBanner}
              style={{ padding: "5px 10px", borderRadius: RADIUS.pill, background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Topbar info verde oscuro (estable en ambos modos) ── */}
      <div style={{
        background: C.sidebar,
        color: "rgba(255,255,255,0.85)",
        padding: "7px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
        fontSize: 11,
        fontFamily: FONT.ui,
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
      }} className="vp-topbar">
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <FontAwesomeIcon icon={faTruck} style={{ fontSize: 11, color: C.lime }}/>
            Envíos gratis en Ibagué desde{" "}
            <strong style={{ fontFamily: FONT.mono, color: "#fff" }}>$80.000</strong>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <FontAwesomeIcon icon={faPhone} style={{ fontSize: 11, color: C.lime }}/>
            <strong style={{ color: "#fff" }}>+57 310 555 4321</strong>
          </span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }} className="vp-topbar-right">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <FontAwesomeIcon icon={faClock} style={{ fontSize: 10, opacity: 0.7 }}/>
            Lun–Sáb 8:00–19:00
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 10, opacity: 0.7 }}/>
            Cra. 5 #34-12, Ibagué
          </span>
        </div>
      </div>

      {/* ── Navbar principal ── */}
      <nav style={{
        background: C.surface,
        borderBottom: `1px solid ${scrolled ? C.lineStrong : C.line}`,
        boxShadow: scrolled ? C.shadowSm : "none",
        position: "sticky",
        top: 0, zIndex: 100,
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
        fontFamily: FONT.ui,
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 20px", height: 68,
          display: "flex", alignItems: "center", gap: 24,
        }}>

          {/* Logo */}
          <Link to="/" style={{
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0,
          }}>
            <div style={{ position: "relative" }}>
              <img
                src={logoVP}
                alt="Victoria Pets"
                style={{
                  height: 34, width: 34, borderRadius: RADIUS.sm,
                  objectFit: "cover",
                  border: `1px solid ${C.brandBorder}`,
                }}
              />
              <span style={{
                position: "absolute", bottom: -3, right: -3,
                width: 14, height: 14, background: C.brand,
                borderRadius: "50%",
                border: `2px solid ${C.surface}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 7, color: "#fff",
              }}>
                <FontAwesomeIcon icon={faPaw}/>
              </span>
            </div>
            <span style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 20, color: C.brand,
              letterSpacing: '-0.025em',
            }} className="vp-logo-text">
              Victoria·Pets
            </span>
          </Link>

          {/* Nav links centrados (desktop) */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: 4,
            flex: 1,
            justifyContent: "center",
          }} className="vp-nav-links">
            {NAV_LINKS.map(l => {
              const esAnchor = l.to.startsWith("/#");
              const activo = esActivo(l.to);

              const handleClick = (e) => {
                if (!esAnchor) return; // Link normal sigue su comportamiento
                e.preventDefault();
                const id = l.to.slice(2);

                if (location.pathname === "/") {
                  // Ya estamos en Landing — scroll directo
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.history.replaceState(null, "", `/#${id}`);
                  }
                } else {
                  // Estamos en otra ruta — navegar a / con hash usando react-router
                  navigate({ pathname: "/", hash: `#${id}` });
                }
              };

              // Para anchors usar button (evita comportamiento <Link>)
              const Tag = esAnchor ? "button" : Link;
              const tagProps = esAnchor
                ? { type: "button", onClick: handleClick }
                : { to: l.to, onClick: handleClick };

              return (
                <Tag
                  key={l.to}
                  {...tagProps}
                  style={{
                    position: "relative",
                    padding: "8px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: activo ? 600 : 500,
                    color: activo ? C.ink : C.ink2,
                    transition: "color 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.brand; }}
                  onMouseLeave={e => { e.currentTarget.style.color = activo ? C.ink : C.ink2; }}
                >
                  {l.label}
                  {activo && (
                    <span style={{
                      position: "absolute",
                      bottom: -2,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 18, height: 2,
                      borderRadius: 2,
                      background: C.ink,
                    }}/>
                  )}
                </Tag>
              );
            })}
          </div>

          {/* Buscador */}
          <div style={{
            position: "relative",
            flex: "0 1 280px",
            maxWidth: 280,
          }} className="vp-search-wrap">
            <FontAwesomeIcon icon={faMagnifyingGlass}
              style={{
                position: "absolute",
                left: 14, top: "50%",
                transform: "translateY(-50%)",
                color: C.muted, fontSize: 12,
                pointerEvents: "none",
              }}/>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={handleBuscar}
              placeholder="Buscar producto…"
              style={{
                width: "100%", height: 38,
                padding: "0 14px 0 38px",
                borderRadius: RADIUS.pill,
                border: `1px solid ${C.lineStrong}`,
                background: C.surfaceAlt,
                color: C.ink,
                fontSize: 13, fontFamily: FONT.ui,
                outline: "none",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.background = C.surface; }}
              onBlur={e => { e.currentTarget.style.borderColor = C.lineStrong; e.currentTarget.style.background = C.surfaceAlt; }}
            />
          </div>

          {/* Mi cuenta */}
          {usuario ? (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setMenuAbierto(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 6px",
                  height: 38, borderRadius: RADIUS.pill,
                  border: `1px solid ${menuAbierto ? C.brandBorder : C.lineStrong}`,
                  background: menuAbierto ? C.brandSoft : C.surface,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: FONT.ui,
                }}
                onMouseEnter={e => { if (!menuAbierto) { e.currentTarget.style.borderColor = C.brandBorder; } }}
                onMouseLeave={e => { if (!menuAbierto) { e.currentTarget.style.borderColor = C.lineStrong; } }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: C.brand, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 500, color: C.ink2,
                  maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }} className="vp-user-name">
                  {usuario.nombre}
                </span>
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 9, color: C.muted }}/>
              </button>

              {menuAbierto && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setMenuAbierto(false)}/>
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 220, zIndex: 50,
                    background: C.surfaceElev,
                    border: `1px solid ${C.lineStrong}`,
                    borderRadius: RADIUS.lg,
                    boxShadow: C.shadowLg,
                    overflow: "hidden",
                    animation: "vp-slideDown 0.18s ease",
                  }}>
                    <div style={{ padding: "14px 16px", background: C.brandSoft, borderBottom: `1px solid ${C.brandBorder}` }}>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.brand }}>
                        {usuario.nombre} {usuario.apellido}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: C.ink3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {usuario.email}
                      </p>
                    </div>

                    <div style={{ padding: "6px 0" }}>
                      {[
                        { to: "/perfil",       label: "Mi perfil",     icon: faCircleUser },
                        { to: "/mis-ordenes",  label: "Mis órdenes",   icon: faBoxOpen },
                        { to: "/mis-citas",    label: "Mis citas",     icon: faCalendarCheck },
                        { to: "/agendar-cita", label: "Agendar cita",  icon: faCalendarCheck },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenuAbierto(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 16px", fontSize: 13,
                            color: C.ink2, textDecoration: "none",
                            transition: "all 0.1s",
                            fontFamily: FONT.ui,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.brandSoft; e.currentTarget.style.color = C.brand; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.ink2; }}
                        >
                          <FontAwesomeIcon icon={item.icon} style={{ width: 14, fontSize: 12 }}/>
                          {item.label}
                        </Link>
                      ))}

                      {usuario?.rol === "veterinario" && (
                        <Link to="/veterinario" onClick={() => setMenuAbierto(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 16px", fontSize: 13,
                            color: C.brand, fontWeight: 700,
                            textDecoration: "none",
                            fontFamily: FONT.ui,
                          }}>
                          <FontAwesomeIcon icon={faStethoscope} style={{ width: 14 }}/>
                          Panel veterinario
                        </Link>
                      )}
                      {esCajero && (
                        <Link to="/cajero" onClick={() => setMenuAbierto(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 16px", fontSize: 13,
                            color: C.coral, fontWeight: 700,
                            textDecoration: "none",
                            fontFamily: FONT.ui,
                          }}>
                          <FontAwesomeIcon icon={faCashRegister} style={{ width: 14 }}/>
                          Punto de venta
                        </Link>
                      )}
                      {esAdmin && (
                        <Link to="/admin" onClick={() => setMenuAbierto(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 16px", fontSize: 13,
                            color: C.brand, fontWeight: 700,
                            textDecoration: "none",
                            fontFamily: FONT.ui,
                          }}>
                          <FontAwesomeIcon icon={faGear} style={{ width: 14 }}/>
                          Panel admin
                        </Link>
                      )}
                    </div>

                    <div style={{ borderTop: `1px solid ${C.line}` }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          width: "100%", textAlign: "left",
                          padding: "10px 16px", fontSize: 13,
                          color: C.danger, background: "none",
                          border: "none", cursor: "pointer",
                          fontFamily: FONT.ui,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.dangerBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <FontAwesomeIcon icon={faRightFromBracket} style={{ width: 14 }}/>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "0 14px", height: 38,
                borderRadius: RADIUS.pill,
                border: `1px solid ${C.lineStrong}`,
                background: C.surface, color: C.ink2,
                fontSize: 13, fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.15s",
                flexShrink: 0,
                fontFamily: FONT.ui,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.brandBorder; e.currentTarget.style.color = C.brand; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.lineStrong; e.currentTarget.style.color = C.ink2; }}
            >
              <FontAwesomeIcon icon={faUser} style={{ fontSize: 12 }}/>
              <span className="vp-mi-cuenta">Mi cuenta</span>
            </Link>
          )}

          {/* Toggle tema */}
          <ThemeToggle/>

          {/* Carrito — botón oscuro pill con badge naranja
              Usa C.brandDark (navy profundo) que es estable en ambos temas
              (C.ink en dark mode es crema y el botón quedaba invisible). */}
          <button
            onClick={() => setAbierto(true)}
            title="Carrito"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "0 18px", height: 38,
              borderRadius: RADIUS.pill,
              border: "none",
              background: C.brandDark,
              color: "#fff",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.15s, background 0.15s",
              position: "relative",
              flexShrink: 0,
              fontFamily: FONT.ui,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "#1E3A8A"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = C.brandDark; }}
          >
            <FontAwesomeIcon icon={faCartShopping} style={{ fontSize: 13 }}/>
            <span className="vp-cart-label">Carrito</span>
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="vp-badge-cart"
                style={{
                  minWidth: 22, height: 22, padding: "0 6px",
                  borderRadius: "50%",
                  background: C.coral,
                  color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                  fontFamily: FONT.mono,
                }}>
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMovilOpen(v => !v)}
            className="vp-mobile-btn"
            style={{
              display: "none",
              width: 38, height: 38, borderRadius: RADIUS.sm,
              border: `1px solid ${C.lineStrong}`,
              background: C.surface, color: C.ink,
              cursor: "pointer",
              alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>
            <FontAwesomeIcon icon={movilOpen ? faXmark : faBars}/>
          </button>
        </div>

        {/* Drawer móvil */}
        {movilOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: C.surface,
            borderTop: `1px solid ${C.line}`,
            boxShadow: C.shadowMd,
            padding: "12px 20px",
            display: "flex", flexDirection: "column", gap: 4,
            zIndex: 60,
          }} className="vp-mobile-drawer">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMovilOpen(false)}
                style={{
                  padding: "10px 12px", borderRadius: RADIUS.sm,
                  fontSize: 14, fontWeight: 500,
                  color: esActivo(l.to) ? C.brand : C.ink2,
                  background: esActivo(l.to) ? C.brandSoft : "transparent",
                  textDecoration: "none",
                  fontFamily: FONT.ui,
                }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Responsive helpers */}
      <style>{`
        @media (max-width: 1024px) {
          .vp-topbar-right { display: none !important; }
          .vp-search-wrap  { max-width: 200px !important; flex-basis: 200px !important; }
          .vp-user-name    { display: none !important; }
          .vp-mi-cuenta    { display: none !important; }
        }
        @media (max-width: 820px) {
          .vp-nav-links    { display: none !important; }
          .vp-mobile-btn   { display: flex !important; }
          .vp-cart-label   { display: none !important; }
          .vp-search-wrap  { max-width: 140px !important; flex-basis: 140px !important; }
        }
        @media (max-width: 520px) {
          .vp-search-wrap  { display: none !important; }
          .vp-logo-text    { display: none !important; }
        }
      `}</style>
    </>
  );
}
