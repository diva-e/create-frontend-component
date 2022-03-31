
# create-frontend-component

Framework-agnostic utility to scaffold frontend components by using custom templates.

| [Contributing](/CONTRIBUTING.md) | [Changelog](/CHANGELOG.md) | [Powered by diva-e](https://www.diva-e.com)  |
|----------------------------------| --- |----------------------------------------------|

[![GitHub stars](https://img.shields.io/github/stars/diva-e/create-frontend-component.svg?style=social&label=Star)](https://github.com/diva-e/create-frontend-component)

## Getting Started

### Init (creates directories and configuration file)

```bash
npx create-frontend-component init
```

You will be prompted to choose a preset which will be copied to your templates directory.

A config file and `.create-frontend-component` directory will be created aswell.

### Configuration

Init creates the  `.create-frontend-component/config.json` config file.
Edit _config.json_ until it fits your needs, the following options are available:

* **types**: Set of component types which developers can choose from. They will be represented as a subdirectory in your components dir.
Set this to null if you don't categorize components.
* **templatePath**: Directory in which component templates live. The path is relative to the working directory.
* **componentPath**: Directory in which components will be generated. The path is relative to the working directory.

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

```bash
create-frontend-component foo-bar-toolbar --type molecules --flavour minimal
```

* Names must be written in lower case and with dash as word separator (kebab-case)
* Types may be configured in the config file

Component files will be generated under the configured component path.

### NPM-Script Usage

For convenience reasons you might want to add this tool to _package.json_ scripts.
However, the way to add cli parameters to npm scripts might be unintuitive for developers.
That is the reason we added the `prompt` subcommand.

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
    "create-component": "create-frontend-component prompt"
  }
}
```

When executing `npm run create-component` the user now will be prompted for all necessary parameters.

### Component upgrade

We have also introduced the command `create-frontend-component upgrade` that enables you the possibility
to change the flavour of a component, adding the files of the new flavour that are missing in the component.
Using this upgrade function, none of the existing files of a component will be removed.

## License

[MIT](LICENSE)
