export const BRAND = 'RustChamber'
export const GITHUB = 'https://github.com/rustchamber/rustchamber'
export const DOCS = GITHUB + '#readme'

export const navLinks = [
  { label: 'Docs', href: DOCS },
  { label: 'Roadmap', href: '/roadmap/' },
  { label: 'Support', href: '/support/' },
]

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Download', href: '/download/' },
      { label: 'Roadmap', href: '/roadmap/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: DOCS },
      { label: 'Support', href: '/support/' },
      { label: 'Privacy', href: '/privacy/' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'GitHub', href: GITHUB },
    ],
  },
]

export const pageFromBody = (): string =>
  document.body?.dataset?.page ||
  (() => {
    const p = location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '')
    return p.split('/').filter(Boolean).pop() || 'home'
  })()
