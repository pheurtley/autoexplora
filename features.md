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

---

## Funcionalidades Pendientes

### Alta Prioridad

#### Directorio de Dealers
- [x] Página `/automotoras` con listado de todos los dealers activos
- [ ] Filtros por tipo (Automotora, Rent a Car)
- [ ] Filtros por región
- [ ] Búsqueda por nombre
- [ ] Ordenamiento (más recientes, más vehículos, alfabético)
- [ ] Paginación

#### Filtro de Vendedor en Búsqueda
- [ ] Agregar filtro "Tipo de vendedor" en `/vehiculos`
- [ ] Opciones: Todos, Particular, Automotora, Rent a Car
- [ ] Actualizar API de búsqueda para soportar filtro

#### Info de Dealer en Detalle de Vehículo
- [ ] Cuando el vehículo pertenece a un dealer, mostrar tarjeta con:
  - Logo del dealer
  - Nombre comercial
  - Tipo (badge)
  - Badge de verificado
  - Link al perfil del dealer
  - Botón de contacto directo

#### Upload de Logo/Banner
- [ ] Componente de upload de imagen para logo en registro
- [ ] Componente de upload de banner en perfil de dealer
- [ ] Integración con Cloudinary
- [ ] Preview y crop de imágenes

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
- [ ] Gráfico de vistas por período (día, semana, mes)
- [ ] Gráfico de mensajes/contactos recibidos
- [ ] Top vehículos más vistos
- [ ] Comparativa con período anterior
- [ ] Exportar estadísticas a CSV/PDF

### Notificaciones

#### Sistema de Email con Resend
- [ ] Configurar Resend como servicio de email transaccional
- [ ] OTP (One-Time Password)
  - [ ] Envío de código OTP para verificación
  - [ ] Validación de código con expiración (5 min)
  - [ ] Rate limiting para evitar abuso
- [ ] Verificación de Email
  - [ ] Email de verificación al registrar cuenta
  - [ ] Link de verificación con token seguro
  - [ ] Reenvío de email de verificación
  - [ ] Marcar cuenta como verificada
- [ ] Password Reset
  - [ ] Solicitud de recuperación de contraseña
  - [ ] Email con link de reset (token con expiración)
  - [ ] Formulario de nueva contraseña
  - [ ] Invalidar token después de uso
- [ ] Emails Transaccionales
  - [ ] Email de bienvenida al registrar usuario/dealer
  - [ ] Email de aprobación de dealer
  - [ ] Email de rechazo de dealer con motivo
  - [ ] Email de nuevo mensaje recibido
  - [ ] Email de vehículo próximo a expirar
  - [ ] Email de vehículo expirado
- [ ] Notificaciones del Sitio
  - [ ] Preferencias de notificación por usuario
  - [ ] Configuración de frecuencia de emails
- [ ] Plantillas de email con branding AutoExplora.cl

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
- [ ] Export de inventario a CSV
- [ ] Sincronización con otros portales

#### Analytics
- [ ] Integración con Google Analytics
- [ ] Eventos personalizados (ver teléfono, enviar mensaje, etc.)
- [ ] Dashboard de analytics para admin
- [ ] Reportes automáticos semanales/mensuales

#### Seguridad
- [ ] Rate limiting en APIs
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

### Dependencias Externas Necesarias
- Servicio de email (Resend recomendado)
- Cloudinary (ya configurado)
- Analytics (Google Analytics o similar)

### Decisiones Pendientes
- Sistema de pagos para dealers premium
- Planes de suscripción y precios
- Límites de publicaciones por plan

---

*Última actualización: Enero 2025*
