import { Command } from 'commander'
import inquirer from 'inquirer'
import { UPDATE_OPTIONS, updateConfiguration } from './utils/configuration-util.js'
import participantCommand from './participant.js'

const configCommand = new Command('config')

configCommand.addCommand(participantCommand)

configCommand.command('auth')
  .action(async () => {
    const questionList = [
      { type: 'input', name: 'username', message: 'Write the bitbucket username:' },
      { type: 'input', name: 'password', message: 'Write the bitbucket password:' },
      { type: 'input', name: 'workspace', message: 'Write the bitbucket workspace:' },
      { type: 'input', name: 'repoSlug', message: 'Write the bitbucket repo slug:' }
    ]

    inquirer.prompt(questionList).then((answers) => {
      updateConfiguration({ auth: { ...answers } }, UPDATE_OPTIONS.MERGE)
    })
  })

export default configCommand
