#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const { readFileSync } = require('fs')
const { getDirectories } = require('./src/utilities')
const { processPromptCommand, processUpgradeCommand, processCreateComponentCommand, processInitCommand } = require('./src/commands')

const CONFIG_DIRECTORY = '.create-frontend-component'
const CONFIG_FILE_NAME = 'config.json'
const PRESET_DIR = 'presets'
const PRESET_PATH = path.join(__dirname, PRESET_DIR)

const configDefaults = {
  types: ['atoms', 'molecules', 'organisms'],
  templatePath: CONFIG_DIRECTORY + '/templates',
  componentPath: 'src/components',
  nameStyle: 'pascalCase'
}

/**
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

program
  .version('1.4.1')
  .arguments('<component-name>')
  .option( '-t, --type <type>', 'Component type, default: atoms')
  .option( '-f, --flavour <flavour>', 'Component flavour')
  .action( async function(componentName, env) {
    if (componentName.toLowerCase() === 'init') {
      await processInitCommand(PRESET_PATH, CONFIG_DIRECTORY, CONFIG_FILE_NAME, configDefaults)
      return
    }

    const { types, templatePath, componentPath, nameStyle } = loadConfig()
    const allowedComponentTypes = types || []
    const fullTemplatePath = path.join(process.cwd(), templatePath)
    const availableFlavours = getDirectories(fullTemplatePath)

    if (componentName.toLowerCase() === 'prompt') {
      await processPromptCommand(allowedComponentTypes, availableFlavours, fullTemplatePath, componentPath, nameStyle)
    } else if (componentName.toLowerCase() === 'upgrade') {
      await processUpgradeCommand(availableFlavours, allowedComponentTypes, fullTemplatePath, componentPath, nameStyle)
    } else {
      processCreateComponentCommand(env, allowedComponentTypes, fullTemplatePath, componentPath, componentName, availableFlavours, nameStyle)
    }
  })
  .parse(process.argv)
