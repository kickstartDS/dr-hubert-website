# @kickstartds/storyblok-mcp-server

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

- Updated dependencies [bd6f437]
- Updated dependencies [747d7c4]
- Updated dependencies [d152d3a]
- Updated dependencies [720dafb]
- Updated dependencies [8516eef]
- Updated dependencies [0cb6f22]
- Updated dependencies [710cc15]
- Updated dependencies [d137c7a]
- Updated dependencies [db2d11a]
- Updated dependencies [22f6b00]
- Updated dependencies [a385526]
- Updated dependencies [448e256]
- Updated dependencies [4c06710]
- Updated dependencies [89794b4]
- Updated dependencies [bfda446]
- Updated dependencies [7683811]
  - @kickstartds/design-system@2.3.0
  - @kickstartds/storyblok-services@1.1.0
