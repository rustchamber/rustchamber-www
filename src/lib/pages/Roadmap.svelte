<script lang="ts">
  import { Check, Circle, GitBranch, Monitor, Smartphone, Wrench } from '@lucide/svelte'
  import { GITHUB } from '../site'

  const columns = [
    {
      title: 'Shipped', icon: Check, items: [
        ['Native egui shell', 'Chat, sessions, files, changes, git and terminal in one window, with no webview.'],
        ['Managed OpenCode server', 'Automatic port, random password, reconnect and a clean shutdown.'],
        ['Theme engine', 'Light and dark pairs, bundled fonts, density and typography controls.'],
        ['Command palette', 'Sessions, commands and settings from ⌘K.'],
      ],
    },
    {
      title: 'In progress', icon: Circle, items: [
        ['Auto-update', 'Signed updates delivered inside the app.'],
        ['Linux and Windows polish', 'Hands-on testing, packaging and installer flows beyond CI builds.'],
        ['Web preview', 'An embedded preview for generated pages and local dev servers.'],
        ['Plugin manager', 'Browse and configure extensions without leaving the app.'],
      ],
    },
    {
      title: 'Later', icon: GitBranch, items: [
        ['MCP configuration editor', 'Add, edit and remove MCP servers from Settings.'],
        ['Mobile companion', 'A paired phone client for sessions running on your machine.'],
        ['Collaborative review', 'Share a diff walkthrough with a teammate.'],
        ['More providers', 'First-class setup for additional model providers.'],
      ],
    },
  ]
</script>

<main class="page-main">
  <section class="page-hero">
    <div class="container">
      <h1 class="page-title">Roadmap.</h1>
      <p class="page-lede">What is shipping next in RustChamber. The project is small, so this list changes as people ask for things.</p>

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px">
        <span class="pill"><Monitor size={12} /> macOS is the tested target</span>
        <span class="pill"><Smartphone size={12} /> Linux and Windows compile in CI</span>
        <span class="pill"><Wrench size={12} /> Built from source</span>
      </div>

      {#each columns as col}
        {@const Icon = col.icon}
        <div class="roadmap-col">
          <h2>{col.title}</h2>
          {#each col.items as [name, desc]}
            <div class="roadmap-item">
              <Icon size={16} />
              <div><b>{name}</b><p>{desc}</p></div>
            </div>
          {/each}
        </div>
      {/each}

      <div class="prose callout" style="max-width:none;margin-top:40px">Have a request? Open an issue in the <a href={GITHUB + '/issues'} target="_blank" rel="noopener noreferrer">repository</a>.</div>
    </div>
  </section>
</main>
