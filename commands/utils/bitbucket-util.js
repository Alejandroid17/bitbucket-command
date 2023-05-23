async function listAllPullRequests (bitbucketInstance, params) {
  let allData = {}
  let hasNextPage = true
  let pageCount = 1

  do {
    const { data } = await bitbucketInstance.repositories.listPullRequests({ ...params, page: pageCount, fields: params.fields + ',next,size' })
    const { values, size } = data

    pageCount === 1
      ? allData = { values, size }
      : allData = { values: [...allData.values, ...values], size }

    'next' in data ? pageCount++ : hasNextPage = false
  } while (hasNextPage)

  return { data: allData }
}

async function listAllIndividualPullRequests (bitbucketInstance, dataList, params) {
  return await Promise.all(dataList.map(async (data, _) => {
    const pullRequest = await bitbucketInstance.pullrequests.get({
      ...params,
      pull_request_id: data.id
    })

    return pullRequest.data
  }))
}

export { listAllPullRequests, listAllIndividualPullRequests }
