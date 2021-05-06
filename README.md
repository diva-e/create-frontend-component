
# create-frontend-component

[Contributing](/CONTRIBUTING.md) | [Powered by diva-e](https://www.diva-e.com)
| --- | --- |

[![GitHub stars](https://img.shields.io/github/stars/diva-e/create-frontend-component.svg?style=social&label=Star)](https://github.com/diva-e/create-frontend-component)

## Getting Started

### Init (creates directories and configuration file)

```bash
npx create-frontend-component init
```

Creates directory structure and  `.create-frontend-component/config.json`

### Usage

```bash
create-frontend-component foo-bar-toolbar --type molecules --flavour minimal
```

* Names must be written in lower case and with dash as word separator (kebab-case)
* Types may be configured in the config file

Component files will be generated under the configured component path.
