**TL;DR** I made a thing. [Here's the direct link](https://curio.lightblog.dev), and [here's the github repo for it](https://github.com/secondary-smiles/curio).
## The Problem

For a while now, I've had a habit of scrolling through two websites fairly often. One was the [Urban Dictionary](https://www.urbandictionary.com), and the other [ThisWebsiteWillSelfDestruct](https://www.thiswebsitewillselfdestruct.com). I found that browsing both was a more enjoyable experience than any conventional social media I'd tried. Simply relaxing, and reading endless amounts of wordplay on the Urban Dictionary, or messages thrown into the void with ThisWebsiteWillSelfDestruct was endlessly entertaining.
However, I was unsatisfied. I preferred reading the genuine messages on ThisWebsiteWillSelfDestruct, but the word, type, definition format of the Urban Dictionary had my heart.

## The Solution

I couldn't find an alternative that I liked (although one probably exists somewhere in the void), so I made [The Curio](https://curio.lightblog.dev)([curio.lightblog.dev](https://curio.lightblog.dev)). I tried to copy the minimal feel of this website, so visiting it should feel familiar to this one. 

## The Process

I don't do much web development, lightblog.dev had been by far my largest endeavor yet when I decided to start working on The Curio. In the end, I chose to use [Firebase](https://firebase.google.com/) as a backend-as-a-service since it covers databases, authentication, and cloud functions pretty simply. For me this was invaluable, as I don't have the confidence that as a one-man team I'd be able to build a secure backend. I chose [Sveltekit](https://kit.svelte.dev/) as a front-end for two reasons; Firstly, I already know how to use Svelte (this website is made exclusively in svelte), and secondly, Sveltekit had just recently hit v1.0.0 and I was excited to try it out. I chose [Vercel](https://vercel.com) to host mainly because it's <u>cheap</u> and supports Sveltekit SSR. I'm currently working on plugging in a full-text backend for the site because Firebase's builtin document searching functionality is pretty awful. I always think it's funny that a service provided by Google, the words most popular *search engine* by far has one of the worst builtin searching mechanisms ever. I'm strongly considering [Meilisearch](https://www.meilisearch.com) since it's got a generous free tier. However, if a better alternative comes to my attention I'll use that instead. I'm not strongly attached to anything other than low costs on this front.

## Interesting Features and Notes

The Curio is not a creation of mine that I expect to grow very much. I call it a social media site, but in truth it's not. There is no first-level interaction, the most a 'post' can do is link to another one in context. However, I am proud of it and hope to grow at least a small community. 
One thing I've implemented that I like is a color system that goes throughout the website. A short  Class that fiddles with the bits of the UID of someone logged in, and generates a (hopefully) unique color for them. 

```typescript
// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
class ColorHash {
  colors: number[];

  constructor(data: string = "") {
    this.colors = [];

    this.hash(data);
  }

  hash(data: string) {
    this.colors = [];

    // Reduce uniformity by prepending arbitrary character
    data = "x" + data;

    let hash = 0;

    for (let i = 0; i < data.length; i++) {
      hash = data.charCodeAt(i) + ((hash << 5) - hash);
    }


    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      this.colors.push(value);
    }
  }

  rgb(data: string) {
    this.hash(data);

    return this.colors;
  }

  hex(data: string) {
    this.hash(data);

    function toHex(c: number) {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + toHex(this.colors[0]) + toHex(this.colors[1]) + toHex(this.colors[2]);
  }
}
```

This serves as two things; One, as a cop-out for me so I don't have to implement user profiles, and two, it feeds my insatiable desire for every website to take full advantage of the technology browsers offer. I love colors, and when a website or application allows me to select colors, or changes appearance based on the visitor it always feels so cool. The Curio has a very minimal palette, all gray/blue and one accent color. The `ColorHash` class can generate a new accent color for the user which is shown site-wide. One of the benefits of a minimal design is that it's typically   much easier to implement something visually across the entire website. 
Running "The Curio" through the `hex()` function returns <span style="color: #3f31b3;">this</span> color, for example. Provided that the contrast ratio between the generated color, and the background color of The Curio is enough, it will become the new accent color every time you sign in. The hex code will also be used as your username when posting new words.
For example:

![default Curio color-scheme](https://i.imgur.com/9FsxWYr.png)
> The default Curio color-scheme for anyone signed out or if their user-color is too dim

![a customized Curio color-scheme](https://i.imgur.com/7DmxTVq.png)
> A super cool custom accent color!

## The structure of a word
In The Curio, every word has a uniform structure. That being Word, Type, User, Time, Definition, and Controls from top to bottom.
- **Word** - The word that the individual post is about. It's the big, bold one at the top.
- **Type** - Reminiscent of a dictionary, whether the word is a noun, adjective, verb, etc. The type is small, right under the word, and colored the same as the accent color.
- **User** - A small rectangle colored the same as the user who created that word's unique color followed by the hex code for that same color.
- **Time** - The date and time the word was added to the database. Located immediately after the **User**.
- **Definition** - The definition of the word.
- **Controls** - If you are the OP of the word, you'll have a small context menu under the definition. Currently, I've only implemented a `delete` action, but I'll probably get around to an `edit`, `flag`, and `<3` button.

## Thanks for reading
The Curio is a little project for me, so I don't expect it to go anywhere. However, I think if I build it in such a manner that it is capable of scaling it can't hurt. Just in case, right?