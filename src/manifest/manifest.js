import inquirer from 'inquirer';
import fs from 'fs';
import nodePlop from 'node-plop';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
inquirer.registerPrompt('autocomplete', autocompletePrompt);

// Directory paths
const publicDir = `${process.cwd()}/public`;
const srcDir = `${process.cwd()}/src`;
const overridesPath = `${srcDir}/manifestOverrides.json`;
const manifestPath = `${publicDir}/manifest.json`;

/**
 * Adds a new manifest override file.
 * @param {Object} options - The options for the manifest.
 * @param {string} options.identifier - The identifier for the manifest.
 * @param {string} options.description - The description for the manifest.
 * @returns None
 */
export const execManifest = async ({ identifier, description }) => {
  let id;
  let desc;
  let questions = [];

  if (identifier === undefined) {
    questions.push({
      type: 'input',
      name: 'identifier',
      message: 'Enter an identifier for this manifest'
    })
  }
  if (description === undefined) {
    questions.push({
      type: 'input',
      name: 'description',
      message: 'Enter a description for this manifest'
    })
  }
  const answers = await inquirer.prompt(questions);
  id = identifier || answers.identifier;
  desc = description || answers.description;

  if (id === undefined || desc === undefined) process.exit();

  try {
    const manifestString = fs.readFileSync(overridesPath, 'utf8');
    addManifest(id, desc, manifestString);
  } catch (e) {
    setupManifestManagement(id, desc);
  }
}

/**
 * Adds a new entry to the manifestOverrides.json file.
 * @param {string} id - The identifier for the new entry.
 * @param {string} desc - The description for the new entry.
 * @param {string} manifestString - The JSON string representing the manifest.
 * @returns None
 */
const addManifest = (id, desc, manifestString) => {
  try {
    const manifest = JSON.parse(manifestString);
    if (manifest[id] !== undefined) {
      console.error('Identifier already exists in manifestOverrides.json');
      process.exit();
    }
    const newManifest = {
      ...manifest,
      [id]: {
        description: desc,
        manifest: {},
      }
    };
    const newManifestString = JSON.stringify(newManifest, null, 2);
    fs.writeFileSync(overridesPath, newManifestString, 'utf8');
    console.log(`${id} added to manifestOverrides.json`);
  } catch (e) {
    console.error('manifestOverrides.json file not found');
    process.exit();
  }
}

/**
 * Sets up the manifest management by running the 'setup-manifest' generator with the given id and description.
 * @param {string} id - The id of the manifest.
 * @param {string} desc - The description of the manifest.
 * @returns None
 */
const setupManifestManagement = (id, desc) => {
  const plop = nodePlop(`${__dirname}/plop.js`);
  const setupManifest = plop.getGenerator('setup-manifest');
  setupManifest.runActions({ id, desc });
}

/**
 * Applies manifest overrides to the manifest file.
 * @param {Object} options - The options for applying the manifest overrides.
 * @param {string} [options.step=''] - The step of the process.
 * @param {string} [options.id=''] - The ID of the manifest override to apply.
 * @param {string} [options.buildDir=`${process.cwd()}/build`] - The build directory path, pre publish location of the manifest.json file.
 * @returns None
 */
export const applyManifestOverrides = async({ step, id, buildDir } = { step: '', id: '', buildDir: 'build' }) => {
  let manifest;
  let overrides;
  try {
    const manifestString = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestString);
  } catch (e) {
    console.error('manifest.json not found');
    process.exit();
  }
  try {
    const overridesString = fs.readFileSync(overridesPath, 'utf8');
    overrides = JSON.parse(overridesString);
  } catch (e) {
    console.error('manifestOverrides.json not found');
    process.exit();
  }

  const selection = id === undefined ? await manifestPrompt(overrides) : id;
  if (overrides[selection] === undefined) {
    console.error(`Invalid Id. ${id} does not exist in manifestOverrides.json.`);
    process.exit();
  }
  const buildPath = `${process.cwd()}/${buildDir}`;
  const path = step === 'start' ? `${srcDir}/manifest.tmp.json` : `${buildPath}/manifest.json`;
  const newManifest = mergeManifests(manifest, overrides[selection].manifest);
  fs.writeFileSync(path, newManifest, 'utf8');
}

/**
 * Prompts the user to select which overrides should be applied from the given overrides object.
 * @param {Object} overrides - The overrides object containing the available overrides.
 * @returns {Promise<string>} - A promise that resolves to the selected override key.
 */
async function manifestPrompt(overrides) {
  const keys = Object.keys(overrides);
  if (keys.length <= 0) {
    console.log('No overrides applied');
    process.exit();
  }

  const choices = keys.map((o) => ({
    name: `${o}: ${overrides[o].description}`,
    value: o,
  }));
  choices.unshift({
    name: 'Use default manifest',
    value: 'none'
  });

  const searchOptions = async (prevAnswers, input) => {
    return new Promise((resolve) => {
      resolve(choices.filter((c) => input === undefined ? true : c.name.indexOf(input) >= 0))
    })
  }

  const { selection } = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'selection',
      message: 'Which overrides should be applied?',
      source: searchOptions,
    },
  ]);

  // Default was selected. No overrides should be applied
  console.log('No overrides applied');
  if (selection === 'none') process.exit();

  return selection;
}

/**
 * Merges two manifest objects by combining their properties. If a property exists in both
 * objects, the value from the `override` object will override the value from the `current` object.
 * @param {object} current - The current manifest object.
 * @param {object} override - The manifest object to override the current object.
 * @returns {object} - The merged manifest object.
 */
function mergeManifests(current, override) {
  const newManifest = {
    ...current,
    ...override,
  };
  if (current.mapping !== undefined && override.mapping !== undefined)
    newManifest.mapping = overrideProperty('mapping');
  if (current.collections !== undefined && override.collections !== undefined)
    newManifest.collections = overrideProperty('collections');

  return JSON.stringify(newManifest, null, 2);

  function overrideProperty(prop) {
    const name = prop === 'mapping' ? 'alias' : 'name';
    return current[prop].map((m) => {
      const o = override[prop].find((ov) => ov[name] === m[name]);
      return {
        ...m,
        ...(o !== undefined ? o : {}),
      };
    });
  }
}
