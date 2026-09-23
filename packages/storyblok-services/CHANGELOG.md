# @kickstartds/storyblok-services

## 1.1.0

### Minor Changes

- 8516eef: Add per-component design token overrides to theme create/update.

  Themes (`token-theme` stories under `settings/themes/`) can now carry sparse
  per-component token overrides alongside their W3C DTCG branding tokens. The
  shared `createTheme`/`updateTheme` service functions accept an optional
  `componentTokens` object plus injected `componentTokensToCss` compiler and
  `component-token-catalog`, compile it to scoped CSS, and persist both
  `componentTokens` and `componentCss` on the story. `ThemeDetail` now exposes
  these fields, and the `create_theme`/`update_theme` MCP tools accept the new
  `componentTokens` parameter.

### Patch Changes

- 0cb6f22: Point the `buttons` array of `hero`, `cta` and `video-curtain` at the canonical
  `button` schema (`$ref` to `button.schema.json`) instead of restating an inline
  label+url subset.

  The inline shape had no `$id`, so the Storyblok config generator resolved it to a
  blok named after the property (`buttons`) rather than to the canonical `button`
  component — which is why the hero's buttons lost the `icon` the button schema
  already exposed. The generated prop types follow: the item type is now
  `ButtonProps`, so `variant`, `size`, `disabled` and `type` become available on
  hero/cta/video-curtain buttons.

  `injectRootFieldComponentTypes` now names array-of-objects items after the item
  schema's `$id` when that schema is one the Storyblok config generator emits as a
  standalone component, and after the property name otherwise — the same rule the
  generator applies (a nested bloks field like `blog-head.tags` is emitted as
  `tags`, not as the `blog-tag` schema it references). The set comes from the new
  `collectStandaloneComponents()`, derived from the content type schema. With the
  `$ref` above, root-field generation (`generate_root_field`) emits
  `component: "button"` for `cta.buttons` instead of `component: "buttons"`, which
  is what the schema-derived validation rules for that slot require.
