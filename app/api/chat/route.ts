import { openai } from "@ai-sdk/openai"
import { streamText, type UIMessage } from "ai"
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
      if (!msg.role || typeof msg.content !== 'string') {
        console.error("[v0] Invalid message format:", msg)
        return new Response("Invalid message format", { status: 400 })
      }
    }

    const result = streamText({
      model: openai("gpt-4o-mini"), // Use gpt-4o-mini for better performance and cost
      messages,
      system: `You are an expert AI coding assistant, designed to provide helpful and high-quality code. Your goal is to assist users by writing, debugging, and explaining code, offering code reviews, and suggesting optimizations.

When generating code, you must adhere to the following principles:
- **Modern Standards:** Your code should follow modern best practices and the latest language standards.
- **Clean and Readable:** Write code that is easy to understand, well-structured, and maintainable. Use meaningful variable names and a consistent style.
- **Performance and Security:** Keep performance and security in mind. Avoid common pitfalls and write efficient code.
- **Well-Commented:** Provide clear and concise comments for complex logic to explain the 'why', not just the 'what'.
- **Complete Solutions:** Offer complete and working code examples whenever possible.
- **Clarity First:** If a user's request is ambiguous, ask for clarification before generating code to ensure you meet their needs.

Always explain your reasoning and the trade-offs of your proposed solutions.`,
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
            await chatStorage.addMessage(chatId, {
              type: "user",
              content:
                typeof userMessage.content === "string" ? userMessage.content : JSON.stringify(userMessage.content),
            })
          }

          // Add assistant response
          await chatStorage.addMessage(chatId, {
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
