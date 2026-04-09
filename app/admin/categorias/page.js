'use client'

import { useState, useEffect } from 'react'
import { getCategoriasAdmin, updateCategoria, createCategoria, deleteCategoria } from '@/lib/supabase'

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCategoria, setCurrentCategoria] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    color: '#579a4f',
    orden: 0,
    activa: true,
    tipo: 'seccion'
  })

  useEffect(() => {
    fetchCategorias()
  }, [])

  async function fetchCategorias() {
    try {
      setLoading(true)
      const data = await getCategoriasAdmin()
      setCategorias(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setCurrentCategoria(cat)
      setFormData({
        nombre: cat.nombre,
        slug: cat.slug,
        color: cat.color || '#579a4f',
        orden: cat.orden || 0,
        activa: cat.activa,
        tipo: cat.tipo || 'seccion'
      })
    } else {
      setCurrentCategoria(null)
      setFormData({
        nombre: '',
        slug: '',
        color: '#579a4f',
        orden: categorias.length > 0 ? Math.max(...categorias.map(c => c.orden || 0)) + 1 : 1,
        activa: true,
        tipo: 'seccion'
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentCategoria(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    
    setFormData(prev => {
      const newData = { ...prev, [name]: val }
      if (name === 'nombre' && (!currentCategoria || !prev.slug)) {
        newData.slug = value.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-')
      }
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (currentCategoria) {
        await updateCategoria(currentCategoria.id, formData)
      } else {
        await createCategoria(formData)
      }
      fetchCategorias()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error al guardar la categoría: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría? Si tiene noticias asociadas, la operación fallará por integridad de datos.')) {
      try {
        await deleteCategoria(id)
        fetchCategorias()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('No se puede eliminar la categoría. Probablemente tiene noticias vinculadas.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">Administrar Categorías</h1>
            <p className="text-on-surface-variant font-body">Configura las secciones y el orden de navegación del sitio</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full hover:bg-primary-container transition-all shadow-editorial hover:scale-105 active:scale-95 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Crear Categoría
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-on-surface-variant animate-pulse font-medium">Cargando categorías...</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[32px] overflow-hidden shadow-editorial">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-8 py-5 font-headline font-bold text-on-surface-variant">Orden</th>
                    <th className="px-8 py-5 font-headline font-bold text-on-surface-variant">Categoría</th>
                    <th className="px-8 py-5 font-headline font-bold text-on-surface-variant">Slug URL</th>
                    <th className="px-8 py-5 font-headline font-bold text-on-surface-variant">Tipo</th>
                    <th className="px-8 py-5 font-headline font-bold text-on-surface-variant text-center">Color</th>
                    <th className="px-8 py-5 font-headline font-bold text-on-surface-variant text-center">Estado</th>
                    <th className="px-8 py-5 font-headline font-bold text-on-surface-variant text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {categorias.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="font-mono bg-surface-container-high px-3 py-1 rounded-lg text-on-surface-variant font-bold">
                          {cat.orden}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-8 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span className="font-headline text-xl font-bold text-on-surface">{cat.nombre}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-mono text-on-surface-variant bg-surface-container/50 px-2 py-1 rounded">
                          /{cat.slug}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                          cat.tipo?.toLowerCase().trim() === 'ciudad' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {cat.tipo?.toLowerCase().trim() === 'ciudad' ? 'Ciudad' : 'Sección'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <div 
                            className="w-8 h-8 rounded-xl shadow-inner border border-outline-variant"
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span className="text-[10px] font-mono uppercase opacity-50">{cat.color}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          cat.activa 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'bg-error/10 text-error border border-error/20'
                        }`}>
                          {cat.activa ? 'Activa' : 'Oculta'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="p-3 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                            title="Editar sección"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-3 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-2xl transition-all"
                            title="Eliminar permanentemente"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6m-4.74 0-.34-6m4.74 6c0 1.11-.89 2-2 2h-9.48a2 2 0 0 1-2-2V9h12.48z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-1.5 12a2.25 2.25 0 0 1-2.25 2.25H8.25A2.25 2.25 0 0 1 6 20.25l-1.5-12m15 0h-15m10.5-3.75l-.75-1.5a1.125 1.125 0 0 0-1.02-.63H9.27a1.125 1.125 0 0 0-1.02.63l-.75 1.5M4.5 8.25h15" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categorias.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66a2.25 2.25 0 0 0-1.592-.659Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h.008v.008H7.5V7.5Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">No hay categorías</h3>
                  <p className="max-w-xs text-on-surface-variant">Comience creando su primera categoría temática para organizar las noticias.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Overlay glassmorphism */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div 
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-md"
              onClick={handleCloseModal}
            ></div>
            
            <div className="relative bg-surface p-[2px] rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-gradient-to-br from-primary/20 via-transparent to-primary/10">
              <div className="relative bg-surface rounded-[38px] p-10">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-3xl font-headline font-bold text-on-surface">
                    {currentCategoria ? 'Editar Sección' : 'Nueva Sección'}
                  </h2>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-bold mb-2 text-on-surface-variant group-focus-within:text-primary transition-colors">Nombre de Categoría</label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container border border-outline-variant rounded-[20px] px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-headline font-semibold"
                      placeholder="Ej: Entretenimiento"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold mb-2 text-on-surface-variant">Slug URL Identificador</label>
                    <div className="flex items-center bg-surface-container-high border border-outline-variant rounded-[20px] overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                      <span className="pl-5 text-on-surface-variant/50 font-mono select-none">gaama.tv/</span>
                      <input
                        type="text"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none px-2 py-4 focus:outline-none font-mono text-sm text-primary font-bold"
                        placeholder="ej-entretenimiento"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-on-surface-variant">Color Distintivo</label>
                      <div className="flex gap-3">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-outline-variant shadow-inner">
                          <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer border-none p-0"
                          />
                        </div>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="flex-1 bg-surface-container border border-outline-variant rounded-2xl px-4 py-2 text-sm font-mono uppercase font-bold focus:outline-none focus:border-primary"
                          maxLength="7"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-on-surface-variant">Orden de Visualización</label>
                      <input
                        type="number"
                        name="orden"
                        value={formData.orden}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-center font-bold text-xl"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold mb-2 text-on-surface-variant">
                      Tipo de Categoría <span className="text-error">*</span>
                    </label>
                    <p className="text-xs text-on-surface-variant mb-4">
                      <b>Sección General:</b> Queda visible directamente en el menú de inicio (sin agruparse).<br/>
                      <b>Ciudad/Municipio:</b> Se agrupa dentro de la lista desplegable &quot;Municipios&quot;.
                    </p>
                    <div className="flex gap-4">
                      {['seccion', 'ciudad'].map((t) => (
                        <label
                          key={t}
                          className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all font-bold capitalize cursor-pointer flex items-center justify-center gap-2 ${
                            formData.tipo === t
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipo"
                            value={t}
                            checked={formData.tipo === t}
                            onChange={handleInputChange}
                            required
                            className="sr-only"
                          />
                          {t === 'seccion' ? 'Sección General' : 'Ciudad/Municipio'}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-4 py-4 px-5 rounded-[24px] bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="activa"
                        name="activa"
                        checked={formData.activa}
                        onChange={handleInputChange}
                        className="peer appearance-none w-10 h-6 rounded-full bg-outline-variant checked:bg-primary transition-colors cursor-pointer"
                      />
                      <div className="absolute left-1 w-4 h-4 rounded-full bg-surface peer-checked:left-5 transition-all duration-300 shadow-sm pointer-events-none"></div>
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-bold text-on-surface">Visibilidad Pública</span>
                      <span className="block text-[11px] text-on-surface-variant">Si está activa, aparecerá en el menú principal y buscador.</span>
                    </div>
                  </label>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-8 py-4 border border-outline-variant rounded-full hover:bg-surface-container-high transition-all text-on-surface font-bold"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-8 py-4 bg-primary text-on-primary rounded-full hover:bg-primary-container transition-all font-bold shadow-editorial"
                    >
                      {currentCategoria ? 'Actualizar' : 'Crear Sección'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
