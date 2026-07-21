# Manual R2 release-asset upload workflow

## Background

The release process previously uploaded the packaged plugin zip to the Cloudflare R2 bucket automatically as part of `upload-asset-on-release.yml`, triggered by GitHub's `release: published` event. A bad release was pushed to R2 automatically this way, so the R2 upload step was commented out. The team now does the R2 upload manually: tag the release, smoke-test the build on production, then log into Cloudflare and upload the zip by hand.

This spec covers a new workflow, `upload-release-asset.yml`, dispatched manually after the smoke test passes, that automates the manual part (download the zip, upload to R2, purge cache) without reintroducing an automatic trigger on release publish.

## Scope

- Repo: `newfold-labs/wp-plugin-bluehost` only, for now. The intent is to prove this out here, then promote it into the shared `newfold-labs/workflows` reusable-workflow repo so other brand plugins (mojo, crazy-domains, hostgator, blueprint, web, hiive-config) can adopt it later. Nothing in those other repos changes as part of this work.
- Only the R2-upload and cache-purge behavior is affected. Build/packaging/`gh release upload` steps in `upload-asset-on-release.yml` are untouched.

## Design

### New workflow: `.github/workflows/upload-release-asset.yml`

Manual-dispatch only (`workflow_dispatch`), with one optional input:

- `tag` (string, optional) — "Release tag to upload (e.g. 4.14.1). Leave blank to use the latest published release."

`run-name: Upload Release Asset (${{ inputs.tag || 'latest' }}) to R2` so individual dispatches are distinguishable in the Actions run list.

Top-level `permissions: {}`; job-level `permissions: contents: read` — this workflow only reads release data and pushes to R2/Cloudflare, it never writes to the repo or to GitHub releases.

`concurrency`: grouped by `github.workflow`, `cancel-in-progress: false` (never cancel an in-flight upload partway through).

No `actions/checkout` step — every step operates via `gh`/`aws`/`curl` against the already-tagged release and repo variables/secrets, with `--repo "$GITHUB_REPOSITORY"` passed explicitly to `gh` calls since there's no local checkout to infer it from.

Steps:

1. **Resolve release tag** — if `inputs.tag` is blank, resolve via `gh release view --repo "$GITHUB_REPOSITORY" --json tagName -q .tagName`, which returns GitHub's own definition of "latest" (newest non-draft, non-prerelease release). Output as `TAG`.
2. **Setup workflow context** — same pattern as the existing workflow: `mkdir dist`, output `DIST` (temp working dir) and `PACKAGE` (from `vars.PLUGIN_NAME`).
3. **Download release asset** — `gh release download "$TAG" --repo "$GITHUB_REPOSITORY" --pattern '*.zip' --dir "$DIST"`. This re-downloads the exact asset that `gh release upload` attached to the release in the on-release workflow — the same bytes that were smoke-tested on production, not a rebuild.
4. **Verify downloaded zip** — fail fast with a clear error if `$DIST/$PACKAGE.zip` isn't present after download.
5. **Upload Zip to R2** — the AWS CLI step, guarded by `if: github.repository == vars.CANONICAL_REPOSITORY`. Uploads to `s3://${R2_BUCKET_NAME}/uploads/free/$PACKAGE.zip` via the R2 S3-compatible endpoint, using the existing `R2_*` secrets.
6. **Clear cache for release API** — moved here from `upload-asset-on-release.yml`, same guard. Purges the Cloudflare zone cache for `https://hiive.cloud/workers/release-api/plugins/${{ github.repository }}` so the release API stops serving a stale response once the new zip is live in R2.

### Repository variable: `CANONICAL_REPOSITORY`

A new repo variable, set to `newfold-labs/wp-plugin-bluehost` for this repo, used as the safety-guard condition on both the R2-upload and cache-purge steps: `if: github.repository == vars.CANONICAL_REPOSITORY`.

This exists so the workflow only performs its side effects on a repo that has been intentionally configured for it — a fork or clone won't have the variable set (or will have it set to something else), so it silently no-ops rather than acting. When this workflow is later promoted to the shared reusable-workflow repo, each calling brand repo sets its own `CANONICAL_REPOSITORY` value; the workflow YAML itself needs no changes to support additional brands.

### Changes to `.github/workflows/upload-asset-on-release.yml`

- Remove the "Clear cache for release API" step from its current unconditional position at the end of the on-release workflow.
- Comment it out in place (matching the existing commented-R2-block style), with a one-line note that it moved to `upload-release-asset.yml`, so the history/intent stays visible in this file.
- No other changes — build, packaging, `gh release upload`, and the already-commented R2 block stay as-is.

## Out of scope

- No changes to `wp-plugin-mojo`, `wp-plugin-crazy-domains`, `wp-plugin-hostgator`, `wp-plugin-blueprint`, `wp-plugin-web`, or `wp-plugin-hiive-config` — those repos don't have this pattern set up correctly yet and are explicitly deferred to a later reusable-workflow migration.
- No GitHub Environment protection rules or additional approval gates — manual dispatch by an authorized person is considered sufficient given the workflow no longer runs automatically on release publish.
- No changes to the version-validation or WP-version-validation steps in `upload-asset-on-release.yml`, even though they contain a similar repository-literal check — out of scope for this change.
