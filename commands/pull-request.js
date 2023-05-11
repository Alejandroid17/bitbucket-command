import { Command } from 'commander'
import { checkConfiguration, getConfiguration } from './utils/configuration-util.js'
import bitbucketPackage from 'bitbucket'
import nunjucks from 'nunjucks'
import { listAllPullRequests } from './utils/bitbucket-util.js'

const { Bitbucket } = bitbucketPackage

nunjucks.configure({ autoescape: false })

const pullRequestCommand = new Command('pull-request')

pullRequestCommand.command('list-open')
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

export default pullRequestCommand
