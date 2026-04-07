// src/pages/Perfil.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(n) || 0);
const fdoc = (d) =>
  d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) : "—";

// Calcular edad
const calcEdad = (fechaNac) => {
  if (!fechaNac) return null;
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const ESTADO_COLOR = {
  pendiente:  { bg: "#fef3c7", text: "#92400e" },
  pagada:     { bg: "#dbeafe", text: "#1e40af" },
  procesando: { bg: "#f3e8ff", text: "#6b21a8" },
  enviada:    { bg: "#e0e7ff", text: "#3730a3" },
  entregada:  { bg: "#dcfce7", text: "#14532d" },
  cancelada:  { bg: "#fee2e2", text: "#7f1d1d" },
};

const BadgeEstado = ({ estado }) => {
  const s = ESTADO_COLOR[estado] || { bg: "#f0fdf4", text: "#166534" };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.text }}>
      {estado}
    </span>
  );
};

const Campo = ({ label, value, onChange, type = "text", disabled = false, hint }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#788078" }}>
      {label}
    </label>
    <input
      type={type} value={value} onChange={onChange} disabled={disabled}
      className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all"
      style={{
        border: `1.5px solid ${disabled ? "#e6f3e6" : "#b4d9b4"}`,
        background: disabled ? "#f6f7f4" : "#fff",
        color: disabled ? "#a8b2a8" : "#191c18",
        cursor: disabled ? "not-allowed" : "text",
      }}
      onFocus={e => { if (!disabled) { e.target.style.borderColor = "#1a5c1a"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,26,0.08)"; } }}
      onBlur={e => { e.target.style.borderColor = disabled ? "#e6f3e6" : "#b4d9b4"; e.target.style.boxShadow = "none"; }}
    />
    {hint && <p className="text-xs mt-1" style={{ color: "#a8b2a8" }}>{hint}</p>}
  </div>
);

const Msg = ({ texto, tipo = "ok" }) => !texto ? null : (
  <div className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
    style={tipo === "ok"
      ? { background: "#dcfce7", color: "#14532d", border: "1px solid #86efac" }
      : { background: "#fee2e2", color: "#7f1d1d", border: "1px solid #fca5a5" }}>
    {tipo === "ok" ? "✓" : "✕"} {texto}
  </div>
);

// ── Sección: datos personales ─────────────────────────────────
function DatosPersonales({ usuario, onActualizado }) {
  const [form, setForm] = useState({
    nombre: usuario.nombre || "",
    apellido: usuario.apellido || "",
    telefono: usuario.telefono || "",
    tipo_documento: usuario.tipo_documento || "CC",
    numero_documento: usuario.numero_documento || "",
    fecha_nacimiento: usuario.fecha_nacimiento
      ? usuario.fecha_nacimiento.split("T")[0]
      : "",
  });
  const [msg, setMsg]         = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    setCargando(true);
    try {
      await api.put("/auth/perfil", {
        nombre:           form.nombre,
        apellido:         form.apellido,
        telefono:         form.telefono || undefined,
        tipo_documento:   form.tipo_documento,
        numero_documento: form.numero_documento || undefined,
        fecha_nacimiento: form.fecha_nacimiento || undefined,
      });
      setMsg({ texto: "Datos actualizados correctamente.", tipo: "ok" });
      onActualizado?.();
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al guardar.", tipo: "err" });
    } finally { setCargando(false); }
  };

  const edad = calcEdad(form.fecha_nacimiento);

  return (
    <div className="space-y-5">
      <Msg texto={msg.texto} tipo={msg.tipo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Nombre *" value={form.nombre} onChange={set("nombre")} />
        <Campo label="Apellido *" value={form.apellido} onChange={set("apellido")} />
      </div>

      {/* Email — no editable */}
      <Campo label="Correo electrónico" value={usuario.email} disabled
        hint="El correo no puede modificarse por seguridad" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Teléfono" type="tel" value={form.telefono} onChange={set("telefono")} />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#788078" }}>
            Fecha de nacimiento {edad !== null && <span style={{ color: "#1a5c1a" }}>({edad} años)</span>}
          </label>
          <input type="date" value={form.fecha_nacimiento} onChange={set("fecha_nacimiento")}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ border: "1.5px solid #b4d9b4", background: "#fff", color: "#191c18" }}
            onFocus={e => { e.target.style.borderColor = "#1a5c1a"; }}
            onBlur={e => { e.target.style.borderColor = "#b4d9b4"; }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#788078" }}>Tipo documento</label>
          <select value={form.tipo_documento} onChange={set("tipo_documento")}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
            style={{ border: "1.5px solid #b4d9b4", background: "#fff", color: "#191c18" }}>
            <option value="CC">Cédula de ciudadanía (C.C.)</option>
            <option value="TI">Tarjeta de identidad (T.I.)</option>
            <option value="CE">Cédula de extranjería (C.E.)</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>
        <Campo label="Número documento" value={form.numero_documento} onChange={set("numero_documento")} />
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={guardar} disabled={cargando}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "#1a5c1a" }}>
          {cargando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ── Sección: cambiar contraseña ───────────────────────────────
function CambiarPassword() {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [msg, setMsg]   = useState({});
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const guardar = async () => {
    if (form.nueva !== form.confirmar)
      return setMsg({ texto: "Las contraseñas no coinciden.", tipo: "err" });
    if (form.nueva.length < 6)
      return setMsg({ texto: "Mínimo 6 caracteres.", tipo: "err" });
    setCargando(true);
    try {
      await api.patch("/auth/cambiar-password", {
        password_actual: form.actual,
        nueva_password:  form.nueva,
      });
      setMsg({ texto: "Contraseña actualizada.", tipo: "ok" });
      setForm({ actual: "", nueva: "", confirmar: "" });
      setTimeout(() => setMsg({}), 3000);
    } catch (err) {
      setMsg({ texto: err.response?.data?.error || "Error al cambiar la contraseña.", tipo: "err" });
    } finally { setCargando(false); }
  };

  return (
    <div className="space-y-4 max-w-md">
      <Msg texto={msg.texto} tipo={msg.tipo} />
      <Campo label="Contraseña actual" type="password" value={form.actual} onChange={set("actual")} />
      <Campo label="Nueva contraseña" type="password" value={form.nueva} onChange={set("nueva")} hint="Mínimo 6 caracteres" />
      <Campo label="Confirmar nueva contraseña" type="password" value={form.confirmar} onChange={set("confirmar")} />
      <button onClick={guardar} disabled={cargando || !form.actual || !form.nueva}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
        style={{ background: "#1a5c1a" }}>
        {cargando ? "Actualizando..." : "Actualizar contraseña"}
      </button>
    </div>
  );
}

// ── Sección: mis órdenes ──────────────────────────────────────
function MisOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/auth/mis-ordenes")
      .then(({ data }) => setOrdenes(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#f2f3ef" }} />
      ))}
    </div>
  );

  if (!ordenes.length) return (
    <div className="text-center py-16 space-y-3">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto" style={{ background: "#f0fdf4" }}>📦</div>
      <p className="text-sm font-semibold" style={{ color: "#191c18" }}>Sin órdenes aún</p>
      <p className="text-xs" style={{ color: "#788078" }}>Tus compras aparecerán aquí</p>
      <Link to="/tienda"
        className="inline-block mt-2 px-5 py-2 rounded-xl text-sm font-bold text-white"
        style={{ background: "#1a5c1a" }}>
        Ir a la tienda
      </Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {ordenes.map(o => (
        <div key={o.id} className="rounded-2xl p-4 transition-all hover:shadow-md"
          style={{ background: "#fff", border: "1px solid #e6f3e6" }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold" style={{ color: "#1a5c1a", fontFamily: "monospace" }}>{o.codigo}</p>
              <p className="text-xs mt-0.5" style={{ color: "#788078" }}>{fdoc(o.created_at)} · {o.metodo_pago}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold" style={{ color: "#191c18" }}>{fmt(o.total)}</span>
              <BadgeEstado estado={o.estado} />
            </div>
          </div>
          {o.items > 0 && (
            <p className="text-xs mt-2" style={{ color: "#a8b2a8" }}>{o.items} producto(s)</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
const TABS = [
  { id: "datos",    label: "Mis datos",     icon: "👤" },
  { id: "seguridad",label: "Seguridad",     icon: "🔒" },
  { id: "ordenes",  label: "Mis órdenes",   icon: "📦" },
];

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate            = useNavigate();
  const [tab, setTab]       = useState("datos");
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    api.get("/auth/me")
      .then(({ data }) => setPerfil(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f7f4" }}>
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: "2px solid #e6f3e6", borderTopColor: "#1a5c1a" }} />
    </div>
  );

  if (!perfil) return null;

  const iniciales = `${perfil.nombre?.charAt(0) || ""}${perfil.apellido?.charAt(0) || ""}`.toUpperCase();
  const edad = calcEdad(perfil.fecha_nacimiento);

  return (
    <div className="min-h-screen" style={{ background: "#f6f7f4" }}>
      {/* Barra envío gratis */}
      <div className="bg-green-950 py-2">
        <p className="text-center text-xs font-semibold text-white/80">
          🚚 Envíos gratis a partir de <span className="text-lime-400 font-bold">$80.000</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header perfil */}
        <div className="rounded-3xl p-6 mb-6 flex items-center gap-5 flex-wrap"
          style={{ background: "linear-gradient(135deg, #0c180c, #1a5c1a)", boxShadow: "0 8px 32px rgba(26,92,26,0.2)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.2)" }}>
            {iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{perfil.nombre} {perfil.apellido}</h1>
            <p className="text-xs text-white/60 mt-0.5">{perfil.email}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
                style={{ background: "rgba(180,217,180,0.2)", color: "#c4dcc4" }}>
                {perfil.rol}
              </span>
              {edad !== null && (
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{edad} años</span>
              )}
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Miembro desde {fdoc(perfil.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/tienda"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{ background: "rgba(255,255,255,0.1)", color: "#c4dcc4", border: "1px solid rgba(255,255,255,0.15)" }}>
              🛒 Tienda
            </Link>
            <button onClick={() => { logout(); navigate("/"); }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={tab === t.id
                ? { background: "#1a5c1a", color: "#fff", boxShadow: "0 4px 12px rgba(26,92,26,0.25)" }
                : { background: "#fff", color: "#48524a", border: "1px solid #e6f3e6" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e6f3e6" }}>
          {tab === "datos" && (
            <>
              <h2 className="text-base font-bold mb-5" style={{ color: "#191c18", fontFamily: "'Playfair Display', Georgia, serif" }}>
                Información personal
              </h2>
              <DatosPersonales usuario={perfil} onActualizado={cargar} />
            </>
          )}
          {tab === "seguridad" && (
            <>
              <h2 className="text-base font-bold mb-1" style={{ color: "#191c18", fontFamily: "'Playfair Display', Georgia, serif" }}>
                Cambiar contraseña
              </h2>
              <p className="text-xs mb-5" style={{ color: "#788078" }}>
                Por seguridad, necesitamos tu contraseña actual para confirmar el cambio.
              </p>
              <CambiarPassword />
            </>
          )}
          {tab === "ordenes" && (
            <>
              <h2 className="text-base font-bold mb-5" style={{ color: "#191c18", fontFamily: "'Playfair Display', Georgia, serif" }}>
                Historial de compras
              </h2>
              <MisOrdenes />
            </>
          )}
        </div>
      </div>
    </div>
  );
}