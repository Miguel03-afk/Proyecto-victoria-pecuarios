/**
 * GaleriaAdmin.jsx — Victoria Pecuarios
 * ─────────────────────────────────────────────────────────────
 * Galería de imágenes y videos para el panel administrador.
 * Soporta: imágenes por URL, imágenes desde PC (base64),
 *          videos por URL (YouTube / Vimeo / mp4 directo),
 *          videos desde PC (base64 — archivos pequeños).
 * Persiste en localStorage["galeria_victoria"].
 * La Landing Page lee ese key y muestra la galería pública.
 *
 * Uso: <GaleriaAdmin T={T} />  (dentro de Admin.jsx sección galería)
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Tokens — alineados con admin.tokens.js del proyecto ───── */
const TK = {
  brand:       "#1a5c1a",
  brandMid:    "#2d7a2d",
  brandLight:  "#e6f3e6",
  brandBorder: "#b8d9b8",
  gold:        "#b08a24",
  goldBg:      "#fef9ec",
  goldBorder:  "rgba(176,138,36,0.25)",
  canvas:      "#f6f7f4",
  surface:     "#ffffff",
  surfaceAlt:  "#f2f3ef",
  surfaceHover:"#ecede8",
  text:        "#111827",
  textSec:     "#374151",
  textTer:     "#6b7280",
  textMuted:   "#9ca3af",
  border:      "rgba(0,0,0,0.08)",
  borderMid:   "rgba(0,0,0,0.13)",
  danger:      "#dc2626",
  dangerBg:    "#fef2f2",
  dangerBorder:"#fecaca",
  success:     "#16a34a",
  successBg:   "#f0fdf4",
  successBorder:"#bbf7d0",
  warning:     "#d97706",
  warningBg:   "#fffbeb",
  warningBorder:"#fde68a",
  info:        "#0284c7",
  infoBg:      "#e0f2fe",
  infoBorder:  "#bae6fd",
};

const STORAGE_KEY = "galeria_victoria";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const cargarGaleria  = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } };
const guardarGaleria = (items) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); return true; } catch { return false; } };
const generarId      = () => `media_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

/* Detectar tipo de medio */
const esVideoUrl = (url = "") => {
  const u = url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be") ||
         u.includes("vimeo.com")   ||
         u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".ogg") ||
         u.startsWith("data:video/");
};

/* YouTube helpers */
const ytId = (url) => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  return m ? m[1] : null;
};
const ytEmbed     = (url) => { const id = ytId(url); return id ? `https://www.youtube.com/embed/${id}?autoplay=0` : null; };
const ytThumbnail = (url) => { const id = ytId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; };

/* Vimeo helpers */
const vmEmbed = (url) => { const m = url.match(/vimeo\.com\/(\d+)/); return m ? `https://player.vimeo.com/video/${m[1]}` : null; };

/* ─── Reproductor de video ────────────────────────────────────────────────── */
function VideoPlayer({ url, altura = 280 }) {
  const embed = ytEmbed(url) || vmEmbed(url);
  if (embed) return (
    <iframe src={embed} width="100%" height={altura} style={{ border:"none", display:"block", borderRadius:0 }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen title="Video"/>
  );
  return (
    <video src={url} controls style={{ width:"100%", height:altura, objectFit:"contain", background:"#000", display:"block" }}/>
  );
}

/* ─── Thumbnail de tarjeta ────────────────────────────────────────────────── */
function MediaThumb({ item }) {
  const [hover, setHover] = useState(false);

  if (item.esVideo) {
    const thumb = item.url ? ytThumbnail(item.url) : null;
    return (
      <div
        style={{ position:"relative", height:180, background:"#0f0f0f", overflow:"hidden", cursor:"pointer" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {thumb ? (
          <img src={thumb} alt={item.titulo}
            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s", transform: hover ? "scale(1.06)" : "scale(1)" }}
            onError={e => { e.target.style.display="none"; }}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#1a1a1a" }}>
            <span style={{ fontSize:40 }}>🎥</span>
          </div>
        )}
        {/* Overlay con botón play */}
        <div style={{
          position:"absolute", inset:0,
          background: hover ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.25)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background 0.3s",
        }}>
          <div style={{
            width: hover ? 52 : 44, height: hover ? 52 : 44,
            borderRadius:"50%",
            background: hover ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.25s",
            boxShadow: hover ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
          }}>
            <span style={{ fontSize: hover ? 22 : 18, marginLeft:2 }}>▶</span>
          </div>
        </div>
        {/* Badge tipo */}
        <div style={{
          position:"absolute", top:8, left:8,
          background:"rgba(0,0,0,0.7)", color:"#fff",
          fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:6,
          textTransform:"uppercase", letterSpacing:0.8,
          backdropFilter:"blur(4px)",
        }}>
          {item.url?.includes("youtube") ? "YouTube" : item.url?.includes("vimeo") ? "Vimeo" : "Video"}
        </div>
      </div>
    );
  }

  // Imagen
  return (
    <div style={{ position:"relative", height:180, background:TK.surfaceAlt, overflow:"hidden", cursor:"pointer" }}>
      <img
        src={item.url} alt={item.titulo}
        style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.35s" }}
        onError={e => {
          e.target.style.display="none";
          e.target.parentElement.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:6px"><span style="font-size:32px;opacity:0.4">🖼️</span><span style="font-size:11px;color:#9ca3af">Sin imagen</span></div>`;
        }}
        onMouseEnter={e => { e.target.style.transform="scale(1.05)"; }}
        onMouseLeave={e => { e.target.style.transform="scale(1)"; }}
      />
      {/* Overlay lupa */}
      <div style={{
        position:"absolute", inset:0,
        background:"rgba(0,0,0,0)", display:"flex", alignItems:"center", justifyContent:"center",
        opacity:0, transition:"all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.background="rgba(26,92,26,0.35)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity="0"; e.currentTarget.style.background="rgba(0,0,0,0)"; }}
      >
        <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
          🔍
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de detalle ────────────────────────────────────────────────────── */
function ModalDetalle({ item, onCerrar }) {
  if (!item) return null;
  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
      onClick={onCerrar}
    >
      <div
        style={{ background:TK.surface, borderRadius:20, overflow:"hidden", maxWidth:700, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.55)", maxHeight:"92vh", display:"flex", flexDirection:"column" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Media */}
        <div style={{ background:"#0a0a0a", flexShrink:0 }}>
          {item.esVideo
            ? <VideoPlayer url={item.url} altura={340}/>
            : <div style={{ height:340, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                <img src={item.url} alt={item.titulo} style={{ maxWidth:"100%", maxHeight:340, objectFit:"contain" }}/>
              </div>
          }
        </div>

        {/* Info */}
        <div style={{ padding:"20px 24px 24px", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                {item.esVideo && (
                  <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:6, background:TK.infoBg, color:TK.info, textTransform:"uppercase", letterSpacing:0.8 }}>
                    🎥 Video
                  </span>
                )}
                {item.categoria && (
                  <span style={{ fontSize:10, fontWeight:700, color:TK.brand, textTransform:"uppercase", letterSpacing:0.8 }}>
                    {item.categoria}
                  </span>
                )}
              </div>
              <h3 style={{ margin:"0 0 6px", fontSize:18, fontWeight:700, color:TK.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
                {item.titulo || "Sin título"}
              </h3>
              {item.descripcion && (
                <p style={{ margin:"0 0 10px", fontSize:13, color:TK.textTer, lineHeight:1.65 }}>{item.descripcion}</p>
              )}
              <p style={{ margin:0, fontSize:11, color:TK.textMuted }}>
                Agregado el {new Date(item.fecha).toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"})}
                {" · "}
                {item.tipo === "archivo" ? "📁 Archivo local" : "🔗 URL externa"}
              </p>
            </div>
            <button onClick={onCerrar} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${TK.border}`, background:TK.surfaceAlt, cursor:"pointer", fontSize:16, color:TK.textSec, flexShrink:0 }}>
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal agregar (imagen o video) ──────────────────────────────────────── */
function ModalAgregar({ onAgregar, onCerrar }) {
  const [tipoMedia, setTipoMedia] = useState("imagen");  // "imagen" | "video"
  const [modo,      setModo]      = useState("url");     // "url" | "archivo"
  const [form, setForm]   = useState({ titulo:"", categoria:"", descripcion:"", url:"" });
  const [preview,  setPreview]    = useState("");
  const [b64,      setB64]        = useState("");
  const [arrastr,  setArrastr]    = useState(false);
  const [error,    setError]      = useState("");
  const [cargando, setCargando]   = useState(false);
  const fileRef = useRef(null);

  /* Cambiar tipo de media — resetear estado */
  const cambiarTipo = (t) => {
    setTipoMedia(t); setModo("url");
    setForm(p => ({ ...p, url:"" }));
    setPreview(""); setB64(""); setError("");
  };

  /* Procesar archivo desde PC */
  const procesarArchivo = useCallback((archivo) => {
    if (!archivo) return;
    const esImg = archivo.type.startsWith("image/");
    const esVid = archivo.type.startsWith("video/");
    if (!esImg && !esVid) return setError("Formato no soportado. Usa JPG, PNG, WEBP, MP4 o WEBM.");
    if (tipoMedia === "imagen" && !esImg) return setError("Selecciona un archivo de imagen.");
    if (tipoMedia === "video"  && !esVid) return setError("Selecciona un archivo de video.");
    const limMB = tipoMedia === "video" ? 50 : 5;
    if (archivo.size > limMB * 1024 * 1024) return setError(`El archivo no debe superar ${limMB} MB.`);
    setError(""); setCargando(true);
    const reader = new FileReader();
    reader.onload = (e) => { setB64(e.target.result); setPreview(e.target.result); setCargando(false); };
    reader.readAsDataURL(archivo);
  }, [tipoMedia]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setArrastr(false);
    procesarArchivo(e.dataTransfer.files[0]);
  }, [procesarArchivo]);

  const handleUrlChange = (url) => {
    setForm(p => ({ ...p, url }));
    setPreview(url); setError("");
  };

  const handleGuardar = () => {
    const url = modo === "url" ? form.url.trim() : b64;
    if (!url) return setError(modo === "url" ? "Ingresa una URL válida." : "Selecciona un archivo.");
    onAgregar({
      id:          generarId(),
      url,
      titulo:      form.titulo || "Sin título",
      categoria:   form.categoria,
      descripcion: form.descripcion,
      tipo:        modo,
      esVideo:     tipoMedia === "video",
      fecha:       new Date().toISOString(),
    });
  };

  const aceptaArchivo = tipoMedia === "imagen" ? "image/*" : "video/mp4,video/webm,video/ogg";
  const limMB = tipoMedia === "video" ? 50 : 5;
  const iconoArchivo = cargando ? "⏳" : tipoMedia === "video" ? "🎥" : "📷";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onCerrar}>
      <div style={{ background:TK.surface, borderRadius:20, width:"100%", maxWidth:560, boxShadow:"0 24px 64px rgba(0,0,0,0.3)", maxHeight:"92vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${TK.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h3 style={{ margin:"0 0 2px", fontSize:16, fontWeight:700, color:TK.text }}>Agregar a la galería</h3>
            <p style={{ margin:0, fontSize:12, color:TK.textMuted }}>Se mostrará en la sección galería de la página principal</p>
          </div>
          <button onClick={onCerrar} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${TK.border}`, background:TK.surfaceAlt, cursor:"pointer", fontSize:16, color:TK.textSec, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        <div style={{ padding:"24px" }}>

          {/* ── Selector imagen / video ── */}
          <div style={{ display:"flex", gap:10, marginBottom:20 }}>
            {[
              { key:"imagen", icon:"🖼️", label:"Imagen", desc:"JPG, PNG, WEBP, GIF" },
              { key:"video",  icon:"🎥", label:"Video",  desc:"YouTube, Vimeo, MP4" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => cambiarTipo(t.key)}
                style={{
                  flex:1, padding:"14px 12px", borderRadius:14, cursor:"pointer",
                  border:`2px solid ${tipoMedia===t.key ? TK.brand : TK.border}`,
                  background: tipoMedia===t.key ? TK.brandLight : TK.surface,
                  transition:"all 0.18s",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                }}
                onMouseEnter={e => { if(tipoMedia!==t.key) e.currentTarget.style.borderColor=TK.brandBorder; }}
                onMouseLeave={e => { if(tipoMedia!==t.key) e.currentTarget.style.borderColor=TK.border; }}
              >
                <span style={{ fontSize:26 }}>{t.icon}</span>
                <span style={{ fontSize:13, fontWeight:700, color:tipoMedia===t.key?TK.brand:TK.text }}>{t.label}</span>
                <span style={{ fontSize:10, color:TK.textMuted }}>{t.desc}</span>
              </button>
            ))}
          </div>

          {/* ── Tabs URL / Archivo ── */}
          <div style={{ display:"flex", borderRadius:10, overflow:"hidden", border:`1.5px solid ${TK.border}`, marginBottom:18 }}>
            {[
              { key:"url",     label:"🔗 Por URL",       desc: tipoMedia==="video" ? "YouTube, Vimeo o enlace directo" : "Pegar enlace de imagen" },
              { key:"archivo", label:"📁 Desde el PC",   desc: `Subir archivo · Máx. ${limMB} MB` },
            ].map(m => (
              <button key={m.key} onClick={() => { setModo(m.key); setError(""); setPreview(""); setB64(""); }}
                style={{
                  flex:1, padding:"10px 14px", border:"none", cursor:"pointer",
                  background: modo===m.key ? TK.brand : TK.surface,
                  color: modo===m.key ? "#fff" : TK.textSec,
                  fontSize:13, fontWeight: modo===m.key ? 700 : 400,
                  transition:"all 0.15s", display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                }}>
                <span>{m.label}</span>
                <span style={{ fontSize:10, opacity:0.7 }}>{m.desc}</span>
              </button>
            ))}
          </div>

          {/* ── Área de carga ── */}
          {modo === "url" ? (
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:TK.textTer, marginBottom:6 }}>
                {tipoMedia === "video" ? "URL del video *" : "URL de la imagen *"}
              </label>
              <input
                type="url"
                placeholder={tipoMedia==="video" ? "https://youtube.com/watch?v=... o https://vimeo.com/..." : "https://ejemplo.com/imagen.jpg"}
                value={form.url}
                onChange={e => handleUrlChange(e.target.value)}
                style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1.5px solid ${TK.border}`, fontSize:13, color:TK.text, background:TK.surfaceAlt, outline:"none", transition:"border 0.15s" }}
                onFocus={e => { e.target.style.borderColor=TK.brand; e.target.style.boxShadow="0 0 0 3px rgba(26,92,26,0.08)"; }}
                onBlur={e => { e.target.style.borderColor=TK.border; e.target.style.boxShadow="none"; }}
              />
              {tipoMedia === "video" && (
                <p style={{ margin:"6px 0 0", fontSize:11, color:TK.textMuted, lineHeight:1.5 }}>
                  💡 YouTube y Vimeo generan thumbnail automáticamente. Para MP4 directo pega la URL del archivo.
                </p>
              )}
            </div>
          ) : (
            <div
              style={{ marginBottom:16, border:`2px dashed ${arrastr ? TK.brand : TK.borderMid}`, borderRadius:14, padding:"28px 20px", textAlign:"center", cursor:"pointer", background: arrastr ? TK.brandLight : TK.surfaceAlt, transition:"all 0.2s" }}
              onDragOver={e => { e.preventDefault(); setArrastr(true); }}
              onDragLeave={() => setArrastr(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept={aceptaArchivo} style={{ display:"none" }} onChange={e => procesarArchivo(e.target.files[0])}/>
              <div style={{ fontSize:38, marginBottom:10 }}>{iconoArchivo}</div>
              <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:600, color:TK.text }}>
                {cargando ? "Procesando archivo..." : `Arrastra ${tipoMedia==="video"?"un video":"una imagen"} aquí`}
              </p>
              <p style={{ margin:0, fontSize:12, color:TK.textTer }}>
                o <span style={{ color:TK.brand, textDecoration:"underline" }}>haz clic para seleccionar</span>
              </p>
              <p style={{ margin:"8px 0 0", fontSize:11, color:TK.textMuted }}>
                {tipoMedia === "video" ? "MP4, WEBM, OGG" : "JPG, PNG, WEBP, GIF"} — Máx. {limMB} MB
              </p>
            </div>
          )}

          {/* ── Preview ── */}
          {preview && !error && (
            <div style={{ marginBottom:16, borderRadius:12, overflow:"hidden", border:`1px solid ${TK.border}` }}>
              {tipoMedia === "video"
                ? (ytThumbnail(preview)
                    ? <div style={{ position:"relative" }}>
                        <img src={ytThumbnail(preview)} alt="thumbnail" style={{ width:"100%", height:160, objectFit:"cover", display:"block" }}/>
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.3)" }}>
                          <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>▶</div>
                        </div>
                      </div>
                    : <div style={{ height:80, background:TK.surfaceAlt, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                        <span style={{ fontSize:24 }}>🎥</span>
                        <span style={{ fontSize:13, color:TK.textSec, fontWeight:600 }}>Video listo para agregar</span>
                      </div>
                  )
                : <img src={preview} alt="vista previa" style={{ width:"100%", maxHeight:160, objectFit:"contain", display:"block", background:TK.surfaceAlt }}
                    onError={() => setError("No se puede cargar la imagen. Verifica la URL.")}/>
              }
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{ padding:"10px 14px", borderRadius:10, background:TK.dangerBg, border:`1px solid ${TK.dangerBorder}`, color:TK.danger, fontSize:13, marginBottom:16, display:"flex", gap:8, alignItems:"center" }}>
              <span>⚠️</span>{error}
            </div>
          )}

          {/* ── Metadata ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:TK.textTer, marginBottom:6 }}>Título</label>
              <input type="text" placeholder={tipoMedia==="video"?"Ej: Consulta veterinaria de Firulais":"Ej: Desinfectante veterinario"} value={form.titulo}
                onChange={e => setForm(p => ({ ...p, titulo:e.target.value }))}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${TK.border}`, fontSize:13, color:TK.text, background:TK.surfaceAlt, outline:"none" }}
                onFocus={e => { e.target.style.borderColor=TK.brand; }} onBlur={e => { e.target.style.borderColor=TK.border; }}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:TK.textTer, marginBottom:6 }}>Categoría</label>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria:e.target.value }))}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${TK.border}`, fontSize:13, color:TK.text, background:TK.surfaceAlt, outline:"none", cursor:"pointer" }}
                onFocus={e => { e.target.style.borderColor=TK.brand; }} onBlur={e => { e.target.style.borderColor=TK.border; }}>
                <option value="">Sin categoría</option>
                <option value="Farmacología">Farmacología</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Higiene">Higiene</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Equipos">Equipos</option>
                <option value="Instalaciones">Instalaciones</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:TK.textTer, marginBottom:6 }}>Descripción (opcional)</label>
              <textarea placeholder="Descripción corta..." value={form.descripcion} rows={2}
                onChange={e => setForm(p => ({ ...p, descripcion:e.target.value }))}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${TK.border}`, fontSize:13, color:TK.text, background:TK.surfaceAlt, outline:"none", resize:"vertical", fontFamily:"system-ui" }}
                onFocus={e => { e.target.style.borderColor=TK.brand; }} onBlur={e => { e.target.style.borderColor=TK.border; }}/>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 24px 24px", display:"flex", gap:10, justifyContent:"flex-end", borderTop:`1px solid ${TK.border}` }}>
          <button onClick={onCerrar} style={{ padding:"9px 18px", borderRadius:10, border:`1.5px solid ${TK.border}`, background:TK.surface, color:TK.textSec, fontSize:13, fontWeight:500, cursor:"pointer" }}>
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={cargando || (!form.url.trim() && !b64)}
            style={{
              padding:"9px 22px", borderRadius:10, border:"none",
              background: (cargando || (!form.url.trim() && !b64)) ? TK.surfaceAlt : TK.brand,
              color:      (cargando || (!form.url.trim() && !b64)) ? TK.textMuted : "#fff",
              fontSize:13, fontWeight:700,
              cursor: (cargando || (!form.url.trim() && !b64)) ? "default" : "pointer",
              transition:"all 0.15s",
            }}
            onMouseEnter={e => { if(!(cargando||(!form.url.trim()&&!b64))) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(26,92,26,0.25)"; }}}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
          >
            ✓ Agregar a galería
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tarjeta de item en galería ──────────────────────────────────────────── */
function TarjetaMedia({ item, onEliminar, onVer }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      style={{ background:TK.surface, border:`1px solid ${TK.border}`, borderRadius:16, overflow:"hidden", transition:"all 0.2s", position:"relative" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor=TK.brandBorder; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=TK.border; }}
    >
      {/* Thumbnail — clic abre detalle */}
      <div onClick={() => onVer(item)}>
        <MediaThumb item={item}/>
      </div>

      {/* Info */}
      <div style={{ padding:"12px 14px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
              {item.esVideo && (
                <span style={{ fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:5, background:TK.infoBg, color:TK.info, textTransform:"uppercase", letterSpacing:0.5 }}>
                  Video
                </span>
              )}
              {item.categoria && (
                <span style={{ fontSize:9, fontWeight:700, color:TK.brand, textTransform:"uppercase", letterSpacing:0.5 }}>
                  {item.categoria}
                </span>
              )}
            </div>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:TK.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {item.titulo || "Sin título"}
            </p>
            <p style={{ margin:"3px 0 0", fontSize:10, color:TK.textMuted }}>
              {item.tipo==="archivo" ? "📁 Local" : "🔗 URL"} · {new Date(item.fecha).toLocaleDateString("es-CO")}
            </p>
          </div>

          {/* Eliminar */}
          {!confirm ? (
            <button onClick={() => setConfirm(true)} title="Eliminar"
              style={{ width:28, height:28, borderRadius:8, border:`1px solid ${TK.dangerBorder}`, background:TK.dangerBg, cursor:"pointer", color:TK.danger, fontSize:13, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              🗑
            </button>
          ) : (
            <div style={{ display:"flex", gap:4, flexShrink:0 }}>
              <button onClick={() => onEliminar(item.id)} style={{ padding:"3px 8px", borderRadius:7, fontSize:11, fontWeight:700, border:"none", background:TK.danger, color:"#fff", cursor:"pointer" }}>Sí</button>
              <button onClick={() => setConfirm(false)} style={{ padding:"3px 8px", borderRadius:7, fontSize:11, border:`1px solid ${TK.border}`, background:TK.surface, color:TK.textSec, cursor:"pointer" }}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function GaleriaAdmin({ T }) {
  const [items,         setItems]         = useState([]);
  const [modalAgregar,  setModalAgregar]  = useState(false);
  const [itemDetalle,   setItemDetalle]   = useState(null);
  const [filtroCateg,   setFiltroCateg]   = useState("todas");
  const [filtroTipo,    setFiltroTipo]    = useState("todos");  // "todos"|"imagen"|"video"
  const [busqueda,      setBusqueda]      = useState("");
  const [orden,         setOrden]         = useState("reciente");
  const [toast,         setToast]         = useState(null);

  useEffect(() => { setItems(cargarGaleria()); }, []);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAgregar = (nuevo) => {
    const sig = [nuevo, ...items];
    setItems(sig);
    guardarGaleria(sig)
      ? mostrarToast(`✓ ${nuevo.esVideo ? "Video" : "Imagen"} agregado a la galería`)
      : mostrarToast("Error al guardar. Almacenamiento lleno.", "error");
    setModalAgregar(false);
  };

  const handleEliminar = (id) => {
    const sig = items.filter(i => i.id !== id);
    setItems(sig);
    guardarGaleria(sig);
    mostrarToast("Elemento eliminado de la galería", "warning");
  };

  /* Stats */
  const totalImg  = items.filter(i => !i.esVideo).length;
  const totalVid  = items.filter(i =>  i.esVideo).length;
  const categorias= ["todas", ...new Set(items.map(i => i.categoria).filter(Boolean))];

  /* Filtrar + ordenar */
  const itemsFiltrados = items
    .filter(i => filtroCateg === "todas" || i.categoria === filtroCateg)
    .filter(i => filtroTipo  === "todos"  || (filtroTipo === "video" ? i.esVideo : !i.esVideo))
    .filter(i => !busqueda || i.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || i.categoria?.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (orden === "titulo")  return (a.titulo||"").localeCompare(b.titulo||"");
      if (orden === "antigua") return new Date(a.fecha) - new Date(b.fecha);
      return new Date(b.fecha) - new Date(a.fecha);
    });

  return (
    <div style={{ padding:24 }}>
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateX(110%)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:500,
          padding:"12px 20px", borderRadius:12,
          background: toast.tipo==="error" ? TK.danger : toast.tipo==="warning" ? TK.warning : TK.brand,
          color:"#fff", fontSize:13, fontWeight:700,
          boxShadow:"0 8px 28px rgba(0,0,0,0.22)", animation:"toastIn 0.28s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Modales */}
      {modalAgregar && <ModalAgregar onAgregar={handleAgregar} onCerrar={() => setModalAgregar(false)}/>}
      {itemDetalle  && <ModalDetalle item={itemDetalle} onCerrar={() => setItemDetalle(null)}/>}

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:16 }}>
        <div>
          <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:700, color:TK.text, fontFamily:"'Playfair Display',serif", fontStyle:"italic" }}>
            Galería de medios
          </h2>
          <p style={{ margin:0, fontSize:13, color:TK.textTer }}>
            Imágenes y videos que se muestran en la galería de la página principal
          </p>
        </div>
        <button
          onClick={() => setModalAgregar(true)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12, border:"none", background:TK.brand, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(26,92,26,0.2)", transition:"all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(26,92,26,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";   e.currentTarget.style.boxShadow="0 4px 12px rgba(26,92,26,0.2)"; }}
        >
          <span style={{ fontSize:16 }}>+</span>
          Agregar imagen o video
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:24 }}>
        {[
          { label:"Total medios",    val:items.length,   color:TK.brand,   bg:TK.brandLight },
          { label:"Imágenes",        val:totalImg,        color:"#2563eb",  bg:"#dbeafe" },
          { label:"Videos",          val:totalVid,        color:"#7c3aed",  bg:"#ede9fe" },
          { label:"Categorías",      val:new Set(items.map(i=>i.categoria).filter(Boolean)).size, color:TK.warning, bg:TK.warningBg },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}22`, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.val}</div>
            <div style={{ fontSize:10, color:s.color, opacity:0.8, marginTop:2, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Galería vacía ── */}
      {items.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px", background:TK.surface, borderRadius:20, border:`2px dashed ${TK.border}` }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🖼️</div>
          <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700, color:TK.text }}>La galería está vacía</h3>
          <p style={{ margin:"0 0 24px", fontSize:14, color:TK.textTer, maxWidth:380, marginInline:"auto", lineHeight:1.6 }}>
            Agrega imágenes o videos para mostrarlos en la galería de la página principal.
            Puedes pegar una URL de YouTube o subir un archivo desde tu computador.
          </p>
          <button onClick={() => setModalAgregar(true)}
            style={{ padding:"12px 28px", borderRadius:12, border:"none", background:TK.brand, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(26,92,26,0.2)" }}>
            + Agregar primer elemento
          </button>
        </div>
      ) : (
        <>
          {/* ── Controles ── */}
          <div style={{ background:TK.surface, border:`1px solid ${TK.border}`, borderRadius:14, padding:"16px 20px", marginBottom:20, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            {/* Búsqueda */}
            <div style={{ position:"relative", flex:"1 1 180px", minWidth:160 }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13, pointerEvents:"none" }}>🔍</span>
              <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                style={{ width:"100%", padding:"8px 12px 8px 32px", borderRadius:10, border:`1.5px solid ${TK.border}`, fontSize:12, color:TK.text, background:TK.surfaceAlt, outline:"none" }}/>
            </div>

            {/* Filtro tipo */}
            <div style={{ display:"flex", gap:4 }}>
              {[{k:"todos",label:"Todos"},{k:"imagen",label:"🖼️ Imágenes"},{k:"video",label:"🎥 Videos"}].map(f => (
                <button key={f.k} onClick={() => setFiltroTipo(f.k)}
                  style={{
                    padding:"6px 12px", borderRadius:999, fontSize:11, cursor:"pointer", whiteSpace:"nowrap",
                    border:`1.5px solid ${filtroTipo===f.k?TK.brand:TK.border}`,
                    background: filtroTipo===f.k?TK.brandLight:TK.surface,
                    color: filtroTipo===f.k?TK.brand:TK.textSec,
                    fontWeight: filtroTipo===f.k?700:400, transition:"all 0.15s",
                  }}>{f.label}</button>
              ))}
            </div>

            {/* Categorías */}
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {categorias.map(cat => (
                <button key={cat} onClick={() => setFiltroCateg(cat)}
                  style={{
                    padding:"6px 12px", borderRadius:999, fontSize:11, cursor:"pointer", whiteSpace:"nowrap",
                    border:`1.5px solid ${filtroCateg===cat?TK.brand:TK.border}`,
                    background: filtroCateg===cat?TK.brandLight:TK.surface,
                    color: filtroCateg===cat?TK.brand:TK.textSec,
                    fontWeight: filtroCateg===cat?700:400, transition:"all 0.15s",
                  }}>
                  {cat === "todas" ? "📋 Todas" : cat}
                </button>
              ))}
            </div>

            {/* Orden */}
            <select value={orden} onChange={e => setOrden(e.target.value)}
              style={{ padding:"7px 12px", borderRadius:10, border:`1.5px solid ${TK.border}`, background:TK.surfaceAlt, fontSize:11, color:TK.textSec, cursor:"pointer", outline:"none" }}>
              <option value="reciente">Más recientes</option>
              <option value="antigua">Más antiguas</option>
              <option value="titulo">Por título</option>
            </select>

            <span style={{ fontSize:11, color:TK.textMuted, marginLeft:"auto" }}>
              {itemsFiltrados.length} de {items.length}
            </span>
          </div>

          {/* ── Grid ── */}
          {itemsFiltrados.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 24px", background:TK.surface, borderRadius:16, border:`1px solid ${TK.border}` }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <p style={{ margin:0, color:TK.textTer, fontSize:14 }}>Sin resultados con ese filtro</p>
              <button onClick={() => { setBusqueda(""); setFiltroCateg("todas"); setFiltroTipo("todos"); }}
                style={{ marginTop:12, fontSize:12, color:TK.brand, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, animation:"fadeUp 0.3s ease" }}>
              {itemsFiltrados.map(im => (
                <TarjetaMedia key={im.id} item={im} onEliminar={handleEliminar} onVer={setItemDetalle}/>
              ))}
              {/* Card agregar */}
              <div
                onClick={() => setModalAgregar(true)}
                style={{ minHeight:230, borderRadius:16, border:`2px dashed ${TK.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", transition:"all 0.2s", color:TK.textMuted }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=TK.brand; e.currentTarget.style.color=TK.brand; e.currentTarget.style.background=TK.brandLight; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=TK.border; e.currentTarget.style.color=TK.textMuted; e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ fontSize:32 }}>+</span>
                <span style={{ fontSize:13, fontWeight:600 }}>Agregar imagen o video</span>
              </div>
            </div>
          )}

          {/* Nota */}
          <div style={{ marginTop:24, padding:"12px 16px", borderRadius:12, background:TK.brandLight, border:`1px solid ${TK.brandBorder}`, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
            <p style={{ margin:0, fontSize:12, color:TK.brand, lineHeight:1.65 }}>
              Los medios se guardan en el almacenamiento local del navegador y aparecen automáticamente en la sección <strong>Galería</strong> de la página principal.
              Para videos de YouTube y Vimeo solo se guarda la URL — se cargan directamente desde sus servidores.
              Los archivos subidos desde el PC se guardan como base64 (imágenes hasta 5 MB, videos hasta 50 MB).
            </p>
          </div>
        </>
      )}
    </div>
  );
}