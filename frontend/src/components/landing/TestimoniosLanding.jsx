// src/components/landing/TestimoniosLanding.jsx
// Marquee horizontal — testimonios de adorno (no verificados).
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Reveal, TypeReveal, Tilt3D, useLandingPalette } from "./landing.utils.jsx";

const TESTIMONIOS = [
  { body: "Llevo a Toby hace tres años, y la veterinaria Camila siempre lo recibe como si fuera suyo. Eso no se paga.", name: "Sara M.",     meta: "Ibagué · cliente desde 2024", initials: "SM", accent: "navy" },
  { body: "Pedí el alimento un lunes en la mañana, llegó esa misma tarde. Y a mejor precio que la tienda de al lado.",   name: "Andrés P.",   meta: "Ibagué · cliente desde 2024", initials: "AP", accent: "lime" },
  { body: "Reagendé desde el celular en 30 segundos cuando se me cruzó una reunión. Antes me tocaba llamar mil veces.",  name: "Valentina C.",meta: "Ibagué · cliente desde 2024", initials: "VC", accent: "purple" },
  { body: "El Dr. Javier le hizo a Roco una cirugía complicada y al otro día ya estaba caminando. Honestidad y oficio.", name: "Carolina B.", meta: "Ibagué · cliente desde 2023", initials: "CB", accent: "red" },
  { body: "La consulta no se siente apurada. Te toman fotos, te mandan la receta por WhatsApp y hacen seguimiento.",     name: "Mateo G.",    meta: "Ibagué · cliente desde 2025", initials: "MG", accent: "navy" },
  { body: "Mi gata es de las que no se deja ni mirar y con Andrés ya se relaja. La sala silenciosa hace toda la diferencia.", name: "Luisa R.", meta: "Ibagué · cliente desde 2024", initials: "LR", accent: "lime" },
];

function TestimonioCard({ Cur, t }) {
  const accent = Cur[t.accent] || Cur.navy;
  return (
    <div style={{ width: 380, flexShrink: 0 }}>
      <Tilt3D max={7} perspective={1100}>
        <div style={{
          backgroundColor: Cur.surface,
          border: `1px solid ${Cur.border}`,
          borderRadius: 24, padding: 28, height: 320,
          display: "flex", flexDirection: "column", position: "relative",
          boxShadow: "0 10px 30px -20px rgba(10,20,38,0.18)",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", top: -20, right: -20,
            width: 80, height: 80, borderRadius: 999,
            background: `radial-gradient(circle, ${accent}33 0%, ${accent}00 70%)`,
            pointerEvents: "none",
          }}/>

          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <FontAwesomeIcon key={i} icon={faStar} style={{ fontSize: 13, color: Cur.lime }} />
            ))}
          </div>

          <blockquote className="vp-font-display" style={{
            fontStyle: "italic", fontSize: 18, lineHeight: 1.4,
            color: Cur.ink, marginTop: 16, marginBottom: 0, marginLeft: 0, marginRight: 0,
            position: "relative", paddingLeft: 18, flex: 1,
          }}>
            <span aria-hidden="true" className="vp-font-display" style={{
              position: "absolute", left: -4, top: -10,
              fontSize: 48, color: accent, lineHeight: 1,
              fontStyle: "italic", opacity: 0.55,
            }}>
              “
            </span>
            {t.body}
          </blockquote>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 999,
              background: `linear-gradient(135deg, ${Cur.lime} 0%, ${accent} 100%)`,
              color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, letterSpacing: "0.02em", flexShrink: 0,
            }}>
              {t.initials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: Cur.ink }}>{t.name}</div>
              <div style={{ fontSize: 11, color: Cur.inkSoft, marginTop: 2 }}>{t.meta}</div>
            </div>
          </div>
        </div>
      </Tilt3D>
    </div>
  );
}

export default function TestimoniosLanding() {
  const { Cur } = useLandingPalette();
  const loop = [...TESTIMONIOS, ...TESTIMONIOS];

  return (
    <section style={{
      backgroundColor: Cur.surfaceAlt,
      transition: "background-color 400ms ease",
      position: "relative", overflow: "hidden",
    }}>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ top: -120, right: -100, width: 460, height: 460, backgroundColor: Cur.lime, opacity: 0.08 }}/>
      <div className="vp-bg-blob" aria-hidden="true"
        style={{ bottom: -160, left: -120, width: 520, height: 520, backgroundColor: Cur.red, opacity: 0.06 }}/>

      <div style={{ height: 40 }} aria-hidden="true" />
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '80px 24px 32px',
        position: "relative", zIndex: 1,
      }}>
        <Reveal>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
              color: Cur.lime, fontWeight: 700,
            }}>
              <span style={{ width: 22, height: 1, backgroundColor: Cur.lime }} />
              <span>Familias que confían</span>
              <span style={{ width: 22, height: 1, backgroundColor: Cur.lime }} />
            </div>
            <TypeReveal
              as="h2"
              className="vp-font-display"
              style={{
                marginTop: 16, marginBottom: 0,
                fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05,
                fontWeight: 500, color: Cur.ink,
              }}
              segments={[
                { text: "Lo que cuentan " },
                { text: "nuestros clientes.", italic: true, color: Cur.navy },
              ]}
            />
          </div>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="vp-marquee-x-mask" style={{ padding: "32px 0 64px" }}>
          <div className="vp-marquee-x">
            {loop.map((t, i) => (
              <TestimonioCard key={`${t.name}-${i}`} Cur={Cur} t={t} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
