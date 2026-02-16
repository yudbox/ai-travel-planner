import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("🟢 Incoming messages:", messages);

    const modelMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: (msg.parts || [])
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join(""),
    }));
    console.log("🟡 Converted to ModelMessages:", modelMessages);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: modelMessages,
      system: "You are a helpful travel assistant.",
    });
    console.log("🟠 streamText result:", result);

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
