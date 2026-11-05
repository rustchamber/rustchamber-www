import { animate, inView } from 'motion'

type RevealOptions = {
  delay?: number
  y?: number
  scale?: number
  duration?: number
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function reveal(element: HTMLElement, options: RevealOptions = {}) {
  if (element.dataset.revealInit === 'true') return
  element.dataset.revealInit = 'true'
  if (reducedMotion()) return

  const { delay = 0, y = 16, scale = 0.995, duration = 0.65 } = options
  element.style.opacity = '0'
  element.style.transform = `translateY(${y}px) scale(${scale})`

  const stop = inView(
    element,
    () => {
      animate(
        element,
        { opacity: [0, 1], y: [y, 0], scale: [scale, 1] },
        { duration, delay, ease: EASE },
      )
    },
    { margin: '0px 0px -8% 0px' },
  )

  return () => stop()
}

export function initReveal() {
  if (typeof window === 'undefined' || reducedMotion()) return

  const targets: Array<[string, RevealOptions]> = [
    ['.topbar-inner', { y: -8, duration: 0.5 }],
    ['.home-hero .home-title', { delay: 0.04, y: 20, duration: 0.7 }],
    ['.home-hero .home-sub', { delay: 0.12, y: 16 }],
    ['.home-hero .home-cta', { delay: 0.2, y: 12 }],
    ['.home-hero .home-window', { delay: 0.26, y: 24, duration: 0.8 }],
    ['.home-section .home-h2', { y: 16 }],
    ['.home-section .home-lede', { delay: 0.07, y: 14 }],
    ['.home-section .home-window', { delay: 0.14, y: 22, duration: 0.7 }],
    ['.home-section .platform-row', { delay: 0.14, y: 12 }],
    ['.home-closing .button', { delay: 0.12, y: 10 }],
    ['.home-closing .home-privacy', { delay: 0.18, y: 8 }],
    ['.page-title', { y: 18 }],
    ['.page-lede', { delay: 0.07, y: 14 }],
    ['.page-group', { delay: 0.1, y: 16 }],
    ['.roadmap-col', { delay: 0.1, y: 16 }],
    ['.prose', { delay: 0.08, y: 14 }],
    ['.footer-grid', { y: 12 }],
    ['.footer-bottom', { delay: 0.06, y: 8 }],
  ]

  for (const [selector, options] of targets) {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      reveal(element, options)
    })
  }
}
