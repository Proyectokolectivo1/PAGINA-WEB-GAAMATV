'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getNoticiasAdmin, getCategorias } from '@/lib/supabase'

export default function AdminDashboard() {
  const [noticias, setNoticias] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    publicadas: 0,
    borrador: 0,
    destacadas: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [{ data: noticiasData, count }, { data: categoriasData }] = await Promise.all([
        getNoticiasAdmin({ limit: 100 }),
        getCategorias()
      ])

      setNoticias(noticiasData || [])
      setCategorias(categoriasData || [])

      setStats({
        total: count || 0,
        publicadas: noticiasData?.filter(n => n.publicado).length || 0,
        borrador: noticiasData?.filter(n => !n.publicado).length || 0,
        destacadas: noticiasData?.filter(n => n.destacado).length || 0
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-stone-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Dashboard</h1>
        <Link
          href="/admin/noticias/nueva"
          className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-container transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva Noticia
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Noticias" value={stats.total} icon="article" color="bg-blue-500" />
        <StatCard title="Publicadas" value={stats.publicadas} icon="check_circle" color="bg-green-500" />
        <StatCard title="Borradores" value={stats.borrador} icon="edit_note" color="bg-yellow-500" />
        <StatCard title="Destacadas" value={stats.destacadas} icon="star" color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
          <h2 className="font-headline text-lg font-bold text-on-surface">Últimas Noticias</h2>
          <Link href="/admin/noticias" className="text-primary text-sm font-medium hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-on-surface-variant uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {noticias.slice(0, 5).map((noticia) => (
                <tr key={noticia.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-on-surface line-clamp-1 max-w-md">
                      {noticia.titulo}
                    </div>
                    {noticia.destacado && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1">
                        <span className="material-symbols-outlined text-xs">star</span>
                        Destacada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {noticia.categoria?.nombre || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {noticia.publicado ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Publicada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {noticia.fecha_publicacion 
                      ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/noticias/${noticia.id}`}
                      className="text-primary hover:text-primary-container transition-colors"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-lg`}>
          <span className="material-symbols-outlined text-white text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant">{title}</p>
          <p className="text-2xl font-bold text-on-surface">{value}</p>
        </div>
      </div>
    </div>
  )
}
