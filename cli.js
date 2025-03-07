#!/usr/bin/env node

import { program } from 'commander'

import {
  processCreateComponentCommand,
  processInitCommand,
  processPromptCommand,
  processUpgradeCommand,
} from './src/commands.js'
import { getDirectories } from './src/utilities.js'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


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

  try {
    if (!existsSync(filePath)) {
      console.error(`Error: Configuration file not found at ${filePath}.`)
      console.error('Run "npx create-frontend-component init" to generate the configuration file.')
      process.exit(1)
    }

    const fileContent = readFileSync(filePath, 'utf8').replace(/^\ufeff/u, '')
    const configFromFile = JSON.parse(fileContent)

    return {
      ...configDefaults,
      ...configFromFile
    }
  } catch (error) {
    console.error(`Error loading configuration file: ${error.message}`)
    console.error('Try running "npx create-frontend-component init" to reset the configuration.')
    process.exit(1)
  }
}

program
  .version('2.1.0')
  .command('create-frontend-component [component-name]') // Define the command
  .option( '-t, --type <type>', 'Component type, default: atoms')
  .option( '-f, --flavour <flavour>', 'Component flavour')
  .action( async function(componentNameArg, env) {
    const componentName = componentNameArg || ''

    if (componentName.toLowerCase() === 'init') {
      await processInitCommand(PRESET_PATH, CONFIG_DIRECTORY, CONFIG_FILE_NAME, configDefaults)
      return
    }

    if (componentName.toLowerCase().startsWith('init:')) {
      const nameParts = componentName.toLowerCase().split(':')
      const presetArgument = nameParts[1]
      await processInitCommand(PRESET_PATH, CONFIG_DIRECTORY, CONFIG_FILE_NAME, configDefaults, presetArgument)
      return
    }

    const { types, templatePath, componentPath, nameStyle } = loadConfig()
    const allowedComponentTypes = types || []
    const fullTemplatePath = path.join(process.cwd(), templatePath)
    const availableFlavours = getDirectories(fullTemplatePath)

    if (componentName.toLowerCase() === 'prompt' || !componentName.trim()) {
      await processPromptCommand(allowedComponentTypes, availableFlavours, fullTemplatePath, componentPath, nameStyle)
    } else if (componentName.toLowerCase() === 'upgrade') {
      await processUpgradeCommand(availableFlavours, allowedComponentTypes, fullTemplatePath, componentPath, nameStyle)
    } else {
      processCreateComponentCommand(env, allowedComponentTypes, fullTemplatePath, componentPath, componentName, availableFlavours, nameStyle)
    }
  })
  .parse(process.argv)
