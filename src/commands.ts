import { getDirectories, validateKebabCaseName } from './utilities.js'
import { generateComponentFilesWithDeps, generateFilesIfNotExistAlreadyWithDeps, initProjectInWorkingDirectory } from './file-operations.js'
import { promptSingleSelect, promptText } from './prompt-utilities.js'
import path from 'path'

export async function promptFlavour(availableFlavours: string[], label: string = 'Choose a flavour'): Promise<string> {
  if (availableFlavours.length === 0) {
    console.warn('Could not detect any component flavour, falling back to "default"')
    return Promise.resolve('default')
  }
  if (availableFlavours.length === 1) {
    return Promise.resolve(availableFlavours[0])
  }
  return promptSingleSelect(label, availableFlavours)
}

export async function processPromptCommand(
  allowedComponentTypes: string[] | null,
  availableFlavours: string[],
  fullTemplatePath: string,
  componentPath: string,
  nameStyle: string
): Promise<void> {
  const componentName = await promptText('Component Name (kebab-case)', validateKebabCaseName)
  let componentType: string | null
  if (allowedComponentTypes && allowedComponentTypes.length > 0) {
    componentType = await promptSingleSelect('Choose a type', allowedComponentTypes)
  } else {
    componentType = null
  }
  const flavour = await promptFlavour(availableFlavours)
  generateComponentFilesWithDeps(fullTemplatePath, componentPath, componentName, componentType, flavour, availableFlavours, nameStyle)
}

export async function processUpgradeCommand(
  availableFlavours: string[],
  allowedComponentTypes: string[],
  fullTemplatePath: string,
  componentPath: string,
  nameStyle: string
): Promise<void> {
  if (availableFlavours.length <= 1) {
    console.error('Could not detect more than 1 flavour, upgrade is not possible')
    return
  }

  const componentName = await promptText('Component Name (kebab-case)', validateKebabCaseName)
  const componentType = await promptSingleSelect('Choose the type', allowedComponentTypes)
  const flavour = await promptFlavour(availableFlavours, 'Choose a flavour to upgrade')
  generateFilesIfNotExistAlreadyWithDeps(fullTemplatePath, componentPath, componentName, componentType, flavour, availableFlavours, nameStyle)
}

export interface CommandEnv {
  type?: string
  flavour?: string
}

export function processCreateComponentCommand(
  env: CommandEnv,
  allowedComponentTypes: string[],
  fullTemplatePath: string,
  componentPath: string,
  componentName: string,
  availableFlavours: string[],
  nameStyle: string
): void {
  if (env.type && allowedComponentTypes.length === 0) {
    throw new Error('component types are not configured in this project but found parameter "type"')
  }

  let componentType: string | null
  if (allowedComponentTypes.length === 0) {
    componentType = null
  } else if (!env.type) {
    componentType = allowedComponentTypes[0]
  } else {
    componentType = env.type.toLowerCase()
  }

  if (componentType && !allowedComponentTypes.includes(componentType)) {
    console.error(`component type '${componentType}' is not allowed, choose one of: ${allowedComponentTypes}`)
    throw new Error('component type not found')
  }

  generateComponentFilesWithDeps(fullTemplatePath, componentPath, componentName, componentType, env.flavour ?? 'default', availableFlavours, nameStyle)
}

export async function processInitCommand(
  presetPath: string,
  configDirectory: string,
  configFileName: string,
  configDefaults: { types: string[] | null; templatePath: string; componentPath: string; nameStyle: string },
  presetArgument?: string
): Promise<void> {
  const availablePresets = getDirectories(presetPath)
  let presetName: string
  if (presetArgument) {
    presetName = presetArgument
  } else {
    presetName = await promptSingleSelect('Choose a preset', availablePresets)
  }
  return initProjectInWorkingDirectory(path.join(presetPath, presetName), configDirectory, configFileName, configDefaults)
}
