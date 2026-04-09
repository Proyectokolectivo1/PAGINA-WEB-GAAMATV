import { getNoticias, getCategorias, getAnuncios } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

const PLACEHOLDER_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&h=800&fit=crop',
  news: 'https://images.unsplash.com/photo-1516900557549-41557d405adf?w=800&h=600&fit=crop',
  studio: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&h=800&fit=crop',
  publicidad: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
}

export default async function Home({ searchParams }) {
  const categoria = searchParams.categoria || null
  const busqueda = searchParams.busqueda || null

  let adsError = null
  let anuncios = []
  
  try {
    const adsData = await getAnuncios(3)
    anuncios = adsData || []
  } catch (error) {
    adsError = error?.message || 'Error al cargar anuncios'
  }

  const [{ data: noticias, count: totalNoticias }, categoriesData] = await Promise.all([
    getNoticias({ 
      categoriaSlug: categoria, 
      search: busqueda,
      limit: 20 
    }),
    getCategorias(),
  ])

  const categorias = categoriesData || []

  const noticiasDestacadas = noticias?.filter(n => n.destacado) || []
  const noticiaPrincipal = noticiasDestacadas[0] || noticias[0]
  const otrasNoticias = noticias?.filter(n => n.id !== noticiaPrincipal?.id) || []

  return (
    <>
      <HeroSection noticia={noticiaPrincipal} />
      <CategoriaSection categories={categorias} activeCategory={categoria} />
      <NewsGrid noticias={otrasNoticias} />
      <PublicidadSection anuncios={anuncios} error={adsError} />
      <MultimediaSection />
      <OpinionSection />
      <SocialSection />
    </>
  )
}

function HeroSection({ noticia }) {
  if (!noticia) {
    return (
      <section className="mb-16">
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="flex flex-col lg:flex-row min-h-[500px] relative z-10">
            <div className="lg:w-2/3 relative h-80 lg:h-auto bg-gradient-to-br from-stone-200 to-stone-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/30"></div>
            </div>
            <div className="lg:w-1/3 p-8 lg:p-12 flex flex-col justify-center bg-white/80 backdrop-blur-sm border-l border-stone-200/50">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-primary font-semibold text-xs uppercase tracking-wider">Cargando...</span>
              </div>
              <h1 className="font-headline text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-4">
                Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">GaamaTV</span>
              </h1>
              <p className="text-stone-500 text-lg leading-relaxed">
                El Lens Editorial del Oriente Antioqueño
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-16">
      <Link href={`/noticia/${noticia.slug}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl shadow-stone-300/50 transition-all duration-500 hover:shadow-2xl hover:shadow-stone-400/30 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[500px] relative z-10">
            <div className="lg:w-2/3 relative h-72 sm:h-80 md:h-[450px] lg:h-auto overflow-hidden">
              {noticia.imagen_principal ? (
                <img
                  src={noticia.imagen_principal}
                  alt={noticia.titulo}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <img
                  src={PLACEHOLDER_IMAGES.hero}
                  alt={noticia.titulo}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/10 lg:to-black/30"></div>
              <div className="absolute bottom-6 left-6 lg:hidden">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {noticia.categoria?.nombre || 'Noticias'}
                </span>
              </div>
              <div className="absolute top-6 left-6 hidden lg:flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Destacado
                </span>
              </div>
            </div>
            <div className="lg:w-1/3 p-8 lg:p-12 flex flex-col justify-center bg-white/95 backdrop-blur-sm border-l border-stone-200/50 group-hover:border-primary/20 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] bg-secondary/10 px-3 py-1 rounded-full">
                  {noticia.categoria?.nombre || 'Noticias'}
                </span>
              </div>
              <h1 className="font-headline text-3xl lg:text-4xl xl:text-5xl font-black text-stone-900 leading-[1.1] mb-4 lg:mb-6 tracking-tight group-hover:text-primary transition-colors duration-300">
                {noticia.titulo}
              </h1>
              <p className="text-stone-500 text-base lg:text-lg leading-relaxed mb-6 lg:mb-8 font-light italic line-clamp-3">
                {noticia.excerpt || noticia.contenido?.substring(0, 200)}
              </p>
              <div className="flex items-center gap-4">
                <span className="group/btn inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 lg:px-8 py-3 rounded-full font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105">
                  Leer más
                  <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}

function CategoriaSection({ categories, activeCategory }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
          <h2 className="font-headline text-2xl lg:text-3xl font-bold text-stone-900">
            Oriente Actual
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-stone-500 text-sm">
          <span className="material-symbols-outlined text-lg">trending_up</span>
          <span className="font-medium">Noticias en tendencia</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link 
          href="/"
          className={`group relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            !activeCategory 
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' 
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200 hover:border-primary/30 hover:shadow-md'
          }`}
        >
          {!activeCategory && (
            <span className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></span>
          )}
          <span className="relative flex items-center gap-2">
            {!activeCategory && <span className="material-symbols-outlined text-xs">home</span>}
            Todas
          </span>
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/?categoria=${cat.slug}`}
            className={`group relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === cat.slug
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200 hover:border-primary/30 hover:shadow-md'
            }`}
          >
            <span className="relative flex items-center gap-2">
              {activeCategory === cat.slug && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
              {cat.nombre}
            </span>
            <span className={`absolute inset-0 rounded-full bg-white/0 group-hover:bg-primary/5 transition-colors duration-300 ${activeCategory === cat.slug ? 'hidden' : ''}`}></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function NewsGrid({ noticias }) {
  if (!noticias || noticias.length === 0) {
    return (
      <section className="mb-20">
        <div className="text-center py-12">
          <p className="text-on-surface-variant">No hay noticias disponibles.</p>
        </div>
      </section>
    )
  }

  const mainNews = noticias[0]
  const sideNews = noticias.slice(1, 3)
  const otherNews = noticias.slice(3)

  return (
    <section className="mb-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <MainNewsCard noticia={mainNews} />
        <SideNewsList noticias={sideNews} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {otherNews.map((noticia) => (
          <NewsCard key={noticia.id} noticia={noticia} />
        ))}
      </div>
    </section>
  )
}

function MainNewsCard({ noticia }) {
  if (!noticia) return null

  return (
    <Link href={`/noticia/${noticia.slug}`} className="md:col-span-8 group">
      <div className="bg-white rounded-2xl shadow-lg shadow-stone-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-stone-300/50 hover:-translate-y-1">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 relative overflow-hidden aspect-video md:aspect-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {noticia.imagen_principal ? (
              <img
                className="w-full h-full md:absolute md:inset-0 object-cover transition-transform duration-500 group-hover:scale-110"
                alt={noticia.titulo}
                src={noticia.imagen_principal}
              />
            ) : (
              <img
                className="w-full h-56 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                alt={noticia.titulo}
                src={PLACEHOLDER_IMAGES.news}
              />
            )}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                {noticia.categoria?.nombre}
              </span>
            </div>
          </div>
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-stone-50/50">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-400 mb-3 font-medium">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {noticia.fecha_publicacion && new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
                {noticia.autor?.nombre && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span className="text-primary">{noticia.autor.nombre}</span>
                  </>
                )}
              </div>
              <h3 className="font-headline text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                {noticia.titulo}
              </h3>
              <p className="text-stone-500 text-sm sm:text-base line-clamp-3 leading-relaxed">
                {noticia.excerpt || noticia.contenido?.substring(0, 150)}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                Leer artículo
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </span>
              <span className="text-stone-300 text-xs font-medium">
                {noticia.titulo?.split(' ').length} palabras
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SideNewsList({ noticias }) {
  return (
    <div className="md:col-span-4 space-y-4 sm:space-y-6">
      {noticias.map((noticia) => (
        <NewsCard key={noticia.id} noticia={noticia} horizontal />
      ))}
    </div>
  )
}

function NewsCard({ noticia, horizontal = false }) {
  return (
    <Link href={`/noticia/${noticia.slug}`} className={`group ${horizontal ? 'block' : ''}`}>
      <div className={`bg-white rounded-xl overflow-hidden shadow-md shadow-stone-200/40 transition-all duration-300 hover:shadow-lg hover:shadow-stone-300/50 hover:-translate-y-1 ${horizontal ? 'p-3' : ''}`}>
        <div className={horizontal ? 'flex gap-4' : ''}>
          <div className={`relative overflow-hidden rounded-lg ${horizontal ? 'w-28 h-24 flex-shrink-0' : 'aspect-video mb-3'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {noticia.imagen_principal ? (
              <img
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
                alt={noticia.titulo}
                src={noticia.imagen_principal}
              />
            ) : (
              <img
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
                alt={noticia.titulo}
                src={PLACEHOLDER_IMAGES.news}
              />
            )}
            {!horizontal && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  {noticia.categoria?.nombre}
                </span>
              </div>
            )}
          </div>
          <div className={horizontal ? 'flex-1 min-w-0' : ''}>
            {horizontal && (
              <span className="inline-flex items-center gap-1 text-secondary text-[10px] font-bold uppercase mb-1">
                <span className="w-1 h-1 bg-secondary rounded-full"></span>
                {noticia.categoria?.nombre}
              </span>
            )}
            <h4 className="font-headline text-sm sm:text-base font-bold text-stone-900 group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-2">
              {noticia.titulo}
            </h4>
            {horizontal && (
              <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {noticia.fecha_publicacion && new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function PublicidadSection({ anuncios, error }) {
  const isDev = process.env.NODE_ENV === 'development'
  
  const placeholderAds = [
    {
      id: 'placeholder-1',
      titulo: 'Tu Negocio Aquí',
      descripcion_corta: '¿Quieres aparecer en GaamaTV? Contáctanos para publicar tu publicidad.',
      imagen_url: null,
      enlace_url: '#',
      boton_texto: 'Más información',
      isPlaceholder: true
    },
    {
      id: 'placeholder-2',
      titulo: 'Promociona tu Marca',
      descripcion_corta: 'Alcanza a miles de usuarios del Oriente Antioqueño con nuestra plataforma.',
      imagen_url: null,
      enlace_url: '#',
      boton_texto: 'Ver planes',
      isPlaceholder: true
    },
    {
      id: 'placeholder-3',
      titulo: 'Amplía tu Alcance',
      descripcion_corta: 'Convierte visitantes en clientes con publicidad efectiva y segmentada.',
      imagen_url: null,
      enlace_url: '#',
      boton_texto: 'Contáctanos',
      isPlaceholder: true
    }
  ]

  const adsToShow = (anuncios && anuncios.length > 0) ? anuncios : (isDev ? placeholderAds : [])

  if (adsToShow.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
        <h2 className="font-headline text-xl lg:text-2xl font-bold text-stone-900">
          Negocios Locales
        </h2>
        <span className="text-xs text-stone-400 ml-auto">Publicidad</span>
      </div>
      {error && isDev && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <span className="font-semibold">Nota de desarrollo:</span> {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adsToShow.map((anuncio, index) => (
          <a
            key={anuncio.id || index}
            href={anuncio.enlace_url || '#'}
            target={anuncio.isPlaceholder ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-stone-300/50 transition-all duration-300 hover:-translate-y-1 ${anuncio.isPlaceholder ? 'opacity-75' : ''}`}
          >
            <div className="relative h-40 sm:h-48 overflow-hidden">
              {anuncio.imagen_url ? (
                <img
                  src={anuncio.imagen_url}
                  alt={anuncio.titulo}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-amber-300">storefront</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 ${anuncio.isPlaceholder ? 'bg-stone-400/90' : 'bg-amber-500/90'} backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full`}>
                  <span className="material-symbols-outlined text-[10px]">campaign</span>
                  {anuncio.isPlaceholder ? 'Espacio disponible' : 'Publicidad'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-headline text-lg font-bold text-stone-900 mb-2 group-hover:text-amber-600 transition-colors duration-300 line-clamp-1">
                {anuncio.titulo}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-4">
                {anuncio.descripcion_corta}
              </p>
              {anuncio.boton_texto && (
                <span className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  {anuncio.boton_texto}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </span>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-stone-100 group-hover:ring-amber-500/30 transition-all duration-300"></div>
          </a>
        ))}
      </div>
    </section>
  )
}

function MultimediaSection() {
  return (
    <section className="mb-20 py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 text-white rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[8rem] sm:text-[12rem]">videocam</span>
      </div>
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="lg:w-2/5">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
            <span className="font-bold tracking-widest uppercase text-xs bg-red-600/20 text-red-400 px-3 py-1 rounded-full">En Vivo</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black mb-6 lg:mb-8 italic">
            GaamaTV: <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">La voz del territorio.</span>
          </h2>
          <p className="text-stone-400 text-base lg:text-lg mb-6 lg:mb-8 leading-relaxed">
            No te pierdas nuestra edición estelar con los reportajes exclusivos que definen el acontecer diario de nuestra región.
          </p>
          <div className="space-y-3 sm:space-y-4">
            <a className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group cursor-pointer border border-white/5 hover:border-white/20" href="https://www.youtube.com/@gaamaproducciones" target="_blank" rel="noopener noreferrer">
              <span className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-red-500" style={{ fontVariationSettings: 'FILL 1' }}>play_circle</span>
              </span>
              <div className="flex-1">
                <div className="font-bold text-sm sm:text-base text-white">Ver en YouTube</div>
                <div className="text-sm text-stone-500">@gaamaproducciones</div>
              </div>
              <span className="material-symbols-outlined text-stone-400 group-hover:text-white group-hover:translate-x-1 transition-all">open_in_new</span>
            </a>
            <a className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group cursor-pointer border border-white/5 hover:border-white/20" href="https://www.facebook.com/Gaamaproducciones" target="_blank" rel="noopener noreferrer">
              <span className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-blue-500" style={{ fontVariationSettings: 'FILL 1' }}>video_library</span>
              </span>
              <div className="flex-1">
                <div className="font-bold text-sm sm:text-base text-white">Gaama Televisión</div>
                <div className="text-sm text-stone-500">Facebook Live</div>
              </div>
              <span className="material-symbols-outlined text-stone-400 group-hover:text-white group-hover:translate-x-1 transition-all">open_in_new</span>
            </a>
          </div>
        </div>
        <div className="lg:w-3/5 w-full aspect-video bg-stone-800 rounded-2xl shadow-2xl relative overflow-hidden group border border-white/10 cursor-pointer hover:border-primary/30 transition-colors duration-300">
          <img className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" alt="Studio" src={PLACEHOLDER_IMAGES.studio} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <button className="w-16 sm:w-18 lg:w-24 h-16 sm:h-18 lg:h-24 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-4xl sm:text-5xl lg:text-6xl ml-1" style={{ fontVariationSettings: 'FILL 1' }}>play_arrow</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function OpinionSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-6 lg:mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-white">forum</span>
          </div>
          <div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-stone-900">Tertuliando</h3>
            <p className="text-xs text-stone-500">Opinión y análisis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          <div className="group bg-white rounded-2xl p-5 shadow-lg shadow-stone-200/40 hover:shadow-xl hover:shadow-stone-300/50 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden ring-2 ring-primary/20">
                  <img className="w-full h-full object-cover" alt="Pedro Castaño" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[10px]">edit</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm sm:text-base">Pedro Antonio Castaño</h4>
                <p className="text-xs text-stone-500 italic">Director Editorial</p>
              </div>
            </div>
            <a className="font-headline text-base sm:text-lg font-bold leading-tight text-stone-800 group-hover:text-primary transition-colors cursor-pointer block" href="#">
              &ldquo;La ética periodística en tiempos de inmediatez digital.&rdquo;
            </a>
          </div>
          <div className="group bg-white rounded-2xl p-5 shadow-lg shadow-stone-200/40 hover:shadow-xl hover:shadow-stone-300/50 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 overflow-hidden ring-2 ring-secondary/20">
                  <img className="w-full h-full object-cover" alt="Marta Lucía Gil" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[10px]">article</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm sm:text-base">Marta Lucía Gil</h4>
                <p className="text-xs text-stone-500 italic">Columnista Invitada</p>
              </div>
            </div>
            <a className="font-headline text-base sm:text-lg font-bold leading-tight text-stone-800 group-hover:text-primary transition-colors cursor-pointer block" href="#">
              &ldquo;El Oriente: Un laboratorio de paz y productividad.&rdquo;
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function SocialSection() {
  const socialLinks = [
    { platform: 'Instagram', handle: '@gaamatv', url: 'https://www.instagram.com/gaamatv/', color: 'from-purple-500 to-pink-500' },
    { platform: 'Facebook', handle: 'Pedro Castaño', url: 'https://www.facebook.com/pedro.a.castano/', color: 'from-blue-500 to-blue-600' },
    { platform: 'Instagram', handle: '@tertuliando.tv', url: 'https://www.instagram.com/tertuliando.tv/', color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <section className="mb-12">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-stone-200/50 border border-stone-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">share</span>
          </div>
          <h3 className="font-headline text-xl sm:text-2xl font-bold text-stone-900">Síguenos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {socialLinks.map((link, index) => (
            <a 
              key={index} 
              className="group flex items-center gap-4 p-4 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-white text-xl">camera</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-stone-900 block truncate">{link.handle}</span>
                <span className="text-xs text-stone-500">{link.platform}</span>
              </div>
              <span className="material-symbols-outlined text-stone-400 group-hover:text-stone-900 group-hover:translate-x-1 transition-all">arrow_forward</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
