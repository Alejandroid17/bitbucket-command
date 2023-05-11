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

export { listAllPullRequests }
