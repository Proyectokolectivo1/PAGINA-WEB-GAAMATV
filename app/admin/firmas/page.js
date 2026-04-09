'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase, TABLES, STORAGE_BUCKET } from '@/lib/supabase'

export default function AdminFirmas() {
  const [firmas, setFirmas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    nombre: '',
    rol: '',
    cita: '',
    imagen_url: '',
    activo: true,
    orden: 0
  })

  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    loadFirmas()
  }, [])

  async function loadFirmas() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from(TABLES.FIRMAS)
        .select('*')
        .order('orden', { ascending: true })

      if (fetchError) throw fetchError
      setFirmas(data || [])
    } catch (err) {
      console.error('Error loading firmas:', err)
      setError('No se pudieron cargar las firmas. Verifica las políticas RLS y la conexión.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      nombre: '',
      rol: '',
      cita: '',
      imagen_url: '',
      activo: true,
      orden: firmas.length > 0 ? Math.max(...firmas.map(p => p.orden || 0)) + 1 : 1
    })
    setPreviewImage('')
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openEditModal = (firma) => {
    setForm({
      nombre: firma.nombre || '',
      rol: firma.rol || '',
      cita: firma.cita || '',
      imagen_url: firma.imagen_url || '',
      activo: firma.activo ?? true,
      orden: firma.orden || 0
    })
    setPreviewImage(firma.imagen_url || '')
    setEditingId(firma.id)
    setShowModal(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    setUploading(true)
    try {
      const fileName = `firmas/${Date.now()}-${file.name.replace(/\s/g, '-')}`
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName)

      setForm(prev => ({ ...prev, imagen_url: urlData.publicUrl }))
      setPreviewImage(urlData.publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error al subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.nombre.trim() || !form.rol.trim()) {
      alert('Nombre y Rol son obligatorios')
      return
    }

    setLoading(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        rol: form.rol.trim(),
        cita: form.cita.trim(),
        imagen_url: form.imagen_url,
        activo: form.activo,
        orden: parseInt(form.orden) || 0,
        updated_at: new Date().toISOString()
      }

      let res;
      if (editingId) {
        res = await supabase
          .from(TABLES.FIRMAS)
          .update(payload)
          .eq('id', editingId)
      } else {
        res = await supabase
          .from(TABLES.FIRMAS)
          .insert([payload])
      }

      if (res.error) throw res.error
      
      setShowModal(false)
      loadFirmas()
    } catch (error) {
      console.error('Save error:', error)
      alert('Error al guardar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta firma?')) return
    
    try {
      const { error } = await supabase
        .from(TABLES.FIRMAS)
        .delete()
        .eq('id', id)

      if (error) throw error
      loadFirmas()
    } catch (error) {
      alert('Error al eliminar: ' + error.message)
    }
  }

  if (loading && firmas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant animate-pulse font-medium">Cargando firmas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface font-headline italic uppercase tracking-tighter">
            Gestión de <span className="text-primary">Firmas y Opinión</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Administra los columnistas que aparecen en el inicio</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Nueva Firma
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-[32px] border border-red-100 flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-4xl">error_outline</span>
          <p className="font-bold">{error}</p>
          <button onClick={loadFirmas} className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold">Reintentar</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {firmas.map((firma) => (
          <div key={firma.id} className="group bg-white border border-outline-variant rounded-[40px] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center p-8 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${firma.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {firma.activo ? 'Activo' : 'Oculto'}
                </span>
            </div>
            
            <img 
              className="w-24 h-24 rounded-full object-cover grayscale group-hover:grayscale-0 border-2 border-stone-200 group-hover:border-primary transition-all duration-500 mb-4" 
              alt={firma.nombre} 
              src={firma.imagen_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'} 
            />
            <h4 className="font-bold text-stone-900 text-sm uppercase tracking-widest mb-1">{firma.nombre}</h4>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-4">{firma.rol}</p>
            <p className="font-headline italic text-stone-600 text-sm leading-snug line-clamp-3">
              &ldquo;{firma.cita}&rdquo;
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-3 w-full border-t border-outline-variant/30 pt-4">
              <span className="text-[10px] font-bold text-stone-400 font-mono flex-1 text-left">
                Orden: {firma.orden}
              </span>
              <button 
                onClick={() => openEditModal(firma)}
                className="w-10 h-10 bg-stone-100 mb-2 rounded-full flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button 
                onClick={() => handleDelete(firma.id)}
                className="w-10 h-10 bg-red-50 text-red-600 mb-2 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ))}

        {firmas.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-outline-variant/30 rounded-[60px] bg-surface-container-lowest">
            <span className="material-symbols-outlined text-8xl text-stone-200 mb-6 block">edit_document</span>
            <p className="text-on-surface-variant text-lg font-bold italic">No hay firmas configuradas</p>
            <button onClick={() => setShowModal(true)} className="mt-6 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all">Crear primera firma</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col scale-in border border-white/20">
            <div className="p-10 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h2 className="text-3xl font-black text-on-surface font-headline italic uppercase tracking-tighter">
                {editingId ? 'Editar' : 'Nueva'} <span className="text-primary">Firma</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all font-bold text-lg"
                      placeholder="Ej: Pedro Castaño"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Rol / Cargo</label>
                    <input
                      type="text"
                      required
                      value={form.rol}
                      onChange={(e) => setForm({ ...form, rol: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="Ej: Director Editorial"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Frase / Cita</label>
                    <textarea
                      required
                      value={form.cita}
                      onChange={(e) => setForm({ ...form, cita: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm min-h-[100px] italic leading-relaxed"
                      placeholder="La ética periodística..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1 ml-1">Foto del Autor</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-32 mx-auto rounded-full border-4 border-dashed border-outline-variant/50 bg-surface-container/30 overflow-hidden cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center relative group shadow-inner"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-stone-300 group-hover:text-primary transition-colors">add_a_photo</span>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  
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
                  disabled={uploading}
                  className="flex-[2] bg-stone-900 text-white py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {editingId ? 'Guardar Cambios' : 'Añadir Firma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
