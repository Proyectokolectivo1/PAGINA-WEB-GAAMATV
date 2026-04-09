'use client'

import { useEffect, useState } from 'react'
import { supabase, TABLES } from '@/lib/supabase'

export default function AdminRedes() {
  const [redes, setRedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    plataforma: '',
    handle: '',
    url: '',
    icono: '',
    color: '',
    activo: true,
    orden: 0
  })

  useEffect(() => {
    loadRedes()
  }, [])

  async function loadRedes() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from(TABLES.REDES_SOCIALES)
        .select('*')
        .order('orden', { ascending: true })

      if (fetchError) throw fetchError
      setRedes(data || [])
    } catch (err) {
      console.error('Error loading redes:', err)
      setError('No se pudieron cargar las redes. Verifica las políticas RLS y la conexión.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      plataforma: '',
      handle: '',
      url: '',
      icono: '',
      color: '',
      activo: true,
      orden: redes.length > 0 ? Math.max(...redes.map(p => p.orden || 0)) + 1 : 1
    })
    setEditingId(null)
  }

  const openEditModal = (red) => {
    setForm({
      plataforma: red.plataforma || '',
      handle: red.handle || '',
      url: red.url || '',
      icono: red.icono || '',
      color: red.color || '',
      activo: red.activo ?? true,
      orden: red.orden || 0
    })
    setEditingId(red.id)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.plataforma.trim() || !form.url.trim()) {
      alert('Plataforma y URL son obligatorios')
      return
    }

    setLoading(true)
    try {
      const payload = {
        plataforma: form.plataforma.trim(),
        handle: form.handle.trim(),
        url: form.url.trim(),
        icono: form.icono.trim() || 'link',
        color: form.color.trim(),
        activo: form.activo,
        orden: parseInt(form.orden) || 0,
        updated_at: new Date().toISOString()
      }

      let res;
      if (editingId) {
        res = await supabase
          .from(TABLES.REDES_SOCIALES)
          .update(payload)
          .eq('id', editingId)
      } else {
        res = await supabase
          .from(TABLES.REDES_SOCIALES)
          .insert([payload])
      }

      if (res.error) throw res.error
      
      setShowModal(false)
      loadRedes()
    } catch (error) {
      console.error('Save error:', error)
      alert('Error al guardar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta red social?')) return
    
    try {
      const { error } = await supabase
        .from(TABLES.REDES_SOCIALES)
        .delete()
        .eq('id', id)

      if (error) throw error
      loadRedes()
    } catch (error) {
      alert('Error al eliminar: ' + error.message)
    }
  }

  if (loading && redes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant animate-pulse font-medium">Cargando redes sociales...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface font-headline italic uppercase tracking-tighter">
            Gestión de <span className="text-primary">Redes Sociales</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Configura los enlaces a tus perfiles sociales en el footer</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Nueva Red Social
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-[32px] border border-red-100 flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-4xl">error_outline</span>
          <p className="font-bold">{error}</p>
          <button onClick={loadRedes} className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold">Reintentar</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {redes.map((red) => (
          <div key={red.id} className="group bg-white border border-outline-variant rounded-[40px] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 p-8 relative flex flex-col">
            <div className="absolute top-6 right-6 flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${red.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {red.activo ? 'Activo' : 'Oculto'}
                </span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 border rounded-full flex items-center justify-center bg-stone-50 border-stone-200">
                <span className="material-symbols-outlined text-3xl text-stone-600">{red.icono || 'public'}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface tracking-tight">{red.plataforma}</h3>
                <p className="text-primary font-bold text-sm">{red.handle}</p>
              </div>
            </div>

            <div className="mb-4">
              <a href={red.url} target="_blank" rel="noreferrer" className="text-xs text-stone-500 hover:text-primary font-mono truncate block bg-stone-50 p-3 rounded-xl border border-stone-100">
                {red.url}
              </a>
            </div>
            
            <div className="mt-auto flex items-center justify-between gap-3 pt-6 border-t border-outline-variant/30">
              <span className="text-[10px] font-bold text-stone-400 font-mono">
                Orden: {red.orden}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(red)}
                  className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(red.id)}
                  className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {redes.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-outline-variant/30 rounded-[60px] bg-surface-container-lowest">
            <span className="material-symbols-outlined text-8xl text-stone-200 mb-6 block">share</span>
            <p className="text-on-surface-variant text-lg font-bold italic">No hay redes sociales configuradas</p>
            <button onClick={() => setShowModal(true)} className="mt-6 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all">Añadir red social</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col scale-in border border-white/20">
            <div className="p-10 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h2 className="text-3xl font-black text-on-surface font-headline italic uppercase tracking-tighter">
                {editingId ? 'Editar' : 'Nueva'} <span className="text-primary">Red</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Plataforma</label>
                    <input
                      type="text"
                      required
                      value={form.plataforma}
                      onChange={(e) => setForm({ ...form, plataforma: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all font-bold text-lg"
                      placeholder="Ej: Instagram"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Handle / Usuario</label>
                    <input
                      type="text"
                      required
                      value={form.handle}
                      onChange={(e) => setForm({ ...form, handle: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="Ej: @gaamatv"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">URL Enlace</label>
                    <input
                      type="url"
                      required
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all text-xs font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Ícono (Material Symbols)</label>
                    <input
                      type="text"
                      value={form.icono}
                      onChange={(e) => setForm({ ...form, icono: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="Ej: photo_camera, thumb_up, forum"
                    />
                    <p className="text-[10px] text-stone-500 italic mt-2 ml-2">Consulta los iconos en Google Fonts.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-surface-container/30 p-4 rounded-[24px] border border-outline-variant/50">
                      <label className="block text-[9px] font-black text-stone-500 uppercase tracking-widest mb-2 text-center">Orden</label>
                      <input
                        type="number"
                        value={form.orden}
                        onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) })}
                        className="w-full bg-transparent border-none text-center font-black text-2xl focus:outline-none text-primary"
                      />
                    </div>
                    <div 
                      onClick={() => setForm({ ...form, activo: !form.activo })}
                      className={`p-4 rounded-[24px] border cursor-pointer transition-all flex flex-col items-center justify-center group ${form.activo ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <span className="block text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Estado</span>
                      <span className={`text-sm font-black uppercase tracking-tighter ${form.activo ? 'text-green-700' : 'text-red-700'}`}>
                        {form.activo ? 'Público' : 'Oculto'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 border-2 border-outline-variant rounded-full font-black text-sm uppercase tracking-widest hover:bg-surface-container transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-stone-900 text-white py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95"
                >
                  {editingId ? 'Guardar Cambios' : 'Añadir Red'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
