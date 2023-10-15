Yes, you read that right. Routing in Svelte, not routing in *SvelteKit*. Light Blog was originally written in SvelteKit, but I found that trying to develop using SvelteKit while still in beta was a nightmare. Basic features constantly breaking, weird bugs I couldn't fix within the website, constantly changing apis. That's not to say that I don't like SvelteKit, everything it does it does amazingly and it was a joy to code in it. I just couldn't make anything functional in the state it was in. Perhaps that's my bad code, or it could be the framework being in beta.

Once I admitted defeat and decided to rewrite Light Blog I began looking for a new framework to build it in because vanilla JS/TS is a nightmare (in my humble opinion). React makes my head hurt, I didn't know what web components were, and I really like SvelteKit's [SFC system](https://dev.to/vannsl/all-you-need-to-know-to-start-writing-svelte-single-file-components-cbd). I didn't want to learn a new framework (Vuejs), and Qwik wasn't going to come out for another month.

I was in a corner (admittedly, one I put myself in), I had a site to make, but no framework I was excited to use. But then I had an idea, it occurred to me that most URLs are a path name like you would use in a terminal.

```bash
# Go to about page
cd pages/about
cat index.html
```

```html
<!-- Link To About Page -->
<a href="pages/about/index.html">Link to about page<a>
```

In my head, these two were very strongly linked (pun intended). That's why a lot of frameworks have [file-based-routers](https://kit.svelte.dev/docs/routing), the files of code you write directly define the webpages accessible on your website. Something I like about [OOP](https://en.wikipedia.org/wiki/Object-oriented_programming) is that it states that everything can be put into a box. Sometimes things *shouldn't* be forced into boxes, but a lot of the times it fits nicely. I wanted to see if a URL could fit into a 'box'. Turns out it does and has for a long time, no need to reinvent the wheel here, it's called `window.location`.
I began to wonder, if I already have the 'box' of the URL, what can I do with it?

Well, I thought, maybe instead of file-based-routes, I could try and put the pages in a box as well. I came up with a structure that looked like this:

```json
{
  "routes": [
    {
      "title": "Home",
      "desc": "Dev blog about everything under the sun",
      "slug": "/",
      "path": "index",
      "sidebar": true,
      "level": 0
    },
    {
      "title": "Articles",
      "desc": "Find articles to read about many topics",
      "slug": "/articles",
      "path": "articles",
      "sidebar": false,
      "level": 1,
      "subroutes": [
        {
          "title": "Not Found Error",
          "desc": "An article at this URL doesn't exist yet",
          "slug": "/articles/notFound",
          "path": "articles/notFound",
          "sidebar": false,
          "level": 2
        },
        {
          "title": "*",
          "desc": "[DYNAMIC]",
          "slug": "/articles/*",
          "path": "articles/slug",
          "sidebar": true,
          "level": 2
        }
      ]
    },
    {
      "title": "About",
      "desc": "How this website works and how to use it",
      "slug": "/about",
      "path": "about",
      "sidebar": "true",
      "level": 1
    }
  ]
}
```

So now I had an object for the URL and an object for the pages, I wondered if that wasn't enough to handle routing without file-based-routing.

Well, I figured, if an [SPA](https://en.wikipedia.org/wiki/Single-page_application) made in Svelte were to try and combine Sveltes enjoyability with these boxes it would work perfectly fine.

It didn't.

It took a whole lot of code and a whole lot of frustration, but eventually I did it, I managed to create a system to compare the URL to the pages json and return a 'state' that the rest of the website reacted to. Here's the code for it:

```ts
function parseSlug(slug = window.location.pathname) {
  let returnUrlState = deepCopy(urlState);
  let backupUrlState;
  const slugLayers = slug.split("/").filter((el) => {
    return el !== "";
  });
  if (slugLayers.length === 0) slugLayers.push("");
  let fullPath = "";
  slugLayers.forEach((layer, index) => {
    let urlStateSetThisLayer = false;
    fullPath += `/${layer}`;
    routes.forEach((route) => {
      if (route.slug === fullPath && !urlStateSetThisLayer) {
        returnUrlState = deepCopy(route);
        urlStateSetThisLayer = true;
        if (returnUrlState.subroutes && index != slugLayers.length - 1)
          backupUrlState = deepCopy(returnUrlState);
        return;
      }
    });

    if (!returnUrlState.subroutes || urlStateSetThisLayer) return;
    returnUrlState.subroutes.forEach((subroute) => {
      if (subroute.slug === fullPath && !urlStateSetThisLayer) {
        returnUrlState = deepCopy(subroute);
        urlStateSetThisLayer = true;
        if (returnUrlState.subroutes && index != slugLayers.length - 1)
          backupUrlState = deepCopy(returnUrlState);
        return;
      } else if (subroute.slug.endsWith("*") && !urlStateSetThisLayer) {
        returnUrlState = deepCopy(subroute);
        returnUrlState.title = layer;
        urlStateSetThisLayer = true;
        if (returnUrlState.subroutes && index != slugLayers.length - 1)
          backupUrlState = deepCopy(returnUrlState);
        return;
      }
    });
  });

  if (JSON.stringify(returnUrlState) === JSON.stringify(backupUrlState)) {
    returnUrlState = error;
    returnUrlState.desc = "NotFoundError";
    returnUrlState.slug = window.location.pathname;
  }

  returnUrlState.slug = fullPath;
  return returnUrlState;
}
```

> Robert C. Martin would be disappointed in me for this.

Now, if you actually read the entire block of code (I wouldn't have, it's pretty ugly), then you may have noticed this little block:

```ts
//...
if (/*condition*/){
    //...
} else if (subroute.slug.endsWith("*") && !urlStateSetThisLayer) {
        returnUrlState = deepCopy(subroute);
        returnUrlState.title = layer;
        urlStateSetThisLayer = true;
        if (returnUrlState.subroutes && index != slugLayers.length - 1)
          backupUrlState = deepCopy(returnUrlState);
        return;
      }
//...
```

Notably, `subroute.slug.endsWith("*")`. I added that because I liked how SvelteKit has dynamic routing, where a URL can accept any slug and change the page content accordingly. For example `/articles/hello-world` and `/articles/foobarbaz` actually load the same page that has access to the `hello-world` and `foobarbaz` slugs and can change their own content accordingly. I did this because I'm a lazy programmer and I didn't want more than a few pages to implement.

Well this `parseSlug()` function took a long time to make work, and even longer to fix the biggest bugs (I'm confident there's still a good few waiting for when I let my guard down).

I was pretty happy with my work, it functioned, it only broke here and there, and it meant I got to use Svelte [i love svelte](/rand/ilovesvelte).

So TL;DR I was too lazy to learn a new framework and so accidentally made a worse version of existing ones (the classic tale of every web dev).

Some pros and cons I can think of right now:

**Pros:**

- Extremely fast links since no reloads are necessary

- Data persistence across all pages

**Cons:**

- All the pages have to be loaded on first load, this slows down the website.

- This hell:

```js
switch (urlState.path) {
            case "index":
                displayPage = index;
                break;
            case "articles":
                displayPage = articles;
                break;
            case "articles/notFound":
                displayPage = notFound;
                break;
            case "articles/slug":
                displayPage = slug;
                break;
            //..
```

> I have to do this because of how [Svelte components](https://svelte.dev/tutorial/svelte-component) work

Do what you want to make your website work, I'm not making an industry that hinges on 200ms faster page load time.
