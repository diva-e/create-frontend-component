#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const path = require('path')
const promptly = require('promptly')
const { readFileSync } = require('fs')
const { copySync } = require('fs-extra')
const { getDirectories } = require('./src/utilities')
const {processPromptCommand, processUpgradeCommand, processCreateComponentCommand} = require('./src/commands')

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
      promptly.choose('Choose a preset (' + availablePresets.join(', ') + '): ', availablePresets).then(
        (presetName) => initProjectInWorkingDirectory(path.join(PRESET_PATH, presetName))
      )
      return
    }

    const { types, templatePath, componentPath } = loadConfig()
    const allowedComponentTypes = types || []
    const fullTemplatePath = path.join(process.cwd(), templatePath)
    const availableFlavours = getDirectories(fullTemplatePath)

    if (componentName.toLowerCase() === 'prompt') {
      await processPromptCommand(allowedComponentTypes, availableFlavours, fullTemplatePath, componentPath)
    } else if (componentName.toLowerCase() === 'upgrade') {
      await processUpgradeCommand(availableFlavours, allowedComponentTypes, fullTemplatePath, componentPath)
    } else {
      processCreateComponentCommand(env, allowedComponentTypes, fullTemplatePath, componentPath, componentName, availableFlavours)
    }
  })
  .parse(process.argv)
