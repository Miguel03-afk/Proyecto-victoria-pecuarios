// src/pages/Home.jsx — Tienda / Catálogo Victoria Pets · rediseño navy + lime
import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../styles/ThemeProvider.jsx";
import { FONT, RADIUS } from "../styles/admin.tokens";
import ProductCard from "../components/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faXmark, faSliders, faChevronLeft, faChevronRight,
  faFilterCircleXmark, faBoxOpen, faTags, faTruckFast, faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

const ORDEN_OPCIONES = [
  { id: "destacados", label: "Destacados" },
  { id: "menor",      label: "Precio: menor a mayor" },
  { id: "mayor",      label: "Precio: mayor a menor" },
  { id: "nombre",     label: "Nombre A–Z" },
];

const RANGOS_PRECIO = [
  { id: "todos",    label: "Todos los precios",    min: 0,      max: Infinity },
  { id: "menos50",  label: "Menos de $50.000",     min: 0,      max: 50000   },
  { id: "50-100",   label: "$50.000 – $100.000",   min: 50000,  max: 100000  },
  { id: "100-200",  label: "$100.000 – $200.000",  min: 100000, max: 200000  },
  { id: "mas200",   label: "Más de $200.000",      min: 200000, max: Infinity },
];

export default function Home() {
  const { C } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos,    setProductos]    = useState([]);
  const [categorias,   setCategorias]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [busquedaInput, setBusquedaInput] = useState(searchParams.get("buscar") || "");
  const [orden, setOrden] = useState("destacados");
  const [filtrosOpenMobile, setFiltrosOpenMobile] = useState(false);
  const [rangoPrecio, setRangoPrecio] = useState("todos");
  const [marcasSel, setMarcasSel] = useState([]);
  const debounceRef = useRef(null);

  const categoriasActivas = (searchParams.get("categorias") || "")
    .split(",").filter(Boolean).map(Number);
  const busqueda = searchParams.get("buscar") || "";
  const pagina   = Number(searchParams.get("pagina") || 1);

  // Tokens nuevos (con fallback)
  const navy     = C.navy     || '#1E3A8A';
  const navyDeep = C.navyDeep || '#0F2563';
  const lime     = C.lime     || '#7BC142';
  const inkSoft  = C.inkSoft  || C.ink2;
  const inkMuted = C.inkMuted || C.ink3;

  useEffect(() => {
    api.get("/categorias").then(r => setCategorias(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = { pagina, limite: 16 };
    if (busqueda) params.buscar = busqueda;
    if (categoriasActivas.length === 1)    params.categoria  = categoriasActivas[0];
    else if (categoriasActivas.length > 1) params.categorias = categoriasActivas.join(",");

    api.get("/productos", { params })
      .then(r => {
        const data = r.data;
        if (Array.isArray(data)) {
          setProductos(data); setTotalItems(data.length); setTotalPaginas(1);
        } else {
          setProductos(data.productos || []);
          setTotalItems(Number(data.total ?? data.productos?.length ?? 0));
          setTotalPaginas(Number(data.totalPaginas ?? 1));
        }
      })
      .catch(() => { setProductos([]); setTotalItems(0); setTotalPaginas(1); })
      .finally(() => setCargando(false));
  }, [busqueda, searchParams.get("categorias"), pagina]); // eslint-disable-line

  const marcasDisponibles = Array.from(new Set(productos.map(p => p.marca).filter(Boolean))).sort();

  const rangoActual = RANGOS_PRECIO.find(r => r.id === rangoPrecio) || RANGOS_PRECIO[0];
  const productosOrdenados = (() => {
    let arr = [...productos];
    arr = arr.filter(p => {
      const pr = Number(p.precio);
      return pr >= rangoActual.min && pr <= rangoActual.max;
    });
    if (marcasSel.length > 0) arr = arr.filter(p => p.marca && marcasSel.includes(p.marca));
    if (orden === "menor")  arr.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (orden === "mayor")  arr.sort((a, b) => Number(b.precio) - Number(a.precio));
    if (orden === "nombre") arr.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    return arr;
  })();

  const toggleMarca = (m) =>
    setMarcasSel(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handleBusqueda = (v) => {
    setBusquedaInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (v) next.set("buscar", v); else next.delete("buscar");
        next.delete("pagina");
        return next;
      });
    }, 400);
  };

  const toggleCategoria = (id) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const actuales = (prev.get("categorias") || "").split(",").filter(Boolean).map(Number);
      const nuevas = actuales.includes(id) ? actuales.filter(x => x !== id) : [...actuales, id];
      if (nuevas.length === 0) next.delete("categorias");
      else next.set("categorias", nuevas.join(","));
      next.delete("pagina");
      return next;
    });
  };

  const limpiarFiltros = () => {
    setBusquedaInput(""); setSearchParams({});
    setRangoPrecio("todos"); setMarcasSel([]);
  };
  const hayFiltros = busqueda || categoriasActivas.length > 0 ||
                     rangoPrecio !== "todos" || marcasSel.length > 0;
  const numFiltros = categoriasActivas.length + marcasSel.length + (rangoPrecio !== "todos" ? 1 : 0);

  const irPagina = (n) => setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    next.set("pagina", String(n));
    return next;
  });

  return (
    <>
      <style>{`
        @keyframes vp-shimmer { to { background-position: -200% 0; } }
        @keyframes vp-fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .vp-tienda-pill {
          transition: background 200ms ease, color 200ms ease, border-color 200ms ease, transform 200ms ease;
        }
        .vp-tienda-pill:hover { transform: translateY(-1px); }
        @media (max-width: 768px) {
          .vp-tienda-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: FONT.ui }}>

        {/* Hero editorial */}
        <section style={{
          padding: "56px 24px 32px",
          borderBottom: `1px solid ${C.line}`,
          background: C.canvas,
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: -80, right: -60,
            width: 320, height: 320, borderRadius: 999,
            background: `radial-gradient(circle, ${lime}22 0%, transparent 60%)`,
            pointerEvents: 'none', filter: 'blur(40px)',
          }}/>

          <div style={{ maxWidth: 1280, margin: "0 auto", position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: lime,
            }}>
              Catálogo, Tienda
            </div>
            <h1 style={{
              margin: "12px 0 14px",
              fontFamily: FONT.display,
              fontWeight: 700, fontSize: "clamp(36px, 5vw, 60px)",
              color: C.ink, letterSpacing: '-0.025em', lineHeight: 1.0,
            }}>
              Todo lo que tu mascota necesita,
              <br />
              <span style={{ color: navy }}>en un solo lugar.</span>
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: inkSoft, maxWidth: 580, lineHeight: 1.6 }}>
              Alimento, medicamentos, accesorios e higiene · Envíos gratis en Ibagué desde $80.000
            </p>

            {/* Trust strip mini */}
            <div style={{
              marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 24,
              fontSize: 12, color: inkSoft,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faTruckFast} style={{ color: navy, fontSize: 13 }} />
                Envío express en Ibagué
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faShieldHalved} style={{ color: navy, fontSize: 13 }} />
                Pago seguro con ePayco
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faTags} style={{ color: navy, fontSize: 13 }} />
                Precios trazables
              </span>
            </div>
          </div>
        </section>

        {/* Sticky bar: buscador + filtros mobile + orden */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: C.surface,
          borderBottom: `1px solid ${C.line}`,
          padding: "14px 24px",
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            {/* Buscador */}
            <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 480 }}>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{
                position: "absolute", left: 16, top: "50%",
                transform: "translateY(-50%)",
                color: inkMuted, fontSize: 13, pointerEvents: "none",
              }}/>
              <input
                type="text"
                value={busquedaInput}
                onChange={e => handleBusqueda(e.target.value)}
                placeholder="Buscar producto…"
                style={{
                  width: "100%", height: 44,
                  padding: "0 40px 0 42px",
                  borderRadius: 999,
                  border: `1.5px solid ${C.border}`,
                  background: C.surfaceAlt, color: C.ink,
                  fontSize: 13, fontFamily: FONT.ui, fontWeight: 500,
                  outline: "none",
                  transition: "all 200ms ease",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = navy;
                  e.currentTarget.style.background = C.surface;
                  e.currentTarget.style.boxShadow = `0 0 0 4px ${navy}15`;
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = C.surfaceAlt;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {busquedaInput && (
                <button onClick={() => handleBusqueda("")} style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  width: 24, height: 24, borderRadius: "50%",
                  border: "none", background: C.surfaceAlt, color: inkMuted,
                  cursor: "pointer", fontSize: 10,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FontAwesomeIcon icon={faXmark}/>
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}/>

            {/* Toggle filtros móvil */}
            <button onClick={() => setFiltrosOpenMobile(v => !v)}
              className="vp-toggle-filtros-mobile"
              style={{
                display: "none",
                height: 44, padding: "0 16px",
                borderRadius: 999,
                border: `1.5px solid ${C.border}`,
                background: C.surface, color: C.ink,
                fontSize: 12, fontWeight: 700,
                cursor: "pointer", gap: 8,
                alignItems: "center", fontFamily: FONT.ui,
              }}>
              <FontAwesomeIcon icon={faSliders} style={{ fontSize: 11 }}/>
              Filtros
              {numFiltros > 0 && (
                <span style={{
                  padding: "0 7px", borderRadius: 999,
                  background: navy, color: C.canvas,
                  fontSize: 11, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {numFiltros}
                </span>
              )}
            </button>

            {/* Orden */}
            <select
              value={orden}
              onChange={e => setOrden(e.target.value)}
              style={{
                height: 44, padding: "0 16px",
                borderRadius: 999,
                border: `1.5px solid ${C.border}`,
                background: C.surface, color: C.ink,
                fontSize: 12, fontWeight: 600,
                outline: "none", cursor: "pointer",
                fontFamily: FONT.ui,
              }}>
              {ORDEN_OPCIONES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Layout principal */}
        <div className="vp-tienda-layout" style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "32px 24px 80px",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 32, alignItems: "flex-start",
        }}>

          {/* Sidebar filtros */}
          <aside className={`vp-sidebar-filtros ${filtrosOpenMobile ? "open" : ""}`} style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: 24,
            position: "sticky", top: 84,
            fontFamily: FONT.ui,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <h3 style={{
                margin: 0, fontSize: 17, fontWeight: 700, color: C.ink,
                fontFamily: FONT.display, letterSpacing: '-0.015em',
              }}>
                Filtros
              </h3>
              {hayFiltros && (
                <button onClick={limpiarFiltros} style={{
                  background: "transparent", border: "none",
                  color: navy, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", padding: 0,
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontFamily: FONT.ui,
                }}>
                  <FontAwesomeIcon icon={faFilterCircleXmark} style={{ fontSize: 10 }}/>
                  Limpiar
                </button>
              )}
            </div>

            {/* Categorías */}
            {categorias.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  margin: "0 0 12px", fontSize: 13, fontWeight: 600,
                  color: C.ink,
                }}>
                  Categoría
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {categorias.slice(0, 8).map(cat => {
                    const activo = categoriasActivas.includes(cat.id);
                    return (
                      <label key={cat.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 10,
                        cursor: "pointer",
                        background: activo ? `${navy}10` : "transparent",
                        transition: "background 0.15s",
                      }}>
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={() => toggleCategoria(cat.id)}
                          style={{ accentColor: navy, cursor: "pointer", width: 14, height: 14 }}
                        />
                        <span style={{
                          fontSize: 13, fontWeight: activo ? 700 : 500,
                          color: activo ? navy : C.ink, flex: 1,
                        }}>
                          {cat.nombre}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rango precio */}
            <div style={{ marginBottom: 24 }}>
              <p style={{
                margin: "0 0 12px", fontSize: 13, fontWeight: 600,
                color: C.ink,
              }}>
                Rango de precio
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {RANGOS_PRECIO.map(r => {
                  const activo = rangoPrecio === r.id;
                  return (
                    <label key={r.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 10,
                      cursor: "pointer",
                      background: activo ? `${navy}10` : "transparent",
                    }}>
                      <input
                        type="radio"
                        name="rango"
                        checked={activo}
                        onChange={() => setRangoPrecio(r.id)}
                        style={{ accentColor: navy, cursor: "pointer" }}
                      />
                      <span style={{
                        fontSize: 13, fontWeight: activo ? 700 : 500,
                        color: activo ? navy : C.ink,
                      }}>
                        {r.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Marcas */}
            {marcasDisponibles.length > 0 && (
              <div>
                <p style={{
                  margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: C.ink,
                }}>
                  Marca {marcasSel.length > 0 && <span style={{ color: navy, fontWeight: 500 }}>({marcasSel.length})</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6,
                  maxHeight: 240, overflowY: "auto" }}>
                  {marcasDisponibles.map(m => {
                    const activo = marcasSel.includes(m);
                    return (
                      <button key={m}
                        onClick={() => toggleMarca(m)}
                        className="vp-tienda-pill"
                        style={{
                          padding: "5px 12px", borderRadius: 999,
                          background: activo ? navy : "transparent",
                          color: activo ? C.canvas : C.ink,
                          border: `1px solid ${activo ? navy : C.border}`,
                          fontSize: 11, fontWeight: activo ? 700 : 500,
                          cursor: "pointer", fontFamily: FONT.ui,
                        }}>
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setFiltrosOpenMobile(false)}
              className="vp-cerrar-filtros-mobile"
              style={{
                display: "none",
                width: "100%", marginTop: 20, padding: "12px",
                borderRadius: 999,
                border: "none", background: navy, color: C.canvas,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: FONT.ui,
              }}>
              Ver resultados
            </button>
          </aside>

          {/* Columna productos */}
          <div>
            {/* Header resultados */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginBottom: 20, flexWrap: "wrap", gap: 10,
            }}>
              <p style={{ margin: 0, fontSize: 13, color: inkSoft }}>
                {cargando
                  ? "Cargando..."
                  : <>Mostrando <strong style={{ color: C.ink }}>{productosOrdenados.length}</strong> de <strong style={{ color: C.ink }}>{totalItems}</strong> productos</>}
                {hayFiltros && !cargando && (
                  <> · <button onClick={limpiarFiltros} style={{
                    background: "transparent", border: "none", padding: 0,
                    color: navy, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: FONT.ui,
                  }}>Limpiar filtros</button></>
                )}
              </p>
            </div>

            {/* Grid responsivo: 2 cols en móvil, auto-fill desde tablet */}
            <style>{`
              .vp-shop-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 20px;
              }
              @media (max-width: 640px) {
                .vp-shop-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
              }
            `}</style>

            {cargando ? (
              <div className="vp-shop-grid">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} style={{
                    height: 380, borderRadius: 24,
                    background: `linear-gradient(90deg, ${C.surfaceAlt} 25%, ${C.surface} 50%, ${C.surfaceAlt} 75%)`,
                    backgroundSize: "200% 100%",
                    animation: "vp-shimmer 1.4s infinite",
                  }}/>
                ))}
              </div>
            ) : productosOrdenados.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "96px 24px",
                background: C.surface,
                border: `1px dashed ${C.border}`,
                borderRadius: 24,
              }}>
                <FontAwesomeIcon icon={faBoxOpen} style={{
                  fontSize: 56, color: inkMuted, marginBottom: 16, display: "block",
                  opacity: 0.5,
                }}/>
                <h3 style={{
                  margin: "0 0 8px",
                  fontFamily: FONT.display,
                  fontWeight: 700, fontSize: 26, color: C.ink,
                  letterSpacing: '-0.02em',
                }}>
                  Sin resultados
                </h3>
                <p style={{ margin: "0 0 24px", fontSize: 14, color: inkSoft }}>
                  {hayFiltros ? "Prueba ajustar tus filtros" : "Aún no hay productos disponibles"}
                </p>
                {hayFiltros && (
                  <button onClick={limpiarFiltros} style={{
                    padding: "12px 28px", borderRadius: 999,
                    background: navy, color: C.canvas,
                    border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: FONT.ui,
                    boxShadow: `0 12px 24px -10px ${navy}66`,
                  }}>
                    Ver todos los productos
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="vp-shop-grid" style={{
                  animation: "vp-fadeUp 0.35s ease",
                }}>
                  {productosOrdenados.map(p => (
                    <ProductCard key={p.id} producto={p}/>
                  ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div style={{
                    display: "flex", justifyContent: "center", alignItems: "center",
                    gap: 8, marginTop: 56,
                  }}>
                    <button
                      onClick={() => irPagina(Math.max(1, pagina - 1))}
                      disabled={pagina <= 1}
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: `1px solid ${C.border}`,
                        background: pagina <= 1 ? "transparent" : C.surface,
                        color: pagina <= 1 ? inkMuted : C.ink,
                        cursor: pagina <= 1 ? "not-allowed" : "pointer",
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }}/>
                    </button>

                    {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                      const n = i + 1;
                      const activo = n === pagina;
                      return (
                        <button key={n} onClick={() => irPagina(n)} style={{
                          minWidth: 40, height: 40, padding: '0 12px',
                          borderRadius: 999,
                          border: `1px solid ${activo ? navy : C.border}`,
                          background: activo ? navy : C.surface,
                          color: activo ? C.canvas : C.ink,
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                          fontFamily: FONT.ui,
                          fontVariantNumeric: 'tabular-nums',
                          boxShadow: activo ? `0 4px 12px -8px ${navy}50` : 'none',
                        }}>{n}</button>
                      );
                    })}

                    <button
                      onClick={() => irPagina(Math.min(totalPaginas, pagina + 1))}
                      disabled={pagina >= totalPaginas}
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: `1px solid ${C.border}`,
                        background: pagina >= totalPaginas ? "transparent" : C.surface,
                        color: pagina >= totalPaginas ? inkMuted : C.ink,
                        cursor: pagina >= totalPaginas ? "not-allowed" : "pointer",
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }}/>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Overlay móvil */}
        {filtrosOpenMobile && (
          <div
            onClick={() => setFiltrosOpenMobile(false)}
            className="vp-overlay-filtros"
            style={{
              position: "fixed", inset: 0, zIndex: 90,
              background: "rgba(10,20,38,0.55)",
              backdropFilter: 'blur(4px)',
              display: "none",
            }}
          />
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .vp-tienda-layout { grid-template-columns: 220px 1fr !important; }
        }
        @media (max-width: 768px) {
          .vp-tienda-layout { grid-template-columns: 1fr !important; }
          .vp-sidebar-filtros {
            position: fixed !important;
            top: 0 !important; right: 0 !important; bottom: 0 !important;
            width: 320px !important;
            max-height: 100vh !important;
            overflow-y: auto !important;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-radius: 0 !important;
            z-index: 100;
          }
          .vp-sidebar-filtros.open { transform: translateX(0) !important; }
          .vp-toggle-filtros-mobile { display: inline-flex !important; }
          .vp-cerrar-filtros-mobile { display: block !important; }
          .vp-overlay-filtros { display: block !important; }
        }
      `}</style>
    </>
  );
}
