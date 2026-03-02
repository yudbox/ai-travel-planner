import { AzureOpenAI } from "openai";
import { NextResponse } from "next/server";

// Increase timeout for image generation (DALL-E takes 10-30 seconds)
export const maxDuration = 60; // 60 seconds for Vercel/Next.js
export const dynamic = "force-dynamic";

// DALL-E configuration for DIAL
const model = "dall-e-3";
const endpoint = "https://ai-proxy.lab.epam.com";

const dalle3_config = {
  quality: "hd",
  size: "1024x1024",
  style: "vivid",
};

// Initialize Azure OpenAI with DIAL
const openai = new AzureOpenAI({
  apiVersion: "2023-12-01-preview",
  apiKey: process.env.DIAL_KEY,
  endpoint,
  deployment: model,
  timeout: 60000, // 60 seconds timeout
});

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    console.log(
      `🎨 [${requestId}] Generating image: "${prompt.substring(0, 60)}${prompt.length > 60 ? "..." : ""}"`,
    );

    const startTime = Date.now();

    // Use chat.completions.create for DIAL DALL-E
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model,
      // @ts-ignore - extraBody is not in types but supported by DIAL
      extraBody: {
        customFields: {
          configuration: dalle3_config,
        },
      },
    });

    const elapsed = Date.now() - startTime;
    console.log(
      `✅ [${requestId}] Generated in ${(elapsed / 1000).toFixed(1)}s`,
    );

    // Extract image URL from DIAL response
    // @ts-ignore - custom_content is DIAL-specific
    const customContent = response.choices[0]?.message?.custom_content as any;
    const attachments = customContent?.attachments;

    if (!attachments || attachments.length < 2) {
      console.error(`❌ [${requestId}] No image attachment in response`);
      throw new Error("No image attachment found in response");
    }

    // Second attachment contains the image URL
    const dialImageUrl = `${endpoint}/v1/${attachments[1].url}`;

    // Create proxied URL that browser can access
    const proxiedImageUrl = `/api/image-proxy?url=${encodeURIComponent(dialImageUrl)}`;

    return NextResponse.json({
      success: true,
      imageUrl: proxiedImageUrl,
      revisedPrompt: attachments[1].title || prompt, // DALL-E often revises prompts
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Error:`, error);

    // Return detailed error message
    let errorMessage = "Failed to generate image";
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage =
          "Request timeout - DALL-E generation took too long. Try again.";
      } else if (error.message.includes("quota")) {
        errorMessage = "API quota exceeded. Check your DIAL limits.";
      } else if (error.message.includes("rate_limit")) {
        errorMessage = "Rate limit exceeded. Wait a few minutes and try again.";
      } else if (error.message.includes("insufficient")) {
        errorMessage =
          "Insufficient quota or balance. Check your DIAL account.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
