import type { PageLoad } from "./$types"
import type { Article } from "$lib/util/article";

import { error } from "@sveltejs/kit";
import { getAllArticles } from "$lib/util/firebase";

export const load: PageLoad = async ({ params }) => {
  const articles: Article[] = await getAllArticles();

  let article: Article | null = null;
  for (let i = 0; i < articles.length; i++) {
    if (articles[i].slug == params.slug) {
      article = articles[i];
    }
  }

  if (!article) {
    throw error(404, "article not found.");
  }

  let index = 0;
  for (let i = 0; i < articles.length; i++) {
    if (articles[i].slug == article.slug) {
      index = i;
    }
  }

  let next = articles[index + 1];
  let prev = articles[index - 1];


  return {
    articles: articles as Article[],
    article: article as Article,
    slug: params.slug,

    next: next,
    prev: prev,
  }
}
