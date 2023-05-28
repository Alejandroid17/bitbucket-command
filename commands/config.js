import { Command } from 'commander'
import participantConfigCommand from './config/participant.js'

const configCommand = new Command('config')

configCommand.addCommand(participantConfigCommand)

export default configCommand
