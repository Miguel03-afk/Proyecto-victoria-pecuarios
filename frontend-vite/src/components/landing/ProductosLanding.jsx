// src/components/landing/ProductosLanding.jsx
// Productos destacados — sin filtros (siempre destacados).
// Card local matching el diseño victoria-pets/productos.jsx con datos reales
// y agregar al carrito vía CarritoContext.
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faPlus, faHeart, faPaw, faCartShopping, faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import {
  Reveal, TypeReveal, SectionEyebrow, useLandingPalette, money,
} from "./landing.utils.jsx";

const STATIC = "http://localhost:3000";

function discountPct(p) {
  const antes = Number(p.precio_antes);
  const precio = Number(p.precio);
  if (!antes || antes <= precio) return null;
  return Math.round((1 - precio / antes) * 100);
}

function imgSrc(p) {
  const url = p.imagen_url || p.imagen;
  if (!url) return null;
  return url.startsWith('http') ? url : `${STATIC}${url}`;
}

function ProductCardLanding({ Cur, p, onAgregar }) {
  const [hovered, setHovered]  = useState(false);
  const [agregado, setAgregado] = useState(false);
  const dc = discountPct(p);
  const stock = Number(p.stock) || 0;
  const out = stock === 0;
  const stockBajo = stock > 0 && stock <= 5;
  const img = imgSrc(p);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (out) return;
    onAgregar(p);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <Link
      to={`/producto/${p.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="vp-product-card"
      style={{
        position: 'relative',
        backgroundColor: Cur.surface,
        border: `1px solid ${Cur.border}`,
        borderRadius: 24, padding: 16,
        height: "100%", display: "flex", flexDirection: "column",
        textDecoration: 'none', color: 'inherit',
        boxShadow: hovered
          ? "0 16px 32px -16px rgba(10,20,38,0.14)"
          : "0 1px 0 rgba(10,20,38,0.02)",
      }}
    >
      {/* Badges top-left */}
      <div style={{
        position: 'absolute', top: 24, left: 24, zIndex: 2,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {dc != null && (
          <span style={{
            backgroundColor: Cur.red, color: "#fff",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
            padding: "4px 10px", borderRadius: 999,
          }}>
            -{dc}%
          </span>
        )}
        {p.destacado ? (
          <span style={{
            backgroundColor: Cur.lime, color: "#fff",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
            padding: "4px 10px", borderRadius: 999,
          }}>
            DESTACADO
          </span>
        ) : null}
        {p.uso_clinico ? (
          <span style={{
            backgroundColor: Cur.purple, color: "#fff",
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
        onClick={(e) => { e.preventDefault(); }}
        className="vp-icon-heart"
        aria-label="Añadir a deseos"
        style={{
          position: 'absolute', top: 24, right: 24, zIndex: 2,
          width: 32, height: 32, borderRadius: 999,
          backgroundColor: Cur.surfaceAlt, color: Cur.ink,
          border: 'none', cursor: 'pointer',
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = Cur.red;
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = Cur.surfaceAlt;
          e.currentTarget.style.color = Cur.ink;
        }}
      >
        <FontAwesomeIcon icon={faHeart} style={{ fontSize: 13 }} />
      </button>

      {/* Imagen / placeholder */}
      <div style={{
        aspectRatio: '1 / 1',
        backgroundColor: Cur.surfaceAlt, borderRadius: 18,
        overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {img ? (
          <img
            src={img}
            alt={p.nombre}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: Cur.inkMuted, gap: 8,
          }}>
            <FontAwesomeIcon icon={faPaw} style={{ fontSize: 36, opacity: 0.4 }} />
            <span style={{
              fontSize: 10, letterSpacing: '0.16em',
              textTransform: 'uppercase', fontWeight: 700,
            }}>
              Sin imagen
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {(p.categoria_nombre || p.categoria) && (
          <div style={{
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: Cur.inkMuted, fontWeight: 700,
          }}>
            {p.categoria_nombre || p.categoria}
          </div>
        )}
        <div style={{
          fontSize: 15, fontWeight: 600, color: Cur.ink,
          lineHeight: 1.25, marginTop: 4, minHeight: 38,
          display: '-webkit-box', WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2, overflow: 'hidden',
        }}>
          {p.nombre}
        </div>
        {(p.marca || p.unidad) && (
          <div style={{ fontSize: 12, color: Cur.inkSoft, marginTop: 4 }}>
            {[p.marca, p.unidad].filter(Boolean).join(' · ')}
          </div>
        )}

        {/* Precio */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
          <span className="vp-font-display vp-tabular" style={{
            fontSize: 22, fontWeight: 500, color: Cur.ink,
          }}>
            {money(p.precio)}
          </span>
          {p.precio_antes && Number(p.precio_antes) > Number(p.precio) && (
            <span className="vp-tabular" style={{
              fontSize: 13, textDecoration: "line-through", color: Cur.inkMuted,
            }}>
              {money(p.precio_antes)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600 }}>
          {out ? (
            <span style={{ color: Cur.inkMuted }}>● Agotado</span>
          ) : stockBajo ? (
            <span style={{ color: Cur.red }}>● ¡Solo {stock} disponibles!</span>
          ) : (
            <span style={{ color: Cur.limeDeep }}>● En stock</span>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleAgregar}
          disabled={out}
          className="vp-cta-primary"
          style={{
            marginTop: 12, width: "100%",
            padding: "10px 16px", borderRadius: 999,
            fontSize: 13, fontWeight: 600,
            border: "none", cursor: out ? "not-allowed" : "pointer",
            backgroundColor: out
              ? Cur.surfaceAlt
              : (agregado ? Cur.lime : Cur.navy),
            color: out ? Cur.inkMuted : "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontFamily: 'inherit',
            transition: "background-color 200ms ease",
          }}
          onMouseEnter={(e) => {
            if (out || agregado) return;
            e.currentTarget.style.backgroundColor = Cur.navyDeep;
          }}
          onMouseLeave={(e) => {
            if (out || agregado) return;
            e.currentTarget.style.backgroundColor = Cur.navy;
          }}
        >
          {out
            ? "Sin stock"
            : agregado
              ? <>Agregado <FontAwesomeIcon icon={faCartShopping} style={{ fontSize: 11 }} /></>
              : <>Agregar al carrito <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} /></>}
        </button>
      </div>
    </Link>
  );
}

export default function ProductosLanding() {
  const { Cur } = useLandingPalette();
  const navigate = useNavigate();
  const { agregar } = useCarrito();
  const { usuario } = useAuth();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]  = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/productos/destacados/lista')
      .then(r => {
        if (!mounted) return;
        setProductos(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => mounted && setProductos([]))
      .finally(() => mounted && setCargando(false));
    return () => { mounted = false; };
  }, []);

  const handleAgregar = (p) => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    agregar({
      id:          p.id,
      producto_id: p.id,
      variante_id: null,
      nombre:      p.nombre,
      slug:        p.slug,
      precio:      Number(p.precio),
      imagen_url:  p.imagen_url || p.imagen || null,
      stock:       Number(p.stock) || 0,
      activo:      1,
    }, 1);
  };

  return (
    <section id="tienda" style={{ backgroundColor: Cur.bg, scrollMarginTop: 80 }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '96px 24px',
      }}>
        <Reveal>
          <div style={{ marginBottom: 48 }}>
            <SectionEyebrow>Más vendidos del mes</SectionEyebrow>
            <TypeReveal
              as="h2"
              className="vp-font-display"
              style={{
                marginTop: 14, marginBottom: 0,
                fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05,
                fontWeight: 500, color: Cur.ink,
              }}
              text="Productos destacados."
            />
          </div>
        </Reveal>

        {cargando ? (
          <div className="vp-prod-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
          }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: 420, borderRadius: 24,
                background: Cur.surfaceAlt,
                border: `1px solid ${Cur.border}`,
              }}/>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            backgroundColor: Cur.surface, borderRadius: 24,
            border: `1px solid ${Cur.border}`, color: Cur.inkSoft,
          }}>
            No hay productos destacados disponibles por ahora.
          </div>
        ) : (
          <div className="vp-prod-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
          }}>
            {productos.slice(0, 8).map((p) => (
              <ProductCardLanding
                key={p.id}
                Cur={Cur}
                p={p}
                onAgregar={handleAgregar}
              />
            ))}
          </div>
        )}

        {/* CTA card "Explora toda nuestra tienda" */}
        <Reveal delay={120}>
          <button
            type="button"
            onClick={() => navigate('/tienda')}
            className="vp-cta-primary"
            style={{
              marginTop: 64, width: '100%',
              padding: '32px 40px', borderRadius: 28,
              backgroundColor: Cur.navy, color: '#fff',
              border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: 24, alignItems: 'center',
              boxShadow: `0 24px 48px -20px ${Cur.navy}77`,
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = Cur.navyDeep)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = Cur.navy)}
          >
            {/* Decorative blob */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: -80, right: -60,
              width: 280, height: 280, borderRadius: 999,
              background: `radial-gradient(circle, ${Cur.lime}33 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}/>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: Cur.lime, fontWeight: 700, marginBottom: 10,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <FontAwesomeIcon icon={faTruckFast} /> +500 productos · envío gratis sobre $80.000
              </div>
              <div className="vp-font-display" style={{
                fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 500,
                lineHeight: 1.15, letterSpacing: '-0.01em',
              }}>
                Explora toda nuestra tienda
              </div>
              <div style={{
                marginTop: 6, fontSize: 14, opacity: 0.8, lineHeight: 1.5,
              }}>
                Alimento, medicamentos, accesorios e higiene — todo lo que tu mascota necesita.
              </div>
            </div>

            <div style={{
              position: 'relative', zIndex: 1,
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 24px', borderRadius: 999,
              backgroundColor: Cur.lime, color: Cur.navyDeep,
              fontSize: 14, fontWeight: 700,
              boxShadow: `0 12px 24px -8px ${Cur.lime}66`,
            }}>
              Ir a la tienda <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
            </div>
          </button>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 1100px) { .vp-prod-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 800px)  { .vp-prod-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px)  { .vp-prod-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
