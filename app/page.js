import { getNoticias, getCategorias, getAnuncios, getFirmas, getRedesSociales } from '@/lib/supabase'
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

  const [{ data: noticias, count: totalNoticias }, categoriesData, firmasData, redesData] = await Promise.all([
    getNoticias({ 
      categoriaSlug: categoria, 
      search: busqueda,
      limit: 20 
    }),
    getCategorias(),
    getFirmas(),
    getRedesSociales()
  ])

  const categorias = categoriesData || []
  const firmas = firmasData || []
  const redes = redesData || []

  const noticiasDestacadas = noticias?.filter(n => n.destacado) || []
  const noticiaPrincipal = noticiasDestacadas[0] || noticias[0]
  const otrasNoticias = noticias?.filter(n => n.id !== noticiaPrincipal?.id) || []

  return (
    <>
      <HeroSection noticia={noticiaPrincipal} />
      <CategoriaSection categories={categorias} activeCategory={categoria} />
      <NewsGrid noticias={otrasNoticias} />
      <PublicidadSection anuncios={anuncios} error={adsError} />
      <OpinionSection firmas={firmas} />
      <SocialSection redes={redes} />
    </>
  )
}

function HeroSection({ noticia }) {
  if (!noticia) {
    return (
      <section className="mb-16 animate-pulse">
        <div className="w-full h-[60vh] bg-stone-200 rounded-sm"></div>
      </section>
    )
  }

  const dateStr = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <section className="mb-16 border-b border-stone-200 pb-12 pt-4">
      <Link href={`/noticia/${noticia.slug}`} className="group block relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-white bg-primary font-bold text-[10px] uppercase tracking-widest px-3 py-1 shadow-sm">
                {noticia.categoria?.nombre || 'General'}
              </span>
              <span className="text-stone-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {dateStr}
              </span>
            </div>
            
            <h1 className="font-headline text-5xl lg:text-6xl xl:text-7xl font-black text-stone-900 leading-[1.05] tracking-tight mb-6 group-hover:text-primary transition-colors duration-300">
              {noticia.titulo}
            </h1>
            
            <p className="text-stone-600 text-xl leading-relaxed mb-8 font-serif line-clamp-3">
              {noticia.excerpt || noticia.contenido?.substring(0, 250) || 'Descubre la información más reciente sobre este acontecimiento vital para el Oriente Antioqueño.'}
            </p>
            
            <div className="flex items-center gap-4">
               <span className="inline-flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest text-white bg-stone-900 px-6 py-4 rounded-full group-hover:bg-primary group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                 Leer reportaje
                 <span className="material-symbols-outlined text-sm">east</span>
               </span>
               {noticia.autor?.nombre && (
                 <div className="flex flex-col">
                   <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Por</span>
                   <span className="text-xs font-bold text-stone-900">{noticia.autor.nombre}</span>
                 </div>
               )}
            </div>
          </div>
          
          {/* Image Content */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={noticia.imagen_principal || PLACEHOLDER_IMAGES.hero}
                alt={noticia.titulo}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] border border-stone-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-stone-900 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                Portada
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
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 border-b-2 border-stone-900 pb-3">
        <h2 className="font-headline text-3xl font-black text-stone-900 uppercase tracking-tight">
          {activeCategory 
            ? categories.find(c => c.slug === activeCategory)?.nombre || 'Sección' 
            : 'Últimas Noticias'}
        </h2>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <Link 
          href="/"
          className={`text-sm font-black uppercase tracking-widest transition-colors hover:text-primary ${
            !activeCategory ? 'text-primary border-b-2 border-primary pb-1' : 'text-stone-400'
          }`}
        >
          Portada General
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/?categoria=${cat.slug}`}
            className={`text-sm font-black uppercase tracking-widest transition-colors hover:text-primary ${
              activeCategory === cat.slug ? 'text-primary border-b-2 border-primary pb-1' : 'text-stone-400'
            }`}
          >
            {cat.nombre}
          </Link>
        ))}
      </div>
    </section>
  )
}

function NewsGrid({ noticias }) {
  if (!noticias || noticias.length === 0) {
    return (
      <section className="mb-20 text-center py-12 border-y border-stone-200">
        <p className="text-stone-500 italic font-serif text-lg">No hay publicaciones recientes en esta sección.</p>
      </section>
    )
  }

  const mainNews = noticias[0]
  const sideNews = noticias.slice(1, 6) // Show up to 5 on the side
  const otherNews = noticias.slice(6)

  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center gap-3 border-b-2 border-stone-900 pb-2 mb-6">
             <span className="material-symbols-outlined text-stone-900 text-[22px]">auto_stories</span>
             <h3 className="font-headline text-2xl font-black text-stone-900 uppercase tracking-tight">
               A Fondo
             </h3>
          </div>
          <MainNewsCard noticia={mainNews} />
        </div>
        <div className="lg:col-span-4 flex flex-col lg:border-l lg:border-stone-200 lg:pl-8">
          <div className="flex items-center gap-3 border-b-2 border-primary pb-2 mb-4">
             <div className="w-2.5 h-2.5 bg-primary rounded-sm animate-pulse"></div>
             <h3 className="font-headline text-2xl font-black text-stone-900 uppercase tracking-tight">
               Lo último
             </h3>
          </div>
          <SideNewsList noticias={sideNews} />
        </div>
      </div>
      
      {otherNews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pt-10 border-t border-stone-200">
          {otherNews.map((noticia) => (
            <NewsCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </section>
  )
}

function MainNewsCard({ noticia }) {
  if (!noticia) return null
  
  const dateStr = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : ''

  return (
    <Link href={`/noticia/${noticia.slug}`} className="group block">
      <div className="relative overflow-hidden aspect-video sm:aspect-[16/8] rounded-2xl shadow-lg mb-6">
        <img
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt={noticia.titulo}
          src={noticia.imagen_principal || PLACEHOLDER_IMAGES.news}
        />
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors"></div>
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-stone-900 border border-stone-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
            {noticia.categoria?.nombre || 'Actualidad'}
          </span>
        </div>
      </div>
      
      <div className="px-1">
        <h3 className="font-headline text-3xl sm:text-4xl font-black text-stone-900 mb-4 group-hover:text-primary transition-colors duration-300 leading-tight tracking-tight">
          {noticia.titulo}
        </h3>
        <p className="text-stone-600 font-serif line-clamp-3 mb-6 text-lg">
           {noticia.excerpt || noticia.contenido?.substring(0, 180) || 'Descubre los detalles de la noticia a continuación...'}
        </p>
        <div className="flex items-center gap-3 text-xs text-stone-500 font-bold uppercase tracking-widest">
           {noticia.autor?.nombre && (
             <>
               <span className="text-stone-900 bg-stone-100 px-3 py-1 rounded-full">{noticia.autor.nombre}</span>
               <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
             </>
           )}
           <span className="flex items-center gap-1">
             <span className="material-symbols-outlined text-[14px]">event</span>
             {dateStr}
           </span>
        </div>
      </div>
    </Link>
  )
}

function SideNewsList({ noticias }) {
  return (
    <div className="flex flex-col">
      {noticias.map((noticia, i) => {
        const dateStr = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : ''
        return (
          <Link href={`/noticia/${noticia.slug}`} key={noticia.id} className="group flex gap-4 items-start py-5 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors -mx-4 px-4 rounded-xl">
             <div className="font-headline text-4xl font-black text-stone-200 group-hover:text-primary transition-colors italic w-8 text-center shrink-0">
                {i + 1}
             </div>
             <div className="flex-1 flex flex-col justify-center">
                <span className="text-secondary text-[9px] font-bold uppercase tracking-widest block mb-1">
                  {noticia.categoria?.nombre || 'Actualidad'}
                </span>
                <h4 className="font-headline font-bold text-stone-900 leading-snug lg:text-lg mb-2 group-hover:text-primary transition-colors">
                  {noticia.titulo}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-auto">
                   <span>{dateStr}</span>
                </div>
             </div>
          </Link>
        )
      })}
    </div>
  )
}

function NewsCard({ noticia, horizontal = false }) {
  const dateStr = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : ''
  
  return (
    <Link href={`/noticia/${noticia.slug}`} className="group block">
      <div className={horizontal ? 'flex gap-4 items-center sm:items-start' : 'flex flex-col gap-4'}>
        <div className={`relative overflow-hidden rounded-xl shadow-sm ${horizontal ? 'w-24 h-24 sm:w-32 sm:aspect-video sm:h-auto shrink-0' : 'aspect-video'}`}>
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt={noticia.titulo}
            src={noticia.imagen_principal || PLACEHOLDER_IMAGES.news}
          />
        </div>
        <div className={horizontal ? 'flex-1 min-w-0 flex flex-col justify-center' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary text-[9px] font-bold uppercase tracking-widest">
              {noticia.categoria?.nombre || 'Actualidad'}
            </span>
          </div>
          <h4 className={`font-headline font-black text-stone-900 group-hover:text-primary transition-colors leading-snug line-clamp-3 ${horizontal ? 'text-sm sm:text-base' : 'text-xl mb-3'} tracking-tight`}>
            {noticia.titulo}
          </h4>
          {!horizontal && (
             <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-1">
               <span className="material-symbols-outlined text-[12px]">schedule</span>
               {dateStr}
             </div>
          )}
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
    <section className="mb-16 border-y border-stone-200 py-10 bg-stone-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline text-lg font-black text-stone-900 uppercase tracking-widest border-l-4 border-amber-500 pl-3">
          Publicidad Institucional
        </h2>
      </div>
      {error && isDev && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm">
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
            className={`group flex flex-col bg-white border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 ${anuncio.isPlaceholder ? 'opacity-75' : ''}`}
          >
            <div className="relative h-48 overflow-hidden">
               <img
                  src={anuncio.imagen_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop'}
                  alt={anuncio.titulo}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              <div className="absolute top-2 right-2">
                <span className={`bg-black/80 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5`}>
                  {anuncio.isPlaceholder ? 'Espacio Disponible' : 'Anuncio'}
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-headline text-lg font-bold text-stone-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">
                {anuncio.titulo}
              </h3>
              <p className="text-stone-600 font-serif text-sm leading-relaxed mb-4 flex-1">
                {anuncio.descripcion_corta}
              </p>
              {anuncio.boton_texto && (
                <span className="uppercase text-[11px] font-bold tracking-widest text-amber-600 group-hover:text-amber-700 mt-auto flex items-center gap-1">
                  {anuncio.boton_texto} <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}


function OpinionSection({ firmas }) {
  return (
    <section className="mb-16">
      <h2 className="text-center font-headline text-2xl sm:text-3xl font-black text-stone-900 border-y-2 border-stone-900 py-4 mb-10 uppercase tracking-[0.2em]">
        Firmas y Opinión
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-0 lg:px-12">
        {firmas && firmas.length > 0 ? (
          firmas.map((firma) => (
            <div key={firma.id} className="flex flex-col items-center text-center group">
              <img 
                className="w-24 h-24 rounded-full object-cover grayscale group-hover:grayscale-0 border-2 border-stone-200 group-hover:border-primary transition-all duration-500 mb-4" 
                alt={firma.nombre} 
                src={firma.imagen_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'} 
              />
              <h4 className="font-bold text-stone-900 text-sm uppercase tracking-widest mb-1">{firma.nombre}</h4>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-4">{firma.rol}</p>
              <a className="font-headline text-lg sm:text-xl font-black italic text-stone-800 group-hover:text-primary transition-colors leading-snug" href="#">
                &ldquo;{firma.cita}&rdquo;
              </a>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-stone-500 py-8 italic">No hay firmas configuradas aún.</div>
        )}
        
        {/* Placeholder Tu Firma a la derecha, pero solo si no colapsa, lo ponemos al final */}
        <div className="flex flex-col items-center text-center group hidden lg:flex">
          <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center border-2 border-dashed border-stone-300 group-hover:border-primary transition-colors duration-500 mb-4 text-stone-400 group-hover:text-primary">
            <span className="material-symbols-outlined text-3xl">edit</span>
          </div>
          <h4 className="font-bold text-stone-900 text-sm uppercase tracking-widest mb-1">Tu Firma</h4>
          <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-4">Espacio de Columnistas</p>
          <a className="font-headline text-lg text-stone-600 transition-colors leading-snug hover:opacity-80" href="#">
            Envía tus cartas al editor y haz escuchar tu voz en nuestra tribuna abierta.
          </a>
        </div>
      </div>
    </section>
  )
}

function SocialSection({ redes }) {
  const socialLinks = redes && redes.length > 0 ? redes : []

  return (
    <section className="mb-0 border-t border-stone-200 pt-8 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <h3 className="font-headline text-xl font-black text-stone-900 uppercase tracking-widest border-l-4 border-primary pl-3">
          Nuestras Redes
        </h3>
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-center">
          {socialLinks.map((link, index) => (
            <a 
              key={index} 
              className="group flex items-center gap-3 hover:text-primary transition-colors" 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className="w-10 h-10 border border-stone-200 rounded-full flex items-center justify-center group-hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-stone-500 group-hover:text-primary text-xl">{link.icon}</span>
              </div>
              <div className="leading-tight">
                <span className="text-sm font-bold text-stone-900 block group-hover:text-primary transition-colors">{link.handle}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">{link.platform}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
