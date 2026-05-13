# Victoria Pecuarios — Contexto completo del proyecto

> Última actualización: 2026-05-04

---

## ¿Qué es el proyecto?

**Victoria Pecuarios** es una plataforma veterinaria full-stack que combina:
- **E-commerce** de productos veterinarios (farmacología, alimentos, higiene, accesorios, equipos)
- **Gestión de citas** con veterinarios (agenda, reagendamiento, cancelación)
- **Panel de administración** completo (usuarios, productos, órdenes, reportes, metas, veterinarios)
- **POS (Punto de venta)** para cajeros en tienda física
- **Panel del veterinario** para gestionar su agenda y disponibilidad

---

## Stack tecnológico

### Backend
| Herramienta | Versión | Uso |
|---|---|---|
| Node.js + Express | 5.2.1 (ES modules) | API REST |
| MySQL2/promise | — | Base de datos con pool de conexiones |
| jsonwebtoken | — | Autenticación JWT |
| bcryptjs | — | Hash de contraseñas |
| multer | — | Subida de archivos (fotos de veterinarios) |
| nodemailer + Brevo | — | Correos transaccionales |
| CORS | — | Permite `localhost:5173/5174/5175` |

### Frontend
| Herramienta | Versión | Uso |
|---|---|---|
| React | 19.2.0 | UI |
| React Router | 7.13.1 | Enrutamiento SPA |
| Vite | 8.0.0-beta.13 | Bundler |
| Tailwind CSS | 4.2.1 | Estilos base |
| Axios | 1.13.6 | HTTP con interceptor JWT |
| Recharts | 3.8.0 | Gráficas y analytics |
| FontAwesome | 7.2.0 | Iconografía SVG |

### Base de datos: MySQL 8.0+
- Columnas JSON: `facturacion`, `imagenes_extra`, `items_pendientes_json`
- Trigger en `detalle_orden INSERT` → actualiza `historial_stock`
- Migraciones incrementales en `backend/migrations/`

---

## Estructura de carpetas

```
Proyecto victoria pecuarios/
├── backend/
│   ├── src/
│   │   ├── db.js                        Pool de conexión MySQL
│   │   ├── index.js                     Express app + CORS + rutas
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js       verificarToken, soloAdmin, soloRol
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── productos.routes.js
│   │   │   ├── categorias.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── admin.veterinarios.routes.js
│   │   │   ├── citas.routes.js
│   │   │   ├── veterinario.routes.js
│   │   │   ├── cajero.routes.js
│   │   │   ├── metas.routes.js
│   │   │   ├── reportes.routes.js
│   │   │   └── pagos.routes.js
│   │   └── services/
│   │       └── email.js                 Brevo - correos transaccionales
│   ├── migrations/                      001 → 010 (DDL incremental)
│   └── uploads/                         Fotos de veterinarios
│
└── frontend-vite/
    └── src/
        ├── main.jsx
        ├── App.jsx                      Router + layout
        ├── components/
        │   ├── Navbar.jsx               Barra superior (búsqueda, carrito, menú)
        │   ├── RutaProtegida.jsx        Guards de autenticación + rol
        │   ├── CarritoPanel.jsx         Drawer lateral del carrito
        │   ├── ProductCard.jsx          Tarjeta de producto
        │   ├── Objetivos.jsx            Componente de metas con gráficas SVG
        │   └── admin/
        │       └── VariantesEditor.jsx  Editor inline de variantes
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Home.jsx
        │   ├── Auth.jsx
        │   ├── Producto.jsx
        │   ├── Carrito.jsx
        │   ├── Perfil.jsx
        │   ├── MisOrdenes.jsx
        │   ├── MisCitas.jsx
        │   ├── AgendarCita.jsx
        │   ├── PanelVeterinario.jsx
        │   ├── PanelCajero.jsx
        │   ├── PagoRespuesta.jsx
        │   ├── Admin.jsx               ← Orquestador del panel admin
        │   └── admin/
        │       ├── GaleriaAdmin.jsx
        │       ├── ReporteVentas.jsx
        │       └── ReporteSalidas.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CarritoContext.jsx
        ├── services/
        │   └── api.js                  Axios + interceptor JWT
        └── styles/
            └── admin.tokens.js         Sistema de tokens de diseño
```

---

## Base de datos — Tablas principales

### `usuarios`
```
id, nombre, apellido, email, password_hash, rol
email_verificado, email_token, email_token_expira
telefono, activo, created_at
facturacion (JSON: nombre_factura, nit, direccion, ciudad)
```
Roles: `cliente | veterinario | cajero | admin | superadmin`

### `productos`
```
id, nombre, slug, descripcion, marca, unidad
precio, precio_antes (tachado), precio_costo
stock, stock_minimo
categoria_id, proveedor_id
codigo_barra
imagenes_extra (JSON: array de URLs)
destacado, activo, created_at
```

### `producto_variantes`
```
id, producto_id, nombre (ej: "250ml"), precio, stock, sku
```

### `categorias`
```
id, nombre, slug, descripcion, imagen_url, parent_id, activo, orden
```

### `ordenes`
```
id, codigo, usuario_id, cajero_id
estado (pendiente | pendiente_pago | pagada | procesando | enviada | entregada | cancelada | rechazada)
subtotal, costo_envio, iva_total, ganancia_total
metodo_pago (efectivo | transferencia | epayco)
epayco_ref, epayco_id
items_pendientes_json  ← guarda items mientras espera confirmación ePayco
ciudad_envio, direccion_envio
created_at
```

### `detalle_orden`
```
id, orden_id, producto_id, variante_id
cantidad, precio_unitario, iva_aplicado, ganancia_unitaria
```
**Trigger:** al insertar reduce `productos.stock` y registra en `historial_stock`.

### `historial_stock`
```
id, producto_id, variante_id, tipo_movimiento (venta | compra | ajuste_manual | devolucion)
cantidad, stock_antes, stock_despues, referencia, usuario_id, created_at
```

### `citas`
```
id, codigo, cliente_id, veterinario_id
fecha, hora, motivo, nombre_mascota, especie_mascota
estado (pendiente | confirmada | completada | rechazada | cancelada_cliente | cancelada_vet | no_asistio)
motivo_cancelacion, notas_vet
reagendamiento_motivo, reagendamiento_estado (propuesta | aceptada | rechazada)
reagendamiento_nueva_fecha, reagendamiento_nueva_hora
reagendamiento_expira_en   ← columna agregada en migración 010
created_at
```

### `veterinarios`
```
id, usuario_id, especialidad, descripcion, foto_url
duracion_cita (minutos), activo, created_at
```

### `veterinario_disponibilidad`
```
id, veterinario_id, dia_semana (0=Dom … 6=Sáb)
hora_inicio, hora_fin, activo
```
Soporta **múltiples bloques por día** (migración 008).

### `proveedores`
```
id, nombre, contacto, telefono, email, activo
```

### `metas`
```
id, mes (YYYY-MM), meta_ventas, meta_ordenes, meta_clientes, meta_productos
```

### `citas_anomalias`
```
id, cita_id, veterinario_id, descripcion, imagen_url, video_url, created_at
```

---

## Roles y accesos

| Rol | Acceso |
|---|---|
| **cliente** | Tienda, carrito, compras, agendar citas, ver sus citas/órdenes, perfil |
| **veterinario** | Panel de agenda (confirmaciones, completar, anomalías), disponibilidad, foto |
| **cajero** | Panel POS (buscar productos/clientes, crear venta en tienda) |
| **admin / superadmin** | Todo lo anterior + panel de administración completo |

---

## Páginas frontend

### Landing `/`
- Carrusel de 4 slides (salud, nutrición, higiene, equipos)
- 6 tarjetas de servicios (consulta, farmacología, nutrición, lab, peluquería, envío)
- Chips de categorías
- Productos destacados
- CTA a tienda y agendamiento

### Tienda `/tienda`
- Grid de productos, 12 por página
- Búsqueda con debounce
- Filtro multi-categoría (chips)
- Paginación

### Detalle de producto `/producto/:slug`
- Info completa, variantes, productos relacionados
- Agregar al carrito con selector de cantidad

### Carrito `/carrito`
- Ítems con edición de cantidad
- Subtotal + IVA 19% + envío (gratis si subtotal ≥ $80.000)
- Dirección, ciudad, método de pago
- Integración ePayco o efectivo/transferencia

### Auth `/login` y `/registro`
- Registro con OTP de 6 dígitos (expira 15 min, Brevo)
- Login estándar con JWT
- Indicador de fuerza de contraseña

### Perfil `/perfil`
- Editar nombre, teléfono, email
- Datos de facturación (JSON)
- Cambio de contraseña (requiere contraseña actual)

### Mis órdenes `/mis-ordenes`
- Historial de compras con estado
- Detalle de ítems + IVA + envío
- Fallback de validación ePayco para pagos pendientes

### Mis citas `/mis-citas`
- Historial de citas con filtros (activas, pendientes, confirmadas, completadas, canceladas)
- Banner global si hay propuestas de reagendamiento activas o expiradas
- Por cada cita con `reagendamiento_estado = 'propuesta'`:
  - Cuenta regresiva HH:MM:SS (1 hora desde que se propuso)
  - Botón **Aceptar nueva fecha** → `PATCH /citas/:id/aceptar-reagendamiento`
  - Botón **Rechazar** → despliega textarea de motivo → `PATCH /citas/:id/rechazar-reagendamiento`
  - Al expirar: oculta botones, muestra aviso gris
- Cancelación de citas propias con motivo obligatorio

### Agendar cita `/agendar-cita`
1. Seleccionar veterinario (tarjetas con foto, especialidad)
2. Elegir fecha (calendario)
3. Elegir hora (slots libres para ese vet/fecha)
4. Datos de la mascota (nombre, especie, motivo)

### Panel veterinario `/veterinario`
- **Agenda:** filtro por fecha/estado, tarjetas de citas
  - Citas `reagendamiento_estado = 'aceptada'` muestran badge azul "📅 Reagendada forzada" + caja de fecha azul
- **Solicitudes:** bandeja de citas pendientes de confirmación
- Confirmar / rechazar / completar (con notas) / no-asistió
- Reportar anomalía (imágenes/videos)
- Gestionar disponibilidad (multi-bloque por día)
- Subir foto de perfil (multer)

### Panel cajero `/cajero`
- Búsqueda de productos por nombre/marca/código de barras
- Búsqueda de clientes por nombre/email
- Carrito POS con totales
- Crear venta → orden en estado `pagada` + reduce stock (trigger)

### Pago respuesta `/pago/respuesta`
- Maneja redirect de ePayco con query params
- Llama `POST /api/pagos/finalizar-respuesta` (fallback localhost)
- Muestra resultado: aprobado / pendiente / rechazado

---

## Panel de administración (`Admin.jsx`)

Orquestador principal con sidebar de navegación izquierda. Secciones:

### 1. Dashboard
- **KPIs:** usuarios activos, productos activos, total órdenes, ingresos del mes, stock bajo
- **Gráfica analítica:** ComposedChart (Recharts) con Area + Line, filtros 3 meses / 6 meses / 12 meses
  - Eje Y formateado con `fmtMil()` (k/M para espacio)
- **Órdenes recientes:** últimas 5, con estado coloreado
- **Productos con stock bajo:** alertas con stock actual vs mínimo

### 2. Usuarios
- Lista paginada con búsqueda por nombre/email
- Ver detalle: historial de compras, datos de facturación
- Editar perfil y rol
- Resetear contraseña
- Activar/desactivar cuenta

### 3. Productos
- Búsqueda por nombre y código de barras
- Filtro por categoría
- Crear/editar producto completo:
  - Nombre, slug, descripción, marca, unidad
  - Precio, precio anterior (tachado), precio de costo
  - Stock, stock mínimo
  - Categoría, proveedor
  - Código de barras
  - Imágenes extra (JSON)
  - Variantes inline con `VariantesEditor.jsx`

### 4. Órdenes
- Filtro por estado (todas, pendiente, pagada, procesando, enviada, entregada, cancelada)
- Ver detalle: ítems, subtotal, IVA, envío, ganancia, datos del cliente
- Cambiar estado de orden
- Editar costo de envío

### 5. Cajeros
- Lista de cajeros activos con conteo de ventas

### 6. Veterinarios
- Lista de veterinarios con conteo de citas
- Crear veterinario (seleccionar usuario existente → asignar rol)
- Editar perfil del veterinario
- **Activar/Desactivar con flujo de notificación:**
  1. Al pulsar "Desactivar", llama `GET /veterinarios/:id/citas-hoy`
  2. Si tiene citas confirmadas hoy → abre modal con tabla
  3. Tabla: por cada cita → campos **Nueva fecha** + **Nueva hora** (pickers individuales)
  4. Campo global **Motivo de desactivación**
  5. Al confirmar: `POST /veterinarios/:id/desactivar` → desactiva vet + envía correo a cada cliente con su nueva fecha propuesta + expiración de 1 hora
  6. La nueva fecha/hora queda bloqueada en la disponibilidad del vet (`reagendamiento_estado = 'propuesta'`)

### 7. Metas (Objetivos)
- `Objetivos.jsx` (componente independiente):
  - Anillos SVG circulares de progreso para cada KPI (ventas, órdenes, nuevos clientes, productos vendidos)
  - Badge de estado: Completado / En progreso / Por mejorar
  - Tarjetas de comparación mes actual vs mes anterior
  - Gráfica histórica de últimos 6 meses (VPTooltip en blanco, colores VP green)
  - Modal para editar metas del mes
  - Exportación a PDF

### 8. Reporte de ventas (`ReporteVentas.jsx`)
- Filtro por rango de fechas + estado de orden
- Lista de órdenes con detalles
- Totales: ingresos, IVA, ganancia neta, subtotal
  - **Solo órdenes pagadas/en proceso** cuentan para los totales financieros (CASE WHEN en SQL)

### 9. Reporte de salidas (`ReporteSalidas.jsx`)
- Historial de movimientos de stock
- Filtros: fecha, tipo (venta/compra/ajuste/devolución), producto

### 10. Galería (`GaleriaAdmin.jsx`)
- Gestión de imágenes adicionales de productos

### 11. Proveedores
- CRUD completo de proveedores
- Muestra conteo de productos por proveedor
- Eliminar solo si no tiene productos asignados

### Campanita de notificaciones (header del admin)
- Icono de campana con badge rojo (conteo total)
- Consulta `GET /api/admin/notificaciones` cada 60 segundos
- Dropdown con grupos:
  - 🗓 Citas pendientes de confirmación
  - 🔄 Reagendamientos propuestos (esperando respuesta del cliente)
  - 📦 Órdenes nuevas
  - ⚠️ Productos con stock bajo
- Botones rápidos: "Ver citas", "Ver órdenes", "Ver stock"
- Cierra al hacer click fuera (useRef + mousedown)

---

## Sistema de correos (Brevo / email.js)

| Función | Cuándo se envía |
|---|---|
| `enviarCodigoVerificacion()` | Al registrarse (OTP 6 dígitos) |
| `enviarConfirmacionCita()` | Vet confirma una cita |
| `enviarPropuestaReagendamiento()` | Admin propone nueva fecha al desactivar vet |
| `enviarNotificacionVetReagendamiento()` | Cliente acepta reagendamiento |
| `enviarConfirmacionCompra()` | Pago ePayco aprobado |

---

## Flujo de pago ePayco

```
1. POST /api/pagos/crear-orden
   → estado = "pendiente_pago"
   → items_pendientes_json = [...] (stock NO reducido aún)

2. Redirect a pasarela ePayco

3a. Webhook: POST /api/pagos/confirmacion
3b. (Localhost fallback) GET /pago/respuesta?x_response=...
    → POST /api/pagos/finalizar-respuesta

4. Si aprobado:
   → INSERT detalle_orden (trigger reduce stock)
   → estado = "pagada"
   → enviar correo confirmación
   → limpiar items_pendientes_json

5. Si rechazado/pendiente:
   → orden queda en estado correspondiente
```

---

## Flujo de reagendamiento forzado (desactivación de vet)

```
Admin pulsa "Desactivar" en un veterinario
  ↓
Backend consulta citas confirmadas de hoy para ese vet
  ↓
Si hay citas → Modal tabla con:
  [cita] [mascota] [hora] [Nueva fecha picker] [Nueva hora picker]
  [Motivo global]
  ↓
Admin rellena fechas y confirma
  ↓
POST /api/admin/veterinarios/:id/desactivar
  → Para cada cita:
     UPDATE citas SET
       reagendamiento_motivo = motivo,
       reagendamiento_nueva_fecha = nueva_fecha,
       reagendamiento_nueva_hora = nueva_hora,
       reagendamiento_estado = 'propuesta',
       reagendamiento_expira_en = DATE_ADD(NOW(), INTERVAL 1 HOUR)
  → Desactiva al veterinario
  → Envía correo a cada cliente con la propuesta
  ↓
Cliente entra a /mis-citas
  → Banner amarillo "⏳ Reagendamiento pendiente de respuesta"
  → Cuenta regresiva HH:MM:SS
  → Si acepta:
       PATCH /citas/:id/aceptar-reagendamiento
       → fecha/hora actualizadas en la cita
       → reagendamiento_estado = 'aceptada'
       → estado = 'confirmada'
       → Email al veterinario
  → Si rechaza (con motivo):
       PATCH /citas/:id/rechazar-reagendamiento
       → reagendamiento_estado = 'rechazada'
       → estado = 'cancelada_cliente'
       → Slot se libera (ya no bloquea disponibilidad)
  ↓
Vet ve la cita en su agenda con badge azul "📅 Reagendada forzada"
```

---

## Sistema de diseño

### Paleta VP (Victoria Pecuarios)
```
Verde esmeralda  #0A6B40  ← marca principal, CTAs primarios
Verde medio      #138553
Verde oscuro     #064E30  ← sidebars, fondos fuertes
Verde claro      #E4F5EC  ← fondos de tarjetas destacadas
Verde borde      #95CCAD

Lima acción      #7AC143  ← CTAs secundarios, acentos positivos
Lima oscuro      #5a9030
Lima claro       #eef7e3

Canvas           #F5FAF7  ← fondo de página
Superficie       #ffffff  ← tarjetas, modales
Superficie alt   #EDF6F1  ← inputs, fondos alternos

Texto primario   #101F16
Texto secundario #2D4A38
Texto terciario  #5A7A65
Texto muted      #8FAA98

Borde            rgba(0,0,0,0.07)
Borde fuerte     rgba(0,0,0,0.12)

Semántico:
  Success        #14532d / bg #dcfce7
  Warning        #78350f / bg #fef3c7
  Danger         #7f1d1d / bg #fee2e2
  Info           #1B4F8A / bg #dce8f7

Rosa (logo)      #D4457A  ← acento cálido del logotipo
```

### Tokens (`admin.tokens.js`)
```js
fmt(n)       → "$1.250.000"     (COP completo con separadores)
fmtShort(n)  → "$1.250.000"     (igual, para tarjetas KPI)
fmtMil(n)    → "1.25M" / "250k" (compacto para ejes de gráficas)
fdoc(s)      → "15 ene 2026"    (fecha legible)
```

### Tipografía
- Títulos decorativos: `'Playfair Display', serif` (itálica, peso 800)
- UI: fuente del sistema, múltiples pesos (400/500/600/700/800)
- Monospace: para códigos, contadores

### Componentes base (inline styles, sin librerías de UI)
- Modales con `backdrop-filter: blur(4px)`
- Inputs con estados focus (borde verde)
- Botones: primario (verde), outline, ghost, peligro (rojo)
- Badges de estado con punto de color
- Tarjetas con `borderRadius: 16px`, `boxShadow` suave
- Paginación numérica
- Tablas con header sticky y hover
- Animaciones: `fadeUp`, `slideDown`, `shimmer` (skeleton loading)

---

## API — Resumen de rutas

| Prefijo | Middleware | Descripción |
|---|---|---|
| `/api/auth` | Público | Login, registro, OTP, perfil |
| `/api/productos` | Público (GET), admin (write) | Catálogo de productos |
| `/api/categorias` | Público | Categorías jerárquicas |
| `/api/pagos` | Mixto | Carrito, checkout, ePayco webhook |
| `/api/citas` | `verificarToken` | Citas del cliente |
| `/api/veterinario` | `soloRol('veterinario')` | Panel del vet |
| `/api/cajero` | `soloRol('cajero')` | POS cajero |
| `/api/admin` | `soloAdmin` | Panel de administración |
| `/api/admin/veterinarios` | `soloAdmin` | CRUD de vets |
| `/api/metas` | `soloAdmin` | Metas mensuales |
| `/api/reportes` | `soloAdmin` | Reportes ventas/stock |

---

## Migraciones (historial DDL)

| Archivo | Cambio |
|---|---|
| 001 | Campos de facturación en usuarios |
| 002 | Campos de proveedor en productos |
| 003 | Verificación de email por OTP |
| 004 | Columna `codigo_barra` en productos |
| 005 | Integración ePayco (campos en órdenes) |
| 006 | `items_pendientes_json` para checkout asíncrono |
| 007 | `costo_envio` en órdenes |
| 008 | Disponibilidad multi-bloque por día (veterinarios) |
| 009 | Columnas de reagendamiento en citas |
| 010 | `reagendamiento_expira_en DATETIME` en citas |

---

## Variables de entorno esperadas (backend)

```env
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
JWT_SECRET
BREVO_USER, BREVO_PASS          # SMTP Brevo
EPAYCO_P_KEY, EPAYCO_PUBLIC_KEY # Pasarela ePayco
PORT                             # Default 3000
```

---

## Datos de prueba y consideraciones

- CORS habilitado solo para `localhost:5173`, `5174`, `5175`
- `api.js` base URL hardcodeada: `http://localhost:3000/api`
- Webhook de ePayco no funciona en localhost → se usa `finalizar-respuesta` como fallback
- Uploads de fotos de veterinarios se guardan en `backend/uploads/`
- El trigger de stock se activa al insertar en `detalle_orden`, no al crear la orden

---

---

## Guía para rediseño de interfaz

### Pila técnica exacta (para escribir estilos correctamente)

| Capa | Herramienta | Notas |
|---|---|---|
| Framework UI | **React 19** (Vite, no Next.js) | SPA pura, sin SSR |
| Routing | **React Router v7** | `<Routes>` + `<Route>` en App.jsx |
| Estilos | **Inline styles** (objetos JS) + **Tailwind CSS 4** como complemento | La mayoría de componentes usan `style={{...}}` directamente, NO clases Tailwind en producción — solo algunos reset globales en index.css |
| Gráficas | **Recharts 3.8** | ComposedChart, Area, Line, XAxis, YAxis, Tooltip |
| Iconos | **FontAwesome 7** (SVG) | `<i className="fa-solid fa-..."/>` |
| Tipografía | System font + **Playfair Display** (Google Fonts, solo títulos decorativos) | |
| HTTP | **Axios** con interceptor JWT automático | `src/services/api.js` |
| Estado global | **React Context** (Auth + Carrito) | No Redux, no Zustand |

**Implicación para escribir estilos:**
- Los componentes usan objetos de estilo: `<div style={{ background: C.brand, borderRadius: 16 }}>` 
- Los tokens de color están en variables JS locales (`const C = { brand: "#0A6B40", ... }`)
- No hay archivos `.module.css` ni clases utility como `bg-green-700` en los componentes existentes
- Al rediseñar, mantener el patrón de inline styles con las constantes `C`

---

### Estructura de archivos para nuevos componentes

```
Nuevo componente genérico (usado en varias páginas):
  → frontend-vite/src/components/NombreComponente.jsx

Componente exclusivo del admin:
  → frontend-vite/src/components/admin/NombreComponente.jsx

Página nueva:
  → frontend-vite/src/pages/NombrePagina.jsx

Tokens/utilidades de diseño:
  → frontend-vite/src/styles/admin.tokens.js  (ya existe, agregar aquí)

Rutas: registrar en App.jsx
```

---

### Componentes existentes — reusar antes de crear

| Componente | Ruta | Qué hace |
|---|---|---|
| `Navbar` | `src/components/Navbar.jsx` | Barra superior: logo, búsqueda, carrito, menú de usuario |
| `CarritoPanel` | `src/components/CarritoPanel.jsx` | Drawer lateral deslizante del carrito |
| `ProductCard` | `src/components/ProductCard.jsx` | Tarjeta de producto en grid |
| `RutaProtegida` | `src/components/RutaProtegida.jsx` | HOC que verifica auth + rol |
| `Objetivos` | `src/components/Objetivos.jsx` | Metas: anillos SVG, comparación meses, gráfica histórica |
| `VariantesEditor` | `src/components/admin/VariantesEditor.jsx` | Tabla inline para editar variantes de producto |
| `BadgeEstado` | dentro de `MisCitas.jsx` | Pill coloreado según estado de cita |
| `FechaDisplay` | dentro de `MisCitas.jsx` | Caja compacta con día/mes/hora de cita |
| `ModalCancelar` | dentro de `MisCitas.jsx` | Modal de cancelación con textarea de motivo |
| `BannerReagendamiento` | dentro de `MisCitas.jsx` | Banner amarillo de propuesta + countdown + aceptar/rechazar |

---

### Rutas de la aplicación

```
/                    Landing
/tienda              Catálogo de productos
/producto/:slug      Detalle de producto
/carrito             Carrito y checkout
/login               Login
/registro            Registro + verificación OTP
/perfil              Perfil del usuario autenticado
/mis-ordenes         Historial de compras
/mis-citas           Historial y gestión de citas
/agendar-cita        Flujo multi-paso de agendamiento
/veterinario         Panel del veterinario (protegida: rol veterinario)
/cajero              POS cajero (protegida: rol cajero)
/admin               Panel de administración (protegida: rol admin/superadmin)
/admin/galeria       Galería de imágenes de productos
/admin/reportes/ventas   Reporte de ventas
/admin/reportes/salidas  Reporte de salidas de stock
/pago/respuesta      Página de respuesta de ePayco
```

---

### Modelo de datos para placeholders reales

**Producto**
```js
{
  id, nombre, slug, descripcion, marca, unidad,
  precio,           // número, COP
  precio_antes,     // número, tachado (puede ser null)
  precio_costo,     // costo real
  stock,            // entero
  stock_minimo,     // umbral de alerta
  categoria_id, categoria_nombre,
  proveedor_id, proveedor_nombre,
  codigo_barra,     // string
  imagen_url,       // principal
  imagenes_extra,   // JSON array de URLs
  destacado,        // boolean
  activo,           // boolean
  variantes: [{ id, nombre, precio, stock, sku }]
}
```

**Usuario / Cliente**
```js
{
  id, nombre, apellido, email, telefono, rol,
  activo, email_verificado, created_at,
  facturacion: {
    nombre_factura, nit, direccion, ciudad
  }
}
```

**Cita**
```js
{
  id, codigo,           // "CIT-ABC123-XYZ"
  cliente_id, vet_nombre, vet_apellido,
  especialidad, vet_foto,
  fecha,                // "YYYY-MM-DD"
  hora,                 // "HH:MM:SS"
  motivo, nombre_mascota, especie_mascota,
  estado,               // pendiente | confirmada | completada | rechazada | cancelada_cliente | cancelada_vet | no_asistio
  motivo_cancelacion, notas_vet,
  reagendamiento_motivo,
  reagendamiento_estado,    // propuesta | aceptada | rechazada
  reagendamiento_nueva_fecha, reagendamiento_nueva_hora,
  reagendamiento_expira_en, // DATETIME ISO
  created_at
}
```

**Orden**
```js
{
  id, codigo,
  usuario_nombre, usuario_apellido, usuario_email,
  estado,          // pendiente | pendiente_pago | pagada | procesando | enviada | entregada | cancelada | rechazada
  subtotal, iva_total, costo_envio, ganancia_total,
  metodo_pago,     // efectivo | transferencia | epayco
  ciudad_envio, direccion_envio,
  epayco_ref,
  items: [{ producto_nombre, cantidad, precio_unitario, iva_aplicado, ganancia_unitaria }],
  created_at
}
```

**Veterinario**
```js
{
  id, usuario_id, nombre, apellido,
  especialidad, descripcion, foto_url,
  duracion_cita,   // minutos (ej: 30)
  activo,
  disponibilidad: [
    { dia: 1, bloques: [{ hora_inicio: "08:00", hora_fin: "12:00" }] }
  ]
}
```

---

*Documento generado automáticamente para contexto de IA. Actualizar cuando cambien flujos o esquemas importantes.*
