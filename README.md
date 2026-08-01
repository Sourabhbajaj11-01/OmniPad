# OmniPad 🚀

OmniPad is a high-performance, real-time collaborative code editor built for modern the web. It features a completely headless "Ghost AI" client, sub-millisecond keystroke synchronization, offline persistence, and a serverless C++ execution engine.

## 🌟 Key Features

- **Real-Time Collaboration:** Powered by Conflict-free Replicated Data Types (CRDTs) via `Yjs` and WebSockets, allowing multiple users to edit the same file simultaneously without race conditions.
- **Remote Code Execution:** Securely compiles and executes C++ code via a seamless integration with the JDoodle execution REST API.
- **Ghost AI Integration:** Type `// ai:` into the editor to trigger the headless AI client, which dynamically injects C++ code character-by-character into the live document, preventing CRDT merge conflicts.
- **Offline-First Resilience:** Keystrokes are persisted locally using `y-indexeddb`. If the internet drops, users can keep typing, and the document automatically syncs to the server upon reconnection.
- **VS Code Experience:** Powered by Monaco Editor, providing syntax highlighting, minimaps, and multi-cursor support right in the browser.

## 🏗️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Monaco Editor
- **Backend:** Node.js, Express.js, WebSockets (`ws`)
- **Sync Engine:** Yjs (CRDT Protocol)
- **Code Execution:** JDoodle Compiler API (Formerly Docker Sandboxing)

## 🚀 Local Development Setup

This project uses a Monorepo structure. You will need to run the frontend and backend servers simultaneously.

### 1. Clone the repository
```bash
git clone https://github.com/Sourabhbajaj11-01/OmniPad.git
cd OmniPad
```

### 2. Setup the Backend (`op_server`)
```bash
cd op_server
npm install
```
Create a `.env` file in the `op_server` directory and add your JDoodle credentials:
```env
JDOODLE_CLIENT_ID=your_client_id
JDOODLE_CLIENT_SECRET=your_client_secret
```
Start the backend server:
```bash
npm start
# Server runs on http://localhost:3000
```

### 3. Setup the Frontend (`op_client`)
Open a new terminal window:
```bash
cd op_client
npm install
npm run dev
# Vite runs on http://localhost:5173
```

## 🔮 Future Architecture Roadmap

While OmniPad is fully functional, the architecture is designed to support heavy, production-grade DevOps and AI concepts in the future:
- **Docker Containerization:** Initial architecture utilized `dockerode` to isolate execution in memory-capped Linux containers. Pivot made to external APIs to optimize for zero-cost cloud deployment.
- **LLM SDK Integration:** Extensible backend ready for dynamic GPT-4o generation via the OpenAI Node.js SDK (currently utilizing a mocked fallback).
- **Enterprise RAG Pipeline:** Planned Retrieval-Augmented Generation utilizing **MongoDB Atlas Vector Search** for contextual codebase awareness.
- **Live Presence Protocol:** Planned implementation of the Yjs Awareness Protocol to broadcast multiplayer mouse cursors and nametags.

---
*Built with ❤️ for collaborative coding.*
