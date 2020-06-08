const url = require('url')
const WebSocket = require('ws')

const server = new WebSocket.Server({ port: 3000 })

server.on('connection', (socket, req) => {
  const parameters = url.parse(req.url, true)
  socket.clientId = parameters.query.clientId
  console.log(`Client ${socket.clientId} joined`)
  socket.on('message', (message) => {
    server.clients.forEach(function each(client) {
      if (client.clientId !== 'jest') {
        console.log(`Sending ${JSON.stringify(message)} to client ${client.clientId}`)
        client.send(message)
      }
    })
  })
})
