import { type NextRequest, NextResponse } from "next/server"
import { chatStorage } from "@/lib/chat-storage"

export async function POST(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params
    const { content, type } = await request.json()

    if (!content || !type) {
      return NextResponse.json({ error: "Content and type are required" }, { status: 400 })
    }

    const message = await chatStorage.addMessage(chatId, { content, type })
    if (!message) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error adding message:", error)
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params
    const chat = await chatStorage.getChat(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({ messages: chat.messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
