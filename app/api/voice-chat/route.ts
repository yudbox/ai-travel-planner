import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    console.log("\n💬 [VOICE-CHAT] Processing chat request");
    console.log("   Messages count:", messages.length);
    console.log(
      "   User message:",
      messages[messages.length - 1]?.content?.substring(0, 100),
    );

    // Call OpenAI Chat API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500, // Keep responses concise for voice
    });

    const aiMessage =
      response.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    console.log(
      "   ✅ AI response:",
      aiMessage.substring(0, 100) + (aiMessage.length > 100 ? "..." : ""),
    );
    console.log("   Tokens used:", response.usage?.total_tokens);

    return NextResponse.json({
      message: aiMessage,
      usage: response.usage,
    });
  } catch (error) {
    console.error("❌ [VOICE-CHAT] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
