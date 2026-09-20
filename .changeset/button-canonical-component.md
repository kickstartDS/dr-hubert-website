---
"@kickstartds/design-system": minor
---

Point the `buttons` array of `hero`, `cta` and `video-curtain` at the canonical
`button` schema (`$ref` to `button.schema.json`) instead of restating an inline
label+url subset.

The inline shape had no `$id`, so the Storyblok config generator resolved it to a
blok named after the property (`buttons`) rather than to the canonical `button`
component — which is why the hero's buttons lost the `icon` the button schema
already exposed. The generated prop types follow: the item type is now
`ButtonProps`, so `variant`, `size`, `disabled` and `type` become available on
hero/cta/video-curtain buttons. No runtime behaviour changes.
