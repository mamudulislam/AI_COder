"use client"

import { memo, useMemo, useCallback } from "react"
import { Editor } from "@monaco-editor/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Download, Play, FileText } from "lucide-react"

interface OptimizedCodeEditorProps {
  code: string
  language: string
  onChange: (value: string) => void
  onRun?: () => void
  filename?: string
  readOnly?: boolean
}

// Memoized editor options for performance
const editorOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineHeight: 20,
  tabSize: 2,
  wordWrap: "on" as const,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  parameterHints: { enabled: true },
  hover: { enabled: true },
}

export const OptimizedCodeEditor = memo(function OptimizedCodeEditor({
  code,
  language,
  onChange,
  onRun,
  filename = "untitled",
  readOnly = false,
}: OptimizedCodeEditorProps) {
  // Memoize the copy function to prevent unnecessary re-renders
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }, [code])

  // Memoize the download function
  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.${language}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [code, filename, language])

  // Memoize the editor change handler
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value)
      }
    },
    [onChange],
  )

  // Memoize the language badge color
  const languageBadgeVariant = useMemo(() => {
    switch (language.toLowerCase()) {
      case "typescript":
      case "tsx":
        return "default"
      case "javascript":
      case "jsx":
        return "secondary"
      case "python":
        return "outline"
      default:
        return "secondary"
    }
  }, [language])

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate">{filename}</span>
          <Badge variant={languageBadgeVariant} className="text-xs">
            {language.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {onRun && (
            <Button size="sm" variant="ghost" onClick={onRun} className="h-7 px-2">
              <Play className="h-3 w-3" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleCopy} className="h-7 px-2">
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDownload} className="h-7 px-2">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          options={{
            ...editorOptions,
            readOnly,
          }}
          theme="vs-dark"
          loading={<div className="flex items-center justify-center h-full">Loading editor...</div>}
        />
      </div>
    </Card>
  )
})
