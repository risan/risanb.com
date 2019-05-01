---
title: New Blog and Things I learned Building It
date: 2017-10-09 17:06:00
tags: [css, nginx, jekyll]
description: I finally have my programming blog again. I'll walk you through the tech stack I use and things I learned building this blog.
---
Hello, world!

After more than four years, I finally have my programming blog again 🎉🎉🎉. It's been bugging for quite some time.

Having a blog will be a good exercise to improve my writing skill. It's also a great way for documenting my learning journey and share back the knowledge to the vast programming community.

![New Blog and Things I learned Building It](./featured.jpg)

## Table of Contents

## The Tech Stacks

I use [Jekyll](https://jekyllrb.com) to generate this static blog. I've designed it to be minimal and uncluttered. Making an emphasize on the content. I also try keeping the CSS and the JS file sizes as lean as possible. There's even no third party library, except for the slim down version of [Normalize.css](https://necolas.github.io/normalize.css) from [Bootstrap](https://github.com/twbs/bootstrap/blob/v4-dev/scss/_reboot.scss) framework.

I host this blog on a cheap $10 VPS provided by [DigitalOcean](https://m.do.co/c/4504f3411d63) (referal link), serve them over Nginx (check my Nginx configuration [here](https://github.com/risan/nginx-config)). For SSL certificate, I get it for free from [Let's Encrypt](https://letsencrypt.org). I've also enabled the HTTP/2 protocol on Nginx to improve performance.

Although there's a Sprockets based [Jekyll plugin](https://jekyll.github.io/jekyll-assets) for managing the assets, I prefer to use [Gulp](https://gulpjs.com) for building them. It's much more flexible and configurable. More importantly, I'm much more comfortable working with Javascript. I use the [`image-min`](https://github.com/imagemin/imagemin) package for automatically resizing and compressing the images.

## New Things I Learned

There are also several new things I've learned when building up this new blog:

### Collapsible Sidebar with Pure CSS

I want to have a collapsible sidebar for displaying a list of main navigation links on this blog. I know that I can easily achieve this with our old friend jQuery. However, I want my website to have as less JavaScript as it can. I also want this drawer style menu to be fully functioning even without a JavaScript.

Then I came across to [Lanyon](https://github.com/poole/lanyon) theme. It has a collapsible sidebar and surprisingly without any JavaScript file! It turns out it just using a checkbox and the CSS sibling selector. It's a clever trick. I believe I’ve come across this CSS trick years ago somewhere, but never actually implement it on my own.

Suppose you have the following HTML structure for your collapsible sidebar:

```html
<nav class="navbar">
  <input type="checkbox" class="navbar-checkbox">
  <ul class="navbar-nav">
    <li><a href="#">Menu 1</a></li>
    <li><a href="#">Menu 2</a></li>
    <li><a href="#">Menu 3</a></li>
  </ul>
</nav>
```

You can target the `.navbar-checkbox` selected state with the `:checked` pseudo-class selector like this:

```scss
.navbar-checkbox:checked {
    //
}
```

You can combine this selector with `~` (the [general sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_selectors)) for targeting the followed `ul` element:

```scss
.navbar-checkbox:checked ~ .navbar-nav {
    //
}
```

With this trick, you can easily manipulate the followed `ul` visibility based on the checkbox state.

```css
.navbar-nav {
  display: none;
}

.navbar-checkbox:checked ~ .navbar-nav {
  display: block;
}
```

Well, actually for this example you can just use the `+` combinator ([adjacent sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_selectors)). The only difference is that the `+` will only be targeting the immediate sibling.

### Nginx Header Is Overridden on a More Specific Block

I spotted this Nginx behavior when re-visiting my configuration boilerplate [here](https://github.com/risan/nginx-config). When you set a header using the `add_header` directive, it will replace any previously set header on a less specific location block.

Suppose you set the `Access-Control-Allow-Origin` header for all the files under the root location:

```nginx
server {
    location / {
        add_header Access-Control-Allow-Origin "*";
    }
}
```

If you request for an index file or any other files under the root path, you'll surely find this header on the response.

```bash
# Get the response's headers of test.json
curl -I https://example.com/test.json

# The output
content-type: application/json; charset=utf-8
access-control-allow-origin: *
```

But if you later set another header on a more specific location block, the headers inherited from a less specific scope will be overridden. For example, let's say you set a `Cache-Control` header for all of the JSON files:

```nginx
server {
    location / {
        add_header Access-Control-Allow-Origin "*";
    }

    location ~* \.json {
        add_header Cache-Control "public, max-age=600";
    }
}
```

Any headers that previously set from the `/` location will be replaced by the `Cache-Control` header.

```bash
curl -I https://example.com/test.json

# The access-control-allow-origin header is replaced
content-type: application/json; charset=utf-8
cache-control: public, max-age=600
```

But if you request for any other non-JSON files, the `Access-Control-Allow-Origin` header will still be available.

```bash
# Get the response's headers of the index file
curl -I https://example.com

# The output
content-type: application/json; charset=utf-8
access-control-allow-origin: *
```

Note that this is the intended behavior, you can check this on the Nginx documentation [here](http://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header).

> There could be several `add_header` directives. These directives are inherited from the previous level if and only if there are no `add_header` directives defined on the current level.

To work around this behavior, you can simply redeclare the previously set headers on a more specific location block like this:

```nginx
server {
    location / {
        add_header Access-Control-Allow-Origin "*";
    }

    location ~* \.json {
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "public, max-age=600";
    }
}
```

Or you can install the [headers-more](https://github.com/openresty/headers-more-nginx-module) module and use the provided [`more_set_headers`](https://github.com/openresty/headers-more-nginx-module#more_set_headers) directive.

### IP Tables Persistence Service is not Working on Ubuntu Xenial

I'm using the latest LTS version of Ubuntu to host this website: 16.04 Xenial Xerus. When I tried to start the `iptables-persistent` service to persist my IP tables configuration between reboot, I got an error:

```bash
# Try to start the service
sudo service iptables-persistent start

# Got an error instead
Failed to start iptables-persistent.service: Unit iptables-persistent.service not found.
```

It looks like the `iptables-persistent` package no longer provides the `init.d` service since Debian 8 Jessie, thus affecting its derivatives including Ubuntu Xenial.

The persistence functionality now has been split into two packages: `netfilter-persistent` and `iptables-persistent`. The `iptables-persistent` is now acting as a plugin to `netfilter-persistent` and no longer provide the `init.d` service. You can install these two packages like so:

```bash
sudo apt-get update
sudo apt-get install -y iptables-persistent netfilter-persistent
```

Now you can instead use the `netfilter-persistent` service to persist your IP tables configuration:

```bash
sudo service netfilter-persistent start
```

### Generating Tag Archive Page in Jekyll

Although there’s already a [plugin](https://github.com/jekyll/jekyll-archives) for generating the archive pages for tags or categories, it’s actually pretty simple to generate it yourself. You can take a look at the [Generators Plugin](https://jekyllrb.com/docs/plugins/#generators) section on Jekyll documentation.

All you have to do is to create a custom generator class that extends the [`Jekyll::Generator`](https://github.com/jekyll/jekyll/blob/master/lib/jekyll/generator.rb). Within this class, you have to define the `generate` method that receives an instance of [`Jekyll::site`](https://github.com/jekyll/jekyll/blob/master/lib/jekyll/site.rb).

```ruby
# ./_plugins/tag_page_generator.rb
module Jekyll
  class TagPageGenerator < Generator
    def generate(site)
      # Your archive page creation logic will go here
    end
  end
end
```

You can get access to all of your tags and loop through it like this:

```ruby
def generate(site)
  site.tags.each_key do |tag|
    puts tag # Will replace this with tag archive page creation
  end
end
```

You need to generate an archive page for each tag. On each iteration, you need to create an instance of this archive tag page and push it to the `site.pages` attribute.

```ruby
site.tags.each_key do |tag|
    site.pages << your_tag_archive_page_instance
end
```

Now you need to define a custom `TagArchivePage` class that represents the archive tag page. This class needs to extend from the [`Page`](https://github.com/jekyll/jekyll/blob/master/lib/jekyll/page.rb) class.

```ruby
# ./_plugins/tag_page_generator.rb
module Jekyll
  # TagPageGenerator class here...

  class TagArchivePage < Page
    def initialize(site, base, tag)
      @site = site
      @base = base # The site build directory
      @dir = File.join('tags', tag) # Tag archive pages directory
      @name = 'index.html' # Tag archive file name

      process(@name)
      # The tag archive layout file.
      read_yaml(File.join(base, '_layouts'), 'tag_archive.html')

      # Set page variables.
      data['title'] = "#{tag} Archive"
      data['posts'] = site.tags[tag]
    end
  end
end
```

With the configuration above, your tag archive page will be generated at `/tags/tag-name/index.html`. Back to your `TagPageGenerator` class, you can now create the `TagArchivePage` instance for each tag and push them to `site.pages` attribute.

```ruby
class TagPageGenerator < Generator
  def generate(site)
    site.tags.each_key do |tag|
      site.pages << TagArchivePage.new(site, site.source, tag)
    end
  end
end
```

You also need to define a layout file for this tag archive page in: `_layouts/tag_archive.html`. You can simply loop through the `posts` variable, this page variable contains all of the posts under the given tag.

```html
<!-- ./_layouts/tag_archive.html -->
<main>
    <h1>{% raw %}{{ page.title }}{% endraw %}</h1>
    <ul>
        {% raw %}{% for post in page.posts %}{% endraw %}
            <li>
                <h2>
                    <a href="{% raw %}{{ post.url }}{% endraw %}">{% raw %}{{ post.title }}{% endraw %}</a>
                </h2>
            </li>
        {% raw %}{% endfor %}{% endraw %}
    </ul>
</main>
```

Now, you're all set. Your `tag_page_generator.rb` file should look like this now:

```ruby
module Jekyll
  class TagPageGenerator < Generator
    def generate(site)
      site.tags.each_key do |tag|
        site.pages << TagArchivePage.new(site, site.source, tag)
      end
    end
  end

  class TagArchivePage < Page
    def initialize(site, base, tag)
      @site = site
      @base = base
      @dir = File.join('tags', tag)
      @name = 'index.html'

      process(@name)
      read_yaml(File.join(base, '_layouts'), 'tag_archive.html')

      data['title'] = "#{tag} Archive"
      data['posts'] = site.tags[tag]
    end
  end
end
```

### Code Highlighting for PHP Won't Work Without Opening Tag

I'm using [Rouge](https://github.com/jneen/rouge) for syntax highlighting. I've just discovered that it won't work for PHP code without an opening tag (`<?php`) like this:

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function ($carry, $item) {
    return $carry + $item;
});
```

To work around this, you can pass the `start_inline=1` option following the syntax language:

````markdown
```php?start_inline=1
    $collection = collect([1, 2, 3]);

    $total = $collection->reduce(function ($carry, $item) {
        return $carry + $item;
    });
```
````

Now your PHP code should be highlighted properly like this:

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function ($carry, $item) {
    return $carry + $item;
});
```

### Line Numbers for Code Snippets with GFM Syntax

As you may have already known, on Jekyll you can display the line numbers next to your code snippets by using the `{% raw %}{% highlight %}{% endraw %}` tag and passing the `linenos` option like this:

```markdown
{% raw %}{% highlight javascript linenos %}{% endraw %}
    console.log('Hello, World!');
{% raw %}{% endhighlight %}{% endraw %}
```

If you're using the default combination of Kramdown converter and Rogue highlighter, this won't work if you use the GFM ([GitHub Flavored Markdown](https://help.github.com/articles/basic-writing-and-formatting-syntax)) syntax—with backtick for highlighting the code. To work around this, you can globally set the Rouge `line_numbers` option within the `_config.yml` file.

```yml
# ./_config.yml

kramdown:
  syntax_highlighter: rouge
  syntax_highlighter_opts:
    span:
      # You don't want to have line number on inline code.
      line_numbers: false
    block:
      line_numbers: true
      start_line: 1
```

The downside is, all of your code snippets will have line numbers. There's no way to toggle it off individually.

## Final Thoughts

I hope by having this blog, I can refine my writing skills and be more efficient on communicating my ideas. I also hope that you'll find this blog useful. 🙏🏻🙏🏻🙏🏻
