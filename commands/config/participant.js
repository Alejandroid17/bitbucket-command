import inquirer from 'inquirer'
import { Command } from 'commander'

import { UPDATE_OPTIONS, getConfiguration, updateConfiguration } from '../utils/configuration-util.js'

const participantConfigCommand = new Command('participant')

const PARTICIPANT_CONFIG_COMMAND = {
  LIST: 'list',
  ADD: 'add',
  DELETE: 'delete'
}

participantConfigCommand.command(PARTICIPANT_CONFIG_COMMAND.LIST)
  .action(async () => {
    const configuration = await getConfiguration()
    const { participants } = configuration

    if (Object.keys(participants).length === 0) console.log('No participants configured.')

    for (const [key, value] of Object.entries(participants)) {
      console.log({ key, data: value })
    }
  })

participantConfigCommand.command(PARTICIPANT_CONFIG_COMMAND.ADD)
  .action(async () => {
    const questionList = [
      { type: 'input', name: 'bitbucketId', message: 'Write the bitbucket id ({user_uuid}):' },
      { type: 'input', name: 'fullName', message: 'Write the full name:' },
      { type: 'input', name: 'slackId', message: 'Write the slack id:' }
    ]

    inquirer.prompt(questionList).then((answers) => {
      updateConfiguration({ [answers.bitbucketId]: { fullName: answers.fullName, slackId: answers.slackId } }, UPDATE_OPTIONS.ADD, 'participants')
    })
  })

participantConfigCommand.command(PARTICIPANT_CONFIG_COMMAND.DELETE)
  .action(async () => {
    const questionList = [
      { type: 'input', name: 'bitbucketId', message: 'Write the bitbucket id ({user_uuid}):' }
    ]

    inquirer.prompt(questionList).then((answers) => {
      updateConfiguration(answers.bitbucketId, UPDATE_OPTIONS.DELETE, 'participants')
    })
  })

export default participantConfigCommand
export { PARTICIPANT_CONFIG_COMMAND }
