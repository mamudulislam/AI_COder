"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Check } from "lucide-react"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  filename: string
  content: string
  onChange: (content: string) => void
  onSelect?: (selectedText: string, selectionStart: number, selectionEnd: number) => void
}

export function CodeEditor({ filename, content, onChange, onSelect }: CodeEditorProps) {
  const { theme } = useTheme()
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
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
      case "tsx": return "typescript"
      case "jsx": return "javascript"
      case "ts": return "typescript"
      case "js": return "javascript"
      case "css": return "css"
      case "html": return "html"
      case "json": return "json"
      case "md": return "markdown"
      default: return "plaintext"
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{filename}</span>
          <Badge variant="outline" className="text-xs font-normal">
            {getLanguage(filename)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0">
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadFile} className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={getLanguage(filename)}
          value={content}
          onChange={(value) => onChange(value || "")}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
          }}
          onMount={(editor, monaco) => {
            editor.onMouseUp(() => {
              if (onSelect) {
                const selection = editor.getSelection()
                if (selection && !selection.isEmpty()) {
                  const model = editor.getModel()
                  if (model) {
                    const value = model.getValueInRange(selection)
                    const start = model.getOffsetAt(selection.getStartPosition())
                    const end = model.getOffsetAt(selection.getEndPosition())
                    onSelect(value, start, end)
                  }
                }
              }
            })
          }}
        />
      </div>
    </div>
  )
}
