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

module.exports = {
  getDirectories,
  toTitleCase,
  toFirstLetterLowerCase,
  toUpperCamelCase
}