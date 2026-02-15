import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("🔵 Chat API - Messages:", messages);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      system: "You are a helpful travel assistant.",
    });

    console.log("✅ Returning data stream");

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
