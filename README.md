# Risan Bagja's Personal Blog

Risan Bagja's personal blog powered by [Hugo](https://gohugo.io/).

## Requirements

* [Hugo](https://gohugo.io/) **extended**, at the version pinned in
  [`.tool-versions`](.tool-versions)

The extended build is required because the stylesheet pipeline uses
`resources.Concat` with `minify` and `fingerprint`.

If you use [asdf](https://asdf-vm.com/) or [mise](https://mise.jdx.dev/), run
`asdf install` / `mise install` in the repository root to get the pinned
version. Otherwise download the matching `hugo_extended` archive from the
[Hugo releases page](https://github.com/gohugoio/hugo/releases).

## Installation

### 1. Clone the Repository

Run the following command to clone this repository into your computer:

```shell
$ git clone git@github.com:risan/risanb.com.git
```

### 2. Run the Blog 🎉

Type the following command to start the Hugo server:

```shell
$ hugo server -D
```

It will start the development server. You can visit the blog at: [localhost:1313](http://localhost:1313/).

To build the blog for production, run the following command:

```shell
$ hugo --minify
```

The static files will be generated at the `public` directory.

## Checking the Build

`scripts/check-site.py` walks the generated site and verifies that every page in
the sitemap exists, that every internal link, image and asset resolves, and that
every `#anchor` points at a real heading. It needs nothing but Python 3:

```shell
$ hugo --minify
$ python3 scripts/check-site.py public
```

The same two commands run in CI on every push and pull request, with
`--panicOnWarning` added to the build so that a Hugo deprecation notice fails
the build instead of silently changing how the site renders.

## Deployment

`risanb.com` is served through Cloudflare and deploys automatically from `main`.
The build itself is configured in the hosting dashboard rather than in this
repository, which means two settings live outside version control:

* the build command (`hugo --minify`) and output directory (`public`)
* `HUGO_VERSION`, which selects the Hugo release used for the build

Cloudflare Pages does not read the Hugo version from a file in the repository,
so `.tool-versions` covers local development and CI only. **When the pinned
version in `.tool-versions` changes, update `HUGO_VERSION` in the dashboard to
match**, otherwise production keeps building with the old release.

## License

MIT © [Risan Bagja Pradana](https://risanb.com)
