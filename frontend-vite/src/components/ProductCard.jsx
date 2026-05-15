// src/components/ProductCard.jsx — Premium card con tilt 3D
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faHeart, faPaw, faCheck, faStar, faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT } from "../styles/admin.tokens";

const STATIC = "http://localhost:3000";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);

const descPct = (precio, antes) =>
  antes && Number(antes) > Number(precio)
    ? Math.round(((Number(antes) - Number(precio)) / Number(antes)) * 100)
    : null;

const imgSrc = (p) => {
  const url = p.imagen_url || p.imagen;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STATIC}${url}`;
};

export default function ProductCard({ producto }) {
  const { C }       = useTheme();
  const { agregar } = useCarrito();
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const [hovered,  setHovered]  = useState(false);
  const [agregado, setAgregado] = useState(false);
  const tiltRef = useRef(null);

  const dc        = descPct(producto.precio, producto.precio_antes);
  const stock     = Number(producto.stock) || 0;
  const hayStock  = stock > 0;
  const stockBajo = stock > 0 && stock <= 5;
  const img       = imgSrc(producto);

  // Tokens (con fallbacks por si no existen en el tema)
  const navy     = C.navy     || '#1E3A8A';
  const navyDeep = C.navyDeep || '#0F2563';
  const lime     = C.lime     || '#7BC142';
  const limeDeep = C.limeDeep || '#5DA328';
  const red      = C.red      || '#E63946';
  const purple   = C.purple   || '#9B5DE5';
  const inkSoft  = C.inkSoft  || C.ink2;
  const inkMuted = C.inkMuted || C.ink3;

  const handleAgregar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!usuario) { navigate("/login"); return; }
    if (!hayStock) return;
    agregar({
      id:          producto.id,
      producto_id: producto.id,
      variante_id: null,
      nombre:      producto.nombre,
      slug:        producto.slug,
      precio:      Number(producto.precio),
      imagen_url:  producto.imagen_url || producto.imagen || null,
      stock,
      activo:      1,
    }, 1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  // Tilt 3D al mover el mouse sobre el card
  const handleMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
  };
  const handleLeave = () => {
    setHovered(false);
    const el = tiltRef.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
  };

  return (
    <div style={{ perspective: "900px", height: "100%" }}>
      <Link
        to={`/producto/${producto.slug}`}
        ref={tiltRef}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          position: "relative",
          display: "flex", flexDirection: "column",
          backgroundColor: C.surface,
          border: `1px solid ${hovered ? `${navy}55` : C.border}`,
          borderRadius: 24, padding: 16,
          height: "100%", textDecoration: "none", color: "inherit",
          boxShadow: hovered
            ? "0 22px 44px -22px rgba(10,20,38,0.22)"
            : "0 1px 0 rgba(10,20,38,0.02)",
          transition: "border-color 350ms ease, box-shadow 350ms ease, transform 240ms cubic-bezier(0.16,1,0.3,1)",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Badges top-left */}
        <div style={{
          position: "absolute", top: 24, left: 24, zIndex: 3,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {dc != null && (
            <span style={{
              backgroundColor: red, color: "#fff",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
              padding: "4px 10px", borderRadius: 999,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <FontAwesomeIcon icon={faBolt} style={{ fontSize: 9 }} />
              -{dc}%
            </span>
          )}
          {producto.destacado ? (
            <span style={{
              backgroundColor: lime, color: "#fff",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
              padding: "4px 10px", borderRadius: 999,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <FontAwesomeIcon icon={faStar} style={{ fontSize: 9 }} />
              DESTACADO
            </span>
          ) : null}
          {producto.uso_clinico ? (
            <span style={{
              backgroundColor: purple, color: "#fff",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
              padding: "4px 10px", borderRadius: 999,
            }}>
              USO CLÍNICO
            </span>
          ) : null}
        </div>

        {/* Wishlist (decorativo) */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          aria-label="Añadir a deseos"
          style={{
            position: "absolute", top: 24, right: 24, zIndex: 3,
            width: 34, height: 34, borderRadius: 999,
            backgroundColor: C.surfaceAlt, color: C.ink,
            border: "none", cursor: "pointer", fontFamily: 'inherit',
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = red;
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = C.surfaceAlt;
            e.currentTarget.style.color = C.ink;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <FontAwesomeIcon icon={faHeart} style={{ fontSize: 13 }} />
        </button>

        {/* Imagen / placeholder */}
        <div style={{
          aspectRatio: "1 / 1",
          backgroundColor: C.surfaceAlt,
          borderRadius: 18, overflow: "hidden",
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {hovered && img && (
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(circle at 50% 60%, ${lime}22 0%, transparent 60%)`,
              pointerEvents: "none",
            }}/>
          )}
          {img ? (
            <img
              src={img}
              alt={producto.nombre}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)",
                transform: hovered ? "scale(1.06)" : "scale(1)",
              }}
            />
          ) : (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              color: inkMuted, gap: 8,
            }}>
              <FontAwesomeIcon icon={faPaw} style={{ fontSize: 40, opacity: 0.35 }} />
              <span style={{
                fontSize: 10, letterSpacing: "0.16em",
                textTransform: "uppercase", fontWeight: 700,
              }}>
                Sin imagen
              </span>
            </div>
          )}

          {img && (
            <div aria-hidden="true" style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: 10,
              background: "linear-gradient(180deg, transparent 0%, rgba(10,20,38,0.7) 100%)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 280ms ease",
              fontSize: 11, fontWeight: 700, color: "#fff",
              letterSpacing: "0.12em", textTransform: "uppercase",
              textAlign: "center",
            }}>
              Ver detalles
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", flex: 1 }}>
          {(producto.categoria_nombre || producto.categoria) && (
            <div style={{
              fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
              color: inkMuted, fontWeight: 700,
            }}>
              {producto.categoria_nombre || producto.categoria}
            </div>
          )}
          <div style={{
            fontSize: 15, fontWeight: 600, color: C.ink,
            lineHeight: 1.25, marginTop: 4, minHeight: 38,
            display: "-webkit-box", WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2, overflow: "hidden",
          }}>
            {producto.nombre}
          </div>
          {(producto.marca || producto.unidad) && (
            <div style={{ fontSize: 12, color: inkSoft, marginTop: 4 }}>
              {[producto.marca, producto.unidad].filter(Boolean).join(" · ")}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
            <span style={{
              fontFamily: FONT.display,
              fontSize: 22, fontWeight: 500, color: C.ink,
              fontVariantNumeric: "tabular-nums",
            }}>
              {fmt(producto.precio)}
            </span>
            {producto.precio_antes && Number(producto.precio_antes) > Number(producto.precio) && (
              <span style={{
                fontSize: 13, textDecoration: "line-through",
                color: inkMuted, fontVariantNumeric: "tabular-nums",
              }}>
                {fmt(producto.precio_antes)}
              </span>
            )}
          </div>

          <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600 }}>
            {!hayStock ? (
              <span style={{ color: inkMuted }}>● Agotado</span>
            ) : stockBajo ? (
              <span style={{ color: red }}>● ¡Solo {stock} disponibles!</span>
            ) : (
              <span style={{ color: limeDeep }}>● En stock</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAgregar}
            disabled={!hayStock}
            style={{
              marginTop: 12, width: "100%",
              padding: "10px 16px", borderRadius: 999,
              fontSize: 13, fontWeight: 600,
              border: "none",
              cursor: !hayStock ? "not-allowed" : "pointer",
              backgroundColor: !hayStock
                ? C.surfaceAlt
                : (agregado ? lime : navy),
              color: !hayStock ? inkMuted : "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 6, fontFamily: "inherit",
              transition: "background-color 200ms ease",
              boxShadow: hayStock ? `0 10px 20px -10px ${agregado ? lime : navy}77` : "none",
            }}
            onMouseEnter={(e) => {
              if (!hayStock || agregado) return;
              e.currentTarget.style.backgroundColor = navyDeep;
            }}
            onMouseLeave={(e) => {
              if (!hayStock || agregado) return;
              e.currentTarget.style.backgroundColor = navy;
            }}
          >
            {!hayStock ? "Sin stock" : agregado ? (
              <>Agregado <FontAwesomeIcon icon={faCheck} style={{ fontSize: 11 }} /></>
            ) : (
              <>Agregar al carrito <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} /></>
            )}
          </button>
        </div>
      </Link>
    </div>
  );
}
