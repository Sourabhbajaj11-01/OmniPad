const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { setupYjsWebsockets } = require('./src/socket_engine/yjs_handler');
const { executeCpp } = require('./src/execution_sandbox/docker_orchestrator');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from OmniPad Backend!');
});

// Code Execution Route
app.post('/api/execute', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, output: 'No code provided.' });
  }

  try {
    const result = await executeCpp(code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, output: `Server Error: ${error.message}` });
  }
});

// Create HTTP server instead of listening directly on app, 
// so we can attach WebSockets to it.
const server = http.createServer(app);

// Attach Yjs WebSockets
setupYjsWebsockets(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
