// src/pages/Perfil.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser, faHeart, faShoppingBag, faLocationDot, faFileInvoice,
  faEnvelope, faLock, faRightFromBracket, faStore,
  faBoxOpen, faCircleCheck, faClock, faCircleXmark, faSpinner, faTruck,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useFavoritos } from "../hooks/useFavoritos";
import { useCarrito } from "../context/CarritoContext";
import { useTheme } from "../styles/ThemeProvider.jsx";

const STATIC = "http://localhost:3000";
const fmtCOP  = (n) => "$" + Number(n || 0).toLocaleString("es-CO");
const fmtFull = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);
const fmtFecha = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";  // mismo que la landing

/* ─── Estilos globales ─────────────────────────────────────────────────────
   Sidebar y main comparten background (cream). Solo un border-right separa.
   Nav activo: barra navy de 2px en el borde izquierdo (signature).        */
const STYLES = `
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  *, *::before, *::after { box-sizing: border-box; }

  /* App-shell sin scroll de página */
  .vp-app { display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar — MISMO bg que canvas, sólo border-right */
  .vp-side {
    width: 240px; flex-shrink: 0;
    height: 100vh; overflow-y: auto;
    border-right: 1px solid var(--vp-border);
    display: flex; flex-direction: column;
    background: var(--vp-canvas);
    scrollbar-width: none;
  }
  .vp-side::-webkit-scrollbar { display: none; }

  /* Contenido */
  .vp-main { flex: 1; height: 100vh; overflow-y: auto; min-width: 0; }
  .vp-main::-webkit-scrollbar { width: 8px; }
  .vp-main::-webkit-scrollbar-thumb { background: var(--vp-border); border-radius: 4px; }

  /* Nav items — texto sobre cream, signature de barra navy a la izquierda */
  .vp-nav {
    position: relative; display: flex; align-items: center; gap: 11px;
    padding: 9px 16px; padding-left: 18px;
    width: 100%; border: none; background: transparent;
    cursor: pointer; text-align: left; font-family: inherit;
    font-size: 13.5px; font-weight: 500;
    color: var(--vp-ink-soft);
    transition: color 180ms ${EASE};
  }
  .vp-nav::before {
    content: ""; position: absolute; left: 0; top: 50%;
    width: 2px; height: 0; transform: translateY(-50%);
    background: var(--vp-navy); border-radius: 0 2px 2px 0;
    transition: height 220ms ${EASE};
  }
  .vp-nav:hover { color: var(--vp-ink); }
  .vp-nav:hover::before { height: 14px; opacity: 0.4; }
  .vp-nav.active { color: var(--vp-navy); font-weight: 600; }
  .vp-nav.active::before { height: 22px; opacity: 1; }
  .vp-nav .vp-nav-ico { width: 16px; text-align: center; opacity: 0.7; transition: opacity 180ms ease; }
  .vp-nav.active .vp-nav-ico, .vp-nav:hover .vp-nav-ico { opacity: 1; }

  /* Botón pill — mismo lenguaje que la landing */
  .vp-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 20px; border-radius: 999px;
    font-size: 13.5px; font-weight: 600; border: none;
    cursor: pointer; font-family: inherit;
    transition: background 200ms ${EASE}, color 200ms ${EASE}, transform 180ms ${EASE};
  }
  .vp-btn:active { transform: scale(0.97); }
  .vp-btn.primary { background: var(--vp-navy); color: var(--vp-canvas); }
  .vp-btn.primary:hover { background: var(--vp-navy-deep); transform: translateY(-1px); }
  .vp-btn.primary:disabled { background: var(--vp-surface-alt); color: var(--vp-text-ter); cursor: not-allowed; transform: none; }
  .vp-btn.ghost {
    background: var(--vp-surface); color: var(--vp-ink);
    border: 1px solid var(--vp-border);
  }
  .vp-btn.ghost:hover { border-color: var(--vp-navy); color: var(--vp-navy); }

  /* Inputs */
  .vp-input {
    width: 100%; padding: 10px 13px; border-radius: 10px;
    font-size: 13.5px; outline: none; font-family: inherit;
    color: var(--vp-ink);
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }
  .vp-label {
    display: block; font-size: 10.5px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 5px; transition: color 130ms ease;
  }

  /* Mobile */
  @media (max-width: 767px) {
    .vp-app   { flex-direction: column; height: auto; overflow: visible; }
    .vp-side  { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--vp-border); }
    .vp-side-nav { flex-direction: row !important; overflow-x: auto; padding: 4px 12px 10px !important;
                   scrollbar-width: none; gap: 0 !important; }
    .vp-side-nav::-webkit-scrollbar { display: none; }
    .vp-nav { padding: 8px 12px !important; padding-left: 12px !important; white-space: nowrap; font-size: 12.5px !important; }
    .vp-nav::before { display: none; }
    .vp-nav.active { background: var(--vp-brand-soft); border-radius: 8px; }
    .vp-main  { height: auto; }
  }
`;

/* ─── Form primitives ─────────────────────────────────────────────────── */
function Campo({ label, value, onChange, type = "text", disabled = false, hint, placeholder, noPaste }) {
  const { C: T } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="vp-label" style={{ color: focused ? T.navy : T.inkSoft }}>{label}</label>
      <input
        className="vp-input"
        type={type} value={value}
        onChange={onChange} disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPaste={noPaste ? e => e.preventDefault() : undefined}
        style={{
          border: `1px solid ${focused ? T.navy : T.border}`,
          background: disabled ? T.surfaceAlt : T.surface,
          boxShadow: focused ? `0 0 0 3px ${T.brandSoft}` : "none",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {hint && <p style={{ margin: "5px 0 0", fontSize: 11.5, color: T.inkSoft, lineHeight: 1.45 }}>{hint}</p>}
    </div>
  );
}

function Sel({ label, value, onChange, children }) {
  const { C: T } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="vp-label" style={{ color: focused ? T.navy : T.inkSoft }}>{label}</label>
      <select
        className="vp-input"
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          border: `1px solid ${focused ? T.navy : T.border}`,
          background: T.surface,
          boxShadow: focused ? `0 0 0 3px ${T.brandSoft}` : "none",
        }}>
        {children}
      </select>
    </div>
  );
}

function CampoPass({ label, value, onChange, placeholder }) {
  const { C: T } = useTheme();
  const [ver, setVer] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="vp-label" style={{ color: focused ? T.navy : T.inkSoft }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={ver ? "text" : "password"}
          value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "10px 40px 10px 13px",
            borderRadius: 10, border: `1px solid ${focused ? T.navy : T.border}`,
            background: T.surface, color: T.ink, fontSize: 13.5, outline: "none",
            boxShadow: focused ? `0 0 0 3px ${T.brandSoft}` : "none",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            fontFamily: "inherit",
          }}
        />
        <button type="button" onClick={() => setVer(v => !v)}
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: T.inkSoft, fontSize: 13, padding: 4,
            transition: "color 130ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = T.navy; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.inkSoft; }}>
          {ver ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}

function Msg({ texto, tipo = "ok" }) {
  const { C: T } = useTheme();
  if (!texto) return null;
  const ok = tipo === "ok";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "9px 13px", borderRadius: 10,
      background: ok ? T.successBg : T.dangerBg,
      border: `1px solid ${ok ? T.successBorder : T.dangerBorder}`,
      color: ok ? T.success : T.danger,
      fontSize: 12.5, fontWeight: 500,
      animation: `fadeUp 180ms ${EASE}`,
    }}>
      {ok ? "✓" : "⚠"} {texto}
    </div>
  );
}

/* ─── Datos personales ───────────────────────────────────────────────── */
function DatosPersonales({ usuario, onActualizado }) {
  const { C: T } = useTheme();
  const [form, setForm] = useState({
    nombre: usuario.nombre || "", apellido: usuario.apellido || "", telefono: usuario.telefono || "",
  });
  const [msg, setMsg] = useState({});
  const [cargando, setCargando] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/perfil", {
        nombre: form.nombre || undefined, apellido: form.apellido || undefined, telefono: form.telefono || undefined,
      });
      setMsg({ texto: "Datos actualizados.", tipo: "ok" });
      onActualizado?.();
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al guardar.", tipo: "err" });
    } finally { setCargando(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Msg texto={msg.texto} tipo={msg.tipo} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Campo label="Nombre" value={form.nombre} onChange={set("nombre")} placeholder="Juan" />
        <Campo label="Apellido" value={form.apellido} onChange={set("apellido")} placeholder="Pérez" />
      </div>
      <Campo label="Teléfono" type="tel" value={form.telefono} onChange={set("telefono")}
        placeholder="300 000 0000" hint="Solo para contactarte sobre tus pedidos." />
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <button className="vp-btn primary" onClick={guardar} disabled={cargando}>
          {cargando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

/* ─── Pedidos mini ───────────────────────────────────────────────────── */
const EST = {
  pendiente:      { color: "#854d0e", bg: "#fef9c3", label: "Pendiente",      icon: faClock       },
  pendiente_pago: { color: "#9a3412", bg: "#fff7ed", label: "Pago pendiente", icon: faClock       },
  pagada:         { color: "#14532d", bg: "#dcfce7", label: "Pagada",         icon: faCircleCheck },
  procesando:     { color: "#6b21a8", bg: "#f3e8ff", label: "Procesando",     icon: faSpinner     },
  enviada:        { color: "#3730a3", bg: "#e0e7ff", label: "Enviada",        icon: faTruck       },
  entregada:      { color: "#1e40af", bg: "#dbeafe", label: "Entregada",      icon: faCircleCheck },
  cancelada:      { color: "#7f1d1d", bg: "#fee2e2", label: "Cancelada",      icon: faCircleXmark },
  rechazada:      { color: "#7f1d1d", bg: "#fee2e2", label: "Rechazada",      icon: faCircleXmark },
};

function MisPedidosMini() {
  const { C: T } = useTheme();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenes(data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 54, borderRadius: 12, background: T.surfaceAlt,
          animation: `pulse 1.4s ease ${i * 100}ms infinite` }} />
      ))}
    </div>
  );

  if (!ordenes.length) return (
    <div style={{ textAlign: "center", padding: "44px 20px",
      border: `1px dashed ${T.border}`, borderRadius: 16 }}>
      <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: 22, color: T.inkSoft, marginBottom: 12, display: "block" }} />
      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: T.ink }}>Aún no tienes pedidos.</p>
      <p style={{ margin: "0 0 18px", fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5 }}>
        Cuando compres, aparecerán aquí.
      </p>
      <Link to="/tienda" className="vp-btn primary" style={{ textDecoration: "none" }}>Ir a la tienda</Link>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {ordenes.map((o, i) => {
        const estado = (o.estado || "pendiente").toLowerCase();
        const est = EST[estado] || EST.pendiente;
        return (
          <div key={o.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", borderRadius: 12,
            background: T.surface, border: `1px solid ${T.border}`,
            animation: `fadeUp 200ms ${EASE} ${i * 40}ms both`,
            transition: `border-color 150ms ease, transform 180ms ${EASE}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brandBorder; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = ""; }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: est.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FontAwesomeIcon icon={est.icon} style={{ fontSize: 12, color: est.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: T.navy }}>{o.codigo}</span>
                <span style={{ fontSize: 11, color: T.inkSoft }}>· {est.label}</span>
              </div>
              <p style={{ margin: "1px 0 0", fontSize: 11.5, color: T.inkSoft }}>
                {fmtFecha(o.created_at)}{o.items > 0 ? ` · ${o.items} producto${o.items !== 1 ? "s" : ""}` : ""}
              </p>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
              {fmtFull(o.total)}
            </span>
          </div>
        );
      })}
      <Link to="/mis-ordenes" className="vp-btn ghost" style={{ textDecoration: "none", marginTop: 6 }}>
        Ver todas las órdenes
      </Link>
    </div>
  );
}

/* ─── Direcciones ────────────────────────────────────────────────────── */
function MisDirecciones() {
  const { C: T } = useTheme();
  const [dirs, setDirs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vp_direcciones") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ alias: "", calle: "", barrio: "", referencias: "" });
  const [agregando, setAgregando] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const guardar = () => {
    if (!form.calle.trim()) return;
    const nuevas = [...dirs, { ...form, id: Date.now(), ciudad: "Ibagué" }];
    setDirs(nuevas);
    localStorage.setItem("vp_direcciones", JSON.stringify(nuevas));
    setForm({ alias: "", calle: "", barrio: "", referencias: "" });
    setAgregando(false);
  };

  const eliminar = id => {
    const nuevas = dirs.filter(d => d.id !== id);
    setDirs(nuevas);
    localStorage.setItem("vp_direcciones", JSON.stringify(nuevas));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {!dirs.length && !agregando && (
        <div style={{ textAlign: "center", padding: "36px 16px", border: `1px dashed ${T.border}`, borderRadius: 14 }}>
          <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 20, color: T.inkSoft, marginBottom: 10, display: "block" }} />
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: T.ink }}>Sin direcciones</p>
          <p style={{ margin: 0, fontSize: 12.5, color: T.inkSoft }}>Agrega una para agilizar tus compras.</p>
        </div>
      )}

      {dirs.map((d, i) => (
        <div key={d.id} style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          padding: "13px 15px", borderRadius: 12,
          background: T.surface, border: `1px solid ${T.border}`,
          animation: `fadeUp 180ms ${EASE} ${i * 30}ms both`,
        }}>
          <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 13, color: T.navy, marginTop: 3, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {d.alias && <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 700, color: T.navy, textTransform: "uppercase", letterSpacing: "0.07em" }}>{d.alias}</p>}
            <p style={{ margin: "0 0 1px", fontSize: 13.5, color: T.ink, fontWeight: 500 }}>{d.calle}</p>
            <p style={{ margin: 0, fontSize: 11.5, color: T.inkSoft }}>{[d.barrio, d.ciudad].filter(Boolean).join(", ")}</p>
          </div>
          <button onClick={() => eliminar(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkSoft, fontSize: 17, padding: "0 4px", lineHeight: 1, transition: "color 130ms ease" }}
            onMouseEnter={e => { e.currentTarget.style.color = T.danger; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.inkSoft; }}>×</button>
        </div>
      ))}

      {agregando ? (
        <div style={{ padding: 16, borderRadius: 12, background: T.surfaceAlt, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12, animation: `fadeUp 180ms ${EASE}` }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.ink, textTransform: "uppercase", letterSpacing: "0.07em" }}>Nueva dirección · Ibagué</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Campo label="Alias" value={form.alias} onChange={set("alias")} placeholder="Casa, Oficina…" />
            <Campo label="Barrio" value={form.barrio} onChange={set("barrio")} placeholder="La Pola" />
          </div>
          <Campo label="Dirección" value={form.calle} onChange={set("calle")} placeholder="Cra 3 # 45-67" />
          <Campo label="Referencias" value={form.referencias} onChange={set("referencias")} placeholder="Casa azul, segundo piso" />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="vp-btn primary" onClick={guardar} disabled={!form.calle.trim()}>Agregar</button>
            <button className="vp-btn ghost" onClick={() => { setAgregando(false); setForm({ alias: "", calle: "", barrio: "", referencias: "" }); }}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAgregando(true)} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "11px 16px", borderRadius: 12,
          border: `1px dashed ${T.borderMed}`, background: "transparent",
          color: T.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          transition: `background 150ms ease, border-color 150ms ease`,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.brandSoft; e.currentTarget.style.borderColor = T.navy; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.borderMed; }}>
          + Agregar dirección
        </button>
      )}
      <p style={{ margin: "4px 0 0", fontSize: 11.5, color: T.inkSoft }}>Solo Ibagué, Tolima.</p>
    </div>
  );
}

/* ─── Facturación ────────────────────────────────────────────────────── */
function DatosFacturacion({ usuario, onActualizado }) {
  const { C: T } = useTheme();
  const fac = usuario.facturacion || {};
  const [form, setForm] = useState({
    razon_social: fac.razon_social || "", tipo_documento: fac.tipo_documento || "CC",
    numero_documento: fac.numero_documento || "", direccion: fac.direccion || "", ciudad: fac.ciudad || "Ibagué",
  });
  const [msg, setMsg] = useState({});
  const [cargando, setCargando] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/perfil", { facturacion: form });
      setMsg({ texto: "Facturación guardada.", tipo: "ok" });
      onActualizado?.();
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al guardar.", tipo: "err" });
    } finally { setCargando(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5 }}>
        Aparecerán en tus facturas electrónicas cuando las solicites.
      </p>
      <Msg texto={msg.texto} tipo={msg.tipo} />
      <Campo label="Razón social / Nombre" value={form.razon_social} onChange={set("razon_social")} placeholder="Juan Pérez o Mi Empresa S.A.S." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Sel label="Tipo de documento" value={form.tipo_documento} onChange={set("tipo_documento")}>
          <option value="CC">C.C. — Cédula</option>
          <option value="NIT">NIT</option>
          <option value="CE">C.E. — Extranjería</option>
          <option value="PASAPORTE">Pasaporte</option>
        </Sel>
        <Campo label="Número" value={form.numero_documento} onChange={set("numero_documento")} placeholder="900123456" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <Campo label="Dirección fiscal" value={form.direccion} onChange={set("direccion")} placeholder="Cra 1 # 23-45" />
        <Campo label="Ciudad" value={form.ciudad} onChange={set("ciudad")} placeholder="Ibagué" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <button className="vp-btn primary" onClick={guardar} disabled={cargando}>
          {cargando ? "Guardando…" : "Guardar facturación"}
        </button>
      </div>
    </div>
  );
}

/* ─── Cambiar correo ─────────────────────────────────────────────────── */
function CambiarEmail({ usuario }) {
  const { C: T } = useTheme();
  const [form, setForm] = useState({ nuevo_email: "", password_actual: "" });
  const [msg, setMsg] = useState({});
  const [cargando, setCargando] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/cambiar-email", form);
      setMsg({ texto: "Correo actualizado. Vuelve a iniciar sesión.", tipo: "ok" });
      setForm({ nuevo_email: "", password_actual: "" });
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al cambiar.", tipo: "err" });
    } finally { setCargando(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
        <FontAwesomeIcon icon={faEnvelope} style={{ color: T.navy, fontSize: 13 }} />
        <div>
          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.inkSoft }}>Correo actual</p>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{usuario.email}</p>
        </div>
      </div>
      <Msg texto={msg.texto} tipo={msg.tipo} />
      <Campo label="Nuevo correo" type="email" value={form.nuevo_email} onChange={set("nuevo_email")} placeholder="nuevo@ejemplo.com" />
      <CampoPass label="Contraseña actual" value={form.password_actual} onChange={set("password_actual")} placeholder="Confirma con tu contraseña" />
      <button className="vp-btn primary" onClick={guardar} disabled={cargando || !form.nuevo_email || !form.password_actual} style={{ alignSelf: "flex-start" }}>
        {cargando ? "Actualizando…" : "Cambiar correo"}
      </button>
    </div>
  );
}

/* ─── Cambiar contraseña ─────────────────────────────────────────────── */
function CambiarPassword() {
  const { C: T } = useTheme();
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [msg, setMsg] = useState({});
  const [cargando, setCargando] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    if (form.nueva !== form.confirmar) return setMsg({ texto: "Las contraseñas no coinciden.", tipo: "err" });
    if (form.nueva.length < 8) return setMsg({ texto: "Mínimo 8 caracteres.", tipo: "err" });
    if (!/[0-9]/.test(form.nueva)) return setMsg({ texto: "Debe incluir al menos 1 número.", tipo: "err" });
    setCargando(true);
    try {
      await api.patch("/auth/cambiar-password", { password_actual: form.actual, nueva_password: form.nueva });
      setMsg({ texto: "Contraseña actualizada.", tipo: "ok" });
      setForm({ actual: "", nueva: "", confirmar: "" });
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al cambiar.", tipo: "err" });
    } finally { setCargando(false); }
  };

  const checks = form.nueva ? [
    { ok: form.nueva.length >= 8, label: "8+ chars" },
    { ok: /[0-9]/.test(form.nueva), label: "Número" },
    { ok: /[A-Z]/.test(form.nueva), label: "Mayúscula" },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
      <Msg texto={msg.texto} tipo={msg.tipo} />
      <CampoPass label="Contraseña actual" value={form.actual} onChange={set("actual")} placeholder="Tu contraseña actual" />
      <CampoPass label="Nueva contraseña" value={form.nueva} onChange={set("nueva")} placeholder="Mínimo 8 caracteres y 1 número" />
      {checks.length > 0 && (
        <div style={{ display: "flex", gap: 6 }}>
          {checks.map((c, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 2, background: c.ok ? T.lime : T.border, transition: "background 220ms ease" }} />
              <span style={{ fontSize: 10, color: c.ok ? T.limeDark : T.inkSoft, marginTop: 4, display: "block" }}>{c.label}</span>
            </div>
          ))}
        </div>
      )}
      <CampoPass label="Confirmar contraseña" value={form.confirmar} onChange={set("confirmar")} placeholder="Repite la nueva" />
      <button className="vp-btn primary" onClick={guardar} disabled={cargando || !form.actual || !form.nueva} style={{ alignSelf: "flex-start" }}>
        {cargando ? "Actualizando…" : "Actualizar contraseña"}
      </button>
    </div>
  );
}

/* ─── Favoritos ──────────────────────────────────────────────────────── */
function MisFavoritos() {
  const { C: T } = useTheme();
  const { usuario } = useAuth();
  const { agregar } = useCarrito();
  const { favoritos, quitar, refrescar, total } = useFavoritos(usuario);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { (async () => { await refrescar(); setCargando(false); })(); }, [refrescar]);

  if (cargando) return <div style={{ fontSize: 13, color: T.inkSoft, padding: "24px 0", textAlign: "center" }}>Cargando…</div>;

  if (!total) return (
    <div style={{ textAlign: "center", padding: "44px 20px", border: `1px dashed ${T.border}`, borderRadius: 16 }}>
      <FontAwesomeIcon icon={faHeart} style={{ fontSize: 22, color: T.inkSoft, marginBottom: 12, display: "block" }} />
      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: T.ink }}>Sin favoritos aún</p>
      <p style={{ margin: "0 0 18px", fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5 }}>Toca el corazón en cualquier producto.</p>
      <Link to="/tienda" className="vp-btn primary" style={{ textDecoration: "none" }}>Explorar tienda</Link>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
      {favoritos.map((f, i) => {
        const agotado = f.agotado || Number(f.stock) <= 0;
        const imgSrc = f.imagen_url
          ? (String(f.imagen_url).startsWith("http") ? f.imagen_url : `${STATIC}${f.imagen_url}`)
          : null;
        return (
          <div key={f.id} style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
            overflow: "hidden", display: "flex", flexDirection: "column",
            animation: `fadeUp 200ms ${EASE} ${i * 35}ms both`,
            transition: `border-color 160ms ease, box-shadow 200ms ${EASE}, transform 200ms ${EASE}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.brandBorder; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 24px -12px rgba(10,20,38,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            <Link to={`/producto/${f.slug}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div style={{ aspectRatio: "1/1", background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {imgSrc
                  ? <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: agotado ? 0.5 : 1 }} />
                  : <span style={{ fontSize: 26, opacity: 0.3 }}>🐾</span>}
                {agotado && <span style={{ position: "absolute", top: 8, left: 8, padding: "2px 8px", borderRadius: 999, background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}`, fontSize: 10, fontWeight: 700 }}>Agotado</span>}
              </div>
              <div style={{ padding: "11px 13px 8px" }}>
                {f.marca && <p style={{ margin: "0 0 2px", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.inkSoft }}>{f.marca}</p>}
                <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 600, color: T.ink, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.nombre}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy, fontVariantNumeric: "tabular-nums" }}>{fmtCOP(f.precio)}</p>
              </div>
            </Link>
            <div style={{ display: "flex", gap: 6, padding: "0 10px 10px" }}>
              <button disabled={agotado}
                onClick={() => agregar({ id: f.id, nombre: f.nombre, slug: f.slug, precio: f.precio, imagen_url: f.imagen_url, stock: f.stock }, 1)}
                style={{ flex: 1, padding: "8px 0", background: agotado ? T.surfaceAlt : T.navy, color: agotado ? T.inkSoft : T.canvas, border: "none", borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: agotado ? "not-allowed" : "pointer", fontFamily: "inherit", transition: `background 150ms ease, transform 180ms ${EASE}` }}
                onMouseEnter={e => { if (!agotado) e.currentTarget.style.background = T.navyDeep; }}
                onMouseLeave={e => { if (!agotado) e.currentTarget.style.background = T.navy; }}>
                {agotado ? "Sin stock" : "Añadir"}
              </button>
              <button onClick={() => quitar(f.id)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.inkSoft, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", transition: "border-color 130ms ease, color 130ms ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.dangerBorder; e.currentTarget.style.color = T.danger; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.inkSoft; }}>✕</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Config tabs ─────────────────────────────────────────────────────────
   Agrupados en 3 secciones editoriales (impeccable: estructura, no lista). */
const NAV_GROUPS = [
  {
    label: "Cuenta",
    items: [
      { id: "datos",     label: "Mis datos",   icon: faUser        },
      { id: "favoritos", label: "Favoritos",   icon: faHeart       },
      { id: "pedidos",   label: "Mis pedidos", icon: faShoppingBag },
    ],
  },
  {
    label: "Entrega",
    items: [
      { id: "direcciones", label: "Direcciones", icon: faLocationDot },
      { id: "facturacion", label: "Facturación", icon: faFileInvoice },
    ],
  },
  {
    label: "Seguridad",
    items: [
      { id: "email",    label: "Correo",     icon: faEnvelope },
      { id: "password", label: "Contraseña", icon: faLock     },
    ],
  },
];

const TABS = NAV_GROUPS.flatMap(g => g.items);

const META = {
  datos:       { titulo: "Información personal",   sub: "Nombre, apellido y teléfono."             },
  favoritos:   { titulo: "Tus favoritos",          sub: "Productos guardados para comprar después."},
  pedidos:     { titulo: "Mis pedidos",            sub: "Tus compras más recientes."               },
  direcciones: { titulo: "Direcciones de envío",   sub: "Puntos de entrega en Ibagué."             },
  facturacion: { titulo: "Datos de facturación",   sub: "Para tus facturas electrónicas."          },
  email:       { titulo: "Correo electrónico",     sub: "El correo de acceso a tu cuenta."         },
  password:    { titulo: "Seguridad",              sub: "Contraseña de acceso."                    },
};

/* ─── Página principal ────────────────────────────────────────────────── */
export default function Perfil() {
  const { C: T } = useTheme();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("datos");
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState(null);
  const [ordenesCount, setOrdenesCount] = useState(null);
  const { total: favsTotal } = useFavoritos(usuario);

  const cargar = () => {
    setErrorPerfil(null);
    api.get("/auth/me")
      .then(({ data }) => setPerfil(data))
      .catch(err => setErrorPerfil(err.response?.data?.error || err.message || "Error al cargar el perfil."))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenesCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setOrdenesCount(0));
  }, []);

  if (cargando) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.canvas }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${T.brandSoft}`, borderTopColor: T.navy, animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  // Fallback visual cuando el API falla — antes quedaba blank
  if (!perfil) return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: "100vh", background: T.canvas, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          maxWidth: 440, width: "100%", padding: "32px 28px",
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
          textAlign: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: T.dangerBg, border: `1px solid ${T.dangerBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: T.danger,
            margin: "0 auto 16px",
          }}>⚠</div>
          <h2 style={{
            margin: "0 0 8px", fontSize: 19, fontWeight: 700, color: T.ink,
            fontFamily: "'General Sans', system-ui, sans-serif",
            letterSpacing: "-0.02em",
          }}>
            No pudimos cargar tu perfil
          </h2>
          <p style={{ margin: "0 0 6px", fontSize: 13.5, color: T.inkSoft, lineHeight: 1.55 }}>
            El servidor respondió con un error. Intenta de nuevo en unos segundos.
          </p>
          {errorPerfil && (
            <p style={{
              margin: "12px 0 18px", padding: "8px 12px", borderRadius: 8,
              background: T.surfaceAlt, fontFamily: "monospace",
              fontSize: 11.5, color: T.inkSoft, wordBreak: "break-word",
            }}>
              {errorPerfil}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            <button className="vp-btn primary" onClick={() => { setCargando(true); cargar(); }}>
              Reintentar
            </button>
            <Link to="/" className="vp-btn ghost" style={{ textDecoration: "none" }}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  const iniciales = `${perfil.nombre?.charAt(0) || ""}${perfil.apellido?.charAt(0) || ""}`.toUpperCase();

  return (
    <>
      <style>{STYLES}</style>

      <div className="vp-app" style={{
        background: T.canvas,
        "--vp-canvas":       T.canvas,
        "--vp-surface":      T.surface,
        "--vp-surface-alt":  T.surfaceAlt,
        "--vp-navy":         T.navy,
        "--vp-navy-deep":    T.navyDeep,
        "--vp-border":       T.border,
        "--vp-brand-soft":   T.brandSoft,
        "--vp-ink":          T.ink,
        "--vp-ink-soft":     T.inkSoft,
        "--vp-text-ter":     T.textTer,
      }}>

        {/* ── Sidebar ──────────────────────────────────────────────────
            Layout: avatar+nombre arriba (sin Inicio aquí), nav agrupado en
            el medio con micro-labels editoriales, CTAs anclados abajo.    */}
        <aside className="vp-side">

          {/* Header — avatar + nombre + stats inline */}
          <div style={{ padding: "24px 24px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: T.lime, color: T.navyDeep,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700,
                fontFamily: "'General Sans', sans-serif",
                letterSpacing: "-0.01em",
              }}>
                {iniciales}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  margin: 0, fontSize: 14, fontWeight: 700, color: T.ink,
                  letterSpacing: "-0.022em", lineHeight: 1.2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontFamily: "'General Sans', sans-serif",
                }}>
                  {perfil.nombre} {perfil.apellido}
                </p>
                <p style={{
                  margin: "2px 0 0", fontSize: 11.5, color: T.inkSoft,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {perfil.email}
                </p>
              </div>
            </div>

            {/* Stats inline — números fuertes, texto ligero */}
            <p style={{ margin: "16px 0 0", fontSize: 12, color: T.inkSoft, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: T.ink, fontWeight: 700 }}>{ordenesCount ?? "—"}</span> pedido{ordenesCount !== 1 ? "s" : ""}
              <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
              <span style={{ color: T.ink, fontWeight: 700 }}>{favsTotal}</span> favorito{favsTotal !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Divisor */}
          <div style={{ height: 1, background: T.border, margin: "0 24px" }} />

          {/* Nav agrupado — estructura editorial con micro-labels */}
          <nav className="vp-side-nav" style={{ display: "flex", flexDirection: "column", padding: "8px 0 24px", flex: 1, gap: 0 }}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label} style={{ marginTop: gi === 0 ? 16 : 24 }}>
                <p style={{
                  margin: "0 0 8px",
                  padding: "0 24px",
                  fontSize: 10.5, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  color: T.textTer,
                }}>
                  {group.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {group.items.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`vp-nav${tab === t.id ? " active" : ""}`}>
                      <FontAwesomeIcon icon={t.icon} className="vp-nav-ico" style={{ fontSize: 12 }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Divisor */}
          <div style={{ height: 1, background: T.border, margin: "0 24px" }} />

          {/* Bottom CTAs — Inicio notable + tienda + logout */}
          <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 9 }}>
            <Link to="/" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 16px", borderRadius: 12,
              background: T.surface, border: `1px solid ${T.border}`,
              color: T.ink, textDecoration: "none",
              fontSize: 13, fontWeight: 600,
              transition: `border-color 150ms ease, color 150ms ease, background 150ms ease`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.navy; e.currentTarget.style.color = T.navy; e.currentTarget.style.background = T.brandSoft; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.ink; e.currentTarget.style.background = T.surface; }}>
              <FontAwesomeIcon icon={faHouse} style={{ fontSize: 12 }} />
              Volver al inicio
            </Link>
            <Link to="/tienda" className="vp-btn primary" style={{ textDecoration: "none" }}>
              <FontAwesomeIcon icon={faStore} style={{ fontSize: 11 }} /> Ir a la tienda
            </Link>
            <button
              onClick={() => { logout(); navigate("/"); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "6px 10px", background: "transparent", border: "none",
                color: T.inkSoft, fontSize: 12, fontWeight: 500, cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 130ms ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = T.danger; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.inkSoft; }}>
              <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 10 }} /> Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────────── */}
        <main className="vp-main">
          <div style={{ maxWidth: 660, margin: "0 auto", padding: "48px 40px 64px" }}>

            {/* Cabecera — eyebrow + título, mismo lenguaje que la landing */}
            <div style={{ marginBottom: 28 }} key={`h-${tab}`}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 11, fontWeight: 700,
                color: T.navy, letterSpacing: "0.18em", textTransform: "uppercase",
                marginBottom: 14,
              }}>
                <span style={{ width: 20, height: 1, background: T.navy }} />
                Mi cuenta
              </div>
              <h1 style={{
                margin: 0, fontSize: 32, fontWeight: 700, color: T.ink,
                fontFamily: "'General Sans', system-ui, sans-serif",
                letterSpacing: "-0.025em", lineHeight: 1.05,
              }}>
                {META[tab]?.titulo}
              </h1>
              <p style={{ margin: "10px 0 0", fontSize: 14.5, color: T.inkSoft, lineHeight: 1.55, maxWidth: 480 }}>
                {META[tab]?.sub}
              </p>
            </div>

            {/* Contenido del tab */}
            <div key={tab} style={{ animation: `fadeUp 220ms ${EASE}` }}>
              {tab === "datos"       && <DatosPersonales  usuario={perfil} onActualizado={cargar} />}
              {tab === "favoritos"   && <MisFavoritos />}
              {tab === "pedidos"     && <MisPedidosMini />}
              {tab === "direcciones" && <MisDirecciones />}
              {tab === "facturacion" && <DatosFacturacion usuario={perfil} onActualizado={cargar} />}
              {tab === "email"       && <CambiarEmail     usuario={perfil} />}
              {tab === "password"    && <CambiarPassword />}
            </div>

          </div>
        </main>

      </div>
    </>
  );
}
