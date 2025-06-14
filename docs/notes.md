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
1. Create a new release with `gh release create v0.4.0 -t 'Version 0.4.0'
1. After the release has been created update `.github/workflows/main.yml` to point the new version

# Using the CI main.yaml
`main.ymal` can be queued manually with an option to rebuild dist and commit the changes back.  This will automatically happen for for dependabot branches.