const promptly = require('promptly')
const { validateKebabCaseName } = require('./utilities')
const { generateComponentFiles, generateFilesIfNotExistAlready } = require('./gulpfile')

/**
 * @param {Array<string>} availableFlavours
 * @param {string} label
 * @return {Promise<string>}
 */
async function promptFlavour(availableFlavours, label = 'Choose a flavour') {
  if (availableFlavours.length === 0) {
    console.warn('Could not detect any component flavour, falling back to "default"')
    return Promise.resolve('default')
  }
  if (availableFlavours.length === 1) {
    return Promise.resolve(availableFlavours[0])
  }
  return promptly.choose(label + ' (' + availableFlavours.join(', ') + '): ', availableFlavours)
}

/**
 * @param {Array<string>} allowedComponentTypes
 * @param {Array<string>} availableFlavours
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @return {Promise<void>}
 */
async function processPromptCommand(allowedComponentTypes, availableFlavours, fullTemplatePath, componentPath) {
  const componentName = await promptly.prompt('Component Name (kebab-case): ', {validator: validateKebabCaseName})
  const componentType = await promptly.choose('Choose a type (' + allowedComponentTypes.join(', ') + '): ', allowedComponentTypes)
  const flavour = await promptFlavour(availableFlavours)
  generateComponentFiles(fullTemplatePath, componentPath, componentName, componentType, flavour, availableFlavours)
}

/**
 * @param {Array<string>} availableFlavours
 * @param {Array<string>} allowedComponentTypes
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @return {Promise<void>}
 */
async function processUpgradeCommand(availableFlavours, allowedComponentTypes, fullTemplatePath, componentPath) {
  if (availableFlavours.length <= 1) {
    console.error('Could not detect more than 1 flavour, upgrade is not possible')
    return
  }

  const componentName = await promptly.prompt('Component Name (kebab-case): ', {validator: validateKebabCaseName})
  const componentType = await promptly.choose('Which type is your component? (' + allowedComponentTypes.join(', ') + '): ', allowedComponentTypes)
  const flavour = await promptFlavour(availableFlavours, 'Choose a flavour to upgrade')
  generateFilesIfNotExistAlready(fullTemplatePath, componentPath, componentName, componentType, flavour, availableFlavours)
}

/**
 * @param {object} env
 * @param {Array<string>} allowedComponentTypes
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} componentName
 * @param {Array<string>} availableFlavours
 */
function processCreateComponentCommand(env, allowedComponentTypes, fullTemplatePath, componentPath, componentName, availableFlavours) {
  if (env.type && allowedComponentTypes.length === 0) {
    throw new Error('component types are not configured in this project but found parameter "type"')
  }

  let componentType = env.type
  if (allowedComponentTypes.length === 0) {
    componentType = null
  } else if (!componentType) {
    // use first type as default
    componentType = allowedComponentTypes[0]
  } else {
    componentType = componentType.toLowerCase()
  }

  if (componentType && !allowedComponentTypes.includes(componentType)) {
    throw new Error(`component type '${componentType}' is not allowed, choose one of: ${allowedComponentTypes}`)
  }

  generateComponentFiles(fullTemplatePath, componentPath, componentName, componentType, env.flavour, availableFlavours)
}

module.exports = {
  processUpgradeCommand,
  processPromptCommand,
  processCreateComponentCommand
}
