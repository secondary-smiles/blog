import type { PageLoad } from "./$types"
import type { Article } from "$lib/util/article";

import { getAllArticles } from "$lib/util/firebase";

export const load: PageLoad = async ({ params }) => {
  const articles: Article[] = await getAllArticles();

  return {
    articles: articles,
  }
}
