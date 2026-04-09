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

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('resize', checkDesktop)
      window.removeEventListener('scroll', handleScroll)
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

  // Estilo para el logo basado en el estado del scroll
  // Si scrolled es true, el fondo es blanco, así que invertimos el logo blanco para que se vea negro
  const logoStyle = scrolled ? { filter: 'invert(1)' } : {}

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-stone-200/50' 
          : 'bg-stone-900 border-b border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link 
                href="/" 
                className="group relative flex items-center"
                onClick={(e) => handleNavClick(e, '/')}
              >
                <img 
                  src="/logo-blanco.png" 
                  alt="Gaama TV" 
                  className="h-8 sm:h-12 w-auto transition-all duration-300 group-hover:scale-105"
                  style={logoStyle}
                />
              </Link>
              
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                <Link
                  href="/"
                  onClick={(e) => handleNavClick(e, '/')}
                  className={`relative px-3 xl:px-4 py-2 font-headline font-semibold text-sm xl:text-base tracking-tight transition-all duration-200 rounded-md group ${
                    scrolled ? (isNavItemActive(null) ? 'text-primary' : 'text-stone-600 hover:text-primary') : (isNavItemActive(null) ? 'text-white' : 'text-white/70 hover:text-white')
                  }`}
                >
                  {isNavItemActive(null) && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full"></span>
                  )}
                  <span className="relative">Inicio</span>
                </Link>

                {categorias.filter(c => c.tipo !== 'ciudad').map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?categoria=${cat.slug}`}
                    onClick={(e) => handleNavClick(e, `/?categoria=${cat.slug}`)}
                    className={`relative px-3 xl:px-4 py-2 font-headline font-semibold text-sm xl:text-base tracking-tight transition-all duration-200 rounded-md group ${
                      scrolled ? (isNavItemActive(cat.slug) ? 'text-primary' : 'text-stone-600 hover:text-primary') : (isNavItemActive(cat.slug) ? 'text-white' : 'text-white/70 hover:text-white')
                    }`}
                  >
                    {isNavItemActive(cat.slug) && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full"></span>
                    )}
                    <span className="relative">{cat.nombre}</span>
                  </Link>
                ))}

                {/* Dropdown de Municipios/Ciudades */}
                {categorias.some(c => c.tipo === 'ciudad') && (
                  <div className="relative">
                    <button
                      onMouseEnter={() => setMoreMenuOpen(true)}
                      className={`flex items-center gap-1 px-3 xl:px-4 py-2 font-headline font-semibold text-sm xl:text-base tracking-tight transition-all duration-200 rounded-md ${
                        scrolled ? (categorias.filter(c => c.tipo === 'ciudad').some(c => isNavItemActive(c.slug)) ? 'text-primary' : 'text-stone-600 hover:text-primary') : (categorias.filter(c => c.tipo === 'ciudad').some(c => isNavItemActive(c.slug)) ? 'text-white' : 'text-white/70 hover:text-white')
                      }`}
                    >
                      Municipios <span className="material-symbols-outlined text-sm">expand_more</span>
                    </button>
                    {moreMenuOpen && (
                      <div 
                        onMouseLeave={() => setMoreMenuOpen(false)}
                        className="absolute top-full right-0 mt-0 w-56 bg-white shadow-2xl rounded-xl border border-stone-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {categorias.filter(c => c.tipo === 'ciudad').map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/?categoria=${cat.slug}`}
                              onClick={(e) => handleNavClick(e, `/?categoria=${cat.slug}`)}
                              className={`block px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-stone-50 ${
                                isNavItemActive(cat.slug) ? 'text-primary bg-primary/5' : 'text-stone-600'
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
                className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 ${
                  scrolled ? 'text-stone-500 hover:text-primary hover:bg-stone-100' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Buscar"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl">search</span>
              </button>
              <button 
                className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 ${
                  scrolled ? 'text-stone-500 hover:text-primary hover:bg-stone-100' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
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
          <div className="fixed right-0 top-0 bottom-0 z-[70] bg-white shadow-2xl w-full max-w-xs sm:max-w-md flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <img src="/logo-blanco.png" alt="Gaama TV" className="h-8 brightness-0" />
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
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
                        ? 'bg-primary/10 text-primary'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <span className="material-symbols-outlined">home</span>
                    Inicio
                  </Link>

                  {categorias.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/?categoria=${cat.slug}`}
                      onClick={(e) => handleNavClick(e, `/?categoria=${cat.slug}`)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-headline font-bold text-lg transition-all duration-200 ${
                        isNavItemActive(cat.slug)
                          ? 'bg-primary/10 text-primary'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary/40">fiber_manual_record</span>
                      {cat.nombre}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-4 mb-4">Administración</p>
                <Link 
                  href="/admin" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-stone-900 text-white font-bold text-lg hover:bg-stone-800 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  Entrar al Panel
                </Link>
              </div>
            </div>

            <div className="p-8 bg-stone-50 border-t border-stone-100">
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
