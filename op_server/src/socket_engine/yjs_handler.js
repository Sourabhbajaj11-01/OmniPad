const { WebSocketServer } = require('ws');
const { setupWSConnection, docs } = require('y-websocket/bin/utils');
const { getAiResponse } = require('../ai_engine/ghost_brain');

// Keep track of which documents have the AI Ghost attached
const observedDocs = new Set();

function setupYjsWebsockets(server) {
  // Create a WebSocket server attached to our Express HTTP server
  const wss = new WebSocketServer({ server });

  wss.on('connection', (conn, req) => {
    const docName = 'omnipad-demo-room';
    
    // We use the y-websocket utility to handle the CRDT connection logic.
    setupWSConnection(conn, req, { docName });

    // Grab the internal Yjs document managed by y-websocket
    const ydoc = docs.get(docName);
    
    // Attach the AI Ghost to this document if it hasn't been attached yet
    if (ydoc && !observedDocs.has(docName)) {
      observedDocs.add(docName);
      const yText = ydoc.getText('monaco-editor');
      
      // Mutex lock so the AI doesn't trigger its own typing loop
      let isGhostTyping = false;
      
      yText.observe(async (event, transaction) => {
        if (isGhostTyping) return;
        
        const content = yText.toString();
        const triggerStr = '// ai: ';
        const triggerIndex = content.lastIndexOf(triggerStr);
        
        // Check if the trigger string exists
        if (triggerIndex !== -1) {
          const newlineIndex = content.indexOf('\n', triggerIndex);
          
          // Check if the user pressed 'Enter' to finalize their prompt
          if (newlineIndex !== -1 && event.changes.delta) {
            
            // Check if this exact change event introduced the newline
            const addedText = event.changes.delta.filter(d => d.insert).map(d => d.insert).join('');
            if (addedText.includes('\n')) {
              
              // Extract the prompt string
              const prompt = content.substring(triggerIndex + triggerStr.length, newlineIndex).trim();
              if (!prompt) return;
              
              // Prevent re-triggering on this exact same line by mutating the trigger
              isGhostTyping = true;
              ydoc.transact(() => {
                yText.delete(triggerIndex, triggerStr.length);
                yText.insert(triggerIndex, '// ghost (thinking): ');
              });
              isGhostTyping = false;

              // 1. Fetch AI Response
              const aiCode = await getAiResponse(prompt);
              
              isGhostTyping = true;
              ydoc.transact(() => {
                // Remove the "(thinking)" part
                yText.delete(triggerIndex, '// ghost (thinking): '.length);
                yText.insert(triggerIndex, '// ghost: ');
              });
              isGhostTyping = false;

              // 2. Headless Client Injection (Typing Animation)
              let i = 0;
              const typingInterval = setInterval(() => {
                if (i < aiCode.length) {
                  isGhostTyping = true;
                  // Always insert at the absolute end of the document, 
                  // adapting if the human user continues typing!
                  yText.insert(yText.length, aiCode[i]);
                  isGhostTyping = false;
                  i++;
                } else {
                  clearInterval(typingInterval);
                }
              }, 40); // 40ms per character for a natural typing speed
            }
          }
        }
      });
    }
  });

  return wss;
}

module.exports = { setupYjsWebsockets };
