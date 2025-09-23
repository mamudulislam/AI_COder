import { type NextRequest, NextResponse } from "next/server"
import { chatStorage } from "@/lib/chat-storage"

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params
    const chat = chatStorage.getChat(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params
    const { title } = await request.json()

    const updatedChat = chatStorage.updateChat(chatId, { title })
    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({ chat: updatedChat })
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params
    const deleted = chatStorage.deleteChat(chatId)

    if (!deleted) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Chat deleted successfully" })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 })
  }
}
