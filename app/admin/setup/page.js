'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SetupAdmin() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })

      if (signUpError) throw signUpError

      if (data.user) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/login')
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Error al crear el usuario')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 text-green-600 p-6 rounded-xl mb-4">
            <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
            <h2 className="font-bold text-lg">¡Usuario creado exitosamente!</h2>
            <p className="text-sm mt-2">Serás redirigido al login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
          </div>
          <h1 className="font-headline text-2xl font-black text-emerald-900">
            Configuración Inicial
          </h1>
          <p className="text-on-surface-variant mt-2">Crea tu cuenta de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Pedro Antonio Castaño"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="admin@gaamatv.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta Admin'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-4">
          <Link href="/" className="text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
