const { readdirSync, existsSync } = require('fs')

/**
 * @param {string} source
 * @return {Array}
 */
function getDirectories(source) {
  return readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

/**
 * @param {string} path
 * @return {Array}
 */
function getFiles(path) {
  return readdirSync(path, { withFileTypes: true })
    .filter(obj => obj.isFile())
    .map(file => file.name)
}

/**
 * @param {string} val
 * @return {string}
 */
function toTitleCase(val) {
  return val.charAt(0).toUpperCase() + val.slice(1)
}

/**
 * @param {string} val
 * @return {string}
 */
function toFirstLetterLowerCase(val) {
  return val.charAt(0).toLowerCase() + val.slice(1)
}

/**
 * @param {string} val
 * @return {string}
 */
function toUpperCamelCase(val) {
  return val.split('-').map(
    (part) => toTitleCase(part),
  ).join('')
}

/**
 * @param {string} name
 * @return {string | boolean}
 */
function validateKebabCaseName(name) {
  if (name !== name.toLowerCase() || name.indexOf('_') !== -1 || name.indexOf(' ') !== -1) {
    return `component name '${name}' is not allowed, please use kebab case names eg. foo-bar-toolbar`
  }

  return true
}

/**
 * @param {string} destinationPath
 */
function validateDirectoryExists(destinationPath) {
  if (!existsSync(destinationPath)) {
    throw new Error(`'${destinationPath}' does not exist, please try again`)
  }
}

module.exports = {
  getDirectories,
  getFiles,
  toTitleCase,
  toFirstLetterLowerCase,
  toUpperCamelCase,
  validateKebabCaseName,
  validateDirectoryExists,
}
