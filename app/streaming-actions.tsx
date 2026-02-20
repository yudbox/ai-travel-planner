// feat: streaming logic — server action for streaming completion

"use server";

import React from "react";
import { streamText, streamObject, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { streamUI } from "@ai-sdk/rsc";
import { MarkdownContent } from "./components/MarkdownContent";
import { z } from "zod";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function streamCompletion(input: string) {
  const stream = createStreamableValue("");
  (async () => {
    const { textStream } = await streamText({
      model: openai(OPENAI_MODEL),
      prompt: input,
    });
    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();
  return stream.value;
}

export async function getPeopleData(input: string) {
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai(OPENAI_MODEL),
      system: "You generate fake data for three people",
      prompt: input,
      schema: z.object({
        people: z.array(
          z.object({
            name: z.string().describe("name of a fake person"),
            address: z.string().describe("US address format"),
            age: z.number(),
          }),
        ),
      }),
    });
    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }
    stream.done();
  })();
  return { object: stream.value };
}

export async function streamComponent() {
  const result = await streamUI({
    model: openai(OPENAI_MODEL),
    prompt:
      "Give me some advice on how to plan a trip to Telluride, Colorado. Provide a comprehensive guide with sections, lists, and bold text in markdown format.",
    text: ({ content }) => <MarkdownContent content={content} />,
  });
  return result.value;
}
