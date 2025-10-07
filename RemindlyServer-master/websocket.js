const WebSocket = require('ws');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
      console.log('Received message from client:', message);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    // Send a notification to the client after connection
    ws.send(JSON.stringify({ type: 'notification', message: 'Welcome to Remindly!' }));

    // Example: Broadcast a message to all clients
    setInterval(() => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'notification', message: 'Periodic Notification!' }));
        }
      });
    }, 10000); // Send every 10 seconds
  });

  console.log('WebSocket server is set up');
};

module.exports = setupWebSocket;
