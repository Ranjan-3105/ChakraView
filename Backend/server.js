const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', authRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast helper
const broadcastMessage = (msgObj) => {
  const msgStr = JSON.stringify(msgObj); // always send as string
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msgStr);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      // Convert message to string
      const msgObj = JSON.parse(message.toString()); 
      // msgObj should be { username, message }

      // Broadcast to all clients
      broadcastMessage(msgObj);
    } catch (err) {
      console.error('Invalid message format', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
