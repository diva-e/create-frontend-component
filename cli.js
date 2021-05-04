#!/usr/bin/env node

const program = require('commander')
const { generateComponentFiles } = require('./src/gulpfile.js')
const fs = require('fs')
const path = require('path')

const configDefaults = {
  types: ['atoms', 'molecules', 'organisms'],
  templatePath: 'templates',
  componentPath: 'src/components'
}


/**
 * @param {string} filePath 
 * @return {object}
 */
function loadConfig() {
  const filePath = path.resolve(process.cwd(), '.create-frontend-component', 'config.json')
  const configFromFile = JSON.parse(
    fs.readFileSync(filePath, 'utf8').replace(/^\ufeff/u, '')
  )

  return {
    ...configDefaults,
    ...configFromFile
  }
}


program
  .version('1.0.0')
  .arguments('<component-name>')
  .option( '-t, --type <type>', 'Component type, default: atoms')
  .option( '-f, --flavour <flavour>', 'Component flavour')
  .action( function(componentName, env) {
    const { types, templatePath, componentPath } = loadConfig()
    const allowedComponentTypes = types || []

    if (env.type && allowedComponentTypes.length == 0) {
      throw new Error('component types are not configured in this project but found parameter "type"')
    }

    let componentType = env.type
    if (allowedComponentTypes.length === 0) {
      componentType = null
    } else if (!componentType) {
      // use first type as default
      componentType = allowedComponentTypes[0]
    } else {
      componentType = componentType.toLowerCase()
    }

    if (componentType && !allowedComponentTypes.includes(componentType)) {
      throw new Error(`component type '${componentType}' is not allowed, choose one of: ${allowedComponentTypes}`)
    }

    generateComponentFiles(templatePath, componentPath, componentName, componentType, env.flavour)
  })
  .parse(process.argv)
