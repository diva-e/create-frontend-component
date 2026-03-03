import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import { globSync } from 'glob'

const { copySync } = fsExtra

export function createDirectoryIfNotExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

export function processTemplate(content: string, data: Record<string, string>): string {
  const templateRegex = /<%=([^=]+)%>/g
  return content.replace(templateRegex, (match: string, variable: string): string => {
    const varName = variable.trim()
    return data[varName] !== undefined ? data[varName] : match
  })
}

export type FileRenameFn = (basename: string) => string
export type OnCompleteFn = () => void

export interface CopyTemplateFilesOptions {
  sourcePattern: string
  destinationPath: string
  templateData: Record<string, string>
  fileRenameFn?: FileRenameFn
  onComplete?: OnCompleteFn
}

export function copyTemplateFiles(options: CopyTemplateFilesOptions): void {
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

  files.forEach((filePath: string) => {
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

export interface ConfigDefaults {
  types: string[] | null
  templatePath: string
  componentPath: string
  nameStyle: string
}

export function initProjectInWorkingDirectory(
  presetPath: string,
  configDirectory: string,
  configFileName: string,
  configDefaults: ConfigDefaults
): void {
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

export function getFilesRecursively(dirPath: string): string[] {
  const files: string[] = []
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

export type NameStyle = 'pascalCase' | 'kebabCase'
export type TransformFn = (val: string) => string

export interface GenerateFilesOptions {
  resolvedTemplatePath: string
  name: string
  componentType: string | null
  relativeDestinationPath: string
  destinationPath: string
  endMessage: string
  nameStyle?: NameStyle
  toUpperCamelCase: TransformFn
  toTitleCase: TransformFn
  toFirstLetterLowerCase: TransformFn
}

export function generateFiles(options: GenerateFilesOptions): void {
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
  let resultingName: string

  switch(nameStyle) {
  case 'kebabCase':
    resultingName = name
    break
  default:
    resultingName = upperCamelCaseName
    break
  }

  const templateData: Record<string, string> = {
    name: name,
    componentType: componentType ? toTitleCase(componentType) : 'Component',
    upperCamelCaseName,
    pascalCaseName: upperCamelCaseName,
    lowerCamelCaseName: toFirstLetterLowerCase(upperCamelCaseName),
    destinationPath: relativeDestinationPath,
  }

  const fileRenameFn = (basename: string): string => {
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

export interface GenerateComponentFilesOptions {
  fullTemplatePath: string
  componentPath: string
  name: string
  componentType: string | null
  flavour: string
  availableFlavours: string[]
  nameStyle?: NameStyle
  validateKebabCaseName: (name: string) => string | true
  toUpperCamelCase: TransformFn
}

export function generateComponentFiles(options: GenerateComponentFilesOptions): void {
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

  let replacedNameInPath: string
  switch(nameStyle) {
  case 'kebabCase':
    replacedNameInPath = name
    break
  default:
    replacedNameInPath = upperCamelCaseName
    break
  }

  const relativeDestinationPath = componentType ? path.join(componentType, replacedNameInPath) : replacedNameInPath
  const destinationPathResolved = path.join(componentPath, relativeDestinationPath)
  const resolvedTemplatePath = path.join(
    fullTemplatePath,
    effectiveFlavour,
    'ComponentTemplate',
    '**',
    '*.*'
  ).split(path.sep).join('/')

  const endMessage = `Component '${destinationPathResolved}' was created.`

  generateFiles({
    resolvedTemplatePath,
    name,
    componentType,
    relativeDestinationPath,
    destinationPath: destinationPathResolved,
    endMessage,
    nameStyle,
    toUpperCamelCase,
    toTitleCase: (val: string) => val.charAt(0).toUpperCase() + val.slice(1),
    toFirstLetterLowerCase: (val: string) => val.charAt(0).toLowerCase() + val.slice(1),
  })
}

export interface GenerateFilesIfNotExistAlreadyOptions {
  fullTemplatePath: string
  componentPath: string
  name: string
  componentType: string | null
  flavour: string
  availableFlavours: string[]
  nameStyle?: NameStyle
  validateDirectoryExists: (path: string) => void
  getFiles: (path: string) => string[]
  toUpperCamelCase: TransformFn
}

export function generateFilesIfNotExistAlready(options: GenerateFilesIfNotExistAlreadyOptions): void {
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

  let replacedNameInPath: string
  switch(nameStyle) {
  case 'kebabCase':
    replacedNameInPath = name
    break
  default:
    replacedNameInPath = upperCamelCaseName
    break
  }

  const relativeDestinationPath = componentType ? path.join(componentType, replacedNameInPath) : replacedNameInPath
  const destinationPathResolved = path.join(componentPath, relativeDestinationPath)

  validateDirectoryExists(destinationPathResolved)

  const effectiveFlavour = (flavour || 'default').trim()

  if (!availableFlavours.includes(effectiveFlavour)) {
    throw new Error(`flavour '${effectiveFlavour}' does not exist, choose one of: ${availableFlavours}`)
  }

  const existingFiles = getFiles(destinationPathResolved)
  const templateFilesDir = path.join(fullTemplatePath, effectiveFlavour, 'ComponentTemplate')
  const templateFiles = getFiles(templateFilesDir)

  const filesToAdd = templateFiles.filter((fileName: string) => {
    const tmpName = fileName.replace('ComponentTemplate', replacedNameInPath)
    return !existingFiles.includes(tmpName)
  })

  filesToAdd.forEach((newFile: string) => {
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
      destinationPath: destinationPathResolved,
      endMessage,
      nameStyle,
      toUpperCamelCase,
      toTitleCase: (val: string) => val.charAt(0).toUpperCase() + val.slice(1),
      toFirstLetterLowerCase: (val: string) => val.charAt(0).toLowerCase() + val.slice(1),
    })
  })
}
