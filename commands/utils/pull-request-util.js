function setRoleState (roleStateKey, state, pullRequestList) {
  return pullRequestList.map((pullRequest) => {
    const blockerList = pullRequest.participants.map((participant) => {
      if (participant.state === state) return participant
      return null
    }).filter(Boolean)

    return { ...pullRequest, [roleStateKey]: blockerList }
  })
}

function setBlockers (pullRequestList) {
  return setRoleState('blockers', 'changes_requested', pullRequestList)
}

function setApprovers (pullRequestList) {
  return setRoleState('approvers', 'approved', pullRequestList)
}

export { setBlockers, setApprovers }
