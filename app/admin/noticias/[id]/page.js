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
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', slug: '', color: '#10b981', orden: 0 })
  
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
        activa: true
      }
      const nuevaCat = await createCategoria(categoriaData)
      setCategorias(prev => [...prev, nuevaCat])
      setForm(prev => ({ ...prev, categoria_id: nuevaCat.id }))
      setShowNuevaCategoria(false)
      setNuevaCategoria({ nombre: '', slug: '', color: '#10b981', orden: 0 })
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
        slug: form.slug || generateSlug(form.titulo),
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
      router.push('/admin/noticias')
    } catch (error) {
      alert('Error al actualizar la noticia: ' + error.message)
    } finally {
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
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Editar Noticia</h1>
        <p className="text-on-surface-variant">Modifica la noticia existente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Información Principal</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Título de la noticia"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="slug-de-la-noticia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Excerpt (Resumen)
              </label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Breve descripción de la noticia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Contenido *
              </label>
              <textarea
                name="contenido"
                value={form.contenido}
                onChange={handleChange}
                rows={12}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-sm"
                placeholder="Contenido de la noticia en HTML o texto plano..."
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Clasificación</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Categoría *
              </label>
              {!showNuevaCategoria ? (
                <div className="flex gap-2">
                  <select
                    name="categoria_id"
                    value={form.categoria_id}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNuevaCategoria(true)}
                    className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    title="Crear nueva categoría"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <input
                    type="text"
                    name="nombre"
                    value={nuevaCategoria.nombre}
                    onChange={handleNuevaCategoriaChange}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Nombre de categoría"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="slug"
                      value={nuevaCategoria.slug}
                      onChange={handleNuevaCategoriaChange}
                      className="flex-1 px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="slug-categoria"
                    />
                    <input
                      type="color"
                      name="color"
                      value={nuevaCategoria.color}
                      onChange={handleNuevaCategoriaChange}
                      className="w-10 h-10 border border-outline-variant rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="orden"
                      value={nuevaCategoria.orden}
                      onChange={handleNuevaCategoriaChange}
                      className="flex-1 px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Orden"
                    />
                    <button
                      type="button"
                      onClick={handleCrearCategoria}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNuevaCategoria(false)
                        setNuevaCategoria({ nombre: '', slug: '', color: '#10b981', orden: 0 })
                      }}
                      className="px-3 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Autor
              </label>
              <select
                name="autor_id"
                value={form.autor_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Seleccionar autor</option>
                {autores.map(autor => (
                  <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Multimedia</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Imagen Principal (URL de Google Drive)
              </label>
              <input
                type="text"
                name="imagen_principal"
                value={form.imagen_principal}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="https://drive.google.com/file/d/..."
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Sube la imagen a Google Drive y pega aquí el enlace compartido
              </p>
              {form.imagen_principal && (
                <div className="mt-2">
                  <img src={form.imagen_principal} alt="Preview" className="h-32 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none' }} />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, imagen_principal: '' }))}
                    className="text-red-600 text-sm mt-1"
                  >
                    Eliminar imagen
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Video de YouTube (URL completa)
              </label>
              <input
                type="text"
                name="video_youtube_url"
                value={form.video_youtube_id}
                onChange={handleYouTubeChange}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Pega la URL completa de YouTube (se guardará la URL, no el ID)
              </p>
              {form.video_youtube_id && extractYouTubeId(form.video_youtube_id) && (
                <div className="mt-2">
                  <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${extractYouTubeId(form.video_youtube_id)}`}
                      title="Preview"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">search</span>
            SEO (Optimización para buscadores)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Meta Título
              </label>
              <input
                type="text"
                name="meta_titulo"
                value={form.meta_titulo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder={form.titulo}
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Título que aparecerá en Google (recomendado 60 caracteres)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Meta Descripción
              </label>
              <textarea
                name="meta_descripcion"
                value={form.meta_descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder={form.excerpt}
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Descripción para buscadores (recomendado 150-160 caracteres)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Opciones</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="destacado"
                checked={form.destacado}
                onChange={handleChange}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-on-surface">Noticia destacada</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="publicado"
                checked={form.publicado}
                onChange={handleChange}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-on-surface">Publicar inmediatamente</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Actualizar Noticia'}
          </button>
        </div>
      </form>
    </div>
  )
}
