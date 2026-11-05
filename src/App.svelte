<script lang="ts">
  import type { Component } from 'svelte'
  import Topbar from './lib/Topbar.svelte'
  import Footer from './lib/Footer.svelte'
  import Home from './lib/pages/Home.svelte'
  import Download from './lib/pages/Download.svelte'
  import Support from './lib/pages/Support.svelte'
  import Privacy from './lib/pages/Privacy.svelte'
  import Roadmap from './lib/pages/Roadmap.svelte'

  let { page = 'home' }: { page?: string } = $props()

  const pages: Record<string, Component> = {
    home: Home,
    download: Download,
    support: Support,
    privacy: Privacy,
    roadmap: Roadmap,
  }

  const Current = $derived(pages[page] ?? Home)
</script>

<div class="shell">
  <Topbar {page} />
  <Current />
  <Footer />
</div>
