# Guía de Despliegue - AutoExplora.cl

## Stack de Producción (100% Gratis)

| Servicio | Proveedor | Plan |
|----------|-----------|------|
| App (Next.js) | Vercel | Hobby (Gratis) |
| Base de Datos | Neon | Free (0.5GB) |
| Imágenes | Cloudinary | Free (25GB) |

---

## 1. Configurar Neon (Base de Datos)

### 1.1 Crear cuenta y proyecto

1. Ir a [neon.tech](https://neon.tech) y crear cuenta
2. Crear un nuevo proyecto llamado `autoexplora`
3. Seleccionar región: **South America (São Paulo)** para mejor latencia en Chile

### 1.2 Obtener connection strings

En el dashboard de Neon, ir a **Connection Details** y copiar:

- **Pooled connection** (para la app):
  ```
  postgresql://user:password@ep-xxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
  ```

- **Direct connection** (para migraciones):
  ```
  postgresql://user:password@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
  ```

> **Nota**: La conexión pooled tiene `-pooler` en el hostname.

---

## 2. Configurar Cloudinary

### 2.1 Crear cuenta

1. Ir a [cloudinary.com](https://cloudinary.com) y crear cuenta
2. En el Dashboard, copiar:
   - Cloud Name
   - API Key
   - API Secret

### 2.2 Configurar upload preset (opcional)

Para uploads desde el cliente:
1. Settings → Upload → Upload presets
2. Crear preset `autoexplora` con modo `unsigned`

---

## 3. Configurar OAuth Providers

### 3.1 Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto o seleccionar existente
3. APIs & Services → Credentials → Create Credentials → OAuth client ID
4. Application type: Web application
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-dominio.vercel.app/api/auth/callback/google` (producción)

### 3.2 Facebook OAuth

1. Ir a [Facebook Developers](https://developers.facebook.com)
2. Create App → Consumer
3. Add Product → Facebook Login
4. Settings → Basic → copiar App ID y App Secret
5. Facebook Login → Settings → Valid OAuth Redirect URIs:
   - `https://tu-dominio.vercel.app/api/auth/callback/facebook`

---

## 4. Desplegar en Vercel

### 4.1 Conectar repositorio

1. Ir a [vercel.com](https://vercel.com) y crear cuenta (usar GitHub)
2. "Add New Project"
3. Importar repositorio `portalandino` desde GitHub

### 4.2 Configurar variables de entorno

En Vercel → Project Settings → Environment Variables, agregar:

```bash
# Base de Datos (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=<generar-con-openssl-rand-base64-32>

# Google OAuth
AUTH_GOOGLE_ID=xxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=xxx

# Facebook OAuth
AUTH_FACEBOOK_ID=xxx
AUTH_FACEBOOK_SECRET=xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME=AutoExplora
```

### 4.3 Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 4.4 Deploy

El deploy es automático al hacer push a `main`. Para deploy manual:

```bash
npx vercel --prod
```

---

## 5. Migrar Base de Datos

### 5.1 Primera vez (crear tablas)

Ejecutar localmente con las credenciales de Neon:

```bash
# Configurar variables de entorno locales
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."

# Aplicar schema
npx prisma db push

# (Opcional) Cargar datos iniciales
npm run db:seed
```

### 5.2 Para migraciones futuras

```bash
# Crear migración
npx prisma migrate dev --name descripcion_cambio

# Aplicar en producción
npx prisma migrate deploy
```

---

## 6. Verificación Post-Deploy

### Checklist

- [ ] App accesible en URL de Vercel
- [ ] Login con Google funciona
- [ ] Login con Facebook funciona
- [ ] Registro con email/password funciona
- [ ] Subir imágenes a Cloudinary funciona
- [ ] Crear vehículo funciona
- [ ] Ver listado de vehículos funciona
- [ ] Sistema de mensajería funciona
- [ ] Panel de admin accesible

### Verificar logs

En Vercel → Project → Logs, revisar errores de:
- Conexión a base de datos
- Autenticación OAuth
- Uploads de Cloudinary

---

## 7. Dominio Personalizado (Opcional)

### 7.1 En Vercel

1. Project Settings → Domains
2. Agregar dominio: `autoexplora.cl`
3. Configurar DNS según instrucciones de Vercel

### 7.2 Actualizar variables

Después de configurar dominio, actualizar:
- `NEXTAUTH_URL=https://autoexplora.cl`
- `NEXT_PUBLIC_APP_URL=https://autoexplora.cl`
- Redirect URIs en Google y Facebook OAuth

---

## 8. Monitoreo y Mantenimiento

### Vercel Analytics (incluido en plan Hobby)

- Web Vitals
- Errores de runtime
- Uso de funciones

### Neon Dashboard

- Uso de storage
- Conexiones activas
- Query performance

### Cloudinary Dashboard

- Uso de storage
- Bandwidth consumido
- Transformaciones

---

## 9. Escalado Futuro

| Servicio | Plan Gratis | Primer Plan Pago | Cuándo escalar |
|----------|-------------|------------------|----------------|
| Vercel | Hobby | Pro $20/mes | >100GB bandwidth |
| Neon | Free | Launch $19/mes | >0.5GB storage |
| Cloudinary | Free | Plus $99/mes | >25GB storage |

---

## Troubleshooting

### Error: "Can't reach database server"

- Verificar que `?sslmode=require` está en DATABASE_URL
- Verificar que la IP de Vercel no está bloqueada en Neon

### Error: "NEXTAUTH_SECRET is not set"

- Generar secreto con `openssl rand -base64 32`
- Verificar que la variable está en Vercel

### Error: "Invalid OAuth redirect"

- Verificar que los redirect URIs coinciden exactamente
- Incluir protocolo `https://` completo

### Imágenes no cargan

- Verificar credenciales de Cloudinary
- Verificar que el dominio `res.cloudinary.com` está en `next.config.ts`

---

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Ver base de datos
npm run db:studio

# Aplicar schema sin migraciones
npx prisma db push

# Resetear base de datos (CUIDADO)
npm run db:reset
```
