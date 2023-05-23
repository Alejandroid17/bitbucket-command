import { Command } from 'commander'
import { checkConfiguration, getConfiguration } from './utils/configuration-util.js'
import bitbucketPackage from 'bitbucket'
import nunjucks from 'nunjucks'
import { listAllIndividualPullRequests, listAllPullRequests } from './utils/bitbucket-util.js'
import { setAllParticipantsInformation } from './utils/participant-util.js'
import { setApprovers, setBlockers } from './utils/pull-request-util.js'

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

pullRequestCommand.command('list-blocked')
  .option('--format <type>', 'Output format (json, markdown)', 'json')
  .option('--pagelen <number>', 'Length of the response page', 20)
  .option('--fields <string>', 'Partial response fields', 'id,title,links.html.href')
  .option('--markdown-format <string>', 'Markdown format message', '- {{ title }} [#PR{{ id }}]({{ links.html.href }}) (Approved:{{ approvers | length  }} | Blocked:{{ blockers | length  }})')
  .action(async (options) => {
    checkConfiguration()

    const configuration = await getConfiguration()
    const bitbucketInstance = new Bitbucket({ auth: configuration.auth })

    const { data } = await listAllPullRequests(bitbucketInstance, {
      repo_slug: configuration.auth.repoSlug,
      workspace: configuration.auth.workspace,
      state: 'OPEN',
      fields: 'values.id',
      sort: 'created_on',
      pagelen: options.pagelen
    })

    let pullRequestDataList = await listAllIndividualPullRequests(bitbucketInstance, data.values, {
      repo_slug: configuration.auth.repoSlug,
      workspace: configuration.auth.workspace,
      fields: options.fields + ',participants.user.uuid,participants.state'
    })

    pullRequestDataList = setAllParticipantsInformation(pullRequestDataList)
    pullRequestDataList = setBlockers(pullRequestDataList)
    pullRequestDataList = setApprovers(pullRequestDataList)

    const pullRequestBlockedList = pullRequestDataList.filter(pullRequestData => pullRequestData.blockers.length > 0)

    if (options.format === 'json') {
      console.log(pullRequestBlockedList)
      return
    }

    if (options.format === 'markdown') {
      pullRequestBlockedList.forEach(pullRequestData => {
        const text = nunjucks.renderString(options.markdownFormat, pullRequestData)
        console.log(text)
      })
    }
  })

export default pullRequestCommand
