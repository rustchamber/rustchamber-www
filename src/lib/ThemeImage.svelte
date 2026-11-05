<script lang="ts">
  import { onMount } from 'svelte'
  import { imageSrcset, imageUrl } from './assets'
  import { theme } from './theme'

  let {
    light,
    dark,
    alt,
    width = 1600,
    height = 1000,
    imgClass = '',
    priority = false,
  }: {
    light: string
    dark: string
    alt: string
    width?: number
    height?: number
    imgClass?: string
    priority?: boolean
  } = $props()

  const widths = [640, 960, 1280, 1600, 2000]
  const quality = 62
  const sizes = '(max-width: 1248px) calc(100vw - 3rem), 1200px'

  const active = $derived($theme === 'dark' ? dark : light)
  const src = $derived(imageUrl(active, { width: 1600, quality }))
  const srcset = $derived(imageSrcset(active, widths, { quality }))

  onMount(() => {
    if (!priority) return
    const other = $theme === 'dark' ? light : dark
    const preload = new Image()
    preload.src = imageUrl(other, { width: 1600, quality })
    preload.srcset = imageSrcset(other, widths, { quality }) ?? ''
    preload.sizes = sizes
  })
</script>

<img class={imgClass} {src} {srcset} {sizes} {alt} {width} {height} loading={priority ? 'eager' : 'lazy'} decoding="async" />
