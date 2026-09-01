# Monorepo migration report

- Project branch: `main` (437aa0a6)
- Monorepo baseline: `monorepo/main` (93dec7af)
- Shared merge-base: `4f0fee1b` — fix: update sitemap
- Local commits since merge-base: 16

Every file below must end with an explicit disposition.
Nothing may be left blank — that is the guarantee against silently losing customizations.

Dispositions: `ported` · `superseded` (upstream now does this) · `dropped` (intentional)

## Needs triage — 28 file(s)

Local version differs from the monorepo counterpart.

| Disposition | Local path | Monorepo destination |
| --- | --- | --- |
|  | `components/button/button-tokens.scss` | `packages/design-system/src/components/button/_button-tokens.scss` |
|  | `components/ComponentProviders.tsx` | `packages/website/components/ComponentProviders.tsx` |
|  | `components/ImageRatioProviders.tsx` | `packages/website/components/ImageRatioProviders.tsx` |
|  | `components/ImageSizeProviders.tsx` | `packages/website/components/ImageSizeProviders.tsx` |
|  | `components/index.tsx` | `packages/website/components/index.tsx` |
|  | `components/Meta.tsx` | `packages/website/components/Meta.tsx` |
|  | `components/nav-flyout/NavFlyoutComponent.tsx` | `packages/design-system/src/components/nav-flyout/NavFlyoutComponent.tsx` |
|  | `components/nav-topbar/NavTopbarComponent.tsx` | `packages/design-system/src/components/nav-topbar/NavTopbarComponent.tsx` |
|  | `components/section/SectionProps.ts` | `packages/design-system/src/components/section/SectionProps.ts` |
|  | `components/teaser-card/TeaserCardComponent.tsx` | `packages/design-system/src/components/teaser-card/TeaserCardComponent.tsx` |
|  | `components/teaser-card/TeaserCardProps.ts` | `packages/design-system/src/components/teaser-card/TeaserCardProps.ts` |
|  | `components/teaser-card/teaser-card.schema.json` | `packages/design-system/src/components/teaser-card/teaser-card.schema.json` |
|  | `components/teaser-card/teaser-card.scss` | `packages/design-system/src/components/teaser-card/teaser-card.scss` |
|  | `components/teaser-card/_teaser-card-tokens.scss` | `packages/design-system/src/components/teaser-card/_teaser-card-tokens.scss` |
|  | `components/umami.client.js` | `packages/website/components/umami.client.js` |
|  | `config/deploy.yml` | `config/deploy-website.yml` |
|  | `Dockerfile` | `packages/website/Dockerfile` |
|  | `.env.local.sample` | `packages/website/.env.local.sample` |
|  | `.gitignore` | `.gitignore` |
|  | `helpers/storyblok.ts` | `packages/website/helpers/storyblok.ts` |
|  | `.kamal/secrets` | `.kamal/secrets` |
|  | `netlify.toml` | `packages/website/netlify.toml` |
|  | `next.config.js` | `packages/website/next.config.js` |
|  | `package.json` | `packages/website/package.json` |
|  | `pages/_app.tsx` | `packages/website/pages/_app.tsx` |
|  | `pages/[[...slug]].tsx` | `packages/website/pages/[[...slug]].tsx` |
|  | `scripts/bundleStaticAssets.js` | `packages/website/scripts/bundleStaticAssets.js` |
|  | `token/global-token.scss` | `packages/design-system/src/_global-token.scss` |

## Project-specific — 3 file(s)

No counterpart upstream. Decide destination: website package, design system, or config.

| Disposition | Local path | Destination |
| --- | --- | --- |
|  | `components/bundle-hash.ts` |  |
|  | `components/table/table.scss` |  |
|  | `package-lock.json` |  |

## Already upstream — 12 file(s)

Byte-identical to the monorepo. No action required.

- `.circleci/config.yml`
- `components/ImageRatioContext.tsx`
- `.kamal/hooks/docker-setup.sample`
- `.kamal/hooks/post-app-boot.sample`
- `.kamal/hooks/post-deploy.sample`
- `.kamal/hooks/post-proxy-reboot.sample`
- `.kamal/hooks/pre-app-boot.sample`
- `.kamal/hooks/pre-build.sample`
- `.kamal/hooks/pre-connect.sample`
- `.kamal/hooks/pre-deploy.sample`
- `.kamal/hooks/pre-proxy-reboot.sample`
- `pages/api/up/index.ts`

## Uncommitted working-tree changes

Not part of any commit, so not covered by the merge-base diff. Port or commit these.

- `components/ImageSizeProviders.tsx`
- `scripts/calculateCssProperties.js`
