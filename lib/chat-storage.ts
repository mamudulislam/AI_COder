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

class ChatStorage {
  private chats: { [chatId: string]: Chat } = {}
  private chatCounter = 1

  getAllChats(): Chat[] {
    return Object.values(this.chats).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  getChat(chatId: string): Chat | null {
    return this.chats[chatId] || null
  }

  createChat(title?: string): Chat {
    const newChat: Chat = {
      id: `chat_${this.chatCounter++}`,
      title: title || `Chat ${this.chatCounter - 1}`,
      messages: [
        {
          id: "1",
          type: "assistant",
          content:
            "Hello! I'm your AI coding assistant. I can help you generate, modify, and explain code. What would you like to work on?",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.chats[newChat.id] = newChat
    return newChat
  }

  updateChat(chatId: string, updates: Partial<Chat>): Chat | null {
    const chat = this.chats[chatId]
    if (!chat) return null

    Object.assign(chat, updates, { updatedAt: new Date() })
    return chat
  }

  deleteChat(chatId: string): boolean {
    if (!this.chats[chatId]) return false
    delete this.chats[chatId]
    return true
  }

  addMessage(chatId: string, message: Omit<Message, "id" | "timestamp">): Message | null {
    const chat = this.chats[chatId]
    if (!chat) return null

    const newMessage: Message = {
      id: Date.now().toString(),
      type: message.type,
      content: message.content,
      timestamp: new Date(),
    }

    chat.messages.push(newMessage)
    chat.updatedAt = new Date()
    return newMessage
  }
}

export const chatStorage = new ChatStorage()
export type { Chat, Message }
