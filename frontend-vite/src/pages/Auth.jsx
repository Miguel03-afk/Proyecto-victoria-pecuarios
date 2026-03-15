import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const InputField = ({ label, type = "text", value, onChange, placeholder, required }) => {
  const [mostrar, setMostrar] = useState(false);
  const esPassword = type === "password";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={esPassword ? (mostrar ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all placeholder-gray-300 bg-gray-50 focus:bg-white"
        />
        {esPassword && (
          <button type="button" onClick={() => setMostrar(!mostrar)} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
            {mostrar ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Logo = () => (
  <Link to="/" className="inline-flex flex-col items-center gap-1.5">
    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
      <span className="text-white text-xl font-bold">V</span>
    </div>
    <span className="text-green-800 font-bold text-lg">Victoria Pecuarios</span>
  </Link>
);

const ErrorBox = ({ mensaje }) => !mensaje ? null : (
  <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    {mensaje}
  </div>
);

const BtnSubmit = ({ cargando, texto, textoCargando }) => (
  <button type="submit" disabled={cargando}
    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-green-200 text-sm">
    {cargando ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {textoCargando}
      </span>
    ) : texto}
  </button>
);

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const desde = location.state?.desde || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.usuario);
      navigate(desde, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-green-700 to-green-500 flex-col justify-between p-10">
        <div className="text-white/70 text-sm font-medium">Victoria Pecuarios</div>
        <div>
          <div className="text-6xl mb-5 select-none">🐾</div>
          <h2 className="text-white text-3xl font-bold leading-tight mb-3">
            Cuidamos a tus animales como si fueran nuestros
          </h2>
          <p className="text-green-100 text-sm leading-relaxed mb-8">
            Productos veterinarios de calidad, atención profesional y el amor que tus mascotas merecen.
          </p>
          {["Más de 100 productos disponibles", "Entregas a domicilio", "Atención veterinaria profesional"].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-green-100 text-sm mb-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {t}
            </div>
          ))}
        </div>
        <div className="text-green-200 text-xs">© 2026 Victoria Pecuarios</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6"><Logo /><p className="text-gray-400 text-xs mt-2">Inicia sesión para continuar</p></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Bienvenido de vuelta</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <ErrorBox mensaje={error} />
              <InputField label="Correo electrónico" type="email" value={form.email} onChange={set("email")} placeholder="tucorreo@ejemplo.com" required />
              <InputField label="Contraseña" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required />
              <BtnSubmit cargando={cargando} texto="Iniciar sesión" textoCargando="Ingresando..." />
            </form>
            <p className="text-center text-xs text-gray-400 mt-4">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="text-green-600 hover:text-green-800 font-semibold">Regístrate</Link>
            </p>
          </div>
          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-green-600 transition-colors">← Volver a la tienda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Registro() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "", confirmar: "",
    telefono: "", tipo_documento: "CC", numero_documento: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmar) return setError("Las contraseñas no coinciden.");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setCargando(true);
    try {
      const { data } = await api.post("/auth/registro", {
        nombre: form.nombre, apellido: form.apellido, email: form.email,
        password: form.password, telefono: form.telefono || undefined,
        tipo_documento: form.tipo_documento, numero_documento: form.numero_documento || undefined,
      });
      login(data.token, data.usuario);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><Logo /><p className="text-gray-400 text-xs mt-2">Crea tu cuenta gratis</p></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Crear cuenta</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <ErrorBox mensaje={error} />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Nombre *" value={form.nombre} onChange={set("nombre")} placeholder="Juan" required />
              <InputField label="Apellido *" value={form.apellido} onChange={set("apellido")} placeholder="Pérez" required />
            </div>
            <InputField label="Correo electrónico *" type="email" value={form.email} onChange={set("email")} placeholder="tucorreo@ejemplo.com" required />
            <InputField label="Teléfono" type="tel" value={form.telefono} onChange={set("telefono")} placeholder="300 000 0000" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Tipo doc.</label>
                <select value={form.tipo_documento} onChange={set("tipo_documento")}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 focus:bg-white">
                  <option value="CC">C.C.</option>
                  <option value="TI">T.I.</option>
                  <option value="CE">C.E.</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <InputField label="Número doc." value={form.numero_documento} onChange={set("numero_documento")} placeholder="123456789" />
            </div>
            <InputField label="Contraseña *" type="password" value={form.password} onChange={set("password")} placeholder="Mínimo 6 caracteres" required />
            <InputField label="Confirmar contraseña *" type="password" value={form.confirmar} onChange={set("confirmar")} placeholder="Repite tu contraseña" required />
            <BtnSubmit cargando={cargando} texto="Crear cuenta gratis" textoCargando="Creando cuenta..." />
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-green-600 hover:text-green-800 font-semibold">Inicia sesión</Link>
          </p>
        </div>
        <p className="text-center mt-4">
          <Link to="/" className="text-xs text-gray-400 hover:text-green-600 transition-colors">← Volver a la tienda</Link>
        </p>
      </div>
    </div>
  );
}
