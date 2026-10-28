export function parseQuery(search) {
  const params = {}
  const query = search.startsWith('?') ? search.slice(1) : search
  for (const part of query.split('&')) {
    if (!part) continue
    const [rawKey, rawValue = ''] = part.split('=')
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '))
  }
  return params
}
