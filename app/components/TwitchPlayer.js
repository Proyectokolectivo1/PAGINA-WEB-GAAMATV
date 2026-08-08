'use client'

import { useEffect, useState } from 'react'

export default function CustomTwitchPlayer({ channel }) {
  const [hostname, setHostname] = useState('')
  const [isLive, setIsLive] = useState(null) // null = cargando, true = en vivo, false = offline

  // Obtener el hostname del cliente (requerido por Twitch para el param "parent")
  useEffect(() => {
    setHostname(window.location.hostname)
  }, [])

  // Verificar si el canal está en vivo usando la API pública de Twitch GQL (sin auth key propia)
  useEffect(() => {
    if (!channel) return

    const checkLiveStatus = async () => {
      try {
        // Llamamos a nuestra API interna de Next.js para evitar bloqueos CORS de Twitch
        const res = await fetch(`/api/twitch-status?channel=${channel}`)
        const json = await res.json()
        setIsLive(!!(json?.live))
      } catch (e) {
        console.error('Error verificando estado de Twitch:', e)
        setIsLive(false)
      }
    }

    checkLiveStatus()
    const interval = setInterval(checkLiveStatus, 30000)
    return () => clearInterval(interval)
  }, [channel])

  // ─── Pantalla de carga inicial ────────────────────────────────────────────
  if (!hostname || isLive === null) {
    return (
      <div className="w-full mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-400 animate-pulse"></span>
          <h2 className="text-xl font-bold text-stone-900 font-headline uppercase tracking-widest">
            Cargando GaamaTV...
          </h2>
        </div>
        <div className="w-full aspect-video rounded-2xl bg-stone-900 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full mb-10">
      {/* Indicador de estado */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isLive ? 'bg-red-500 animate-pulse' : 'bg-stone-400'
          }`}
        />
        <h2 className="text-xl font-bold text-stone-900 font-headline uppercase tracking-widest">
          {isLive ? 'GaamaTV EN VIVO' : 'GaamaTV (Desconectado)'}
        </h2>
      </div>

      {/* Contenedor del player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-100 bg-stone-900">

        {isLive ? (
          /* ── EN VIVO: iframe directo de Twitch ─────────────────────────── */
          <iframe
            src={`https://player.twitch.tv/?channel=${channel}&parent=${hostname}&autoplay=true`}
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            title={`${channel} en Twitch`}
          />
        ) : (
          /* ── OFFLINE: banner personalizado ─────────────────────────────── */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-stone-900 to-black">
            <span className="material-symbols-outlined text-[80px] text-stone-700 mb-6 block">
              videocam_off
            </span>
            <h3 className="text-white text-3xl font-bold font-headline mb-3">
              Transmisión Inactiva
            </h3>
            <p className="text-stone-400 text-lg max-w-md">
              No estamos transmitiendo en vivo en este momento. Sigue leyendo nuestras
              últimas noticias y vuelve pronto.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
