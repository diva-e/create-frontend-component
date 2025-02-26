'use strict'

import gulp from 'gulp'
import path from 'path'
import rename from 'gulp-rename'
import gulpTemplate from 'gulp-template'

import {
  getFiles,
  toFirstLetterLowerCase,
  toTitleCase,
  toUpperCamelCase,
  validateDirectoryExists,
  validateKebabCaseName,
} from './utilities.js'


import fs from 'fs'
import fsExtra from 'fs-extra'
const { copySync } = fsExtra


const DEFAULT_FLAVOUR_NAME = 'default'

/**
 * Creates config directory and adds config file
 *
 * @param {string} presetPath
 * @param {string} configDirectory
 * @param {string} configFileName
 * @param {object} configDefaults
 */
export function initProjectInWorkingDirectory(presetPath, configDirectory, configFileName, configDefaults) {
  // Create directory
  const configPath = path.join(process.cwd(), configDirectory)
  if (!fs.existsSync(configPath)) {
    console.log('\nCreate directory ' + configDirectory)
    fs.mkdirSync(configPath)
  }
  // Create Config File
  const configJSON = JSON.stringify(configDefaults)
  const configFilePath = path.join(configDirectory, configFileName)
  if (!fs.existsSync(configFilePath)) {
    console.log('Create config file ' + configFilePath)
    fs.writeFileSync(configFilePath, configJSON, { encoding: 'utf-8' })
  }

  const defaultTemplatePath = path.join(configDirectory, 'templates')
  if (!fs.existsSync(defaultTemplatePath)) {
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

/**
 * @param {string} resolvedTemplatePath
 * @param {string} name
 * @param {string} componentType
 * @param {string} relativeDestinationPath
 * @param {string} destinationPath
 * @param {string} endMessage
 * @param {string} nameStyle
 * @return {any}
 */
function generateFiles(
  resolvedTemplatePath,
  name,
  componentType,
  relativeDestinationPath,
  destinationPath,
  endMessage,
  nameStyle = 'pascalCase',
) {
  const upperCamelCaseName = toUpperCamelCase(name)
  let resultingName

  switch(nameStyle) {
  case 'kebabCase':
    resultingName = name
    break
  default:
    resultingName = upperCamelCaseName
    break
  }

  return gulp.src(resolvedTemplatePath)
    .pipe(gulpTemplate({
      name: name,
      componentType: componentType ? toTitleCase(componentType) : 'Component',
      upperCamelCaseName,
      pascalCaseName: upperCamelCaseName,
      lowerCamelCaseName: toFirstLetterLowerCase(upperCamelCaseName),
      destinationPath: relativeDestinationPath,
    }))
    .pipe(rename((path) => {
      path.basename = path.basename.replace('ComponentTemplate', resultingName)
    }))
    .pipe(gulp.dest(destinationPath))
    .on('end', function () {
      console.log(endMessage)
    })
}

/**
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} name
 * @param {string | null} componentType
 * @param {string} flavour
 * @param {Array<string>} availableFlavours
 * @param {string} nameStyle
 * @return {any}
 */
export function generateComponentFiles(fullTemplatePath, componentPath, name, componentType, flavour, availableFlavours, nameStyle = 'pascalCase') {
  const validationResult = validateKebabCaseName(name) // returns true or message
  if (validationResult !== true) {
    console.error(validationResult)
    throw new Error('name is invalid')
  }

  const effectiveFlavour = (flavour || DEFAULT_FLAVOUR_NAME).trim()

  if (!availableFlavours.includes(effectiveFlavour)) {
    console.error(`flavour '${effectiveFlavour}' does not exist, choose one of: ${availableFlavours}`)
    throw new Error('flavour not found')
  }

  const upperCamelCaseName = toUpperCamelCase(name)

  let replacedNameInPath
  switch(nameStyle) {
  case 'kebabCase':
    replacedNameInPath = name
    break
  default:
    replacedNameInPath = upperCamelCaseName
    break
  }

  const relativeDestinationPath = componentType ? path.join(componentType, replacedNameInPath) : upperCamelCaseName
  const destinationPath = path.join(componentPath, relativeDestinationPath)
  const resolvedTemplatePath = path.join(
    fullTemplatePath,
    effectiveFlavour,
    'ComponentTemplate/**/*.**',
  )

  const endMessage = `Component '${destinationPath}' was created.`
  return generateFiles(resolvedTemplatePath, name, componentType, relativeDestinationPath, destinationPath, endMessage, nameStyle)
}

/**
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} name
 * @param {string} componentType
 * @param {string} flavour
 * @param {Array<string>} availableFlavours
 * @param {string} nameStyle
 */
export function generateFilesIfNotExistAlready(fullTemplatePath, componentPath, name, componentType, flavour, availableFlavours, nameStyle = 'pascalCase') {
  const upperCamelCaseName = toUpperCamelCase(name)

  let replacedNameInPath
  switch(nameStyle) {
  case 'kebabCase':
    replacedNameInPath = name
    break
  default:
    replacedNameInPath = upperCamelCaseName
    break
  }

  const relativeDestinationPath = componentType ? path.join(componentType, replacedNameInPath) : replacedNameInPath
  const destinationPath = path.join(componentPath, relativeDestinationPath)

  validateDirectoryExists(destinationPath) // throws error if failed

  const effectiveFlavour = (flavour || 'default').trim()

  if (!availableFlavours.includes(effectiveFlavour)) {
    throw new Error(`flavour '${effectiveFlavour}' does not exist, choose one of: ${availableFlavours}`)
  }

  const existingFiles = getFiles(destinationPath)
  const templateFiles = getFiles(path.join(fullTemplatePath, effectiveFlavour, 'ComponentTemplate'))

  const filesToAdd = templateFiles.filter(fileName => {
    const tmpName = fileName.replace('ComponentTemplate', upperCamelCaseName)
    return !existingFiles.includes(tmpName)
  })

  filesToAdd.forEach((newFile) => {
    const resolvedTemplatePath = path.join(
      fullTemplatePath,
      effectiveFlavour,
      'ComponentTemplate/**/' + newFile,
    )

    const endMessage = `New file '${newFile.replace('ComponentTemplate', upperCamelCaseName)}' created`
    generateFiles(resolvedTemplatePath, name, componentType, relativeDestinationPath, destinationPath, endMessage, nameStyle)
  })
}
