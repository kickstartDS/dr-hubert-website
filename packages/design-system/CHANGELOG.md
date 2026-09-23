# v2.2.1 (Fri Mar 06 2026)

## 2.3.0

### Minor Changes

- bd6f437: Add component/semantic design-token catalog tooling: `extractComponentTokenCatalog`,
  `extractSemanticTokenCatalog`, and `componentTokensToCss` helpers, wired into the build and copied
  to `dist/tokens`. Also fixes `fontFamily` quoting in `tokensToCss`. Upstreamed from the optoma
  project (generic, brand-neutral parts only).
- 747d7c4: Add the Cosmos Token Graph feature (upstream Batch B). Introduces the new
  `@kickstartds/token-graph` workspace package (interactive design-token graph built on
  sigma.js / graphology) and wires its extraction into the design-system build: the `token-graph`
  step generates `src/token/token-graph.json` and rollup ships it to `dist/tokens/`. This also
  completes the token-graph build wiring deferred from Batch A (build step, `@kickstartds/token-graph`
  workspace dependency, and rollup copy entry).
- d152d3a: Upstream design-system component fixes (upstream Batch D). Ports 37 brand-neutral
  component sources — `*.tsx`, `*.scss`, `*.schema.json`, prop types and client
  behaviour — across blog-head, business-card, button, content-nav,
  event-registration, feature, gallery, header, headline, hero, html, lightbox,
  logos, search-filter, section, split-even, split-weighted and teaser-card, plus a
  new `SeoComponent.tsx` and a new `Gallery.client.js`. New component tokens are
  introduced for the gallery slider, lightbox stroke/thumb and teaser-card image,
  and the `component-token-catalog.json` and `SectionProps.d.ts` artifacts are
  regenerated deterministically (Button added to the section content union).

  Brand-laden Storybook stories and the story-coupled Footer redesign were excluded
  (see ADR-008); LFS visual snapshots/screenshots are regenerated in the canonical
  CI environment rather than committed from a locally drifted run (see ADR-009).

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

- 22f6b00: Redesign the Footer component with grouped navigation columns, social links, and a legal bottom bar.

  The footer now renders multi-column link groups (`navGroups`), an icon-driven social-links row (`socialLinks`, using icon identifiers from the icon sprite such as `facebook`, `twitter`, `linkedin`, `xing`), a `copyright` notice, and a `legalLink` in the bottom bar.

  BREAKING CHANGE: the `byline` and `navItems` props were removed. Migrate `navItems` to `navGroups` (an array of `{ heading, items: [{ label, url, newTab }] }`), move any byline text into `copyright`, and configure social media links via `socialLinks` (`{ icon, url, ariaLabel }`).

### Patch Changes

- 720dafb: Upstream dependency patch updates (upstream Batch E). Adds two pnpm
  `patchedDependencies` and extends a third, all brand-neutral upstream bugfixes:

  - **`unpic@3.22.0`** — hardens the Storyblok image-URL filter parser
    (`splitFilters`) to use a regex instead of naive `:`/`(` splitting, so filter
    values containing those characters parse correctly.
  - **`kickstartds@3.5.0--canary.62.324.0`** — makes the `storyblok-task` CLI
    actually consume the rc config returned by `taskInit` (`schemaPaths`,
    `layerOrder`, `configurationPath`, `templates`, `globals`, `components`).
  - **`@kickstartds/jsonschema-utils@3.9.0`** — extends the existing patch so
    `reduceSchemaAllOfs` preserves `title`, `description`, and `required` when
    collapsing `allOf` subschemas.

  Note: pnpm patches apply only within this monorepo's install and are not shipped
  with published artifacts; this patch bump records the toolchain change for
  release tracking. Design-system `build` green (presets 137).

- 710cc15: Keep `Cta`'s content box padding on mobile. A CTA without the content-padding toggle
  (`padding: false`, the schema default - and the state every CTA in the Storyblok space
  renders in, because the CMS hides the field) zeroed the box at every container width. On
  desktop that is invisible: the image takes one half and the flex gap in front of the text
  insets it from the card edge. Below a 640px container the CTA stacks, the image is
  full-bleed, and the headline, subheadline and button sat flush against the card edge - the
  homepage slider CTAs on the website, for instance. The zeroing now only applies at and above
  the 640px container width, and only when the CTA has an image; a text-only CTA keeps its
  flush box, as before. Desktop is unchanged.
- d137c7a: Honour the Storyblok multilink `target=_blank` toggle. The derived `newTab` flag is now
  forwarded as `target="_blank" rel="noopener noreferrer"` by the nav (topbar, flyout,
  dropdown), logo, footer column headings and legal link, blog teaser, event teasers, mosaic
  tile buttons and business card. Blog teaser, teaser card and mosaic tile links also pass the
  base Button's `href` prop again instead of `url`, so they render as anchors that can carry
  the target instead of inert `<button>` elements.
- db2d11a: Declare `content-nav`'s `image.src` with `format: "image"` instead of
  `format: "uri"`. The Storyblok config generator derives the editor field type
  from that keyword, so the field was emitted as a `multilink` (a link picker with
  an asset option) even though what the CMS stores for it is asset-shaped — every
  other image `src` in the design system already uses `format: "image"` and is
  emitted as an `asset` field. The `links[].url` field is a real link and stays
  `format: "uri"`.

  The schema change alone does not change the editor: the live Storyblok space
  keeps the `multilink` field until the merged CMS config is pushed
  (`pnpm --filter website update-storyblok-config`, which needs the OAuth token),
  so that generate → merge → push step and the content pass
  (`migrate-content-nav-image`) are still outstanding. A field type flip does not
  migrate stored content either, hence the same-run content pass.

- a385526: Preview the Header and Footer as Dr. Hubert's header and footer.

  The Header and Footer stories are the source of those two components' Storyblok preview images, so
  they now carry the client's own content instead of the design system's placeholder: `static/logo.svg`
  and `static/logo-inverted.svg` are byte copies of Dr. Hubert's Storyblok assets (space 303819, source
  recorded in `src/themes/index.ts`), the Header story overrides `navItems` with the site's navigation,
  and the Footer story carries the client's flat column navigation and copyright. The design system
  still ships its own copy of the logo and carries no CMS reference.

  `static/logo.svg` is shared with the Business Card and token-playground stories, so their snapshots
  change with it; the schemas' own `examples` are untouched.

- 448e256: Render `children` inside `NavFlyout`, so a consuming app can place its own content in the mobile
  menu panel next to the navigation — e.g. the website's language switcher — without forking the
  flyout markup. The children render after the nav list, inside the panel's `<nav>`.
- 4c06710: Resolve React element `type` references to component display names when writing
  `snippets.json`. Split-layout stories pass their slot content as JSX, so `type` was a
  component object that `JSON.stringify` collapsed to `{}`; the Storyblok preset generator
  could therefore not recover the child component. `dist/components/presets.json` now
  carries the component names, letting presets be generated schema-clean.
- 89794b4: Show an identical search hit only once. Pagefind builds a page's excerpt from
  the region its best match sits in, and the excerpt of the section holding that
  region from the same region, so the result list showed the same text twice: as
  the non-indented page hit and again as one of its indented section hits. The
  pagefind client now drops a sub-hit whose excerpt repeats the text of an
  earlier hit of the same page, comparing the text a visitor sees - highlight
  markup stripped, whitespace collapsed. A hit whose excerpt is its own stays
  visible, and so does a section hit that only repeats a heading.
- bfda446: Hide `SearchForm`'s "view all results" button whenever there are no hits to
  show. The button, which carries the total hit count and is rendered when the
  form has an `action` (as in the header's search modal), was only ever hidden by
  the rendering that follows a successful search, so the last count stayed on
  screen after the term was cleared - and after a term with no hits. Clearing the
  input and closing the modal both reset the form, and both now drop the button
  with the results.
- 7683811: Let `SearchForm`'s client move its hits and pagination into the element named by an optional
  `data-results-container` attribute on the form. A page that puts the form on an inverted
  background can point the attribute at a container on the default one — the search page does
  this so that only the headline and the form itself stay on the bold, inverted band while the
  results render below it, aligned with the headline. The form keeps rendering into the same
  result list after the move; without the attribute, or when the selector matches nothing, the
  hits stay inline as before.

#### 🐛 Bug Fix

- Merge branch 'feature/storybook-10' [#64](https://github.com/kickstartDS/ds-agency-premium/pull/64) ([@julrich](https://github.com/julrich))

#### ⚠️ Pushed to `main`

- fix: fix branding token script ([@julrich](https://github.com/julrich))
- chore: updated, generated props ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v2.1.0 (Fri Feb 27 2026)

#### 🚀 Enhancement

- Add token picker to Storybook stories [#63](https://github.com/kickstartDS/ds-agency-premium/pull/63) ([@julrich](https://github.com/julrich))

#### ⚠️ Pushed to `main`

- chore: update README ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v2.0.2 (Thu Feb 26 2026)

#### 🐛 Bug Fix

- Add missing alt text to teaser cards [#62](https://github.com/kickstartDS/ds-agency-premium/pull/62) ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v2.0.1 (Thu Feb 26 2026)

#### ⚠️ Pushed to `main`

- chore: update README and fix CHANGELOG ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v2.0.0 (Thu Feb 26 2026)

#### 💥 Breaking Change

- Fix Hero swallowing alt texts [#61](https://github.com/kickstartDS/ds-agency-premium/pull/61) ([@julrich](https://github.com/julrich))
- Merge branch 'feature/industry-extension' [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- Feature/split layout enhancement [#58](https://github.com/kickstartDS/ds-agency-premium/pull/58) ([@fleven-kds](https://github.com/fleven-kds))
- Design token overhaul [#43](https://github.com/kickstartDS/ds-agency-premium/pull/43) ([@fleven-kds](https://github.com/fleven-kds) [@lmestel](https://github.com/lmestel) [@julrich](https://github.com/julrich))
- Search [#50](https://github.com/kickstartDS/ds-agency-premium/pull/50) ([@lmestel](https://github.com/lmestel) [@fleven-kds](https://github.com/fleven-kds))
- feat(eventList): WIP: develop Component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(eventList): add WIP Component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(EventFilter): add component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(SplitLayouts): finetune components [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(SplitStories): adjust stories [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(splitEven): add sticky funcitonality [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(splitComponents): finetune Components [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(SplitWeighted): rename gap prop to gutter for consistency [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(splitWeighted): develop component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(splitEven): develop Component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(SplitEven): add SplitEven Component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- fix(form): correct typos in token [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(breadcrumb): add component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(Pagination): make ariaLabels properties optional [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(paginatino): develop component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(Pagination): develop Pagination component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(Pagination): add paginatino Component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(border): remove custom border-radius-card value and move it to teaser-card component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(EventLocation): add displayMode options to Component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(eventLatest): develop component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(components): rename event components [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(schema, components & stories): consolidate link/cta naming to "url" [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(EventTeaser): add component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- fix: remove urls in downloads [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- feat(scss): adjust spacings [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(EventDetail): replace asset [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(DownloadsComponent): fix markup to match scss [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'feature/industry-extension' of github.com:kickstartDS/ds-agency-premium into feature/industry-extension [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(events): develop event components [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- fix: add mdx docs page to downloads [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- Merge branch 'feature/industry-extension' of github.com:kickstartDS/ds-agency-premium into feature/industry-extension [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- feature: add event latest and event teaser scaffolding [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- fix(downloads): enhance accessibility and structure of download items [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- fix: clean up event schemas [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- feat(EventHeaderStory): add correct content for the story [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- fix(event-list-entry): add aria-label to address icon for accessibility [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(event): develop event template + components [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- fix: clean up template structure for events [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- feat(event): develop Event Components [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- fix: docs theme [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@julrich](https://github.com/julrich))
- feat(downloads): develop downloads component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- feat(downloads): add downloads component [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'feature/redesign-base-theme' into feature/industry-extension [#44](https://github.com/kickstartDS/ds-agency-premium/pull/44) ([@fleven-kds](https://github.com/fleven-kds))
- feat(event): add event module [#45](https://github.com/kickstartDS/ds-agency-premium/pull/45) ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch '94-update-component-layout' into feature/redesign-base-theme [#40](https://github.com/kickstartDS/ds-agency-premium/pull/40) ([@fleven-kds](https://github.com/fleven-kds))
- fix: add updated, generated props ([@julrich](https://github.com/julrich))

#### Authors: 3

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Jonas Ulrich ([@julrich](https://github.com/julrich))
- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.6.74 (Tue Feb 24 2026)

#### 🐛 Bug Fix

- Fix Hero swallowing alt texts [#61](https://github.com/kickstartDS/ds-agency-premium/pull/61) ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.73 (Thu Dec 18 2025)

#### ⚠️ Pushed to `main`

- feat(headline): add token for headline anchor icon ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.72 (Thu Dec 18 2025)

#### ⚠️ Pushed to `main`

- feat(headline): add link icon to headline ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.71 (Tue Dec 02 2025)

#### ⚠️ Pushed to `main`

- feat(hero): make textbox conditional to headline being set ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.70 (Fri Jun 27 2025)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: update added screenshots ([@julrich](https://github.com/julrich))
- fix: add correct component screenshots ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.69 (Thu Jun 26 2025)

#### ⚠️ Pushed to `main`

- fix: add markdown capabilities to feature component ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.68 (Thu Jun 26 2025)

#### ⚠️ Pushed to `main`

- fix: mixed string and integer content in stats ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.67 (Wed Feb 05 2025)

#### ⚠️ Pushed to `main`

- feat(hmtl): increase readability of consent message ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.66 (Tue Feb 04 2025)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(html): add inverted property ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.65 (Tue Feb 04 2025)

#### ⚠️ Pushed to `main`

- feat(html): style consent ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.64 (Tue Jan 28 2025)

#### ⚠️ Pushed to `main`

- feat(testimonials): rename token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.62 (Tue Jan 28 2025)

#### ⚠️ Pushed to `main`

- feat(quote): add quoteSign property to quote ([@fleven-kds](https://github.com/fleven-kds))
- feat(testimonials): fix faulty token naming ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(testimonial): fix token typo ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.61 (Mon Jan 27 2025)

#### ⚠️ Pushed to `main`

- feat(hero): remove min-height from no-crop setting ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.60 (Fri Jan 10 2025)

#### ⚠️ Pushed to `main`

- feat(border): add image border-radius ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.58 (Fri Jan 10 2025)

#### ⚠️ Pushed to `main`

- feat(global-token): up selector specificity ([@fleven-kds](https://github.com/fleven-kds))
- feat(global-tokens): reduce selector specificity ([@fleven-kds](https://github.com/fleven-kds))
- feat(token): change global typo gradient to highlight ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.57 (Tue Jan 07 2025)

#### ⚠️ Pushed to `main`

- feat(docs): add missing docs page ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.56 (Mon Jan 06 2025)

#### ⚠️ Pushed to `main`

- feat(section): rename token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.55 (Mon Jan 06 2025)

#### ⚠️ Pushed to `main`

- feat(global-token): update default value of tile-widths ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.54 (Mon Jan 06 2025)

#### ⚠️ Pushed to `main`

- feat(token): fix syntax typo ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.53 (Fri Dec 20 2024)

#### ⚠️ Pushed to `main`

- feat(section): add global tile-width token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.52 (Fri Dec 20 2024)

#### ⚠️ Pushed to `main`

- feat(global-token): calculate content-width independently ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.51 (Fri Dec 20 2024)

#### ⚠️ Pushed to `main`

- feat(global-token): remove annotations ([@fleven-kds](https://github.com/fleven-kds))
- feat(token): make content-width em based ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.50 (Fri Dec 20 2024)

#### ⚠️ Pushed to `main`

- feat(breakpoints): add widescreen breakpoint ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.49 (Fri Dec 20 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(global-token): Increase the default value of content-width_wide #78 ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.48 (Thu Dec 19 2024)

#### ⚠️ Pushed to `main`

- feat(ImageStory): remove ts-expect-error designation ([@fleven-kds](https://github.com/fleven-kds))
- feat(section): add BackgroundImage story ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.47 (Thu Dec 19 2024)

#### 🐛 Bug Fix

- Optimise for large screen resolutions [#39](https://github.com/kickstartDS/ds-agency-premium/pull/39) ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.46 (Thu Dec 19 2024)

#### ⚠️ Pushed to `main`

- feat(pages): restructure pages ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.45 (Fri Dec 13 2024)

#### ⚠️ Pushed to `main`

- feat(hero): fix "corner" layout ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.44 (Thu Dec 12 2024)

#### ⚠️ Pushed to `main`

- feat(hero): add "corner" variant to textPosition ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.43 (Tue Dec 10 2024)

#### ⚠️ Pushed to `main`

- feat(package): adjust script ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.42 (Tue Dec 10 2024)

#### ⚠️ Pushed to `main`

- feat(features:) add min-width to icons ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.41 (Mon Dec 09 2024)

#### ⚠️ Pushed to `main`

- feat(features): fix feature icon layout ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.40 (Thu Dec 05 2024)

#### ⚠️ Pushed to `main`

- feat(dependencies): update kickstartDS ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.39 (Wed Dec 04 2024)

#### ⚠️ Pushed to `main`

- fix: add markdown capabilities to teaser card headline ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.36 (Tue Dec 03 2024)

#### ⚠️ Pushed to `main`

- feat(typo): adjust fallback typo token ([@fleven-kds](https://github.com/fleven-kds))
- feat(token): reduce scaling on tv-bp token ([@fleven-kds](https://github.com/fleven-kds))
- feat(cta): roll back previous changes + adjust flex layout ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.35 (Tue Dec 03 2024)

#### ⚠️ Pushed to `main`

- feat(author): add docs for author ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.34 (Tue Dec 03 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(divider): adjust default component token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.33 (Tue Dec 03 2024)

#### ⚠️ Pushed to `main`

- feat(icons): add missing built-in icons ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.32 (Mon Dec 02 2024)

#### ⚠️ Pushed to `main`

- feat(section): remove max-width value ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.31 (Mon Dec 02 2024)

#### ⚠️ Pushed to `main`

- feat(section): change token default value ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.30 (Fri Nov 29 2024)

#### ⚠️ Pushed to `main`

- feat(breakpoints): rename 4k breakpoint ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.29 (Fri Nov 29 2024)

#### ⚠️ Pushed to `main`

- feat(section): add tv support ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.28 (Thu Nov 28 2024)

#### ⚠️ Pushed to `main`

- feat(cta): rewire properties ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.27 (Wed Nov 27 2024)

#### ⚠️ Pushed to `main`

- feat(icons): remove duplicate icon ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.25 (Tue Nov 26 2024)

#### ⚠️ Pushed to `main`

- feat(contact): rename token ([@fleven-kds](https://github.com/fleven-kds))
- feat(contact): add token for vertical link padding ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.24 (Tue Nov 26 2024)

#### ⚠️ Pushed to `main`

- feat(blogHead): add dsa specific className for blog-head ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.23 (Tue Nov 26 2024)

#### ⚠️ Pushed to `main`

- feat(icons): remove custom icons ([@fleven-kds](https://github.com/fleven-kds))
- feat(sd.config): fix icon sprite generation ([@fleven-kds](https://github.com/fleven-kds))
- feat(package): update kickstartDS-content ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.22 (Tue Nov 26 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: add explicit alt texts to blog related images ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.21 (Tue Nov 26 2024)

#### ⚠️ Pushed to `main`

- fix: add better label to blog teasers ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.20 (Thu Nov 21 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(section): improve z-index behaviour ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.19 (Thu Nov 21 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(blogTeaser): Add component token for Blog Teaser avatar size #23 ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.18 (Wed Nov 20 2024)

#### ⚠️ Pushed to `main`

- fix: bring back spotlight in section ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.6.17 (Wed Nov 20 2024)

#### ⚠️ Pushed to `main`

- feat(footer): change border color tokem ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.16 (Wed Nov 20 2024)

#### ⚠️ Pushed to `main`

- feat(footer): adjust footer border colo ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.15 (Wed Nov 20 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(section): revert previous change ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.14 (Wed Nov 20 2024)

#### ⚠️ Pushed to `main`

- feat(section): fix spotlight ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.13 (Wed Nov 20 2024)

#### ⚠️ Pushed to `main`

- feat(global): fix text-color-on-primary token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.12 (Wed Nov 20 2024)

#### ⚠️ Pushed to `main`

- feat(icons): add icons ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.11 (Tue Nov 19 2024)

#### ⚠️ Pushed to `main`

- feat(hero): fix container name ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.10 (Mon Nov 18 2024)

#### ⚠️ Pushed to `main`

- feat(hero): add component token for hero min width ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.9 (Thu Nov 14 2024)

#### ⚠️ Pushed to `main`

- feat(start): replace image component ([@fleven-kds](https://github.com/fleven-kds))
- feat(image): remove component ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.8 (Thu Nov 14 2024)

#### ⚠️ Pushed to `main`

- feat(tokens): fix typo ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.7 (Thu Nov 07 2024)

#### ⚠️ Pushed to `main`

- fix: add label to blog teaser links ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.6 (Thu Nov 07 2024)

#### ⚠️ Pushed to `main`

- fix: add iconSprite to settings schema ([@julrich](https://github.com/julrich))
- fix: add alt tags to blog teaser and blog head images ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.5 (Thu Nov 07 2024)

#### ⚠️ Pushed to `main`

- build: update markdown-to-jsx dependency ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.6.4 (Thu Nov 07 2024)

#### ⚠️ Pushed to `main`

- fix: features rendering ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.6.3 (Wed Nov 06 2024)

#### ⚠️ Pushed to `main`

- feat(icons): fix folder path ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.2 (Wed Nov 06 2024)

#### ⚠️ Pushed to `main`

- feat(icons): add new icon set ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.1 (Wed Nov 06 2024)

#### ⚠️ Pushed to `main`

- feat(features): apply properties more precisely ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.6.0 (Fri Oct 25 2024)

#### 🚀 Enhancement

- Execute scripts in html component & add consent [#19](https://github.com/kickstartDS/ds-agency-premium/pull/19) ([@lmestel](https://github.com/lmestel) [@fleven-kds](https://github.com/fleven-kds))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.5.42 (Fri Oct 25 2024)

#### ⚠️ Pushed to `main`

- feat(stats): improve vertical alignment ([@fleven-kds](https://github.com/fleven-kds))
- feat(header): increase z-index ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.41 (Thu Oct 24 2024)

#### ⚠️ Pushed to `main`

- fix: fix headline link position ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.5.40 (Thu Oct 24 2024)

#### ⚠️ Pushed to `main`

- feat: enhance headline links ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.5.39 (Thu Oct 24 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: divider default token ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.38 (Thu Oct 24 2024)

#### ⚠️ Pushed to `main`

- fix: remove obsolete typescript files ([@julrich](https://github.com/julrich))
- fix: make header semantic ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.37 (Wed Oct 23 2024)

#### ⚠️ Pushed to `main`

- fix: add missing and updated component previews ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.36 (Wed Oct 23 2024)

#### ⚠️ Pushed to `main`

- fix: add new components divider and html to section ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.35 (Mon Oct 14 2024)

#### ⚠️ Pushed to `main`

- feature: add icon picker capabilities ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.34 (Mon Oct 14 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: add linked h2 headlines ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.33 (Wed Oct 09 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(lightbox): fix token typo ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.32 (Wed Oct 09 2024)

#### ⚠️ Pushed to `main`

- feat(lightbox): add lightbox component token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.31 (Wed Oct 09 2024)

#### ⚠️ Pushed to `main`

- feat(slider): increase control nav margin ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.30 (Tue Oct 08 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'feature/add-divider' ([@fleven-kds](https://github.com/fleven-kds))
- feat(DividerStory): move divider to layout category ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.29 (Wed Oct 02 2024)

#### ⚠️ Pushed to `main`

- fix: add prop type exports to components ([@lmestel](https://github.com/lmestel))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: add prop type exports to components ([@julrich](https://github.com/julrich))

#### Authors: 2

- Jonas Ulrich ([@julrich](https://github.com/julrich))
- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.5.28 (Thu Sep 19 2024)

#### ⚠️ Pushed to `main`

- fix: empty images in testimonial ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.27 (Wed Sep 11 2024)

#### ⚠️ Pushed to `main`

- feat(blogTeaser): remove link label property ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.26 (Tue Sep 10 2024)

#### ⚠️ Pushed to `main`

- fix: html attributes for HTML component ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.25 (Tue Sep 10 2024)

#### ⚠️ Pushed to `main`

- feat(footer): fix token typos ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.24 (Tue Sep 10 2024)

#### ⚠️ Pushed to `main`

- feat(Footer): fix HTMLDivElement declaration ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.23 (Tue Sep 10 2024)

#### ⚠️ Pushed to `main`

- feat(footer): add footerContext ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.22 (Tue Sep 10 2024)

#### 🐛 Bug Fix

- Feature/add divider [#16](https://github.com/kickstartDS/ds-agency-premium/pull/16) ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.21 (Tue Sep 10 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(blogAside): fix token typo ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.20 (Mon Sep 09 2024)

#### ⚠️ Pushed to `main`

- feat(contact): center links vertically ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.19 (Fri Sep 06 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(teaser-card): add border token for label ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.18 (Fri Sep 06 2024)

#### ⚠️ Pushed to `main`

- feat(section): make style class conditional ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.17 (Fri Sep 06 2024)

#### ⚠️ Pushed to `main`

- feat(button-token): add missing token, remove superflous ones ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.16 (Thu Sep 05 2024)

#### ⚠️ Pushed to `main`

- fix: component previews ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.15 (Thu Sep 05 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(blogAuthor): add story ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.14 (Thu Sep 05 2024)

#### ⚠️ Pushed to `main`

- fix: update component previews ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.12 (Thu Sep 05 2024)

#### ⚠️ Pushed to `main`

- feat(section-token): replace section token with global content spacing ([@fleven-kds](https://github.com/fleven-kds))
- feat(flyout): remove chevron icon from sublist items ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(nav-flyout): make active state selector more specific ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.11 (Wed Sep 04 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: pass through rest props in new blog components ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.10 (Wed Sep 04 2024)

#### ⚠️ Pushed to `main`

- fix: add ref to blog aside ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.9 (Wed Sep 04 2024)

#### ⚠️ Pushed to `main`

- Merge branches 'main' and 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(features): add link token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.7 (Wed Sep 04 2024)

#### ⚠️ Pushed to `main`

- feat(contact): manually give props to picture component ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(blog): replace contact element with cta ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.5 (Wed Sep 04 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(BlogPost): insert replace cta with contact componetn ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: providers / context ([@julrich](https://github.com/julrich))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.4 (Wed Sep 04 2024)

#### ⚠️ Pushed to `main`

- fix: add undefined guard to links in contact ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.3 (Wed Sep 04 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(blog): refactor blog compnents ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.2 (Tue Sep 03 2024)

#### ⚠️ Pushed to `main`

- feat(blog-teaser): adjust token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.5.1 (Tue Sep 03 2024)

#### ⚠️ Pushed to `main`

- feature: extract blog author to its own component ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.5.0 (Tue Sep 03 2024)

#### 🚀 Enhancement

- Add contact component [#15](https://github.com/kickstartDS/ds-agency-premium/pull/15) ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.16 (Tue Sep 03 2024)

#### ⚠️ Pushed to `main`

- feat(headline): streamline token naming ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.15 (Tue Sep 03 2024)

#### ⚠️ Pushed to `main`

- feat(Start): remove br tags from template ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.14 (Tue Sep 03 2024)

#### ⚠️ Pushed to `main`

- Merge branches 'main' and 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(section-token): fix token mapping ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.13 (Mon Sep 02 2024)

#### ⚠️ Pushed to `main`

- feat(teaser-card): fix syntax error ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.12 (Mon Sep 02 2024)

#### ⚠️ Pushed to `main`

- feature: add page component ([@julrich](https://github.com/julrich))
- fix: make head in blog post required ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.4.11 (Mon Sep 02 2024)

#### ⚠️ Pushed to `main`

- feat(blogStories): update story to new tag entry schema ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.10 (Thu Aug 29 2024)

#### ⚠️ Pushed to `main`

- feat(nav-main): add toggle to nav-main breakpoint toggle ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.9 (Thu Aug 29 2024)

#### ⚠️ Pushed to `main`

- Merge branches 'main' and 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(topbar): increase selector for right aligned dropdown ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.8 (Thu Aug 29 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(nav-main): move breakpoint for display of nav components to nav-main ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.7 (Tue Aug 27 2024)

#### ⚠️ Pushed to `main`

- feat(nav-topbar): adjust selector ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.5 (Mon Aug 26 2024)

#### ⚠️ Pushed to `main`

- fix: blog tag schema ([@julrich](https://github.com/julrich))
- feat(hero): correct typo ([@fleven-kds](https://github.com/fleven-kds))
- feat(cta): up token selector specifity to enable overwriting ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.4.4 (Fri Aug 23 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: add explicit titles to blog overview ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.4.3 (Fri Aug 23 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- feature: add more flexibility to blog overview ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.4.2 (Fri Aug 23 2024)

#### ⚠️ Pushed to `main`

- fix: typing of header ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.4.1 (Fri Aug 23 2024)

#### ⚠️ Pushed to `main`

- feat(flyout): add padding to accomodate for mobile browser bottom bars ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.4.0 (Fri Aug 23 2024)

#### 🚀 Enhancement

- Feature/develop dropdown nav [#14](https://github.com/kickstartDS/ds-agency-premium/pull/14) ([@fleven-kds](https://github.com/fleven-kds) [@julrich](https://github.com/julrich))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.51 (Fri Aug 23 2024)

#### ⚠️ Pushed to `main`

- fix: section layout for blog cta ([@julrich](https://github.com/julrich))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: only render sections in blog when content empty ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.49 (Wed Aug 21 2024)

#### ⚠️ Pushed to `main`

- feat(headline): add missing token prefix ([@fleven-kds](https://github.com/fleven-kds))
- feat(image-token): update token prefix ([@fleven-kds](https://github.com/fleven-kds))
- feat(class prefix): change outdated prefix to "dsa" ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.48 (Mon Aug 19 2024)

#### ⚠️ Pushed to `main`

- feature: add sections to blog post ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.47 (Mon Aug 19 2024)

#### ⚠️ Pushed to `main`

- feat(cta): fix faulty token declaration ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.45 (Mon Aug 19 2024)

#### ⚠️ Pushed to `main`

- feat(headline): refactor token ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(headline): remove unused token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.44 (Mon Aug 19 2024)

#### ⚠️ Pushed to `main`

- fix: pass through rest props in blog components ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.43 (Wed Aug 14 2024)

#### ⚠️ Pushed to `main`

- feat(selectors): update selectors ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.42 (Wed Aug 14 2024)

#### ⚠️ Pushed to `main`

- feat(selectors): decrease global selector specificity ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.41 (Wed Aug 14 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(footer): expand link token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.40 (Wed Aug 14 2024)

#### ⚠️ Pushed to `main`

- feat(footer): make link text decoration for footer more explicit ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.39 (Tue Aug 06 2024)

#### ⚠️ Pushed to `main`

- feat(global): fix token syntax ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.38 (Tue Aug 06 2024)

#### ⚠️ Pushed to `main`

- feat(nav): fix floating header token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.37 (Mon Aug 05 2024)

#### ⚠️ Pushed to `main`

- feat(footer + header): disable link text-decoration ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.36 (Mon Aug 05 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(image-story): fix imagestory sticky behaviour + story ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.35 (Mon Aug 05 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(logo): remove logo story ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.34 (Mon Aug 05 2024)

#### ⚠️ Pushed to `main`

- feat(image-story): add vAlign to imageStory ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.33 (Fri Aug 02 2024)

#### ⚠️ Pushed to `main`

- feat(button): add font size token ([@fleven-kds](https://github.com/fleven-kds))
- feat(breakpoints): make breakpoints consistent ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.32 (Thu Aug 01 2024)

#### ⚠️ Pushed to `main`

- feat(header): center header-content ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.31 (Wed Jul 31 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(logo): add logo story ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.30 (Wed Jul 31 2024)

#### ⚠️ Pushed to `main`

- feat(nav-main + header): divide flyout and topbar nav + add individual inversion ([@fleven-kds](https://github.com/fleven-kds))
- feat(logo): add logo component ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.29 (Wed Jul 31 2024)

#### ⚠️ Pushed to `main`

- feat(logos): make tagline conditional ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.28 (Tue Jul 30 2024)

#### ⚠️ Pushed to `main`

- feat(logos): fix layout bug ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.26 (Tue Jul 30 2024)

#### ⚠️ Pushed to `main`

- feat(logos-tokens): reintegrate token ([@fleven-kds](https://github.com/fleven-kds))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(logos-token): remove unused token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.25 (Tue Jul 30 2024)

#### ⚠️ Pushed to `main`

- feat(logos): fix token integration ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.24 (Tue Jul 30 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(header): add inversion to nav logo ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.23 (Tue Jul 30 2024)

#### ⚠️ Pushed to `main`

- fix: typo in button scss ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.22 (Thu Jul 25 2024)

#### ⚠️ Pushed to `main`

- fix: add context to section component ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.21 (Wed Jul 24 2024)

#### ⚠️ Pushed to `main`

- fix: header preloading behaviour ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.20 (Wed Jul 24 2024)

#### ⚠️ Pushed to `main`

- feat(header): add logo inversion ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.19 (Wed Jul 24 2024)

#### ⚠️ Pushed to `main`

- feat(section): add new spotlight token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.18 (Tue Jul 23 2024)

#### ⚠️ Pushed to `main`

- fix: hero component ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.17 (Tue Jul 23 2024)

#### ⚠️ Pushed to `main`

- feat(button): add button-token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.16 (Fri Jul 19 2024)

#### ⚠️ Pushed to `main`

- feat(teaser-card): fix faulty token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.15 (Fri Jul 19 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: add missing, changed PageProps ([@julrich](https://github.com/julrich))
- fix: change page header / footer toggle behaviour ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.14 (Tue Jun 04 2024)

#### ⚠️ Pushed to `main`

- feat(token): fix component token integration ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.13 (Wed May 15 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: handle empty image in mosaic component ([@julrich](https://github.com/julrich))
- fix: align header / footer navItems, handle active ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.12 (Wed May 15 2024)

#### ⚠️ Pushed to `main`

- fix: make image in mosaic tile required ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.11 (Wed May 15 2024)

#### ⚠️ Pushed to `main`

- fix: split tile off from mosaic ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.10 (Tue May 07 2024)

#### ⚠️ Pushed to `main`

- feat(scss): remove annotations ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.9 (Fri May 03 2024)

#### ⚠️ Pushed to `main`

- fix: inverted attribute use in DOM ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.8 (Mon Apr 22 2024)

#### 🐛 Bug Fix

- Feature/update image story [#11](https://github.com/kickstartDS/ds-agency-premium/pull/11) ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.7 (Fri Apr 19 2024)

#### ⚠️ Pushed to `main`

- fix: change default mode of section to list ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.6 (Fri Apr 19 2024)

#### ⚠️ Pushed to `main`

- fix: add header and footer options ([@julrich](https://github.com/julrich))
- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: add components to slider schema ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.4 (Thu Apr 18 2024)

#### 🐛 Bug Fix

- feat(section): update section [#10](https://github.com/kickstartDS/ds-agency-premium/pull/10) ([@fleven-kds](https://github.com/fleven-kds))

#### ⚠️ Pushed to `main`

- fix: add correct format to twitter card image ([@julrich](https://github.com/julrich))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.3 (Thu Apr 18 2024)

#### 🐛 Bug Fix

- Feature/fix token integration [#9](https://github.com/kickstartDS/ds-agency-premium/pull/9) ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.3.2 (Thu Apr 18 2024)

#### ⚠️ Pushed to `main`

- fix: only render byline in footer if it exists ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.1 (Thu Apr 18 2024)

#### ⚠️ Pushed to `main`

- feature(footer): rename trademark to byline and make it a prop ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.3.0 (Wed Apr 17 2024)

#### 🚀 Enhancement

- Upgrade Storybook to version 8 [#8](https://github.com/kickstartDS/ds-agency-premium/pull/8) ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.34 (Thu Mar 14 2024)

#### 🐛 Bug Fix

- Update kickstartDS [#7](https://github.com/kickstartDS/ds-agency-premium/pull/7) ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.33 (Fri Mar 08 2024)

#### ⚠️ Pushed to `main`

- docs: update json-schema addon ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.32 (Mon Mar 04 2024)

#### ⚠️ Pushed to `main`

- fix: clean up stories and story order ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.31 (Mon Mar 04 2024)

#### ⚠️ Pushed to `main`

- fix: bring back colorful mosaic text ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.30 (Mon Mar 04 2024)

#### ⚠️ Pushed to `main`

- fix: minor style fixes ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.29 (Mon Mar 04 2024)

#### ⚠️ Pushed to `main`

- fix: use correct header height token ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.28 (Mon Mar 04 2024)

#### ⚠️ Pushed to `main`

- Revert "fix: fix testimonials schema" ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.27 (Mon Mar 04 2024)

#### ⚠️ Pushed to `main`

- fix: fix testimonials schema ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.26 (Sat Mar 02 2024)

#### ⚠️ Pushed to `main`

- docs: update component token & json schema addons ([@lmestel](https://github.com/lmestel))
- docs: fix storybook docs style ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.24 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- fix: add missing props ([@julrich](https://github.com/julrich))
- fix: finish refactoring on logos component ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.23 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- fix: finish component splitting and clean up ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.22 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- build: bring back cms components to bundle ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.21 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- build: add unique key prop to testimonials ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.19 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- build: clean up yarn.lock ([@lmestel](https://github.com/lmestel))
- build: patch storybook-addon-playroom to unpack args in addon panel ([@lmestel](https://github.com/lmestel))
- build: build theme tokens ([@lmestel](https://github.com/lmestel))
- fix: remove import on now deleted file ([@julrich](https://github.com/julrich))
- fix: modularization of features component, fix testimonials ([@julrich](https://github.com/julrich))

#### Authors: 2

- Jonas Ulrich ([@julrich](https://github.com/julrich))
- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.18 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- fix: even more forms scss ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.17 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- fix: more forms scss ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.16 (Fri Mar 01 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@julrich](https://github.com/julrich))
- fix: scss for forms ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.15 (Thu Feb 29 2024)

#### ⚠️ Pushed to `main`

- chore: align all stories files ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.14 (Thu Feb 29 2024)

#### ⚠️ Pushed to `main`

- fix: theme switch behaviour ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.13 (Thu Feb 29 2024)

#### 🐛 Bug Fix

- Add component tokens fixes [#6](https://github.com/kickstartDS/ds-agency-premium/pull/6) ([@fleven-kds](https://github.com/fleven-kds) [@julrich](https://github.com/julrich))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.12 (Thu Feb 29 2024)

#### ⚠️ Pushed to `main`

- fix: attempt fix for main ([@julrich](https://github.com/julrich))
- fix: further alignment with ds-agency ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.11 (Thu Feb 29 2024)

#### ⚠️ Pushed to `main`

- fix: align with ds-agency ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.10 (Thu Feb 29 2024)

#### 🐛 Bug Fix

- Add component tokens [#5](https://github.com/kickstartDS/ds-agency-premium/pull/5) ([@fleven-kds](https://github.com/fleven-kds) [@julrich](https://github.com/julrich))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.9 (Wed Feb 07 2024)

#### ⚠️ Pushed to `main`

- feat(components): remove glow ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.2.8 (Tue Jan 23 2024)

#### ⚠️ Pushed to `main`

- fix: remove split from section schema ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.2.7 (Tue Jan 23 2024)

#### ⚠️ Pushed to `main`

- feat(ArticelTeaser): fix type error ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.2.6 (Tue Jan 23 2024)

#### ⚠️ Pushed to `main`

- Merge branches 'main' and 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(pages): update faulty properties ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.2.5 (Tue Jan 23 2024)

#### ⚠️ Pushed to `main`

- feat(TeaserCard): update properties in renderings ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.2.4 (Mon Jan 22 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(background-color): update background-color token ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.2.3 (Mon Jan 22 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(pages): update properties ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.2.2 (Mon Jan 22 2024)

#### ⚠️ Pushed to `main`

- feat(properties): change redundant array names to items ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.2.1 (Mon Jan 22 2024)

#### 🐛 Bug Fix

- Inline themes [#2](https://github.com/kickstartDS/ds-agency-premium/pull/2) ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.2.0 (Fri Jan 19 2024)

#### 🚀 Enhancement

- Rename `tileWidth` options [#4](https://github.com/kickstartDS/ds-agency-premium/pull/4) ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.1.3 (Fri Jan 19 2024)

#### ⚠️ Pushed to `main`

- feat(pageIntro): remove pageIntro component ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.1.2 (Fri Jan 19 2024)

#### ⚠️ Pushed to `main`

- feat(logos): add logos basic stories ([@fleven-kds](https://github.com/fleven-kds))
- feat(stories): add stories from basic ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.1.1 (Fri Jan 19 2024)

#### ⚠️ Pushed to `main`

- Merge branch 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(features): adjust required props ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.1.0 (Thu Jan 18 2024)

#### 🚀 Enhancement

- Add explicit schemas for Settings and SEO [#3](https://github.com/kickstartDS/ds-agency-premium/pull/3) ([@julrich](https://github.com/julrich))

#### Authors: 1

- Jonas Ulrich ([@julrich](https://github.com/julrich))

---

# v1.0.7 (Thu Jan 18 2024)

#### ⚠️ Pushed to `main`

- Merge branches 'main' and 'main' of github.com:kickstartDS/ds-agency-premium ([@fleven-kds](https://github.com/fleven-kds))
- feat(componentTeaser): remove component ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.0.6 (Thu Jan 18 2024)

#### ⚠️ Pushed to `main`

- feat(slider-tokens): increase selector specificity ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.0.5 (Thu Jan 18 2024)

#### 🐛 Bug Fix

- Update slider [#1](https://github.com/kickstartDS/ds-agency-premium/pull/1) ([@lmestel](https://github.com/lmestel) [@fleven-kds](https://github.com/fleven-kds))

#### Authors: 2

- Franz ([@fleven-kds](https://github.com/fleven-kds))
- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v1.0.4 (Thu Jan 18 2024)

#### ⚠️ Pushed to `main`

- feat(teaserCard): update properties ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.0.3 (Thu Jan 18 2024)

#### ⚠️ Pushed to `main`

- feat(teaser-card): add buttonlabel prop ([@fleven-kds](https://github.com/fleven-kds))

#### Authors: 1

- Franz ([@fleven-kds](https://github.com/fleven-kds))

---

# v1.0.2 (Mon Jan 15 2024)

#### ⚠️ Pushed to `main`

- build: fix playroom snippets ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v0.0.3 (Mon Jan 15 2024)

#### ⚠️ Pushed to `main`

- build: rename repo & package to @kickstartds/ds-agency-premium ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))

---

# v0.0.3 (Mon Jan 15 2024)

---

# v0.0.3 (Mon Jan 15 2024)

---

# v0.0.2 (Mon Jan 15 2024)

#### ⚠️ Pushed to `main`

- feat: initial commit ([@lmestel](https://github.com/lmestel))

#### Authors: 1

- Lukas Mestel ([@lmestel](https://github.com/lmestel))
