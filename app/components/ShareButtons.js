'use client'

import { useState } from 'react'

export default function ShareButtons({ title, text }) {
  const [showMenu, setShowMenu] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: text,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al compartir:', err)
        }
      }
    } else {
      // Fallback a menú desplegable
      setShowMenu(!showMenu)
    }
  }

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " - " + (typeof window !== 'undefined' ? window.location.href : ''))}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert("¡Enlace copiado al portapapeles!")
      setShowMenu(false)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={handleShare}
        className="text-stone-500 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-stone-100" 
        aria-label="Compartir"
        title="Compartir noticia"
      >
        <span className="material-symbols-outlined text-xl">share</span>
      </button>

      {/* Solo se muestra si falla/falta el Web Share API y clickean */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-xl border border-stone-100 py-2 z-50 w-48 flex flex-col gap-1">
          <a
            onClick={() => setShowMenu(false)}
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">facebook</span>
            Facebook
          </a>
          <a
            onClick={() => setShowMenu(false)}
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">tag</span>
            X (Twitter)
          </a>
          <a
            onClick={() => setShowMenu(false)}
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-[#25D366] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp
          </a>
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            Copiar enlace
          </button>
        </div>
      )}
    </div>
  )
}
