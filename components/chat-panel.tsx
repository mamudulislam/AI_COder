"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Send, Bot, User, Sparkles, Plus, Trash2, Edit2, CornerDownLeft } from "lucide-react"
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chats.length > 0 && !currentChat) {
      loadChat(chats[0].id)
    } else if (chats.length === 0 && !isLoading) {
      createChat("New Chat")
    }
  }, [chats, currentChat, isLoading, loadChat, createChat])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [currentChat?.messages, isLoading])

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
    e.stopPropagation()
    setChatToDelete(chatId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteChat = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete)
      setChatToDelete(null)
    }
    setIsDeleteDialogOpen(false)
  }

  const handleEditTitle = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTitle(chatId)
    setNewTitle(currentTitle)
  }

  const handleSaveTitle = (chatId: string) => {
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
        {/* Chat History Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="font-medium text-sm">Chat History</div>
            <Badge variant="outline" className="text-xs font-normal">
              {chats.length} conversation{chats.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={handleNewChat} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat History List */}
        <div className="h-48 border-b border-border">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {chats.filter(chat => chat.id === currentChat?.id).map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    currentChat?.id === chat.id ? "bg-muted" : "hover:bg-muted/50"
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
                        className="h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs font-medium truncate block">{chat.title}</span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => handleEditTitle(chat.id, chat.title, e)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => confirmDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {currentChat?.messages.map((message, index) => (
                <div key={message.id} className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : ""
                }`}>
                  {message.type === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${
                    message.type === "user" ? "text-right" : ""
                  }`}>
                    <Card className={`inline-block rounded-2xl ${
                      message.type === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                    }`}>
                      <CardContent className="p-3 text-sm">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground mt-1.5 px-3">{new Date(message.timestamp).toLocaleTimeString()}</p>
                  </div>
                  {message.type === "user" && (
                     <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <Card className="inline-block rounded-2xl bg-muted rounded-bl-none">
                     <CardContent className="p-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Chat Input Area */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-transparent"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <div className="relative">
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
                className="flex-1 pr-20 h-11 rounded-full pl-5"
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
                 {selectedCode && (
                  <Button
                    onClick={() => onRefactor("Refactor this code for better readability.")}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Refactor
                  </Button>
                )}
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="rounded-full w-8 h-8">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
             <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 pl-2">
              <CornerDownLeft className="h-3 w-3"/>
              <span className="font-semibold">Enter</span> to send, <span className="font-semibold">Shift + Enter</span> for new line.
            </p>
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
