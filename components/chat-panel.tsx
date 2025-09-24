"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Send, Bot, User, Sparkles, Plus, Trash2, Edit2 } from "lucide-react"
import { useChats } from "@/hooks/use-chats"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatPanelProps {
  onCodeGenerated: (code: string) => void
  currentFile: string
  currentCode: string
  selectedCode: string
  onRefactor: (prompt: string) => void
}

export function ChatPanel({ onCodeGenerated, currentFile, currentCode, selectedCode, onRefactor }: ChatPanelProps) {
  const { chats, currentChat, isLoading, createChat, loadChat, updateChat, deleteChat, sendMessage } = useChats()

  const [input, setInput] = useState("")
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (chats.length > 0 && !currentChat) {
      loadChat(chats[0].id)
    } else if (chats.length === 0 && !isLoading) {
      createChat("New Chat")
    }
  }, [chats, currentChat, isLoading])

  const handleSend = async () => {
    if (!input.trim() || !currentChat) return

    const result = await sendMessage(currentChat.id, input)
    setInput("")

    if (result?.generatedCode) {
      onCodeGenerated(result.generatedCode)
    }
  }

  const handleNewChat = () => {
    createChat(`Chat ${chats.length + 1}`)
  }

  const confirmDeleteChat = (chatId: string, e: React.MouseEvent) => {
    console.log("confirmDeleteChat called with chatId:", chatId)
    e.stopPropagation()
    setChatToDelete(chatId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteChat = () => {
    console.log("handleDeleteChat called. chatToDelete:", chatToDelete)
    if (chatToDelete) {
      deleteChat(chatToDelete)
      setChatToDelete(null)
    }
    setIsDeleteDialogOpen(false)
  }

  const handleEditTitle = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    console.log("handleEditTitle called with chatId:", chatId)
    e.stopPropagation()
    setEditingTitle(chatId)
    setNewTitle(currentTitle)
  }

  const handleSaveTitle = (chatId: string) => {
    console.log("handleSaveTitle called with chatId:", chatId, "and newTitle:", newTitle)
    if (newTitle.trim()) {
      updateChat(chatId, newTitle.trim())
    }
    setEditingTitle(null)
    setNewTitle("")
  }

  const quickPrompts = [
    "Create a React component",
    "Add TypeScript types",
    "Build an API endpoint",
    "Fix this code",
    "Optimize performance",
  ]

  return (
    <>
      <div className="h-full flex flex-col bg-card border-l border-border">
        <div className="h-10 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleNewChat}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="h-40 border-b border-border bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
                    currentChat?.id === chat.id ? "bg-muted" : ""
                  }`}
                  onClick={() => loadChat(chat.id)}
                >
                  <div className="flex-1 min-w-0">
                    {editingTitle === chat.id ? (
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => handleSaveTitle(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTitle(chat.id)
                          if (e.key === "Escape") setEditingTitle(null)
                        }}
                        className="h-6 text-xs"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs truncate block">{chat.title}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={(e) => handleEditTitle(chat.id, chat.title, e)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => confirmDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {currentChat?.messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  {message.type === "user" ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-3 w-3 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-3 w-3 text-secondary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Card className="p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
                  </Card>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-3 w-3 text-secondary-foreground" />
                </div>
                <Card className="p-3 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                    <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex flex-wrap gap-1">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="text-xs h-6 bg-transparent"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            {selectedCode && (
              <Button
                onClick={() => onRefactor("Refactor this code for better readability.")}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Refactor with AI
              </Button>
            )}
            <Input
              placeholder="Ask AI to generate or modify code..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
