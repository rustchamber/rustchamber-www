<script lang="ts">
  import { footerColumns } from './site'
</script>

<footer class="footer">
  <div class="footer-grid">
    {#each footerColumns as col}
      <div>
        <h4>{col.title}</h4>
        <ul>
          {#each col.links as link}
            <li><a href={link.href}>{link.label}</a></li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
  <div class="footer-bottom">
    <div class="footer-bottom-text">
      <span>© 2026 RustChamber.</span>
    </div>
  </div>
</footer>
