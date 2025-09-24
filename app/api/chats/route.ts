import { type NextRequest, NextResponse } from "next/server"
import { chatStorage } from "@/lib/chat-storage"

export async function GET() {
  try {
    const chats = await chatStorage.getAllChats()
    return NextResponse.json({ chats })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()
    const newChat = await chatStorage.createChat(title)
    return NextResponse.json({ chat: newChat }, { status: 201 })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}
