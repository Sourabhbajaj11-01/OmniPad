# OmniPad

### Real-Time Collaborative Code Editor & AI Sandbox

**Collaborate · Execute · Create**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.13-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Overview

OmniPad is a high-performance, real-time collaborative code editor built for the modern web. It features a completely headless "Ghost AI" client, sub-millisecond keystroke synchronization, offline persistence, and a serverless C++ execution engine.

## Architecture

```text
┌─────────────────────────┐
│ React Frontend          │
│ Vite + Monaco Editor    │
│ :5173                   │
└─────────────────────────┘
      │           │
      │ WS (Yjs)  │ POST /api/execute
      │           │
      ▼           ▼
┌─────────────────────────┐
│ Node.js Backend         │
│ Express + WebSockets    │
│ :3000                   │
└─────────────────────────┘
      │           │
      │ AI Prompt │ POST /v1/execute
      │ (Ghost)   │ (JDoodle)
      ▼           ▼
┌───────────────┐ ┌───────────────┐
│ AI Engine     │ │ Cloud Sandbox │
│ (Mock/GPT-4o) │ │ C++ Compiler  │
└───────────────┘ └───────────────┘
```

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

### ❄️ Cold Start Notice

> Render's free tier automatically suspends inactive services after 15 minutes of inactivity.

- First connection after inactivity: **30-60 seconds** startup delay
- Subsequent interactions: **Instantaneous response**

This affects only the very first WebSocket connection used to wake the backend service.

---

## 🚀 Deployment

| Component | Platform / Service |
|-----------|--------------------|
| Frontend  | Vercel |
| Backend   | Render |
| Execution | JDoodle API |

---

## 🔮 Future Architecture Roadmap

While OmniPad is fully functional, the architecture is designed to support heavy, production-grade DevOps and AI concepts in the future:
- **Docker Containerization:** Initial architecture utilized `dockerode` to isolate execution in memory-capped Linux containers. Pivot made to external APIs to optimize for zero-cost cloud deployment.
- **LLM SDK Integration:** Extensible backend ready for dynamic GPT-4o generation via the OpenAI Node.js SDK (currently utilizing a mocked fallback).
- **Enterprise RAG Pipeline:** Planned Retrieval-Augmented Generation utilizing **MongoDB Atlas Vector Search** for contextual codebase awareness.
- **Live Presence Protocol:** Planned implementation of the Yjs Awareness Protocol to broadcast multiplayer mouse cursors and nametags.

---
*Built with ❤️ for collaborative coding.*
