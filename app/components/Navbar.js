'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { getCategorias } from '@/lib/supabase'

export default function Navbar() {
  const [categorias, setCategorias] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategoria = searchParams.get('categoria')

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const data = await getCategorias()
        // Filtrar para evitar duplicado de 'Inicio' si existe en la DB
        const filtered = data?.filter(cat =>
          cat.nombre?.toLowerCase().trim() !== 'inicio' &&
          cat.slug?.toLowerCase().trim() !== 'inicio'
        )
        setCategorias(filtered || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategorias()

    // Refresh categories every 30 seconds to catch new additions
    const interval = setInterval(fetchCategorias, 30000)

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

    const updateDate = () => {
      const now = new Date()
      // Opciones para: Jueves, 9 de abril de 2026
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      let formattedDate = now.toLocaleDateString('es-CO', options)
      // Capitalizar primera letra
      formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
      setCurrentDate(formattedDate)
    }
    updateDate()
    const dateTimer = setInterval(updateDate, 60000) // update evry minute

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', checkDesktop)
      window.removeEventListener('scroll', handleScroll)
      clearInterval(dateTimer)
    }
  }, [])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    setMoreMenuOpen(false)
    router.push(href)
  }

  const isNavItemActive = (slug) => {
    if (!slug) return pathname === '/' && !currentCategoria
    return currentCategoria === slug
  }

  // Estilo para el logo siempre invertido para que se vea oscuro sobre fondo blanco
  const logoStyle = { filter: 'invert(1)' } // o usar un logo-negro.png si existe

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-stone-900/95 backdrop-blur-lg shadow-sm border-b border-stone-800`}>
        {/* TOP BAR: FECHA Y DÍA */}
        <div className={`w-full border-b transition-colors duration-300 bg-stone-950 border-stone-800 text-stone-400`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex justify-center md:justify-between items-center text-[10px] sm:text-xs font-medium tracking-wide">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="material-symbols-outlined text-[12px] sm:text-sm">calendar_today</span>
              {currentDate || 'Cargando fecha...'}
            </span>
            <div className="hidden md:flex items-center gap-4">
              <span className="hover:text-primary transition-colors cursor-pointer text-[10px] uppercase font-bold tracking-widest">Edición Digital</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link 
                href="/" 
                className="group relative flex items-center"
                onClick={(e) => handleNavClick(e, '/')}
              >
                <img 
                  src="/logo-principal.png" 
                  alt="Gaama TV" 
                  className="h-8 sm:h-10 w-auto transition-all duration-300 group-hover:scale-105"
                />
              </Link>
              
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                <Link
                  href="/"
                  onClick={(e) => handleNavClick(e, '/')}
                  className={`relative px-3 xl:px-4 py-2 font-body font-semibold text-[13px] md:text-[14.5px] tracking-wide transition-all duration-200 rounded-md group ${
                    isNavItemActive(null) ? 'text-primary' : 'text-stone-300 hover:text-primary hover:bg-stone-800'
                  }`}
                >
                  <span className="relative">Inicio</span>
                </Link>

                {categorias.filter(c => c.tipo?.toLowerCase().trim() !== 'ciudad').map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?categoria=${cat.slug}`}
                    onClick={(e) => handleNavClick(e, `/?categoria=${cat.slug}`)}
                    className={`relative px-3 xl:px-4 py-2 font-body font-semibold text-[13px] md:text-[14.5px] tracking-wide transition-all duration-200 rounded-md group ${
                      isNavItemActive(cat.slug) ? 'text-primary' : 'text-stone-300 hover:text-primary hover:bg-stone-800'
                    }`}
                  >
                    <span className="relative">{cat.nombre}</span>
                  </Link>
                ))}

                {/* Dropdown de Municipios/Ciudades */}
                {categorias.some(c => c.tipo?.toLowerCase().trim() === 'ciudad') && (
                  <div 
                    className="relative"
                    onMouseEnter={() => setMoreMenuOpen(true)}
                    onMouseLeave={() => setMoreMenuOpen(false)}
                  >
                    <button
                      className={`flex items-center gap-1 px-3 xl:px-4 py-2 font-body font-semibold text-[13px] md:text-[14.5px] tracking-wide transition-all duration-200 rounded-md ${
                        categorias.filter(c => c.tipo?.toLowerCase().trim() === 'ciudad').some(c => isNavItemActive(c.slug)) ? 'text-primary' : 'text-stone-300 hover:text-primary hover:bg-stone-800'
                      }`}
                    >
                      Municipios <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                    {moreMenuOpen && (
                      <div 
                        className="absolute top-full right-0 mt-0 w-56 bg-stone-900 shadow-2xl rounded-xl border border-stone-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {categorias.filter(c => c.tipo?.toLowerCase().trim() === 'ciudad').map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/?categoria=${cat.slug}`}
                              onClick={(e) => handleNavClick(e, `/?categoria=${cat.slug}`)}
                              className={`block px-5 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-stone-800 ${
                                isNavItemActive(cat.slug) ? 'text-primary' : 'text-stone-300'
                              }`}
                            >
                              {cat.nombre}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 text-stone-300 hover:text-primary hover:bg-stone-800`}
                aria-label="Buscar"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">search</span>
              </button>
              <button 
                className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 text-stone-300 hover:text-primary hover:bg-stone-800`}
                aria-label="Menú"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">{menuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú Lateral/Full (Hamburgesa) */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setMenuOpen(false)} 
          />
          <div className="fixed right-0 top-0 bottom-0 z-[70] bg-stone-900 shadow-2xl w-full max-w-xs sm:max-w-md flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="flex items-center justify-between p-6 border-b border-stone-800">
              <img src="/logo-principal.png" alt="Gaama TV" className="h-8" />
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-4">Navegación</p>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={(e) => handleNavClick(e, '/')}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-headline font-bold text-lg transition-all duration-200 ${
                      isNavItemActive(null)
                        ? 'bg-primary/20 text-primary'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined">home</span>
                    Inicio
                  </Link>

                  {categorias.filter(c => c.tipo?.toLowerCase().trim() !== 'ciudad').map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/?categoria=${cat.slug}`}
                      onClick={(e) => handleNavClick(e, `/?categoria=${cat.slug}`)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-headline font-bold text-lg transition-all duration-200 ${
                        isNavItemActive(cat.slug)
                          ? 'bg-primary/20 text-primary'
                          : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary/40">fiber_manual_record</span>
                      {cat.nombre}
                    </Link>
                  ))}
                </div>
              </div>

              {categorias.some(c => c.tipo?.toLowerCase().trim() === 'ciudad') && (
                <div className="mt-6 space-y-4">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-4">Municipios</p>
                  <div className="space-y-1">
                    {categorias.filter(c => c.tipo?.toLowerCase().trim() === 'ciudad').map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/?categoria=${cat.slug}`}
                        onClick={(e) => handleNavClick(e, `/?categoria=${cat.slug}`)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-headline font-bold text-lg transition-all duration-200 ${
                          isNavItemActive(cat.slug)
                            ? 'bg-primary/20 text-primary'
                            : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-primary/40">location_on</span>
                        {cat.nombre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-stone-800">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-4 mb-4">Administración</p>
                <Link 
                  href="/admin" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-container transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  Entrar al Panel
                </Link>
              </div>
            </div>

            <div className="p-8 bg-stone-950 border-t border-stone-800">
              <p className="text-xs text-stone-500 font-medium text-center">
                © {new Date().getFullYear()} Gaama Televisión
                <br/>Oriente Antioqueño
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
