# EveryList — Home Assistant Add-on Repository

[![Add repository to my Home Assistant][ha-badge]][ha-add-repo]

This is the [Home Assistant Supervisor add-on repository](https://www.home-assistant.io/common-tasks/os/#installing-a-third-party-add-on-repository)
for [EveryList](https://github.com/brianramseyau/EveryList), a mobile-first, offline-first
shopping/task list app. It runs the same self-hosted image published for Docker/Unraid — one
container, one SQLite database, nothing else to configure.

## Installation

Click the badge above, or add this repository under **Settings → Add-ons → Add-on Store →
⋮ → Repositories**:

```
https://github.com/brianramseyau/everylist-ha-app
```

Then install **EveryList** from the Add-on Store. See [`everylist/DOCS.md`](everylist/DOCS.md)
for the add-on's configuration options.

## What's in this repo

```
├── repository.yaml       # Supervisor add-on repository manifest
└── everylist/
    ├── config.yaml         # add-on manifest (image, version, options)
    ├── CHANGELOG.md         # per-release notes, linking to full EveryList release notes
    ├── DOCS.md               # end-user install/config docs shown in the HA Supervisor UI
    └── icon.png
```

There's no build step here — `config.yaml` points at the pre-built image
[`ghcr.io/brianramseyau/everylist`](https://github.com/brianramseyau/EveryList/pkgs/container/everylist)
published by the main [EveryList](https://github.com/brianramseyau/EveryList) repo. This repo
only ever needs its `version` bumped to track a new release.

## Versioning

`everylist/config.yaml`'s `version` is pinned to a real `vX.Y.Z` tag already published to GHCR —
Supervisor pulls that exact image tag. After each EveryList release, a job in the main repo's
`docker-publish.yml` opens a PR here (via [`.github/scripts/bump-version.mjs`](.github/scripts/bump-version.mjs))
once that release's image has finished publishing, and it auto-merges once this repo's
[`validate`](.github/workflows/validate.yml) check passes. No manual step in the common case —
see the main repo's [`AGENTS.md`](https://github.com/brianramseyau/EveryList/blob/main/AGENTS.md)
for the full release process.

[ha-badge]: https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg
[ha-add-repo]: https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fbrianramseyau%2Feverylist-ha-app
