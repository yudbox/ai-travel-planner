import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";

// Store conversation histories per session
const messageHistories = new Map<string, ChatMessageHistory>();

// Define AI personality modes with their system messages
const AI_MODES = {
  travelGuide: {
    name: "Travel Guide",
    emoji: "🗺️",
    systemMessage:
      "You are an expert travel guide with deep knowledge of destinations worldwide. Provide detailed, engaging descriptions of places, including history, culture, hidden gems, and practical tips. Be enthusiastic and paint vivid pictures with your words.",
  },
  budgetAdvisor: {
    name: "Budget Advisor",
    emoji: "💰",
    systemMessage:
      "You are a budget travel expert who helps travelers save money without sacrificing experiences. Always mention specific prices, cost-saving tips, affordable accommodations, free attractions, and best deals. Structure answers with clear budget breakdowns.",
  },
  adventurePlanner: {
    name: "Adventure Planner",
    emoji: "🏔️",
    systemMessage:
      "You are an extreme sports and adventure travel specialist. Recommend thrilling activities like hiking, diving, paragliding, rock climbing, surfing, and off-the-beaten-path experiences. Focus on adrenaline-pumping adventures and safety tips.",
  },
  foodExpert: {
    name: "Food & Culture Expert",
    emoji: "🍷",
    systemMessage:
      "You are a culinary and cultural expert specializing in local cuisines, traditional dishes, food markets, restaurants, and cultural traditions. Share food stories, recommend authentic eateries, and explain cultural significance of dishes.",
  },
};

export async function POST(request: Request) {
  try {
    const { message, mode, sessionId, action } = await request.json();

    // Handle clear history action
    if (action === "clear") {
      if (sessionId && messageHistories.has(sessionId)) {
        messageHistories.delete(sessionId);
      }
      return NextResponse.json({ success: true, message: "History cleared" });
    }

    // Handle export history action
    if (action === "export") {
      const history = messageHistories.get(sessionId);
      if (!history) {
        return NextResponse.json({ messages: [] });
      }
      const messages = await history.getMessages();
      return NextResponse.json({
        messages: messages.map((msg: BaseMessage) => ({
          type: msg._getType(),
          content: msg.content,
        })),
      });
    }

    // Validate required fields for chat
    if (!message || !mode || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields: message, mode, sessionId" },
        { status: 400 },
      );
    }

    // Validate mode
    if (!AI_MODES[mode as keyof typeof AI_MODES]) {
      return NextResponse.json(
        {
          error: `Invalid mode. Must be one of: ${Object.keys(AI_MODES).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const selectedMode = AI_MODES[mode as keyof typeof AI_MODES];

    // Get or create message history for this session
    if (!messageHistories.has(sessionId)) {
      messageHistories.set(sessionId, new ChatMessageHistory());
    }

    // Initialize ChatOpenAI model
    const chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 500,
    });

    // Create prompt template with selected mode's system message
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", selectedMode.systemMessage],
      new MessagesPlaceholder("history"),
      ["user", "{input}"],
    ]);

    // Create chain with history
    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: promptTemplate.pipe(chatModel).pipe(new StringOutputParser()),
      inputMessagesKey: "input",
      historyMessagesKey: "history",
      getMessageHistory: (_sessionId: string) =>
        messageHistories.get(_sessionId)!,
    });

    // Measure execution time
    const startTime = Date.now();

    // Invoke chain
    const response = await chainWithHistory.invoke(
      { input: message },
      { configurable: { sessionId } },
    );

    const executionTime = Date.now() - startTime;

    // Get updated message count
    const history = messageHistories.get(sessionId);
    const messages = history ? await history.getMessages() : [];
    const messageCount = messages.length;

    return NextResponse.json({
      response,
      mode: selectedMode.name,
      modeEmoji: selectedMode.emoji,
      executionTime,
      messageCount,
      chainVisualization: {
        steps: [
          {
            name: "Prompt Template",
            description: `Added system message for ${selectedMode.name}`,
            emoji: "📝",
          },
          {
            name: "ChatGPT",
            description: "Generated response with personality",
            emoji: "🤖",
          },
          {
            name: "String Parser",
            description: "Extracted clean text",
            emoji: "✂️",
          },
        ],
      },
    });
  } catch (error: unknown) {
    console.error("Error in module3-task1:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
