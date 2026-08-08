// app/api/twitch-status/route.js
// Esta ruta hace el fetch a la API de Twitch desde el servidor,
// evitando cualquier problema de CORS o bloqueos en el cliente.

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')

  if (!channel) {
    return Response.json({ live: false, error: 'channel requerido' }, { status: 400 })
  }

  try {
    const res = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        query: `query { user(login: "${channel}") { stream { id } } }`
      }),
      // No cachear — necesitamos el estado en tiempo real
      cache: 'no-store',
    })

    const json = await res.json()
    const live = !!(json?.data?.user?.stream)

    return Response.json({ live }, {
      headers: {
        // Permitir revalidar cada 30 segundos
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (e) {
    console.error('Error consultando Twitch GQL:', e)
    return Response.json({ live: false, error: e.message }, { status: 500 })
  }
}
