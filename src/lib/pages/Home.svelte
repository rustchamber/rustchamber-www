<script lang="ts">
  import { AppWindow, Apple, Download, Terminal } from '@lucide/svelte'
  import { imageSrcset, imageUrl } from '../assets'
  import ThemeImage from '../ThemeImage.svelte'
  import { DOCS } from '../site'

  const heroImage = 'bg-header-art.png'
  const heroWidths = [640, 960, 1280, 1600, 2000]
  const heroQuality = 60

  const platforms = [
    { label: 'macOS', href: '/download/', icon: Apple, note: '' },
    { label: 'Windows', href: '/download/', icon: AppWindow, note: 'Coming soon' },
    { label: 'Linux', href: '/download/', icon: Terminal, note: 'Coming soon' },
  ]
</script>

<main class="page-main">
  <!-- Hero -->
  <section class="home-hero">
    <div class="home-art" aria-hidden="true">
      <img
        src={imageUrl(heroImage, { width: 1600, quality: heroQuality })}
        srcset={imageSrcset(heroImage, heroWidths, { quality: heroQuality })}
        sizes="100vw"
        width={2944}
        height={1648}
        alt=""
        fetchpriority="high"
        decoding="async"
        loading="eager"
      />
    </div>
    <div class="container home-col">
      <h1 class="home-title">An agentic development environment.</h1>
      <p class="home-sub">A native desktop workspace for OpenCode, written in Rust. Chat, files, changes, git and a real terminal in one window.</p>
      <div class="home-cta">
        <a class="button" href="/download/"><Download size={15} />Download</a>
        <a class="button-secondary" href={DOCS}>Read the docs</a>
      </div>
    </div>
    <div class="home-stage">
      <div class="home-window">
        <ThemeImage
          light="screenshots/rustchamber-home.webp"
          dark="screenshots/rustchamber-home-dark.webp"
          alt="RustChamber on macOS with the project sidebar and a new session"
          imgClass="home-shot"
          priority
        />
      </div>
    </div>
  </section>

  <!-- One window -->
  <section class="home-section">
    <div class="container home-col">
      <h2 class="home-h2">One window for the whole session.</h2>
      <p class="home-lede">Chat and the session context live in one window, with files, changes, git and the terminal a click away. The session panel keeps context, usage and the project close at hand, without another app in the way.</p>
      <div class="home-window home-demo">
        <ThemeImage
          light="screenshots/rustchamber-chat.webp"
          dark="screenshots/rustchamber-chat-dark.webp"
          alt="A RustChamber session with the chat, the session context panel and the composer"
          imgClass="home-shot"
        />
      </div>
    </div>
  </section>

  <!-- Review changes -->
  <section class="home-section">
    <div class="container home-col">
      <h2 class="home-h2">Review the change before you take it.</h2>
      <p class="home-lede">The changes panel lists every file the agent touched. The git panel stages, commits, branches and pushes from the same window, so a session ends with a commit and not a pile of notes.</p>
      <div class="home-window home-demo">
        <ThemeImage
          light="screenshots/rustchamber-git.webp"
          dark="screenshots/rustchamber-git-dark.webp"
          alt="The RustChamber git panel showing an unstaged README change, a commit message and the project history"
          imgClass="home-shot"
        />
      </div>
    </div>
  </section>

  <!-- Themes -->
  <section class="home-section">
    <div class="container home-col">
      <h2 class="home-h2">Light, dark, or anything between.</h2>
      <p class="home-lede">The theme engine moves between a light and a dark palette, keeps every text token above a contrast floor and lets you set the accent, font, density and motion. The screenshot follows the theme you are using.</p>
      <div class="home-window home-demo">
        <ThemeImage
          light="screenshots/rustchamber-settings.webp"
          dark="screenshots/rustchamber-settings-dark.webp"
          alt="RustChamber settings on the Appearance page, with the theme controls and the RustChamber theme selected"
          imgClass="home-shot"
        />
      </div>
    </div>
  </section>

  <!-- Platforms -->
  <section class="home-section">
    <div class="container home-col">
      <h2 class="home-h2">Desktop native app.</h2>
      <div class="platform-row">
        {#each platforms as p}
          {@const Icon = p.icon}
          <a class="button-secondary" href={p.href}><Icon size={15} />{p.label}{#if p.note}<span class="platform-note">{p.note}</span>{/if}</a>
        {/each}
      </div>
    </div>
  </section>

  <!-- Closing -->
  <section class="home-section home-closing">
    <div class="container home-col">
      <h2 class="home-h2">Install RustChamber on your Mac.</h2>
      <p class="home-lede">A universal macOS build for Apple Silicon and Intel. Windows and Linux are on the way.</p>
      <div style="margin-top:28px"><a class="button" href="/download/"><Download size={15} />Download</a></div>
      <p class="home-privacy">RustChamber collects nothing about your work. The code is MIT-licensed, so anyone can check.</p>
    </div>
  </section>
</main>
