import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { buildGenerateTextParams } from "../helpers";

// Initialize OpenAI client with your personal API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await params;

    // Parse slug: [module, task, ...optional]
    const module = slug[0];
    const task = slug[1];

    // Parse the request body
    const {
      prompt,
      systemMessage,
      temperature,
      topP,
      maxTokens,
      n,
      frequencyPenalty,
      seed,
      chatHistory,
    } = await request.json();

    if (!prompt && !chatHistory) {
      return NextResponse.json(
        { error: "Prompt or chat history is required" },
        { status: 400 },
      );
    }

    // Common API parameters
    const commonParams = {
      model: openai("gpt-4o-mini"),
      temperature: temperature !== undefined ? temperature : 0.7,
      topP: topP !== undefined ? topP : 0.9,
      maxTokens: maxTokens !== undefined ? maxTokens : 500,
      ...(n !== undefined && { n }),
      ...(frequencyPenalty !== undefined && { frequencyPenalty }),
      ...(seed !== undefined && { seed }),
    };

    // Build params and make single API call
    const apiRequestParams = buildGenerateTextParams(commonParams, {
      prompt,
      systemMessage,
      chatHistory,
    });

    const result = await generateText(apiRequestParams);
    const text = result.text;

    // Return the response
    return NextResponse.json({
      response: text,
      module,
      task,
      slug,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to call OpenAI API",
      },
      { status: 500 },
    );
  }
}
