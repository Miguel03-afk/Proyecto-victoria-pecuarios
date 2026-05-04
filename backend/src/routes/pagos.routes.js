import { Router } from "express";
import db          from "../db.js";
import crypto      from "crypto";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { enviarConfirmacionCompra } from "../services/email.js";

const router  = Router();
const IVA_PCT = 19;

// ─── CREAR ORDEN PRE-PAGO ─────────────────────────────────────────────────────
// POST /api/pagos/crear-orden
// Para ePayco: crea la orden sin insertar detalle_orden (evita que el trigger
// descuente stock antes de confirmar el pago). Los ítems se guardan en
// items_pendientes_json y se insertan en el webhook cuando el pago es aprobado.
// Para otros métodos: inserta detalle_orden normalmente (el trigger descuenta stock).
router.post("/crear-orden", verificarToken, async (req, res) => {
  const { items, metodo_pago, datos_envio } = req.body;

  if (!items?.length)
    return res.status(400).json({ error: "El carrito está vacío." });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let subtotal = 0;

    // Verificar stock y precios
    for (const item of items) {
      const [[prod]] = await conn.query(
        "SELECT nombre, precio, precio_costo, stock FROM productos WHERE id = ? AND activo = 1",
        [item.producto_id]
      );
      if (!prod)
        throw new Error(`El producto con id ${item.producto_id} no existe o está desactivado.`);
      if (prod.stock < item.cantidad)
        throw new Error(`Stock insuficiente para "${prod.nombre}" (disponible: ${prod.stock}, solicitado: ${item.cantidad}).`);

      item._nombre       = prod.nombre;
      item._precio       = prod.precio;
      item._precio_costo = prod.precio_costo || 0;
      subtotal          += prod.precio * item.cantidad;
    }

    const costoEnvio = subtotal >= 80000 ? 0 : 8900;
    const total      = subtotal + costoEnvio;

    let iva_total = 0, ganancia_total = 0;
    for (const item of items) {
      iva_total      += +(item._precio * item.cantidad * IVA_PCT / 100).toFixed(2);
      ganancia_total += +((item._precio - item._precio_costo) * item.cantidad).toFixed(2);
    }

    // Generar código único de orden
    const anio = new Date().getFullYear();
    const [[{ ultimo }]] = await conn.query(
      "SELECT COUNT(*) AS ultimo FROM ordenes WHERE YEAR(created_at) = ?", [anio]
    );
    const codigo = `VIC-${anio}-${String(ultimo + 1).padStart(5, "0")}`;

    // Construir notas con datos de envío
    const partes = [];
    if (datos_envio?.direccion) partes.push(`Envío: ${datos_envio.direccion}, ${datos_envio.ciudad || ""}`);
    if (datos_envio?.telefono)  partes.push(`Tel: ${datos_envio.telefono}`);
    if (datos_envio?.notas)     partes.push(datos_envio.notas);
    const notas = partes.join(" | ") || null;

    const esEpayco = metodo_pago === "epayco";

    // Para ePayco: guardar ítems en JSON, NO insertar en detalle_orden todavía
    // El trigger solo se dispara en detalle_orden → así no se descuenta stock aún
    const itemsJson = esEpayco
      ? JSON.stringify(items.map(item => ({
          producto_id:   item.producto_id,
          nombre:        item._nombre,
          cantidad:      item.cantidad,
          precio:        item._precio,
          precio_costo:  item._precio_costo,
        })))
      : null;

    const estadoInicial = esEpayco ? "pendiente_pago" : "pendiente";

    const [ord] = await conn.query(
      `INSERT INTO ordenes
         (usuario_id, cajero_id, codigo, estado, subtotal, costo_envio, descuento, total,
          iva_total, ganancia_total, metodo_pago, notas,
          direccion_entrega, ciudad_entrega, items_pendientes_json)
       VALUES (?, NULL, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id, codigo, estadoInicial,
        subtotal, costoEnvio, total, iva_total, ganancia_total,
        metodo_pago || "efectivo", notas,
        datos_envio?.direccion || null,
        datos_envio?.ciudad    || null,
        itemsJson,
      ]
    );
    const orden_id = ord.insertId;

    // Para métodos distintos a ePayco: insertar detalle_orden inmediatamente
    // (el trigger descuenta stock en el momento correcto — la venta ya está confirmada)
    if (!esEpayco) {
      for (const item of items) {
        const item_sub = +(item._precio * item.cantidad).toFixed(2);
        const iva_val  = +(item_sub * IVA_PCT / 100).toFixed(2);
        const ganancia = +((item._precio - item._precio_costo) * item.cantidad).toFixed(2);

        await conn.query(
          `INSERT INTO detalle_orden
             (orden_id, producto_id, nombre_snap, cantidad, precio_unit, precio_costo,
              subtotal, iva_porcentaje, iva_valor, ganancia)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orden_id, item.producto_id, item._nombre,
            item.cantidad, item._precio, item._precio_costo,
            item_sub, IVA_PCT, iva_val, ganancia,
          ]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ orden_id, codigo, total, subtotal, iva: iva_total });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─── WEBHOOK DE CONFIRMACIÓN EPAYCO ──────────────────────────────────────────
// POST /api/pagos/confirmacion
// ePayco llama este endpoint server-to-server después del pago.
// SIN autenticación JWT — se valida mediante firma SHA-256.
// Cuando el pago es aprobado: lee items_pendientes_json, inserta en detalle_orden
// (el trigger descuenta stock automáticamente), y limpia el JSON.
router.post("/confirmacion", async (req, res) => {
  try {
    const {
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_response,
      extra1,   // código de orden enviado en handler.open extra1
    } = req.body;

    // Validar firma: SHA-256(cust_id^key^ref^tx_id^amount^currency)
    const firma = crypto
      .createHash("sha256")
      .update(
        `${process.env.EPAYCO_CUST_ID}^${process.env.EPAYCO_KEY}^` +
        `${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
      )
      .digest("hex");

    if (firma !== x_signature) {
      console.warn("[ePayco] ⚠ Firma inválida — ref:", x_ref_payco);
      return res.status(401).json({ error: "Firma inválida." });
    }

    const estado = x_response === "Aceptada"  ? "pagada"
                 : x_response === "Pendiente" ? "pendiente_pago"
                 :                              "rechazada";

    const codigo = extra1 || x_ref_payco;

    // Actualizar estado y refs de ePayco
    await db.query(
      "UPDATE ordenes SET estado=?, epayco_ref=?, epayco_id=? WHERE codigo=?",
      [estado, x_ref_payco, x_transaction_id, codigo]
    );

    // Solo si fue aprobada: materializar los ítems en detalle_orden
    // El trigger de detalle_orden descuenta el stock automáticamente
    if (estado === "pagada") {
      const [[ord]] = await db.query(
        "SELECT id, items_pendientes_json FROM ordenes WHERE codigo=?", [codigo]
      );
      if (ord?.items_pendientes_json) {
        const items = JSON.parse(ord.items_pendientes_json);

        for (const item of items) {
          const item_sub = +(item.precio * item.cantidad).toFixed(2);
          const iva_val  = +(item_sub * IVA_PCT / 100).toFixed(2);
          const ganancia = +((item.precio - item.precio_costo) * item.cantidad).toFixed(2);

          await db.query(
            `INSERT INTO detalle_orden
               (orden_id, producto_id, nombre_snap, cantidad, precio_unit, precio_costo,
                subtotal, iva_porcentaje, iva_valor, ganancia)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ord.id, item.producto_id, item.nombre,
              item.cantidad, item.precio, item.precio_costo,
              item_sub, IVA_PCT, iva_val, ganancia,
            ]
          );
        }

        // Limpiar JSON ya procesado
        await db.query(
          "UPDATE ordenes SET items_pendientes_json=NULL WHERE id=?", [ord.id]
        );

        // Email de confirmación de compra
        try {
          const [[cliente]] = await db.query(
            "SELECT u.email, u.nombre, o.subtotal, o.costo_envio, o.total, o.codigo FROM ordenes o JOIN usuarios u ON u.id = o.usuario_id WHERE o.id = ?",
            [ord.id]
          );
          const itemsEmail = items.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio }));
          await enviarConfirmacionCompra(cliente.email, cliente.nombre, {
            codigo: cliente.codigo, subtotal: cliente.subtotal,
            costo_envio: cliente.costo_envio, total: cliente.total,
          }, itemsEmail);
        } catch (emailErr) {
          console.error("[email] Confirmación compra webhook:", emailErr.message);
        }
      }
    }

    console.log(`[ePayco] Orden ${codigo} → ${estado} (ref: ${x_ref_payco})`);
    res.json({ ok: true });

  } catch (err) {
    console.error("[ePayco] Error en confirmación:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── FINALIZAR ORDEN DESDE URL DE RESPUESTA ──────────────────────────────────
// POST /api/pagos/finalizar-respuesta
// Llamado por PagoRespuesta.jsx con los params que ePayco envía en la URL de redirect.
// Necesario en desarrollo (localhost) donde el webhook no puede llegar al servidor.
// Requiere JWT del cliente — verifica que la orden le pertenezca.
router.post("/finalizar-respuesta", verificarToken, async (req, res) => {
  try {
    const {
      x_response,
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      extra1,
    } = req.body;

    const estado = x_response === "Aceptada"  ? "pagada"
                 : x_response === "Pendiente" ? "pendiente_pago"
                 :                              "rechazada";

    const codigo = extra1 || x_ref_payco;
    if (!codigo) return res.status(400).json({ error: "Código de orden no encontrado." });

    // La orden debe pertenecer al usuario autenticado
    const [[ord]] = await db.query(
      "SELECT id, items_pendientes_json, estado FROM ordenes WHERE codigo=? AND usuario_id=?",
      [codigo, req.usuario.id]
    );
    if (!ord) return res.status(404).json({ error: "Orden no encontrada." });

    // Si ya fue procesada (p.ej. por el webhook en producción), devolver estado actual
    if (ord.estado === "pagada") return res.json({ estado: "pagada" });

    // Actualizar estado y refs de ePayco
    await db.query(
      "UPDATE ordenes SET estado=?, epayco_ref=?, epayco_id=? WHERE id=?",
      [estado, x_ref_payco || null, x_transaction_id || null, ord.id]
    );

    // Si aprobada y hay ítems pendientes: insertar en detalle_orden
    // El trigger descuenta el stock automáticamente al hacer INSERT
    if (estado === "pagada" && ord.items_pendientes_json) {
      const itemsPendientes = JSON.parse(ord.items_pendientes_json);

      for (const item of itemsPendientes) {
        const item_sub = +(item.precio * item.cantidad).toFixed(2);
        const iva_val  = +(item_sub * IVA_PCT / 100).toFixed(2);
        const ganancia = +((item.precio - item.precio_costo) * item.cantidad).toFixed(2);

        await db.query(
          `INSERT INTO detalle_orden
             (orden_id, producto_id, nombre_snap, cantidad, precio_unit, precio_costo,
              subtotal, iva_porcentaje, iva_valor, ganancia)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ord.id, item.producto_id, item.nombre,
            item.cantidad, item.precio, item.precio_costo,
            item_sub, IVA_PCT, iva_val, ganancia,
          ]
        );
      }

      await db.query(
        "UPDATE ordenes SET items_pendientes_json=NULL WHERE id=?", [ord.id]
      );

      // Email de confirmación de compra
      try {
        const [[ordInfo]] = await db.query(
          "SELECT u.email, u.nombre, o.subtotal, o.costo_envio, o.total FROM ordenes o JOIN usuarios u ON u.id = o.usuario_id WHERE o.id = ?",
          [ord.id]
        );
        const itemsEmail = itemsPendientes.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio }));
        await enviarConfirmacionCompra(ordInfo.email, ordInfo.nombre, {
          codigo, subtotal: ordInfo.subtotal,
          costo_envio: ordInfo.costo_envio, total: ordInfo.total,
        }, itemsEmail);
      } catch (emailErr) {
        console.error("[email] Confirmación compra finalizar:", emailErr.message);
      }
    }

    console.log(`[finalizar-respuesta] Orden ${codigo} → ${estado}`);
    res.json({ estado });

  } catch (err) {
    console.error("[finalizar-respuesta]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── VERIFICAR PAGO CON API DE EPAYCO ────────────────────────────────────────
// POST /api/pagos/verificar-epayco
// El usuario pega la referencia ePayco (del recibo en su pantalla) y el backend
// la valida con la API de ePayco. Si el pago es Aceptada y la factura coincide
// con la orden, se finaliza (inserta detalle_orden, descuenta stock, marca pagada).
router.post("/verificar-epayco", verificarToken, async (req, res) => {
  try {
    const { ref_payco, codigo } = req.body;
    if (!ref_payco || !codigo)
      return res.status(400).json({ error: "Se requieren ref_payco y codigo." });

    // Verificar que la orden le pertenece al usuario y está pendiente
    const [[ord]] = await db.query(
      "SELECT id, items_pendientes_json, estado FROM ordenes WHERE codigo=? AND usuario_id=?",
      [codigo, req.usuario.id]
    );
    if (!ord) return res.status(404).json({ error: "Orden no encontrada." });
    if (ord.estado === "pagada") return res.json({ estado: "pagada", mensaje: "La orden ya estaba confirmada." });

    // Consultar la API de ePayco
    const epaycoRes = await fetch(
      `https://secure.epayco.co/validation/v1/reference/${ref_payco}`,
      { headers: { Accept: "application/json" } }
    );
    if (!epaycoRes.ok)
      return res.status(502).json({ error: "No se pudo consultar a ePayco. Intenta de nuevo." });

    const epaycoData = await epaycoRes.json();
    const tx = epaycoData?.data;

    console.log(`[verificar-epayco] ePayco raw:`, JSON.stringify(epaycoData).slice(0, 400));

    // ePayco no valida pagos de prueba (BANCO DE PRUEBAS) → API devuelve error
    // En ese caso devolvemos una señal para que el frontend ofrezca confirmación manual
    if (!tx || tx.status === "error" || epaycoData.status === false) {
      const { forzar } = req.body;
      if (!forzar)
        return res.status(200).json({ epayco_sin_validar: true });

      // forzar=true: el usuario confirmó manualmente con su comprobante
      await db.query(
        "UPDATE ordenes SET estado='pagada', epayco_ref=? WHERE id=?",
        [ref_payco, ord.id]
      );
      if (ord.items_pendientes_json) {
        const items = JSON.parse(ord.items_pendientes_json);
        for (const item of items) {
          const item_sub = +(item.precio * item.cantidad).toFixed(2);
          const iva_val  = +(item_sub * IVA_PCT / 100).toFixed(2);
          const ganancia = +((item.precio - item.precio_costo) * item.cantidad).toFixed(2);
          await db.query(
            `INSERT INTO detalle_orden
               (orden_id, producto_id, nombre_snap, cantidad, precio_unit, precio_costo,
                subtotal, iva_porcentaje, iva_valor, ganancia)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ord.id, item.producto_id, item.nombre, item.cantidad, item.precio,
             item.precio_costo, item_sub, IVA_PCT, iva_val, ganancia]
          );
        }
        await db.query("UPDATE ordenes SET items_pendientes_json=NULL WHERE id=?", [ord.id]);
      }
      console.log(`[verificar-epayco] Orden ${codigo} → pagada (confirmación manual modo pruebas)`);
      return res.json({ estado: "pagada" });
    }

    // x_response puede llamarse x_transaction_state en algunas respuestas de ePayco
    const xResponse = tx.x_response || tx.x_transaction_state || "";

    // Si la referencia pertenece a otra orden, rechazar
    if (tx.x_invoice && tx.x_invoice !== codigo)
      return res.status(400).json({ error: `La referencia ePayco pertenece a la orden ${tx.x_invoice}, no a ${codigo}.` });

    const estado = xResponse === "Aceptada"  ? "pagada"
                 : xResponse === "Pendiente" ? "pendiente_pago"
                 :                             "rechazada";

    // Solo actualizar si el estado cambia (no sobreescribir "pagada" con "rechazada")
    if (ord.estado !== "pagada") {
      await db.query(
        "UPDATE ordenes SET estado=?, epayco_ref=?, epayco_id=? WHERE id=?",
        [estado, ref_payco, tx.x_transaction_id || null, ord.id]
      );
    }

    if (estado === "pagada" && ord.items_pendientes_json) {
      const items = JSON.parse(ord.items_pendientes_json);
      for (const item of items) {
        const item_sub = +(item.precio * item.cantidad).toFixed(2);
        const iva_val  = +(item_sub * IVA_PCT / 100).toFixed(2);
        const ganancia = +((item.precio - item.precio_costo) * item.cantidad).toFixed(2);
        await db.query(
          `INSERT INTO detalle_orden
             (orden_id, producto_id, nombre_snap, cantidad, precio_unit, precio_costo,
              subtotal, iva_porcentaje, iva_valor, ganancia)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ord.id, item.producto_id, item.nombre, item.cantidad, item.precio,
           item.precio_costo, item_sub, IVA_PCT, iva_val, ganancia]
        );
      }
      await db.query("UPDATE ordenes SET items_pendientes_json=NULL WHERE id=?", [ord.id]);
    }

    console.log(`[verificar-epayco] Orden ${codigo} → ${estado} (x_response: "${xResponse}")`);
    res.json({ estado, respuesta: xResponse });

  } catch (err) {
    console.error("[verificar-epayco]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── CONSULTAR ESTADO DE ORDEN ────────────────────────────────────────────────
// GET /api/pagos/estado/:codigo
router.get("/estado/:codigo", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT codigo, estado, total, metodo_pago, created_at, epayco_ref
       FROM ordenes WHERE codigo = ? AND usuario_id = ?`,
      [req.params.codigo, req.usuario.id]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Orden no encontrada." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
