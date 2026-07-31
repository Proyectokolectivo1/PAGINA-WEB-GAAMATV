import { getNoticias, getCategorias, getAnuncios, getFirmas, getRedesSociales } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import ImageWithFallback from './components/ImageWithFallback'
import TwitchPlayer from './components/TwitchPlayer'

export const revalidate = 60

export default async function Home({ searchParams }) {
  const categoria = await searchParams.categoria || null
  const busqueda = await searchParams.busqueda || null

  let adsError = null
  let anuncios = []
  
  try {
    const adsData = await getAnuncios(10) // fetch more to intersperse
    anuncios = adsData || []
  } catch (error) {
    adsError = error?.message || 'Error al cargar anuncios'
  }

  const [{ data: noticias }, categoriesData, firmasData, redesData] = await Promise.all([
    getNoticias({ 
      categoriaSlug: categoria, 
      search: busqueda,
      limit: 50 
    }),
    getCategorias(),
    getFirmas(),
    getRedesSociales()
  ])

  const categorias = categoriesData || []
  const firmas = firmasData || []
  const redes = redesData || []

  // Portada logic
  const noticiasDestacadas = noticias?.filter(n => n.destacado) || []
  const noticiaPrincipal = noticiasDestacadas[0] || noticias[0]

  // Dynamic Category Sections logic
  let homeCategorySections = []
  if (!categoria && !busqueda && categorias?.length > 0) {
    const layoutTypes = [
      { layout: 'mixed', type: 'main' },
      { layout: 'list', type: 'sidebar' },
      { layout: 'grid', type: 'main' },
      { layout: 'list', type: 'sidebar' },
      { layout: 'double', type: 'main' }
    ]

    const highlightSlugs = categorias.map((cat, index) => {
       const mapped = layoutTypes[index % layoutTypes.length]
       return { name: cat.nombre, slug: cat.slug, layout: mapped.layout, type: mapped.type }
    })

    const sectionRequests = highlightSlugs.map(async (cat) => {
      try {
        const { data, count } = await getNoticias({ categoriaSlug: cat.slug, limit: 6 })
        return { ...cat, news: data || [], totalCount: count || 0 }
      } catch (e) { return null }
    })

    const results = await Promise.all(sectionRequests)
    homeCategorySections = results.filter(Boolean)
  }

  const mainSections = homeCategorySections.filter(s => s.type === 'main')
  const sidebarSections = homeCategorySections.filter(s => s.type === 'sidebar')

  return (
    <div className="pb-12 pt-0 md:pt-4">
      
      {/* REPRODUCTOR DE TWITCH */}
      {!categoria && !busqueda && (
        <TwitchPlayer channel="gaamaproducciones" />
      )}

      {/* SECCIÓN PRINCIPAL: 12 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA (CONTENIDO) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* VISTA PORTADA */}
          {!categoria && !busqueda ? (
            <>
              {/* Noticia Principal destacada */}
              {noticiaPrincipal && (
                <CardSection title="Lo Último" href="/">
                  <MainNewsCard noticia={noticiaPrincipal} />
                </CardSection>
              )}

              {/* Secciones por Categoría e intercalado de anuncios */}
              {mainSections.map((section, idx) => (
                <div key={section.slug} className="mt-4">
                  <CategoryCard section={section} />
                  
{/* Publicidad intercalada - visible pero no al final */}
                  {idx === 1 && anuncios.length > 0 && (
                    <div className="my-8">
                      <PublicidadSection 
                        title="Nuestros Anunciantes" 
                        anuncios={anuncios.slice(0, 4)} 
                        gridCols="grid-cols-2 md:grid-cols-4"
                      />
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            /* VISTA CATEGORÍA/BÚSQUEDA */
            <NewsPageGrid noticias={noticias} title={categoria || busqueda} />
          )}
        </div>

        {/* COLUMNA DERECHA (SIDEBAR) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {!categoria && !busqueda ? (
            <>
              {/* Secciones laterales */}
              {sidebarSections.map((section) => (
                <CategoryCard key={section.slug} section={section} type="sidebar" />
              ))}
              
              {/* Bloque de Opinión */}
              <OpinionSection firmas={firmas} />
            </>
          ) : (
            <>
              {/* En vistas de interior también mantenemos el sidebar activo */}
              <OpinionSection firmas={firmas} />
              <PublicidadSection anuncios={anuncios.slice(0, 3)} title="Publicidad" />
            </>
          )}
        </div>
      </div>

      {/* FOOTER SOCIAL SECTION */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 mt-16">
        <SocialSection redes={redes} />
      </div>
    </div>
  )
}

// ==========================================
// COMPONENTES DE ESTRUCTURA
// ==========================================

function CardSection({ title, children, href }) {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-8 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4 mb-6">
         <h2 className="text-xl font-bold text-primary tracking-tight font-headline flex items-center gap-2">
           <span className="w-1.5 h-6 bg-primary rounded-full"></span>
           {title}
         </h2>
         {href && (
           <Link href={href} className="text-stone-300 hover:text-primary transition-all p-2 hover:bg-stone-50 rounded-full">
             <span className="material-symbols-outlined text-[20px]">east</span>
           </Link>
         )}
      </div>
      {children}
    </section>
  )
}

function VerMasButton({ slug, name }) {
  return (
    <div className="mt-8 pt-6 border-t border-stone-100 flex justify-center">
      <Link
        href={`/?categoria=${slug}`}
        className="group inline-flex items-center gap-2.5 bg-stone-50 hover:bg-primary text-stone-700 hover:text-white text-sm font-bold px-7 py-3.5 rounded-xl border border-stone-200 hover:border-primary shadow-sm hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5"
      >
        Ver más noticias de {name}
        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">east</span>
      </Link>
    </div>
  )
}

function CategoryCard({ section, type = 'main' }) {
  const { name, slug, news, layout, totalCount } = section
  
  if (!news || news.length === 0) {
    return (
      <CardSection title={name} href={`/?categoria=${slug}`}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-6xl text-stone-200 mb-4 block">explore</span>
          <h3 className="text-lg font-bold text-stone-800 mb-2 font-headline">Próximamente</h3>
          <p className="text-stone-500 font-serif max-w-md">
            Estamos preparando contenido exclusivo para esta categoría. ¡Muy pronto encontrarás las mejores notas aquí!
          </p>
          <Link 
            href={`/?categoria=${slug}`}
            className="mt-6 inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-stone-900 transition-all"
          >
            Ver categoría <span className="material-symbols-outlined text-[18px]">east</span>
          </Link>
        </div>
      </CardSection>
    )
  }

  if (type === 'sidebar' || layout === 'list') {
    const displayCount = 5
    const hasMore = totalCount > displayCount
    return (
      <CardSection title={name} href={`/?categoria=${slug}`}>
         <div className="flex flex-col space-y-6">
           {news.slice(0, displayCount).map((noticia, i) => (
             <div key={noticia.id} className={i !== 0 ? "pt-6 border-t border-stone-100" : ""}>
               <SidebarNewsItem noticia={noticia} />
             </div>
           ))}
         </div>
         {hasMore && <VerMasButton slug={slug} name={name} />}
      </CardSection>
    )
  }

  if (layout === 'grid') {
    const displayCount = 3
    const hasMore = totalCount > displayCount
    return (
      <CardSection title={name} href={`/?categoria=${slug}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(0, displayCount).map(noticia => (
             <GridNewsItem key={noticia.id} noticia={noticia} />
          ))}
        </div>
        {hasMore && <VerMasButton slug={slug} name={name} />}
      </CardSection>
    )
  }

  if (layout === 'double') {
     const news1 = news[0]
     const news2 = news[1]
     const news3 = news[2]
     const hasMore = totalCount > 3
     return (
        <CardSection title={name} href={`/?categoria=${slug}`}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
              {news1 && <div className="sm:pr-5"><TopDownNewsItem noticia={news1} /></div>}
              {news2 && <div className="pt-8 sm:pt-0 sm:pl-5"><TopDownNewsItem noticia={news2} /></div>}
           </div>
           {news3 && (
             <div className="mt-8 pt-8 border-t border-stone-100">
               <SidebarNewsItem noticia={news3} />
             </div>
           )}
           {hasMore && <VerMasButton slug={slug} name={name} />}
        </CardSection>
     )
  }

  // DEFAULT MIXED (Estilo Altiplano)
  const mainNews = news[0]
  const sideNews = news.slice(1, 5)
  const hasMore = totalCount > 5
  return (
    <CardSection title={name} href={`/?categoria=${slug}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <MainNewsCard noticia={mainNews} isMixed={true} />
        </div>
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {sideNews.map((noticia, i) => (
            <div key={noticia.id} className={i !== 0 ? "pt-5 border-t border-stone-100" : ""}>
               <SidebarNewsItem noticia={noticia} compact={true} />
            </div>
          ))}
        </div>
      </div>
      {hasMore && <VerMasButton slug={slug} name={name} />}
    </CardSection>
  )
}

// ==========================================
// TARJETAS DE NOTICIAS
// ==========================================

function MainNewsCard({ noticia, isMixed = false }) {
  if (!noticia) return null
  const dateStr = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <Link href={`/noticia/${noticia.slug}`} className="group block flex flex-col h-full cursor-pointer">
       <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6 shadow-md border border-stone-100">
         <ImageWithFallback
           src={noticia.imagen_principal}
           alt={noticia.titulo}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
         />
         <div className="absolute top-4 left-4">
           <span className="bg-primary/95 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-sm uppercase tracking-wider">
             {noticia.categoria?.nombre || 'Actualidad'}
           </span>
         </div>
       </div>

       <div className="flex items-center gap-3 text-[12px] font-medium mb-4 text-stone-500">
         <span className="flex items-center gap-1.5 font-serif italic">
           <span className="material-symbols-outlined text-[16px]">schedule</span> {dateStr}
         </span>
         {noticia.destacado && (
           <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
             <span className="material-symbols-outlined text-[12px] fill-amber-700">star</span> DESTACADO
           </span>
         )}
       </div>

       <h3 className={`font-bold text-stone-900 leading-[1.2] mb-4 group-hover:text-primary transition-colors font-headline ${isMixed ? 'text-[1.5rem] md:text-[1.8rem]' : 'text-[1.8rem] md:text-[2.2rem]'}`}>
         {noticia.titulo}
       </h3>

       <p className="text-[14px] md:text-[15px] text-stone-600 line-clamp-3 mb-8 leading-relaxed font-serif">
         {noticia.excerpt || noticia.contenido?.substring(0, 180) || 'Descubre los detalles de esta información exclusiva de GaamaTV.'}
       </p>

       <div className="mt-auto">
         <span className="inline-flex items-center gap-2 bg-primary text-white text-[14px] font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-stone-900 transition-all duration-300 hover:translate-x-1">
           Leer artículo completo <span className="material-symbols-outlined text-[18px]">east</span>
         </span>
       </div>
    </Link>
  )
}

function SidebarNewsItem({ noticia, compact = false }) {
  if (!noticia) return null
  const dateStr = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  return (
    <Link href={`/noticia/${noticia.slug}`} className="group flex gap-5 items-start cursor-pointer">
      <div className={`relative shrink-0 rounded-xl overflow-hidden shadow-sm border border-stone-100 ${compact ? 'w-[100px] h-[75px] md:w-[120px] md:h-[85px]' : 'w-[90px] h-[65px] md:w-[110px] md:h-[80px]'}`}>
         <ImageWithFallback
           src={noticia.imagen_principal}
           alt={noticia.titulo}
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
         />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
         <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-serif mb-1.5 italic">
           <span className="material-symbols-outlined text-[14px]">schedule</span> {dateStr}
         </div>
         <h4 className={`font-bold text-stone-900 leading-[1.3] group-hover:text-primary transition-colors font-headline ${compact ? 'text-[15px] line-clamp-2' : 'text-[14px] line-clamp-3'}`}>
           {noticia.titulo}
         </h4>
      </div>
    </Link>
  )
}

function GridNewsItem({ noticia }) {
  return (
    <Link href={`/noticia/${noticia.slug}`} className="group block relative rounded-2xl overflow-hidden shadow-md aspect-[4/3] cursor-pointer">
      <ImageWithFallback
        src={noticia.imagen_principal}
        alt={noticia.titulo}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end">
        <span className="text-[10px] text-primary bg-white/90 backdrop-blur-sm self-start px-2 py-0.5 rounded font-black mb-3 uppercase tracking-tighter">
          {noticia.categoria?.nombre || 'General'}
        </span>
        <h4 className="font-bold text-white text-[16px] leading-tight line-clamp-3 group-hover:text-stone-200 transition-colors">
          {noticia.titulo}
        </h4>
      </div>
    </Link>
  )
}

function TopDownNewsItem({ noticia }) {
  if (!noticia) return null
  const dateStr = noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  return (
    <Link href={`/noticia/${noticia.slug}`} className="group flex flex-col h-full cursor-pointer">
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-serif italic">
           <span className="material-symbols-outlined text-[14px]">schedule</span> {dateStr}
         </div>
         <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded ring-1 ring-primary/20">
            {noticia.categoria?.nombre || 'General'}
         </span>
      </div>
      <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm">
         <ImageWithFallback
           src={noticia.imagen_principal}
           alt={noticia.titulo}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
         />
      </div>
      <h3 className="font-bold text-[1.15rem] text-stone-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3 font-headline">
         {noticia.titulo}
      </h3>
      <p className="text-[13px] text-stone-500 line-clamp-3 leading-relaxed font-serif">
        {noticia.excerpt || noticia.contenido?.substring(0, 120) || 'Más detalles en la nota completa.'}
      </p>
    </Link>
  )
}

// ==========================================
// VISTAS DE PÁGINA
// ==========================================

function NewsPageGrid({ noticias, title }) {
  if (!noticias || noticias.length === 0) {
    return (
      <CardSection title={`Resultados: ${title}`}>
        <div className="p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-stone-200 mb-4 block">newspaper</span>
          <h2 className="text-xl font-bold text-stone-800 mb-2 font-headline">No encontramos noticias</h2>
          <p className="text-stone-500 font-serif">Intenta con otra categoría o vuelve al inicio.</p>
          <Link href="/" className="inline-flex mt-8 bg-stone-100 px-6 py-2 rounded-full text-stone-600 font-bold hover:bg-primary hover:text-white transition-all">
            Volver a la portada
          </Link>
        </div>
      </CardSection>
    )
  }

  return (
    <div className="flex flex-col gap-10">
       <CardSection title={`Resultados: ${title}`} href="/">
          <MainNewsCard noticia={noticias[0]} />
       </CardSection>

       {noticias.length > 1 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {noticias.slice(1).map((noticia) => (
             <div key={noticia.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-500">
               <SidebarNewsItem noticia={noticia} compact={true} />
             </div>
           ))}
         </div>
       )}
    </div>
  )
}

function PublicidadSection({ anuncios, title = "Publicidad", variant = 'default', gridCols = "grid-cols-1 sm:grid-cols-2" }) {
  if (!anuncios || anuncios.length === 0) return null

  if (variant === 'hero') {
    const mainAd = anuncios[0]
    return (
      <a 
        href={mainAd.enlace_url || '#'} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative block w-full aspect-[21/9] md:aspect-[21/7] rounded-3xl overflow-hidden shadow-2xl border-4 border-white cursor-pointer transform transition-transform duration-500 hover:scale-[1.01]"
      >
        <img 
          src={mainAd.imagen_url || '/placeholder-ad.jpg'} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
          alt={mainAd.titulo}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent flex flex-col justify-center p-10 md:p-14">
            <div className="flex items-center gap-2 mb-6">
               <span className="w-8 h-0.5 bg-amber-400"></span>
               <span className="bg-amber-400/20 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded">Espacio Publicitario</span>
            </div>
            <h3 className="text-white text-3xl md:text-5xl font-black max-w-lg leading-[1.1] mb-6 group-hover:text-amber-400 transition-colors drop-shadow-2xl">
              {mainAd.titulo}
            </h3>
            <p className="text-stone-300 text-sm md:text-lg max-w-md line-clamp-2 mb-8 font-medium leading-relaxed">
              {mainAd.descripcion_corta}
            </p>
            <div className="flex items-center gap-3 text-white font-black text-sm uppercase tracking-widest self-start transition-all group-hover:gap-5">
              <span className="bg-amber-400 text-black px-6 py-3 rounded-xl flex items-center gap-2">
                VER OFERTA <span className="material-symbols-outlined text-lg">north_east</span>
              </span>
            </div>
        </div>
      </a>
    )
  }

  return (
    <CardSection title={title}>
      <div className={`grid ${gridCols} gap-8`}>
        {anuncios.map((anuncio) => (
          <a
            key={anuncio.id}
            href={anuncio.enlace_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-stone-50 border border-stone-200/60 rounded-3xl hover:border-primary/40 hover:bg-white transition-all duration-500 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative h-48 md:h-56">
               <img
                  src={anuncio.imagen_url || '/placeholder-ad.jpg'}
                  alt={anuncio.titulo}
                  className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
              <div className="absolute top-4 right-4">
                <span className="bg-black/80 backdrop-blur-md text-yellow-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-xl border border-white/20">
                  PUBLICIDAD
                </span>
              </div>
            </div>
            <div className="p-7 flex flex-col flex-1">
              <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-3 group-hover:text-primary transition-colors font-headline leading-tight">
                {anuncio.titulo}
              </h3>
              <p className="text-stone-500 text-[13px] leading-relaxed mb-6 line-clamp-3 font-serif italic opacity-80">
                {anuncio.descripcion_corta}
              </p>
              <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-1.5 transition-all group-hover:gap-3">
                  Visitar sitio <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </span>
                <span className="material-symbols-outlined text-stone-300 group-hover:text-primary transition-colors">ads_click</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </CardSection>
  )
}

function OpinionSection({ firmas }) {
  if (!firmas || !firmas.length) return null
  return (
    <CardSection title="Opinión y Firmas">
      <div className="flex flex-col divide-y divide-stone-100">
        {firmas.map((firma, i) => (
          <div key={firma.id} className={`${i !== 0 ? "pt-6 mt-6" : ""} group cursor-pointer`}>
             <div className="flex gap-4">
               <div className="relative">
                 <img 
                   className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 border-2 border-stone-100 group-hover:border-primary transition-all duration-500 shrink-0" 
                   alt={firma.nombre} 
                   src={firma.imagen_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'} 
                 />
                 <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                   <div className="w-3 h-3 bg-primary rounded-full ring-2 ring-white"></div>
                 </div>
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 text-[15px] mb-1 group-hover:text-primary transition-colors font-headline">{firma.nombre}</h4>
                  <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-2">{firma.rol}</p>
                  <p className="text-[14px] text-stone-600 font-serif italic line-clamp-3 leading-snug">
                    &ldquo;{firma.cita}&rdquo;
                  </p>
               </div>
             </div>
          </div>
        ))}
      </div>
    </CardSection>
  )
}

function SocialSection({ redes }) {
  if (!redes || redes.length === 0) return null
  return (
    <div className="bg-stone-900 py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        <h3 className="text-white font-black text-xl mb-8 uppercase tracking-[0.3em] opacity-30 italic">CONÉCTATE</h3>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {redes.map((link, index) => (
            <a 
              key={index} 
              className="flex items-center gap-3 text-stone-400 hover:text-white transition-all duration-300 hover:scale-110 group" 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
                <span className="material-symbols-outlined text-xl">{link.icon}</span>
              </div>
              <span className="text-sm font-black uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">{link.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
