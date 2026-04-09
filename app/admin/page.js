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
    destacadas: 0,
    visitas: 0
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
        destacadas: noticiasData?.filter(n => n.destacado).length || 0,
        visitas: noticiasData?.reduce((acc, current) => acc + (current.visitas || 0), 0) || 0
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant animate-pulse font-medium">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-gradient-to-r from-stone-900 to-stone-800 p-6 sm:p-8 rounded-2xl shadow-xl shadow-stone-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 w-full flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-xl">analytics</span>
              <span className="text-stone-400 font-semibold tracking-wider uppercase text-xs">Visión General</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight">Dashboard Central</h1>
          </div>
          <Link
            href="/admin/noticias/nueva"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">Nueva Noticia</span>
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Noticias" 
          value={stats.total} 
          icon="article" 
          gradient="from-blue-500 to-cyan-500"
          bgIcon="bg-blue-500/10"
          textColor="text-blue-600"
        />
        <StatCard 
          title="Visitas Totales" 
          value={stats.visitas} 
          icon="visibility" 
          gradient="from-emerald-500 to-teal-500"
          bgIcon="bg-emerald-500/10"
          textColor="text-emerald-600"
        />
        <StatCard 
          title="Publicadas" 
          value={stats.publicadas} 
          icon="check_circle" 
          gradient="from-green-500 to-emerald-500"
          bgIcon="bg-green-500/10"
          textColor="text-green-600"
        />
        <StatCard 
          title="Borradores" 
          value={stats.borrador} 
          icon="edit_note" 
          gradient="from-amber-500 to-orange-500"
          bgIcon="bg-amber-500/10"
          textColor="text-amber-600"
        />
        <StatCard 
          title="Destacadas" 
          value={stats.destacadas} 
          icon="star" 
          gradient="from-purple-500 to-indigo-500"
          bgIcon="bg-purple-500/10"
          textColor="text-purple-600"
        />
      </div>

      {/* LATEST NEWS */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 overflow-hidden">
        <div className="px-6 sm:px-8 py-5 border-b border-stone-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-xl">feed</span>
            </div>
            <h2 className="font-headline text-xl font-bold text-stone-800 tracking-tight">Últimas Noticias</h2>
          </div>
          <Link href="/admin/noticias" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            Ver todas las publicaciones
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Métricas</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {noticias.slice(0, 5).map((noticia) => (
                <tr key={noticia.id} className="hover:bg-stone-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-800 line-clamp-1 max-w-md group-hover:text-primary transition-colors">
                      {noticia.titulo}
                    </div>
                    {noticia.destacado && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-bold mt-1">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        Destacada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full font-bold uppercase tracking-wider border border-stone-200">
                      {noticia.categoria?.nombre || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-stone-600 font-medium text-sm">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      {noticia.visitas || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {noticia.publicado ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Publicada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 text-sm font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-stone-500">
                    {noticia.fecha_publicacion 
                      ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', {day:'2-digit', month:'short', year:'numeric'})
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/noticias/${noticia.id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 text-stone-500 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </Link>
                  </td>
                </tr>
              ))}
              
              {noticias.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-500 font-medium">
                    Aún no hay noticias creadas en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, gradient, bgIcon, textColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] rounded-bl-full transition-opacity pointer-events-none`}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 ${bgIcon} ${textColor} rounded-xl flex items-center justify-center`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="font-bold text-stone-500 text-xs uppercase tracking-wider mb-1">{title}</p>
        <p className={`font-headline text-3xl font-black ${textColor}`}>{value}</p>
      </div>
    </div>
  )
}
