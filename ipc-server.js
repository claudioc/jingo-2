const ipc = require('node-ipc')

ipc.config.id = 'myIpcServer'
ipc.config.encoding = 'utf8'
ipc.config.silent = true

ipc.serve()
ipc.server.on('start', () => {
  console.log('🤖 IPC server set up')
})
ipc.server.start()
