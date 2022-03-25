#!/usr/bin/env node

const program = require('commander')
const { generateComponentFiles } = require('./src/gulpfile')
const fs = require('fs')
const path = require('path')
const { readFileSync } = require('fs')
const { copySync } = require('fs-extra')
const { getDirectories, validateKebabCaseName } = require('./src/utilities')
const prompts = require('prompts')

const CONFIG_DIRECTORY = '.create-frontend-component'
const CONFIG_FILE_NAME = 'config.json'
const PRESET_DIR = 'presets'
const PRESET_PATH = path.join(__dirname, PRESET_DIR)

const configDefaults = {
  types: ['atoms', 'molecules', 'organisms'],
  templatePath: CONFIG_DIRECTORY + '/templates',
  componentPath: 'src/components'
}


/**
 * @param {string} filePath
 * @return {object}
 */
function loadConfig() {
  const filePath = path.resolve(process.cwd(), '.create-frontend-component', 'config.json')
  const configFromFile = JSON.parse(
    readFileSync(filePath, 'utf8').replace(/^\ufeff/u, '')
  )

  return {
    ...configDefaults,
    ...configFromFile
  }
}

/**
 * Creates config directory and adds config file
 * @param {string} presetPath
 */
function initProjectInWorkingDirectory(presetPath) {
  // Create directory
  const configPath = path.join(process.cwd(), CONFIG_DIRECTORY)
  if (!fs.existsSync(configPath)){
    console.log('\nCreate directory ' + CONFIG_DIRECTORY)
    fs.mkdirSync(configPath)
  }
  // Create Config File
  const configJSON = JSON.stringify(configDefaults)
  const configFilePath = path.join(CONFIG_DIRECTORY, CONFIG_FILE_NAME)
  if (!fs.existsSync(configFilePath)){
    console.log('Create config file ' + configFilePath)
    fs.writeFileSync(configFilePath, configJSON, {encoding: 'utf-8' })
  }

  const defaultTemplatePath = path.join(CONFIG_DIRECTORY, 'templates')
  if (!fs.existsSync(defaultTemplatePath)){
    console.log('Create templates directory ' + defaultTemplatePath)
    fs.mkdirSync(defaultTemplatePath)
  }
  try {
    copySync(presetPath, defaultTemplatePath, { overwrite: true })
    console.log('\nTemplates were created and transfered successfully')
  } catch (error) {
    console.error('Error: unable to copy presets', error)
  }
}

program
  .version('1.1.0')
  .arguments('<component-name>')
  .option( '-t, --type <type>', 'Component type, default: atoms')
  .option( '-f, --flavour <flavour>', 'Component flavour')
  .action( async function(componentName, env) {
    if (componentName.toLowerCase() === 'init') {
      const availablePresets = getDirectories(PRESET_PATH)

      const presetPrompt = await prompts({
        type: 'select',
        name: 'preset',
        message: 'Choose a preset',
        choices: availablePresets.map(preset => ({ title: preset, value: preset })),
      })

      initProjectInWorkingDirectory(path.join(PRESET_PATH, presetPrompt.preset))
    }

    const { types, templatePath, componentPath } = loadConfig()
    const allowedComponentTypes = types || []
    const fullTemplatePath = path.join(process.cwd(), templatePath)
    const availableFlavours = getDirectories(fullTemplatePath)

    if (componentName.toLowerCase() === 'prompt') {
      const context = {}

      const componentNamePrompt = await prompts({
        type: 'text',
        name: 'componentName',
        message: 'Component Name (kebab-case)',
        validate: validateKebabCaseName
      })

      context.componentName = componentNamePrompt.componentName

      const componentTypePrompt = await prompts({
        type: 'select',
        name: 'componentType',
        message: 'Choose a type',
        choices: allowedComponentTypes.map(type => ({ title: type, value: type })),
      })

      context.componentType = componentTypePrompt.componentType

      if (availableFlavours.length === 0) {
        console.warn('Could not detect any component flavour, falling back to "default"')
        return generateComponentFiles(fullTemplatePath, componentPath, context.componentName, context.componentType, 'default', availableFlavours)
      }

      if (availableFlavours.length === 1) {
        return generateComponentFiles(fullTemplatePath, componentPath, context.componentName, context.componentType, availableFlavours[0], availableFlavours)
      }

      const flavourPrompt = await prompts({
        type: 'select',
        name: 'flavour',
        message: 'Choose a flavour',
        choices: availableFlavours.map(flavour => ({ title: flavour, value: flavour })),
      })

      return generateComponentFiles(fullTemplatePath, componentPath, context.componentName, context.componentType, flavourPrompt.flavour, availableFlavours)
    }

    if (env.type && allowedComponentTypes.length == 0) {
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
  })
  .parse(process.argv)
