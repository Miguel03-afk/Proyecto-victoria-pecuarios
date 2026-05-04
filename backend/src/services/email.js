import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
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

/* ─── Correo: propuesta de reagendamiento (al cliente) ──────── */
export async function enviarPropuestaReagendamiento(destinatario, clienteNombre, cita, motivo, nuevaFecha, nuevaHora) {
  const tienePropuesta = nuevaFecha && nuevaHora;
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#F5FAF7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #95CCAD">

    <div style="background:linear-gradient(140deg,#064E30,#0A6B40);padding:32px;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">Victoria Pets</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px">Clínica Veterinaria · Ibagué</p>
    </div>

    <div style="padding:28px 28px 20px">
      <p style="margin:0 0 8px;font-size:16px;color:#101F16;font-weight:700">Hola, ${clienteNombre}</p>
      <p style="margin:0 0 20px;font-size:14px;color:#5A7A65;line-height:1.6">
        Te informamos que tu cita <strong style="color:#0A6B40">${cita.codigo}</strong> requiere atención. Por favor lee el mensaje a continuación:
      </p>

      <div style="background:#FEF9EC;border:1px solid #F5D87A;border-radius:14px;padding:18px;margin-bottom:20px">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#92680A">Mensaje del administrador</p>
        <p style="margin:0;font-size:14px;color:#7A4F0A;line-height:1.7">${motivo}</p>
      </div>

      ${tienePropuesta ? `
      <div style="background:#E4F5EC;border:1px solid #95CCAD;border-radius:14px;padding:18px;margin-bottom:20px;text-align:center">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#5A7A65">Nueva fecha propuesta</p>
        <p style="margin:0;font-size:18px;font-weight:800;color:#0A6B40">${fmtFecha(nuevaFecha)}</p>
        <p style="margin:4px 0 0;font-size:15px;color:#138553;font-weight:600">${fmtHora(nuevaHora)}</p>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#5A7A65;text-align:center">Ingresa a tu perfil en <strong>Victoria Pets</strong> → <em>Mis Citas</em> para aceptar o rechazar esta propuesta.</p>
      ` : `
      <p style="margin:0 0 8px;font-size:13px;color:#5A7A65">En este momento no es posible proponer una nueva fecha. Puedes contactarnos para reagendar cuando lo desees.</p>
      `}
    </div>

    <div style="background:#F5FAF7;border-top:1px solid #E4EDE8;padding:14px 28px;text-align:center">
      <p style="margin:0;font-size:11px;color:#8FAA98">© 2026 Victoria Pets · Ibagué, Colombia</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"Victoria Pets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: `Tu cita ${cita.codigo} ha sido reagendada · Victoria Pets`,
    html,
  });
}

/* ─── Correo: notificar al vet que el cliente aceptó ────────── */
export async function enviarNotificacionVetReagendamiento(destinatario, vetNombre, cita, nuevaFecha, nuevaHora) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#F5FAF7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #95CCAD">
    <div style="background:linear-gradient(140deg,#064E30,#0A6B40);padding:28px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700">Victoria Pets</h1>
    </div>
    <div style="padding:24px 24px 16px">
      <p style="margin:0 0 12px;font-size:15px;color:#101F16;font-weight:700">Hola Dr(a). ${vetNombre},</p>
      <p style="margin:0 0 16px;font-size:14px;color:#5A7A65;line-height:1.6">
        El cliente <strong>${cita.cliente_nombre} ${cita.cliente_apellido}</strong> aceptó la propuesta de reagendamiento. Tienes una nueva cita:
      </p>
      <div style="background:#E4F5EC;border:1px solid #95CCAD;border-radius:12px;padding:16px;text-align:center;margin-bottom:16px">
        <p style="margin:0 0 4px;font-size:12px;color:#5A7A65;text-transform:uppercase;letter-spacing:0.8px;font-weight:700">Nueva fecha</p>
        <p style="margin:0;font-size:18px;font-weight:800;color:#0A6B40">${fmtFecha(nuevaFecha)}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#138553;font-weight:600">${fmtHora(nuevaHora)}</p>
      </div>
      <p style="margin:0;font-size:12px;color:#8FAA98">Mascota: <strong>${cita.nombre_mascota}</strong> · Código: <strong>${cita.codigo}</strong></p>
    </div>
    <div style="background:#F5FAF7;border-top:1px solid #E4EDE8;padding:12px 24px;text-align:center">
      <p style="margin:0;font-size:11px;color:#8FAA98">© 2026 Victoria Pets · Ibagué, Colombia</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"Victoria Pets" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: `Nueva cita confirmada: ${fmtFecha(nuevaFecha)} ${fmtHora(nuevaHora)} · Victoria Pets`,
    html,
  });
}

/* ─── Correo: confirmación de cita al cliente ───────────────── */
export async function enviarConfirmacionCita(destinatario, clienteNombre, cita) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#F5FAF7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #95CCAD">

    <div style="background:linear-gradient(140deg,#064E30,#0A6B40);padding:36px 32px;text-align:center">
      <div style="font-size:42px;margin-bottom:8px">🐾</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Victoria Pets</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.55);font-size:12px;letter-spacing:1px;text-transform:uppercase">Veterinaria · Ibagué</p>
    </div>

    <div style="padding:32px 32px 8px">
      <p style="margin:0 0 6px;font-size:16px;color:#101F16;font-weight:600">Hola, ${clienteNombre} 👋</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A7A65;line-height:1.6">
        Tu cita veterinaria ha sido <strong style="color:#0A6B40">registrada exitosamente</strong>. A continuación encontrarás el resumen:
      </p>

      <!-- Código -->
      <div style="background:#E4F5EC;border:2px solid #95CCAD;border-radius:14px;padding:16px;text-align:center;margin-bottom:20px">
        <p style="margin:0 0 4px;font-size:11px;color:#5A7A65;letter-spacing:1.2px;text-transform:uppercase;font-weight:600">Código de cita</p>
        <span style="font-size:26px;font-weight:800;letter-spacing:4px;color:#0A6B40;font-family:Courier New,monospace">${cita.codigo}</span>
      </div>

      <!-- Detalle -->
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
        <tr style="border-bottom:1px solid #E4EDE8">
          <td style="padding:10px 4px;color:#8FAA98;font-weight:600;white-space:nowrap">👨‍⚕️ Veterinario</td>
          <td style="padding:10px 4px;color:#101F16;font-weight:600">Dr(a). ${cita.vet_nombre} ${cita.vet_apellido}</td>
        </tr>
        <tr style="border-bottom:1px solid #E4EDE8">
          <td style="padding:10px 4px;color:#8FAA98;font-weight:600">📅 Fecha</td>
          <td style="padding:10px 4px;color:#101F16;font-weight:600">${fmtFecha(cita.fecha)}</td>
        </tr>
        <tr style="border-bottom:1px solid #E4EDE8">
          <td style="padding:10px 4px;color:#8FAA98;font-weight:600">🕐 Hora</td>
          <td style="padding:10px 4px;color:#101F16;font-weight:600">${fmtHora(cita.hora)}</td>
        </tr>
        <tr style="border-bottom:1px solid #E4EDE8">
          <td style="padding:10px 4px;color:#8FAA98;font-weight:600">🐾 Mascota</td>
          <td style="padding:10px 4px;color:#101F16;font-weight:600">${cita.nombre_mascota} (${cita.especie_mascota})</td>
        </tr>
        <tr>
          <td style="padding:10px 4px;color:#8FAA98;font-weight:600;vertical-align:top">📋 Motivo</td>
          <td style="padding:10px 4px;color:#101F16">${cita.motivo}</td>
        </tr>
      </table>

      <!-- Recordatorio -->
      <div style="background:#FEF9EC;border:1px solid #F5D87A;border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#92680A;text-transform:uppercase;letter-spacing:0.8px">⏰ Recuerda</p>
        <p style="margin:0;font-size:13px;color:#7A4F0A;line-height:1.7">
          Por favor asiste puntualmente a tu cita. Si no puedes asistir, <strong>cancela con anticipación</strong> ingresando a <em>Mis Citas</em> en Victoria Pets para que otro cliente pueda aprovechar ese horario.
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
    from:    `"Victoria Pets 🐾" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: `Cita confirmada ${cita.codigo} · ${fmtFecha(cita.fecha)} ${fmtHora(cita.hora)} · Victoria Pets`,
    html,
  });
}

/* ─── Correo: confirmación de compra al cliente ─────────────── */
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
