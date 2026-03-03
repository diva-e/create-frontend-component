import { existsSync, readdirSync, Dirent } from 'fs'

export function getDirectories(source: string): string[] {
  return readdirSync(source, { withFileTypes: true })
    .filter((dirent: Dirent) => dirent.isDirectory())
    .map((dirent: Dirent) => dirent.name)
}

export function getFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((obj: Dirent) => obj.isFile())
    .map((file: Dirent) => file.name)
}

export function toTitleCase(val: string): string {
  return val.charAt(0).toUpperCase() + val.slice(1)
}

export function toFirstLetterLowerCase(val: string): string {
  return val.charAt(0).toLowerCase() + val.slice(1)
}

export function toUpperCamelCase(val: string): string {
  return val.split('-').map(
    (part: string) => toTitleCase(part),
  ).join('')
}

export type ValidationResult = string | true

export function validateKebabCaseName(name: string): ValidationResult {
  if (name !== name.toLowerCase() || name.indexOf('_') !== -1 || name.indexOf(' ') !== -1) {
    return `component name '${name}' is not allowed, please use kebab case names eg. foo-bar-toolbar`
  }

  return true
}

export function validateDirectoryExists(destinationPath: string): void {
  if (!existsSync(destinationPath)) {
    throw new Error(`'${destinationPath}' does not exist, please try again`)
  }
}
