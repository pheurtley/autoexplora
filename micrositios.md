# Mejoras Micrositios

## Mejoras de Apariencia

### Header & Footer
- Variantes de header (centrado, logo izquierda + nav derecha, hamburger siempre)
- [x] Footer con redes sociales (Instagram, Facebook, TikTok)
- Header sticky con transparencia en el hero
- [x] Opcion de mostrar/ocultar telefono en el header

### Home Page
- [x] Hero con imagen de fondo (upload desde el panel)
- Seccion de resenas de Google (activable desde el panel de micrositio)
- Mapa de Google Maps con ubicacion del dealer (activable desde el panel de micrositio)
- Slider/carousel de vehiculos destacados en vez de grid
- Banner promocional configurable (ej: "Financiamiento 0%")
- Contador de vehiculos vendidos / anos en el mercado
- [x] Seccion "¿Por que elegirnos?" configurable (titulo, subtitulo, features con iconos)

### Vehiculos
- Vista de lista ademas de grid
- Filtro por precio con slider range
- Comparador de vehiculos (seleccionar 2-3 y ver lado a lado)
- Badges personalizables (ej: "Recien llegado", "Ultimo disponible")
- Galeria de imagenes fullscreen con zoom

### Paginas Custom
- [x] Bloques de contenido: titulo, parrafo, imagen, video, CTA, lista, separador
- Bloque de galeria de imagenes (multiples)
- Bloque de acordeon/FAQ
- Bloque de mapa (Google Maps embed)
- Bloque de formulario de contacto embebido
- Bloque de grid de imagenes con lightbox

### General
- Tipografia seleccionable (Inter, Poppins, Montserrat, etc.)
- Modo oscuro automatico
- Animaciones de scroll (fade-in al hacer scroll)
- [x] Pagina 404 personalizada del micrositio

---

## Mejoras de Gestion (Panel Admin)

### Configuracion
- Preview en vivo del micrositio dentro del panel (iframe)
- Historial de cambios con opcion de revertir
- Duplicar configuracion de un micrositio a otro
- Templates predisenados para arrancar rapido

### Vehiculos
- Ordenar vehiculos destacados manualmente (drag & drop)
- Ocultar vehiculos especificos del micrositio sin cambiar su estado global
- Etiquetas/tags personalizados por dealer

### Paginas
- Drag & drop para reordenar bloques
- Duplicar paginas existentes
- Preview de la pagina antes de publicar
- Editor WYSIWYG en vez de campos separados por bloque
- Versionado de contenido (borradores)

### Dominios
- [x] Gestion de dominios personalizados (agregar, eliminar, verificar DNS)
- Provision automatica de SSL via Vercel API al verificar dominio
- Agregar dominio a Vercel automaticamente desde el panel
- Monitoreo de estado del dominio (health check periodico)

### Leads/Contacto
- [x] Dashboard de leads recibidos por micrositio
- [x] Marcar leads como leidos/contactados
- Notificaciones por email al dealer cuando llega un lead
- [x] Exportar leads/contactos a CSV

### Analytics
- [x] Dashboard interno con metricas (visitas, leads, vehiculos mas vistos)
- [x] Reporte de rendimiento del micrositio por periodo (7, 30, 90 días)
- [x] Tracking de page views en micrositios (MICROSITE_HOME_VIEW, VEHICLE_VIEW)
- [x] Desglose por fuente (marketplace vs micrositio)
- [x] Funnel de conversión
- [x] Exportar métricas a CSV
- Heatmap de clics en la pagina

### SEO
- [x] Meta title y meta description configurables
- [x] Google Analytics ID y Meta Pixel ID
- [x] JSON-LD (LocalBusiness, Vehicle)
- Editor de OG image con template visual (texto sobre imagen)
- Sugerencias automaticas de meta description
- Validador de SEO (chequear que todo este completo)
- Redirecciones 301 configurables

---

## CRM

### Pipeline y Gestion de Leads
- Kanban visual del pipeline (drag & drop: Nuevo → Contactado → Calificado → En negociacion → Convertido/Perdido)
- Asignacion de leads a miembros del equipo
- Lead scoring automatico (basado en engagement: visitas, vehiculos vistos, formularios)
- Origen del lead (micrositio, marketplace, Instagram, referido)
- Deteccion de duplicados por email/telefono

### Seguimiento y Comunicacion
- Recordatorios de follow-up (agendar tareas: "llamar en 2 dias")
- Historial de interacciones (log de llamadas, mensajes, emails por contacto)
- Respuesta automatica configurable cuando llega un lead nuevo
- Templates de mensajes predefinidos para WhatsApp/email
- Integracion WhatsApp Business API (enviar/recibir desde el panel)

### Oportunidades y Ventas
- Tracking de oportunidades (asociar lead a vehiculo con monto estimado)
- Match de inventario (notificar cuando entra un vehiculo que coincide con busqueda del lead)
- Agenda de test drives (reservar pruebas de manejo desde el micrositio)
- Cotizador integrado (generar cotizaciones con financiamiento desde el panel)

### Post-venta
- Seguimiento post-venta (encuesta de satisfaccion automatica)
- Solicitud de resena en Google automatica post-compra
- Recordatorios de servicio (mantenimientos, vencimiento de documentos)
- Historial del cliente (vehiculos comprados, servicios realizados)

### Reportes CRM
- Embudo de conversion (tasa por etapa)
- Tiempo promedio de cierre (cuanto tarda un lead en convertir)
- Rendimiento por vendedor (leads atendidos, convertidos, tiempo de respuesta)
- Fuentes mas efectivas (que canal trae leads que convierten mas)

### Integraciones
- Sync con HubSpot/Pipedrive/Salesforce
- Webhook para eventos (notificar sistemas externos cuando un lead cambia de estado)
- API publica para que el dealer conecte sus herramientas
