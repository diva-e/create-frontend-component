import prompts from 'prompts'

export type Validator = (value: string) => string | true

export async function promptText(message: string, validator?: Validator): Promise<string> {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: message,
    validate: validator
  })

  if (response.value === undefined) {
    throw new Error('failed to prompt text')
  }

  return response.value
}

export async function promptSingleSelect(message: string, choices: string[]): Promise<string> {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: message,
    choices: choices.map((choice: string) => ({ title: choice, value: choice }))
  })

  if (response.value === undefined) {
    throw new Error('failed to prompt option')
  }

  return response.value
}
