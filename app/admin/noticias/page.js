'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getNoticiasAdmin, deleteNoticia, togglePublicarNoticia } from '@/lib/supabase'

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNoticias()
  }, [filter])

  async function loadNoticias() {
    setLoading(true)
    try {
      const { data } = await getNoticiasAdmin({ limit: 100 })
      setNoticias(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia?')) return
    
    try {
      await deleteNoticia(id)
      loadNoticias()
    } catch (error) {
      alert('Error al eliminar la noticia')
    }
  }

  const handleTogglePublicar = async (id, currentStatus) => {
    try {
      await togglePublicarNoticia(id, !currentStatus)
      loadNoticias()
    } catch (error) {
      alert('Error al cambiar el estado')
    }
  }

  const filteredNoticias = noticias.filter(noticia => {
    const matchesSearch = noticia.titulo?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' 
      ? true 
      : filter === 'published' 
        ? noticia.publicado 
        : !noticia.publicado
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-gradient-to-r from-stone-900 to-stone-800 p-6 sm:p-8 rounded-2xl shadow-xl shadow-stone-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-xl">newspaper</span>
            <span className="text-stone-400 font-semibold tracking-wider uppercase text-xs">Gestor de Contenido</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight">Noticias y Reportajes</h1>
        </div>
        <Link
          href="/admin/noticias/nueva"
          className="relative z-10 group inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1"
        >
          <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
          Crear Noticia
        </Link>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400">search</span>
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-stone-700 font-medium placeholder:text-stone-400"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-stone-700 font-medium cursor-pointer"
          >
            <option value="all">Todas las noticias</option>
            <option value="published">Publicadas</option>
            <option value="draft">Borradores</option>
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-on-surface-variant animate-pulse font-medium">Cargando noticias...</p>
          </div>
        ) : filteredNoticias.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-stone-50/50">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-stone-300 text-4xl">article</span>
            </div>
            <h3 className="text-lg font-bold text-stone-700 mb-1">Ninguna noticia encontrada</h3>
            <p className="text-stone-500 text-sm max-w-sm">No se hallaron resultados para tu búsqueda actual o filtro aplicado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200/60">
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Título de Noticia</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">Clasificación</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredNoticias.map((noticia) => (
                  <tr key={noticia.id} className="hover:bg-stone-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <Link href={`/admin/noticias/${noticia.id}`} className="font-headline font-bold text-stone-900 group-hover:text-primary transition-colors text-base sm:text-lg line-clamp-2 leading-tight">
                          {noticia.titulo}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO') : new Date(noticia.created_at).toLocaleDateString('es-CO')}
                          </span>
                          {noticia.autor?.nombre && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
                              <span className="material-symbols-outlined text-[13px]">person</span>
                              {noticia.autor.nombre}
                            </span>
                          )}
                          {noticia.destacado && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              <span className="material-symbols-outlined text-[12px]">star</span> Destacada
                            </span>
                          )}
                          {noticia.video_youtube_id && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              <span className="material-symbols-outlined text-[12px]">play_circle</span> Video
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100/80 border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                        {noticia.categoria?.nombre || 'Sin categoría'}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <button
                        onClick={() => handleTogglePublicar(noticia.id, noticia.publicado)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${
                          noticia.publicado 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Haz clic para cambiar estado"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {noticia.publicado ? 'public' : 'edit_document'}
                        </span>
                        {noticia.publicado ? 'PUBLICADA' : 'BORRADOR'}
                      </button>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/noticia/${noticia.slug}`}
                          target="_blank"
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-900 border border-transparent hover:border-stone-200 hover:shadow-sm transition-all"
                          title="Preview"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                        <Link
                          href={`/admin/noticias/${noticia.id}`}
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 hover:shadow-sm transition-all"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(noticia.id)}
                          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 hover:shadow-sm transition-all"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
