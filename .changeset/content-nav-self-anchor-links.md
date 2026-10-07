---
"@kickstartds/design-system": patch
---

Resolve Storyblok *story* links to root-relative hrefs. A story link was
rendered as the raw `full_slug`, which has no leading slash
(`support/downloads`), so on a nested page the browser resolved it against the
current directory and duplicated the last path segment: the Content Nav anchor
link on `/support/downloads` pointed at `/support/support/downloads#A1230` and
404'd instead of scrolling to the target. Story links - both the resolved
`full_slug` and the `cached_url` fallback the Visual Editor sends - now go
through `pathOf()`, so they render as `/support/downloads#A1230`. The root
story keeps mapping to `/`, and external `url`/`email`/`asset` links are
untouched.
