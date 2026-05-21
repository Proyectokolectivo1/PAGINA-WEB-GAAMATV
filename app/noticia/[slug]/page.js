import { getNoticiaBySlug, getNoticiasRelacionadas, getNoticias, extractYouTubeId, getOgImageUrl } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import ViewTracker from '@/app/components/ViewTracker'
import ShareButtons from '@/app/components/ShareButtons'
import ImageWithFallback from '@/app/components/ImageWithFallback'

// Permite que rutas nuevas (no pre-generadas) se rendericen dinámicamente vía ISR
export const dynamicParams = true
export const revalidate = 30

/**
 * Cache de React: garantiza que getNoticiaBySlug se llame UNA SOLA VEZ
 * por request, aunque generateMetadata y NoticiaPage lo llamen por separado.
 */
const getNoticiaCached = cache(async (slug) => {
  return getNoticiaBySlug(slug)
})

export async function generateStaticParams() {
  try {
    const { data: noticias } = await getNoticias({ limit: 50 })
    return noticias
      ?.filter((n) => n.slug && n.slug.length <= 150)
      .map((n) => ({ slug: n.slug })) || []
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params
    const noticia = await getNoticiaCached(slug)

    if (!noticia) {
      return {
        title: 'Noticia no encontrada | GaamaTV',
        description: 'GaamaTV — El Lens Editorial del Oriente Antioqueño.',
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaamaproducciones.com'
    const canonicalUrl = `${siteUrl}/noticia/${noticia.slug}`

    const rawDescription = noticia.excerpt || noticia.contenido || ''
    const cleanDescription = rawDescription
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 157)
    const description = cleanDescription
      ? (cleanDescription.length >= 157 ? cleanDescription + '...' : cleanDescription)
      : 'Noticias del Oriente Antioqueño en GaamaTV — El lente editorial de la región.'

    const ogImage =
      getOgImageUrl(noticia.imagen_principal, noticia.video_youtube_id, siteUrl) ||
      `${siteUrl}/api/og-image/default`

    return {
      title: `${noticia.titulo} | GaamaTV`,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: noticia.titulo,
        description,
        url: canonicalUrl,
        siteName: 'GaamaTV',
        locale: 'es_CO',
        type: 'article',
        publishedTime: noticia.fecha_publicacion,
        modifiedTime: noticia.updated_at || noticia.fecha_publicacion,
        authors: noticia.autor?.nombre ? [noticia.autor.nombre] : ['GaamaTV'],
        section: noticia.categoria?.nombre || 'Noticias',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: noticia.titulo,
            type: 'image/jpeg',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: noticia.titulo,
        description,
        images: [ogImage],
        site: '@GaamaTV',
      },
    }
  } catch {
    return {
      title: 'Noticia no encontrada | GaamaTV',
      description: 'GaamaTV — El Lens Editorial del Oriente Antioqueño.',
    }
  }
}

export default async function NoticiaPage({ params }) {
  const { slug } = await params

  // Fetch de la noticia — getNoticiaBySlug returns null when not found (never throws)
  const noticia = await getNoticiaCached(slug)

  // Not found or unpublished (public page only shows published content)
  if (!noticia || !noticia.publicado) notFound()

  // Noticias relacionadas — NO lanzar 500 si falla (no-crítico)
  let relacionadas = []
  try {
    relacionadas = (await getNoticiasRelacionadas(noticia.id, noticia.categoria_id, 3)) || []
  } catch {
    relacionadas = []
  }

  const youtubeId = extractYouTubeId(noticia.video_youtube_id)

  return (
    <>
      <ViewTracker id={noticia.id} />
      <ArticleContent noticia={noticia} youtubeId={youtubeId} />
      <RelatedNews noticias={relacionadas} />
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convierte el contenido almacenado en HTML listo para renderizar.
 *
 * El contenido en la base de datos se guarda como texto plano con saltos
 * de línea simples (\n) separando cada párrafo/oración.
 *
 * Reglas:
 *  1. Si el contenido ya contiene etiquetas HTML de bloque (<p>, <br>, <h1-6>,
 *     <ul>, <ol>, <div>, etc.) se devuelve sin modificar.
 *  2. Si es texto plano, cada línea no vacía se convierte en un <p>…</p>.
 *     Esto cubre tanto el caso de \n simples como \n\n dobles.
 */
function formatContenido(contenido) {
  if (!contenido) return ''

  // Si ya contiene HTML de bloque, devolverlo intacto
  const htmlBlockPattern = /<(p|br|h[1-6]|ul|ol|li|blockquote|div|hr|table|figure|img)\b/i
  if (htmlBlockPattern.test(contenido)) {
    return contenido
  }

  // Texto plano: cada línea no vacía → <p>…</p>
  // Esto maneja correctamente tanto \n simples como \n\n dobles.
  return contenido
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join('')
}

// ─── Componentes internos ────────────────────────────────────────────────────

function ArticleContent({ noticia, youtubeId }) {
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    // NOTA: NO usar <main> aquí — el layout raíz ya provee el <main> contenedor.
    // Usar <div> evita el anidamiento inválido y el doble padding que causaba la página en blanco.
    <div className="max-w-4xl mx-auto pb-20">
      <header className="text-center mb-16">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 rounded-sm">
          {noticia.categoria?.nombre || 'Noticias'}
        </div>
        <h1 className="font-headline text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-on-surface mb-8">
          {noticia.titulo}
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 border-y border-outline-variant/20 py-6">
          {noticia.autor && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
                {noticia.autor.foto_url ? (
                  <img
                    alt={noticia.autor.nombre}
                    src={noticia.autor.foto_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-stone-400">person</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">{noticia.autor.nombre}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                  {noticia.autor.cargo}
                </p>
              </div>
            </div>
          )}
          <div className="hidden md:block w-[1px] h-8 bg-outline-variant/30" />
          <time className="text-sm text-on-surface-variant font-medium">
            {formatDate(noticia.fecha_publicacion)}
          </time>
          <div className="hidden md:block w-[1px] h-8 bg-outline-variant/30" />
          <div className="flex gap-4 items-center">
            <ShareButtons
              title={noticia.titulo}
              text={noticia.excerpt || 'Lee esta noticia en GaamaTV.'}
            />
          </div>
        </div>
      </header>

      {/* Imagen principal o video YouTube */}
      {noticia.video_youtube_id && youtubeId ? (
        <div className="mb-16">
          <div className="aspect-video w-full bg-stone-900 rounded-xl overflow-hidden shadow-lg">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={noticia.video_youtube_titulo || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <figure className="w-full mb-16">
          <div className="w-full bg-stone-100 overflow-hidden rounded-xl shadow-sm">
            <ImageWithFallback
              src={noticia.imagen_principal}
              alt={noticia.titulo}
              className="w-full h-auto max-h-[800px] object-contain bg-stone-50"
              fallbackSrc="/placeholder-news.svg"
            />
          </div>
        </figure>
      )}

      {/* Cuerpo del artículo */}
      <article className="max-w-3xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <div
            className="text-lg leading-[1.8] font-body text-on-surface/90 [&>p]:mb-6 [&>p:first-of-type]:first-letter:text-6xl [&>p:first-of-type]:font-headline [&>p:first-of-type]:font-bold [&>p:first-of-type]:text-primary [&>p:first-of-type]:mr-3 [&>p:first-of-type]:float-left"
            dangerouslySetInnerHTML={{
              __html: formatContenido(noticia.contenido),
            }}
          />
        </div>

        {noticia.categoria?.nombre && (
          <div className="mt-12 pt-8 border-t border-outline-variant/20">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter mr-2 py-1">
                Etiquetas:
              </span>
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface">
                {noticia.categoria.nombre}
              </span>
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

function RelatedNews({ noticias }) {
  if (!noticias || noticias.length === 0) return null

  return (
    <section className="mt-16 pt-8 border-t border-outline-variant/10 max-w-4xl mx-auto pb-12">
      <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full" />
        Relacionados
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {noticias.map((noticia) => {
          const ytId = extractYouTubeId(noticia.video_youtube_id)
          const imageSrc =
            noticia.imagen_principal ||
            (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null)
          return (
            <Link
              key={noticia.id}
              href={`/noticia/${noticia.slug}`}
              className="group cursor-pointer"
            >
              <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-surface-container-low transition-all group-hover:shadow-md">
                <ImageWithFallback
                  src={imageSrc}
                  alt={noticia.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  fallbackSrc="/placeholder-news.svg"
                />
              </div>
              <h4 className="font-headline text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {noticia.titulo}
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">
                {noticia.categoria?.nombre}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
