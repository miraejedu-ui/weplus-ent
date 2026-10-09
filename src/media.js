export function media(src) {
  if (!src) return ''
  if (/^(https?:|data:)/.test(src)) return src
  const base = import.meta.env.BASE_URL || '/'
  if (src.startsWith('/')) return `${base.replace(/\/$/, '')}${src}`
  return `${base}${src}`
}
