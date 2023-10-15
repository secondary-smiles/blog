# All the Manpages

I think manpages are neat. I use them a lot to find my way around new programs and especially when programming in C.

Another thing I like are books. I like big hefty textbooks I can flip through. I have a lot of obscure [no starch press](https://nostarch.com/) books. For me, having a physical book to read through helps me learn new things a lot better than watching a video, or reading something off a screen does.

Well, why not bring the two together?

My (admittedly half-assed) attempts to find a physical bound printout of manpages yielded only [this amazon listing for an eye-watering $395](https://www.amazon.com/Linux-Man-Essential-Pages/dp/188817272X).

*Screw it* I thought, *I'll do it myself*

I present to you `mantobook.sh`, my bad solution to this.

## Mantobook

Mantobook works by going through every manpage on your computer section, by section and converting each individual page into an `html` file. Mantobook tries to use [`pandoc`](https://pandoc.org/), but if that fails it'll just resort to good ol' `groff` +  a little `sed` to clean things up.

After that, it combines every single manpage html file into one big html file for each section (this uses a lot of ram).

At that point I'll have 9 folders filled with individual files like `man/1/ls.html`, `man/1/kak.html`, or `man/4/null.html` and another folder with really big files like `man/1.html`, `man/2.html`, etc. Those are one big `html` file with every manpage in that section. Mantobook also separates intro pages if those exist and put them at the front of the generated section page.

Finally, the last optional part is to combine all 9 section files into one big mega-man-book.html. I did that and converted *that* to pdf using `pandoc` again.

I did my best to have the script do as much as possible in parallel since thousands and thousands of files are getting moved around and written to.

Running the full program takes about 40 minutes and crashes every other program on my computer. Completely worth it in my opinion.

Well, now I've got this big ol' pdf, who do I throw money at to print and bind it for me?

## From digital to physical

It turns out- no one.

Not only is the pdf in excess of 160,000 pages, most book publishers refuse to print single copies of anything over ~840 pages. I don't know what 160,000 / 840 is, but that's a lot of volumes.

Ok, so we just print it all out and then bind it no?

Except, I don't have 160k pages of paper, and I don't think it's fair to waste all that on a hobby project.

## Conclusion

Maybe someday I'll write a program to randomly select 840 pages worth of manpages and make a book out of just those. Then I'll get it printed/bound and be able to brag about how I have a book.
In the meantime, you can checkout the script I wrote [here](https://github.com/secondary-smiles/mantobook). If github lets me, I'll also push all my manpages as html files so you can see those too.

This was a fun little side-questy adventure!
