// src/components/ProductCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth }    from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);

const descPct = (precio, antes) =>
  antes && Number(antes) > Number(precio)
    ? Math.round(((Number(antes) - Number(precio)) / Number(antes)) * 100)
    : null;

export default function ProductCard({ producto }) {
  const { C }         = useTheme();
  const { agregar }   = useCarrito();
  const { usuario }   = useAuth();
  const navigate      = useNavigate();
  const [agregado,  setAgregado]  = useState(false);
  const [hovered,   setHovered]   = useState(false);

  const dc       = descPct(producto.precio, producto.precio_antes);
  const hayStock = producto.stock > 0;
  const stockBajo = producto.stock > 0 && producto.stock <= 5;

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!usuario) { navigate("/login"); return; }
    if (!hayStock) return;
    agregar({
      id:          producto.id,
      producto_id: producto.id,
      variante_id: null,
      nombre:      producto.nombre,
      slug:        producto.slug,
      precio:      Number(producto.precio),
      imagen_url:  producto.imagen_url,
      stock:       producto.stock,
      activo:      1,
    }, 1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <Link
      to={`/producto/${producto.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: C.surface,
        border: `1px solid ${hovered ? C.brandBorder : C.line}`,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? C.shadowMd : C.shadowSm,
        cursor: 'pointer',
      }}
    >
      {/* Imagen */}
      <div style={{
        position: 'relative',
        height: 180,
        overflow: 'hidden',
        background: `repeating-linear-gradient(135deg, ${C.brandSoft} 0 14px, ${C.surfaceAlt} 14px 28px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span style={{
            fontFamily: FONT.mono, fontSize: 10, textTransform: 'uppercase',
            letterSpacing: 0.5, padding: '4px 12px',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: RADIUS.pill,
            border: `1px dashed ${C.brandBorder}`,
            color: C.ink3,
          }}>foto · producto</span>
        )}

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {dc && (
            <span style={{
              background: C.coral, color: '#fff',
              fontSize: 10, fontWeight: 800,
              padding: '2px 7px', borderRadius: RADIUS.sm,
              letterSpacing: 0.2,
            }}>
              -{dc}%
            </span>
          )}
          {producto.destacado && (
            <span style={{
              background: C.amber, color: '#fff',
              fontSize: 10, fontWeight: 800,
              padding: '2px 7px', borderRadius: RADIUS.sm,
            }}>
              ★ Más vendido
            </span>
          )}
          {stockBajo && (
            <span style={{
              background: C.dangerBg, color: C.danger,
              border: `1px solid ${C.danger}33`,
              fontSize: 9, fontWeight: 700,
              padding: '2px 7px', borderRadius: RADIUS.sm,
            }}>
              Solo {producto.stock}
            </span>
          )}
        </div>

        {/* Sin stock overlay */}
        {!hayStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: C.ink3,
              background: C.surface, padding: '5px 12px',
              borderRadius: RADIUS.pill, border: `1px solid ${C.line}`,
            }}>
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Marca */}
        {producto.marca && (
          <span style={{
            fontFamily: FONT.mono, fontSize: 9, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 1.2,
            color: C.muted,
          }}>
            {producto.marca}
          </span>
        )}

        {/* Nombre */}
        <h3 style={{
          margin: 0,
          fontSize: 13, fontWeight: 600,
          color: C.ink,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
          transition: 'color 0.15s',
          ...(hovered ? { color: C.brand } : {}),
        }}>
          {producto.nombre}
        </h3>

        {/* Categoría */}
        {producto.categoria && (
          <span style={{ fontSize: 10, color: C.brand, fontWeight: 600, letterSpacing: 0.3 }}>
            {producto.categoria}
          </span>
        )}

        {/* Precio + botón */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
          <div>
            <div style={{
              fontFamily: FONT.display,
              fontSize: 18, fontWeight: 700,
              color: C.ink, lineHeight: 1,
            }}>
              {fmt(producto.precio)}
            </div>
            {producto.precio_antes && Number(producto.precio_antes) > 0 && (
              <span style={{
                fontSize: 11, color: C.muted,
                textDecoration: 'line-through',
                fontFamily: FONT.mono,
              }}>
                {fmt(producto.precio_antes)}
              </span>
            )}
          </div>

          <button
            onClick={handleAgregar}
            disabled={!hayStock}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: 'none',
              background: agregado ? C.success + '22' : hayStock ? C.ink : C.surfaceAlt,
              color: agregado ? C.success : hayStock ? '#fff' : C.muted,
              fontSize: 16, fontWeight: 700,
              cursor: hayStock ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
              transform: agregado ? 'scale(0.9)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (hayStock && !agregado) { e.currentTarget.style.background = C.brand; e.currentTarget.style.transform = 'scale(1.1)'; } }}
            onMouseLeave={e => { if (!agregado) { e.currentTarget.style.background = hayStock ? C.ink : C.surfaceAlt; e.currentTarget.style.transform = 'scale(1)'; } }}
          >
            {agregado ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}
