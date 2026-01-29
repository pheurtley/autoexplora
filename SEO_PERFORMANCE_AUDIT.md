# Auditoría SEO y Performance - AutoExplora.cl

**Fecha inicial:** 2026-01-18
**Última actualización:** 2026-01-28
**Branch:** `fix/seo-audit-critical`

---

## Resumen Ejecutivo

| Categoría | Estado | Prioridad |
|-----------|--------|-----------|
| Metadata básico | ✅ Bueno | - |
| Open Graph / Twitter Cards | ✅ Bueno | - |
| Structured Data (JSON-LD) | ✅ Implementado | - |
| robots.txt | ✅ Implementado | - |
| sitemap.xml | ✅ Implementado | - |
| Canonical URLs | ✅ Implementado | - |
| Breadcrumbs (visual + JSON-LD) | ✅ Implementado | - |
| FAQ Schema | ✅ Implementado | - |
| noindex en páginas protegidas | ✅ Implementado | - |
| Página 404 personalizada | ✅ Implementado | - |
| Security Headers | ✅ Implementado | - |
| rel="noopener noreferrer" | ✅ Corregido | - |
| Home page metadata explícito | ✅ Implementado | - |
| Imágenes optimizadas | ⚠️ Parcial | Media |
| Caching / Revalidation | ⚠️ Parcial | Media |
| Core Web Vitals | ⚠️ Por mejorar | Media |

---

## Historial de Cambios

### 2026-01-28 - Segunda ronda de auditoría

**Implementado:**
1. **Automotoras listing page** - Open Graph tags, BreadcrumbJsonLd, visual Breadcrumbs
2. **Region pages** - FAQ schema (FAQJsonLd) con 4 preguntas en español
3. **Home page** - `generateMetadata()` explícito con canonical, OG image, locale `es_CL`
4. **Página 404 personalizada** - `src/app/not-found.tsx` con links internos y `robots: { index: false }`
5. **Microsite canonical URLs** - layout y contacto con `alternates.canonical`
6. **rel="noopener noreferrer"** - Corregido en 6 archivos con `target="_blank"`
7. **Security headers** - `next.config.ts` con X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy

**Diferido (decisión del usuario):**
- Footer broken links (`/ayuda/*`, `/contacto`, `/terminos`, `/privacidad`, `/cookies`)
- Hardcoded social links (`href="#"`)

### 2026-01-18 → 2026-01-27 - Primera ronda de auditoría

**Implementado:**
- robots.txt con rutas de auth bloqueadas
- sitemap.xml dinámico
- JSON-LD: Organization, WebSite, Vehicle, BreadcrumbList, LocalBusiness, FAQ
- Breadcrumbs visuales en páginas principales
- Canonical URLs en vehículos, marcas, modelos, regiones, automotoras
- noindex en páginas protegidas (admin, dealer, cuenta)
- Alt tags mejorados en imágenes
- Internal links con URLs SEO-friendly
- FAQ Schema en páginas de marca y modelo

---

## 1. SEO - Home Page

### ✅ Lo que está bien

1. **Metadata dinámico desde SiteConfig**
   - `title`, `description`, `keywords` configurables
   - Open Graph y Twitter Cards configurados
   - `lang="es-CL"` correcto en HTML

2. **Metadata explícito en page.tsx** (nuevo)
   - `generateMetadata()` con canonical `/`
   - OG image, locale `es_CL`

3. **Estructura semántica**
   - Uso correcto de `<h1>` en HeroBanner
   - Uso de `<h2>` en secciones
   - Uso de `<section>` para agrupar contenido

4. **Font optimization**
   - Inter font con `display: swap`
   - Variable font para mejor rendimiento

5. **Structured Data**
   - OrganizationJsonLd
   - WebSiteJsonLd con SearchAction

---

## 2. SEO - Vehicle Detail Page

### ✅ Lo que está bien

1. **Open Graph completo**
2. **Twitter Cards** con `summary_large_image`
3. **Canonical URL** configurada
4. **Alt text** en imágenes
5. **VehicleJsonLd** schema
6. **BreadcrumbJsonLd** schema

---

## 3. Performance - Análisis

### ✅ Lo que está bien

1. **Next.js Image Optimization**
   - Uso de `next/image` en mayoría de componentes
   - `sizes` attribute configurado correctamente
   - `priority` en imágenes above-the-fold

2. **Server Components**
   - Home page usa Server Components
   - Data fetching en servidor (no client-side)

3. **Suspense boundaries**
   - Skeleton loaders para cada sección
   - Streaming de contenido

4. **Preloading de imágenes**
   - ImageGallery precarga imágenes adyacentes

5. **Security Headers** (nuevo)
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy (camera, microphone, geolocation disabled)

### ⚠️ Problemas de Performance pendientes

1. **Imágenes con `<img>` nativo** (7 instancias)
   ```
   - src/components/admin/AdminSidebar.tsx:137
   - src/components/layout/Header.tsx:85
   - src/components/layout/Footer.tsx:88
   - src/components/dealer/DealerLayoutClient.tsx:45
   - src/components/dealer/DealerSidebar.tsx:83
   - src/components/vehicles/VehicleCard.tsx:118 (dealer logo)
   - src/components/ui/SingleImageUpload.tsx:129
   ```
   **Impacto:** Sin optimización de formato (WebP/AVIF), sin lazy loading nativo

2. **Preconnect a Cloudinary**
   - Pendiente agregar `<link rel="preconnect" href="https://res.cloudinary.com" />`

---

## 4. Checklist de Implementación

- [x] Crear `src/app/robots.ts`
- [x] Crear `src/app/sitemap.ts`
- [x] Crear JSON-LD components (Organization, WebSite, Vehicle, Breadcrumb, LocalBusiness, FAQ)
- [x] Agregar JSON-LD a Home page
- [x] Agregar JSON-LD a Vehicle detail page
- [x] Agregar BreadcrumbJsonLd a todas las páginas públicas
- [x] Agregar Breadcrumbs visuales
- [x] Canonical URLs en todas las páginas públicas
- [x] noindex en páginas protegidas
- [x] Mejorar alt tags en imágenes
- [x] Internal links con URLs SEO-friendly
- [x] FAQ Schema en marcas y modelos
- [x] FAQ Schema en regiones
- [x] Open Graph tags en automotoras listing
- [x] Home page metadata explícito (canonical, OG image, locale)
- [x] Página 404 personalizada con noindex
- [x] Microsite canonical URLs
- [x] `rel="noopener noreferrer"` en links `target="_blank"`
- [x] Security headers en next.config.ts
- [ ] Reemplazar `<img>` por `next/image` (7 archivos)
- [ ] Agregar preconnect a Cloudinary en layout
- [ ] Footer links rotos (`/ayuda/*`, `/contacto`, etc.) - diferido
- [ ] Social links hardcoded (`href="#"`) - diferido

---

## 5. Herramientas de Validación

Después de implementar, validar con:

1. **Google Rich Results Test**
   https://search.google.com/test/rich-results

2. **Schema.org Validator**
   https://validator.schema.org/

3. **Facebook Sharing Debugger**
   https://developers.facebook.com/tools/debug/

4. **Twitter Card Validator**
   https://cards-dev.twitter.com/validator

5. **Google PageSpeed Insights**
   https://pagespeed.web.dev/

6. **Lighthouse** (Chrome DevTools)

---

*Generado el: 2026-01-18*
*Actualizado el: 2026-01-28*
