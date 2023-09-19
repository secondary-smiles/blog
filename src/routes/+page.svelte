<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<main>
  <div id="title">
    <h1>trinket blog</h1>
    <h2 class="sub">dev writing about anything under the sun</h2>
  </div>

  <div id="articles">
    <ul>
      {#each data.articles as article, i}
        <li class={i % 2 == 0 ? "even" : "odd"}>
          <a href="/articles/{article.slug}">{article.date} ~> {article.title}</a
          >
        </li>
      {/each}
    </ul>
  </div>
</main>

<style>
  #title {
    text-align: center;
  }

  #articles {
    display: flex;
    justify-content: center;
  }

  .even {
  }

  .odd {
    background: #f2f2f2;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin: 0.5em;
    padding: 0 0.2em;
  }

  li:hover {
    background: #dbdbdb;
  }
</style>
