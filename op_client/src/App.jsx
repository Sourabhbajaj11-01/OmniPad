import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { MonacoBinding } from 'y-monaco'
import { provider, yText } from './sync_layer/crdt_provider'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(provider.wsconnected);
  const [consoleOutput, setConsoleOutput] = useState('Waiting for execution...');
  const [isExecuting, setIsExecuting] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    // Listen to WebSocket connection status changes
    const handleStatus = (event) => {
      setIsConnected(event.status === 'connected');
    };
    
    provider.on('status', handleStatus);
    
    // Cleanup listener on unmount
    return () => {
      provider.off('status', handleStatus);
    };
  }, []);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // Bind the Monaco Editor's text model to the Yjs shared text.
    // This automagically syncs local keystrokes to the network and vice versa!
    new MonacoBinding(yText, editor.getModel(), new Set([editor]), provider.awareness);

    // Provide default C++ boilerplate if the document is empty
    if (yText.length === 0) {
      yText.insert(0, '#include <iostream>\n\nint main() {\n    std::cout << "Hello, OmniPad!" << std::endl;\n    return 0;\n}');
    }
  }

  const runCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    
    setIsExecuting(true);
    setConsoleOutput('Compiling and executing in Docker...');

    try {
      const response = await fetch('http://localhost:3000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      setConsoleOutput(data.output);
    } catch (error) {
      setConsoleOutput(`Error: ${error.message}\nMake sure the backend server is running.`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1e1e1e] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#252526] border-b border-[#333333]">
        <h1 className="text-xl font-semibold text-[#e1e4e8]">OmniPad</h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <button 
            onClick={runCode}
            disabled={isExecuting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              isExecuting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExecuting ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Container */}
        <div className="flex-1 border-r border-[#333333]">
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbersMinChars: 3,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Sidebar / Output Area */}
        <div className="w-80 bg-[#252526] flex flex-col">
          <div className="px-4 py-3 border-b border-[#333333] text-sm font-medium text-gray-300">
            Console Output
          </div>
          <div className="flex-1 p-4 font-mono text-sm text-gray-400 whitespace-pre-wrap overflow-y-auto">
            {consoleOutput}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

