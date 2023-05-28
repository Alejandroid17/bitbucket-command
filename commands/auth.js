import inquirer from 'inquirer'
import { Command } from 'commander'
import { UPDATE_OPTIONS, updateConfiguration } from './utils/configuration-util.js'

const authCommand = new Command('auth')

const AUTH_COMMAND = {
  LOGIN: 'login'
}

authCommand.command(AUTH_COMMAND.LOGIN)
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

export default authCommand
export { AUTH_COMMAND }
