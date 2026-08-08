SECURITY AUDIT REPORT

🔐 Credenciales: OK
🔐 Base de Datos Firebase: OK
🔐 Base de Datos Supabase: MEDIO
🔐 Arquitectura: OK
🔐 Autenticación / Autorización: MEDIO
🔐 APIs / Functions: BAJO
🔐 Dependencias: OK

RIESGO TOTAL: MEDIO
DEPLOY RECOMENDADO: SÍ

🧩 DETALLES:
- Archivo / Componente: `lib/supabase.js` (Políticas de Base de Datos)
  - Descripción del problema: Las políticas RLS de Supabase actuales (`supabase-rls-secure.sql`) permiten la lectura pública incondicional (`USING (true)`) en la tabla `noticias`. Dado que `getNoticiaBySlug` ya no filtra del lado del SDK por `publicado = true` (para permitir que los flujos de administración obtengan la noticia completa independientemente de su estado), cualquiera con la API key de Supabase anónima (que es pública y está expuesta en el cliente) puede hacer una petición HTTP directa a la API de Supabase y descargar todos los borradores o noticias no publicadas.
  - Nivel de riesgo: MEDIO
  - Recomendación (NO aplicar cambios automáticamente): Actualizar la política RLS de SELECT en Supabase para la tabla `noticias` para restringir la visibilidad pública únicamente a los registros que estén publicados, a menos que el usuario esté autenticado.
    Ejemplo de política segura:
    `CREATE POLICY "select_public_noticias" ON noticias FOR SELECT TO public USING (publicado = true OR auth.role() = 'authenticated');`

- Archivo / Componente: `app/noticia/[slug]/page.js` (Función `generateMetadata`)
  - Descripción del problema: La función `generateMetadata` de la página dinámica de noticias no valida si la noticia recuperada está publicada antes de generar las etiquetas meta de Open Graph (OG) y Twitter. Aunque la página en sí hace un renderizado condicional correcto y lanza un error 404 (`if (!noticia || !noticia.publicado) notFound()`), un cliente malintencionado o un web crawler podría descubrir la existencia, título, descripción e imagen de un borrador/noticia oculta solicitando directamente los metadatos de la cabecera HTML mediante el slug.
  - Nivel de riesgo: BAJO
  - Recomendación (NO aplicar cambios automáticamente): Actualizar la validación inicial de `generateMetadata` para tratar las noticias no publicadas de la misma manera que las no existentes:
    ```js
    if (!noticia || !noticia.publicado) {
      return {
        title: 'Noticia no encontrada | GaamaTV',
        description: 'GaamaTV — El Lente Editorial del Oriente Antioqueño.',
      }
    }
    ```

- Archivo / Componente: `app/api/twitch-status/route.js` (Endpoint Proxy Twitch)
  - Descripción del problema: El parámetro `channel` se interpola directamente en el string de la query de GraphQL (`query: \`query { user(login: "${channel}") { stream { id } } }\``) sin validación ni sanitización previa. Un usuario malintencionado podría pasar caracteres especiales (como comillas dobles `"`) para romper la estructura del query o intentar una inyección de GraphQL. Aunque es un endpoint de consulta pública de solo lectura de Twitch, la falta de sanitización de entradas es una mala práctica.
  - Nivel de riesgo: BAJO
  - Recomendación (NO aplicar cambios automáticamente): Validar que el parámetro `channel` cumpla con el formato estándar de nombres de usuario de Twitch (únicamente caracteres alfanuméricos y guiones bajos, entre 4 y 25 caracteres) antes de realizar el fetch. Por ejemplo:
    ```js
    if (!channel || !/^[a-zA-Z0-9_]{4,25}$/.test(channel)) {
      return Response.json({ live: false, error: 'canal inválido o no suministrado' }, { status: 400 })
    }
    ```
