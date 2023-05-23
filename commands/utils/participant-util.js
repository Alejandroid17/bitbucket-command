import { getConfiguration } from './configuration-util.js'

const DEFAULT_PARTICIPANT_STRUCTURE = { fullName: null, slackId: null }
const { participants } = await getConfiguration()

function getParticipant (id) {
  return participants[id] || DEFAULT_PARTICIPANT_STRUCTURE
}

function setAllParticipantsInformation (pullRequestList) {
  return pullRequestList.map((pullRequestBlocked) => {
    const participantList = pullRequestBlocked.participants.map((participant) => {
      const participantData = getParticipant(participant.user.uuid)
      return { ...participant, user: { ...participant.user, ...participantData } }
    })

    return { ...pullRequestBlocked, participants: participantList }
  })
}

export { getParticipant, setAllParticipantsInformation }
