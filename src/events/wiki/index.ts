import { Config } from '@lib/config'
import ipc from '@lib/ipc'

const read = (config: Config, params) => {
  ipc(config).send(`READ WIKI`,  params)
}

export default {
  read
}
