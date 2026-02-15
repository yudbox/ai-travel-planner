import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log("🔵 Prompt:", prompt);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a helpful travel assistant. ${prompt}`,
    });

    // Преобразуем textStream в Response напрямую
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          console.log("📤 Chunk:", chunk);
          const encoded = encoder.encode(chunk);
          controller.enqueue(encoded);
        }
        console.log("✅ Stream complete");
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
