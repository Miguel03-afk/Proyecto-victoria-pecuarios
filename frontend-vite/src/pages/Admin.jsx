
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import api from "../services/api";
import Objetivos from "../components/Objetivos.jsx";
import { useAuth } from "../context/AuthContext";


// ─── Helpers ─────────────────────────────────────────────────
const fmt  = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;
const fdoc = (d) => new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" });

const ESTADO_BADGE = {
  pendiente:  "bg-yellow-100 text-yellow-700",
  pagada:     "bg-blue-100 text-blue-700",
  procesando: "bg-purple-100 text-purple-700",
  enviada:    "bg-indigo-100 text-indigo-700",
  entregada:  "bg-green-100 text-green-700",
  cancelada:  "bg-red-100 text-red-700",
};
const ESTADOS = ["pendiente","pagada","procesando","enviada","entregada","cancelada"];

const Badge = ({ v }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ESTADO_BADGE[v]||"bg-gray-100 text-gray-600"}`}>{v}</span>
);

// ─── Componentes reutilizables ────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>{children}</div>
);

const StatCard = ({ icono, titulo, valor, sub, color }) => {
  const colors = { green:"bg-green-100", blue:"bg-blue-100", amber:"bg-amber-100", red:"bg-red-100" };
  return (
    <Card className="p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${colors[color]||colors.green} flex items-center justify-center text-xl flex-shrink-0`}>
        {icono}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{titulo}</p>
        <p className="text-lg font-bold text-gray-800 truncate">{valor}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </Card>
  );
};

const Input = ({ label, value, onChange, type="text", placeholder="" }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 focus:bg-white transition-all" />
  </div>
);

const Btn = ({ onClick, children, color="green", size="sm", disabled=false, type="button" }) => {
  const colors = {
    green: "bg-green-600 hover:bg-green-700 text-white",
    red:   "bg-red-500 hover:bg-red-600 text-white",
    gray:  "bg-gray-100 hover:bg-gray-200 text-gray-700",
    outline: "border border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-700",
  };
  const sizes = { xs:"px-2.5 py-1 text-xs", sm:"px-3.5 py-2 text-xs", md:"px-4 py-2.5 text-sm" };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${colors[color]} ${sizes[size]} rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
};

const Paginacion = ({ pagina, total, limite, onChange }) => {
  const tot = Math.ceil(total / limite);
  if (tot <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-2">
      <span className="text-xs text-gray-400">{total} registros · pág. {pagina}/{tot}</span>
      <div className="flex gap-1.5">
        <Btn color="outline" size="xs" disabled={pagina===1} onClick={()=>onChange(pagina-1)}>← Ant.</Btn>
        <Btn color="outline" size="xs" disabled={pagina===tot} onClick={()=>onChange(pagina+1)}>Sig. →</Btn>
      </div>
    </div>
  );
};

const THead = ({ cols }) => (
  <thead>
    <tr className="border-b border-gray-100">
      {cols.map(c => (
        <th key={c} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
          {c}
        </th>
      ))}
    </tr>
  </thead>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── Modal genérico ───────────────────────────────────────────
const Modal = ({ abierto, onClose, titulo, children, ancho="max-w-lg" }) => {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full ${ancho} max-h-[90vh] overflow-y-auto shadow-xl`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-gray-800">{titulo}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── SECCIÓN: Dashboard ───────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner />;
  if (!stats) return null;

  const chartData = stats.ventas_mes?.map(m => ({
    mes: m.mes?.slice(5),
    ventas: Number(m.total),
    ordenes: Number(m.ordenes),
  })) || [];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <StatCard icono="👥" titulo="Clientes" valor={stats.total_usuarios} color="green" />
        <StatCard icono="📦" titulo="Productos" valor={stats.total_productos} color="blue" />
        <StatCard icono="🛒" titulo="Órdenes" valor={stats.total_ordenes} color="green" />
        <StatCard icono="💰" titulo="Ingresos" valor={fmt(stats.ingresos)} color="blue" />
        <StatCard icono="⚠️" titulo="Stock bajo" valor={stats.stock_bajo} sub="productos" color="red" />
      </div>

      {/* Gráfica */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Ventas últimos 6 meses</h3>
        {chartData.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Sin datos de ventas aún</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} labelStyle={{ fontSize:12 }} contentStyle={{ borderRadius:12, border:"1px solid #e5e7eb", fontSize:12 }} />
              <Area type="monotone" dataKey="ventas" stroke="#16a34a" strokeWidth={2} fill="url(#gv)" name="Ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Órdenes recientes */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Órdenes recientes</h3>
          {stats.ordenes_recientes?.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">Sin órdenes aún</p>
            : <div className="space-y-2">
                {stats.ordenes_recientes?.map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-mono text-green-700">{o.codigo}</p>
                      <p className="text-xs text-gray-500">{o.cliente}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">{fmt(o.total)}</p>
                      <Badge v={o.estado} />
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>

        {/* Stock bajo */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">⚠️ Productos con stock bajo</h3>
          {stats.productos_stock_bajo?.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">Todo el stock está bien</p>
            : <div className="space-y-2">
                {stats.productos_stock_bajo?.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <p className="text-xs font-medium text-gray-700 line-clamp-1 flex-1">{p.nombre}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-red-600 font-bold">{p.stock} uds.</span>
                      <span className="text-xs text-gray-400">/ mín {p.stock_minimo}</span>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>
      </div>
    </div>
  );
}

// ─── SECCIÓN: Usuarios ────────────────────────────────────────
function Usuarios() {
  const [lista, setLista]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [pagina, setPagina]       = useState(1);
  const [buscar, setBuscar]       = useState("");
  const [cargando, setCargando]   = useState(true);
  const [detalle, setDetalle]     = useState(null);
  const [editando, setEditando]   = useState(null);
  const [formEdit, setFormEdit]   = useState({});
  const [modalPwd, setModalPwd]   = useState(null);
  const [nuevaPwd, setNuevaPwd]   = useState("");
  const [msg, setMsg]             = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await api.get(`/admin/usuarios?pagina=${pagina}&buscar=${buscar}&limite=12`);
      setLista(data.usuarios); setTotal(data.total);
    } finally { setCargando(false); }
  }, [pagina, buscar]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirDetalle = async (id) => {
    const { data } = await api.get(`/admin/usuarios/${id}`);
    setDetalle(data);
  };

  const abrirEditar = (u) => {
    setFormEdit({ nombre: u.nombre, apellido: u.apellido, email: u.email,
      telefono: u.telefono||"", tipo_documento: u.tipo_documento,
      numero_documento: u.numero_documento||"", rol: u.rol });
    setEditando(u);
  };

  const guardarEditar = async () => {
    await api.put(`/admin/usuarios/${editando.id}`, formEdit);
    setMsg("Usuario actualizado correctamente.");
    setEditando(null);
    cargar();
    setTimeout(() => setMsg(""), 3000);
  };

  const cambiarPassword = async () => {
    if (nuevaPwd.length < 6) return;
    await api.patch(`/admin/usuarios/${modalPwd.id}/password`, { nueva_password: nuevaPwd });
    setMsg("Contraseña actualizada."); setModalPwd(null); setNuevaPwd("");
    setTimeout(() => setMsg(""), 3000);
  };

  const toggleActivo = async (u) => {
    await api.put(`/admin/usuarios/${u.id}`, { activo: u.activo ? 0 : 1 });
    cargar();
  };

  const fe = (k) => (e) => setFormEdit({ ...formEdit, [k]: e.target.value });

  return (
    <div className="space-y-4">
      {msg && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{msg}</div>
      )}

      <div className="flex gap-3 items-center justify-between">
        <input value={buscar} placeholder="Buscar nombre, email, documento..."
          onChange={e => { setBuscar(e.target.value); setPagina(1); }}
          className="flex-1 max-w-sm px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        <span className="text-xs text-gray-400 flex-shrink-0">{total} usuarios</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Usuario","Documento","Email","Teléfono","Rol","Estado","Acciones"]} />
            <tbody>
              {cargando
                ? <tr><td colSpan={7}><Spinner /></td></tr>
                : lista.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Sin usuarios</td></tr>
                : lista.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{u.nombre} {u.apellido}</p>
                          <p className="text-xs text-gray-400">ID #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{u.tipo_documento} {u.numero_documento||"—"}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{u.email}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{u.telefono||"—"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${u.rol==="superadmin"?"bg-purple-100 text-purple-700":
                          u.rol==="admin"?"bg-blue-100 text-blue-700":
                          "bg-gray-100 text-gray-600"}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActivo(u)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors
                          ${u.activo?"bg-green-100 text-green-700 hover:bg-green-200":"bg-red-100 text-red-600 hover:bg-red-200"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => abrirDetalle(u.id)}
                          className="text-xs text-green-600 hover:text-green-800 font-medium">Ver</button>
                        <button onClick={() => abrirEditar(u)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                        <button onClick={() => setModalPwd(u)}
                          className="text-xs text-amber-600 hover:text-amber-800 font-medium">Pwd</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina} />
        </div>
      </Card>

      {/* Modal detalle */}
      <Modal abierto={!!detalle} onClose={() => setDetalle(null)}
        titulo={detalle ? `${detalle.nombre} ${detalle.apellido}` : ""} ancho="max-w-xl">
        {detalle && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Email", detalle.email],
                ["Teléfono", detalle.telefono||"—"],
                ["Documento", `${detalle.tipo_documento} ${detalle.numero_documento||"—"}`],
                ["Rol", detalle.rol],
                ["Estado", detalle.activo ? "Activo" : "Inactivo"],
                ["Registrado", fdoc(detalle.created_at)],
                ["Total gastado", fmt(detalle.total_gastado)],
                ["Órdenes", detalle.ordenes?.length || 0],
              ].map(([k,v]) => (
                <div key={k} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3">Historial de órdenes</h4>
              {detalle.ordenes?.length === 0
                ? <p className="text-xs text-gray-400 text-center py-4">Sin órdenes</p>
                : <div className="space-y-2 max-h-56 overflow-y-auto">
                    {detalle.ordenes.map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                        <div>
                          <p className="font-mono text-xs text-green-700">{o.codigo}</p>
                          <p className="text-xs text-gray-400">{o.items} productos · {fdoc(o.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{fmt(o.total)}</p>
                          <Badge v={o.estado} />
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}
      </Modal>

      {/* Modal editar */}
      <Modal abierto={!!editando} onClose={() => setEditando(null)} titulo="Editar usuario">
        {editando && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre" value={formEdit.nombre} onChange={fe("nombre")} />
              <Input label="Apellido" value={formEdit.apellido} onChange={fe("apellido")} />
            </div>
            <Input label="Email" type="email" value={formEdit.email} onChange={fe("email")} />
            <Input label="Teléfono" value={formEdit.telefono} onChange={fe("telefono")} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo doc.</label>
                <select value={formEdit.tipo_documento} onChange={fe("tipo_documento")}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
                  {["CC","TI","CE","PASAPORTE"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Input label="Nº documento" value={formEdit.numero_documento} onChange={fe("numero_documento")} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Rol</label>
              <select value={formEdit.rol} onChange={fe("rol")}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn color="gray" onClick={() => setEditando(null)}>Cancelar</Btn>
              <Btn onClick={guardarEditar}>Guardar cambios</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal contraseña */}
      <Modal abierto={!!modalPwd} onClose={() => { setModalPwd(null); setNuevaPwd(""); }}
        titulo={`Cambiar contraseña — ${modalPwd?.nombre||""}`}>
        <div className="space-y-3">
          <Input label="Nueva contraseña" type="password" value={nuevaPwd}
            onChange={e => setNuevaPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
          <div className="flex justify-end gap-2 pt-1">
            <Btn color="gray" onClick={() => { setModalPwd(null); setNuevaPwd(""); }}>Cancelar</Btn>
            <Btn onClick={cambiarPassword} disabled={nuevaPwd.length < 6}>Actualizar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── SECCIÓN: Productos ───────────────────────────────────────
function Productos() {
  const [lista, setLista]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pagina, setPagina]     = useState(1);
  const [buscar, setBuscar]     = useState("");
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [formP, setFormP]       = useState({});
  const [msg, setMsg]           = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await api.get(`/admin/productos?pagina=${pagina}&buscar=${buscar}&limite=12`);
      setLista(data.productos); setTotal(data.total);
    } finally { setCargando(false); }
  }, [pagina, buscar]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirEditar = (p) => {
    setFormP({ nombre: p.nombre, precio: p.precio, precio_antes: p.precio_antes||"",
      stock: p.stock, imagen_url: p.imagen_url||"", destacado: p.destacado, activo: p.activo });
    setEditando(p);
  };

  const guardar = async () => {
    await api.put(`/productos/${editando.id}`, {
      ...formP,
      precio: Number(formP.precio),
      precio_antes: formP.precio_antes ? Number(formP.precio_antes) : null,
      stock: Number(formP.stock),
    });
    setMsg("Producto actualizado."); setEditando(null); cargar();
    setTimeout(() => setMsg(""), 3000);
  };

  const fp = (k) => (e) => setFormP({ ...formP, [k]: e.target.value });

  return (
    <div className="space-y-4">
      {msg && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{msg}</div>}

      <div className="flex gap-3 items-center">
        <input value={buscar} placeholder="Buscar producto..."
          onChange={e => { setBuscar(e.target.value); setPagina(1); }}
          className="flex-1 max-w-sm px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        <span className="text-xs text-gray-400">{total} productos</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Producto","Categoría","Precio","Stock","Estado","Destacado","Acciones"]} />
            <tbody>
              {cargando
                ? <tr><td colSpan={7}><Spinner /></td></tr>
                : lista.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={p.imagen_url||"https://placehold.co/36x36/e8f5e9/2e7d32?text=P"}
                          className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                          onError={e => { e.target.src="https://placehold.co/36x36/e8f5e9/2e7d32?text=P"; }} />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[160px]">{p.nombre}</p>
                          <p className="text-xs text-gray-400">{p.marca||""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{p.categoria}</td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-bold text-green-700">{fmt(p.precio)}</p>
                      {p.precio_antes && <p className="text-xs text-gray-400 line-through">{fmt(p.precio_antes)}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold ${p.stock <= p.stock_minimo ? "text-red-600":"text-gray-700"}`}>
                        {p.stock} {p.stock <= p.stock_minimo && "⚠️"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.activo?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                        {p.activo ? "Activo":"Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs ${p.destacado?"text-yellow-600 font-semibold":"text-gray-300"}`}>
                        {p.destacado ? "★ Sí":"—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => abrirEditar(p)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium">Editar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina} />
        </div>
      </Card>

      {/* Modal editar producto */}
      <Modal abierto={!!editando} onClose={() => setEditando(null)} titulo={`Editar: ${editando?.nombre||""}`}>
        <div className="space-y-3">
          <Input label="Nombre" value={formP.nombre||""} onChange={fp("nombre")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Precio actual" type="number" value={formP.precio||""} onChange={fp("precio")} />
            <Input label="Precio antes (tachado)" type="number" value={formP.precio_antes||""} onChange={fp("precio_antes")} placeholder="Opcional" />
          </div>
          <Input label="Stock" type="number" value={formP.stock||""} onChange={fp("stock")} />
          <Input label="URL imagen" value={formP.imagen_url||""} onChange={fp("imagen_url")} placeholder="/imagenes/producto.jpg" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={!!formP.activo}
                onChange={e => setFormP({...formP, activo: e.target.checked ? 1 : 0})}
                className="rounded" />
              Activo
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={!!formP.destacado}
                onChange={e => setFormP({...formP, destacado: e.target.checked ? 1 : 0})}
                className="rounded" />
              Destacado ★
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="gray" onClick={() => setEditando(null)}>Cancelar</Btn>
            <Btn onClick={guardar}>Guardar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── SECCIÓN: Órdenes ─────────────────────────────────────────
function Ordenes() {
  const [lista, setLista]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [pagina, setPagina]       = useState(1);
  const [filtroEstado, setFiltro] = useState("");
  const [cargando, setCargando]   = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await api.get(`/admin/ordenes?pagina=${pagina}&estado=${filtroEstado}&limite=12`);
      setLista(data.ordenes); setTotal(data.total);
    } finally { setCargando(false); }
  }, [pagina, filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/admin/ordenes/${id}/estado`, { estado });
    cargar();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <select value={filtroEstado} onChange={e => { setFiltro(e.target.value); setPagina(1); }}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e} className="capitalize">{e}</option>)}
        </select>
        <span className="text-xs text-gray-400">{total} órdenes</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Código","Cliente","Total","Método","Estado","Fecha","Cambiar"]} />
            <tbody>
              {cargando
                ? <tr><td colSpan={7}><Spinner /></td></tr>
                : lista.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Sin órdenes</td></tr>
                : lista.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-green-700 font-semibold">{o.codigo}</td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-medium text-gray-800">{o.cliente}</p>
                      <p className="text-xs text-gray-400">{o.email}</p>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold">{fmt(o.total)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 capitalize">{o.metodo_pago||"—"}</td>
                    <td className="py-3 px-4"><Badge v={o.estado} /></td>
                    <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{fdoc(o.created_at)}</td>
                    <td className="py-3 px-4">
                      <select value={o.estado} onChange={e => cambiarEstado(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white capitalize">
                        {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina} />
        </div>
      </Card>
    </div>
  );
}

// ─── SECCIÓN: Factura manual ──────────────────────────────────
function Factura() {
  const [usuarios, setUsuarios]   = useState([]);
  const [productos, setProductos] = useState([]);
  const [buscarU, setBuscarU]     = useState("");
  const [usuarioSel, setUsuarioSel] = useState(null);
  const [items, setItems]         = useState([{ producto_id:"", cantidad:1 }]);
  const [metodo, setMetodo]       = useState("efectivo");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad]       = useState("");
  const [notas, setNotas]         = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError]         = useState("");
  const [cargando, setCargando]   = useState(false);

  useEffect(() => {
    api.get("/admin/usuarios?limite=100").then(({ data }) => setUsuarios(data.usuarios));
    api.get("/admin/productos?limite=100").then(({ data }) => setProductos(data.productos));
  }, []);

  const usuariosFiltrados = usuarios.filter(u =>
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(buscarU.toLowerCase())
  );

  const addItem  = () => setItems([...items, { producto_id:"", cantidad:1 }]);
  const remItem  = (i) => setItems(items.filter((_,idx) => idx !== i));
  const setItem  = (i, k, v) => setItems(items.map((it,idx) => idx===i ? {...it,[k]:v} : it));

  const total = items.reduce((acc, it) => {
    const p = productos.find(p => p.id == it.producto_id);
    return acc + (p ? p.precio * it.cantidad : 0);
  }, 0);

  const enviar = async () => {
    setError(""); setResultado(null);
    if (!usuarioSel) return setError("Selecciona un cliente.");
    if (items.some(i => !i.producto_id)) return setError("Selecciona producto en cada fila.");
    setCargando(true);
    try {
      const { data } = await api.post("/admin/facturas", {
        usuario_id: usuarioSel.id, items, metodo_pago: metodo,
        direccion_entrega: direccion||undefined,
        ciudad_entrega: ciudad||undefined,
        notas: notas||undefined,
      });
      setResultado(data);
      setItems([{ producto_id:"", cantidad:1 }]);
      setUsuarioSel(null); setBuscarU("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear factura.");
    } finally { setCargando(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      {resultado && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          ✅ Factura creada: <strong>{resultado.codigo}</strong>
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Cliente */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3">1. Seleccionar cliente</h4>
        <input value={buscarU} onChange={e => setBuscarU(e.target.value)}
          placeholder="Buscar cliente por nombre o email..."
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-2" />
        {usuarioSel
          ? <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold text-green-800">{usuarioSel.nombre} {usuarioSel.apellido}</p>
                <p className="text-xs text-green-600">{usuarioSel.email}</p>
              </div>
              <button onClick={() => { setUsuarioSel(null); setBuscarU(""); }}
                className="text-xs text-red-500 hover:text-red-700">Cambiar</button>
            </div>
          : buscarU && (
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
              {usuariosFiltrados.slice(0,8).map(u => (
                <button key={u.id} onClick={() => { setUsuarioSel(u); setBuscarU(""); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0">
                  <p className="text-xs font-medium text-gray-800">{u.nombre} {u.apellido}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </button>
              ))}
            </div>
          )
        }
      </Card>

      {/* Productos */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3">2. Productos</h4>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select value={it.producto_id} onChange={e => setItem(i,"producto_id",e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                <option value="">Selecciona producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — {fmt(p.precio)}</option>
                ))}
              </select>
              <input type="number" min={1} value={it.cantidad}
                onChange={e => setItem(i,"cantidad",Number(e.target.value))}
                className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-xs text-center focus:outline-none focus:ring-2 focus:ring-green-400" />
              <button onClick={() => remItem(i)} className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-3 text-xs text-green-600 hover:text-green-800 font-semibold">+ Agregar producto</button>
        {total > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-lg font-bold text-green-700">{fmt(total)}</span>
          </div>
        )}
      </Card>

      {/* Pago y entrega */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3">3. Pago y entrega</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Método de pago</label>
            <select value={metodo} onChange={e => setMetodo(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
              {["efectivo","tarjeta","transferencia","pse","contraentrega"].map(m => (
                <option key={m} value={m} className="capitalize">{m}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Dirección entrega" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Opcional" />
            <Input label="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Opcional" />
          </div>
          <Input label="Notas" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones..." />
        </div>
      </Card>

      <Btn size="md" onClick={enviar} disabled={cargando}>
        {cargando ? "Creando factura..." : "✓ Crear factura"}
      </Btn>
    </div>
  );
}

// ─── Layout principal del panel ───────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard",  icono:"▦" },
  { id:"usuarios",  label:"Usuarios",   icono:"👥" },
  { id:"productos", label:"Productos",  icono:"📦" },
  { id:"ordenes",   label:"Órdenes",    icono:"🛒" },
  { id:"factura",   label:"Nueva venta",icono:"🧾" },
  { id:"objetivos", label:"Objetivos",  icono:"🎯" },
];

export default function Admin() {
  const { usuario, esAdmin } = useAuth();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("dashboard");
  const [sidebar, setSidebar] = useState(true);

  useEffect(() => {
    if (!esAdmin) navigate("/");
  }, [esAdmin, navigate]);

  const renderSeccion = () => {
    if (seccion === "dashboard") return <Dashboard />;
    if (seccion === "usuarios")  return <Usuarios />;
    if (seccion === "productos") return <Productos />;
    if (seccion === "ordenes")   return <Ordenes />;
    if (seccion === "factura")   return <Factura />;
    if (seccion === "objetivos") return <Objetivos />;
  };

  const titulos = { dashboard:"Dashboard", usuarios:"Gestión de usuarios",
    productos:"Gestión de productos", ordenes:"Órdenes", factura:"Nueva venta / Factura", objetivos:"Objetivos y metas" };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className={`${sidebar?"w-52":"w-14"} bg-white border-r border-gray-100 flex flex-col flex-shrink-0 transition-all duration-200`}>
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          {sidebar && (
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <span className="text-xs font-bold text-green-800 truncate">Victoria Pecuarios</span>
            </Link>
          )}
          <button onClick={() => setSidebar(!sidebar)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0 ml-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {sidebar && usuario && (
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-2.5 py-2">
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {usuario.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{usuario.nombre}</p>
                <p className="text-xs text-green-600 capitalize">{usuario.rol}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(s => (
            <button key={s.id} onClick={() => setSeccion(s.id)}
              title={!sidebar ? s.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all
                ${seccion===s.id
                  ? "bg-green-600 text-white font-semibold"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-800"}`}>
              <span className="text-base flex-shrink-0">{s.icono}</span>
              {sidebar && <span className="text-xs truncate">{s.label}</span>}
            </button>
          ))}
        </nav>

        {sidebar && (
          <div className="p-3 border-t border-gray-100">
            <Link to="/" className="flex items-center gap-2 px-2.5 py-2 text-xs text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors">
              ← Volver a la tienda
            </Link>
          </div>
        )}
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-800">{titulos[seccion]}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("es-CO", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {renderSeccion()}
        </div>
      </main>
    </div>
  );
}