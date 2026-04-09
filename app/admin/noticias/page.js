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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Noticias</h1>
        <Link
          href="/admin/noticias/nueva"
          className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-container transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva Noticia
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="all">Todas</option>
            <option value="published">Publicadas</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse">Cargando...</div>
          </div>
        ) : filteredNoticias.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            No hay noticias que mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Autor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-on-surface-variant uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredNoticias.map((noticia) => (
                  <tr key={noticia.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface line-clamp-1 max-w-md">
                        {noticia.titulo}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {noticia.destacado && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                            <span className="material-symbols-outlined text-xs">star</span>
                            Destacada
                          </span>
                        )}
                        {noticia.video_youtube_id && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600">
                            <span className="material-symbols-outlined text-xs">play_circle</span>
                            Video
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        {noticia.categoria?.nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {noticia.autor?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublicar(noticia.id, noticia.publicado)}
                        className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full transition-colors ${
                          noticia.publicado 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {noticia.publicado ? 'check_circle' : 'edit_note'}
                        </span>
                        {noticia.publicado ? 'Publicada' : 'Borrador'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {noticia.fecha_publicacion 
                        ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO')
                        : new Date(noticia.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/noticia/${noticia.slug}`}
                          target="_blank"
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                          title="Ver"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <Link
                          href={`/admin/noticias/${noticia.id}`}
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(noticia.id)}
                          className="p-1 text-on-surface-variant hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
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
