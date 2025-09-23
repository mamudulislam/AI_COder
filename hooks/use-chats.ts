"use client"

import { useState, useEffect } from "react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch all chats
  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats")
      const data = await response.json()
      setChats(data.chats || [])
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  // Create new chat
  const createChat = async (title?: string) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      const data = await response.json()

      if (response.ok) {
        setChats((prev) => [data.chat, ...prev])
        setCurrentChat(data.chat)
        return data.chat
      }
    } catch (error) {
      console.error("Error creating chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load specific chat
  const loadChat = async (chatId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/chats/${chatId}`)
      const data = await response.json()

      if (response.ok) {
        setCurrentChat(data.chat)
        return data.chat
      }
    } catch (error) {
      console.error("Error loading chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update chat title
  const updateChat = async (chatId: string, title: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      const data = await response.json()

      if (response.ok) {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? data.chat : chat)))
        if (currentChat?.id === chatId) {
          setCurrentChat(data.chat)
        }
      }
    } catch (error) {
      console.error("Error updating chat:", error)
    }
  }

  // Delete chat
  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId))
        if (currentChat?.id === chatId) {
          setCurrentChat(null)
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }

  // Send message
  const sendMessage = async (chatId: string, content: string) => {
    try {
      setIsLoading(true)

      // Add user message immediately to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content,
        timestamp: new Date(),
      }

      // Update current chat with user message
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, userMessage],
              }
            : null,
        )
      }

      // Prepare messages for ChatGPT API
      const chatMessages = currentChat?.messages || []
      const allMessages = [...chatMessages, userMessage]

      const apiMessages = allMessages.map((msg) => ({
        id: msg.id,
        role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }))

      // Stream response from ChatGPT
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages, // Send properly formatted messages with roles
          chatId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "",
        timestamp: new Date(),
      }

      // Add assistant message placeholder to UI
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, assistantMessage],
              }
            : null,
        )
      }

      // Stream the response
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantContent += chunk

          // Update assistant message content in real-time
          if (currentChat?.id === chatId) {
            setCurrentChat((prev) =>
              prev
                ? {
                    ...prev,
                    messages: prev.messages.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg,
                    ),
                  }
                : null,
            )
          }
        }
      }

      // Check if response contains code
      const codeMatch = assistantContent.match(/```[\s\S]*?```/g)
      const generatedCode = codeMatch ? codeMatch.join("\n\n") : null

      return {
        messages: [userMessage, { ...assistantMessage, content: assistantContent }],
        generatedCode,
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }

      if (currentChat?.id === chatId) {
        setCurrentChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, errorMessage],
              }
            : null,
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  return {
    chats,
    currentChat,
    isLoading,
    createChat,
    loadChat,
    updateChat,
    deleteChat,
    sendMessage,
    refreshChats: fetchChats,
  }
}
