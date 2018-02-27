import { Config } from '@lib/config'
import git from '@lib/git'
import ipc from '@lib/ipc'

const created = async (config: Config, params: { docName: string; into: string }) => {
  if (!params) {
    return
  }

  ipc(config).send('CREATE DOC', params)

  const gitMech = git(config)
  await gitMech.$add(params.docName, params.into)
  await gitMech.$commit(params.docName, params.into, 'Document created')
}

const updated = async (
  config: Config,
  params: { docName: string; into: string; comment: string }
) => {
  if (!params) {
    return
  }

  ipc(config).send('UPDATE DOC', params)

  const gitMech = git(config)
  await gitMech.$add(params.docName, params.into)
  await gitMech.$commit(params.docName, params.into, params.comment || 'Document updated')
}

const deleted = async (config: Config, params) => {
  if (!params) {
    return
  }

  ipc(config).send('DELETE DOC', params)

  const gitMech = git(config)
  await gitMech.$rm(params.docName, params.into)
  await gitMech.$commit(params.docName, params.into, 'Document deleted')
}

const restored = async (config: Config, params) => {
  //
}

export default {
  created,
  deleted,
  restored,
  updated
}
