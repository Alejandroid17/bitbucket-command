import bitbucketPackage from 'bitbucket'
import { Command } from 'commander'
import inquirer from 'inquirer'
import nunjucks from 'nunjucks'
import { UPDATE_OPTIONS, checkConfiguration, getConfiguration, listAllPullRequests, updateConfiguration } from './utils.js'

const { Bitbucket } = bitbucketPackage

nunjucks.configure({ autoescape: false })

const program = new Command()

program
  .name('Bitbucket commands')

const configCommand = program.command('config')

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

const configParticipants = configCommand.command('participants')

configParticipants.command('list')
  .action(async () => {
    const configuration = await getConfiguration()
    const { participants } = configuration

    for (const [key, value] of Object.entries(participants)) {
      console.log({ key, data: value })
    }
  })

configParticipants.command('add')
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

configParticipants.command('delete')
  .action(async () => {
    const questionList = [
      { type: 'input', name: 'bitbucketId', message: 'Write the bitbucket id ({user_uuid}):' }
    ]

    inquirer.prompt(questionList).then((answers) => {
      updateConfiguration(answers.bitbucketId, UPDATE_OPTIONS.DELETE, 'participants')
    })
  })

program.command('list-open-pull-requests')
  .option('--format <type>', 'Output format (json, markdown)', 'json')
  .option('--pagelen <number>', 'Length of the response page', 20)
  .option('--fields <string>', 'Partial response fields', 'values.id,values.title,values.links.html.href')
  .option('--markdown-format <string>', 'Markdown format message', '- {{ title }} [#PR{{ id }}]({{ links.html.href }})')
  .action(async (options) => {
    checkConfiguration()

    const configuration = await getConfiguration()
    const bitbucketInstance = new Bitbucket({ auth: configuration.auth })

    const { data } = await listAllPullRequests(bitbucketInstance, {
      repo_slug: configuration.auth.repoSlug,
      workspace: configuration.auth.workspace,
      state: 'OPEN',
      fields: options.fields,
      sort: 'created_on',
      pagelen: options.pagelen
    })

    if (options.format === 'json') {
      console.log(data)
      return
    }

    if (options.format === 'markdown') {
      data.values.forEach(pullRequestData => {
        const text = nunjucks.renderString(options.markdownFormat, pullRequestData)
        console.log(text)
      })
    }
  })

program.parse()
