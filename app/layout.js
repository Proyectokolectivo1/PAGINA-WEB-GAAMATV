import './globals.css'
import Link from 'next/link'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LiveIndicator from './components/LiveIndicator'

export const metadata = {
  title: 'GaamaTV | El Lens Editorial del Oriente Antioqueño',
  description: 'Tu fuente de noticias del Oriente Antioqueño. Información local, regional y nacional.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Work+Sans:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
          preload="true"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
          preload="true"
        />
      </head>
      <body className="bg-background font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
        <Navbar />
        <main className="pt-24 sm:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          {children}
        </main>
        <Footer />
        <LiveIndicator />
      </body>
    </html>
  )
}
