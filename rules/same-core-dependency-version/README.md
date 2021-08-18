# Ensure same version as kibi-internal (`nolookbehind`)

This rule ensures that we do not use lookbehind as it is not supported by Safari


Requirements:
- You must ensure that the `package.json` file is included in the files passed to eslint, as in the above command.
- This rule dynamically queries GitHub for kibi-internal's dependency list, so you must export an access token under the `GITHUB_TOKEN` environment variable. You can create a personal access token [here](https://github.com/settings/tokens).
