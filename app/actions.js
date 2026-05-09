'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateNewsCache() {
  // Revalidar página principal
  revalidatePath('/')
  
  // Revalidar cualquier página que dependa del layout (todas)
  revalidatePath('/', 'layout')
}
