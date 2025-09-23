"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/code-editor"
import { ChatPanel } from "@/components/chat-panel"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function AICoderPage() {
  const [activeFile, setActiveFile] = useState("main.tsx")
  const [files, setFiles] = useState({
    "main.tsx": `import React from 'react'

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <p>Start coding with AI assistance!</p>
    </div>
  )
}

export default App`,
    "utils.ts": `export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}`,
  })

  const updateFileContent = (filename: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: content,
    }))
  }

  const createNewFile = (filename: string) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: "",
    }))
    setActiveFile(filename)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar
              files={Object.keys(files)}
              activeFile={activeFile}
              onFileSelect={setActiveFile}
              onNewFile={createNewFile}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <CodeEditor
              filename={activeFile}
              content={files[activeFile] || ""}
              onChange={(content) => updateFileContent(activeFile, content)}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <ChatPanel
              onCodeGenerated={(code) => updateFileContent(activeFile, code)}
              currentFile={activeFile}
              currentCode={files[activeFile] || ""}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
