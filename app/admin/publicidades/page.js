'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase, TABLES, STORAGE_BUCKET } from '@/lib/supabase'

export default function AdminPublicidades() {
  const [publicidades, setPublicidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    titulo: '',
    descripcion_corta: '',
    imagen_url: '',
    enlace_url: '',
    boton_texto: 'Ver más',
    activo: true,
    orden: 0
  })

  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    loadPublicidades()
  }, [])

  async function loadPublicidades() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from(TABLES.PUBLICIDAD)
        .select('*')
        .order('orden', { ascending: true })

      if (fetchError) throw fetchError
      setPublicidades(data || [])
    } catch (err) {
      console.error('Error loading publicidades:', err)
      setError('No se pudieron cargar las publicidades. Verifica las políticas RLS y la conexión.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      titulo: '',
      descripcion_corta: '',
      imagen_url: '',
      enlace_url: '',
      boton_texto: 'Ver más',
      activo: true,
      orden: publicidades.length > 0 ? Math.max(...publicidades.map(p => p.orden || 0)) + 1 : 1
    })
    setPreviewImage('')
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openEditModal = (publicidad) => {
    setForm({
      titulo: publicidad.titulo || '',
      descripcion_corta: publicidad.descripcion_corta || '',
      imagen_url: publicidad.imagen_url || '',
      enlace_url: publicidad.enlace_url || '',
      boton_texto: publicidad.boton_texto || 'Ver más',
      activo: publicidad.activo ?? true,
      orden: publicidad.orden || 0
    })
    setPreviewImage(publicidad.imagen_url || '')
    setEditingId(publicidad.id)
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
      const fileName = `publicidad/${Date.now()}-${file.name.replace(/\s/g, '-')}`
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
      alert('Error al subir la imagen. Verifica si el bucket "' + STORAGE_BUCKET + '" existe y tiene permisos.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.titulo.trim() || !form.enlace_url.trim()) {
      alert('Título y Enlace son obligatorios')
      return
    }

    setLoading(true)
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion_corta: form.descripcion_corta.trim(),
        imagen_url: form.imagen_url,
        enlace_url: form.enlace_url.trim(),
        boton_texto: form.boton_texto.trim(),
        activo: form.activo,
        orden: parseInt(form.orden) || 0,
        updated_at: new Date().toISOString()
      }

      let res;
      if (editingId) {
        res = await supabase
          .from(TABLES.PUBLICIDAD)
          .update(payload)
          .eq('id', editingId)
      } else {
        res = await supabase
          .from(TABLES.PUBLICIDAD)
          .insert([payload])
      }

      if (res.error) throw res.error
      
      setShowModal(false)
      loadPublicidades()
    } catch (error) {
      console.error('Save error:', error)
      alert('Error de Supabase: ' + error.message + '\n\nAsegúrate de haber ejecutado el SQL de RLS para publicidad_negocios.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta publicidad?')) return
    
    try {
      const { error } = await supabase
        .from(TABLES.PUBLICIDAD)
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPublicidades()
    } catch (error) {
      alert('Error al eliminar: ' + error.message)
    }
  }

  if (loading && publicidades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant animate-pulse font-medium">Gestionando publicidad...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface font-headline italic uppercase tracking-tighter">
            Gestión de <span className="text-primary">Publicidad</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Administra los banners y anuncios estratégicos</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Nuevo Anuncio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-[32px] border border-red-100 flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-4xl">error_outline</span>
          <p className="font-bold">{error}</p>
          <button onClick={loadPublicidades} className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold">Reintentar</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {publicidades.map((pub) => (
          <div key={pub.id} className="group bg-white border border-outline-variant rounded-[40px] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col">
            <div className="aspect-video w-full bg-surface-container relative overflow-hidden">
              {pub.imagen_url ? (
                <img src={pub.imagen_url} alt={pub.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                  <span className="material-symbols-outlined text-6xl">campaign</span>
                </div>
              )}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm ${pub.activo ? 'bg-green-500/90 text-white' : 'bg-stone-500/90 text-white'}`}>
                  {pub.activo ? 'Activo' : 'Pausado'}
                </span>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/40 text-white backdrop-blur-md">
                   #{pub.orden}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 justify-end gap-3">
                <button 
                  onClick={() => openEditModal(pub)}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(pub.id)}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-black text-on-surface mb-3 line-clamp-1 italic tracking-tight">{pub.titulo}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-6 flex-1 italic">{pub.descripcion_corta}</p>
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30">
                <a 
                  href={pub.enlace_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] font-black text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">link</span>
                  Ver destino
                </a>
                <span className="text-[10px] font-bold text-stone-400 font-mono">
                  ID: {String(pub.id).slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        ))}

        {publicidades.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-outline-variant/30 rounded-[60px] bg-surface-container-lowest">
            <span className="material-symbols-outlined text-8xl text-stone-200 mb-6 block">ads_click</span>
            <p className="text-on-surface-variant text-lg font-bold italic">No hay campañas publicitarias activas</p>
            <button onClick={() => setShowModal(true)} className="mt-6 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all">Configurar primera campaña</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col scale-in border border-white/20">
            <div className="p-10 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h2 className="text-3xl font-black text-on-surface font-headline italic uppercase tracking-tighter">
                {editingId ? 'Editar' : 'Lanzar'} <span className="text-primary">Campaña</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all font-bold text-lg"
                      placeholder="Ej: Gaama Market"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Mensaje Publicitario</label>
                    <textarea
                      required
                      value={form.descripcion_corta}
                      onChange={(e) => setForm({ ...form, descripcion_corta: e.target.value })}
                      className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all text-sm min-h-[140px] italic leading-relaxed"
                      placeholder="Describe la oferta..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1 ml-1">Artes / Visual</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-[32px] border-4 border-dashed border-outline-variant/50 bg-surface-container/30 overflow-hidden cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center relative group shadow-inner"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-5xl text-stone-300 group-hover:text-primary transition-colors mb-2">add_photo_alternate</span>
                        <p className="text-[9px] font-black text-stone-400 group-hover:text-primary uppercase tracking-widest">Subir Banner</p>
                      </>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase text-primary animate-pulse">Procesando...</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        {form.activo ? 'En línea' : 'Pausado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-outline-variant/30">
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Enlace de Destino</label>
                  <input
                    type="url"
                    required
                    value={form.enlace_url}
                    onChange={(e) => setForm({ ...form, enlace_url: e.target.value })}
                    className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all text-xs font-mono"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Call to Action</label>
                  <input
                    type="text"
                    value={form.boton_texto}
                    onChange={(e) => setForm({ ...form, boton_texto: e.target.value })}
                    className="w-full bg-surface-container/50 border-2 border-outline-variant rounded-[24px] px-6 py-4 focus:outline-none focus:border-primary transition-all font-bold text-sm"
                    placeholder="Ej: ¡Ver Oferta!"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 border-2 border-outline-variant rounded-full font-black text-sm uppercase tracking-widest hover:bg-surface-container transition-all"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-[2] bg-stone-900 text-white py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {editingId ? 'Actualizar Campaña' : 'Publicar Anuncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}