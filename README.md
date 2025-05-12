<a href="https://bluehost.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/newfold-labs/wp-plugin-bluehost/main/assets/svg/bluehost-logo.svg" alt="Bluehost Logo" title="Bluehost" align="right" height="32" />
</a>

# Bluehost WordPress Plugin
[![Version Number](https://img.shields.io/github/v/release/newfold-labs/wp-plugin-bluehost?color=21a0ed&labelColor=333333)](https://github.com/newfold-labs/wp-plugin-bluehost/releases)
[![Package Plugin](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/upload-asset-on-release.yml/badge.svg?event=release)](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/upload-asset-on-release.yml)
[![Cypress Tests](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/cypress.yml/badge.svg?branch=main)](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/cypress.yml)
[![Lint](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/lint.yml)
[![Build Plugin](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/upload-artifact-on-push.yml/badge.svg?branch=main)](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/upload-artifact-on-push.yml)

WordPress plugin that integrates a WordPress site with the Bluehost control panel, including performance, security, and update features.

# Installation

Find the `bluehost-wordpress-plugin.zip` asset for your preferred version at: https://github.com/newfold-labs/wp-plugin-bluehost/releases/.

Alternatively, check the release API endpoint for the latest version: https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-bluehost?slug=bluehost-wordpress-plugin&file=bluehost-wordpress-plugin.php. Access the [zip download directly](https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-bluehost/download/?slug=bluehost-wordpress-plugin&file=bluehost-wordpress-plugin.php).

# Releasing Updates

## Release Steps

Review the [version control](https://newfold-labs.github.io/how-we-work/9-version-control.html) and [releases](https://newfold-labs.github.io/how-we-work/10-releases.html) "[How We Work](https://newfold-labs.github.io/how-we-work/)"
docs for more information.

## Releases

Typically plugin releases are on Wednesdays, and should be prepped a week in advance to allow for testing and QA. In the pull request list we use milestones to indicate which release a PR will be included in. PRs with module updates must be submitted (and in a mergable state) by EOD on a given Wednesday to be considered for the following release.

To prepare a release, run the `Newfold Prepare Release` github action to automatically bump the version (either patch, minor or major version), and update build and language files all at once. It will create a PR with changed files for review. Using this workflow, we can skip all the manual steps below.

### Manual Release Steps

Ideally (excluding out-of-cycle releases) these steps are done a week before the actual release. Steps to follow when releasing a new version of the plugin:

- Create a release branch for this release: `release/x.y.z` (branching from `develop` branch).
- Update versions:
  - This plugin has version number set in 3 distinct places in 2 files. There is have a validation for proper versioning in the release workflow. All 3 instances need to be incremented in conjuction with new releases via github tagging:
  - The [plugin header version](bluehost-wordpress-plugin.php#L5) - this is used by WordPress.
  - The [plugin constant version](bluehost-wordpress-plugin.php#L35)  - this is used in the plugin php code.
  - The [plugin package version](package.json#L5) - this is used by the build step to place the release files within a matching version directory for convenient cache busting.
- Remove previous build files (from the previous version/release).
- Generate fresh build files. Run `npm run build`.
- Update language files. Run `composer run-script i18n`.
- Commit and push changes.
- Create a release branch (target `main`).

### Release Steps

- Alert the teams Product Delivery Team and announce that the latest build is available for testing and request engineering teams to test their updates in the build.
- Create a JIRA ticket and link to release PR with any special testing instructions for QA team.
- Create a Change Request associated with this release.
- Download the latest build and install on a production site for manual testing.
- Ensure the `release` branch has passing tests.
- Ensure the `release` branch passes linting.
- Ensure the `release` branch passes the full test matrix.
- If issues are found, push fixes directly to the release branch, and run through the manual testing process again.
- When ready to release, merge the release branch into the `main` branch and be sure any changes made directly on the release branch are also merged back into the `develop` branch.
- Create a [new release](https://github.com/newfold-labs/wp-plugin-bluehost/releases/new) tagged (x.y.z) and
  named (x.y.z) for the version.
- Ensure the satis [build](https://bluehost.github.io/satis/#newfold-labs/wp-plugin-bluehost)
  is [triggered](https://github.com/newfold-labs/wp-plugin-bluehost/actions/workflows/satis-webhook.yml)
  and [completes](https://github.com/bluehost/satis/actions).
- Ensure that the [update API](https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-bluehost/)
  displays the release as latest/current version.
- Alert the teams Product Delivery Team of the completed release process.
- Watch for the plugin release to rollout in Hiive or monitor by [running a query](https://github.com/bluehost/bluehost-wordpress-hub/wiki/Queries#brand-plugin-rollout) against Hiive.

# Style and Design
See this [figma for a style guide](https://www.figma.com/file/pNcxXb2avx36YAWOD1XkgZ/Bluehost-Project-SP?type=design&t=j2AyR9xIPKwWeFjO-0).

# How We Work
Newfold Labs is an interdisciplinary product and engineering team at Newfold Digital creating next-generation solutions that support our customers and our business. Learn more about [how we work](https://github.com/newfold-labs/how-we-work).

