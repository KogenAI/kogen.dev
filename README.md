# kogen.dev

The Kogen website: landing page, Origins, and announcements.
Built with Astro and intended for Cloudflare Pages.

## Development

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The static site is generated in `dist/`. Cloudflare Pages uses `npm run build`
as its build command and `dist` as its output directory.

## Brand assets

The reusable Kogen brand bundle owns the social-preview master. This repository
keeps synchronized deployment copies:

- `public/brand/kogen-social-preview.svg` — editable website copy.
- `public/og.png` — 1280×640 deployed Open Graph/Twitter image.

When the preview changes, update the canonical SVG and PNG in the Kogen brand
bundle first, copy both files here, confirm the canonical and website copies have
identical SHA-256 hashes, and run the normal build. Do not treat this repository
as a second master. GitHub repository-preview uploads are separate from deploying
these website files.

## Announcements

Write posts in `src/content/announcements/`. Each post needs `title`, `summary`,
`author`, and `status` (`draft` or `published`). Published posts also need
`publishedAt`. Optional `updatedAt` cannot precede the publication date.

Published URLs use `/announcements/YYYY-MM-DD/slug/`, with dates in UTC.
Drafts appear during development and in `npm run build:preview`; the normal
build excludes them. Run the normal build again before deploying after a draft
preview.

## Project

[Source](https://github.com/KogenAI/kogen) · [Website](https://kogen.dev) ·
[Contact](mailto:contact@kogen.dev)

Copyright 2026 Optimum Tech, LLC. Licensed under [Apache 2.0](LICENSE).
Third-party font licenses are included in `public/fonts/`.
