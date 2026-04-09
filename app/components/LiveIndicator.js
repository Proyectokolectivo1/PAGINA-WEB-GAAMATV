'use client'

export default function LiveIndicator() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button className="group bg-gradient-to-r from-primary to-secondary text-white px-5 py-3 rounded-full shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-3 cursor-pointer">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="font-bold text-xs uppercase tracking-widest hidden group-hover:block whitespace-nowrap">En Directo</span>
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: 'FILL 1' }}>live_tv</span>
      </button>
    </div>
  )
}
