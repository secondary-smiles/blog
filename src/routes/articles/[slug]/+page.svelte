<script lang="ts">
  import type { PageData } from "./$types";

  import { Marked } from "marked";
  import { markedHighlight } from "marked-highlight";
  import hljs from "highlight.js";

  import 'highlight.js/styles/base16/one-light.css';

  const marked = new Marked(
    markedHighlight({
      async: false,
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    })
  );

  export let data: PageData;

  let index = 0;
  for (let i = 0; i < data.articles.length; i++) {
    if (data.articles[i].slug == data.article.slug) {
      index = i;
    }
  }

  let render: string | Promise<string>;
  $: render = marked.parse(data.article.data);
</script>

<main>
  <p class="sub">{data.article.date}</p>
  <h1>{data.article.title}</h1>
  <p class="sub">{data.article.meta}</p>
  <hr />
  {@html render}
</main>

<style>
  main {
    max-width: 60em;
  }
</style>
