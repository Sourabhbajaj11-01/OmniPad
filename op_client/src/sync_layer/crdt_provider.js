import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

// 1. Initialize the Yjs document
const doc = new Y.Doc();

// 2. Initialize local offline storage
// This ensures that even if you lose connection, your changes are saved locally
// and will sync back to the server automatically once reconnected.
const indexeddbProvider = new IndexeddbPersistence('omnipad-offline-store', doc);

// 3. Connect to our backend WebSocket server
// 'omnipad-demo-room' must match the docName we configured on the server
const provider = new WebsocketProvider(
  'ws://localhost:3000',
  'omnipad-demo-room',
  doc
);

// We extract a shared text type which we will bind to the Monaco editor.
// "monaco-editor" is just an identifier for this specific piece of shared data.
const yText = doc.getText('monaco-editor');

export { doc, provider, indexeddbProvider, yText };
