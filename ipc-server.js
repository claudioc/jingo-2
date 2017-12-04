const ipc = require('node-ipc')

ipc.config.id = 'zeitgeist'
ipc.config.encoding = 'utf8'
ipc.config.silent = true

ipc.serve()
ipc.server.on('start', () => {
  console.log('🤖 IPC server set up')
})

ipc.server.on('app.message', (data) => {
  console.log('Got message')
  console.log(data)
})
ipc.server.start()
