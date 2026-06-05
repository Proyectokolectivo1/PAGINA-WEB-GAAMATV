import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <span className="material-symbols-outlined text-5xl text-stone-300">search_off</span>
      </div>
      <h1 className="font-headline text-5xl font-black text-stone-900 tracking-tight mb-3">404</h1>
      <h2 className="text-2xl font-bold text-stone-700 mb-4">Página no encontrada</h2>
      <p className="text-stone-500 max-w-md mb-8 text-lg">
        Lo sentimos, la página o noticia que estás buscando no existe, ha sido movida, o aún no ha sido publicada.
      </p>
      <Link 
        href="/"
        className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
      >
        <span className="material-symbols-outlined">home</span>
        Volver al inicio
      </Link>
    </div>
  )
}
