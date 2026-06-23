const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

function setupYjsWebsockets(server) {
  // Create a WebSocket server attached to our Express HTTP server
  const wss = new WebSocketServer({ server });

  wss.on('connection', (conn, req) => {
    // We use the y-websocket utility to handle the CRDT connection logic.
    // By passing 'document-name' we allow users to connect to the same Yjs document.
    // For now we use a single hardcoded document name "omnipad-demo-room".
    setupWSConnection(conn, req, { docName: 'omnipad-demo-room' });
  });

  return wss;
}

module.exports = { setupYjsWebsockets };
