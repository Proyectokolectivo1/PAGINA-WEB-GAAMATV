/**
 * API Route: /api/og-image
 *
 * Proxy transparente para imágenes Open Graph.
 * Facebook/LinkedIn no puede acceder a Google Drive directamente porque
 * sus crawlers son bloqueados. Esta ruta descarga la imagen en el servidor
 * de Next.js (que SÍ tiene acceso) y la reenvía al crawler con los headers
 * correctos de cache y tipo de contenido.
 *
 * Uso: /api/og-image?url=<url_codificada>
 */
export const runtime = 'nodejs'
export const revalidate = 86400 // 24h de cache en CDN

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  // Validar que sea una URL conocida y segura (whitelist de dominios)
  const ALLOWED_DOMAINS = [
    'drive.google.com',
    'lh3.googleusercontent.com',
    'googleusercontent.com',
    'img.youtube.com',
    'i.ytimg.com',
    'res.cloudinary.com',
    'images.unsplash.com',
  ]

  let parsedUrl
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }

  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) =>
      parsedUrl.hostname === domain ||
      parsedUrl.hostname.endsWith('.' + domain)
  )

  if (!isAllowed) {
    return new Response('Domain not allowed', { status: 403 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // Simular un browser para que Google Drive entregue la imagen
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      // Timeout de 8 segundos
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return new Response('Image fetch failed', { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await response.arrayBuffer()

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache agresivo: 24h en el browser, 7 días en CDN (Vercel Edge)
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, max-age=604800',
        'Vercel-CDN-Cache-Control': 'public, max-age=604800',
      },
    })
  } catch (error) {
    console.error('[og-image proxy] Error:', error)
    return new Response('Error fetching image', { status: 500 })
  }
}
