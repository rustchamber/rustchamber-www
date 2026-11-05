<script lang="ts">
  import { onMount } from 'svelte'
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

  const src = $derived($theme === 'dark' ? dark : light)

  onMount(() => {
    const preload = new Image()
    preload.src = $theme === 'dark' ? light : dark
  })
</script>

<img class={imgClass} src={src} {alt} {width} {height} loading={priority ? 'eager' : 'lazy'} decoding="async" />
