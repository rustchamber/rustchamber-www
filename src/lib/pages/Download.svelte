<script lang="ts">
  import { Apple, Smartphone } from '@lucide/svelte'
  import { GITHUB } from '../site'

  const DMG = GITHUB + '/releases/download/v0.2.2-beta/RustChamber-0.2.2-beta-macos-universal.dmg'

  const desktop = [
    { label: 'macOS (Apple Silicon & Intel)', ver: '0.2.2 beta', icon: Apple },
  ]
  const mobile = [
    { label: 'iOS', note: 'Coming soon', icon: Apple },
    { label: 'Android', note: 'Coming soon', icon: Smartphone },
  ]
  const faqs = [
    { q: 'What do I need before installing?', a: 'macOS and the OpenCode CLI on your PATH. RustChamber starts a managed opencode serve process on a free loopback port and stops it when the app quits. You can also point it at an existing server in Settings → General.' },
    { q: 'Which download do I need?', a: 'The universal disk image runs on Apple Silicon and Intel. Open the DMG, drag RustChamber to Applications and install the OpenCode CLI.' },
    { q: 'Why is macOS blocking the app?', a: 'Builds are ad-hoc signed. Open System Settings → Privacy & Security and choose Open Anyway, or clear the quarantine flag with xattr -dr com.apple.quarantine /Applications/RustChamber.app.' },
    { q: 'How does RustChamber update?', a: 'RustChamber checks GitHub Releases a few seconds after launch and every hour. When a newer version exists, a blue download arrow appears at the bottom of the sidebar: it opens the release notes and downloads in the background, then offers Restart to update. Homebrew installs update through brew upgrade --cask rustchamber. Builds before 0.2.0-beta need one manual install before the updater takes over.' },
    { q: 'Are Windows and Linux available?', a: 'Not yet. Both compile in CI, but macOS is the tested target and the only published build.' },
    { q: 'Can I use my own OpenCode server?', a: 'Yes. Set the endpoint and password in Settings → General, or write them to the settings file. The password is stored as plain text in that file.' },
    { q: 'Where do I report a bug?', a: 'Open an issue on the repository with the version, your macOS version and the steps to reproduce. Logs and a screenshot help a lot.' },
  ]
</script>

<main class="page-main">
  <section class="page-hero">
    <div class="container">
      <h1 class="page-title">Get RustChamber.</h1>

      <div class="page-group">
        <h2>Desktop</h2>
        <p class="group-lede">A universal macOS build for Apple Silicon and Intel. The OpenCode CLI is required.</p>
        <div class="page-card">
          {#each desktop as row}
            {@const Icon = row.icon}
            <div class="page-row">
              <span class="page-row-main"><Icon size={18} /><b>{row.label}</b><span class="ver">{row.ver}</span></span>
              <span class="page-row-side"><a class="demo-btn" href={DMG}>Download</a></span>
            </div>
          {/each}
        </div>
        <p class="page-note"><a href={GITHUB + '#homebrew'} style="color:var(--accent)">Install with Homebrew →</a></p>
      </div>

      <div class="page-group">
        <h2>Mobile<span class="tag">Soon</span></h2>
        <p class="group-lede">A companion for sessions running on your computer. Not available yet.</p>
        <div class="page-card">
          {#each mobile as row}
            {@const Icon = row.icon}
            <div class="page-row">
              <span class="page-row-main"><Icon size={18} /><b>{row.label}</b><span style="font-size:12px;color:var(--text-tertiary)">{row.note}</span></span>
              <span class="page-row-side"><button class="demo-btn" type="button" disabled>Coming soon</button></span>
            </div>
          {/each}
        </div>
      </div>

      <div class="page-group">
        <h2>Download FAQ</h2>
        <div style="margin-top:18px">
          {#each faqs as item}
            <details class="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          {/each}
        </div>
        <p class="page-note" style="margin-top:36px">Need setup help or troubleshooting? <a href="/support/" style="color:var(--accent)">Go to support →</a></p>
      </div>
    </div>
  </section>
</main>
