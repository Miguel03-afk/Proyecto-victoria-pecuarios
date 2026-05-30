import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // Brevo (antes Sendinblue) mantiene su SMTP bajo el dominio legacy.
  // Su certificado SSL solo cubre "sendinblue.com", no "brevo.com".
  // Usar el host viejo evita el error de hostname mismatch.
  host: "smtp-relay.sendinblue.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ─── Helpers ──────────────────────────────────────────────── */
const DIAS_ES  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function fmtFecha(fecha) {
  if (!fecha) return null;
  const d = typeof fecha === "string" ? new Date(fecha + "T00:00:00") : fecha;
  return `${DIAS_ES[d.getDay()]} ${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

function fmtHora(hora) {
  if (!hora) return null;
  const [h, m] = hora.split(":");
  const n = parseInt(h);
  return `${n > 12 ? n - 12 : n}:${m} ${n >= 12 ? "PM" : "AM"}`;
}


export async function enviarConfirmacionCompra(destinatario, clienteNombre, orden, items) {
  const fmt$ = (n) => `$${Number(n||0).toLocaleString("es-CO")}`;
  const filasItems = items.map(item => `
    <tr style="border-bottom:1px solid #E4EDE8">
      <td style="padding:10px 4px;color:#101F16">${item.nombre}</td>
      <td style="padding:10px 4px;color:#5A7A65;text-align:center">${item.cantidad}</td>
      <td style="padding:10px 4px;color:#101F16;text-align:right;font-weight:600">${fmt$(item.precio * item.cantidad)}</td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#F5FAF7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #95CCAD">

    <div style="background:linear-gradient(140deg,#064E30,#0A6B40);padding:36px 32px;text-align:center">
      <div style="font-size:40px;margin-bottom:8px">🛍️</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Victoria Pets</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.55);font-size:12px;letter-spacing:1px;text-transform:uppercase">Veterinaria · Ibagué</p>
    </div>

    <div style="padding:32px 32px 8px">
      <p style="margin:0 0 6px;font-size:16px;color:#101F16;font-weight:600">¡Gracias por tu compra, ${clienteNombre}! 🎉</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A7A65;line-height:1.6">
        Hemos recibido tu pedido correctamente. Pronto nos pondremos en contacto contigo para coordinar la entrega.
      </p>

      <!-- Código de orden -->
      <div style="background:#E4F5EC;border:2px solid #95CCAD;border-radius:14px;padding:14px;text-align:center;margin-bottom:20px">
        <p style="margin:0 0 4px;font-size:11px;color:#5A7A65;letter-spacing:1.2px;text-transform:uppercase;font-weight:600">Número de orden</p>
        <span style="font-size:22px;font-weight:800;letter-spacing:3px;color:#0A6B40;font-family:Courier New,monospace">${orden.codigo}</span>
      </div>

      <!-- Productos -->
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
        <thead>
          <tr style="border-bottom:2px solid #E4EDE8">
            <th style="padding:8px 4px;text-align:left;color:#5A7A65;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Producto</th>
            <th style="padding:8px 4px;text-align:center;color:#5A7A65;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Cant.</th>
            <th style="padding:8px 4px;text-align:right;color:#5A7A65;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Total</th>
          </tr>
        </thead>
        <tbody>${filasItems}</tbody>
      </table>

      <!-- Totales -->
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
        <tr>
          <td style="padding:6px 4px;color:#8FAA98">Subtotal</td>
          <td style="padding:6px 4px;text-align:right;color:#101F16">${fmt$(orden.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:6px 4px;color:#8FAA98">Envío</td>
          <td style="padding:6px 4px;text-align:right;color:#101F16">${Number(orden.costo_envio) === 0 ? "Gratis 🎁" : fmt$(orden.costo_envio)}</td>
        </tr>
        <tr style="border-top:2px solid #E4EDE8">
          <td style="padding:10px 4px;color:#101F16;font-weight:800;font-size:15px">Total pagado</td>
          <td style="padding:10px 4px;text-align:right;color:#0A6B40;font-weight:800;font-size:17px">${fmt$(orden.total)}</td>
        </tr>
      </table>

      <!-- Nota -->
      <div style="background:#E4F5EC;border:1px solid #95CCAD;border-radius:12px;padding:14px;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#2D4A38;line-height:1.7">
          🐾 Gracias por confiar en <strong>Victoria Pets</strong>. Tu pedido será procesado con mucho cuidado. Puedes revisar el estado de tu orden en cualquier momento desde <em>Mis Pedidos</em>.
        </p>
      </div>
    </div>

    <div style="background:#F5FAF7;border-top:1px solid #E4EDE8;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#8FAA98">
        © 2026 Victoria Pets · Ibagué, Colombia<br>
        <a href="mailto:victoriavetpets@gmail.com" style="color:#0A6B40;text-decoration:none">victoriavetpets@gmail.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"Victoria Pets 🛍️" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: `Tu orden ${orden.codigo} está confirmada · Victoria Pets`,
    html,
  });
}

/* ─── Correo: restablecer contraseña ─────────────────────────
   Diseño minimalista — un solo CTA, copy breve, mismo branding
   que el resto de correos para coherencia en bandeja del cliente. */
export async function enviarEmailReset(destinatario, nombre, resetUrl) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#F5FAF7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #95CCAD">

    <!-- Header con logo wordmark -->
    <div style="background:linear-gradient(140deg,#064E30,#0A6B40);padding:36px 32px;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px">Victoria Pets</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.55);font-size:11px;letter-spacing:1.5px;text-transform:uppercase">Veterinaria · Ibagué</p>
    </div>

    <!-- Body minimalista -->
    <div style="padding:36px 32px 28px">

      <h2 style="margin:0 0 8px;font-size:18px;color:#101F16;font-weight:700;line-height:1.3">
        Restablecer tu contraseña
      </h2>

      <p style="margin:0 0 20px;font-size:14px;color:#5A7A65;line-height:1.65">
        Hola ${nombre || ""}, recibimos una solicitud para cambiar la contraseña de tu cuenta. Haz click en el botón para crear una nueva.
      </p>

      <!-- CTA único -->
      <div style="text-align:center;margin:28px 0">
        <a href="${resetUrl}" target="_blank"
           style="display:inline-block;padding:14px 36px;background:#7BC142;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:12px;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(123,193,66,0.3)">
          Restablecer contraseña
        </a>
      </div>

      <!-- Aviso expiración -->
      <div style="background:#FEF9EC;border:1px solid #F5D87A;border-radius:10px;padding:12px 14px;margin-bottom:20px">
        <p style="margin:0;font-size:12px;color:#92680A;line-height:1.5">
          ⏱ <strong>Este enlace expira en 10 minutos.</strong> Si necesitas más tiempo, solicita uno nuevo desde la pantalla de login.
        </p>
      </div>

      <!-- Aviso de seguridad -->
      <p style="margin:0 0 16px;font-size:12px;color:#8FAA98;line-height:1.6;text-align:center">
        Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña seguirá igual.
      </p>

      <!-- Fallback link -->
      <p style="margin:0;padding:14px 0 0;border-top:1px solid #E4EDE8;font-size:11px;color:#8FAA98;line-height:1.5;word-break:break-all">
        ¿El botón no funciona? Copia y pega este enlace en tu navegador:<br>
        <span style="color:#0A6B40">${resetUrl}</span>
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#F5FAF7;border-top:1px solid #E4EDE8;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#8FAA98">
        © 2026 Victoria Pets · Ibagué, Colombia<br>
        <a href="mailto:victoriavetpets@gmail.com" style="color:#0A6B40;text-decoration:none">victoriavetpets@gmail.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"Victoria Pets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: "Restablecer tu contraseña · Victoria Pets",
    html,
  });
}

export async function enviarCodigoVerificacion(destinatario, nombre, codigo) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#F5FAF7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #95CCAD">

    <div style="background:linear-gradient(140deg,#064E30,#0A6B40);padding:36px 32px;text-align:center">
      <div style="font-size:42px;margin-bottom:8px">🐾</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px">Victoria Pets</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.55);font-size:12px;letter-spacing:1px;text-transform:uppercase">Veterinaria · Ibagué</p>
    </div>

    <div style="padding:32px 32px 24px">
      <p style="margin:0 0 6px;font-size:16px;color:#101F16;font-weight:600">Hola, ${nombre} 👋</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A7A65;line-height:1.6">
        Gracias por registrarte en Victoria Pets. Para activar tu cuenta, ingresa el siguiente código de verificación:
      </p>

      <div style="background:#E4F5EC;border:2px solid #95CCAD;border-radius:14px;padding:22px 16px;text-align:center;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:11px;color:#5A7A65;letter-spacing:1.5px;text-transform:uppercase;font-weight:600">Código de verificación</p>
        <span style="font-size:44px;font-weight:800;letter-spacing:14px;color:#0A6B40;font-family:Courier New,monospace">${codigo}</span>
      </div>

      <div style="background:#FEF9EC;border:1px solid #F5D87A;border-radius:10px;padding:12px 14px;margin-bottom:20px">
        <p style="margin:0;font-size:12px;color:#92680A;line-height:1.5">
          ⏱ <strong>Este código expira en 15 minutos.</strong> Si ya pasó ese tiempo, solicita uno nuevo desde la misma pantalla.
        </p>
      </div>

      <p style="margin:0;font-size:12px;color:#8FAA98;line-height:1.5;text-align:center">
        Si no creaste una cuenta en Victoria Pets, puedes ignorar este mensaje.<br>
        Nadie te pedirá este código por teléfono o chat.
      </p>
    </div>

    <div style="background:#F5FAF7;border-top:1px solid #E4EDE8;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#8FAA98">
        © 2026 Victoria Pets · Ibagué, Colombia<br>
        <a href="mailto:victoriavetpets@gmail.com" style="color:#0A6B40;text-decoration:none">victoriavetpets@gmail.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Victoria Pets 🐾" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to:   destinatario,
    subject: `${codigo} — Código de verificación · Victoria Pets`,
    html,
  });
}
