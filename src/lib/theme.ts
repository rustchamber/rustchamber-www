import { writable } from 'svelte/store'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'rustchamber-theme'
let initialized = false

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function currentFromDom(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export const theme = writable<Theme>(currentFromDom())

function apply(next: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = next
  document.documentElement.style.colorScheme = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#12110f' : '#fdfcfa')
  theme.set(next)
}

export function initTheme() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  apply(readStored() ?? (media.matches ? 'dark' : 'light'))
  media.addEventListener('change', (event) => {
    if (!readStored()) apply(event.matches ? 'dark' : 'light')
  })
}

export function toggleTheme() {
  if (typeof document === 'undefined') return
  const next: Theme = currentFromDom() === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {}
  apply(next)
}
