export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '')

  const backendUrl = env.API_URL || 'http://localhost:3001'
  const target = `${backendUrl}/api${path}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.set('access-control-allow-origin', '*')

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}
