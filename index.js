import bitbucketPackage from 'bitbucket'
import { Command } from 'commander'
import inquirer from 'inquirer'
import nunjucks from 'nunjucks'
import { checkConfiguration, getConfiguration, listAllPullRequests, updateConfiguration } from './utils.js'

const { Bitbucket } = bitbucketPackage

nunjucks.configure({ autoescape: false })

const program = new Command()

program
  .name('Bitbucket commands')

program.command('auth-config')
  .action(async () => {
    const questionList = [
      { type: 'input', name: 'username', message: 'Write the bitbucket username:' },
      { type: 'input', name: 'password', message: 'Write the bitbucket password:' },
      { type: 'input', name: 'workspace', message: 'Write the bitbucket workspace:' },
      { type: 'input', name: 'repoSlug', message: 'Write the bitbucket repo slug:' }
    ]

    inquirer.prompt(questionList).then((answers) => {
      updateConfiguration({ auth: { ...answers } })
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
