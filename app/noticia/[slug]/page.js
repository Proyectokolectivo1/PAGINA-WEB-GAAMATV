import { getNoticiaBySlug, getNoticiasRelacionadas, getNoticias, getCategorias } from '@/lib/supabase'
import { extractYouTubeId } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ViewTracker from '@/app/components/ViewTracker'
import ShareButtons from '@/app/components/ShareButtons'
import ImageWithFallback from '@/app/components/ImageWithFallback'

export const revalidate = 30

export async function generateStaticParams() {
  try {
    const { data: noticias } = await getNoticias({ limit: 50 })
    return noticias
      ?.filter((noticia) => noticia.slug && noticia.slug.length <= 150)
      .map((noticia) => ({
        slug: noticia.slug,
      })) || []
  } catch (error) {
    return []
  }
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params
    const noticia = await getNoticiaBySlug(slug)
    return {
      title: `${noticia.titulo} | GaamaTV`,
      description: noticia.excerpt || noticia.contenido?.substring(0, 160),
    }
  } catch {
    return {
      title: 'Noticia no encontrada | GaamaTV',
    }
  }
}

export default async function NoticiaPage({ params }) {
  const { slug } = await params
  let noticia
  try {
    noticia = await getNoticiaBySlug(slug)
  } catch (error) {
    notFound()
  }

  const relacionadas = await getNoticiasRelacionadas(noticia.id, noticia.categoria_id, 3)

  const youtubeId = extractYouTubeId(noticia.video_youtube_id)

  return (
    <>
      <ViewTracker id={noticia.id} />
      <ArticleContent noticia={noticia} youtubeId={youtubeId} />
      <RelatedNews noticias={relacionadas} />
    </>
  )
}


function ArticleContent({ noticia, youtubeId }) {
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20">
      <header className="max-w-4xl mx-auto text-center mb-16">
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
                  <img alt={noticia.autor.nombre} src={noticia.autor.foto_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-stone-400">person</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">{noticia.autor.nombre}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider">{noticia.autor.cargo}</p>
              </div>
            </div>
          )}
          <div className="hidden md:block w-[1px] h-8 bg-outline-variant/30"></div>
          <time className="text-sm text-on-surface-variant font-medium">
            {formatDate(noticia.fecha_publicacion)}
          </time>
          <div className="hidden md:block w-[1px] h-8 bg-outline-variant/30"></div>
          <div className="flex gap-4 items-center">
            <ShareButtons title={noticia.titulo} text={noticia.excerpt || 'Lee esta noticia en GaamaTV.'} />
          </div>
        </div>
      </header>

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
        <figure className="w-full mb-16 px-0 sm:px-4">
          <div className="w-full bg-stone-100 overflow-hidden rounded-xl shadow-sm relative">
            <ImageWithFallback
              src={noticia.imagen_principal}
              alt={noticia.titulo}
              className="w-full h-auto max-h-[800px] object-contain bg-stone-50"
              fallbackSrc="/placeholder-news.svg"
            />
          </div>
        </figure>
      )}

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        <article className="flex-1 max-w-3xl">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-lg leading-[1.8] font-body text-on-surface/90 [&>p]:mb-6 [&>p:first-of-type]:first-letter:text-6xl [&>p:first-of-type]:font-headline [&>p:first-of-type]:font-bold [&>p:first-of-type]:text-primary [&>p:first-of-type]:mr-3 [&>p:first-of-type]:float-left"
              dangerouslySetInnerHTML={{ 
                __html: noticia.contenido?.replace(/\n/g, '</p><p>') || ''
              }}
            />
          </div>

          <div className="mt-12 pt-8 border-t border-outline-variant/20">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter mr-2 py-1">Etiquetas:</span>
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface">
                {noticia.categoria?.nombre}
              </span>
            </div>
          </div>
        </article>

      </div>
    </main>
  )
}

function RelatedNews({ noticias }) {
  if (!noticias || noticias.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20">
      <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full"></span>
        Relacionados
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {noticias.map((noticia) => {
          const ytId = extractYouTubeId(noticia.video_youtube_id);
          const imageSrc = noticia.imagen_principal || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null);
          return (
          <Link key={noticia.id} href={`/noticia/${noticia.slug}`} className="group cursor-pointer">
            <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-surface-container-low transition-all group-hover:shadow-md">
              <ImageWithFallback
                src={imageSrc}
                alt={noticia.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackSrc="/placeholder-news.svg"
              />
            </div>
            <h4 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {noticia.titulo}
            </h4>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">
              {noticia.categoria?.nombre}
            </p>
          </Link>
          );
        })}
      </div>
    </section>
  )
}

