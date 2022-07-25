'use strict'

const gulp = require('gulp')
const path = require('path')
const rename = require('gulp-rename')
const template = require('gulp-template')
const { toTitleCase, toFirstLetterLowerCase, toUpperCamelCase, validateKebabCaseName, validateDirectoryExists, getFiles } = require('./utilities')
const fs = require('fs')
const { copySync } = require('fs-extra')

const DEFAULT_FLAVOUR_NAME = 'default'

/**
 * Creates config directory and adds config file
 *
 * @param {string} presetPath
 * @param {string} configDirectory
 * @param {string} configFileName
 * @param {object} configDefaults
 */
function initProjectInWorkingDirectory(presetPath, configDirectory, configFileName, configDefaults) {
  // Create directory
  const configPath = path.join(process.cwd(), configDirectory)
  if (!fs.existsSync(configPath)){
    console.log('\nCreate directory ' + configDirectory)
    fs.mkdirSync(configPath)
  }
  // Create Config File
  const configJSON = JSON.stringify(configDefaults)
  const configFilePath = path.join(configDirectory, configFileName)
  if (!fs.existsSync(configFilePath)){
    console.log('Create config file ' + configFilePath)
    fs.writeFileSync(configFilePath, configJSON, { encoding: 'utf-8' })
  }

  const defaultTemplatePath = path.join(configDirectory, 'templates')
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

/**
 * @param {string} resolvedTemplatePath
 * @param {string} name
 * @param {string} componentType
 * @param {string} upperCamelCaseName
 * @param {string} relativeDestinationPath
 * @param {string} destinationPath
 * @param {string} endMessage
 * @return {any}
 */
function generateFiles(resolvedTemplatePath, name, componentType, upperCamelCaseName, relativeDestinationPath, destinationPath, endMessage) {
  return gulp.src(resolvedTemplatePath)
    .pipe(template({
      name: name,
      componentType: componentType ? toTitleCase(componentType) : 'Component',
      upperCamelCaseName: upperCamelCaseName,
      lowerCamelCaseName: toFirstLetterLowerCase(toUpperCamelCase(name)),
      destinationPath: relativeDestinationPath,
    }))
    .pipe(rename((path) => {
      path.basename = path.basename.replace('ComponentTemplate', upperCamelCaseName)
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
 * @return {any}
 */
function generateComponentFiles (fullTemplatePath, componentPath, name, componentType, flavour, availableFlavours) {
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
  const relativeDestinationPath = componentType ? path.join(componentType, upperCamelCaseName) : upperCamelCaseName
  const destinationPath = path.join(componentPath, relativeDestinationPath)
  const resolvedTemplatePath = path.join(
    fullTemplatePath,
    effectiveFlavour,
    'ComponentTemplate/**/*.**'
  )

  const endMessage = `Component '${destinationPath}' was created.`
  return generateFiles(resolvedTemplatePath, name, componentType, upperCamelCaseName, relativeDestinationPath, destinationPath, endMessage)
}

/**
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} name
 * @param {string} componentType
 * @param {string} flavour
 * @param {Array<string>} availableFlavours
 */
function generateFilesIfNotExistAlready (fullTemplatePath, componentPath, name, componentType, flavour, availableFlavours) {
  const upperCamelCaseName = toUpperCamelCase(name)
  const relativeDestinationPath = componentType ? path.join(componentType, upperCamelCaseName) : upperCamelCaseName
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
      'ComponentTemplate/**/' + newFile
    )

    const endMessage = `New file '${newFile.replace('ComponentTemplate', upperCamelCaseName)}' created`
    generateFiles(resolvedTemplatePath, name, componentType, upperCamelCaseName, relativeDestinationPath, destinationPath, endMessage)
  })
}

module.exports = {
  generateComponentFiles,
  generateFilesIfNotExistAlready,
  initProjectInWorkingDirectory
}
