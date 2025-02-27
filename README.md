
# create-frontend-component

> **Version 2.0** is out now! With updated dependencies, esmodules and a few improvements. Check the changelog for more info.

Framework-agnostic utility to scaffold frontend components by using custom templates.

| [Contributing](/CONTRIBUTING.md) | [Changelog](/CHANGELOG.md) | [Powered by diva-e](https://www.diva-e.com)  |
|----------------------------------| --- |----------------------------------------------|

[![GitHub stars](https://img.shields.io/github/stars/diva-e/create-frontend-component.svg?style=social&label=Star)](https://github.com/diva-e/create-frontend-component)

## Getting Started

### Initialization (Creates Directories and Configuration File)

```bash
npx create-frontend-component init
```

You will be prompted to choose a preset which will be copied to your templates directory.

A config file and `.create-frontend-component` directory will be created aswell.

### Configuration

The `init` command creates the `.create-frontend-component/config.json` configuration file.
Modify _config.json_ to suit your needs. The following options are available:

```json
{
    "types": ["atoms", "molecules", "organisms"],
    "templatePath": ".create-frontend-component/templates",
    "componentPath": "src/components",
    "nameStyle": "pascalCase"
}
```

* **types**:  A set of component types developers can choose from. Each type corresponds to a subdirectory in your components directory. 
Set this to null if you don't categorize components.
* **templatePath**:  Directory where templates of components reside (relative to the working directory).
* **componentPath**: Directory where components will be generated (relative to the working directory).
* **nameStyle**: Defines how file names and directories are renamed. Available styles: `kebabCase` and `pascalCase`. 

### Customize Component Templates

Your templates live under the template path specified in your configuration.
The templates directory might look similar to this:

```plantuml
├── default
│   └── ComponentTemplate
│       ├── ComponentTemplate.stories.mdx
│       └── ComponentTemplate.vue
└── minimal
    └── ComponentTemplate
        ├── ComponentTemplate.stories.mdx
        └── ComponentTemplate.vue
```

In this example we have two different component templates (default and minimal) we can use for generation.
This is what we call __component flavours__ (see _Usage_).

We also have directories called `ComponentTemplate` they will be renamed to the component name you specifiy in the cli.
This directory in turn may contain any desired files you need for component generation. This tool will copy those files, 
rename them and replace all placeholders. In this example a `.mdx` file and a `.vue` file would be generated.

## Usage

Interactive Mode (Prompt Mode):

```bash
npx create-frontend-component prompt
```

Alternatively you can pass parameters directly:

```bash
npx create-frontend-component foo-bar-toolbar --type molecules --flavour minimal
```

* Names must be written in lower case and with dash as word separator (kebab-case)
* Types may be configured in the config file

Component files will be generated under the configured component path.

### Using NPM Scripts

To simplify usage, you can add this tool as an NPM script in package.json.

```json
{
  "name": "foo-bar-project",
  "version": "1.0.0",
  "scripts": {
    "create-component": "npx create-frontend-component"
  }
}
```

Now, running `npm run create-component` will prompt the user for all necessary parameters.

#### Alternative Without npx

If you don't want to use npx for some reason, then it is possible to install the package as dev dependency and run the command without npx.
Please be aware that this approach leads to several issues on a npm audit.

First install the package as dev dependency:

```bash
npm install --save-dev create-frontend-component
```

Then add a script like this:

```json
{
  "name": "foo-bar-project",
  "version": "1.0.0",
  "scripts": {
    "create-component": "create-frontend-component"
  }
}
```

### Mixing Flavours

The create-frontend-component upgrade command allows you to change the flavour of a component.
It adds the missing files of the new flavour while preserving existing files.

````bash
npx create-frontend-component upgrade
````

* No existing files will be removed. 
* If conflicting files exist, they will remain unchanged.

## License

[MIT](LICENSE)
