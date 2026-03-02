import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import { globSync } from 'glob'

const { copySync } = fsExtra

/**
 * @param {string} dirPath
 */
export function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * @param {string} content
 * @param {object} data
 * @return {string}
 */
export function processTemplate(content, data) {
  const templateRegex = /<%=([^=]+)%>/g
  return content.replace(templateRegex, (match, variable) => {
    const varName = variable.trim()
    return data[varName] !== undefined ? data[varName] : match
  })
}

/**
 * @param {object} options
 * @param {string} options.sourcePattern
 * @param {string} options.destinationPath
 * @param {object} options.templateData
 * @param {function} options.fileRenameFn
 * @param {function} options.onComplete
 */
export function copyTemplateFiles(options) {
  const {
    sourcePattern,
    destinationPath,
    templateData,
    fileRenameFn,
    onComplete,
  } = options

  createDirectoryIfNotExists(destinationPath)

  const normalizedPattern = sourcePattern.split(path.sep).join('/')
  const basePath = normalizedPattern.replace('/**/*.*', '').replace('/**/*', '')
  const files = globSync(normalizedPattern)

  files.forEach((filePath) => {
    const normalizedFilePath = filePath.split(path.sep).join('/')
    const relativePath = path.relative(basePath, normalizedFilePath)
    const dir = path.dirname(relativePath)
    const basename = path.basename(normalizedFilePath)

    const newBasename = fileRenameFn ? fileRenameFn(basename) : basename
    const finalDir = dir === '.' ? destinationPath : path.join(destinationPath, dir)

    createDirectoryIfNotExists(finalDir)

    const destFilePath = path.join(finalDir, newBasename)

    let content = fs.readFileSync(filePath, 'utf-8')
    content = processTemplate(content, templateData)

    fs.writeFileSync(destFilePath, content, 'utf-8')
  })

  if (onComplete) {
    onComplete()
  }
}

/**
 * @param {string} presetPath
 * @param {string} configDirectory
 * @param {string} configFileName
 * @param {object} configDefaults
 */
export function initProjectInWorkingDirectory(presetPath, configDirectory, configFileName, configDefaults) {
  const configPath = path.join(process.cwd(), configDirectory)
  if (!fs.existsSync(configPath)) {
    console.log('\nCreate directory ' + configDirectory)
    fs.mkdirSync(configPath)
  }

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
 * @param {string} dirPath
 * @return {Array<string>}
 */
export function getFilesRecursively(dirPath) {
  const files = []
  const items = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name)
    if (item.isDirectory()) {
      files.push(...getFilesRecursively(fullPath))
    } else {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * @param {object} options
 */
export function generateFiles(options) {
  const {
    resolvedTemplatePath,
    name,
    componentType,
    relativeDestinationPath,
    destinationPath,
    endMessage,
    nameStyle = 'pascalCase',
    toUpperCamelCase,
    toTitleCase,
    toFirstLetterLowerCase,
  } = options

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

  const templateData = {
    name: name,
    componentType: componentType ? toTitleCase(componentType) : 'Component',
    upperCamelCaseName,
    pascalCaseName: upperCamelCaseName,
    lowerCamelCaseName: toFirstLetterLowerCase(upperCamelCaseName),
    destinationPath: relativeDestinationPath,
  }

  const fileRenameFn = (basename) => {
    return basename.replace('ComponentTemplate', resultingName)
  }

  copyTemplateFiles({
    sourcePattern: resolvedTemplatePath,
    destinationPath,
    templateData,
    fileRenameFn,
    onComplete: () => {
      console.log('\n')
      console.log(endMessage)
    },
  })
}

/**
 * @param {object} options
 * @return {any}
 */
export function generateComponentFiles(options) {
  const {
    fullTemplatePath,
    componentPath,
    name,
    componentType,
    flavour,
    availableFlavours,
    nameStyle = 'pascalCase',
    validateKebabCaseName,
    toUpperCamelCase,
  } = options

  const validationResult = validateKebabCaseName(name)
  if (validationResult !== true) {
    console.error(validationResult)
    throw new Error('name is invalid')
  }

  const effectiveFlavour = (flavour || 'default').trim()

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

  const relativeDestinationPath = componentType ? path.join(componentType, replacedNameInPath) : replacedNameInPath
  const destinationPath = path.join(componentPath, relativeDestinationPath)
  const resolvedTemplatePath = path.join(
    fullTemplatePath,
    effectiveFlavour,
    'ComponentTemplate',
    '**',
    '*.*'
  ).split(path.sep).join('/')

  const endMessage = `Component '${destinationPath}' was created.`

  return generateFiles({
    resolvedTemplatePath,
    name,
    componentType,
    relativeDestinationPath,
    destinationPath,
    endMessage,
    nameStyle,
    toUpperCamelCase,
    toTitleCase: (val) => val.charAt(0).toUpperCase() + val.slice(1),
    toFirstLetterLowerCase: (val) => val.charAt(0).toLowerCase() + val.slice(1),
  })
}

/**
 * @param {object} options
 */
export function generateFilesIfNotExistAlready(options) {
  const {
    fullTemplatePath,
    componentPath,
    name,
    componentType,
    flavour,
    availableFlavours,
    nameStyle = 'pascalCase',
    validateDirectoryExists,
    getFiles,
    toUpperCamelCase,
  } = options

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

  validateDirectoryExists(destinationPath)

  const effectiveFlavour = (flavour || 'default').trim()

  if (!availableFlavours.includes(effectiveFlavour)) {
    throw new Error(`flavour '${effectiveFlavour}' does not exist, choose one of: ${availableFlavours}`)
  }

  const existingFiles = getFiles(destinationPath)
  const templateFilesDir = path.join(fullTemplatePath, effectiveFlavour, 'ComponentTemplate')
  const templateFiles = getFiles(templateFilesDir)

  const filesToAdd = templateFiles.filter(fileName => {
    const tmpName = fileName.replace('ComponentTemplate', replacedNameInPath)
    return !existingFiles.includes(tmpName)
  })

  filesToAdd.forEach((newFile) => {
    const resolvedTemplatePath = path.join(
      fullTemplatePath,
      effectiveFlavour,
      'ComponentTemplate',
      '**',
      newFile,
    ).split(path.sep).join('/')

    const endMessage = `New file '${newFile.replace('ComponentTemplate', replacedNameInPath)}' created`
    generateFiles({
      resolvedTemplatePath,
      name,
      componentType,
      relativeDestinationPath,
      destinationPath,
      endMessage,
      nameStyle,
      toUpperCamelCase,
      toTitleCase: (val) => val.charAt(0).toUpperCase() + val.slice(1),
      toFirstLetterLowerCase: (val) => val.charAt(0).toLowerCase() + val.slice(1),
    })
  })
}
