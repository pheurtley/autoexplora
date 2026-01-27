# AutoExplora.cl - Features & Roadmap

## Estado del Proyecto

Este documento rastrea todas las funcionalidades implementadas y pendientes del marketplace de vehículos AutoExplora.cl.

---

## Funcionalidades Completadas

### Sistema Base
- [x] Autenticación con NextAuth (Google, Facebook, Credentials)
- [x] Registro de usuarios
- [x] Gestión de sesiones JWT
- [x] Base de datos PostgreSQL con Prisma ORM
- [x] Subida de imágenes a Cloudinary

### Vehículos
- [x] Publicación de vehículos con formulario multi-paso
- [x] Listado de vehículos con paginación
- [x] Búsqueda y filtros (marca, modelo, año, precio, región, etc.)
- [x] Detalle de vehículo con galería de imágenes
- [x] Estados de publicación (Activo, Pausado, Vendido, Expirado)
- [x] Vehículos destacados
- [x] Vehículos recientes
- [x] Formulario de publicación mejorado:
  - [x] Scroll automático a categorías en mobile
  - [x] Validación obligatoria de kilometraje
  - [x] Auto km=0 cuando condición es "Nuevo"
  - [x] Paso de preview/resumen antes de publicar
  - [x] Guardado de borrador en localStorage
  - [x] Título auto-generado (AÑO MARCA MODELO COLOR)
  - [x] UX mobile: barra de progreso en lugar de círculos
  - [x] UX mobile: scroll centrado al seleccionar tipo
  - [x] UX mobile: scroll al inicio del formulario al cambiar paso
  - [x] Campo puertas oculto para motos
  - [x] Color obligatorio (usado en título auto-generado)
  - [x] Teclado numérico en campos de teléfono (inputMode tel)
  - [x] Contador de fotos con indicador de mínimo (3/15)
  - [x] Campo tracción (2WD/4WD/AWD) para SUV, Pickup y Comerciales
  - [x] Validación formato teléfono chileno (+56 9 XXXX XXXX)
  - [x] Transmisión simplificada a Manual/Automática

### Usuario
- [x] Panel de cuenta de usuario
- [x] Mis publicaciones (CRUD)
- [x] Favoritos
- [x] Configuración de cuenta
- [x] Cambio de contraseña

### Mensajería
- [x] Sistema de chat entre compradores y vendedores
- [x] Lista de conversaciones
- [x] Mensajes en tiempo real (polling)
- [x] Contador de mensajes no leídos
- [x] Marcar como leído

### Catálogos
- [x] Marcas y modelos de vehículos
- [x] Regiones y comunas de Chile
- [x] Tipos de vehículo (Auto, Moto, Comercial)
- [x] Categorías por tipo

### Administración
- [x] Panel de administración
- [x] Gestión de vehículos (aprobar, rechazar, moderar)
- [x] Gestión de usuarios
- [x] Gestión de reportes
- [x] Gestión de marcas y modelos
- [x] Gestión de regiones
- [x] Configuración del sitio
- [x] Dashboard con estadísticas

### Sistema de Dealers (Automotoras)
- [x] Modelo de datos (Dealer, DealerType, DealerStatus, DealerRole)
- [x] Registro de dealer con formulario de 5 pasos
- [x] Validación de RUT chileno
- [x] Panel de dealer con sidebar
- [x] Dashboard de dealer con estadísticas
- [x] Gestión de vehículos del dealer
- [x] Mensajes en contexto de dealer
- [x] Perfil público del dealer (`/automotora/[slug]`)
- [x] Badge de dealer en tarjetas de vehículos
- [x] Admin: Lista de dealers con filtros
- [x] Admin: Aprobar/Rechazar/Suspender dealers
- [x] Sesión extendida con info de dealer (dealerId, dealerRole)
- [x] Menú de usuario con opción "Panel Automotora"
- [x] Redirección inteligente para dealers (publicaciones → dealer/vehiculos)
- [x] APIs de dealer (registro, perfil, vehículos, equipo, stats)

### Sistema de Tracking y Analytics
- [x] Modelo TrackingEvent para eventos de usuario
- [x] Tracking de page views (vehículos, perfiles de dealer, micrositios)
- [x] Tracking de búsquedas realizadas
- [x] Tracking de contactos (WhatsApp, teléfono, chat, formulario)
- [x] Tracking de favoritos (agregar/quitar)
- [x] Tracking de compartir (WhatsApp, Facebook, copiar link)
- [x] Dashboard de estadísticas para dealers (`/dealer/estadisticas`):
  - [x] Tabs: Resumen, Tráfico, Contactos
  - [x] Métricas con comparativa vs período anterior
  - [x] Gráfico de tráfico por día
  - [x] Funnel de conversión (visitantes → vehículos → contactos → leads)
  - [x] Desglose por dispositivo (mobile/desktop/tablet)
  - [x] Desglose por fuente (marketplace/micrositio)
  - [x] Top vehículos por contactos
  - [x] Exportar a CSV
- [x] Dashboard de analytics para admin (`/admin/analytics`):
  - [x] Métricas de plataforma completa
  - [x] Top dealers por contactos
  - [x] Top vehículos por vistas
  - [x] Funnel de conversión global
  - [x] Exportar a CSV

---

## Funcionalidades Pendientes

### Alta Prioridad

#### Directorio de Dealers
- [x] Página `/automotoras` con listado de todos los dealers activos
- [x] Filtros por tipo (Automotora, Rent a Car)
- [x] Filtros por región
- [x] Búsqueda por nombre
- [x] Ordenamiento (más recientes, más vehículos, alfabético)
- [x] Paginación

#### Filtro de Vendedor en Búsqueda
- [x] Agregar filtro "Tipo de vendedor" en `/vehiculos`
- [x] Opciones: Todos, Particular, Automotora
- [x] Actualizar API de búsqueda para soportar filtro

#### Info de Dealer en Detalle de Vehículo
- [x] Cuando el vehículo pertenece a un dealer, mostrar tarjeta con:
  - [x] Logo del dealer
  - [x] Nombre comercial
  - [x] Tipo (badge)
  - [x] Badge de verificado
  - [x] Link al perfil del dealer
  - [x] Botón de contacto directo (WhatsApp)
  - [x] Horarios de atención

#### Upload de Logo/Banner
- [x] Componente de upload de imagen para logo en registro
- [x] Componente de upload de banner en perfil de dealer
- [x] Integración con Cloudinary
- [x] Preview de imágenes

### Media Prioridad

#### Horarios de Atención
- [ ] Mostrar horarios en perfil público del dealer
- [ ] Componente visual de horarios (tabla semanal)
- [ ] Indicador "Abierto ahora" / "Cerrado"
- [ ] Editor de horarios en panel de dealer

#### Gestión de Equipo
- [ ] Invitar usuarios por email
- [ ] Enviar email de invitación con link
- [ ] Aceptar invitación y unirse al dealer
- [ ] Cambiar rol de miembro (Manager, Sales)
- [ ] Eliminar miembro del equipo
- [ ] Historial de actividad por miembro

#### Estadísticas Avanzadas
- [x] Gráfico de vistas por período (día, semana, mes)
- [x] Gráfico de mensajes/contactos recibidos
- [x] Top vehículos más vistos
- [x] Comparativa con período anterior
- [x] Exportar estadísticas a CSV
- [ ] Exportar estadísticas a PDF

### Notificaciones

#### Sistema de Email con Resend
- [x] Configurar Resend como servicio de email transaccional
- [ ] OTP (One-Time Password)
  - [ ] Envío de código OTP para verificación
  - [ ] Validación de código con expiración (5 min)
  - [ ] Rate limiting para evitar abuso
- [x] Verificación de Email
  - [x] Email de verificación al registrar cuenta
  - [x] Link de verificación con token seguro
  - [x] Reenvío de email de verificación
  - [x] Marcar cuenta como verificada
- [x] Password Reset
  - [x] Solicitud de recuperación de contraseña
  - [x] Email con link de reset (token con expiración)
  - [x] Formulario de nueva contraseña
  - [x] Invalidar token después de uso
- [x] Emails Transaccionales (parcial)
  - [x] Email de bienvenida al registrar usuario/dealer
  - [x] Email de aprobación de dealer
  - [x] Email de rechazo de dealer con motivo
  - [x] Email de nuevo mensaje recibido (plantilla lista)
  - [ ] Email de vehículo próximo a expirar
  - [ ] Email de vehículo expirado
- [ ] Notificaciones del Sitio
  - [ ] Preferencias de notificación por usuario
  - [ ] Configuración de frecuencia de emails
- [x] Plantillas de email con branding AutoExplora.cl

#### Notificaciones In-App
- [ ] Modelo de Notification en base de datos
- [ ] API de notificaciones
- [ ] Badge de notificaciones en header
- [ ] Dropdown/página de notificaciones
- [ ] Marcar como leídas
- [ ] Tipos: mensaje, aprobación, expiración, etc.

### SEO y Marketing

#### Meta Tags Dinámicos
- [ ] Open Graph tags para páginas de dealers
- [ ] Twitter cards
- [ ] Schema.org markup para dealers (LocalBusiness)
- [ ] Schema.org markup para vehículos (Vehicle, Product)
- [ ] Sitemap dinámico incluyendo dealers

#### Dealers Destacados
- [ ] Campo `featured` en modelo Dealer
- [ ] Sección "Dealers Destacados" en homepage
- [ ] Carousel o grid de dealers premium
- [ ] Admin: marcar dealer como destacado

### Funcionalidades Adicionales

#### Vehículos
- [ ] Comparador de vehículos (hasta 3)
- [ ] Historial de precios
- [ ] Alertas de precio
- [ ] Compartir en redes sociales
- [ ] Imprimir ficha de vehículo
- [ ] QR code para cada vehículo
- [ ] **Videos en publicaciones**
  - [ ] Subir video directo (Cloudinary)
  - [ ] Embed de YouTube URL
  - [ ] Preview de video en galería
- [ ] **Ficha técnica descargable (PDF)**
  - [ ] Generar PDF con specs del vehículo
  - [ ] Incluir fotos, precio, datos de contacto
  - [ ] Branding del dealer si aplica

#### Score de Calidad de Anuncio
- [ ] Calcular score (0-100%) basado en completitud:
  - Título descriptivo
  - Cantidad de fotos (mínimo 5 = +20%)
  - Descripción detallada
  - Especificaciones completas
  - Video incluido (+10% bonus)
- [ ] Mostrar score en panel de dealer
- [ ] Indicadores visuales de qué falta mejorar
- [ ] Sugerencias automáticas para mejorar calidad

#### Sistema de Promociones/Destacados
- [ ] Tipos de anuncio:
  - Estándar (gratuito, posición normal)
  - Destacado (pago, aparece primero en búsquedas)
  - TopSpot (pago premium, banner en home)
- [ ] Cupos mensuales por plan de dealer
- [ ] Modalidades: Recurrente vs One-Shot
- [ ] Admin: gestionar planes y cupos
- [ ] Contador de días restantes de promoción

#### Leads y CRM Básico
- [x] Tracking de contactos por vehículo:
  - [x] Tipo: WhatsApp, Llamada, Chat, Formulario
  - [ ] Nombre del lead (si disponible)
  - [x] Fecha y hora
  - [ ] Link "Ir al evento" (ver conversación)
- [x] Métricas agregadas en dashboard:
  - [x] Total leads por período
  - [x] Leads por canal (WhatsApp vs Llamada vs Chat vs Form)
  - [x] Tasa de conversión (leads/vistas) - Funnel de conversión
- [x] Export de leads a CSV
- [ ] Notas internas por lead

#### Métricas por Vehículo
- [x] Contador de vistas totales
- [x] Contador de vistas de detalle
- [x] Gráfico de vistas en el tiempo
- [ ] Comparativa con promedio del inventario
- [ ] Días publicado (contador automático)
- [ ] Última modificación (timestamp)

#### Integraciones Externas
- [ ] **Autofact** (verificación vehicular Chile)
  - [ ] Consultar historial del vehículo
  - [ ] Badge "Verificado con Autofact"
  - [ ] Mostrar resumen de informe en detalle
- [ ] **Mercado Libre** (multi-plataforma)
  - [ ] Toggle para publicar en ML
  - [ ] Sincronización de inventario
  - [ ] OAuth para autorizar cuenta ML
- [ ] **Yapo.cl** (futuro)
  - [ ] Similar a ML

#### Dealers
- [ ] Sistema de reviews/calificaciones
- [ ] Certificaciones/badges especiales
- [ ] Promociones y ofertas
- [ ] Catálogo PDF descargable
- [ ] Integración con WhatsApp Business API
- [ ] Widget embebible para sitio web del dealer

#### Importación/Exportación
- [ ] Import masivo de vehículos (CSV/Excel)
- [ ] Template descargable para import
- [ ] Validación y preview antes de importar
- [ ] Export de inventario a CSV/Excel
- [ ] Filtros en export (por estado, fecha, etc.)
- [ ] Sincronización con otros portales

#### Analytics
- [ ] Integración con Google Analytics
- [x] Eventos personalizados (ver teléfono, enviar mensaje, WhatsApp, favoritos, compartir, búsquedas)
- [x] Dashboard de analytics para admin (`/admin/analytics`)
- [ ] Reportes automáticos semanales/mensuales

#### Seguridad
- [x] Rate limiting en APIs (documentación Cloudflare en `cloudflare.md`)
- [ ] Captcha en formularios públicos
- [ ] Detección de spam en mensajes
- [ ] Logs de auditoría para admin
- [ ] 2FA para cuentas de dealer

---

## Mejoras Técnicas

### Performance
- [ ] Optimización de imágenes con next/image
- [ ] Lazy loading de componentes
- [ ] Caché de consultas frecuentes
- [ ] CDN para assets estáticos
- [ ] Compresión de respuestas API

### Testing
- [ ] Tests unitarios con Jest
- [ ] Tests de integración para APIs
- [ ] Tests E2E con Playwright
- [ ] Coverage mínimo 80%

### DevOps
- [ ] CI/CD con GitHub Actions
- [ ] Environments (dev, staging, prod)
- [ ] Database migrations automáticas
- [ ] Monitoreo con Sentry
- [ ] Logs centralizados

### Documentación
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Guía de contribución
- [ ] Guía de deployment
- [ ] Changelog automatizado

---

## Notas de Implementación

### Prioridades Inmediatas
1. Directorio de dealers
2. Filtro de vendedor en búsqueda
3. Info de dealer en detalle de vehículo
4. Upload de logo/banner

### Prioridades Media (Panel Dealer)
1. Score de calidad de anuncio
2. ~~Métricas por vehículo (vistas, días publicado)~~ ✅ Implementado
3. ~~Leads tracking básico~~ ✅ Implementado
4. Videos en publicaciones (YouTube embed)
5. Ficha técnica PDF

### Dependencias Externas Necesarias
- Servicio de email (Resend recomendado)
- Cloudinary (ya configurado)
- Analytics (Google Analytics o similar)
- Autofact API (para verificación vehicular)
- Mercado Libre API (para multi-plataforma)

### Sistema de Tiers de Dealers (Propuesta)

#### Tabla Comparativa

| Feature | Free | Bronce | Plata | Oro |
|---------|------|--------|-------|-----|
| **Precio mensual** | $0 | $29.990 | $59.990 | $119.990 |
| **Precio anual** (2 meses gratis) | $0 | $299.900 | $599.900 | $1.199.900 |
| **Vehículos activos** | 3 | 10 | 25 | Ilimitados |
| **Fotos por vehículo** | 5 | 10 | 15 | 20 |
| **Perfil en marketplace** | Básico | Completo | Completo | Destacado |
| **Micrositio propio** | No | No | Básico | Completo |
| **Dominio personalizado** | No | No | No | Sí |
| **Páginas custom** | 0 | 0 | 2 | Ilimitadas |
| **Analytics** | No | Básico | Completo | Completo + Export |
| **Dashboard de leads** | No | Sí | Sí | Sí |
| **Destacados/mes** | 0 | 1 | 3 | 10 |
| **TopSpot/mes** | 0 | 0 | 0 | 2 |
| **Match (exclusivo)** | No | No | No | Ilimitado |
| **Usuarios del equipo** | 1 | 2 | 3 | Ilimitados |
| **Badge verificado** | No | Sí | Sí | Premium |
| **Soporte** | FAQ | Email | Email + Chat | Prioritario |

#### Feature Match (Solo Oro)

Sistema para conectar compradores que no encuentran lo que buscan con automotoras que pueden tener el vehículo ideal.

**Flujo:**
1. Comprador busca vehículo → No encuentra → Completa formulario Match (anónimo)
2. AutoExplora muestra Match solo a dealers Oro (sin datos del comprador)
3. Dealer Oro responde con propuesta (vehículo de inventario o que puede conseguir)
4. Comprador ve propuestas y decide si revelar sus datos de contacto

**Beneficios:**
- Para comprador: Recibe propuestas sin esfuerzo, control de privacidad
- Para dealer Oro: Leads de alta intención, diferenciador competitivo
- Para AutoExplora: Feature único en Chile, incentivo para tier Oro

### Decisiones Pendientes de Implementación
- Pasarela de pago (Transbank o MercadoPago)
- Modelo de datos para tiers y Match
- UI de página de precios
- Middleware de validación de límites por tier

---

*Última actualización: 25 Enero 2026*
