# Changesets

Run `bun changeset` in a PR that changes `react-particle-mesh` to describe the change and pick a semver bump.

To release: `bun changeset version` (bumps the version and writes the CHANGELOG), commit, then `npm publish --access public` from `packages/react-particle-mesh`.
