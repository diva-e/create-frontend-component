#!/usr/bin/env node

import { program } from 'commander'

import {
  processCreateComponentCommand,
  processInitCommand,
  processPromptCommand,
  processUpgradeCommand,
  type CommandEnv,
} from './src/commands.js'
import { getDirectories } from './src/utilities.js'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface AppConfig {
  types: string[] | null
  templatePath: string
  componentPath: string
  nameStyle: string
}

const CONFIG_DIRECTORY = '.create-frontend-component'
const CONFIG_FILE_NAME = 'config.json'
const PRESET_DIR = 'presets'
const PRESET_PATH = path.join(__dirname, PRESET_DIR)

const configDefaults: AppConfig = {
  types: ['atoms', 'molecules', 'organisms'],
  templatePath: `${CONFIG_DIRECTORY}/templates`,
  componentPath: 'src/components',
  nameStyle: 'pascalCase'
}

function loadConfig(): AppConfig {
  const filePath = path.resolve(process.cwd(), CONFIG_DIRECTORY, CONFIG_FILE_NAME)

  try {
    if (!existsSync(filePath)) {
      console.error(`Error: Configuration file not found at ${filePath}.`)
      console.error('Run "npx create-frontend-component init" to generate the configuration file.')
      process.exit(1)
    }

    const fileContent = readFileSync(filePath, 'utf8').replace(/^\ufeff/u, '')
    const configFromFile = JSON.parse(fileContent)

    return {
      types: configDefaults.types ?? null,
      templatePath: configDefaults.templatePath,
      componentPath: configDefaults.componentPath,
      nameStyle: configDefaults.nameStyle,
      ...configFromFile
    }
  } catch (error) {
    console.error(`Error loading configuration file: ${(error as Error).message}`)
    console.error('Try running "npx create-frontend-component init" to reset the configuration.')
    process.exit(1)
  }
}

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const { version } = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }))

program
  .name('create-frontend-component')
  .description('Frontend Component Generator')
  .version(version)

program
  .command('create-frontend-component [component-name]')
  .option('-t, --type <type>', 'Component type, default: atoms')
  .option('-f, --flavour <flavour>', 'Component flavour')
  .action(async function(componentNameArg: string | undefined, env: CommandEnv) {
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

    if (availableFlavours.length === 0) {
      console.error('Error: No flavours found in template directory.')
      console.error(`Please ensure templates exist in ${fullTemplatePath}`)
      process.exit(1)
    }

    if (componentName.toLowerCase() === 'prompt' || !componentName.trim()) {
      await processPromptCommand(allowedComponentTypes, availableFlavours, fullTemplatePath, componentPath, nameStyle)
    } else if (componentName.toLowerCase() === 'upgrade') {
      await processUpgradeCommand(availableFlavours, allowedComponentTypes, fullTemplatePath, componentPath, nameStyle)
    } else {
      processCreateComponentCommand(env, allowedComponentTypes, fullTemplatePath, componentPath, componentName, availableFlavours, nameStyle)
    }
  })

program.parse(process.argv)
