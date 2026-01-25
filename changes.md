# Resumen de Cambios por Branch

## Branch: `feature/enhanced-tracking`

**Commits:**
- `a6f00c1` Fix TrackingEvent API: use hardcoded event types instead of Prisma enum import
- `f20692c` Add comprehensive tracking system with analytics dashboards

**Cambios realizados:**

1. **Nuevo modelo de tracking en Prisma**
   - `TrackingEvent` model para registrar eventos de usuario
   - `TrackingEventType` enum con 15 tipos de eventos:
     - Contacto: `WHATSAPP_CLICK`, `PHONE_REVEAL`, `PHONE_CALL`, `CHAT_START`, `CONTACT_FORM`
     - Vistas: `PAGE_VIEW`, `VEHICLE_VIEW`, `DEALER_PROFILE_VIEW`, `MICROSITE_HOME_VIEW`, `IMAGE_GALLERY_VIEW`
     - Interacciones: `SEARCH_PERFORMED`, `FILTER_APPLIED`, `FAVORITE_ADDED`, `FAVORITE_REMOVED`, `SHARE_CLICK`

2. **API de tracking**
   - `POST /api/events/track` - Registrar cualquier evento de tracking
   - `GET /api/dealer/stats/traffic` - Estadísticas de tráfico para dealers
   - `GET /api/dealer/stats/funnel` - Funnel de conversión para dealers
   - `GET /api/admin/analytics` - Analytics de toda la plataforma para admin

3. **Hook useTracking**
   - `trackEvent()` - Evento genérico
   - `trackPageView()` - Vistas de página (con deduplicación por sesión)
   - `trackSearch()` - Búsquedas realizadas
   - `trackContact()` - Eventos de contacto
   - `trackFavorite()` - Agregar/quitar favoritos
   - `trackShare()` - Compartir en redes

4. **Componente PageViewTracker**
   - Componente cliente para usar en páginas server-rendered
   - Registra automáticamente page views

5. **Dashboard de estadísticas para dealers** (`/dealer/estadisticas`)
   - 3 tabs: Resumen, Tráfico, Contactos
   - Selector de período (7, 30, 90 días)
   - Métricas con indicador de cambio vs período anterior
   - Gráfico de tráfico por día
   - Funnel de conversión visual
   - Desglose por dispositivo y fuente
   - Top vehículos por contactos
   - Exportar a CSV

6. **Dashboard de analytics para admin** (`/admin/analytics`)
   - Métricas globales de la plataforma
   - Vistas, visitantes, contactos, leads, búsquedas, favoritos, shares
   - Funnel de conversión global
   - Top dealers por contactos
   - Top vehículos por vistas
   - Desglose por dispositivo, fuente, tipo de contacto
   - Exportar a CSV

7. **Integración de tracking en páginas existentes**
   - Vehículo detalle: `VEHICLE_VIEW`
   - Perfil de dealer: `DEALER_PROFILE_VIEW`
   - Micrositio home: `MICROSITE_HOME_VIEW`
   - Micrositio vehículo: `VEHICLE_VIEW` (source: microsite)
   - SearchWidget: `SEARCH_PERFORMED`
   - FavoriteButton: `FAVORITE_ADDED`, `FAVORITE_REMOVED`
   - ShareButtons: `SHARE_CLICK`

**Archivos nuevos:**
- `src/app/api/events/track/route.ts`
- `src/app/api/dealer/stats/traffic/route.ts`
- `src/app/api/dealer/stats/funnel/route.ts`
- `src/app/api/admin/analytics/route.ts`
- `src/app/admin/analytics/page.tsx`
- `src/hooks/useTracking.ts`
- `src/components/tracking/PageViewTracker.tsx`
- `src/components/tracking/index.ts`

**Archivos modificados:**
- `prisma/schema.prisma` (nuevo modelo TrackingEvent)
- `src/app/dealer/estadisticas/page.tsx` (reescrito completamente)
- `src/app/vehiculos/[slug]/page.tsx`
- `src/app/automotora/[slug]/page.tsx`
- `src/app/microsite/[domain]/page.tsx`
- `src/app/microsite/[domain]/vehiculos/[slug]/page.tsx`
- `src/components/home/SearchWidget.tsx`
- `src/components/vehicles/FavoriteButton.tsx`
- `src/components/vehicles/ShareButtons.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/hooks/index.ts`

---

## Branch: `feature/home-admin-config`

**Commits:**
- `f6b69d2` Add subtle animations and polish to Home page
- `dbc595c` Add Home section configuration fields to SiteConfig
- `5861652` Add Home configuration sections to Admin panel
- `9e334b2` Add configurable props to Home section components
- `b1515ed` Add TopDealers section to Home page
- `7a18bed` Enhance SearchWidget with additional filters
- `9758cf2` Integrate Home page with SiteConfig

**Cambios realizados:**

1. **Configuración del Home desde Admin**
   - Textos configurables: WhyChooseUs (título, subtítulo), CTA (título, subtítulo, botón)
   - Visibilidad de secciones: toggles para mostrar/ocultar cada sección
   - Límites configurables: cantidad de vehículos destacados, recientes, marcas, dealers

2. **Nueva sección TopDealers**
   - Componente `TopDealers.tsx` - muestra dealers ordenados por cantidad de vehículos
   - Componente `AnimatedDealersGrid.tsx` - grid con animaciones de scroll
   - Muestra: logo, nombre, tipo, región, cantidad de vehículos

3. **SearchWidget mejorado**
   - Filtro de año (desde 2000 hasta año actual)
   - Filtro de región (carga lazy desde API)
   - Filtros avanzados colapsables en mobile
   - Layout responsive mejorado

4. **Integración con SiteConfig**
   - Home page lee configuración desde base de datos
   - Renderizado condicional de secciones según `showXXX` flags
   - Límites dinámicos pasados a componentes

**Archivos nuevos:**
- `src/components/home/TopDealers.tsx`
- `src/components/home/AnimatedDealersGrid.tsx`

**Archivos modificados:**
- `prisma/schema.prisma` (16 nuevos campos en SiteConfig)
- `src/lib/config.ts`
- `src/app/admin/configuracion/page.tsx`
- `src/app/api/admin/configuracion/route.ts`
- `src/app/api/site-config/route.ts`
- `src/components/providers/SiteConfigProvider.tsx`
- `src/components/home/WhyChooseUs.tsx`
- `src/components/home/CTASection.tsx`
- `src/components/home/FeaturedVehicles.tsx`
- `src/components/home/RecentVehicles.tsx`
- `src/components/home/PopularBrands.tsx`
- `src/components/home/SearchWidget.tsx`
- `src/app/page.tsx`

---

## Branch: `fix/vehicle-search-filters`

**Commits:**
- `94c882f` Fix enum validation in vehicle search filters
- `37b2b6b` Fix vehicle type filter not working in search

**Cambios realizados:**

1. **Validación de enums en búsqueda**
   - Validación de `VehicleType`, `VehicleCategory`, `VehicleCondition`, `FuelType`, `Transmission`
   - Previene errores de Prisma cuando se pasan valores inválidos

2. **Fix filtro de tipo de vehículo**
   - SearchWidget ahora envía `vehicleType` en lugar de `type`
   - Página de vehículos acepta ambos parámetros (backwards compatibility)
   - URL `?type=MOTO` ahora funciona correctamente

**Archivos modificados:**
- `src/app/vehiculos/page.tsx`
- `src/components/home/SearchWidget.tsx`

---

## Branch: `feature/vehicle-detail-improvements`

**Commits:**
- `a97139b` Add vehicle detail improvements: related vehicles and share features

**Cambios realizados:**

1. **Vehículos relacionados**
   - Componente `RelatedVehicles.tsx`
   - Muestra hasta 4 vehículos similares
   - Prioriza misma marca, luego rango de precio similar (±20%)

2. **Botones de compartir**
   - Componente `ShareButtons.tsx`
   - Web Share API nativo con fallback
   - Opciones: Copiar enlace, WhatsApp, Facebook

3. **Copiar teléfono**
   - Botón de copiar junto al número de teléfono en `ContactCard`
   - Feedback visual al copiar

**Archivos nuevos:**
- `src/components/vehicles/RelatedVehicles.tsx`
- `src/components/vehicles/ShareButtons.tsx`

**Archivos modificados:**
- `src/app/vehiculos/[slug]/page.tsx`
- `src/components/vehicles/ContactCard.tsx`
- `src/components/vehicles/index.ts`

---

## Branch: `feature/messaging-improvements`

**Commits:**
- `4fddeb2` Improve messaging system with enhanced UX and dealer features
- `1bce9f5` Fix chat scroll behavior to not affect page scroll
- `d0b9507` Hide AccountSidebar on mobile to avoid menu duplication
- `dc72b32` Improve mobile chat experience with fullscreen conversation view

**Cambios realizados:**

1. **UI/UX mejorada en lista de conversaciones**
   - Búsqueda por nombre de usuario, vehículo o contenido de mensaje
   - Filtros: Todas, No leídas, Leídas
   - Skeleton loaders durante carga
   - Diseño mejorado con indicador de barra lateral para no leídos
   - Avatar del usuario superpuesto en imagen del vehículo

2. **Plantillas de mensajes para dealers**
   - Componente `MessageTemplates.tsx`
   - 6 respuestas rápidas predefinidas:
     - Disponible
     - No disponible
     - Agendar visita
     - Ubicación
     - Precio negociable
     - Más información
   - Solo visible en panel de automotora (`isDealer={true}`)

3. **Notificaciones de sonido**
   - Hook `useNotificationSound.ts`
   - Sonido al recibir mensaje nuevo
   - Sonido al enviar mensaje
   - Toggle para activar/desactivar (persiste en localStorage)
   - Usa Web Audio API (sin archivos de audio externos)

4. **Mejoras en ChatWindow**
   - Separadores de fecha entre mensajes
   - Mejor estado vacío
   - Skeleton loader durante carga
   - Scroll contenido (no afecta scroll de página)

5. **Experiencia mobile optimizada**
   - Chat fullscreen en páginas de conversación
   - Posicionamiento fixed debajo del header
   - Footer oculto en mobile (visible en desktop)
   - AccountSidebar oculto en mobile (evita duplicación con menú hamburguesa)
   - Sin scroll de página innecesario

6. **Indicador de escritura**
   - Componente `TypingIndicator.tsx` (preparado para uso futuro)
   - Animación de puntos estilo WhatsApp

**Archivos nuevos:**
- `src/components/chat/ConversationSkeleton.tsx`
- `src/components/chat/MessageTemplates.tsx`
- `src/components/chat/TypingIndicator.tsx`
- `src/components/layout/ConditionalFooter.tsx`
- `src/hooks/useNotificationSound.ts`

**Archivos modificados:**
- `src/components/chat/ConversationList.tsx`
- `src/components/chat/ConversationItem.tsx`
- `src/components/chat/ChatWindow.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/chat/index.ts`
- `src/components/cuenta/AccountSidebar.tsx`
- `src/components/layout/index.ts`
- `src/hooks/index.ts`
- `src/app/layout.tsx`
- `src/app/cuenta/mensajes/[conversationId]/page.tsx`
- `src/app/dealer/mensajes/[conversationId]/page.tsx`

---

## Resumen Total

| Branch | Commits | Archivos Nuevos | Archivos Modificados |
|--------|---------|-----------------|---------------------|
| feature/enhanced-tracking | 2 | 8 | 11 |
| feature/home-admin-config | 7 | 2 | 13 |
| fix/vehicle-search-filters | 2 | 0 | 2 |
| feature/vehicle-detail-improvements | 1 | 2 | 4 |
| feature/messaging-improvements | 4 | 5 | 11 |
| **Total** | **16** | **17** | **41** |

---

*Última actualización: 2026-01-25*
