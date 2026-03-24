# Bluehost WordPress Plugin – Documentation index

This directory holds detailed documentation for the Bluehost WordPress Plugin, for both **humans** and **AI agents**. Start here to find the right doc for your task.

## Table of contents

| Document | Description |
|----------|-------------|
| [overview.md](overview.md) | What the plugin does, who maintains it, and high-level feature set. |
| [getting-started.md](getting-started.md) | Prerequisites, install, first run, and local WordPress (wp-env) setup. |
| [architecture.md](architecture.md) | Module loader, container, context, and how PHP and React fit together. |
| [modules.md](modules.md) | Newfold modules in this plugin: list in `vendor/newfold-labs` with brief descriptions. |
| [frontend.md](frontend.md) | React app structure, routes, pages, state, and build output. |
| [backend.md](backend.md) | PHP entry points, upgrades, and core `inc/` files. |
| [api.md](api.md) | REST API namespace, endpoints table, and settings endpoint reference. |
| [integrations.md](integrations.md) | Third-party and partner integrations (Google Site Kit, Yoast AI, Jetpack, partners, Hiive API). |
| [development.md](development.md) | Linting, testing, i18n, version management, and day-to-day workflow. |
| [release.md](release.md) | Release process, version bumping, and pre-release tagging. |
| [reference.md](reference.md) | Cache/transients, platform detection, compatibility, and design/resources. |
| [workflows.md](workflows.md) | GitHub Actions workflows: triggers, jobs, and purpose of each file. |
| [testing.md](testing.md) | Playwright E2E, PHPUnit, WPUnit (Codeception), and their CI workflows. |

## Quick links by role

- **New to the repo:** Read [overview.md](overview.md) then [getting-started.md](getting-started.md).
- **Changing the admin UI:** See [frontend.md](frontend.md) and [architecture.md](architecture.md).
- **Working with modules:** See [modules.md](modules.md) and [architecture.md](architecture.md).
- **Changing backend or API:** See [backend.md](backend.md), [api.md](api.md) for endpoints, and [architecture.md](architecture.md).
- **Third-party or partner integrations:** See [integrations.md](integrations.md).
- **Releasing or versioning:** See [release.md](release.md) and [development.md](development.md).
- **CI/CD and workflows:** See [workflows.md](workflows.md).
- **Running or writing tests:** See [testing.md](testing.md) and [workflows.md](workflows.md).
- **Integrations and edge cases:** See [reference.md](reference.md).

The root **AGENTS.md** file gives a short agent-oriented summary and points here for full docs.
