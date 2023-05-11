import { Command } from 'commander'
import configCommand from './commands/config.js'
import pullRequestCommand from './commands/pull-request.js'

const program = new Command()

program.name('Bitbucket commands')
program.addCommand(configCommand)
program.addCommand(pullRequestCommand)

program.parse(process.argv)
