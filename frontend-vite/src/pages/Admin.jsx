import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Objetivos from "../components/Objetivos.jsx";
import ReporteVentas from "./admin/ReporteVentas.jsx";
import ReporteSalidas from "./admin/ReporteSalidas.jsx";

// ─── Design tokens premium ───────────────────────────────────
const T = {
  sidebar: "#0f1f0f",
  sidebarBorder: "#1e3a1e",
  sidebarActive: "#1a3a1a",
  sidebarText: "#a3c4a3",
  sidebarActiveText: "#d4edda",
  gold: "#c9a84c",
  goldLight: "#e8c97a",
  goldBg: "#fdf8ee",
  surface: "#fafaf7",
  card: "#ffffff",
  border: "#e8e4d9",
  text: "#1a1a1a",
  textMuted: "#6b6b5a",
  green: "#1a5c1a",
  greenLight: "#e8f5e8",
  greenMid: "#2d7a2d",
};

// ─── Helpers ─────────────────────────────────────────────────
const fmt   = (n) => `$${Number(n||0).toLocaleString("es-CO")}`;
const fdoc  = (d) => new Date(d).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"});
const pct   = (r,m) => m>0 ? Math.min(Math.round((r/m)*100),100) : 0;

const ESTADO_BADGE = {
  pendiente:  "bg-amber-100 text-amber-800 border border-amber-200",
  pagada:     "bg-blue-100 text-blue-800 border border-blue-200",
  procesando: "bg-purple-100 text-purple-800 border border-purple-200",
  enviada:    "bg-indigo-100 text-indigo-800 border border-indigo-200",
  entregada:  "bg-emerald-100 text-emerald-800 border border-emerald-200",
  cancelada:  "bg-red-100 text-red-800 border border-red-200",
};
const ESTADOS = ["pendiente","pagada","procesando","enviada","entregada","cancelada"];

const Badge = ({ v }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ESTADO_BADGE[v]||"bg-gray-100 text-gray-600"}`}>{v}</span>
);

// ─── Componentes UI premium ───────────────────────────────────
const GoldDivider = () => (
  <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
);

const Card = ({ children, className="" }) => (
  <div className={`bg-white rounded-2xl border shadow-sm ${className}`} style={{ borderColor: T.border }}>
    {children}
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold" style={{ color: T.text, fontFamily:"Georgia, serif" }}>{children}</h2>
    {sub && <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{sub}</p>}
    <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: T.gold }} />
  </div>
);

const StatCard = ({ icono, titulo, valor, sub, trend }) => (
  <Card className="p-5 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: T.goldBg, border: `1px solid ${T.gold}33` }}>
        {icono}
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${Number(trend)>=0?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>
          {Number(trend)>=0?"▲":"▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold mb-0.5" style={{ color: T.text }}>{valor}</p>
    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textMuted }}>{titulo}</p>
    {sub && <p className="text-xs mt-1" style={{ color: T.textMuted }}>{sub}</p>}
  </Card>
);

const Btn = ({ onClick, children, variant="primary", size="sm", disabled=false, type="button" }) => {
  const variants = {
    primary:  `text-white font-semibold shadow-sm active:scale-95`,
    outline:  `font-semibold border active:scale-95`,
    ghost:    `font-medium`,
    danger:   `text-white font-semibold active:scale-95`,
  };
  const sizes = { xs:"px-3 py-1.5 text-xs rounded-lg", sm:"px-4 py-2 text-xs rounded-xl", md:"px-5 py-2.5 text-sm rounded-xl" };
  const styles = {
    primary: { background:`linear-gradient(135deg, ${T.green}, ${T.greenMid})`, color:"white" },
    outline: { borderColor: T.gold, color: T.gold, background:"transparent" },
    ghost:   { color: T.textMuted, background:"transparent" },
    danger:  { background:"#dc2626", color:"white" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed`}
      style={styles[variant]}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type="text", placeholder="", required=false }) => (
  <div>
    {label && <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.textMuted }}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-3.5 py-2.5 text-sm rounded-xl transition-all outline-none"
      style={{ border:`1.5px solid ${T.border}`, background:"#fafaf7", color: T.text }}
      onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.background = "#fff"; }}
      onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = "#fafaf7"; }} />
  </div>
);

const Select = ({ label, value, onChange, children }) => (
  <div>
    {label && <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: T.textMuted }}>{label}</label>}
    <select value={value} onChange={onChange}
      className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all"
      style={{ border:`1.5px solid ${T.border}`, background:"#fafaf7", color: T.text }}>
      {children}
    </select>
  </div>
);

const Modal = ({ abierto, onClose, titulo, children, ancho="max-w-lg" }) => {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}
      onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full ${ancho} max-h-[90vh] overflow-y-auto shadow-2xl`}
        style={{ border:`1px solid ${T.border}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white rounded-t-2xl"
          style={{ borderBottom:`1px solid ${T.border}` }}>
          <h3 className="font-bold text-base" style={{ color: T.text, fontFamily:"Georgia,serif" }}>{titulo}</h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-lg transition-colors"
            style={{ color: T.textMuted }}
            onMouseEnter={e => e.target.style.background="#f0f0eb"}
            onMouseLeave={e => e.target.style.background="transparent"}>×</button>
        </div>
        <GoldDivider />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Paginacion = ({ pagina, total, limite, onChange }) => {
  const tot = Math.ceil(total/limite);
  if (tot<=1) return null;
  return (
    <div className="flex items-center justify-between pt-4 mt-2" style={{ borderTop:`1px solid ${T.border}` }}>
      <span className="text-xs" style={{ color: T.textMuted }}>{total} registros · página {pagina} de {tot}</span>
      <div className="flex gap-1.5">
        <Btn variant="outline" size="xs" disabled={pagina===1} onClick={()=>onChange(pagina-1)}>←</Btn>
        <Btn variant="outline" size="xs" disabled={pagina===tot} onClick={()=>onChange(pagina+1)}>→</Btn>
      </div>
    </div>
  );
};

const THead = ({ cols }) => (
  <thead>
    <tr style={{ borderBottom:`2px solid ${T.border}`, background: T.surface }}>
      {cols.map(c => (
        <th key={c} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
          style={{ color: T.textMuted }}>
          {c}
        </th>
      ))}
    </tr>
  </thead>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: `${T.gold} transparent transparent transparent` }} />
  </div>
);

const Msg = ({ texto, tipo="ok" }) => !texto ? null : (
  <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
    tipo==="ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
               : "bg-red-50 text-red-700 border border-red-200"}`}>
    {tipo==="ok" ? "✓" : "✕"} {texto}
  </div>
);

// ─── SECCIÓN: Dashboard ───────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then(({data}) => setStats(data)).finally(()=>setCargando(false));
  },[]);

  if (cargando) return <Spinner />;
  if (!stats) return null;

  const chartData = stats.ventas_mes?.map(m=>({
    mes: m.mes?.slice(5),
    ventas: Number(m.total),
    ordenes: Number(m.ordenes),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard icono="👥" titulo="Clientes" valor={stats.total_usuarios} />
        <StatCard icono="📦" titulo="Productos" valor={stats.total_productos} />
        <StatCard icono="🛒" titulo="Órdenes" valor={stats.total_ordenes} />
        <StatCard icono="💰" titulo="Ingresos" valor={fmt(stats.ingresos)} />
        <StatCard icono="⚠️" titulo="Stock bajo" valor={stats.stock_bajo} sub="por reabastecer" />
      </div>

      <Card className="p-6">
        <SectionTitle sub="Ingresos de los últimos 6 meses">Tendencia de ventas</SectionTitle>
        {chartData.length===0
          ? <div className="text-center py-12 text-sm" style={{color:T.textMuted}}>Sin datos de ventas aún</div>
          : <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={T.green} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={T.green} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede4" />
                <XAxis dataKey="mes" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}
                  tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>fmt(v)}
                  contentStyle={{borderRadius:12,border:`1px solid ${T.border}`,fontSize:12,background:"#fff"}} />
                <Area type="monotone" dataKey="ventas" stroke={T.green} strokeWidth={2.5}
                  fill="url(#gv)" name="Ingresos" />
              </AreaChart>
            </ResponsiveContainer>
        }
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <SectionTitle>Órdenes recientes</SectionTitle>
          {!stats.ordenes_recientes?.length
            ? <p className="text-sm text-center py-8" style={{color:T.textMuted}}>Sin órdenes aún</p>
            : <div className="space-y-3">
                {stats.ordenes_recientes.map(o=>(
                  <div key={o.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                    style={{background:T.surface,border:`1px solid ${T.border}`}}>
                    <div>
                      <p className="text-xs font-bold font-mono" style={{color:T.green}}>{o.codigo}</p>
                      <p className="text-xs mt-0.5" style={{color:T.textMuted}}>{o.cliente}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold mb-1" style={{color:T.text}}>{fmt(o.total)}</p>
                      <Badge v={o.estado} />
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>

        <Card className="p-6">
          <SectionTitle>Stock crítico</SectionTitle>
          {!stats.productos_stock_bajo?.length
            ? <p className="text-sm text-center py-8" style={{color:T.textMuted}}>Todo el stock está bien ✓</p>
            : <div className="space-y-3">
                {stats.productos_stock_bajo.map(p=>(
                  <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                    style={{background:"#fff8f8",border:"1px solid #fee2e2"}}>
                    <p className="text-xs font-medium flex-1 line-clamp-1" style={{color:T.text}}>{p.nombre}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-red-600">{p.stock} uds.</span>
                      <span className="text-xs" style={{color:T.textMuted}}>mín {p.stock_minimo}</span>
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
  const [lista,setLista]       = useState([]);
  const [total,setTotal]       = useState(0);
  const [pagina,setPagina]     = useState(1);
  const [buscar,setBuscar]     = useState("");
  const [cargando,setCargando] = useState(true);
  const [detalle,setDetalle]   = useState(null);
  const [editando,setEditando] = useState(null);
  const [formEdit,setFormEdit] = useState({});
  const [modalPwd,setModalPwd] = useState(null);
  const [nuevaPwd,setNuevaPwd] = useState("");
  const [msg,setMsg]           = useState({});

  const cargar = useCallback(async()=>{
    setCargando(true);
    try{
      const {data} = await api.get(`/admin/usuarios?pagina=${pagina}&buscar=${buscar}&limite=12`);
      setLista(data.usuarios); setTotal(data.total);
    }finally{setCargando(false);}
  },[pagina,buscar]);

  useEffect(()=>{cargar();},[cargar]);

  const showMsg = (texto,tipo="ok") => { setMsg({texto,tipo}); setTimeout(()=>setMsg({}),3000); };

  const abrirDetalle = async(id)=>{
    const {data} = await api.get(`/admin/usuarios/${id}`);
    setDetalle(data);
  };

  const abrirEditar = (u)=>{
    setFormEdit({nombre:u.nombre,apellido:u.apellido,email:u.email,
      telefono:u.telefono||"",tipo_documento:u.tipo_documento,
      numero_documento:u.numero_documento||"",rol:u.rol});
    setEditando(u);
  };

  const guardarEditar = async()=>{
    await api.put(`/admin/usuarios/${editando.id}`,formEdit);
    showMsg("Usuario actualizado correctamente.");
    setEditando(null); cargar();
  };

  const cambiarPwd = async()=>{
    if(nuevaPwd.length<6) return;
    await api.patch(`/admin/usuarios/${modalPwd.id}/password`,{nueva_password:nuevaPwd});
    showMsg("Contraseña actualizada."); setModalPwd(null); setNuevaPwd("");
  };

  const toggleActivo = async(u)=>{
    await api.put(`/admin/usuarios/${u.id}`,{activo:u.activo?0:1}); cargar();
  };

  const fe = k => e => setFormEdit({...formEdit,[k]:e.target.value});

  return (
    <div className="space-y-5">
      <Msg texto={msg.texto} tipo={msg.tipo} />
      <div className="flex gap-3 items-center justify-between flex-wrap">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:T.textMuted}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={buscar} placeholder="Buscar nombre, email, documento..."
            onChange={e=>{setBuscar(e.target.value);setPagina(1);}}
            className="pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none w-72 transition-all"
            style={{border:`1.5px solid ${T.border}`,background:T.surface,color:T.text}} />
        </div>
        <span className="text-xs font-medium" style={{color:T.textMuted}}>{total} usuarios registrados</span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Usuario","Documento","Email","Teléfono","Rol","Estado","Acciones"]} />
            <tbody>
              {cargando
                ? <tr><td colSpan={7}><Spinner /></td></tr>
                : lista.length===0
                ? <tr><td colSpan={7} className="text-center py-16 text-sm" style={{color:T.textMuted}}>Sin usuarios</td></tr>
                : lista.map((u,i)=>(
                  <tr key={u.id}
                    className="transition-colors"
                    style={{borderBottom:`1px solid ${T.border}`, background: i%2===0?"#fff":T.surface}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.goldBg}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":T.surface}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{background:`linear-gradient(135deg,${T.green},${T.greenMid})`}}>
                          {u.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold" style={{color:T.text}}>{u.nombre} {u.apellido}</p>
                          <p className="text-xs" style={{color:T.textMuted}}>ID #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textMuted}}>{u.tipo_documento} {u.numero_documento||"—"}</td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textMuted}}>{u.email}</td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textMuted}}>{u.telefono||"—"}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${u.rol==="superadmin"?"bg-purple-100 text-purple-800 border border-purple-200":
                          u.rol==="admin"?"bg-blue-100 text-blue-800 border border-blue-200":
                          "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={()=>toggleActivo(u)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors
                          ${u.activo?"bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                   :"bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
                        {u.activo?"Activo":"Inactivo"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-2">
                        <button onClick={()=>abrirDetalle(u.id)} className="text-xs font-semibold transition-colors" style={{color:T.green}}>Ver</button>
                        <button onClick={()=>abrirEditar(u)} className="text-xs font-semibold text-blue-600">Editar</button>
                        <button onClick={()=>setModalPwd(u)} className="text-xs font-semibold" style={{color:T.gold}}>Pwd</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4">
          <Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina} />
        </div>
      </Card>

      {/* Modal detalle */}
      <Modal abierto={!!detalle} onClose={()=>setDetalle(null)}
        titulo={detalle?`${detalle.nombre} ${detalle.apellido}`:""} ancho="max-w-xl">
        {detalle && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Email",detalle.email],
                ["Teléfono",detalle.telefono||"—"],
                ["Documento",`${detalle.tipo_documento} ${detalle.numero_documento||"—"}`],
                ["Rol",detalle.rol],
                ["Estado",detalle.activo?"Activo":"Inactivo"],
                ["Registrado",fdoc(detalle.created_at)],
                ["Total gastado",fmt(detalle.total_gastado)],
                ["Órdenes",detalle.ordenes?.length||0],
              ].map(([k,v])=>(
                <div key={k} className="rounded-xl px-4 py-3" style={{background:T.surface,border:`1px solid ${T.border}`}}>
                  <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{color:T.textMuted}}>{k}</p>
                  <p className="text-sm font-bold capitalize" style={{color:T.text}}>{v}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{color:T.text,fontFamily:"Georgia,serif"}}>
                Historial de órdenes ({detalle.ordenes?.length||0})
              </h4>
              {!detalle.ordenes?.length
                ? <p className="text-xs text-center py-4" style={{color:T.textMuted}}>Sin órdenes</p>
                : <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {detalle.ordenes.map(o=>(
                      <div key={o.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{background:T.surface,border:`1px solid ${T.border}`}}>
                        <div>
                          <p className="font-mono text-xs font-bold" style={{color:T.green}}>{o.codigo}</p>
                          <p className="text-xs mt-0.5" style={{color:T.textMuted}}>{o.items} productos · {fdoc(o.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold mb-1" style={{color:T.text}}>{fmt(o.total)}</p>
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
      <Modal abierto={!!editando} onClose={()=>setEditando(null)} titulo="Editar usuario">
        {editando && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre" value={formEdit.nombre} onChange={fe("nombre")} />
              <Input label="Apellido" value={formEdit.apellido} onChange={fe("apellido")} />
            </div>
            <Input label="Email" type="email" value={formEdit.email} onChange={fe("email")} />
            <Input label="Teléfono" value={formEdit.telefono} onChange={fe("telefono")} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Tipo doc." value={formEdit.tipo_documento} onChange={fe("tipo_documento")}>
                {["CC","TI","CE","PASAPORTE"].map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
              <Input label="Número doc." value={formEdit.numero_documento} onChange={fe("numero_documento")} />
            </div>
            <Select label="Rol" value={formEdit.rol} onChange={fe("rol")}>
              <option value="cliente">Cliente</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" onClick={()=>setEditando(null)}>Cancelar</Btn>
              <Btn onClick={guardarEditar}>Guardar cambios</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal contraseña */}
      <Modal abierto={!!modalPwd} onClose={()=>{setModalPwd(null);setNuevaPwd("");}}
        titulo={`Cambiar contraseña — ${modalPwd?.nombre||""}`}>
        <div className="space-y-4">
          <Input label="Nueva contraseña" type="password" value={nuevaPwd}
            onChange={e=>setNuevaPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={()=>{setModalPwd(null);setNuevaPwd("");}}>Cancelar</Btn>
            <Btn onClick={cambiarPwd} disabled={nuevaPwd.length<6}>Actualizar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── SECCIÓN: Productos ───────────────────────────────────────
function Productos() {
  const [lista, setLista]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [pagina, setPagina]         = useState(1);
  const [buscar, setBuscar]         = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [cargando, setCargando]     = useState(true);
  const [modal, setModal]           = useState(false);
  const [editando, setEditando]     = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [msg, setMsg]               = useState({});

  const FORM_VACIO = {
    nombre:"", slug:"", descripcion:"", descripcion_corta:"", categoria_id:"",
    precio:"", precio_antes:"", stock:"", stock_minimo:"5", imagen_url:"",
    marca:"", unidad:"", especie:"", destacado:false, activo:true, requiere_formula:false
  };
  const [form, setForm] = useState(FORM_VACIO);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [rP, rC] = await Promise.all([
        api.get(`/admin/productos?pagina=${pagina}&buscar=${buscar}&limite=10&categoria_id=${categoriaFiltro}`),
        api.get("/categorias"),
      ]);
      setLista(rP.data.productos);
      setTotal(rP.data.total);
      setCategorias(rC.data);
    } finally {
      setCargando(false);
    }
  }, [pagina, buscar, categoriaFiltro]);

  useEffect(() => { cargar(); }, [cargar]);

  const showMsg = (texto, tipo="ok") => { setMsg({texto,tipo}); setTimeout(()=>setMsg({}),3000); };

  const abrirNuevo = () => { setForm(FORM_VACIO); setEditando(null); setModal(true); };

  const abrirEditar = (p) => {
    setForm({
      nombre:p.nombre, slug:p.slug||"", descripcion:p.descripcion||"",
      descripcion_corta:p.descripcion_corta||"", categoria_id:p.categoria_id||"",
      precio:p.precio, precio_antes:p.precio_antes||"", stock:p.stock,
      stock_minimo:p.stock_minimo||5, imagen_url:p.imagen_url||"",
      marca:p.marca||"", unidad:p.unidad||"", especie:p.especie||"",
      destacado:!!p.destacado, activo:p.activo!==0, requiere_formula:!!p.requiere_formula
    });
    setEditando(p); setModal(true);
  };

  const guardar = async () => {
    try {
      const payload = {};
      if (form.nombre)              payload.nombre = form.nombre;
      if (form.slug)                payload.slug = form.slug;
      if (form.descripcion)         payload.descripcion = form.descripcion;
      if (form.descripcion_corta)   payload.descripcion_corta = form.descripcion_corta;
      if (form.categoria_id)        payload.categoria_id = Number(form.categoria_id);
      if (form.precio !== "")       payload.precio = Number(form.precio);
      if (form.precio_antes !== "") payload.precio_antes = Number(form.precio_antes);
      if (form.stock !== "")        payload.stock = Number(form.stock);
      if (form.stock_minimo !== "") payload.stock_minimo = Number(form.stock_minimo);
      if (form.imagen_url)          payload.imagen_url = form.imagen_url;
      if (form.marca)               payload.marca = form.marca;
      if (form.unidad)              payload.unidad = form.unidad;
      if (form.especie)             payload.especie = form.especie;
      payload.destacado        = form.destacado ? 1 : 0;
      payload.activo           = form.activo ? 1 : 0;
      payload.requiere_formula = form.requiere_formula ? 1 : 0;
      if (!payload.slug && payload.nombre) {
        payload.slug = payload.nombre.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
          .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
      }
      if (editando) {
        await api.put(`/productos/${editando.id}`, payload);
        showMsg("Producto actualizado correctamente.");
      } else {
        await api.post("/productos", payload);
        showMsg("Producto creado correctamente.");
      }
      setModal(false); cargar();
    } catch(err) {
      showMsg(err.response?.data?.error || "Error al guardar.", "err");
    }
  };

  const toggleActivo = async (p) => {
    await api.put(`/productos/${p.id}`, {activo: p.activo ? 0 : 1}); cargar();
  };

  const ff = k => e => setForm({...form, [k]: e.target.value});
  const fc = k => e => setForm({...form, [k]: e.target.checked});

  return (
    <div className="space-y-5">
      <Msg texto={msg.texto} tipo={msg.tipo} />

      {/* Barra de filtros */}
      <div className="flex gap-3 items-center justify-between flex-wrap">
        <div className="flex gap-3 flex-wrap items-center">

          {/* Buscador */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{color:T.textMuted}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input value={buscar} placeholder="Buscar producto..."
              onChange={e => { setBuscar(e.target.value); setPagina(1); }}
              className="pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none w-56 transition-all"
              style={{border:`1.5px solid ${T.border}`, background:T.surface, color:T.text}} />
          </div>

          {/* Filtro por categoría */}
          <select value={categoriaFiltro}
            onChange={e => { setCategoriaFiltro(e.target.value); setPagina(1); }}
            className="px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{border:`1.5px solid ${T.border}`, background:T.surface, color:T.text}}>
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

        </div>
        <Btn onClick={abrirNuevo} size="md">+ Nuevo producto</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Producto","Categoría","Precio","Stock","Estado","Destacado","Acciones"]} />
            <tbody>
              {cargando
                ? <tr><td colSpan={7}><Spinner /></td></tr>
                : lista.map((p, i) => (
                  <tr key={p.id} className="transition-colors"
                    style={{borderBottom:`1px solid ${T.border}`, background:i%2===0?"#fff":T.surface}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.goldBg}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":T.surface}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imagen_url||"https://placehold.co/40x40/e8f5e8/1a5c1a?text=P"}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          style={{border:`1px solid ${T.border}`}}
                          onError={e=>{e.target.src="https://placehold.co/40x40/e8f5e8/1a5c1a?text=P";}} />
                        <div>
                          <p className="text-xs font-bold line-clamp-1 max-w-[160px]" style={{color:T.text}}>{p.nombre}</p>
                          <p className="text-xs mt-0.5" style={{color:T.textMuted}}>{p.marca||""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{color:T.textMuted}}>{p.categoria}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs font-bold" style={{color:T.green}}>{fmt(p.precio)}</p>
                      {p.precio_antes && <p className="text-xs line-through" style={{color:T.textMuted}}>{fmt(p.precio_antes)}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-bold ${p.stock<=p.stock_minimo?"text-red-600":"text-gray-700"}`}>
                        {p.stock} {p.stock<=p.stock_minimo&&"⚠️"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={()=>toggleActivo(p)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors
                          ${p.activo?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {p.activo?"Activo":"Inactivo"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span style={{color:p.destacado?T.gold:T.border}} className="text-lg">{p.destacado?"★":"☆"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={()=>abrirEditar(p)} className="text-xs font-semibold" style={{color:T.green}}>Editar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4">
          <Paginacion pagina={pagina} total={total} limite={10} onChange={p=>{setPagina(p);}} />
        </div>
      </Card>

      {/* Modal crear / editar — sin cambios */}
      <Modal abierto={modal} onClose={()=>setModal(false)}
        titulo={editando?"Editar producto":"Nuevo producto"} ancho="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Input label="Nombre del producto *" value={form.nombre} onChange={ff("nombre")} placeholder="ej: Antipulgas Frontline Combo" required /></div>
            <Input label="Slug URL" value={form.slug} onChange={ff("slug")} placeholder="auto-generado si está vacío" />
            <Input label="Marca" value={form.marca} onChange={ff("marca")} placeholder="ej: Frontline" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textMuted}}>Descripción corta</label>
            <textarea value={form.descripcion_corta} onChange={ff("descripcion_corta")} rows={2}
              placeholder="Resumen para la tarjeta de producto..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none transition-all"
              style={{border:`1.5px solid ${T.border}`, background:"#fafaf7", color:T.text}} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textMuted}}>Descripción completa</label>
            <textarea value={form.descripcion} onChange={ff("descripcion")} rows={3}
              placeholder="Descripción detallada del producto..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none resize-none transition-all"
              style={{border:`1.5px solid ${T.border}`, background:"#fafaf7", color:T.text}} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Categoría *" value={form.categoria_id} onChange={ff("categoria_id")}>
              <option value="">Selecciona categoría</option>
              {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Select>
            <Input label="Unidad" value={form.unidad} onChange={ff("unidad")} placeholder="ej: frasco, caja, bolsa" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Precio *" type="number" value={form.precio} onChange={ff("precio")} placeholder="0" required />
            <Input label="Precio antes (tachado)" type="number" value={form.precio_antes} onChange={ff("precio_antes")} placeholder="Opcional" />
            <Input label="Stock *" type="number" value={form.stock} onChange={ff("stock")} placeholder="0" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock mínimo (alerta)" type="number" value={form.stock_minimo} onChange={ff("stock_minimo")} placeholder="5" />
            <Input label="URL imagen" value={form.imagen_url} onChange={ff("imagen_url")} placeholder="/imagenes/producto.jpg" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:T.textMuted}}>Especie (separadas por coma)</label>
            <input value={form.especie} onChange={ff("especie")} placeholder="ej: perros,gatos"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none"
              style={{border:`1.5px solid ${T.border}`, background:"#fafaf7", color:T.text}} />
          </div>
          <div className="flex gap-6 pt-1">
            {[
              {key:"activo", label:"Producto activo"},
              {key:"destacado", label:"Destacado ★"},
              {key:"requiere_formula", label:"Requiere fórmula"},
            ].map(({key,label})=>(
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[key]} onChange={fc(key)} className="rounded accent-green-700" />
                <span className="text-sm" style={{color:T.text}}>{label}</span>
              </label>
            ))}
          </div>
          <GoldDivider />
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
            <Btn onClick={guardar} size="md">{editando?"Guardar cambios":"Crear producto"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── SECCIÓN: Órdenes ─────────────────────────────────────────
function Ordenes() {
  const [lista,setLista]       = useState([]);
  const [total,setTotal]       = useState(0);
  const [pagina,setPagina]     = useState(1);
  const [filtro,setFiltro]     = useState("");
  const [cargando,setCargando] = useState(true);

  const cargar = useCallback(async()=>{
    setCargando(true);
    try{
      const {data} = await api.get(`/admin/ordenes?pagina=${pagina}&estado=${filtro}&limite=12`);
      setLista(data.ordenes); setTotal(data.total);
    }finally{setCargando(false);}
  },[pagina,filtro]);

  useEffect(()=>{cargar();},[cargar]);

  const cambiarEstado = async(id,estado)=>{
    await api.patch(`/admin/ordenes/${id}/estado`,{estado}); cargar();
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-center flex-wrap">
        <Select value={filtro} onChange={e=>{setFiltro(e.target.value);setPagina(1);}}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e=><option key={e} value={e} className="capitalize">{e}</option>)}
        </Select>
        <span className="text-xs font-medium" style={{color:T.textMuted}}>{total} órdenes</span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Código","Cliente","Total","Método","Estado","Fecha","Cambiar estado"]} />
            <tbody>
              {cargando
                ? <tr><td colSpan={7}><Spinner /></td></tr>
                : lista.length===0
                ? <tr><td colSpan={7} className="text-center py-16 text-sm" style={{color:T.textMuted}}>Sin órdenes</td></tr>
                : lista.map((o,i)=>(
                  <tr key={o.id} className="transition-colors"
                    style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"#fff":T.surface}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.goldBg}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":T.surface}>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold" style={{color:T.green}}>{o.codigo}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs font-semibold" style={{color:T.text}}>{o.cliente}</p>
                      <p className="text-xs" style={{color:T.textMuted}}>{o.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold" style={{color:T.text}}>{fmt(o.total)}</td>
                    <td className="py-3.5 px-4 text-xs capitalize" style={{color:T.textMuted}}>{o.metodo_pago||"—"}</td>
                    <td className="py-3.5 px-4"><Badge v={o.estado} /></td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap" style={{color:T.textMuted}}>{fdoc(o.created_at)}</td>
                    <td className="py-3.5 px-4">
                      <select value={o.estado} onChange={e=>cambiarEstado(o.id,e.target.value)}
                        className="text-xs rounded-lg px-2.5 py-1.5 outline-none capitalize"
                        style={{border:`1.5px solid ${T.border}`,background:T.surface,color:T.text}}>
                        {ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4">
          <Paginacion pagina={pagina} total={total} limite={12} onChange={setPagina} />
        </div>
      </Card>
    </div>
  );
}

// ─── SECCIÓN: Factura manual ──────────────────────────────────
function Factura() {
  const [usuarios,setUsuarios]   = useState([]);
  const [productos,setProductos] = useState([]);
  const [buscarU,setBuscarU]     = useState("");
  const [usuarioSel,setUsuarioSel] = useState(null);
  const [items,setItems]         = useState([{producto_id:"",cantidad:1}]);
  const [metodo,setMetodo]       = useState("efectivo");
  const [direccion,setDireccion] = useState("");
  const [ciudad,setCiudad]       = useState("");
  const [notas,setNotas]         = useState("");
  const [resultado,setResultado] = useState(null);
  const [error,setError]         = useState("");
  const [cargando,setCargando]   = useState(false);

  useEffect(()=>{
    api.get("/admin/usuarios?limite=100").then(({data})=>setUsuarios(data.usuarios));
    api.get("/admin/productos?limite=100").then(({data})=>setProductos(data.productos));
  },[]);

  const filtrados = usuarios.filter(u=>
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(buscarU.toLowerCase())
  );

  const total = items.reduce((acc,it)=>{
    const p = productos.find(p=>p.id==it.producto_id);
    return acc+(p?p.precio*it.cantidad:0);
  },0);

  const enviar = async()=>{
    setError(""); setResultado(null);
    if(!usuarioSel) return setError("Selecciona un cliente.");
    if(items.some(i=>!i.producto_id)) return setError("Selecciona producto en cada fila.");
    setCargando(true);
    try{
      const {data} = await api.post("/admin/facturas",{
        usuario_id:usuarioSel.id, items, metodo_pago:metodo,
        direccion_entrega:direccion||undefined,
        ciudad_entrega:ciudad||undefined,
        notas:notas||undefined,
      });
      setResultado(data);
      setItems([{producto_id:"",cantidad:1}]);
      setUsuarioSel(null); setBuscarU("");
    }catch(err){
      setError(err.response?.data?.error||"Error al crear factura.");
    }finally{setCargando(false);}
  };

  return (
    <div className="max-w-2xl space-y-5">
      {resultado&&<Msg texto={`✅ Factura creada: ${resultado.codigo}`} tipo="ok" />}
      {error&&<Msg texto={error} tipo="err" />}

      <Card className="p-6">
        <SectionTitle sub="Busca al cliente por nombre o email">1. Seleccionar cliente</SectionTitle>
        <input value={buscarU} onChange={e=>setBuscarU(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none mb-2 transition-all"
          style={{border:`1.5px solid ${T.border}`,background:T.surface,color:T.text}} />
        {usuarioSel
          ? <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{background:T.greenLight,border:`1px solid ${T.green}33`}}>
              <div>
                <p className="text-sm font-bold" style={{color:T.green}}>{usuarioSel.nombre} {usuarioSel.apellido}</p>
                <p className="text-xs" style={{color:T.textMuted}}>{usuarioSel.email}</p>
              </div>
              <button onClick={()=>{setUsuarioSel(null);setBuscarU("");}}
                className="text-xs text-red-500 font-semibold">Cambiar</button>
            </div>
          : buscarU&&(
            <div className="rounded-xl overflow-hidden max-h-40 overflow-y-auto"
              style={{border:`1px solid ${T.border}`}}>
              {filtrados.slice(0,8).map(u=>(
                <button key={u.id} onClick={()=>{setUsuarioSel(u);setBuscarU("");}}
                  className="w-full text-left px-4 py-3 transition-colors text-sm"
                  style={{borderBottom:`1px solid ${T.border}`}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.goldBg}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                  <p className="font-semibold text-xs" style={{color:T.text}}>{u.nombre} {u.apellido}</p>
                  <p className="text-xs" style={{color:T.textMuted}}>{u.email}</p>
                </button>
              ))}
            </div>
          )
        }
      </Card>

      <Card className="p-6">
        <SectionTitle sub="Agrega los productos de la venta">2. Productos</SectionTitle>
        <div className="space-y-2.5">
          {items.map((it,i)=>(
            <div key={i} className="flex gap-2.5 items-center">
              <select value={it.producto_id} onChange={e=>setItems(items.map((x,idx)=>idx===i?{...x,producto_id:e.target.value}:x))}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl outline-none"
                style={{border:`1.5px solid ${T.border}`,background:T.surface,color:T.text}}>
                <option value="">Selecciona producto</option>
                {productos.map(p=><option key={p.id} value={p.id}>{p.nombre} — {fmt(p.precio)}</option>)}
              </select>
              <input type="number" min={1} value={it.cantidad}
                onChange={e=>setItems(items.map((x,idx)=>idx===i?{...x,cantidad:Number(e.target.value)}:x))}
                className="w-16 px-2.5 py-2.5 text-xs rounded-xl text-center outline-none"
                style={{border:`1.5px solid ${T.border}`,background:T.surface,color:T.text}} />
              <button onClick={()=>setItems(items.filter((_,idx)=>idx!==i))}
                className="text-xl leading-none transition-colors" style={{color:T.textMuted}}
                onMouseEnter={e=>e.target.style.color="#dc2626"}
                onMouseLeave={e=>e.target.style.color=T.textMuted}>×</button>
            </div>
          ))}
        </div>
        <button onClick={()=>setItems([...items,{producto_id:"",cantidad:1}])}
          className="mt-3 text-xs font-semibold" style={{color:T.gold}}>+ Agregar producto</button>
        {total>0&&(
          <div className="mt-4 pt-4 flex justify-between items-center" style={{borderTop:`1px solid ${T.border}`}}>
            <span className="text-sm font-semibold" style={{color:T.text}}>Total</span>
            <span className="text-xl font-bold" style={{color:T.green}}>{fmt(total)}</span>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <SectionTitle sub="Método de pago y datos de entrega">3. Pago y entrega</SectionTitle>
        <div className="space-y-4">
          <Select label="Método de pago" value={metodo} onChange={e=>setMetodo(e.target.value)}>
            {["efectivo","tarjeta","transferencia","pse","contraentrega"].map(m=>(
              <option key={m} value={m} className="capitalize">{m}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Dirección entrega" value={direccion} onChange={e=>setDireccion(e.target.value)} placeholder="Opcional" />
            <Input label="Ciudad" value={ciudad} onChange={e=>setCiudad(e.target.value)} placeholder="Opcional" />
          </div>
          <Input label="Notas" value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Observaciones..." />
        </div>
      </Card>

      <Btn size="md" onClick={enviar} disabled={cargando}>
        {cargando?"Creando factura...":"✓ Crear factura"}
      </Btn>
    </div>
  );
}

// ─── Layout principal ─────────────────────────────────────────
const NAV = [
  {id:"dashboard",label:"Dashboard",  icono:"▦"},
  {id:"usuarios", label:"Usuarios",   icono:"👥"},
  {id:"productos",label:"Productos",  icono:"📦"},
  {id:"ordenes",  label:"Órdenes",    icono:"🛒"},
  {id:"factura",  label:"Nueva venta",icono:"🧾"},
  {id:"objetivos",label:"Objetivos",  icono:"🎯"},
  {id:"reporte-ventas",   label:"Reporte ventas",  icono:"📊"},
  {id:"reporte-salidas",  label:"Salidas stock",   icono:"📉"}, 
];

const TITULOS = {
  dashboard:"Dashboard", usuarios:"Gestión de usuarios",
  productos:"Gestión de productos", ordenes:"Órdenes",
  factura:"Nueva venta / Factura", objetivos:"Objetivos y metas",
  "reporte-ventas":  "Reporte de Ventas", 
  "reporte-salidas": "Salidas de Stock", 
};

export default function Admin() {
  const {usuario,esAdmin} = useAuth();
  const navigate = useNavigate();
  const [seccion,setSeccion] = useState("dashboard");
  const [collapsed,setCollapsed] = useState(false);

  useEffect(()=>{ if(!esAdmin) navigate("/"); },[esAdmin,navigate]);

  const renderSeccion = () => {
    if(seccion==="dashboard") return <Dashboard />;
    if(seccion==="usuarios")  return <Usuarios />;
    if(seccion==="productos") return <Productos />;
    if(seccion==="ordenes")   return <Ordenes />;
    if(seccion==="factura")   return <Factura />;
    if(seccion==="objetivos") return <Objetivos />;
    if(seccion==="reporte-ventas")  return <ReporteVentas />; 
    if(seccion==="reporte-salidas") return <ReporteSalidas />; 
  };

  return (
    <div className="min-h-screen flex" style={{background:T.surface}}>

      {/* Sidebar premium */}
      <aside className={`${collapsed?"w-16":"w-56"} flex flex-col flex-shrink-0 transition-all duration-200`}
        style={{background:T.sidebar,borderRight:`1px solid ${T.sidebarBorder}`}}>

        {/* Logo */}
        <div className="px-4 py-5" style={{borderBottom:`1px solid ${T.sidebarBorder}`}}>
          {!collapsed
            ? <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{background:T.gold,color:"#0f1f0f"}}>V</div>
                <div>
                  <p className="text-xs font-bold leading-none" style={{color:T.sidebarActiveText}}>Victoria</p>
                  <p className="text-xs leading-none mt-0.5" style={{color:T.sidebarText}}>Pecuarios</p>
                </div>
              </Link>
            : <Link to="/" className="flex justify-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{background:T.gold,color:"#0f1f0f"}}>V</div>
              </Link>
          }
        </div>

        {/* Usuario */}
        {!collapsed && usuario && (
          <div className="px-4 py-3" style={{borderBottom:`1px solid ${T.sidebarBorder}`}}>
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              style={{background:T.sidebarActive}}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{background:T.gold,color:"#0f1f0f"}}>
                {usuario.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{color:T.sidebarActiveText}}>{usuario.nombre}</p>
                <p className="text-xs capitalize" style={{color:T.gold}}>{usuario.rol}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(s=>(
            <button key={s.id} onClick={()=>setSeccion(s.id)}
              title={collapsed?s.label:undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150
                ${seccion===s.id?"font-bold":"font-medium"}`}
              style={{
                background: seccion===s.id ? T.sidebarActive : "transparent",
                color: seccion===s.id ? T.sidebarActiveText : T.sidebarText,
                borderLeft: seccion===s.id ? `2px solid ${T.gold}` : "2px solid transparent",
              }}
              onMouseEnter={e=>{ if(seccion!==s.id) e.currentTarget.style.background=T.sidebarActive; }}
              onMouseLeave={e=>{ if(seccion!==s.id) e.currentTarget.style.background="transparent"; }}>
              <span className="text-base flex-shrink-0">{s.icono}</span>
              {!collapsed && <span>{s.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-2 py-3 space-y-0.5" style={{borderTop:`1px solid ${T.sidebarBorder}`}}>
          {!collapsed && (
            <Link to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{color:T.sidebarText}}
              onMouseEnter={e=>e.currentTarget.style.background=T.sidebarActive}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span>←</span><span>Volver a la tienda</span>
            </Link>
          )}
          <button onClick={()=>setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{color:T.sidebarText}}
            onMouseEnter={e=>e.currentTarget.style.background=T.sidebarActive}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            {collapsed?"→":"←"}
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="bg-white px-8 py-4 flex items-center justify-between"
          style={{borderBottom:`1px solid ${T.border}`}}>
          <div>
            <h1 className="text-lg font-bold" style={{color:T.text,fontFamily:"Georgia,serif"}}>
              {TITULOS[seccion]}
            </h1>
            <p className="text-xs mt-0.5" style={{color:T.textMuted}}>
              {new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium" style={{color:T.textMuted}}>Sistema activo</span>
          </div>
        </header>

        {/* Línea dorada decorativa */}
        <GoldDivider />

        <div className="flex-1 p-8 overflow-auto">
          {renderSeccion()}
        </div>
      </main>
    </div>
  );
}
