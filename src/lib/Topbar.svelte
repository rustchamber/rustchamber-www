<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte'
  import { imageUrl } from './assets'
  import GithubMark from './icons/GithubMark.svelte'
  import { BRAND, GITHUB, navLinks } from './site'
  import { theme, toggleTheme } from './theme'

  let { page = 'home' }: { page?: string } = $props()

  let menuOpen = $state(false)

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') menuOpen = false
  }
  const close = () => { menuOpen = false }
</script>

<svelte:window onkeydown={onKeydown} />

<div role="banner" class="topbar-wrap">
  <div class="topbar-inner" class:menu-open={menuOpen}>
    <div class="nav-cluster">
      <a class="brand" href="/" onclick={close} aria-label={BRAND}>
        <img
          class="brand-logo"
          src={imageUrl('logo.png', { width: 60, quality: 80 })}
          srcset={`${imageUrl('logo.png', { width: 30, quality: 80 })} 1x, ${imageUrl('logo.png', { width: 60, quality: 80 })} 2x`}
          sizes="30px"
          alt=""
          width="30"
          height="30"
        />
      </a>
      <nav class="nav" id="main-nav" class:open={menuOpen} aria-label="Main navigation">
        <div class="nav-center">
          {#each navLinks as link}
            <a href={link.href} class:active={page === link.href.replace(/\//g, '')} onclick={close}>{link.label}<span class="nav-dot" aria-hidden="true"></span></a>
          {/each}
        </div>
      </nav>
    </div>

    <div class="nav-side">
      <a class="nav-stars" href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="RustChamber on GitHub">
        <GithubMark size={16} />
      </a>
      <button
        type="button"
        class="theme-toggle"
        aria-label={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={$theme === 'dark'}
        onclick={toggleTheme}
      >
        {#if $theme === 'dark'}<Sun size={16} />{:else}<Moon size={16} />{/if}
      </button>
      <a class="nav-cta" href="/download/" onclick={close}>Download</a>
    </div>

    <button
      class="nav-toggle"
      id="nav-toggle"
      aria-label="Toggle menu"
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <span class="nav-toggle-box" aria-hidden="true">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
      </span>
    </button>
  </div>
</div>
