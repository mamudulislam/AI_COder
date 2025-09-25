"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { File, Plus, Folder, X } from "lucide-react"
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
    // Simple icon mapping, can be expanded
    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <File className="h-4 w-4 text-blue-400" />
      case "css":
      case "scss":
        return <File className="h-4 w-4 text-purple-400" />
      case "json":
        return <File className="h-4 w-4 text-orange-400" />
      case "md":
        return <File className="h-4 w-4 text-gray-400" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">File Explorer</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewFileInput(!showNewFileInput)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showNewFileInput && (
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Input
              placeholder="Enter filename..."
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile()
                if (e.key === "Escape") setShowNewFileInput(false)
              }}
              className="h-8 text-sm pl-3 pr-8"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setShowNewFileInput(false)}
            >
              <X className="h-4 w-4 text-muted-foreground"/>
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.map((filename) => (
            <Button
              key={filename}
              variant={activeFile === filename ? "secondary" : "ghost"}
              className="w-full justify-start h-9 px-3 text-sm font-normal transition-colors duration-150"
              onClick={() => onFileSelect(filename)}
            >
              {getFileIcon(filename)}
              <span className="ml-2.5 truncate">{filename}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
