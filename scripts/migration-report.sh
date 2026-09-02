#!/usr/bin/env bash
#
# migration-report.sh
#
# Classifies a kickstartDS project's local customizations against the
# ruhmesmeile-storyblok-starter monorepo baseline.
#
# Both this project and the monorepo descend from kickstartDS/storyblok-starter-premium,
# so a real git merge-base exists. Everything changed since that merge-base IS the
# complete set of local customizations - this script routes each of those files to its
# new home in the monorepo and reports whether the change still needs porting.
#
# Usage:
#   scripts/migration-report.sh [--remote NAME] [--ref REF] [--branch BRANCH] [--out FILE]
#
# Defaults: --remote monorepo --ref monorepo/main --branch <current> --out migration-report.md
#
set -euo pipefail

REMOTE="monorepo"
REF=""
BRANCH=""
OUT="migration-report.md"
MONOREPO_URL="https://github.com/kickstartDS/ruhmesmeile-storyblok-starter.git"

while [ $# -gt 0 ]; do
  case "$1" in
    --remote) REMOTE="$2"; shift 2 ;;
    --ref)    REF="$2";    shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --out)    OUT="$2";    shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

[ -n "$REF" ]    || REF="$REMOTE/main"
[ -n "$BRANCH" ] || BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Remote '$REMOTE' not found. Add it with:" >&2
  echo "  git remote add $REMOTE $MONOREPO_URL" >&2
  echo "  git fetch $REMOTE main" >&2
  exit 1
fi

git rev-parse --verify "$REF" >/dev/null 2>&1 || {
  echo "Ref '$REF' not found. Run: git fetch $REMOTE main" >&2; exit 1; }

MB="$(git merge-base "$BRANCH" "$REF")"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
RENAMES="$TMP/renames"

# Rename map: where did each upstream file move to during the monorepo restructure?
git diff -M --diff-filter=R --name-status "$MB" "$REF" > "$RENAMES" 2>/dev/null || : > "$RENAMES"

# Explicit overrides for files whose destination git cannot infer.
manual_target() {
  case "$1" in
    config/deploy.yml) echo "config/deploy-website.yml" ;;
    *) echo "" ;;
  esac
}

# Candidate destinations, in priority order, for a path from the old flat layout.
candidates_for() {
  f="$1"
  dir="$(dirname "$f")"
  base="$(basename "$f")"
  echo "packages/website/$f"
  echo "packages/design-system/src/$f"
  echo "$f"
  if [ "$dir" = "." ]; then
    echo "packages/design-system/src/_$base"
  else
    # component token files gained a leading underscore in the design system
    echo "packages/design-system/src/$dir/_$base"
    echo "packages/website/$dir/_$base"
  fi
  case "$f" in
    token/*) echo "packages/design-system/src/_$base" ;;
  esac
}

resolve_target() {
  f="$1"
  m="$(manual_target "$f")"
  if [ -n "$m" ] && git cat-file -e "$REF:$m" 2>/dev/null; then echo "$m"; return; fi
  # prefer git's own rename detection
  r="$(awk -v f="$f" '$2 == f { print $3; exit }' "$RENAMES")"
  if [ -n "$r" ] && git cat-file -e "$REF:$r" 2>/dev/null; then echo "$r"; return; fi
  candidates_for "$f" | while read -r c; do
    if git cat-file -e "$REF:$c" 2>/dev/null; then echo "$c"; break; fi
  done
}

: > "$TMP/identical"; : > "$TMP/differs"; : > "$TMP/newonly"

for f in $(git diff --name-only "$MB" "$BRANCH"); do
  # deleted locally? nothing to port
  git cat-file -e "$BRANCH:$f" 2>/dev/null || continue
  t="$(resolve_target "$f")"
  if [ -z "$t" ]; then
    echo "$f" >> "$TMP/newonly"
    continue
  fi
  lh="$(git rev-parse "$BRANCH:$f")"
  rh="$(git rev-parse "$REF:$t")"
  if [ "$lh" = "$rh" ]; then
    echo "$f|$t" >> "$TMP/identical"
  else
    echo "$f|$t" >> "$TMP/differs"
  fi
done

# ---------------------------------------------------------------------------
# Upstream-diverged files.
#
# The diff-since-merge-base above only sees what the PROJECT changed. It is
# blind to files the project left untouched while the monorepo changed them -
# adopting the monorepo baseline silently overwrites those.
#
# This matters most for brand identity (tokens, fonts, colours), which is often
# established BEFORE the merge-base and therefore never shows up as a local
# change. Left unchecked, a project quietly inherits the upstream demo's brand.
# ---------------------------------------------------------------------------
git diff --name-only "$MB" "$REF"    > "$TMP/up_changed"
git diff --name-only "$MB" "$BRANCH" > "$TMP/local_changed"
: > "$TMP/div_identity"; : > "$TMP/div_other"

# Map a monorepo path back to its equivalent path in the old flat layout.
unmap() {
  t="$1"
  case "$t" in
    packages/website/*)           echo "${t#packages/website/}" ;;
    packages/design-system/src/*) echo "${t#packages/design-system/src/}" ;;
    *)                            echo "$t" ;;
  esac
}

while read -r t; do
  # Files deleted upstream also show up in this diff; they are not overwrites.
  git cat-file -e "$REF:$t" 2>/dev/null || continue
  f="$(unmap "$t")"
  if ! git cat-file -e "$BRANCH:$f" 2>/dev/null; then
    # design-system token partials gained a leading underscore
    d="$(dirname "$f")"; b="$(basename "$f")"
    case "$b" in
      _*) f2="$d/${b#_}"; [ "$d" = "." ] && f2="${b#_}" ;;
      *)  continue ;;
    esac
    git cat-file -e "$BRANCH:$f2" 2>/dev/null || continue
    f="$f2"
  fi
  grep -qxF "$f" "$TMP/local_changed" && continue          # project changed it too -> already triaged
  [ "$(git rev-parse "$BRANCH:$f")" = "$(git rev-parse "$REF:$t")" ] && continue
  case "$f" in
    token/*|*token*.json|*-tokens.scss|fonts.scss|index.scss|sd.config.cjs|cms/*|public/img/*|*font*)
      echo "$f|$t" >> "$TMP/div_identity" ;;
    *)
      echo "$f|$t" >> "$TMP/div_other" ;;
  esac
done < "$TMP/up_changed"

# Several monorepo paths can unmap() back to the SAME local file - token/dictionary/*.json,
# for instance, exists under both packages/website/ and packages/design-system/src/. Emitting
# one row per counterpart would inflate the counts and, worse, give a single file two rows
# that can be given contradicting dispositions. Collapse to one row per local file, listing
# every counterpart, so "nothing may be left blank" stays a per-file guarantee.
aggregate_by_local() {
  sort "$1" | awk -F'|' '
    $1 != prev { if (NR > 1) print prev "|" acc; prev = $1; acc = "`" $2 "`"; next }
    { acc = acc " · `" $2 "`" }
    END { if (NR > 0) print prev "|" acc }
  '
}

for bucket in div_identity div_other; do
  aggregate_by_local "$TMP/$bucket" > "$TMP/$bucket.agg"
  mv "$TMP/$bucket.agg" "$TMP/$bucket"
done

n_id=$(wc -l < "$TMP/identical"    | tr -d ' ')
n_df=$(wc -l < "$TMP/differs"      | tr -d ' ')
n_no=$(wc -l < "$TMP/newonly"      | tr -d ' ')
n_di=$(wc -l < "$TMP/div_identity" | tr -d ' ')
n_do=$(wc -l < "$TMP/div_other"    | tr -d ' ')

{
  echo "# Monorepo migration report"
  echo
  echo "- Project branch: \`$BRANCH\` ($(git rev-parse --short "$BRANCH"))"
  echo "- Monorepo baseline: \`$REF\` ($(git rev-parse --short "$REF"))"
  echo "- Shared merge-base: \`$(git rev-parse --short "$MB")\` — $(git log -1 --format=%s "$MB")"
  echo "- Local commits since merge-base: $(git rev-list --count "$MB..$BRANCH")"
  echo
  echo "Every file below must end with an explicit disposition."
  echo "Nothing may be left blank — that is the guarantee against silently losing customizations."
  echo
  echo "Dispositions: \`ported\` · \`superseded\` (upstream now does this) · \`dropped\` (intentional)"
  echo
  echo "## Needs triage — $n_df file(s)"
  echo
  echo "Local version differs from the monorepo counterpart."
  echo
  echo "| Disposition | Local path | Monorepo destination |"
  echo "| --- | --- | --- |"
  sort "$TMP/differs" | while IFS='|' read -r f t; do
    echo "|  | \`$f\` | \`$t\` |"
  done
  echo
  echo "## Project-specific — $n_no file(s)"
  echo
  echo "No counterpart upstream. Decide destination: website package, design system, or config."
  echo
  echo "| Disposition | Local path | Destination |"
  echo "| --- | --- | --- |"
  sort "$TMP/newonly" | while read -r f; do
    echo "|  | \`$f\` |  |"
  done
  echo
  echo "## Already upstream — $n_id file(s)"
  echo
  echo "Byte-identical to the monorepo. No action required."
  echo
  sort "$TMP/identical" | while IFS='|' read -r f t; do
    echo "- \`$f\`"
  done
  echo
  echo "## Upstream-diverged, brand/style critical — $n_di file(s)"
  echo
  echo "The project never changed these, so they are invisible to the diff above —"
  echo "but the monorepo did change them. Adopting the baseline **silently replaces**"
  echo "them with the upstream demo's values. Review every one."
  echo
  echo "| Decision | Local path | Monorepo path |"
  echo "| --- | --- | --- |"
  while IFS='|' read -r f t; do
    echo "|  | \`$f\` | $t |"
  done < "$TMP/div_identity"
  echo
  echo "## Upstream-diverged, other — $n_do file(s)"
  echo
  echo "Untouched locally, changed upstream. Normally you want the upstream version;"
  echo "listed only for completeness."
  echo
  while IFS='|' read -r f t; do
    echo "- \`$f\` → $t"
  done < "$TMP/div_other"

  # Uncommitted work is customization too, and is easy to lose in a migration.
  unc="$(git diff --name-only HEAD)"
  if [ -n "$unc" ]; then
    echo
    echo "## Uncommitted working-tree changes"
    echo
    echo "Not part of any commit, so not covered by the merge-base diff. Port or commit these."
    echo
    printf '%s\n' "$unc" | while read -r f; do echo "- \`$f\`"; done
  fi
} > "$OUT"

echo "Wrote $OUT"
echo "  needs triage:        $n_df"
echo "  project-specific:    $n_no"
echo "  already upstream:    $n_id"
echo "  diverged (identity): $n_di   <- silent-overwrite risk"
echo "  diverged (other):    $n_do"
