import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, getDocs, where } from "firebase/firestore/lite";

import type { Article } from "$lib/util/article";

const firebaseConfig = {
  apiKey: "AIzaSyATAGDs9oPN5EWK82c3J__raiRWGLjHlvY",
  authDomain: "light-bl.firebaseapp.com",
  projectId: "light-bl",
  storageBucket: "light-bl.appspot.com",
  messagingSenderId: "954661173771",
  appId: "1:954661173771:web:f3da7b4a8a77236db0650e",
  measurementId: "G-9YVXH0HC8Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getAllArticles(): Promise<Article[]> {
  const articlesRef = collection(db, "articles");
  const q = query(articlesRef, orderBy("date", "desc"));

  const snapshot = await getDocs(q);

  const results: Article[] = [];
  snapshot.forEach(doc => {
    results.push(doc.data() as Article);
  });

  return results;
}

async function getArticleBySlug(slug: string): Promise<Article> {
  const articlesRef = collection(db, "articles");
  const q = query(articlesRef, where("slug", "==", slug));

  const snapshot = await getDocs(q);

  const results: Article[] = [];
  snapshot.forEach(doc => {
    results.push(doc.data() as Article);
  });

  if (results.length != 1) {
    throw new Error(`article ${slug} not found.`);
  }

  return results[0];
}

export { getAllArticles, getArticleBySlug };
