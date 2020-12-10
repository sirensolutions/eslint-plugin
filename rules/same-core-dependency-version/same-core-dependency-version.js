const path = require('path');
const request = require('sync-request');

let packageJsonContents;

module.exports = {
  registerPackageJsonContents: fileContents => packageJsonContents = fileContents,
  meta: {
    type: 'problem',
    docs: {
      description: 'If a dependency is also specified in the kibi-internal repo, it must have the same version here',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/sirensolutions/eslint-plugin-siren/blob/master/rules/same-core-dependency-version/same-core-dependency-version.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          exclude: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    ]
  },
  create: context => {
    if (!packageJsonContents || path.basename(context.getFilename()) !== 'package.json' || !process.env.GITHUB_TOKEN) {
      return {};
    }

    const [dependencyLinesStart, dependencyLines] = getDependencyLines(context.getSourceCode().lines);

    const packageJson = JSON.parse(packageJsonContents.replace('module.exports = ', ''));
    if (!packageJson.dependencies) {
      return {};
    }
    const coreDependencies = getCoreDependencies(process.env.GITHUB_TOKEN);

    for (const [dependency, version] of Object.entries(packageJson.dependencies)) {
      const excludeOption = context.options[0];
      if (
        excludeOption && excludeOption.exclude.length > 0 &&
        excludeOption.exclude.includes(dependency)
      ) {
          continue;
      }

      if (!!coreDependencies[dependency] && coreDependencies[dependency] !== version) {
        context.report({
          message: `Investigate core uses ${coreDependencies[dependency]}, but this repo uses ${version} of '${dependency}'`,
          loc: {
            start: {
              line: dependencyLines.findIndex(line => line.includes(`"${dependency}"`)) + dependencyLinesStart + 1,
              column: 4
            }
          }
        });
      }
    }

    return {};
  }
};

function getCoreDependencies(githubToken) {
  const branch = 'master';
  const url = `https://raw.githubusercontent.com/sirensolutions/kibi-internal/${branch}/package.json`;
  const responseBody = request('GET', url, { headers: { Authorization: `token ${githubToken}` } }).getBody();
  return JSON.parse(responseBody).dependencies;
}

function getDependencyLines(lines) {
  let dependenciesBlockStart;
  let dependenciesBlockEnd;
  for (const [index, line] of lines.entries()) {
    if (line.includes('"dependencies":')) {
      dependenciesBlockStart = index;
    }
    if (dependenciesBlockStart && line.includes('}')) {
      dependenciesBlockEnd = index;
      break;
    }
  }
  return [dependenciesBlockStart, lines.slice(dependenciesBlockStart, dependenciesBlockEnd + 1)];
}
