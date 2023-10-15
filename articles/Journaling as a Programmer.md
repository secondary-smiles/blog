## History

Over the course of my life, I've had on-and-off attempts at starting a journaling habit. Some were semi-successful, lasting around a month of daily writing. In the end though, I always broke down and let the habit deteriorate.

Lately, I've tried a different approach to journaling that I'm hopeful about.
Previously, if I were to write an entry I'd take the time to write a long entry that was well formatted. I was writing essays. I'm not sure why I did that, but it gave me the misconception that journaling was a chore, not a therapeutic exercise.

With that revelation, I decided to take a new approach to journaling. Rather than block out times to write long, detailed recounts of my day, maybe I could make small rapid notes that were well organized. That way I'd still be able to read through my past entries cohesively, but writing the entries would be a lot more natural for me.

I also decided to switch from physical paper journaling to files on my laptop. While there is a lovely aspect to paper that makes the experience different, I find that it makes me think harder about what I'm writing. Since it's a lot harder to go back and change pen-and-ink than it is to delete some letters on a laptop, I spend a lot more time stressing about what I write on paper. It's harder for me to get into a word-dump flow state.

## The system

My basic organization scheme is as follows:

```plain
|-- 2023/
|   |-- 08/
|       |-- 2023-08-27.txt
|       |-- 2023-08-28.txt
|       |-- 2023-08-29.txt
|       |-- 2023-08-30.txt
|       |-- 2023-08-31.txt
|   |-- 09/
|       |-- 2023-09-01.txt
```

The path for any given day would be `YEAR/MONTH/DATE.txt`. 

I find that this structure works well for me as everything is nicely grouped up, not too nested, and doesn't have much file-clutter.

### Individual files

Now, the structure of the files is good, but if I'm going to be making small, rapid additions over the course of the day the files should also be organized.

To start out, each file has a small header that looks like this:

```plain
=============
    August 2023       
Su Mo Tu We Th Fr Sa  
       1  2  3  4  5  
 6  7  8  9 10 11 12  
13 14 15 16 17 18 19  
20 21 22 23 24 25 26  
27 XX 29 30 31        
                      
Monday
=============
```

Enclosed in `=============` I put a small calendar for the month (with the current day replaced by `XX`), and the current day of the week.

This small header keeps a nice common structure between the files, and is very aesthetic in my opinion. It ties files together, and looks good in the process.

Now, for each individual entry, I put a small prefix with the time to keep them separate.

It looks like this: 

```plain
* At 10:18
A quick note about a shower thought I just had.
```

When all tied together, it makes a surprisingly cohesive format. Something that I can read through later and understand what past me was thinking.

Here's what a typical journal entry for a full day could look like:

```plain
=============
    August 2023       
Su Mo Tu We Th Fr Sa  
       1  2  3  4  5  
 6  7  8  9 10 11 12  
13 14 15 16 17 18 19  
20 21 22 23 24 25 26  
XX 28 29 30 31        
                      
Sunday
=============

* At 14:31
If cats had opposable thumbs I could probably teach mine to play chess.

* At 15:39
Just getting back, going to get dinner at a resturant.They make eh food but 
good ice cream. I'm subtly trying to cut back on dairy though, so sadly I'll 
probably just get a sorbet or similar.

* At 18:16
I think maybe I'll write a blog article about this system. Or maybe I'll 
rewrite a project in Tcl, Perl, or closure- some language that I'm interested 
in learning.

* At 22:17
About to sign off for the night. 
I'm liking this journaling, it makes my brain wind down in a good way.
Time to unpack, unwind, and get ready to sleep.
```

## Automation

Like the lazy programmer I am, I quickly spotted an opportunity to abstract away the repetitive parts of this system.

I spent an afternoon whipping up `journal.sh`, a small `zsh` script that can handle all the templating for me.

I'll link the full script at the end of this post, but first I want to go over some snippets from it.

```bash
#setup header
if [ ! -f "$file" ]; then
  mkdir -p $(dirname "$file") 2> /dev/null

  printf "%0.s=" {1..13} >> $file
  printf "\n" >> $file
  cal -h "$month" "$year" | sed "0,/$daynum/{s//XX/}" >> $file
  truncate -s -1 $file
  
  printf "\n$day\n" >> $file
  printf "%0.s=" {1..13} >> $file
  printf "\n" >> $file

  change_status="Created" 
fi

if ! grep -xq "$nowtime" "$file"; then
  printf "\n* At $nowtime\n" >> $file
fi

$EDITOR $file
```

This is the section that does all the template heavy-lifting. First, it creates the file if it doesn't exist, then it uses `cal` and `sed` to generate a little calendar header with the current day marked.

Then, it does a check with `grep` to see if `$nowtime` (the current hour:minute) is already on a line in the file. If it isn't it adds it.

Then, it opens the file in your `$EDITOR`

That's really all there is to it.

`journal.sh` has a few tricks, however.
GNU `date` has a `-d` flag that lets you describe a relative time. Something like `date +%m -d "last month"` will print the number for last month. `journal.sh` utilizes this feature as much as possible.

This is how it sets all the needed date values:

```bash
nowtime=$(date "+%H:%M") || exit
day=$(date "+%A" -d "$*") || exit
daynum=$(date "+%e" -d "$*") || exit
month=$(date "+%m" -d "$*") || exit
year=$(date "+%Y" -d "$*") || exit
date=$(date "+%Y-%m-%d" -d "$*") || exit

date_path=$(date "+%Y/%m" -d "$*") || exit
journal_prefix=~/journal
file="$journal_prefix/$date_path/$date.txt"
```

The `-d "$*` will expand to all arguments passed to the script. That means I can do something like `./journal.sh yesterday` to open my entry from a day ago.

### Git integration

In the interest of keeping my entries safe, `journal.sh` will automatically save my work when I close the file.

Here's the code for that:

```bash
printf "Save in git? [Y|n]: "
read yn
case $yn in
  Y|y| )
   git add "$file"
   git commit -S -m "$change_status entry for $date at $nowtime" -m "$(randomart.py --ascii "$file")" 
esac
```

First, I'll get prompted to save the file, and then it will add it and commit the file for me.

I've added a few small features to this commit though. Firstly, using the `-S` flag will have git use PGP to sign all my journal entry commits. This just proves that I am the one who wrote them (or at least the one who added them to this git repository).

Then, git will use [`randomart.py`](https://github.com/ansemjo/randomart) to generate a little piece of ascii art based off of the hash of my journal entry. This doesn't really add anything to the project, but I like it nonetheless. In the end, running `git log` looks something like this:

```plain
commit 81e10dd3c80d2f4e31c0d7049d8ca2ab1b0adc84 (HEAD -> main)
Author: Shav Kinderlehrer <shav@trinket.icu>
Date:   Mon Aug 28 13:52:07 2023 -0400

    Edited entry for 2023-08-28 at 13:50
    
    /--[randomart.py]--\
    |      .*. *... !! |
    |               =~*|
    | .             .=*|
    |. .      ..=.  .  |
    |         .%=%  .  |
    |        *= %E==   |
    |       *===~_.=   |
    |      .%=.%~=!.* .|
    |      .=.%~***.*= |
    \---[BLAKE2b/64]---/

commit 51dde788717b34ca86e45fa32c5c59eb946b739e
Author: Shav Kinderlehrer <shav@trinket.icu>
Date:   Mon Aug 28 10:56:38 2023 -0400

    Edited entry for 2023-08-28 at 10:50
    
    /--[randomart.py]--\
    |     *!..R* *.    |
    |     =%.=%* .= .  |
    |   . .  =. .. =.. |
    |   .*  ==.. .==**.|
    |.  .   %==. **R= .|
    |   . . .=%  .~..  |
    |  ... ..*.  **.   |
    |   =*.*%.         |
    |    *=*=.**...    |
    \---[BLAKE2b/64]---/

```

## That's all folks!

This new method has been working really well for me so far, I'm really hopeful that this is endgame for me, and I can really make the habit stick.

### One last note

As a small personal challenge, I've been trying to keep all my entries to a strict maximum width of 80 characters. I find that this looks better, and is easier to read.

[Here's a link to `journal.sh`](https://git.trinket.icu/scripts.git/tree/journal.sh) 

[If you prefer the raw file for curl](https://git.trinket.icu/scripts.git/plain/journal.sh)
