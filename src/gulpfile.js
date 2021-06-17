'use strict'

const gulp = require('gulp')
const path = require('path')
const rename = require('gulp-rename')
const template = require('gulp-template')

/**
 * @param {string} val 
 * @return {string}
 */
function toTitleCase (val) {
  return val.charAt(0).toUpperCase() + val.slice(1)
}

/**
 * @param {string} val 
 * @return {string} 
 */
function toFirstLetterLowerCase (val) {
  return val.charAt(0).toLowerCase() + val.slice(1)
}

/**
 * @param {string} val 
 * @return {string} 
 */
function toUpperCamelCase(val) {
  return val.split('-').map(
    (part) => toTitleCase(part)
  ).join('')
}

/**
 * @param {string} templatePath 
 * @param {string} componentPath 
 * @param {string} name 
 * @param {string} componentType 
 * @param {string} flavour 
 * @return {any}
 */
function generateComponentFiles (templatePath, componentPath, name, componentType, flavour) {
  if (name !== name.toLowerCase()) {
    throw new Error(`component name '${name}' is not allowed, please use kebab case names eg. foo-bar-toolbar`)
  }

  const upperCamelCaseName = toUpperCamelCase(name)
  const relativeDestinationPath = componentType ? path.join(componentType, upperCamelCaseName) : upperCamelCaseName
  const resolvedTemplatePath = path.join(
    process.cwd(),
    templatePath,
    flavour || 'default',
    'ComponentTemplate/**/*.**'
  )

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
    .pipe(gulp.dest(path.join(componentPath, relativeDestinationPath)))
}

exports.generateComponentFiles = generateComponentFiles
