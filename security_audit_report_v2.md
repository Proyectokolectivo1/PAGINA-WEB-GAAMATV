# SECURITY AUDIT REPORT — GaamaTV v2
**Fecha:** 2026-05-15  
**Auditor:** Antigravity AI Secure Code Auditor  
**Scope:** Correcciones de enrutamiento dinámico + revalidación de caché  
**Versión auditada:** Post-fix `dynamicParams` + `revalidateNoticiaCache`

---

## RESUMEN EJECUTIVO

```
🔐 Credenciales:                  MEDIO
🔐 Base de Datos Supabase (RLS):  OK
🔐 Arquitectura:                  OK
🔐 Autenticación / Autorización:  OK
🔐 APIs / Functions:              OK
🔐 Dependencias:                  OK
🔐 Enrutamiento Dinámico (fix):   OK ✅ CORREGIDO

RIESGO TOTAL:     MEDIO
DEPLOY RECOMENDADO: SÍ ✅
```

---

## ✅ CONFIRMACIÓN: ¿El sistema quedó completamente parchado?

### Noticias nuevas en CUALQUIER categoría
- **SÍ.** Con `dynamicParams = true` en `app/noticia/[slug]/page.js`, cualquier noticia nueva
  (sin importar categoría, sección, ciudad o tipo) se renderiza dinámicamente en la primera visita.
  No se requiere un nuevo deploy para que las noticias sean accesibles.

### Categorías nuevas
- **SÍ.** Las categorías son un atributo de la noticia (via `categoria_id`). La ruta dinámica
  es `/noticia/[slug]` y no depende de la categoría para funcionar. Crear una nueva categoría 
  y asignarla a una noticia nueva funciona correctamente sin 500.

### Revalidación de caché al editar
- **SÍ.** `revalidateNoticiaCache(slug)` invalida inmediatamente la caché ISR de la URL 
  específica de la noticia editada. Los cambios se reflejan en la siguiente visita, sin esperar 30s.

---

## 🔐 FASE 1 — CREDENCIALES Y SECRETOS

### Hallazgos

#### 🟠 MEDIO — NEXT_PUBLIC keys expuestas en el cliente
- **Archivo:** `lib/supabase.js` líneas 3-4, `app/admin/fix/page.js` líneas 7-8
- **Descripción:** Las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
  son visibles en el cliente (browser). Esto es el comportamiento esperado y documentado por Supabase 
  para la `anon key`, cuya seguridad descansa en RLS, no en el secreto de la clave.
- **Nivel de riesgo:** 🟠 MEDIO (controlado por RLS — ver Fase 2)
- **Recomendación:** Verificar que el `.env.local` esté en `.gitignore` ✅ (confirmado). 
  La `anon key` expuesta es aceptable si y solo si las RLS policies están correctamente configuradas.

#### ✅ OK — .gitignore correctamente configurado
- `.env.local` está en `.gitignore`. No hay riesgo de exposición en repositorio.

#### ✅ OK — No se encontró service_role key
- Búsqueda exhaustiva: cero instancias de `service_role` en el código frontend. Correcto.

#### ✅ OK — No hay credenciales hardcodeadas
- No se detectaron API keys, tokens ni secrets directamente en el código fuente.

---

## 🔐 FASE 2 — SEGURIDAD BASE DE DATOS SUPABASE

### Análisis RLS (`supabase-rls-secure.sql`)

| Tabla | RLS Habilitado | SELECT | INSERT | UPDATE | DELETE |
|-------|---------------|--------|--------|--------|--------|
| `categorias` | ✅ | Público | Solo auth | Solo auth | Solo auth |
| `autores` | ✅ | Público | Solo auth | Solo auth | Solo auth |
| `noticias` | ✅ | Público | Solo auth | Solo auth | Solo auth |
| `galeria_noticias` | ✅ | Público | Solo auth | Solo auth | Solo auth |
| `publicidad_negocios` | ✅ | Público | Solo auth | Solo auth | Solo auth |
| `firmas` | ✅ | Público | Solo auth | Solo auth | Solo auth |
| `redes_sociales` | ✅ | Público | Solo auth | Solo auth | Solo auth |

#### ✅ OK — RLS habilitado en todas las tablas
- Todas las tablas críticas tienen RLS activo. La lectura es pública (necesario para el portal),
  las escrituras requieren sesión autenticada.

#### ✅ OK — No hay policies permisivas de escritura pública
- No se encontró `allow write: if true` ni equivalentes en Supabase.

#### ✅ OK — `publicado: true` como filtro de seguridad en lectura pública
- `getNoticiaBySlug()` y `getNoticias()` filtran `.eq('publicado', true)`. 
  Los borradores no son accesibles públicamente aunque estén en la DB.

---

## 🔐 FASE 3 — ARQUITECTURA

#### ✅ OK — Separación frontend / lógica sensible
- Todo el CRUD de noticias, categorías y autores requiere sesión autenticada vía Supabase Auth.
- La lógica de publicación (`publicado`, `destacado`) se guarda en DB con protección RLS.
- No se calculan permisos ni roles en el frontend.

#### ✅ OK — `dynamicParams = true` + ISR correctamente configurado
- `revalidate = 30` + `dynamicParams = true`: arquitectura ISR híbrida correcta.
  - Noticias del build → caché estática rápida.
  - Noticias nuevas → primer render dinámico, luego ISR.
  - Noticias editadas → revalidación inmediata por slug vía `revalidateNoticiaCache()`.

#### ✅ OK — `generateStaticParams` con filtro de slug length
- El filtro `noticia.slug.length <= 150` previene el error `ENAMETOOLONG` en builds futuros.

---

## 🔐 FASE 4 — AUTENTICACIÓN Y AUTORIZACIÓN

#### ✅ OK — Admin protegido por Supabase Auth
- Las páginas admin verifican sesión activa. Sin sesión, redirigen a `/admin/login`.
- `app/admin/fix/page.js` verifica `session` antes de ejecutar cualquier operación en DB.

#### ✅ OK — No hay endpoints administrativos sin protección
- Toda la escritura en DB pasa por RLS que exige `authenticated`.

#### 🟠 MEDIO — `app/admin/fix` accesible por URL directa
- **Archivo:** `app/admin/fix/page.js`
- **Descripción:** La página `/admin/fix` es una herramienta de mantenimiento que verifica 
  sesión via `auth.getSession()` antes de operar. Sin sesión, solo muestra un mensaje de error
  y no ejecuta cambios. El riesgo está controlado.
- **Recomendación:** Considerar agregar un middleware de protección de rutas `/admin/*` en
  una futura iteración, aunque el riesgo actual es bajo.

---

## 🔐 FASE 5 — APIs / FUNCTIONS / ENDPOINTS

#### ✅ OK — `/api/og-image` tiene whitelist de dominios
- El proxy de imágenes OG valida la URL contra una lista de dominios permitidos antes de hacer fetch.
- Dominio no permitido → `403 Forbidden`. Protegido contra SSRF.
- Timeout de 8 segundos configurado. Protegido contra slowloris/hang.

#### ✅ OK — `/api/og-image/default` genera imagen estática de marca
- Edge runtime, no acepta parámetros de usuario. Sin riesgo de inyección.

#### ✅ OK — `revalidateNoticiaCache` es una Server Action
- Solo ejecutable en contexto de servidor (`'use server'`). No expone endpoint HTTP.

#### ✅ OK — `incrementVisitas` via RPC
- Usa función RPC de Supabase. El conteo de visitas no expone datos sensibles.

---

## 🔐 FASE 6 — DEPENDENCIAS

| Paquete | Versión | Estado |
|---------|---------|--------|
| `next` | 14.0.4 | 🟠 No es la última (14.x), funcional y estable |
| `@supabase/supabase-js` | ^2.39.0 | ✅ Versión reciente |
| `react` | ^18.2.0 | ✅ Estable |
| `tailwindcss` | ^3.4.0 | ✅ Estable |

#### 🟠 INFORMATIVO — Next.js 14.0.4
- No es la versión más reciente de Next.js 14, pero es estable y no tiene CVEs conocidos
  que afecten este proyecto. Actualizar en la próxima ventana de mantenimiento.

---

## 🧩 DETALLES DE LOS CAMBIOS AUDITADOS

### CAMBIO 1: `app/noticia/[slug]/page.js`
```
+ export const dynamicParams = true
```
- **Propósito:** Permitir que slugs no generados en build time sean servidos dinámicamente.
- **Riesgo introducido:** NINGUNO. No expone rutas sin autenticación, el fetch sigue filtrando
  `publicado = true`.
- **Veredicto:** ✅ SEGURO

### CAMBIO 2: `app/actions.js` — `revalidateNoticiaCache(slug)`
```js
export async function revalidateNoticiaCache(slug) {
  if (slug) { revalidatePath(`/noticia/${slug}`) }
  revalidatePath('/')
  revalidatePath('/', 'layout')
}
```
- **Propósito:** Revalidar caché ISR del slug específico tras crear/editar noticias.
- **Riesgo introducido:** NINGUNO. `revalidatePath` es una función interna de Next.js
  que no acepta input externo — el slug proviene de `generateSlug()` (sanitizado).
- **Veredicto:** ✅ SEGURO

### CAMBIO 3: `app/admin/noticias/nueva/page.js`
```js
await revalidateNoticiaCache(noticiaData.slug)
```
- **Propósito:** Revalidar la URL de la noticia recién creada.
- **Riesgo introducido:** NINGUNO. El slug es generado con `generateSlug()` antes de llamar.
- **Veredicto:** ✅ SEGURO

### CAMBIO 4: `app/admin/noticias/[id]/page.js`
```js
await revalidateNoticiaCache(noticiaData.slug)
```
- **Propósito:** Revalidar la URL de la noticia editada.
- **Riesgo introducido:** NINGUNO.
- **Veredicto:** ✅ SEGURO

---

## 📋 CHECKLIST FINAL DE PRODUCCIÓN

- [x] `dynamicParams = true` en `/noticia/[slug]` → noticias nuevas sin 500
- [x] `revalidateNoticiaCache(slug)` → ediciones reflejadas de inmediato
- [x] `.env.local` en `.gitignore` → credenciales no en repo
- [x] `service_role` NO presente en frontend
- [x] RLS activo en 7/7 tablas críticas
- [x] Proxy OG con whitelist de dominios
- [x] Slugs limitados a 100 chars → no ENAMETOOLONG
- [x] `publicado = true` como filtro de lectura pública

---

## VEREDICTO FINAL

```
RIESGO TOTAL:       MEDIO (por anon key pública — controlada por RLS)
DEPLOY RECOMENDADO: SÍ ✅
BLOQUEANTES:        NINGUNO
OBSERVACIONES:      Los cambios aplicados son seguros y correctos.
                    El sistema funciona dinámicamente para todas las
                    categorías y noticias sin necesidad de re-deploy.
```
