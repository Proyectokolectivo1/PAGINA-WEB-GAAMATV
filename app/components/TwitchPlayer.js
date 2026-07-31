'use client'

import { useEffect, useState, useRef } from 'react'

export default function CustomTwitchPlayer({ channel }) {
  const [hostname, setHostname] = useState('')
  const [isLive, setIsLive] = useState(false) // Iniciamos en falso, mostrando la pantalla premium
  
  useEffect(() => {
    // Twitch requiere el hostname exacto sin puertos para el parámetro parent
    setHostname(window.location.hostname)
  }, [])

  useEffect(() => {
    if (!hostname) return;

    let embed = null;

    const initTwitch = () => {
      if (window.Twitch && window.Twitch.Embed) {
        // Limpiamos el contenedor por si hay montajes dobles de React Strict Mode
        const container = document.getElementById('twitch-embed-div');
        if (container) container.innerHTML = '';
        
        embed = new window.Twitch.Embed('twitch-embed-div', {
          width: '100%',
          height: '100%',
          channel: channel,
          layout: 'video',
          parent: [hostname],
          muted: false,
        });

        embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
          const player = embed.getPlayer();
          if (player) {
            player.addEventListener(window.Twitch.Player.ONLINE, () => setIsLive(true));
            player.addEventListener(window.Twitch.Player.OFFLINE, () => setIsLive(false));
            player.addEventListener(window.Twitch.Player.PLAYING, () => setIsLive(true));
          }
        });
      }
    };

    if (!window.Twitch) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://embed.twitch.tv/embed/v1.js');
      script.addEventListener('load', initTwitch);
      document.body.appendChild(script);
    } else {
      initTwitch();
    }

    return () => {
      const container = document.getElementById('twitch-embed-div');
      if (container) container.innerHTML = '';
    }
  }, [hostname, channel]);

  if (!hostname) return (
    <div className="w-full aspect-video bg-stone-900 rounded-2xl flex items-center justify-center mb-8 animate-pulse">
      <span className="text-white/50 font-bold">Cargando reproductor...</span>
    </div>
  )

  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 mb-4">
         <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-stone-300'}`}></span>
         <h2 className="text-xl font-bold text-stone-900 font-headline uppercase tracking-widest">
           {isLive ? 'GaamaTV EN VIVO' : 'GaamaTV (Desconectado)'}
         </h2>
      </div>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-100 bg-stone-900">
        
        {/* Placeholder Offline Personalizado */}
        {!isLive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-stone-900 to-black z-20">
             <span className="material-symbols-outlined text-[80px] text-stone-700 mb-6 block">videocam_off</span>
             <h3 className="text-white text-3xl font-bold font-headline mb-3">Transmisión Inactiva</h3>
             <p className="text-stone-400 text-lg max-w-md">
               No estamos transmitiendo en vivo en este momento. Sigue leyendo nuestras últimas noticias y vuelve pronto.
             </p>
          </div>
        )}

        {/* Contenedor del Reproductor de Twitch */}
        <div 
          id="twitch-embed-div" 
          className={`w-full h-full ${isLive ? 'opacity-100 z-10 relative' : 'opacity-0 absolute -z-10'}`} 
        />
      </div>
    </div>
  )
}
