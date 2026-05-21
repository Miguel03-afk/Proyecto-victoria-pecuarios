// src/components/CarritoPanel.jsx — drawer lateral premium navy + lime
import { useNavigate, Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT } from "../styles/admin.tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faCartShopping, faPaw, faPlus, faMinus, faTrash,
  faArrowRight, faTruckFast, faTriangleExclamation, faGift,
} from "@fortawesome/free-solid-svg-icons";

const STATIC = "http://localhost:3000";

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

const imgSrc = (item) => {
  const url = item.imagen_url || item.imagen;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STATIC}${url}`;
};

export default function CarritoPanel() {
  const { C } = useTheme();
  const {
    items, abierto, setAbierto,
    quitar, cambiarCantidad, vaciar, quitarNoDisponibles,
    totalItems, totalPrecio, hayNoDisponibles, validando,
  } = useCarrito();
  const navigate = useNavigate();

  const navy     = C.navy     || '#1E3A8A';
  const navyDeep = C.navyDeep || '#0F2563';
  const lime     = C.lime     || '#7BC142';
  const limeDeep = C.limeDeep || '#5DA328';
  const red      = C.red      || '#E63946';
  const inkSoft  = C.inkSoft  || C.ink2;
  const inkMuted = C.inkMuted || C.ink3;

  const handleCheckout = () => {
    setAbierto(false);
    navigate("/carrito");
  };

  const irAProducto = (slug) => {
    setAbierto(false);
    navigate(`/producto/${slug}`);
  };

  return (
    <>
      {/* Overlay — fade in con backdrop blur, sincronizado al drawer */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(10,20,38,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: "vp-backdrop-in 240ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      )}

      {/* Panel — drawer con curva iOS (Ionic) y 300ms para sensación snappy */}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "100%", maxWidth: 440, zIndex: 999,
        display: "flex", flexDirection: "column",
        background: C.surface,
        fontFamily: FONT.ui,
        boxShadow: "-24px 0 60px -20px rgba(10,20,38,0.35)",
        transform: abierto ? "translateX(0)" : "translateX(100%)",
        transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
        willChange: "transform",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `linear-gradient(135deg, ${lime} 0%, ${navy} 100%)`,
              color: '#fff',
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <FontAwesomeIcon icon={faCartShopping} style={{ fontSize: 16 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700, color: C.ink,
                fontFamily: FONT.display, fontStyle: 'italic',
              }}>
                Tu carrito
              </h2>
              {validando ? (
                <span style={{ fontSize: 11, color: inkMuted }}>Verificando stock…</span>
              ) : (
                <span style={{ fontSize: 11, color: inkMuted }}>
                  {totalItems > 0
                    ? `${totalItems} producto${totalItems !== 1 ? "s" : ""}`
                    : "Vacío por ahora"}
                </span>
              )}
            </div>
            {totalItems > 0 && (
              <div style={{
                background: navy, color: "#fff",
                fontSize: 11, fontWeight: 800,
                minWidth: 22, height: 22, borderRadius: 999,
                padding: '0 7px',
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontVariantNumeric: 'tabular-nums', marginLeft: 4,
              }}>
                {totalItems}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {items.length > 0 && (
              <button
                onClick={vaciar}
                title="Vaciar carrito"
                style={{
                  fontSize: 11, color: red, background: `${red}10`,
                  border: `1px solid ${red}33`,
                  borderRadius: 999, padding: "6px 12px",
                  cursor: "pointer", fontWeight: 700, fontFamily: 'inherit',
                  transition: "all 0.15s",
                }}
              >
                Vaciar
              </button>
            )}
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              style={{
                width: 36, height: 36, borderRadius: 999,
                border: `1px solid ${C.border}`,
                background: C.surfaceAlt, cursor: "pointer",
                color: C.ink,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = navy;
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = C.surfaceAlt;
                e.currentTarget.style.color = C.ink;
                e.currentTarget.style.transform = 'rotate(0)';
              }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

        {/* Alerta no disponibles */}
        {hayNoDisponibles && (
          <div style={{
            margin: "14px 20px 0",
            padding: "12px 16px",
            background: `${red}10`, border: `1px solid ${red}33`,
            borderRadius: 14, display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 10, flexShrink: 0,
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: red, fontSize: 13 }} />
              <p style={{ margin: 0, fontSize: 12, color: red, fontWeight: 600 }}>
                Hay productos sin stock
              </p>
            </div>
            <button
              onClick={quitarNoDisponibles}
              style={{
                fontSize: 11, color: red, background: "transparent",
                border: 'none', cursor: "pointer", fontWeight: 700,
                textDecoration: "underline", flexShrink: 0, padding: 0,
                fontFamily: 'inherit',
              }}
            >
              Quitar
            </button>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {items.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", gap: 16, padding: 32, textAlign: "center",
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: `${navy}10`, color: navy,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FontAwesomeIcon icon={faCartShopping} style={{ fontSize: 30 }} />
              </div>
              <div>
                <p style={{
                  margin: "0 0 6px", fontWeight: 500, color: C.ink, fontSize: 18,
                  fontFamily: FONT.display, fontStyle: 'italic',
                }}>
                  Tu carrito está vacío
                </p>
                <p style={{ margin: 0, fontSize: 13, color: inkMuted }}>
                  Agrega productos para comenzar
                </p>
              </div>
              <Link
                to="/tienda"
                onClick={() => setAbierto(false)}
                style={{
                  display: "inline-flex", alignItems: 'center', gap: 8,
                  marginTop: 4, padding: "12px 24px", borderRadius: 999,
                  background: navy, color: "#fff",
                  textDecoration: "none", fontSize: 13, fontWeight: 700,
                  boxShadow: `0 12px 24px -10px ${navy}66`,
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = navyDeep)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = navy)}
              >
                Explorar tienda <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
              </Link>
            </div>
          ) : (
            <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(item => {
                const noDisp = item.activo === false || item.stock === 0;
                const subtotal = item.precio * item.cantidad;
                const img = imgSrc(item);

                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex", gap: 12, padding: 12,
                      borderRadius: 16,
                      border: `1px solid ${noDisp ? `${red}33` : C.border}`,
                      background: noDisp ? `${red}08` : C.surface,
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Imagen */}
                    <div
                      onClick={() => irAProducto(item.slug)}
                      style={{
                        width: 72, height: 72, borderRadius: 12,
                        background: C.surfaceAlt,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, overflow: "hidden", cursor: "pointer",
                      }}
                    >
                      {img ? (
                        <img
                          src={img} alt={item.nombre}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <FontAwesomeIcon icon={faPaw} style={{ fontSize: 22, color: inkMuted, opacity: 0.5 }} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {noDisp && (
                        <span style={{
                          display: "inline-block", marginBottom: 4,
                          fontSize: 9, fontWeight: 800, color: red,
                          background: `${red}1F`, padding: "2px 8px",
                          borderRadius: 999, letterSpacing: "0.08em",
                          textTransform: 'uppercase',
                        }}>
                          {item.stock === 0 ? "Sin stock" : "No disponible"}
                        </span>
                      )}

                      <p
                        onClick={() => irAProducto(item.slug)}
                        style={{
                          margin: "0 0 6px", fontSize: 13, fontWeight: 600,
                          color: noDisp ? inkMuted : C.ink,
                          cursor: "pointer", lineHeight: 1.35,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!noDisp) e.target.style.color = navy; }}
                        onMouseLeave={(e) => { e.target.style.color = noDisp ? inkMuted : C.ink; }}
                      >
                        {item.nombre}
                      </p>

                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{
                          fontSize: 15, fontWeight: 700,
                          color: noDisp ? inkMuted : C.ink,
                          fontFamily: FONT.display,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {fmt(item.precio)}
                        </span>
                        {!noDisp && item.cantidad > 1 && (
                          <span style={{
                            fontSize: 11, color: inkMuted,
                            fontVariantNumeric: 'tabular-nums',
                          }}>
                            ={" "}{fmt(subtotal)}
                          </span>
                        )}
                      </div>

                      {/* Controles */}
                      <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginTop: 10,
                      }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 2,
                          background: noDisp ? "transparent" : C.surfaceAlt,
                          border: `1px solid ${noDisp ? "transparent" : C.border}`,
                          borderRadius: 999, padding: 2,
                          opacity: noDisp ? 0.4 : 1,
                          pointerEvents: noDisp ? "none" : "auto",
                        }}>
                          <button
                            onClick={() => cambiarCantidad(item.id, -1)}
                            aria-label="Disminuir"
                            style={{
                              width: 28, height: 28, borderRadius: 999, border: "none",
                              background: "transparent", cursor: "pointer",
                              color: C.ink, fontSize: 11,
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.surface)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span style={{
                            fontSize: 13, fontWeight: 700, color: C.ink,
                            minWidth: 22, textAlign: "center",
                            fontVariantNumeric: 'tabular-nums',
                          }}>
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => cambiarCantidad(item.id, +1)}
                            disabled={item.cantidad >= item.stock}
                            aria-label="Aumentar"
                            style={{
                              width: 28, height: 28, borderRadius: 999, border: "none",
                              background: "transparent",
                              cursor: item.cantidad >= item.stock ? "not-allowed" : "pointer",
                              color: C.ink, fontSize: 11,
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              opacity: item.cantidad >= item.stock ? 0.3 : 1,
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (item.cantidad < item.stock) e.currentTarget.style.backgroundColor = C.surface;
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>

                        {!noDisp && item.stock <= 5 && (
                          <span style={{
                            fontSize: 10, color: red, fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}>
                            ¡Solo {item.stock}!
                          </span>
                        )}

                        <button
                          onClick={() => quitar(item.id)}
                          aria-label="Quitar"
                          style={{
                            width: 32, height: 32, borderRadius: 999,
                            border: `1px solid ${C.border}`,
                            background: C.surface, cursor: "pointer",
                            color: inkMuted, fontSize: 12,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = red;
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = red;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = C.surface;
                            e.currentTarget.style.color = inkMuted;
                            e.currentTarget.style.borderColor = C.border;
                          }}
                          title="Quitar producto"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
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
          <div style={{
            padding: "20px 24px 24px",
            borderTop: `1px solid ${C.border}`,
            background: C.surface,
            flexShrink: 0,
          }}>
            {/* Resumen */}
            <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 12, color: inkSoft,
              }}>
                <span>Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(totalPrecio)}</span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 12, color: inkSoft,
              }}>
                <span>IVA (19%)</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(totalPrecio * 0.19)}</span>
              </div>
              <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: 'baseline',
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Total</span>
                <span style={{
                  fontSize: 22, fontWeight: 500, color: C.ink,
                  fontFamily: FONT.display,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {fmt(totalPrecio * 1.19)}
                </span>
              </div>
            </div>

            {/* Envío gratis */}
            {totalPrecio >= 80000 ? (
              <div style={{
                marginBottom: 14, padding: "10px 14px", borderRadius: 12,
                background: `${lime}15`, border: `1px solid ${lime}55`,
                fontSize: 12, color: limeDeep, fontWeight: 700, textAlign: "center",
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, width: '100%',
              }}>
                <FontAwesomeIcon icon={faGift} />
                ¡Envío gratis aplicado!
              </div>
            ) : (
              <div style={{
                marginBottom: 14, padding: "10px 14px", borderRadius: 12,
                background: C.surfaceAlt,
                fontSize: 12, color: inkSoft, textAlign: "center",
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, width: '100%',
              }}>
                <FontAwesomeIcon icon={faTruckFast} style={{ color: navy }} />
                Te faltan{' '}
                <strong style={{ color: navy, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(80000 - totalPrecio)}
                </strong>
                {' '}para envío gratis
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={handleCheckout}
              disabled={hayNoDisponibles || totalItems === 0}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 999, border: "none",
                background: hayNoDisponibles || totalItems === 0 ? C.surfaceAlt : navy,
                color: hayNoDisponibles || totalItems === 0 ? inkMuted : "#fff",
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                cursor: hayNoDisponibles || totalItems === 0 ? "not-allowed" : "pointer",
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: "all 0.2s",
                boxShadow: hayNoDisponibles || totalItems === 0 ? 'none' : `0 12px 24px -10px ${navy}66`,
              }}
              onMouseEnter={(e) => {
                if (!(hayNoDisponibles || totalItems === 0)) e.currentTarget.style.backgroundColor = navyDeep;
              }}
              onMouseLeave={(e) => {
                if (!(hayNoDisponibles || totalItems === 0)) e.currentTarget.style.backgroundColor = navy;
              }}
            >
              {hayNoDisponibles ? (
                <><FontAwesomeIcon icon={faTriangleExclamation} /> Retira productos no disponibles</>
              ) : (
                <>Ir al checkout <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} /></>
              )}
            </button>

            <button
              onClick={() => setAbierto(false)}
              style={{
                width: "100%", padding: "10px 0", marginTop: 8,
                background: "transparent", border: "none",
                fontSize: 12, color: inkMuted, cursor: "pointer",
                fontFamily: 'inherit',
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.ink)}
              onMouseLeave={(e) => (e.currentTarget.style.color = inkMuted)}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
