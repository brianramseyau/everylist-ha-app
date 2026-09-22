#!/usr/bin/env node
/**
 * Points this add-on repo at a published EveryList release: sets `version` in
 * everylist/config.yaml and appends a link-only entry to everylist/CHANGELOG.md.
 *
 * Invoked by the main EveryList repo's docker-publish.yml, on a checkout of this repo, only
 * after that tag's image has finished publishing to GHCR - so `version` never advertises an
 * image that doesn't exist yet. The caller opens the resulting diff as a PR.
 *
 * Usage: node .github/scripts/bump-version.mjs vX.Y.Z [--allow-downgrade]
 * Refuses to move the add-on to an older version unless --allow-downgrade is passed.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../../..')

const allowDowngrade = process.argv.includes('--allow-downgrade')
const tag = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
if (!tag || !/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(
    'Usage: node .github/scripts/bump-version.mjs vX.Y.Z [--allow-downgrade] (stable releases only, no -rc/-beta suffix)'
  )
  process.exit(1)
}

// Supervisor pulls this value verbatim as the Docker image tag to install, so it keeps the "v"
// prefix.
const configPath = path.join(repoRoot, 'everylist/config.yaml')
const config = readFileSync(configPath, 'utf8')
const versionLine = /^version: .*/m
if (!versionLine.test(config)) {
  console.error(`Could not find a "version:" line in ${configPath}`)
  process.exit(1)
}

// Refuse to move the add-on backwards: Supervisor would roll users onto an older image, and the
// resulting one-line diff looks innocuous in review. --allow-downgrade is the deliberate
// rollback opt-in.
const semver = (value) => value.replace(/^v/, '').split('.').map(Number)
const current = /^version: ['"]?(v\d+\.\d+\.\d+)['"]?\s*$/m.exec(config)?.[1]
if (!current) {
  console.error(
    `${configPath}'s "version:" isn't a plain vX.Y.Z tag, so the downgrade check can't run. Fix it by hand first.`
  )
  process.exit(1)
}
if (current === tag) {
  console.log(`Already at ${tag}, nothing to do.`)
  process.exit(0)
}
if (!allowDowngrade) {
  const [next, prev] = [semver(tag), semver(current)]
  const older = next.findIndex((part, i) => part !== prev[i])
  if (older !== -1 && next[older] < prev[older]) {
    console.error(
      `${tag} is older than the add-on's current ${current}. Pass --allow-downgrade if this rollback is intentional.`
    )
    process.exit(1)
  }
}
writeFileSync(configPath, config.replace(versionLine, `version: '${tag}'`))
console.log(`Updated ${path.relative(repoRoot, configPath)} -> ${tag}`)

const changelogPath = path.join(repoRoot, 'everylist/CHANGELOG.md')
const changelog = readFileSync(changelogPath, 'utf8')
const entry = `## ${tag}\n\nSee the [full EveryList release notes](https://github.com/brianramseyau/EveryList/releases/tag/${tag}).\n`
// New entries go directly under the top-level "# Changelog" heading, above older entries.
const heading = /^# .*\n/m
const updatedChangelog = heading.test(changelog)
  ? changelog.replace(heading, (match) => `${match}\n${entry}`)
  : `${entry}\n${changelog}`
writeFileSync(changelogPath, updatedChangelog)
console.log(`Updated ${path.relative(repoRoot, changelogPath)} with a ${tag} entry`)
