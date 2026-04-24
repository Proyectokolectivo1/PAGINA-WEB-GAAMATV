'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthPage = pathname === '/admin/login'

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/admin/login')
        } else {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && !isAuthPage) {
        router.push('/admin/login')
      } else if (session) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router, pathname, isAuthPage])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-on-surface-variant animate-pulse font-medium">Preparando panel...</p>
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return children
  }

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-stone-950 shadow-sm border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <img 
                  src="/logo-principal.png" 
                  alt="Gaama TV" 
                  className="h-8 w-auto"
                />
                <span className="font-headline text-lg font-black text-white italic">
                  Admin
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/admin" className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/noticias" className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
                  Noticias
                </Link>
                <Link href="/admin/campanas" className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
                  Campañas
                </Link>
                <Link href="/admin/categorias" className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
                  Categorías
                </Link>
                <Link href="/admin/firmas" className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
                  Firmas
                </Link>
                <Link href="/admin/redes" className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
                  Redes
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank" className="text-stone-400 hover:text-white transition-colors text-sm">
                Ver sitio
              </Link>
              <button
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
