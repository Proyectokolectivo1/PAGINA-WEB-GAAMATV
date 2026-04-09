'use client'

import { useEffect } from 'react'
import { incrementVisitas } from '@/lib/supabase'

export default function ViewTracker({ id }) {
  useEffect(() => {
    if (id) {
      // Usamos un timeout pequeño para asegurarnos de que la noticia se cargó 
      // y no mandar la petición en re-renders innecesarios.
      const timer = setTimeout(() => {
        incrementVisitas(id)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [id])

  return null
}
