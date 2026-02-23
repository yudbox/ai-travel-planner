import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "alloy" } = await req.json();

    if (!text || typeof text !== "string") {
      console.error("❌ [TTS] No text provided");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    console.log("\n🔊 [TTS] Converting text to speech");
    console.log("   Text length:", text.length, "characters");
    console.log(
      "   Text preview:",
      text.substring(0, 100) + (text.length > 100 ? "..." : ""),
    );
    console.log("   Voice:", voice);
    console.log(
      "   OpenAI API Key:",
      process.env.OPENAI_API_KEY
        ? "✅ Present (" + process.env.OPENAI_API_KEY.substring(0, 10) + "...)"
        : "❌ Missing",
    );

    // Generate speech using OpenAI TTS
    console.log("   📡 Calling OpenAI TTS API...");
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    console.log("   ✅ [TTS] Success!");
    console.log("   Generated audio:", buffer.length, "bytes");
    console.log("   Audio type: audio/mpeg\n");

    // Return audio as MP3
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("❌ [TTS] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate speech",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
