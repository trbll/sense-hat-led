const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 8080
});

function updateMatrix(pixelArray, callback) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(pixelArray), callback);
    }
  });
}

module.exports = updateMatrix;
