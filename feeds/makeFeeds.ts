import { initializeApp } from 'firebase/app';
import { getFirestore, collection, orderBy, getDocs, query } from "firebase/firestore";

const MarkdownIt = require("markdown-it");
const jsonfeedToRSS = require('jsonfeed-to-rss')

const firebaseConfig = {
  apiKey: "AIzaSyATAGDs9oPN5EWK82c3J__raiRWGLjHlvY",
  authDomain: "light-bl.firebaseapp.com",
  projectId: "light-bl",
  storageBucket: "light-bl.appspot.com",
  messagingSenderId: "954661173771",
  appId: "1:954661173771:web:f3da7b4a8a77236db0650e",
  measurementId: "G-9YVXH0HC8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

interface FeedHub {
  type: string;
  url: string;
}

interface FeedAuthor {
  name?: string;
  url?: string;
  avatar?: string;
}

interface FeedItem {
  id: string;
  url?: string;
  external_url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
  image?: string;
  banner_image?: string;
  date_published?: string;
  date_modified?: string;
  // for compatibility
  author?: FeedAuthor;
  authors?: FeedAuthor[];
  tags?: string[];
  language?: string;
}

interface JSONFeed {
  version: string;
  title: string;
  description?: string;
  home_page_url?: string;
  feed_url?: string;
  icon?: string;
  favicon?: string;
  language?: string;
  expired?: boolean;
  hubs?: FeedHub[];
  // for compatibility
  author?: FeedAuthor;
  authors?: FeedAuthor[];
  items: FeedItem[];
}

//@ts-ignore
const db = getFirestore(app)
const md = new MarkdownIt();

async function LoadJson() {
  const feed: JSONFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Light Blog",
    description: "Light Blog - My tech ramblings about everything under the sun.",
    home_page_url: "https://blog.trinket.icu",
    feed_url: "https://blog.trinket.icu/rss.xml",
    icon: "https://blog.trinket.icu/favicon.ico",
    favicon: "https://blog.trinket.icu/favicon.ico",
    language: "en-US",
    expired: false,
    author: {
      name: "Shav Kinderlehrer",
      url: "https://trinket.icu",
      avatar: "https://s.gravatar.com/avatar/89661bc8d24ab0c673ad506ca6b855f2?s=250",
    },
    authors: [
      {
        name: "Shav Kinderlehrer",
        url: "https://trinket.icu",
        avatar: "https://s.gravatar.com/avatar/89661bc8d24ab0c673ad506ca6b855f2?s=250",
      },
    ],
    items: [
    ]
  }

  const articlesRef = collection(db, "articles");
  const q = query(articlesRef, orderBy("date", "desc"));
  const snapshot = await getDocs(q)

  snapshot.forEach(doc => {
    const data = doc.data();
    const feedItem: FeedItem = {
      id: data.slug,
      url: `https://lightblog.dev/articles/${data.slug}`,
      title: data.title,
      content_html: md.render(data.data),
      summary: data.meta,
      date_published: `${data.date}T14:00:00-05:00`,
    };

    feed.items.push(feedItem);
  });

  return feed;
}

export async function RSSfeed() {
  const jsonFeed = await LoadJson();
  // ugly hack but it works. basically fubar
  jsonFeed.version = "https://jsonfeed.org/version/1";

  const rssString = jsonfeedToRSS(jsonFeed);

  console.log(rssString)
}

await RSSfeed().then(() => {
  process.exit()
})
