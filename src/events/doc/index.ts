import { Config } from '@lib/config'
import git from '@lib/git'
import ipc from '@lib/ipc'

const created = async (config: Config, params: {docName: string; into: string;}) => {
  ipc(config).send('CREATE DOC', params)
  console.log(await git(config).cmdAdd(params.docName, params.into))
}

const updated = async (config: Config, params) => {
  ipc(config).send('UPDATE DOC', params)
  console.log(await git(config).cmdAdd(params.docName, params.into))
}

const deleted = (config: Config, params) => {
  ipc(config).send('DELETE DOC', params)
}

export default {
  created,
  deleted,
  updated
}
