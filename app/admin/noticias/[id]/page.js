'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCategorias, getAutores, getNoticiaById, updateNoticia, createCategoria, generateSlug, extractYouTubeId } from '@/lib/supabase'

export default function EditarNoticia() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categorias, setCategorias] = useState([])
  const [autores, setAutores] = useState([])
  const [showNuevaCategoria, setShowNuevaCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', slug: '', color: '#10b981', orden: 0, tipo: 'seccion' })
  
  const [form, setForm] = useState({
    titulo: '',
    slug: '',
    contenido: '',
    excerpt: '',
    categoria_id: '',
    autor_id: '',
    imagen_principal: '',
    video_youtube_id: '',
    video_youtube_titulo: '',
    destacado: false,
    publicado: false,
    meta_titulo: '',
    meta_descripcion: ''
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      const [categoriasData, autoresData, noticiaData] = await Promise.all([
        getCategorias(),
        getAutores(),
        getNoticiaById(params.id)
      ])
      
      setCategorias(categoriasData || [])
      setAutores(autoresData || [])
      
      if (noticiaData) {
        setForm({
          titulo: noticiaData.titulo || '',
          slug: noticiaData.slug || '',
          contenido: noticiaData.contenido || '',
          excerpt: noticiaData.excerpt || '',
          categoria_id: noticiaData.categoria_id || '',
          autor_id: noticiaData.autor_id || '',
          imagen_principal: noticiaData.imagen_principal || '',
          video_youtube_id: noticiaData.video_youtube_id || '',
          video_youtube_titulo: noticiaData.video_youtube_titulo || '',
          destacado: noticiaData.destacado || false,
          publicado: noticiaData.publicado || false,
          meta_titulo: noticiaData.meta_titulo || '',
          meta_descripcion: noticiaData.meta_descripcion || ''
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNuevaCategoriaChange = (e) => {
    const { name, value } = e.target
    setNuevaCategoria(prev => ({
      ...prev,
      [name]: name === 'orden' ? parseInt(value) || 0 : value
    }))
    if (name === 'nombre' && !nuevaCategoria.slug) {
      setNuevaCategoria(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleCrearCategoria = async () => {
    if (!nuevaCategoria.nombre) {
      alert('Ingresa el nombre de la categoría')
      return
    }
    try {
      const slug = nuevaCategoria.slug || generateSlug(nuevaCategoria.nombre)
      const categoriaData = {
        ...nuevaCategoria,
        slug,
        activa: true,
        tipo: nuevaCategoria.tipo || 'seccion'
      }
      const nuevaCat = await createCategoria(categoriaData)
      setCategorias(prev => [...prev, nuevaCat])
      setForm(prev => ({ ...prev, categoria_id: nuevaCat.id }))
      setShowNuevaCategoria(false)
      setNuevaCategoria({ nombre: '', slug: '', color: '#10b981', orden: 0, tipo: 'seccion' })
    } catch (error) {
      alert('Error al crear categoría: ' + error.message)
    }
  }

  const handleYouTubeChange = (e) => {
    const value = e.target.value
    setForm(prev => ({
      ...prev,
      video_youtube_id: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.categoria_id) {
      alert('Por favor selecciona una categoría. Todas las noticias deben estar asociadas a una categoría.')
      return
    }

    setLoading(true)

    try {
      // Limpiar el objeto para enviar solo campos válidos a la DB
      const noticiaData = {
        titulo: form.titulo,
        slug: generateSlug(form.slug || form.titulo),
        contenido: form.contenido,
        excerpt: form.excerpt,
        categoria_id: form.categoria_id,
        autor_id: form.autor_id || null,
        imagen_principal: form.imagen_principal,
        video_youtube_id: form.video_youtube_id || null,
        video_youtube_titulo: form.video_youtube_titulo || null,
        destacado: form.destacado || false,
        publicado: form.publicado || false,
        meta_titulo: form.meta_titulo || null,
        meta_descripcion: form.meta_descripcion || null
      }

      await updateNoticia(params.id, noticiaData)
      
      // Force navigation to admin list
      setTimeout(() => {
        router.push('/admin/noticias')
        router.refresh()
      }, 500)
    } catch (error) {
      console.error('Error updating news:', error)
      alert('Error al actualizar la noticia: ' + (error.message || 'Error desconocido'))
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-gradient-to-r from-stone-900 to-stone-800 p-6 sm:p-8 rounded-2xl shadow-xl shadow-stone-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 w-full flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-xl">edit_document</span>
              <span className="text-stone-400 font-semibold tracking-wider uppercase text-xs">Publicación</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight">Editar Noticia</h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
            title="Volver"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
            <span className="material-symbols-outlined text-primary">article</span>
            <h2 className="font-headline text-xl font-bold text-stone-800 tracking-tight">Información Principal</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                Título de la Noticia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium placeholder:text-stone-400"
                placeholder="Escribe un título atractivo..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                Slug (URL Personalizada)
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium font-mono text-sm placeholder:text-stone-400"
                placeholder="slug-de-la-noticia-generado-automaticamente"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                Extracto (Resumen)
              </label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium placeholder:text-stone-400 resize-y"
                placeholder="Breve descripción que aparecerá en las tarjetas de la página de inicio..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                Contenido Completo <span className="text-red-500">*</span>
              </label>
              <textarea
                name="contenido"
                value={form.contenido}
                onChange={handleChange}
                rows={14}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-800 font-mono text-sm placeholder:text-stone-400 resize-y"
                placeholder="Escribe aquí el cuerpo del artículo. Puedes usar HTML básico si lo requieres..."
                required
              />
              <p className="text-xs text-stone-500 font-medium mt-2 pl-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                El contenido soporta renderizado de etiquetas HTML estándar (&lt;b&gt;, &lt;i&gt;, &lt;p&gt;).
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
              <span className="material-symbols-outlined text-primary">category</span>
              <h2 className="font-headline text-xl font-bold text-stone-800 tracking-tight">Clasificación</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                  Categoría / Sección <span className="text-red-500">*</span>
                </label>
                {!showNuevaCategoria ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        name="categoria_id"
                        value={form.categoria_id}
                        onChange={handleChange}
                        className="w-full appearance-none pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium cursor-pointer"
                        required
                      >
                        <option value="" disabled>Selecciona una categoría...</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 pointer-events-none">unfold_more</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNuevaCategoria(true)}
                      className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors border border-primary/20"
                      title="Crear nueva categoría"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-2">Crear Categoría Rápida</h3>
                    <input
                      type="text"
                      name="nombre"
                      value={nuevaCategoria.nombre}
                      onChange={handleNuevaCategoriaChange}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-stone-900"
                      placeholder="Nombre (ej. Política)"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="slug"
                        value={nuevaCategoria.slug}
                        onChange={handleNuevaCategoriaChange}
                        className="flex-1 px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                        placeholder="politica"
                      />
                      <input
                        type="color"
                        name="color"
                        value={nuevaCategoria.color}
                        onChange={handleNuevaCategoriaChange}
                        className="w-12 h-10 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
                        title="Color de la sección"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-2">Tipo de Categoría</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className={`py-2 px-3 rounded-lg border-2 transition-all font-bold text-xs capitalize cursor-pointer flex items-center justify-center gap-2 ${
                            nuevaCategoria.tipo === 'seccion'
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-stone-200 text-stone-500 hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipo"
                            value="seccion"
                            checked={nuevaCategoria.tipo === 'seccion'}
                            onChange={handleNuevaCategoriaChange}
                            className="sr-only"
                          />
                          Sección
                        </label>
                        <label
                          className={`py-2 px-3 rounded-lg border-2 transition-all font-bold text-xs capitalize cursor-pointer flex items-center justify-center gap-2 ${
                            nuevaCategoria.tipo === 'ciudad'
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-stone-200 text-stone-500 hover:border-blue-500/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipo"
                            value="ciudad"
                            checked={nuevaCategoria.tipo === 'ciudad'}
                            onChange={handleNuevaCategoriaChange}
                            className="sr-only"
                          />
                          Ciudad
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        name="orden"
                        value={nuevaCategoria.orden}
                        onChange={handleNuevaCategoriaChange}
                        className="flex-1 px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="10"
                      />
                      <button
                        type="button"
                        onClick={handleCrearCategoria}
                        className="px-4 py-2 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNuevaCategoria(false)
                          setNuevaCategoria({ nombre: '', slug: '', color: '#10b981', orden: 0, tipo: 'seccion' })
                        }}
                        className="px-4 py-2 bg-white border border-stone-200 text-stone-600 font-bold rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                  Redactor / Autor
                </label>
                <div className="relative">
                  <select
                    name="autor_id"
                    value={form.autor_id}
                    onChange={handleChange}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium cursor-pointer"
                  >
                    <option value="">Anónimo o Redacción GaamaTV</option>
                    {autores.map(autor => (
                      <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 pointer-events-none">unfold_more</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
              <span className="material-symbols-outlined text-primary">perm_media</span>
              <h2 className="font-headline text-xl font-bold text-stone-800 tracking-tight">Multimedia</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                  Portada URL (Drive / Externa)
                </label>
                <input
                  type="text"
                  name="imagen_principal"
                  value={form.imagen_principal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium placeholder:text-stone-400"
                  placeholder="https://..."
                />
                {form.imagen_principal && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 p-1 relative group">
                    <img src={form.imagen_principal} alt="Preview" className="w-full h-40 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none' }} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, imagen_principal: '' }))}
                        className="bg-red-600 text-white px-4 py-2 font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                       <span className="material-symbols-outlined text-[18px]">delete</span>
                       Quitar Imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1">
                  Video Destacado (YouTube ID o URL)
                </label>
                <input
                  type="text"
                  name="video_youtube_url"
                  value={form.video_youtube_id}
                  onChange={handleYouTubeChange}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium placeholder:text-stone-400"
                  placeholder="Ej: dQw4w9WgXcQ o URL completa"
                />
                {form.video_youtube_id && extractYouTubeId(form.video_youtube_id) && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-stone-200 bg-black p-1 relative">
                    <div className="aspect-video w-full rounded-lg overflow-hidden relative z-10 pointer-events-none">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(form.video_youtube_id)}?controls=0`}
                        title="Preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
              <span className="material-symbols-outlined text-primary">search</span>
              <h2 className="font-headline text-xl font-bold text-stone-800 tracking-tight">Optimización SEO</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1 flex items-center justify-between">
                  <span>Meta TitleTag</span>
                  <span className={`text-xs ${form.meta_titulo?.length > 60 ? 'text-amber-600 font-bold' : 'text-stone-400'}`}>
                    {form.meta_titulo?.length || 0}/60
                  </span>
                </label>
                <input
                  type="text"
                  name="meta_titulo"
                  value={form.meta_titulo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium"
                  placeholder="Título para buscadores (Google)..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5 pl-1 flex items-center justify-between">
                  <span>Meta Description</span>
                  <span className={`text-xs ${form.meta_descripcion?.length > 160 ? 'text-amber-600 font-bold' : 'text-stone-400'}`}>
                    {form.meta_descripcion?.length || 0}/160
                  </span>
                </label>
                <textarea
                  name="meta_descripcion"
                  value={form.meta_descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-stone-900 font-medium resize-none"
                  placeholder="Resumen atractivo para los resultados de búsqueda..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/50 p-6 sm:p-8 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
              <span className="material-symbols-outlined text-primary">toggle_on</span>
              <h2 className="font-headline text-xl font-bold text-stone-800 tracking-tight">Opciones de Publicación</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              <label className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={form.destacado}
                    onChange={handleChange}
                    className="w-6 h-6 border-2 border-stone-300 rounded text-primary focus:ring-0 appearance-none bg-white checked:bg-primary checked:border-primary transition-colors peer"
                  />
                  <span className="material-symbols-outlined text-white text-[16px] absolute pointer-events-none opacity-0 peer-checked:opacity-100">check</span>
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Fijar como Destacada</h4>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">Aparecerá en el slider principal superior.</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="publicado"
                    checked={form.publicado}
                    onChange={handleChange}
                    className="w-6 h-6 border-2 border-stone-300 rounded text-emerald-500 focus:ring-0 appearance-none bg-white checked:bg-emerald-500 checked:border-emerald-500 transition-colors peer"
                  />
                  <span className="material-symbols-outlined text-white text-[16px] absolute pointer-events-none opacity-0 peer-checked:opacity-100">check</span>
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Publicar de Inmediato</h4>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">La noticia quedará visible para el público final.</p>
                </div>
              </label>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    Actualizar Noticia
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
