"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { File, Plus, Folder } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  files: string[]
  activeFile: string
  onFileSelect: (filename: string) => void
  onNewFile: (filename: string) => void
}

export function Sidebar({ files, activeFile, onFileSelect, onNewFile }: SidebarProps) {
  const [newFileName, setNewFileName] = useState("")
  const [showNewFileInput, setShowNewFileInput] = useState(false)

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onNewFile(newFileName.trim())
      setNewFileName("")
      setShowNewFileInput(false)
    }
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()
    return <File className="h-4 w-4" />
  }

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Files</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowNewFileInput(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {showNewFileInput && (
          <div className="flex gap-1">
            <Input
              placeholder="filename.tsx"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile()
                if (e.key === "Escape") setShowNewFileInput(false)
              }}
              className="h-7 text-xs"
              autoFocus
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.map((filename) => (
            <Button
              key={filename}
              variant={activeFile === filename ? "secondary" : "ghost"}
              className="w-full justify-start h-8 px-2 text-xs font-normal"
              onClick={() => onFileSelect(filename)}
            >
              {getFileIcon(filename)}
              <span className="ml-2 truncate">{filename}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
