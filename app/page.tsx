"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Play, Upload } from "lucide-react"
import dynamic from "next/dynamic"
import { executeCode } from "@/lib/execute"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-600">Loading Editor...</div>
    </div>
  ),
})

const DEFAULT_CODE = `// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Test the function
console.log(greet("World"));

// Example: Calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));

// Example: Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Original:", numbers);
console.log("Doubled:", doubled);
`

export default function CodeEditorPage(): any {
  const [code, setCode] = useState<string>(DEFAULT_CODE)
  const [output, setOutput] = useState<string>("")
  const [isExecuting, setIsExecuting] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEditorChange = (value: string | undefined): void => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  const handleRunCode = async (): Promise<void> => {
    setIsExecuting(true)
    try {
      const result = await executeCode(code)
      setOutput(result.output)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string
        if (content) {
          setCode(content)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleBrowseFile = (): void => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mini Compiler</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleBrowseFile}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Upload className="h-4 w-4" />
            Browse File
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 border-r border-gray-200">
          <div className="h-full">
            <MonacoEditor
              height="100%"
              language="javascript"
              theme="light"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                lineNumbers: "on",
                renderWhitespace: "selection",
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: "line",
              }}
            />
          </div>
        </div>

        <div className="w-1/3 flex flex-col bg-gray-50">
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <h3 className="font-medium text-gray-900">Output</h3>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {output ? (
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{output}</pre>
            ) : (
              <div className="text-gray-500 text-sm">Click "Run Code" to see the output here.</div>
            )}
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".js,.txt,.json" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
