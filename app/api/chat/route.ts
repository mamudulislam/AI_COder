import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { chatStorage } from "@/lib/chat-storage"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, chatId }: { messages: UIMessage[]; chatId?: string } = await req.json()

    console.log("[v0] Received messages:", messages)

    if (!messages || messages.length === 0) {
      console.error("[v0] No messages provided")
      return new Response("No messages provided", { status: 400 })
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        console.error("[v0] Invalid message format:", msg)
        return new Response("Invalid message format", { status: 400 })
      }
    }

    // Convert our message format to AI SDK format
    const modelMessages = convertToModelMessages(messages)
    console.log("[v0] Converted model messages:", modelMessages)

    const result = streamText({
      model: openai("gpt-4o-mini"), // Use gpt-4o-mini for better performance and cost
      messages: modelMessages,
      system: `You are an expert AI coding assistant. You help users with:
- Writing, debugging, and explaining code
- Code reviews and optimization suggestions
- Architecture and design patterns
- Best practices and conventions
- Problem-solving and algorithm design

Always provide clear, well-commented code examples and explain your reasoning.`,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return result.toTextStreamResponse({
      onFinish: async ({ text }) => {
        console.log("[v0] Response finished, saving to storage")
        // Save the conversation to our chat storage if chatId is provided
        if (chatId && text) {
          // Add user message
          const userMessage = messages[messages.length - 1]
          if (userMessage?.content) {
            chatStorage.addMessage(chatId, {
              type: "user",
              content:
                typeof userMessage.content === "string" ? userMessage.content : JSON.stringify(userMessage.content),
            })
          }

          // Add assistant response
          chatStorage.addMessage(chatId, {
            type: "assistant",
            content: text,
          })
        }
      },
    })
  } catch (error) {
    console.error("[v0] Error in chat API:", error)
    return new Response(`Error processing chat request: ${error}`, { status: 500 })
  }
}
