# Auditoría SEO y Performance - AutoExplora.cl

**Fecha:** 2026-01-18
**Branch:** `analysis/seo-performance-audit`

---

## Resumen Ejecutivo

| Categoría | Estado | Prioridad |
|-----------|--------|-----------|
| Metadata básico | ✅ Bueno | - |
| Open Graph / Twitter Cards | ✅ Bueno | - |
| Structured Data (JSON-LD) | ❌ Faltante | Alta |
| robots.txt | ❌ Faltante | Alta |
| sitemap.xml | ❌ Faltante | Alta |
| Imágenes optimizadas | ⚠️ Parcial | Media |
| Caching / Revalidation | ⚠️ Parcial | Media |
| Core Web Vitals | ⚠️ Por mejorar | Media |

---

## 1. SEO - Home Page

### ✅ Lo que está bien

1. **Metadata dinámico desde SiteConfig**
   - `title`, `description`, `keywords` configurables
   - Open Graph y Twitter Cards configurados
   - `lang="es-CL"` correcto en HTML

2. **Estructura semántica**
   - Uso correcto de `<h1>` en HeroBanner
   - Uso de `<h2>` en secciones
   - Uso de `<section>` para agrupar contenido

3. **Font optimization**
   - Inter font con `display: swap`
   - Variable font para mejor rendimiento

### ❌ Problemas encontrados

1. **Sin robots.txt**
   - No existe archivo `robots.txt` ni `src/app/robots.ts`
   - Los crawlers no tienen guía de qué indexar

2. **Sin sitemap.xml**
   - No existe sitemap dinámico
   - Dificulta indexación de vehículos y páginas

3. **Sin Structured Data (JSON-LD)**
   - No hay schema.org para Organization
   - No hay schema.org para WebSite con SearchAction
   - Impacta rich snippets en Google

4. **Home page sin metadata propio**
   - Depende completamente del layout
   - No tiene canonical URL explícita

---

## 2. SEO - Vehicle Detail Page

### ✅ Lo que está bien

1. **Open Graph completo** (recién implementado)
   ```typescript
   openGraph: {
     title: "Toyota Corolla 2024",
     description: "Usado · 15.000 km · $12.500.000...",
     images: [{ url: imageUrl, width: 1200, height: 630 }],
   }
   ```

2. **Twitter Cards** con `summary_large_image`

3. **Canonical URL** configurada

4. **Alt text** en imágenes

### ❌ Problemas encontrados

1. **Sin Structured Data para Vehicle**
   ```json
   // Debería tener:
   {
     "@context": "https://schema.org",
     "@type": "Vehicle",
     "name": "Toyota Corolla 2024",
     "brand": { "@type": "Brand", "name": "Toyota" },
     "model": "Corolla",
     "vehicleModelDate": "2024",
     "mileageFromOdometer": { "@type": "QuantitativeValue", "value": "15000", "unitCode": "KMT" },
     "offers": { "@type": "Offer", "price": "12500000", "priceCurrency": "CLP" }
   }
   ```

2. **Sin BreadcrumbList schema**
   - Breadcrumb visual existe pero sin markup

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

### ⚠️ Problemas de Performance

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

2. **Sin caching en getSiteConfig()**
   - Se llama en cada request
   - Debería usar `unstable_cache` o revalidación

3. **Múltiples queries en HeroBanner**
   - 3 queries separadas para stats
   - Podrían combinarse o cachearse

4. **Sin revalidation en pages**
   - Home page no tiene `revalidate` export
   - Se regenera en cada request

---

## 4. Recomendaciones por Prioridad

### Alta Prioridad

#### 4.1 Crear robots.txt
```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/cuenta/', '/dealer/'],
    },
    sitemap: 'https://autoexplora.cl/sitemap.xml',
  }
}
```

#### 4.2 Crear sitemap.xml dinámico
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
  })

  const brands = await prisma.brand.findMany({
    select: { slug: true },
  })

  const dealers = await prisma.dealer.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true },
  })

  return [
    { url: 'https://autoexplora.cl', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://autoexplora.cl/vehiculos', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    ...vehicles.map((v) => ({
      url: `https://autoexplora.cl/vehiculos/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...brands.map((b) => ({
      url: `https://autoexplora.cl/vehiculos?brand=${b.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...dealers.map((d) => ({
      url: `https://autoexplora.cl/automotora/${d.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
```

#### 4.3 Agregar JSON-LD Structured Data

**Para Home (Organization + WebSite):**
```typescript
// src/components/seo/HomeJsonLd.tsx
export function HomeJsonLd({ siteName, siteUrl, logo }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": siteName,
        "url": siteUrl,
        "logo": logo,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": siteName,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/vehiculos?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Para Vehicle Detail:**
```typescript
// src/components/seo/VehicleJsonLd.tsx
export function VehicleJsonLd({ vehicle }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": vehicle.title,
    "brand": { "@type": "Brand", "name": vehicle.brand.name },
    "model": vehicle.model.name,
    "vehicleModelDate": String(vehicle.year),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": vehicle.mileage,
      "unitCode": "KMT"
    },
    "fuelType": vehicle.fuelType,
    "vehicleTransmission": vehicle.transmission,
    "image": vehicle.images[0]?.url,
    "offers": {
      "@type": "Offer",
      "price": vehicle.price,
      "priceCurrency": "CLP",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": vehicle.dealer ? "AutoDealer" : "Person",
        "name": vehicle.dealer?.tradeName || vehicle.user.name
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### Media Prioridad

#### 4.4 Reemplazar `<img>` por `next/image`
- Header logo
- Footer logo
- VehicleCard dealer logo
- Dealer sidebars

#### 4.5 Agregar caching a getSiteConfig
```typescript
import { unstable_cache } from 'next/cache'

export const getSiteConfig = unstable_cache(
  async () => {
    // ... existing code
  },
  ['site-config'],
  { revalidate: 300 } // 5 minutes
)
```

#### 4.6 Agregar revalidation a Home page
```typescript
// src/app/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds
```

### Baja Prioridad

#### 4.7 Agregar BreadcrumbList JSON-LD
```typescript
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://autoexplora.cl" },
    { "@type": "ListItem", "position": 2, "name": "Toyota", "item": "https://autoexplora.cl/vehiculos?brand=toyota" },
    { "@type": "ListItem", "position": 3, "name": "Corolla" }
  ]
}
```

#### 4.8 Preconnect a Cloudinary
```html
<link rel="preconnect" href="https://res.cloudinary.com" />
```

---

## 5. Checklist de Implementación

- [ ] Crear `src/app/robots.ts`
- [ ] Crear `src/app/sitemap.ts`
- [ ] Crear `src/components/seo/HomeJsonLd.tsx`
- [ ] Crear `src/components/seo/VehicleJsonLd.tsx`
- [ ] Crear `src/components/seo/BreadcrumbJsonLd.tsx`
- [ ] Agregar JSON-LD a Home page
- [ ] Agregar JSON-LD a Vehicle detail page
- [ ] Reemplazar `<img>` por `next/image` (7 archivos)
- [ ] Agregar `unstable_cache` a `getSiteConfig`
- [ ] Agregar `revalidate` a Home page
- [ ] Agregar preconnect a Cloudinary en layout

---

## 6. Herramientas de Validación

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
