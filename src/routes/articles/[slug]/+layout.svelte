<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<main>
  <div id="header">
    {#if data.prev}
      <a href="/articles/{data.prev.slug}">&lt;&lt;</a>
    {/if}

    <a href="/">home</a>

    {#if data.next}
      <a href="/articles/{data.next.slug}">&gt;&gt;</a>
    {/if}
  </div>
  <hr />
  <slot />
  <hr />
  <div id="footer">
    {#if data.prev}
      <a href="/articles/{data.prev.slug}">&lt;&lt;</a>
    {/if}

    <a href="/">home</a>

    {#if data.next}
      <a href="/articles/{data.next.slug}">&gt;&gt;</a>
    {/if}
  </div>
</main>

<style>
  main {
    padding-left: 3em;
  }
</style>
