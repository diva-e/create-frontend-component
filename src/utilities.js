const { readdirSync } = require('fs')

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
 * @param {string} name
 * @return {string}
 */
function validateKebabCaseName (name) {
  if (name !== name.toLowerCase() || name.indexOf('_') !== -1) {
    throw new Error(`component name '${name}' is not allowed, please use kebab case names eg. foo-bar-toolbar`)
  }

  return name
}

module.exports = {
  getDirectories,
  toTitleCase,
  toFirstLetterLowerCase,
  toUpperCamelCase,
  validateKebabCaseName
}
