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

export interface GenerateComponentFilesWithDepsOptions {
  fullTemplatePath: string
  componentPath: string
  name: string
  componentType: string | null
  flavour: string
  availableFlavours: string[]
  nameStyle?: string
}

export function generateComponentFilesWithDeps(
  fullTemplatePath: string,
  componentPath: string,
  name: string,
  componentType: string | null,
  flavour: string,
  availableFlavours: string[],
  nameStyle: string = 'pascalCase'
): void {
  generateComponentFiles({
    fullTemplatePath,
    componentPath,
    name,
    componentType,
    flavour,
    availableFlavours,
    nameStyle: nameStyle as 'pascalCase' | 'kebabCase',
    validateKebabCaseName,
    toUpperCamelCase,
  })
}

export interface GenerateFilesIfNotExistAlreadyWithDepsOptions {
  fullTemplatePath: string
  componentPath: string
  name: string
  componentType: string
  flavour: string
  availableFlavours: string[]
  nameStyle?: string
}

export function generateFilesIfNotExistAlreadyWithDeps(
  fullTemplatePath: string,
  componentPath: string,
  name: string,
  componentType: string,
  flavour: string,
  availableFlavours: string[],
  nameStyle: string = 'pascalCase'
): void {
  generateFilesIfNotExistAlready({
    fullTemplatePath,
    componentPath,
    name,
    componentType,
    flavour,
    availableFlavours,
    nameStyle: nameStyle as 'pascalCase' | 'kebabCase',
    validateDirectoryExists,
    getFiles,
    toUpperCamelCase,
  })
}
