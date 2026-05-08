'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function FixPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    async function fixSlugs() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLogs(prev => [...prev, 'Debes iniciar sesión en /admin/login primero.'])
          return
        }

        setLogs(prev => [...prev, 'Iniciando corrección de slugs largos...'])

        const { data, error } = await supabase.from('noticias').select('id, slug')
        if (error) throw error

        let count = 0
        for (let n of data) {
          if (n.slug && n.slug.length > 100) {
            setLogs(prev => [...prev, `Truncando slug para ID: ${n.id}`])
            const { error: updateErr } = await supabase
              .from('noticias')
              .update({ slug: n.slug.substring(0, 100) })
              .eq('id', n.id)

            if (updateErr) {
              setLogs(prev => [...prev, `Error actualizando ${n.id}: ${updateErr.message}`])
            } else {
              setLogs(prev => [...prev, `Actualizado exitosamente: ${n.id}`])
              count++
            }
          }
        }
        setLogs(prev => [...prev, `Proceso finalizado. Se corrigieron ${count} noticias.`])
      } catch (err) {
        setLogs(prev => [...prev, `Error: ${err.message}`])
      }
    }

    fixSlugs()
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Herramienta de Corrección de DB</h1>
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
        {logs.join('\n')}
      </div>
    </div>
  )
}
