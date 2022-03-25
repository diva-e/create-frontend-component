'use strict'

const gulp = require('gulp')
const path = require('path')
const rename = require('gulp-rename')
const template = require('gulp-template')
const { toTitleCase, toFirstLetterLowerCase, toUpperCamelCase, validateKebabCaseName, validateDirectoryExists, getFiles } = require('./utilities')

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
 * @param {string} componentType 
 * @param {string} flavour
 * @param {Array<string>} availableFlavours
 * @return {any}
 */
function generateComponentFiles (fullTemplatePath, componentPath, name, componentType, flavour, availableFlavours) {
  validateKebabCaseName(name) // throws error if failed

  const effectiveFlavour = (flavour || 'default').trim()

  if (!availableFlavours.includes(effectiveFlavour)) {
    throw new Error(`flavour '${effectiveFlavour}' does not exist, choose one of: ${availableFlavours}`)
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
  const existingFileExtensions = existingFiles.map(fileName => fileName.split(upperCamelCaseName + '.')[1])

  const templateFiles = getFiles(path.join(fullTemplatePath, effectiveFlavour, 'ComponentTemplate'))
  const templateFilesExtensions = templateFiles.map(fileName => fileName.split('ComponentTemplate.')[1])

  templateFilesExtensions.forEach((extension) => {
    if (!existingFileExtensions.includes(extension)) {
      const resolvedTemplatePath = path.join(
        fullTemplatePath,
        effectiveFlavour,
        'ComponentTemplate/**/*.' + extension
      )

      const endMessage = `New file '${destinationPath}.${extension} created`
      generateFiles(resolvedTemplatePath, name, componentType, upperCamelCaseName, relativeDestinationPath, destinationPath, endMessage)
    }
  })
}

exports.generateComponentFiles = generateComponentFiles
exports.generateFilesIfNotExistAlready = generateFilesIfNotExistAlready
