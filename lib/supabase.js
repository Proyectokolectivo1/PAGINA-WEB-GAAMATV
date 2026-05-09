import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const TABLES = {
  NOTICIAS: 'noticias',
  CATEGORIAS: 'categorias',
  AUTORES: 'autores',
  GALERIA: 'galeria_noticias',
  PUBLICIDAD: 'publicidad_negocios',
  FIRMAS: 'firmas',
  REDES_SOCIALES: 'redes_sociales',
}

export const STORAGE_BUCKET = 'imagenes-noticias'


export async function getCategorias() {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIAS)
    .select('*')
    .eq('activa', true)
    .order('orden', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createCategoria(categoria) {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIAS)
    .insert([categoria])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCategoriasAdmin() {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIAS)
    .select('*')
    .order('orden', { ascending: true })
  
  if (error) throw error
  return data
}

export async function updateCategoria(id, categoria) {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIAS)
    .update(categoria)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategoria(id) {
  const { error } = await supabase
    .from(TABLES.CATEGORIAS)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getCategoriaBySlug(slug) {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIAS)
    .select('*')
    .eq('slug', slug)
    .eq('activa', true)
    .single()
  
  if (error) throw error
  return data
}

export async function getAutores() {
  const { data, error } = await supabase
    .from(TABLES.AUTORES)
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getAutorById(id) {
  const { data, error } = await supabase
    .from(TABLES.AUTORES)
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getNoticias(options = {}) {
  const { 
    categoriaSlug, 
    limit = 20, 
    offset = 0, 
    destacado = false,
    search = '' 
  } = options

  let query = supabase
    .from(TABLES.NOTICIAS)
    .select(`
      *,
      categoria:categorias${categoriaSlug ? '!inner' : ''}(nombre, slug, color),
      autor:autores(nombre, cargo, foto_url)
    `, { count: 'exact' })
    .eq('publicado', true)

  if (categoriaSlug) {
    // Para filtrar por una tabla relacionada en Supabase, usamos la sintaxis tabla!inner(columna)
    // Esto asegura que solo se devuelvan los registros que tengan coincidencia en la tabla relacionada
    query = query.filter('categoria.slug', 'eq', categoriaSlug)
  }

  if (destacado) {
    query = query.eq('destacado', true)
  }

  if (search) {
    query = query.or(`titulo.ilike.%${search}%,contenido.ilike.%${search}%`)
  }

  const { data, error, count } = await query
    .order('fecha_publicacion', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count }
}

export async function getNoticiaBySlug(slug) {
  // Decode URI-encoded slugs (e.g. %C3%BA -> ú)
  const decodedSlug = decodeURIComponent(slug)

  // Try exact match first
  let { data: noticia, error } = await supabase
    .from(TABLES.NOTICIAS)
    .select('*')
    .eq('slug', decodedSlug)
    .eq('publicado', true)
    .single()

  // If exact match fails, try case-insensitive match
  if (error || !noticia) {
    const { data: fallbackNoticia, error: fallbackError } = await supabase
      .from(TABLES.NOTICIAS)
      .select('*')
      .ilike('slug', decodedSlug)
      .eq('publicado', true)
      .single()

    if (fallbackError || !fallbackNoticia) {
      // Last resort: normalize the slug and try matching against normalized DB slugs
      const normalizedSlug = generateSlug(decodedSlug)
      const { data: normalizedNoticia, error: normalizedError } = await supabase
        .from(TABLES.NOTICIAS)
        .select('*')
        .eq('slug', normalizedSlug)
        .eq('publicado', true)
        .single()

      if (normalizedError || !normalizedNoticia) {
        throw fallbackError || normalizedError || new Error('Noticia no encontrada')
      }
      noticia = normalizedNoticia
    } else {
      noticia = fallbackNoticia
    }
  }

  if (noticia.categoria_id) {
    const { data: categoria } = await supabase
      .from('categorias')
      .select('nombre, slug, color')
      .eq('id', noticia.categoria_id)
      .single()
    noticia.categoria = categoria
  }

  if (noticia.autor_id) {
    const { data: autor } = await supabase
      .from('autores')
      .select('nombre, cargo, foto_url, biografia')
      .eq('id', noticia.autor_id)
      .single()
    noticia.autor = autor
  }

  const { data: galeria } = await supabase
    .from('galeria_noticias')
    .select('url, descripcion, orden')
    .eq('noticia_id', noticia.id)
    .order('orden', { ascending: true })
  noticia.galeria = galeria || []

  return noticia
}

export async function getNoticiasRelacionadas(noticiaId, categoriaId, limit = 3) {
  if (!categoriaId) return []
  
  const { data, error } = await supabase
    .from(TABLES.NOTICIAS)
    .select(`
      *,
      categoria:categorias(nombre, slug, color),
      autor:autores(nombre, cargo)
    `)
    .eq('publicado', true)
    .neq('id', noticiaId)
    .eq('categoria_id', categoriaId)
    .order('fecha_publicacion', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getNoticiaById(id) {
  const { data, error } = await supabase
    .from(TABLES.NOTICIAS)
    .select(`
      *,
      categoria:categorias(*),
      autor:autores(*),
      galeria:galeria_noticias(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getNoticiasAdmin(options = {}) {
  const { limit = 50, offset = 0 } = options

  const { data, error, count } = await supabase
    .from(TABLES.NOTICIAS)
    .select(`
      *,
      categoria:categorias(nombre, slug),
      autor:autores(nombre)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data, count }
}

export async function incrementVisitas(id) {
  const { data, error } = await supabase.rpc('increment_visitas', { noticia_id: id })
  if (error) {
    console.error('Error incrementing views:', error)
    return false
  }
  return true
}

export async function createNoticia(noticia) {
  const { data, error } = await supabase
    .from(TABLES.NOTICIAS)
    .insert([noticia])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNoticia(id, noticia) {
  const { data, error } = await supabase
    .from(TABLES.NOTICIAS)
    .update(noticia)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNoticia(id) {
  const { error } = await supabase
    .from(TABLES.NOTICIAS)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function togglePublicarNoticia(id, publicado) {
  const { data, error } = await supabase
    .from(TABLES.NOTICIAS)
    .update({ 
      publicado, 
      fecha_publicacion: publicado ? new Date().toISOString() : null 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadImage(file, folder = '') {
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '-')}`
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export async function deleteImage(url) {
  const path = url.split('/').pop()
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path])

  if (error) throw error
  return true
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

export function generateSlug(titulo) {
  if (!titulo) return ''
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100) // Truncate to avoid ENAMETOOLONG on filesystem
    .replace(/-+$/, '') // Remove trailing hyphens if truncated
}

export async function getAnuncios(limit = 3) {
  const { data, error } = await supabase
    .from(TABLES.PUBLICIDAD)
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getAllAnuncios() {
  const { data, error } = await supabase
    .from(TABLES.PUBLICIDAD)
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function createAnuncio(anuncio) {
  const { data, error } = await supabase
    .from(TABLES.PUBLICIDAD)
    .insert([anuncio])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAnuncio(id, anuncio) {
  const { data, error } = await supabase
    .from(TABLES.PUBLICIDAD)
    .update(anuncio)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAnuncio(id) {
  const { error } = await supabase
    .from(TABLES.PUBLICIDAD)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function toggleActivoAnuncio(id, activo) {
  const { data, error } = await supabase
    .from(TABLES.PUBLICIDAD)
    .update({ activo })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export function extractYouTubeId(url) {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1].length === 11 ? match[1] : null
    }
  }
  return null
}

export function getYouTubeThumbnail(videoId, quality = 'maxresdefault') {
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

export function processImageUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return url;
  
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // Use thumbnail endpoint for faster loading
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }
  } else if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }
  } else if (url.includes('drive.google.com/uc?')) {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }
  }
  return url;
}

// ==========================================
// MÉTODOS PARA FIRMAS (OPINIÓN)
// ==========================================

export async function getFirmas(limit = 4) {
  try {
    let query = supabase
      .from(TABLES.FIRMAS)
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })
      
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.warn('Error getFirmas:', error.message)
      return []
    }
    return data
  } catch (err) {
    console.error('Catch getFirmas:', err)
    return []
  }
}

export async function getAllFirmas() {
  const { data, error } = await supabase
    .from(TABLES.FIRMAS)
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function createFirma(firma) {
  const { data, error } = await supabase
    .from(TABLES.FIRMAS)
    .insert([firma])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFirma(id, firma) {
  const { data, error } = await supabase
    .from(TABLES.FIRMAS)
    .update(firma)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFirma(id) {
  const { error } = await supabase
    .from(TABLES.FIRMAS)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function toggleActivoFirma(id, activo) {
  const { data, error } = await supabase
    .from(TABLES.FIRMAS)
    .update({ activo })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// MÉTODOS PARA REDES SOCIALES
// ==========================================

export async function getRedesSociales() {
  try {
    const { data, error } = await supabase
      .from(TABLES.REDES_SOCIALES)
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) {
      console.warn('Error getRedesSociales:', error.message)
      return []
    }
    return data
  } catch (err) {
    console.error('Catch getRedesSociales:', err)
    return []
  }
}

export async function getAllRedesSociales() {
  const { data, error } = await supabase
    .from(TABLES.REDES_SOCIALES)
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

export async function createRedSocial(red) {
  const { data, error } = await supabase
    .from(TABLES.REDES_SOCIALES)
    .insert([red])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRedSocial(id, red) {
  const { data, error } = await supabase
    .from(TABLES.REDES_SOCIALES)
    .update(red)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRedSocial(id) {
  const { error } = await supabase
    .from(TABLES.REDES_SOCIALES)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function toggleActivoRedSocial(id, activo) {
  const { data, error } = await supabase
    .from(TABLES.REDES_SOCIALES)
    .update({ activo })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
