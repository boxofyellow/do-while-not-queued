# Updating 
1. Create a codespace
1. Make the required changes (likely to `package.json` and `index.js`)
1. run `npm install` to pull updated package and update `package-lock.json`
1. run `npm i -g @vercel/ncc` to get `ncc`
1. run `ncc build index.js --license licenses.txt` to update `dist/*`
1. Create PR with these changes

# Adding a new version
1. Update `package.json`
1. Run `npm install` to update `package-lock.json`
1. Create/Merge PR with these changes.
1. Create a new release with `gh release create v0.4.0 -t 'Version 0.4.0'`
1. That should automatically kick off a run of https://github.com/boxofyellow/do-while-not-queued/actions/workflows/versioning.yml, this will update the needed tags, update `.github/workflows/main.yml`, and then kick off a run of the CI https://github.com/boxofyellow/do-while-not-queued/actions/workflows/main.yml.

The versioning workflow maintains the major version ref (e.g. `v2`) as a **tag** (via `prefer_branch_releases: false`), matching the [GitHub Actions versioning guide](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md).  On each release the major tag is force-moved to the latest release, so `@v2` always resolves to the newest `v2.x` and picks up the current Node runtime.

> Note: A legacy `v2` *tag* from 2020 (which pointed at a Node 12 commit) previously coexisted with a `v2` *branch*.  Because GitHub Actions prefers a tag over a branch of the same name, `@v2` resolved to the old commit and consumers saw a Node 20/24 deprecation warning.  Publishing a new release with the tag-based configuration above force-moves the `v2` tag onto a current release and clears the warning.  The now-unused `v2` branch can be deleted.

The versioning workflow uses a PAT with write access to this repo, it does that so that it can update `main.yml` and can trigger the CI.  That PAT token is defined here

https://github.com/settings/personal-access-tokens/7099984 named `do-while-not-queued:versioning workflow`

It has only these Repo permissions
-  Read access to metadata
-  Read and Write access to code and workflows

# Using the CI main.yaml
`main.yaml` can be queued manually with an option to rebuild dist and commit the changes back.  This will automatically happen for dependabot branches.
