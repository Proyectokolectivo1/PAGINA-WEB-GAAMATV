import { ImageResponse } from 'next/og'

// IMPORTANTE: Usar 'edge' runtime para evitar el bug de @vercel/og en Windows con Node.js runtime.
// En producción (Vercel) funciona perfectamente con ambos runtimes.
export const runtime = 'edge'
export const revalidate = 86400

export async function GET(request) {
  try {
    // En edge runtime, usamos fetch para cargar el logo desde la URL pública del servidor
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const logoUrl = `${protocol}://${host}/logo-principal.png`

    // Cargar el logo como ArrayBuffer (requerido por Satori en edge runtime)
    const logoRes = await fetch(logoUrl)
    const logoArrayBuffer = await logoRes.arrayBuffer()

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f2010 0%, #1a3a1a 40%, #0d1f0d 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Círculos decorativos */}
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '-120px',
              width: '480px',
              height: '480px',
              borderRadius: '50%',
              border: '1px solid rgba(139, 195, 74, 0.1)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              border: '1px solid rgba(76, 175, 80, 0.1)',
              display: 'flex',
            }}
          />

          {/* Logo GaamaTV */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoArrayBuffer}
            width={500}
            height={250}
            style={{ objectFit: 'contain', marginBottom: '32px' }}
            alt="GaamaTV"
          />

          {/* Separador */}
          <div
            style={{
              width: '300px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #8bc34a, transparent)',
              marginBottom: '32px',
              display: 'flex',
            }}
          />

          {/* Subtítulo correcto */}
          <p
            style={{
              fontSize: '32px',
              color: '#c8deb0',
              fontWeight: 400,
              letterSpacing: '0.03em',
              margin: 0,
              textAlign: 'center',
            }}
          >
            El lente editorial del Oriente Antioqueño
          </p>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (err) {
    console.error('[og-image/default]', err)
    // Fallback: imagen de error mínima
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f2010',
          }}
        >
          <p style={{ color: '#8bc34a', fontSize: '48px', fontWeight: 700 }}>GaamaTV</p>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}
