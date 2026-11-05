<script lang="ts">
  import { ShieldCheck } from '@lucide/svelte'
  import { GITHUB } from '../site'
</script>

<main class="page-main">
  <section class="page-hero">
    <div class="container">
      <h1 class="page-title">Privacy.</h1>
      <p class="page-lede">RustChamber collects nothing about your work. The code is MIT-licensed, so anyone can check.</p>

      <div class="prose">
        <div class="callout"><ShieldCheck size={16} style="display:inline-block;vertical-align:-3px;margin-right:6px" /> No telemetry, no analytics in the app, and no account required.</div>

        <h2>What stays on your machine</h2>
        <p>Your sessions, files, diffs, terminal history and settings live on the computer where the app runs. RustChamber talks to an OpenCode server over HTTP and Server-Sent Events — by default a managed process on a free loopback port with a random password, which is stopped when the app exits.</p>

        <h2>What leaves your machine</h2>
        <p>Only the requests you make to your model providers and any service you connect yourself, such as GitHub, Linear or an MCP server. Those requests go through the OpenCode server you configured and follow that provider's own privacy terms. Nothing is sent to us.</p>

        <h2>Settings and credentials</h2>
        <p>The endpoint password is stored as plain text in your settings file so the app can reconnect. Keep that file private. You can point the app at an existing server instead of the managed one at any time.</p>

        <h2>Native app</h2>
        <p>The interface is drawn by the Rust app itself, with no webview and no JavaScript runtime. It talks only to the OpenCode server you configure.</p>

        <h2>Source code</h2>
        <p>The entire client is open source under the MIT license. Read it, build it yourself, or audit what it does before you run it: <a href={GITHUB} target="_blank" rel="noopener noreferrer">github.com/rustchamber/rustchamber</a>.</p>

        <h2>Contact</h2>
        <p>Questions about this page? Open an issue at <a href={GITHUB + '/issues'} target="_blank" rel="noopener noreferrer">github.com/rustchamber/rustchamber</a>.</p>
      </div>
    </div>
  </section>
</main>
