<script lang="ts">
  import { onMount } from 'svelte'
  import { SHOT_WIDTHS, imageSrcset, imageUrl } from './assets'
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

  const sizes = '(max-width: 1248px) calc(100vw - 3rem), 1200px'

  const active = $derived($theme === 'dark' ? dark : light)
  const src = $derived(imageUrl(active, 1600))
  const srcset = $derived(imageSrcset(active, SHOT_WIDTHS))

  onMount(() => {
    if (!priority) return
    const other = $theme === 'dark' ? light : dark
    const preload = new Image()
    preload.src = imageUrl(other, 1600)
    preload.srcset = imageSrcset(other, SHOT_WIDTHS)
    preload.sizes = sizes
  })
</script>

<img class={imgClass} {src} {srcset} {sizes} {alt} {width} {height} loading={priority ? 'eager' : 'lazy'} decoding="async" />
