import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  processTemplate,
  createDirectoryIfNotExists,
  copyTemplateFiles,
  getFilesRecursively,
} from './file-generator.js'

describe('processTemplate', () => {
  it('should replace template variables with data', () => {
    const content = 'Hello <%= name %>, you are <%= age %> years old.'
    const data = { name: 'World', age: '30' }
    const result = processTemplate(content, data)
    assert.strictEqual(result, 'Hello World, you are 30 years old.')
  })

  it('should replace multiple occurrences of the same variable', () => {
    const content = '<%= name %> is <%= name %>'
    const data = { name: 'Alice' }
    const result = processTemplate(content, data)
    assert.strictEqual(result, 'Alice is Alice')
  })

  it('should not replace variables not in data', () => {
    const content = 'Hello <%= name %>, you are <%= age %> years old.'
    const data = { name: 'World' }
    const result = processTemplate(content, data)
    assert.strictEqual(result, 'Hello World, you are <%= age %> years old.')
  })

  it('should handle empty content', () => {
    const content = ''
    const data = { name: 'World' }
    const result = processTemplate(content, data)
    assert.strictEqual(result, '')
  })

  it('should handle variables with spaces', () => {
    const content = '<%= upperCamelCaseName %>'
    const data = { upperCamelCaseName: 'MyComponent' }
    const result = processTemplate(content, data)
    assert.strictEqual(result, 'MyComponent')
  })
})

describe('createDirectoryIfNotExists', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `test-${Date.now()}`)
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
  })

  it('should create directory if it does not exist', () => {
    const newDir = path.join(tempDir, 'new', 'nested', 'dir')
    createDirectoryIfNotExists(newDir)
    assert.strictEqual(fs.existsSync(newDir), true)
  })

  it('should not throw if directory already exists', () => {
    fs.mkdirSync(tempDir)
    assert.doesNotThrow(() => createDirectoryIfNotExists(tempDir))
  })
})

describe('copyTemplateFiles', () => {
  let tempDir: string
  let sourceDir: string
  let destDir: string

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `test-${Date.now()}`)
    sourceDir = path.join(tempDir, 'source')
    destDir = path.join(tempDir, 'dest')
    fs.mkdirSync(sourceDir, { recursive: true })
    fs.mkdirSync(destDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
  })

  it('should copy and transform a single file', () => {
    const templateFile = path.join(sourceDir, 'ComponentTemplate.jsx')
    fs.writeFileSync(templateFile, 'function <%= upperCamelCaseName %>() {}', 'utf-8')

    let completeCalled = false
    copyTemplateFiles({
      sourcePattern: path.join(sourceDir, '**', '*.*'),
      destinationPath: destDir,
      templateData: { upperCamelCaseName: 'MyComponent' },
      fileRenameFn: (basename) => basename.replace('ComponentTemplate', 'MyComponent'),
      onComplete: () => { completeCalled = true },
    })

    const expectedFile = path.join(destDir, 'MyComponent.jsx')
    assert.strictEqual(fs.existsSync(expectedFile), true)
    assert.strictEqual(fs.readFileSync(expectedFile, 'utf-8'), 'function MyComponent() {}')
    assert.strictEqual(completeCalled, true)
  })

  it('should handle multiple files in subdirectories', () => {
    const subDir = path.join(sourceDir, 'subfolder')
    fs.mkdirSync(subDir)
    fs.writeFileSync(path.join(subDir, 'ComponentTemplate.css'), '.<%= name %> {}')
    fs.writeFileSync(path.join(sourceDir, 'ComponentTemplate.jsx'), 'export default <%= upperCamelCaseName %>')

    copyTemplateFiles({
      sourcePattern: path.join(sourceDir, '**', '*.*'),
      destinationPath: destDir,
      templateData: { name: 'button', upperCamelCaseName: 'Button' },
      fileRenameFn: (basename) => basename.replace('ComponentTemplate', 'Button'),
    })

    assert.strictEqual(fs.existsSync(path.join(destDir, 'Button.jsx')), true)
    assert.strictEqual(fs.existsSync(path.join(destDir, 'subfolder', 'Button.css')), true)
    assert.strictEqual(fs.readFileSync(path.join(destDir, 'subfolder', 'Button.css'), 'utf-8'), '.button {}')
  })

  it('should create destination directory if it does not exist', () => {
    const nonExistentDest = path.join(tempDir, 'nonexistent', 'dest')
    const templateFile = path.join(sourceDir, 'ComponentTemplate.txt')
    fs.writeFileSync(templateFile, 'content')

    copyTemplateFiles({
      sourcePattern: path.join(sourceDir, '**', '*.*'),
      destinationPath: nonExistentDest,
      templateData: {},
      fileRenameFn: (basename) => basename,
    })

    assert.strictEqual(fs.existsSync(nonExistentDest), true)
  })

  it('should not modify original template files', () => {
    const templateFile = path.join(sourceDir, 'ComponentTemplate.jsx')
    const originalContent = 'function <%= upperCamelCaseName %>() {}'
    fs.writeFileSync(templateFile, originalContent, 'utf-8')

    copyTemplateFiles({
      sourcePattern: path.join(sourceDir, '**', '*.*'),
      destinationPath: destDir,
      templateData: { upperCamelCaseName: 'MyComponent' },
      fileRenameFn: (basename) => basename.replace('ComponentTemplate', 'MyComponent'),
    })

    assert.strictEqual(fs.readFileSync(templateFile, 'utf-8'), originalContent)
  })
})

describe('getFilesRecursively', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `test-${Date.now()}`)
    fs.mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
  })

  it('should return all files in directory and subdirectories', () => {
    fs.writeFileSync(path.join(tempDir, 'file1.txt'), 'content1')
    fs.mkdirSync(path.join(tempDir, 'subdir'))
    fs.writeFileSync(path.join(tempDir, 'subdir', 'file2.txt'), 'content2')

    const files = getFilesRecursively(tempDir)
    assert.strictEqual(files.length, 2)
    assert.ok(files.some(f => f.endsWith('file1.txt')))
    assert.ok(files.some(f => f.endsWith('file2.txt')))
  })

  it('should return empty array for empty directory', () => {
    const files = getFilesRecursively(tempDir)
    assert.strictEqual(files.length, 0)
  })

  it('should not include directories in the result', () => {
    fs.mkdirSync(path.join(tempDir, 'subdir'))
    const files = getFilesRecursively(tempDir)
    assert.strictEqual(files.length, 0)
  })
})

describe('Integration: Full component generation flow', () => {
  let tempDir: string
  let templateDir: string
  let outputDir: string

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `test-integration-${Date.now()}`)
    templateDir = path.join(tempDir, 'templates', 'react', 'ComponentTemplate')
    outputDir = path.join(tempDir, 'output')
    fs.mkdirSync(templateDir, { recursive: true })
    fs.mkdirSync(outputDir, { recursive: true })

    fs.writeFileSync(
      path.join(templateDir, 'ComponentTemplate.jsx'),
      `import './<%= upperCamelCaseName %>.css';

function <%= upperCamelCaseName %>(props) {
  return (
    <div className="<%= name %>"></div>
  );
}

export default <%= upperCamelCaseName %>;
`,
      'utf-8'
    )
    fs.writeFileSync(
      path.join(templateDir, 'ComponentTemplate.css'),
      '.<%= name %> {}',
      'utf-8'
    )
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
  })

  it('should generate component files with correct content', () => {
    const sourcePattern = path.join(templateDir, '**', '*.*')

    copyTemplateFiles({
      sourcePattern,
      destinationPath: outputDir,
      templateData: {
        name: 'my-button',
        upperCamelCaseName: 'MyButton',
        componentType: 'atoms',
        pascalCaseName: 'MyButton',
        lowerCamelCaseName: 'myButton',
      },
      fileRenameFn: (basename) => basename.replace('ComponentTemplate', 'MyButton'),
    })

    const jsxFile = path.join(outputDir, 'MyButton.jsx')
    const cssFile = path.join(outputDir, 'MyButton.css')

    assert.strictEqual(fs.existsSync(jsxFile), true, 'JSX file should exist')
    assert.strictEqual(fs.existsSync(cssFile), true, 'CSS file should exist')

    const jsxContent = fs.readFileSync(jsxFile, 'utf-8')
    assert.ok(jsxContent.includes('function MyButton(props)'))
    assert.ok(jsxContent.includes('className="my-button"'))
    assert.ok(jsxContent.includes('import \'./MyButton.css\''))
    assert.ok(jsxContent.includes('export default MyButton'))

    const cssContent = fs.readFileSync(cssFile, 'utf-8')
    assert.strictEqual(cssContent, '.my-button {}')
  })

  it('should handle kebab-case name style correctly', () => {
    const sourcePattern = path.join(templateDir, '**', '*.*')

    copyTemplateFiles({
      sourcePattern,
      destinationPath: outputDir,
      templateData: {
        name: 'my-button',
        upperCamelCaseName: 'MyButton',
        componentType: 'atoms',
        pascalCaseName: 'MyButton',
        lowerCamelCaseName: 'myButton',
      },
      fileRenameFn: (basename) => basename.replace('ComponentTemplate', 'my-button'),
    })

    const jsxFile = path.join(outputDir, 'my-button.jsx')
    assert.strictEqual(fs.existsSync(jsxFile), true)
  })
})
