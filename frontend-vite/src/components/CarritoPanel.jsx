// src/components/CarritoPanel.jsx
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

const C = {
  brand:      "#1a5c1a",
  brandMid:   "#2d7a2d",
  brandDark:  "#0c180c",
  brandLight: "#e6f3e6",
  brandBorder:"#b8d9b8",
  lime:       "#a3e635",
  canvas:     "#f6f7f4",
  surface:    "#ffffff",
  surfaceAlt: "#f2f3ef",
  text:       "#111827",
  textSec:    "#374151",
  textTer:    "#6b7280",
  textMuted:  "#9ca3af",
  border:     "rgba(0,0,0,0.08)",
  danger:     "#dc2626",
  dangerBg:   "#fef2f2",
  dangerBorder:"#fecaca",
};

const fmt = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;

export default function CarritoPanel() {
  const {
    items, abierto, setAbierto,
    quitar, cambiarCantidad, vaciar, quitarNoDisponibles,
    totalItems, totalPrecio, hayNoDisponibles, validando,
  } = useCarrito();
  const navigate = useNavigate();

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
      {/* Overlay */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position:"fixed", inset:0, zIndex:998,
            background:"rgba(12,24,12,0.5)",
            backdropFilter:"blur(3px)",
            transition:"opacity 0.3s",
          }}
        />
      )}

      {/* Panel */}
      <aside style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:"100%", maxWidth:400, zIndex:999,
        display:"flex", flexDirection:"column",
        background:C.surface,
        boxShadow:"-8px 0 40px rgba(12,24,12,0.18)",
        transform: abierto ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* ── Header ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 20px",
          borderBottom:`1px solid ${C.border}`,
          background:C.surface,
          flexShrink:0,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:C.brandLight,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18,
            }}>🛒</div>
            <div>
              <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:C.text }}>Tu carrito</h2>
              {validando ? (
                <span style={{ fontSize:11, color:C.textMuted }}>Verificando stock...</span>
              ) : (
                <span style={{ fontSize:11, color:C.textMuted }}>
                  {totalItems > 0 ? `${totalItems} producto${totalItems!==1?"s":""} disponible${totalItems!==1?"s":""}` : "Vacío"}
                </span>
              )}
            </div>
            {totalItems > 0 && (
              <div style={{
                background:C.brand, color:"#fff",
                fontSize:11, fontWeight:800,
                width:20, height:20, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {totalItems}
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:6 }}>
            {items.length > 0 && (
              <button
                onClick={vaciar}
                style={{
                  fontSize:12, color:C.danger, background:C.dangerBg,
                  border:`1px solid ${C.dangerBorder}`,
                  borderRadius:8, padding:"5px 10px",
                  cursor:"pointer", fontWeight:600, transition:"all 0.15s",
                }}
              >
                Vaciar
              </button>
            )}
            <button
              onClick={() => setAbierto(false)}
              style={{
                width:32, height:32, borderRadius:9,
                border:`1px solid ${C.border}`,
                background:C.surfaceAlt, cursor:"pointer",
                fontSize:18, color:C.textTer, display:"flex",
                alignItems:"center", justifyContent:"center",
                transition:"all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.brandLight; e.currentTarget.style.color = C.brand; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.surfaceAlt; e.currentTarget.style.color = C.textTer; }}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Alerta no disponibles ── */}
        {hayNoDisponibles && (
          <div style={{
            margin:"12px 16px 0",
            padding:"10px 14px",
            background:C.dangerBg, border:`1px solid ${C.dangerBorder}`,
            borderRadius:10, display:"flex", alignItems:"center",
            justifyContent:"space-between", gap:8, flexShrink:0,
          }}>
            <p style={{ margin:0, fontSize:12, color:C.danger, fontWeight:500 }}>
              ⚠️ Hay productos sin stock o no disponibles
            </p>
            <button
              onClick={quitarNoDisponibles}
              style={{
                fontSize:12, color:C.danger, background:"none",
                border:"none", cursor:"pointer", fontWeight:700,
                textDecoration:"underline", flexShrink:0, padding:0,
              }}
            >
              Quitar
            </button>
          </div>
        )}

        {/* ── Items ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {items.length === 0 ? (
            <div style={{
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              height:"100%", gap:12, padding:32, textAlign:"center",
            }}>
              <div style={{
                width:80, height:80, borderRadius:20,
                background:C.brandLight,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:40,
              }}>
                🛒
              </div>
              <div>
                <p style={{ margin:"0 0 4px", fontWeight:700, color:C.text, fontSize:15 }}>
                  Tu carrito está vacío
                </p>
                <p style={{ margin:0, fontSize:13, color:C.textMuted }}>
                  Agrega productos para comenzar
                </p>
              </div>
              <button
                onClick={() => setAbierto(false)}
                style={{
                  marginTop:4, padding:"10px 24px", borderRadius:12,
                  background:C.brand, color:"#fff",
                  border:"none", fontSize:13, fontWeight:700, cursor:"pointer",
                }}
              >
                Explorar tienda
              </button>
            </div>
          ) : (
            <div style={{ padding:"8px 16px", display:"flex", flexDirection:"column", gap:8 }}>
              {items.map(item => {
                const noDisp  = item.activo === false || item.stock === 0;
                const subtotal = item.precio * item.cantidad;

                return (
                  <div
                    key={item.id}
                    style={{
                      display:"flex", gap:12, padding:"12px 14px",
                      borderRadius:14,
                      border:`1px solid ${noDisp ? C.dangerBorder : C.border}`,
                      background: noDisp ? C.dangerBg : C.surfaceAlt,
                      transition:"all 0.2s",
                    }}
                  >
                    {/* Imagen */}
                    <div
                      onClick={() => irAProducto(item.slug)}
                      style={{
                        width:60, height:60, borderRadius:10,
                        background: noDisp ? "#fef2f2" : C.brandLight,
                        border:`1px solid ${noDisp ? C.dangerBorder : C.brandBorder}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        flexShrink:0, overflow:"hidden", cursor:"pointer",
                      }}
                    >
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url} alt={item.nombre}
                          style={{ width:"100%", height:"100%", objectFit:"contain", padding:4 }}
                          onError={e => { e.target.style.display="none"; }}
                        />
                      ) : (
                        <span style={{ fontSize:22 }}>🐾</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      {/* Badges estado */}
                      {noDisp && (
                        <span style={{
                          display:"inline-block", marginBottom:4,
                          fontSize:10, fontWeight:700, color:C.danger,
                          background:"#fecaca", padding:"2px 7px",
                          borderRadius:6, letterSpacing:0.3,
                        }}>
                          {item.stock === 0 ? "SIN STOCK" : "NO DISPONIBLE"}
                        </span>
                      )}

                      <p
                        onClick={() => irAProducto(item.slug)}
                        style={{
                          margin:"0 0 4px", fontSize:12, fontWeight:600,
                          color: noDisp ? C.textMuted : C.text,
                          cursor:"pointer", lineHeight:1.35,
                          display:"-webkit-box", WebkitLineClamp:2,
                          WebkitBoxOrient:"vertical", overflow:"hidden",
                          transition:"color 0.15s",
                        }}
                        onMouseEnter={e => { if (!noDisp) e.target.style.color = C.brand; }}
                        onMouseLeave={e => { e.target.style.color = noDisp ? C.textMuted : C.text; }}
                      >
                        {item.nombre}
                      </p>

                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        {/* Precio */}
                        <span style={{
                          fontSize:14, fontWeight:800,
                          color: noDisp ? C.textMuted : C.brand,
                          fontFamily:"'JetBrains Mono',monospace",
                        }}>
                          {fmt(item.precio)}
                        </span>

                        {/* Subtotal */}
                        {!noDisp && item.cantidad > 1 && (
                          <span style={{ fontSize:11, color:C.textMuted }}>
                            = {fmt(subtotal)}
                          </span>
                        )}
                      </div>

                      {/* Controles de cantidad */}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                        <div style={{
                          display:"flex", alignItems:"center", gap:4,
                          background: noDisp ? "transparent" : C.surface,
                          border:`1px solid ${noDisp ? "transparent" : C.border}`,
                          borderRadius:9, padding:"2px",
                          opacity: noDisp ? 0.4 : 1,
                          pointerEvents: noDisp ? "none" : "auto",
                        }}>
                          <button
                            onClick={() => cambiarCantidad(item.id, -1)}
                            style={{
                              width:26, height:26, borderRadius:7, border:"none",
                              background:"transparent", cursor:"pointer",
                              color:C.brand, fontSize:16, fontWeight:700,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              transition:"all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.brandLight; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            −
                          </button>
                          <span style={{
                            fontSize:13, fontWeight:700, color:C.text,
                            minWidth:20, textAlign:"center",
                            fontFamily:"monospace",
                          }}>
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => cambiarCantidad(item.id, +1)}
                            disabled={item.cantidad >= item.stock}
                            style={{
                              width:26, height:26, borderRadius:7, border:"none",
                              background:"transparent", cursor:"pointer",
                              color:C.brand, fontSize:16, fontWeight:700,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              opacity: item.cantidad >= item.stock ? 0.3 : 1,
                              transition:"all 0.15s",
                            }}
                            onMouseEnter={e => { if (item.cantidad < item.stock) e.currentTarget.style.background = C.brandLight; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            +
                          </button>
                        </div>

                        {/* Stock restante */}
                        {!noDisp && item.stock <= 5 && (
                          <span style={{ fontSize:10, color:"#d97706", fontWeight:600 }}>
                            {item.stock} en stock
                          </span>
                        )}

                        {/* Eliminar */}
                        <button
                          onClick={() => quitar(item.id)}
                          style={{
                            width:28, height:28, borderRadius:8, border:`1px solid ${C.border}`,
                            background:C.surface, cursor:"pointer",
                            color:C.textMuted, fontSize:14,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.dangerBg; e.currentTarget.style.color = C.danger; e.currentTarget.style.borderColor = C.dangerBorder; }}
                          onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}
                          title="Quitar producto"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer con totales ── */}
        {items.length > 0 && (
          <div style={{
            padding:"16px 20px 20px",
            borderTop:`1px solid ${C.border}`,
            background:C.surface,
            flexShrink:0,
          }}>
            {/* Resumen */}
            <div style={{ marginBottom:14, display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.textTer }}>
                <span>Subtotal ({totalItems} {totalItems===1?"producto":"productos"})</span>
                <span style={{fontFamily:"monospace"}}>{fmt(totalPrecio)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.textTer }}>
                <span>IVA (19%)</span>
                <span style={{fontFamily:"monospace"}}>{fmt(totalPrecio * 0.19)}</span>
              </div>
              <div style={{ height:1, background:C.border, margin:"2px 0" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, color:C.text }}>
                <span>Total</span>
                <span style={{ color:C.brand, fontFamily:"monospace" }}>
                  {fmt(totalPrecio * 1.19)}
                </span>
              </div>
            </div>

            {/* Envío gratis */}
            {totalPrecio >= 80000 ? (
              <div style={{
                marginBottom:12, padding:"8px 12px", borderRadius:9,
                background:C.brandLight, border:`1px solid ${C.brandBorder}`,
                fontSize:12, color:C.brand, fontWeight:600, textAlign:"center",
              }}>
                🎉 ¡Envío gratis aplicado!
              </div>
            ) : (
              <div style={{
                marginBottom:12, padding:"8px 12px", borderRadius:9,
                background:C.surfaceAlt,
                fontSize:12, color:C.textTer, textAlign:"center",
              }}>
                Te faltan <strong style={{color:C.brand}}>{fmt(80000 - totalPrecio)}</strong> para envío gratis
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={handleCheckout}
              disabled={hayNoDisponibles || totalItems === 0}
              style={{
                width:"100%", padding:"13px 0", borderRadius:12, border:"none",
                background: hayNoDisponibles || totalItems===0 ? C.surfaceAlt : C.brand,
                color: hayNoDisponibles || totalItems===0 ? C.textMuted : "#fff",
                fontSize:14, fontWeight:800,
                cursor: hayNoDisponibles || totalItems===0 ? "default" : "pointer",
                transition:"all 0.2s", letterSpacing:0.2,
              }}
              onMouseEnter={e => { if (!(hayNoDisponibles || totalItems===0)) e.currentTarget.style.background = C.brandMid; }}
              onMouseLeave={e => { if (!(hayNoDisponibles || totalItems===0)) e.currentTarget.style.background = C.brand; }}
            >
              {hayNoDisponibles
                ? "⚠ Retira productos no disponibles"
                : "Ir al carrito →"}
            </button>

            <button
              onClick={() => setAbierto(false)}
              style={{
                width:"100%", padding:"9px 0", marginTop:8,
                background:"none", border:"none",
                fontSize:12, color:C.textMuted, cursor:"pointer",
                transition:"color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; }}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}