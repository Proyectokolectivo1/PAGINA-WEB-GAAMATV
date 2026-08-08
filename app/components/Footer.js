'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCategorias, supabase, TABLES } from '@/lib/supabase'

export default function Footer() {
  const [categorias, setCategorias] = useState([])
  const [redes, setRedes] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriasData, redesData] = await Promise.all([
          getCategorias(),
          supabase.from(TABLES.REDES_SOCIALES).select('*').eq('activo', true).order('orden', { ascending: true })
        ])
        setCategorias(categoriasData || [])
        setRedes(redesData.data || [])
      } catch (error) {
        console.error('Error fetching data for footer:', error)
      }
    }
    fetchData()
  }, [])

  // In a real application, you might want a 'tipo' field on categories to distinguish cities from topics.
  // For now, we'll just show them all or split manually if common names are found.
  const ciudades = categorias.filter(c => c.tipo === 'ciudad')
  const otrasCategorias = categorias.filter(c => c.tipo !== 'ciudad')

  return (
    <footer className="w-full border-t border-stone-800 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <img 
                src="/logo-principal.png" 
                alt="Gaama TV" 
                className="h-10 w-auto opacity-80 group-hover:opacity-100 transition-all"
              />
            </Link>
            <p className="font-body text-sm text-stone-400 leading-relaxed max-w-sm mb-6">
              Producciones y Servicios SAS. Comprometidos con la veracidad, la cultura y el desarrollo del Oriente Antioqueño desde hace más de una década.
            </p>
            <div className="flex gap-3">
              {redes.map(red => (
                <a 
                  key={red.id}
                  className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:bg-stone-800 hover:text-white transition-all duration-300 hover:scale-110" 
                  href={red.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={red.plataforma}
                >
                  <span className="material-symbols-outlined text-lg">{red.icono || 'public'}</span>
                </a>
              ))}
              {redes.length === 0 && (
                <>
                  <a className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:bg-stone-800 hover:text-white transition-all duration-300 hover:scale-110" href="https://www.facebook.com/Gaamaproducciones" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <span className="material-symbols-outlined text-lg">public</span>
                  </a>
                  <a className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:bg-stone-800 hover:text-white transition-all duration-300 hover:scale-110" href="https://www.youtube.com/@gaamaproducciones" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <span className="material-symbols-outlined text-lg">smart_display</span>
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
            {ciudades.length > 0 && (
              <div>
                <h5 className="font-bold text-white mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Ciudades
                </h5>
                <ul className="space-y-2.5 text-sm text-stone-400 font-label">
                  {ciudades.map(cat => (
                    <li key={cat.id}>
                      <Link className="hover:text-primary transition-colors inline-flex items-center gap-1" href={`/?categoria=${cat.slug}`}>
                        {cat.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {otrasCategorias.length > 0 && (
              <div>
                <h5 className="font-bold text-white mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  Categorías
                </h5>
                <ul className="space-y-2.5 text-sm text-stone-400 font-label">
                  {otrasCategorias.map(cat => (
                    <li key={cat.id}>
                      <Link className="hover:text-primary transition-colors inline-flex items-center gap-1" href={`/?categoria=${cat.slug}`}>
                        {cat.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="col-span-2 sm:col-span-1">
              <h5 className="font-bold text-white mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-stone-500 rounded-full"></span>
                Legal
              </h5>
              <ul className="space-y-2.5 text-sm text-stone-400 font-label">
                <li><a className="hover:text-primary transition-colors inline-flex items-center gap-1" href="#">Privacidad</a></li>
                <li><a className="hover:text-primary transition-colors inline-flex items-center gap-1" href="#">Términos</a></li>
                <li><a className="hover:text-primary transition-colors inline-flex items-center gap-1" href="#">Contacto</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-label text-stone-400">
          <p>© 2024 Gaama Producciones y Servicios SAS. El lente del Oriente Antioqueño.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-base">location_on</span> 
              <span>Rionegro, Antioquia</span>
            </span>
            <span className="flex items-center gap-2 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-base">mail</span> 
              <span>gaamaproducciones@gmail.com</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
