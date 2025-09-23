"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
}

export function ChatPanel({ onCodeGenerated, currentFile, currentCode }: ChatPanelProps) {
  const { chats, currentChat, isLoading, createChat, loadChat, updateChat, deleteChat, sendMessage } = useChats()

  const [input, setInput] = useState("")
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")

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

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChat(chatId)
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

      <div className="h-32 border-b border-border bg-muted/30">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
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
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
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
                    onClick={(e) => handleDeleteChat(chat.id, e)}
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
  )
}
