import path from 'path'

import { getDirectories, validateKebabCaseName } from './utilities.js'
import { generateComponentFiles, generateFilesIfNotExistAlready, initProjectInWorkingDirectory } from './gulpfile.js'
import { promptSingleSelect, promptText } from './prompt-utilities.js'


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
  return promptSingleSelect(label, availableFlavours)
}

/**
 * @param {Array<string>} allowedComponentTypes
 * @param {Array<string>} availableFlavours
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} nameStyle eg. pascalCase, kebabCase
 * @return {Promise<void>}
 */
export async function processPromptCommand(allowedComponentTypes, availableFlavours, fullTemplatePath, componentPath, nameStyle) {
  const componentName = await promptText('Component Name (kebab-case)', validateKebabCaseName)
  let componentType
  if (allowedComponentTypes && allowedComponentTypes.length > 0) {
    componentType = await promptSingleSelect('Choose a type', allowedComponentTypes)
  } else {
    componentType = null
  }
  const flavour = await promptFlavour(availableFlavours)
  generateComponentFiles(fullTemplatePath, componentPath, componentName, componentType, flavour, availableFlavours, nameStyle)
}

/**
 * @param {Array<string>} availableFlavours
 * @param {Array<string>} allowedComponentTypes
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} nameStyle
 * @return {Promise<void>}
 */
export async function processUpgradeCommand(availableFlavours, allowedComponentTypes, fullTemplatePath, componentPath, nameStyle) {
  if (availableFlavours.length <= 1) {
    console.error('Could not detect more than 1 flavour, upgrade is not possible')
    return
  }

  const componentName = await promptText('Component Name (kebab-case)', validateKebabCaseName)
  const componentType = await promptSingleSelect('Choose the type', allowedComponentTypes)
  const flavour = await promptFlavour(availableFlavours, 'Choose a flavour to upgrade')
  generateFilesIfNotExistAlready(fullTemplatePath, componentPath, componentName, componentType, flavour, availableFlavours, nameStyle)
}

/**
 * @param {object} env
 * @param {Array<string>} allowedComponentTypes
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} componentName
 * @param {Array<string>} availableFlavours
 * @param {string} nameStyle eg. 'pascalCase', 'kebabCase'
 */
export function processCreateComponentCommand(env, allowedComponentTypes, fullTemplatePath, componentPath, componentName, availableFlavours, nameStyle) {
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
    console.error(`component type '${componentType}' is not allowed, choose one of: ${allowedComponentTypes}`)
    throw new Error('component type not found')
  }

  generateComponentFiles(fullTemplatePath, componentPath, componentName, componentType, env.flavour, availableFlavours, nameStyle)
}

/**
 * @param {string} presetPath
 * @param {string} configDirectory
 * @param {string} configFileName
 * @param {string} configDefaults
 * @return {Promise<void>}
 */
export async function processInitCommand(presetPath, configDirectory, configFileName, configDefaults) {
  const availablePresets = getDirectories(presetPath)
  const presetName = await promptSingleSelect('Choose a preset', availablePresets)
  return initProjectInWorkingDirectory(path.join(presetPath, presetName), configDirectory, configFileName, configDefaults)
}

