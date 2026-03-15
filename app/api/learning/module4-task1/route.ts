import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { createDietPlanGraph } from "@/lib/diet-plan/graph";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/learning/module4-task1
 * Diet Plan Agent - Generate personalized 7-day diet plans with STREAMING
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, threadId = "diet-plan-default" } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    console.log("\n🚀 Diet Plan Agent Request (STREAMING):", {
      message,
      threadId,
    });

    // Create graph
    const graph = createDietPlanGraph();

    // Get current state from checkpointer to preserve previous values
    const config = { configurable: { thread_id: threadId } };
    const currentState = await graph.getState(config);

    console.log("📦 Current checkpoint state:", {
      dietType: currentState?.values?.dietType,
      goal: currentState?.values?.goal,
      messagesCount: currentState?.values?.messages?.length || 0,
    });

    // Create ReadableStream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedState: any = {
            dietType: currentState?.values?.dietType || undefined,
            goal: currentState?.values?.goal || undefined,
            restrictions: currentState?.values?.restrictions || [],
            recipes: currentState?.values?.recipes || [],
            similarPlans: currentState?.values?.similarPlans || [],
            generatedPlan: currentState?.values?.generatedPlan || undefined,
            messages: currentState?.values?.messages || [],
          };

          // Stream graph execution - append new message to existing messages
          for await (const chunk of await graph.stream(
            {
              messages: [
                ...accumulatedState.messages,
                new HumanMessage(message),
              ],
            },
            config,
          )) {
            // chunk is an object like: { nodeName: {...stateUpdate} }
            const nodeName = Object.keys(chunk)[0];
            const nodeData = chunk[nodeName as keyof typeof chunk];
            if (!nodeData) continue;

            // Accumulate state (merge, don't replace)
            accumulatedState = {
              ...accumulatedState,
              ...nodeData,
              dietType: nodeData.dietType || accumulatedState.dietType,
              goal: nodeData.goal || accumulatedState.goal,
              restrictions:
                nodeData.restrictions || accumulatedState.restrictions,
              recipes: nodeData.recipes || accumulatedState.recipes,
              similarPlans:
                nodeData.similarPlans || accumulatedState.similarPlans,
              generatedPlan:
                nodeData.generatedPlan || accumulatedState.generatedPlan,
              messages: nodeData.messages || accumulatedState.messages,
            };

            console.log(`📡 STREAMING NODE: ${nodeName}`, {
              dietType: accumulatedState.dietType,
              goal: accumulatedState.goal,
              recipesCount: accumulatedState.recipes?.length,
              similarPlansCount: accumulatedState.similarPlans?.length,
              hasPlan: !!accumulatedState.generatedPlan,
            });

            // Send SSE event with accumulated state
            const event = {
              type: "node",
              node: nodeName,
              state: {
                dietType: accumulatedState.dietType,
                goal: accumulatedState.goal,
                restrictions: accumulatedState.restrictions,
                recipesCount: accumulatedState.recipes?.length || 0,
                similarPlansCount: accumulatedState.similarPlans?.length || 0,
                hasPlan: !!accumulatedState.generatedPlan,
              },
              recipes: accumulatedState.recipes || [],
              similarPlans: accumulatedState.similarPlans || [],
              plan: accumulatedState.generatedPlan,
            };

            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          console.log("✅ Graph streaming completed");

          // Send final message
          const lastMessage =
            accumulatedState?.messages?.length > 0
              ? accumulatedState.messages[accumulatedState.messages.length - 1]
              : null;

          const response = lastMessage
            ? typeof lastMessage.content === "string"
              ? lastMessage.content
              : JSON.stringify(lastMessage.content)
            : "Diet plan generated successfully! ✅";

          const finalEvent = {
            type: "done",
            response,
            state: {
              dietType: accumulatedState?.dietType,
              goal: accumulatedState?.goal,
              restrictions: accumulatedState?.restrictions,
              recipesCount: accumulatedState?.recipes?.length || 0,
              similarPlansCount: accumulatedState?.similarPlans?.length || 0,
              hasPlan: !!accumulatedState?.generatedPlan,
            },
            recipes: accumulatedState?.recipes || [],
            similarPlans: accumulatedState?.similarPlans || [],
            plan: accumulatedState?.generatedPlan,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`),
          );
          controller.close();
        } catch (error) {
          console.error("❌ Streaming Error:", error);
          const errorEvent = {
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
          );
          controller.close();
        }
      },
    });

    // Return streaming response with SSE headers
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
