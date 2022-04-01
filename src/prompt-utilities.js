const prompts = require('prompts')

/**
 * @param {string} message
 * @param {function} validator
 * @return {Promise<string>}
 */
async function promptText(message, validator) {
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

/**
 * @param {string} message
 * @param {Array<string>} choices
 * @return {Promise<string>}
 */
async function promptSingleSelect(message, choices) {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: message,
    choices: choices.map(choice => ({ choice, value: choice }))
  })

  if (response.value === undefined) {
    throw new Error('failed to prompt option')
  }

  return response.value
}

module.exports = {
  promptText,
  promptSingleSelect
}
