# Configuración de Cloudflare para AutoExplora.cl

## Rate Limiting

Configuración recomendada para proteger endpoints críticos contra abuso.

### Paths Críticos a Proteger

| Path | Límite | Ventana | Acción | Razón |
|------|--------|---------|--------|-------|
| `/api/auth/registro` | 5 req | 1 min | Block | Prevenir registro masivo de cuentas |
| `/api/auth/forgot-password` | 3 req | 1 hora | Block | Prevenir abuso de recuperación |
| `/api/auth/resend-verification` | 3 req | 1 hora | Block | Prevenir spam de emails |
| `/api/dealers/registro` | 3 req | 1 min | Block | Prevenir registro masivo de dealers |
| `/api/leads` | 10 req | 1 min | Challenge | Prevenir spam de leads |
| `/api/events/contact` | 30 req | 1 min | Challenge | Prevenir abuso de tracking |
| `/api/mensajes` | 20 req | 1 min | Block | Prevenir spam de mensajes |
| `/api/auth/[...nextauth]` | 10 req | 1 min | Challenge | Prevenir brute force de login |

---

## Configuración en Cloudflare Dashboard

### 1. Rate Limiting Rules (Security > WAF > Rate limiting rules)

#### Regla 1: Auth Endpoints - Estricto

```
Name: Rate Limit - Auth Strict
Expression:
  (http.request.uri.path eq "/api/auth/registro") or
  (http.request.uri.path eq "/api/auth/forgot-password") or
  (http.request.uri.path eq "/api/auth/resend-verification") or
  (http.request.uri.path eq "/api/dealers/registro")

Characteristics: IP
Period: 60 seconds
Requests: 5
Action: Block
Mitigation timeout: 600 seconds (10 min)
```

#### Regla 2: Login - Moderado

```
Name: Rate Limit - Login
Expression:
  (http.request.uri.path contains "/api/auth/") and
  (http.request.method eq "POST")

Characteristics: IP
Period: 60 seconds
Requests: 10
Action: Managed Challenge
Mitigation timeout: 300 seconds (5 min)
```

#### Regla 3: Leads y Contacto - Moderado

```
Name: Rate Limit - Leads
Expression:
  (http.request.uri.path eq "/api/leads") or
  (http.request.uri.path eq "/api/events/contact")

Characteristics: IP
Period: 60 seconds
Requests: 15
Action: Managed Challenge
Mitigation timeout: 300 seconds (5 min)
```

#### Regla 4: Mensajes - Moderado

```
Name: Rate Limit - Messages
Expression:
  (http.request.uri.path contains "/api/mensajes") and
  (http.request.method eq "POST")

Characteristics: IP
Period: 60 seconds
Requests: 20
Action: Block
Mitigation timeout: 300 seconds (5 min)
```

---

## Bot Management (Security > Bots)

### Super Bot Fight Mode

Configuración recomendada:

| Tipo de Bot | Acción |
|-------------|--------|
| Definitely automated | Block |
| Likely automated | Managed Challenge |
| Verified bots | Allow |

---

## WAF Custom Rules (Security > WAF > Custom rules)

### Bloquear User-Agents sospechosos

```
Name: Block Suspicious User Agents
Expression:
  (http.user_agent contains "curl") or
  (http.user_agent contains "wget") or
  (http.user_agent contains "python") or
  (http.user_agent contains "scrapy") or
  (http.user_agent eq "")

Action: Managed Challenge
```

### Proteger API de requests sin origin

```
Name: API Origin Check
Expression:
  (http.request.uri.path contains "/api/") and
  (not http.request.headers["origin"][0] contains "autoexplora.cl") and
  (not http.request.headers["origin"][0] contains "localhost")

Action: Block
```

**Nota:** Ajustar el origin para incluir dominios de micrositios de dealers si aplica.

---

## Page Rules (Rules > Page Rules)

### Cache de assets estáticos

```
URL: autoexplora.cl/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year
```

### No cachear API

```
URL: autoexplora.cl/api/*
Settings:
  - Cache Level: Bypass
  - Disable Security (solo si necesario)
```

---

## SSL/TLS (SSL/TLS > Overview)

- **Encryption mode:** Full (strict)
- **Always Use HTTPS:** On
- **Automatic HTTPS Rewrites:** On
- **Minimum TLS Version:** TLS 1.2

---

## Firewall (Security > WAF)

### Reglas recomendadas activas

- [x] Cloudflare Managed Ruleset
- [x] Cloudflare OWASP Core Ruleset
- [x] Cloudflare Exposed Credentials Check

---

## Monitoreo

### Analytics a revisar regularmente

1. **Security > Overview** - Ver ataques bloqueados
2. **Security > Events** - Revisar eventos de seguridad
3. **Analytics > Traffic** - Monitorear tráfico por país
4. **Analytics > Security** - Ver rate limiting en acción

### Alertas recomendadas

Configurar en **Notifications** alertas para:
- DDoS attacks
- Rate limiting threshold reached
- SSL certificate expiring

---

## Notas

- Los límites son por IP. Usuarios detrás de NAT compartido podrían verse afectados.
- Ajustar límites según el tráfico real después de algunas semanas en producción.
- Revisar logs de Cloudflare semanalmente para detectar patrones de abuso.
- Considerar aumentar límites para IPs de oficinas o partners conocidos usando IP Access Rules.
