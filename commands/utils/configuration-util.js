import fs from 'fs'
import extend from 'just-extend'
import merge from 'just-merge'

const DEFAULT_CONFIGURATION_PATH = './bitbucket-command-config.json'

async function checkConfiguration () {
  const exists = fs.existsSync(DEFAULT_CONFIGURATION_PATH)
  if (!exists) {
    throw Error('No configuration detected. Execute "node index.js auth-config"')
  }
}

const UPDATE_OPTIONS = {
  EXTEND: 'extend',
  MERGE: 'merge',
  ADD: 'add',
  DELETE: 'delete'
}

async function updateConfiguration (data, updateOption, key = null) {
  const exists = fs.existsSync(DEFAULT_CONFIGURATION_PATH)
  if (!exists) fs.writeFileSync(DEFAULT_CONFIGURATION_PATH, JSON.stringify({}))

  const content = fs.readFileSync(DEFAULT_CONFIGURATION_PATH, 'utf8')
  let jsonContent = JSON.parse(content)

  switch (updateOption) {
    case UPDATE_OPTIONS.MERGE:
      merge(jsonContent, data)
      break
    case UPDATE_OPTIONS.EXTEND:
      extend(jsonContent, data)
      break
    case UPDATE_OPTIONS.ADD:
      jsonContent = { ...jsonContent, [key]: { ...jsonContent[key], ...data } }
      break
    case UPDATE_OPTIONS.DELETE:
      delete jsonContent[key][data]
      break
  }

  fs.writeFileSync(DEFAULT_CONFIGURATION_PATH, JSON.stringify(jsonContent, null, '  '))
}

async function getConfiguration () {
  const content = fs.readFileSync(DEFAULT_CONFIGURATION_PATH, 'utf8')
  return JSON.parse(content)
}

export {
  getConfiguration,
  checkConfiguration,
  updateConfiguration,
  DEFAULT_CONFIGURATION_PATH,
  UPDATE_OPTIONS
}
