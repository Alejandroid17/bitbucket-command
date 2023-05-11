import inquirer from 'inquirer'
import { Command } from 'commander'

import { UPDATE_OPTIONS, getConfiguration, updateConfiguration } from './utils/configuration-util.js'

const participantCommand = new Command('participant')

participantCommand.command('list')
  .action(async () => {
    const configuration = await getConfiguration()
    const { participants } = configuration

    if (Object.keys(participants).length === 0) console.log('No participants configured.')

    for (const [key, value] of Object.entries(participants)) {
      console.log({ key, data: value })
    }
  })

participantCommand.command('add')
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

participantCommand.command('delete')
  .action(async () => {
    const questionList = [
      { type: 'input', name: 'bitbucketId', message: 'Write the bitbucket id ({user_uuid}):' }
    ]

    inquirer.prompt(questionList).then((answers) => {
      updateConfiguration(answers.bitbucketId, UPDATE_OPTIONS.DELETE, 'participants')
    })
  })

export default participantCommand
