"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download } from "lucide-react"

interface CodeEditorProps {
  filename: string
  content: string
  onChange: (content: string) => void
  onSelect?: (selectedText: string, selectionStart: number, selectionEnd: number) => void
}

export function CodeEditor({ filename, content, onChange, onSelect }: CodeEditorProps) {
  const [lineCount, setLineCount] = useState(1)

  useEffect(() => {
    const lines = content.split("\n").length
    setLineCount(lines)
  }, [content])

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (onSelect) {
      const textarea = e.currentTarget
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
      onSelect(selectedText, textarea.selectionStart, textarea.selectionEnd)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
  }

  const downloadFile = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()
    switch (ext) {
      case "tsx":
      case "jsx":
        return "React"
      case "ts":
        return "TypeScript"
      case "js":
        return "JavaScript"
      case "css":
        return "CSS"
      case "html":
        return "HTML"
      default:
        return "Text"
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-10 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{filename}</span>
          <Badge variant="outline" className="text-xs">
            {getLanguage(filename)}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadFile}>
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-12 bg-muted/30 border-r border-border flex flex-col items-center py-2 text-xs text-muted-foreground font-mono">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="h-6 flex items-center">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            className="w-full h-full p-4 bg-transparent text-foreground font-mono text-sm resize-none border-none outline-none leading-6"
            placeholder="Start coding or ask AI to generate code..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
