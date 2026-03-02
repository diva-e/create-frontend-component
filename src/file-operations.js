'use strict'

import {
  getFiles,
  toUpperCamelCase,
  validateDirectoryExists,
  validateKebabCaseName,
} from './utilities.js'

import {
  initProjectInWorkingDirectory,
  generateComponentFiles,
  generateFilesIfNotExistAlready,
} from './file-generator.js'


export {
  initProjectInWorkingDirectory,
  generateComponentFiles,
  generateFilesIfNotExistAlready,
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
export function generateComponentFilesWithDeps(fullTemplatePath, componentPath, name, componentType, flavour, availableFlavours, nameStyle = 'pascalCase') {
  return generateComponentFiles({
    fullTemplatePath,
    componentPath,
    name,
    componentType,
    flavour,
    availableFlavours,
    nameStyle,
    validateKebabCaseName,
    toUpperCamelCase,
  })
}

/**
 * @param {string} fullTemplatePath
 * @param {string} componentPath
 * @param {string} name
 * @param {string} componentType
 * @param {string} flavour
 * @param {Array<string>} availableFlavours
 * @param {string} nameStyle
 * @return {any}
 */
export function generateFilesIfNotExistAlreadyWithDeps(fullTemplatePath, componentPath, name, componentType, flavour, availableFlavours, nameStyle = 'pascalCase') {
  return generateFilesIfNotExistAlready({
    fullTemplatePath,
    componentPath,
    name,
    componentType,
    flavour,
    availableFlavours,
    nameStyle,
    validateDirectoryExists,
    getFiles,
    toUpperCamelCase,
  })
}
