export const SHOT_WIDTHS = [640, 960, 1280, 1600, 2000]
export const HERO_WIDTHS = [640, 960, 1280, 1600, 2000]

export function imageUrl(name: string, width: number) {
  return `/img/${name}-${Math.round(width)}.webp`
}

export function imageSrcset(name: string, widths: number[]) {
  const unique = [...new Set(widths.filter((width) => Number.isFinite(width) && width > 0))]
  unique.sort((a, b) => a - b)
  return unique.map((width) => `${imageUrl(name, width)} ${Math.round(width)}w`).join(', ')
}
