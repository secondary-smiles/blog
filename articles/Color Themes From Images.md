I really like colors. Often, I'll catch myself scrolling through [Adobe Color](https://color.adobe.com/explore), or clicking through [Poolors](https://poolors.com) just searching for the perfect color palette. And so when it came time to design the color themes for LightBlog I was pretty excited. I wanted to make a couple themes that were minimal, effective, and had a wide enough range to please most visitors who came to my site whether they needed high contrast themes, dark, super dark, light, etc. I packed all this into 4 base themes for the website. I called them Light, BlindWhite, Dark, and Amoled. These four themes would, I hoped, provide a wide enough range of colors and contrasts to make most people happy when using the website.
However, something still bugged me, I kept finding myself wanting to make more and more themes, but ultimately deciding not to because I didn't want to clog up the theme sidebar with options. I thought about adding pagination to it, but ultimately decided not to because I want the content of LightBlog to be what people spend time on, not clicking the `more` button looking for the perfect theme.
Of course, the perfect solution to this is to let the user make a theme for themselves but that comes with some pros and cons;

**Pros:**
- Themes will (ideally) be exactly what that person wants
- The theme can be a huge aid to accessibility because the colors can be adjusted to anything anyone needs.

**Cons:**
- It takes a while to select each and every color and make sure it's perfect one by one.
- It's a lot more effort than what I want to force people to go through just to have some nicer colors.

I toyed around with some color picker-type pages to let people design the themes they wanted but I just never liked how it looked.
Here's the scrappy tool I made to add my themes to the database:
![my scrappy theme-making editor](https://i.imgur.com/R45DKoM.png)
> Not very pretty eh?

I would never dream of forcing anyone who visits my site ever to try and make anything with that effective though it may be.
Eventually I came to the conclusion that 5 clicks to make a theme is 3 clicks too many. *But how in the world do you select 10 colors with two clicks?*
I remembered then, that some sites can extract color palettes from images. I've only ever seen this used as a gimmick, but I wondered if maybe, it could serve a practical use on my website..
This process is called [color quantization](https://wikipedia.org/wiki/Color_quantization) and can be achieved using a variety of common algorithms. As a developer, there will never be a day where I don't learn something new I suppose.
I chose to use an algorithm called [median-cut](https://wikipedia.org/wiki/Median_cut) since it seemed to be the simplest and most common one used in these situations.
In fact, I was rather blown away by how easy it is to quantize an image with this algorithm. The steps are as follows:
1. Divide you image into its R, G, and B color channels.
2. Find the channel with the largest range from 0-255.
3. Sort all the channels according to the one with the highest range.
4. Cut all three channels in half.
5. Repeat the process until you have the amount of channel pieces as colors you want. Then average all three channel pieces together from each cut and let it resolve into a color.
> That's kind of an awful description but this isn't a tutorial just an article.

I was pretty sure that was the solution to my 2-click problem! Just have them upload an image with colors they like and then do the rest of the work for them.
Well I implemented it pretty easily, here's a bit of code from the project:
```typescript
function splitDataFor(data, count) {
  let total = [];
  for (let i = 0; i < count; i++) {
    if (i == 0) {
      data.forEach((block) => {
        block = preprocessSortQuantizeData(block);
        total = total.concat(splitSortedData(block));
      });
    } else {
      total.forEach((block) => {
        block = preprocessSortQuantizeData(block);
        total = total.concat(splitSortedData(block));
      });
    }
  }

  return total;
}
```
> This code will recursively split the channels into colors as many times as I want

The only problem here was that the colors came out in effectively a random order. I had no way of knowing what colors had more or less contrast which is a huge issue. The most important thing in any theme is that background colors and text colors **must** have sufficient contrast to be read easily.
So solve this issue, I would have to calculate the luminance of each color and sort it in that order. According to stack overflow, you do that like this:
```typescript
  lum() {
    return 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
  }
```
> I hate magic numbers as much as the next dev, but stackoverflow commands so I obey.

If we just sort by luminance, then that should get the job done as far as contrast ratios are concerned.
Now, light mode and dark mode. I'm the kind of person who changes between light mode and dark mode so often I have a keybinding for it. I like to switch whenever the fancy strikes so it was of utmost importance that I could extract a dark palette *and* a light one from every image.
Turns out to do this all you have to do is flip the palette, switching the text to lighter and background to darker and vice-versa. Just `array.reverse()` everything until it works.

And that's just about it; extract colors, sort, display, and optionally reverse if the user wants to.

Some pros and cons of this method of theme-generation:
**Pros:**
- Only two clicks per theme, one to upload an image, the other to set light or dark.
- No need to have any knowledge of color theory, just need to have an image you like.
- All processing is done in the browser so your images will always be only yours.
**Cons:**
- All processing is done in the browser, so if the image is huge and you computer is slow it could take a minute to process.
- It can be a but unpredictable and uploading the same image twice can make two different-but-similar color themes (this is by design, but I'm still putting it in cons).
- If the image does not have enough different colors the theme could be really awful and I can't do much about that.

Overall, I'm really happy with how it turned out, and now I use LightBlog with my very own theme that's only mine on the entire internet.

Feel free to try it out with the [direct link](/rand/makeatheme), or by clicking `create..` at the bottom of the theme selector.