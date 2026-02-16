// feat: streaming logic — server action for streaming completion

"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "@ai-sdk/rsc";

export async function streamCompletion(input: string) {
  const stream = createStreamableValue("");
  (async () => {
    const { textStream } = await streamText({
      model: openai("gpt-4o-mini"),
      prompt: input,
    });
    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();
  return stream.value;
}
