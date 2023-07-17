/**
 * Sets up a Plop generator for adding a manifest to the manifestOverrides file.
 * @param {Object} plop - The Plop object.
 * @returns None
 */
module.exports = function (plop) {
  plop.setGenerator('setup-manifest', {
    description: 'Adds a manifest to the manifestOverrides file',
    prompts: [],
    actions: [{
      type: 'add',
      path: `${process.cwd()}/src/manifestOverrides.json`,
      templateFile: `${__dirname}/templates/manifestOverride.json.hbs`
    }, {
      type: 'modify',
      path: `${process.cwd()}/src/setupProxy.js`,
      pattern: 'const config = { manifest };',
      templateFile: `${__dirname}/templates/setupProxy.js.hbs`
    }, {
      type: 'append',
      path: `${process.cwd()}/package.json`,
      pattern: '"start": "react-scripts start",',
      templateFile: `${__dirname}/templates/npmScripts.json.hbs`
    }]
  })
}