<script lang="ts">
  import { BookOpen, Terminal } from '@lucide/svelte'
  import { DOCS, GITHUB } from '../site'

  const faqs = [
    ['What do I need before installing?', 'An OpenCode CLI on your PATH. RustChamber starts a managed opencode serve process for you, or you can point it at an existing server in Settings → General.'],
    ['Why is macOS blocking the app?', 'Builds are ad-hoc signed. Open System Settings → Privacy & Security and choose Open Anyway, or clear the quarantine flag with xattr -dr com.apple.quarantine /Applications/RustChamber.app.'],
    ['Can I use my own OpenCode server?', 'Yes. Set the endpoint and password in Settings → General, or write them to the settings file. The password is stored as plain text in that file.'],
    ['Which platforms are supported?', 'macOS is the tested target and the only published build. Linux and Windows compile in CI and are expected to work, but have not received the same hands-on testing.'],
    ['How do I report a bug?', 'Open an issue on the repository with the version, your platform and the steps to reproduce. Logs and a screenshot help a lot.'],
  ]
</script>

<main class="page-main">
  <section class="page-hero">
    <div class="container">
      <h1 class="page-title">Support.</h1>
      <p class="page-lede">Answers to common questions, and the places to go when you need a hand.</p>

      <div class="page-group">
        <h2>Get help</h2>
        <div class="page-card" style="margin-top:18px">
          <div class="page-row"><span class="page-row-main"><BookOpen size={18} /><b>Documentation</b><span style="font-size:12px;color:var(--text-tertiary)">Install, connect and configure</span></span><span class="page-row-side"><a class="demo-btn" href={DOCS}>Read the docs</a></span></div>
          <div class="page-row"><span class="page-row-main"><Terminal size={18} /><b>GitHub issues</b><span style="font-size:12px;color:var(--text-tertiary)">Bugs and feature requests</span></span><span class="page-row-side"><a class="demo-btn" href={GITHUB + '/issues'} target="_blank" rel="noopener noreferrer">Open an issue</a></span></div>
        </div>
      </div>

      <div class="page-group">
        <h2>Frequently asked</h2>
        <div style="margin-top:18px">
          {#each faqs as [q, a]}
            <details class="faq-item"><summary>{q}</summary><p>{a}</p></details>
          {/each}
        </div>
      </div>
    </div>
  </section>
</main>
