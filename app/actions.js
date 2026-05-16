'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateNewsCache() {
  // Revalidar página principal
  revalidatePath('/')
  
  // Revalidar cualquier página que dependa del layout (todas)
  revalidatePath('/', 'layout')
}

export async function revalidateNoticiaCache(slug) {
  // Revalidar la página específica de la noticia (efecto inmediato)
  if (slug) {
    revalidatePath(`/noticia/${slug}`)
  }
  // Revalidar también la página principal y el layout
  revalidatePath('/')
  revalidatePath('/', 'layout')
}
