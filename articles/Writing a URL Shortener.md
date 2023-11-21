# Writing a URL Shortener
> URL Shorteners are useful utilities in the modern web.

The concept of a URL shortener is a rather silly one in definition. We take a place on the internet, and then we obfuscate it; hide it behind another layer and present that to people.

In practice however, it makes a good amount of sense.

Say I have this really long URL, [https://blog.trinket.icu/articles/writing-a-url-shortener](https://blog.trinket.icu/articles/writing-a-url-shortener). I want to share it with my friend- only there's no way they'd remember that entire link if I told it to them in person.

I present, [https://trkt.in/2614aab104d](https://trkt.in/2614aab104d).
> Ok, granted `2614aab104d` is arguably harder to remember than the former link, but it's the thought that counts.

Now, you may be wondering *'why would you make a URL shortener when there's already tons of existing free ones'*

If you're a programmer/maker then the answer should be obvious:
*'Why would I use an existing closed-source product when I can make my own worse version of it?'*

Now, obviously that isn't true for every product and every person, but with something as simple as a URL shortener I couldn't resist the challenge.

## How a URL shortener works

A URL shortener is simply a website that takes in an arbitrary ID and redirects the client to the original website. 

### The ID

In most URL shorteners, any path after the TLD is considered to be the ID.

Consider this link:
```
https://trkt.in/2614aab104d
        { TLD  }[    ID   ]
```

In this case, `2614aab104d` is the ID. It can be anything that is valid in a URL. So most restrict the ID to alphanumeric and hyphen or underscore characters.

For [trkt.in](https://trkt.in), the ID can either be custom or auto generated. Every ID must be unique.

My current method for auto generation is to hash the URL using the md5 algorithm and take the first eleven characters. That means that every auto generated trkt link will be exactly eighteen characters long (not including the protocol `https://` characters).

I arrived at eleven character long IDs using this python script:

```py
import sys
import hashlib


ID_LEN = 11
ITERS = 5000000

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

passed = 0
failed = 0

hashes = set()
for i in range(0, ITERS):
    i = str(i)
    hash = hashlib.md5(i.encode())
    hash = hash.hexdigest()[:ID_LEN]
    if hash in hashes:
        print("\x1b[31m", end="")
        eprint(f"{i} - {hash}")
        failed += 1
    else:
        print("\x1b[32m", end="")
        print(f"{i} - {hash}")
        passed += 1

    print("\x1b[0m", end="")
    eprint("\x1b[0m", end="")

    hashes.add(hash)


eprint(f"PASS: {str(passed).zfill(7)}")
eprint(f"FAIL: {str(failed).zfill(7)}")
eprint(f"TOTAL: {ITERS}")
eprint(f"PERCENT: {(passed / lines) * ITERS}% passed {(failed / ITERS) * 100}% failed")
```

Running this will calculate the collision rate when slicing the first ten characters of the hash. Eleven is the shortest slice I could take that had a 0% collision rate among both 5M iterations and the top 1M websites dataset.

However, five million is a lot more links than this site will ever see, so switching to a smaller hash function that can produce an ID in the range of 3-7 characters would probably be much better in the long run.

Alternatively, I could do as most other URL shorteners do and simply aggressively iterate over every permutation of as few characters as possible. 
> `aaa`, `aab`, `aac`..

Both are valid approaches, but I have chosen to opt for the hash approach as it will catch duplicate entries easier and keep one site from having too many entries in the database.

### The Database

The database is a very simple Postgres table.

```
postgres=# \d urls
                        Table "public.urls"
 Column |          Type           | Collation | Nullable | Default 
--------+-------------------------+-----------+----------+---------
 id     | text                    |           | not null | 
 url    | character varying(2048) |           | not null | 
Indexes:
    "urls_id_key" UNIQUE CONSTRAINT, btree (id)
```

When a client tries to fetch our example link `https://trkt.in/2614aab104d`, the server checks to see if the database has a row with the ID `2614aab104d`, if it does, it issues a 301 redirect and that's the end of that. If it doesn't, it returns a simple 404.

### In Use

Here's what happens when I cURL a valid trkt.in link:

```bash
$ curl -v https://trkt.in/2614aab104d
> GET /2614aab104d HTTP/1.1
> Host: trkt.in
> User-Agent: curl/8.1.2
> Accept: */*
> 
< HTTP/1.1 301 Moved Permanently
< Server: nginx/1.18.0 (Ubuntu)
< Date: Sun, 15 Oct 2023 20:57:37 GMT
< Content-Type: text/html
< Content-Length: 250
< Connection: keep-alive
< Location: https://blog.trinket.icu/articles/writing-a-url-shortener
< Cache-Control: max-age=120
< X-Message: Okay I Like It, Picasso
< 

  <!DOCTYPE html>
  <html>
  <head><title>trkt</title></head>
  <body>
    <p>redirecting to <a href="https://blog.trinket.icu/articles/writing-a-url-shortener">https://blog.trinket.icu/articles/writing-a-url-shortener</a></p>
  </body>
  </html>
```

It's really that simple.

Currently, trkt.in is a private URL shortener, I don't have the money to host a free service like that, and I'm not willing to monetize it.

However, the sourcecode is available at [trkt.in/source](https://trkt.in/source). Feel free to selfhost your own instance.

The server is build as an Nginx proxy to a BunJS server.
