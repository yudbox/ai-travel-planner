import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string | null;

    if (!audioFile) {
      console.error("❌ [TRANSCRIBE] No audio file provided");
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 },
      );
    }

    console.log("\n🎤 [TRANSCRIBE] Processing audio file");
    console.log("   File name:", audioFile.name);
    console.log("   File type:", audioFile.type);
    console.log("   File size:", audioFile.size, "bytes");
    console.log("   Language:", language || "auto-detect");
    console.log(
      "   OpenAI API Key:",
      process.env.OPENAI_API_KEY
        ? "✅ Present (" + process.env.OPENAI_API_KEY.substring(0, 10) + "...)"
        : "❌ Missing",
    );

    // Transcribe audio using Whisper
    console.log("   📡 Calling OpenAI Whisper API...");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: language || undefined, // auto-detect if not specified
    });

    console.log("   ✅ [TRANSCRIBE] Success!");
    console.log("   Transcribed text:", transcription.text);
    console.log("   Text length:", transcription.text.length, "characters\n");

    return NextResponse.json({
      text: transcription.text,
      language: language || "auto",
    });
  } catch (error) {
    console.error("❌ [TRANSCRIBE] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
