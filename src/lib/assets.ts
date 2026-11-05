export const ASSETS_ORIGIN = 'https://assets-projects.lipecode.com'
export const PROJECT_PREFIX = 'rustchamber'

export type ImageOptions = {
  width?: number
  height?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png'
}

const clamp = (value: number) => Math.min(12000, Math.max(1, Math.round(value)))

const encodeKey = (key: string) =>
  key.split('/').filter(Boolean).map((segment) => encodeURIComponent(segment)).join('/')

const isSvg = (key: string) => key.split('?')[0].toLowerCase().endsWith('.svg')

export function imageUrl(key: string, options: ImageOptions = {}) {
  const { width, height, fit, quality = 70, format = 'auto' } = options
  const params: string[] = []
  if (width !== undefined) params.push(`width=${clamp(width)}`)
  if (height !== undefined) params.push(`height=${clamp(height)}`)
  if (fit) params.push(`fit=${fit}`)
  params.push(`quality=${quality}`, `format=${format}`, 'onerror=redirect')
  return `${ASSETS_ORIGIN}/cdn-cgi/image/${params.join(',')}/${PROJECT_PREFIX}/${encodeKey(key)}`
}

export function imageSrcset(key: string, widths: number[], options: ImageOptions = {}) {
  if (isSvg(key)) return undefined
  const unique = [...new Set(widths.filter((width) => Number.isFinite(width) && width > 0))]
  if (!unique.length) return undefined
  unique.sort((a, b) => a - b)
  return unique
    .map((width) => `${imageUrl(key, { ...options, width })} ${clamp(width)}w`)
    .join(', ')
}
