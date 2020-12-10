# Ensure same version as kibi-internal (`same-core-dependency-version`)

When Siren Investigate starts, all UI code and their dependencies are optimised. If a plugin has a different version of a dependency than kibi-internal (or even, other plugins), the dependency can not be de-duplicated, so the UI bundle downloaded by the user is bigger.

This rule ensures that if your repo lists a dependency used by kibi-internal, it must be the exact same version:

```
# eslint '**/*.{js,ts,jsx,tsx}' package.json

/path/to/git/repo/package.json
  0:5  warning  Investigate core uses 0.20.0, but this repo uses 0.17.1 of 'axios'     siren/same-core-dependency-version
``` 

Since version 2.1.0 this rule accepts an "ignore" option which allow to ignore a list of dependencies from the check 
To configure the exclussion add the following to your .eslitrc.yml

```
rules:
  siren/same-core-dependency-version: [ 'error', { ignore: ['dependencyName1', 'dependencyName2'] }]
```


Requirements:
- You must ensure that the `package.json` file is included in the files passed to eslint, as in the above command.
- This rule dynamically queries GitHub for kibi-internal's dependency list, so you must export an access token under the `GITHUB_TOKEN` environment variable. You can create a personal access token [here](https://github.com/settings/tokens).
