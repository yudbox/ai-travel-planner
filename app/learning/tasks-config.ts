export interface TaskConfig {
  module: string;
  moduleTitle: string;
  task: string;
  title: string;
  description: string;
  objectives: string[];
  defaultPrompt: string;
  systemMessage?: string; // For tasks with system role (task2+)
  hasParameters?: boolean; // For task3 - show parameter controls
  isChatMode?: boolean; // For task4 - chat interface without context
  hasContext?: boolean; // For task5 - chat WITH context (sends history)
  experimentPrompts?: {
    // For task3 - pre-made prompts for experiments
    label: string;
    prompt: string;
    recommendedParams: {
      temperature?: number;
      topP?: number;
      maxTokens?: number;
      n?: number;
      frequencyPenalty?: number;
      seed?: number;
    };
  }[];
  explanation: {
    step: string;
    description: string;
  }[];
  nextTask?: string;
}

export const tasksConfig: Record<string, TaskConfig> = {
  "module1-task1": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task1",
    title: "First API Call",
    description:
      "Make your first request to the OpenAI API and display the response.",
    objectives: [
      "Make your first prompt to the OpenAI API",
      "Display the response in the UI",
      "Handle errors properly",
    ],
    defaultPrompt:
      "Provide me advice what exercises should I do for my back pain?",
    explanation: [
      {
        step: "Initialize OpenAI Client",
        description:
          "The API route creates an OpenAI client with your API key from environment variables.",
      },
      {
        step: "Create Completion Request",
        description:
          "Send a prompt to the API using Vercel AI SDK's generateText function",
      },
      {
        step: "Handle Response",
        description:
          "Extract the AI's message from the response and display it in the UI.",
      },
      {
        step: "Error Handling",
        description:
          "Catch and display any errors that occur during the API call.",
      },
    ],
    nextTask: "module1/task2",
  },
  "module1-task2": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task2",
    title: "Understanding Roles",
    description:
      "Learn about system, user, and assistant roles in chat completions.",
    objectives: [
      "Understand the difference between system, user, and assistant roles",
      "Implement a conversation with multiple roles",
      "See how system messages affect AI behavior",
    ],
    systemMessage: "You are a health coach and fitness trainer.",
    defaultPrompt:
      "Provide me advice what exercises should I do for my back pain?",
    explanation: [
      {
        step: "System Role (Developer)",
        description:
          "Sets the AI's personality, expertise, and behavior. Has priority over user messages. Example: 'You are a health coach' makes responses professional and fitness-focused.",
      },
      {
        step: "User Role",
        description:
          "The actual user's question or request. This is what the end-user types in the chat.",
      },
      {
        step: "Messages Array",
        description:
          "Instead of a single prompt, we send an array of message objects with roles: [{ role: 'system', content: '...' }, { role: 'user', content: '...' }]",
      },
      {
        step: "Response Quality",
        description:
          "Compare responses with and without system role - notice how specialized and accurate the AI becomes when given proper context.",
      },
    ],
    nextTask: "module1/task3",
  },
  "module1-task3": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task3",
    title: "API Parameters",
    description:
      "Learn how to control AI behavior with temperature, topP, maxTokens, N, frequencyPenalty, and seed parameters.",
    objectives: [
      "Understand how temperature affects creativity and randomness",
      "Learn how topP controls output diversity",
      "Manage response length with maxTokens",
      "Generate multiple response variants with N parameter",
      "Reduce repetition using frequencyPenalty",
      "Create reproducible results with seed",
      "Compare responses with different parameter settings",
    ],
    hasParameters: true,
    defaultPrompt: "Tell me something interesting about space.",
    experimentPrompts: [
      {
        label: "🌡️ Temperature Experiment",
        prompt: "Tell me something interesting about space.",
        recommendedParams: {
          temperature: 0.2,
          topP: 0.9,
          maxTokens: 150,
        },
      },
      {
        label: "🥧 TopP Experiment",
        prompt: "Explain the importance of recycling.",
        recommendedParams: {
          temperature: 0.7,
          topP: 0.2,
          maxTokens: 150,
        },
      },
      {
        label: "🔢 MaxTokens Experiment",
        prompt: "Describe the process of photosynthesis.",
        recommendedParams: {
          temperature: 0.7,
          topP: 0.9,
          maxTokens: 50,
        },
      },
      {
        label: "💎 Creative vs Precise",
        prompt: "Write a short poem about the ocean.",
        recommendedParams: {
          temperature: 0.9,
          topP: 0.95,
          maxTokens: 100,
        },
      },
      {
        label: "🤖 Technical Explanation",
        prompt: "What is artificial intelligence?",
        recommendedParams: {
          temperature: 0.3,
          topP: 0.5,
          maxTokens: 200,
        },
      },
      {
        label: "🎲 Multiple Responses (N)",
        prompt: "What are the benefits of meditation?",
        recommendedParams: {
          temperature: 0.8,
          topP: 0.9,
          maxTokens: 150,
          n: 3,
        },
      },
      {
        label: "🔄 Avoid Repetition",
        prompt: "Write a short poem about the ocean.",
        recommendedParams: {
          temperature: 0.9,
          topP: 0.95,
          maxTokens: 100,
          frequencyPenalty: 1.5,
        },
      },
      {
        label: "🌱 Reproducible Results (Seed)",
        prompt: "What is artificial intelligence?",
        recommendedParams: {
          temperature: 0.7,
          topP: 0.9,
          maxTokens: 150,
          seed: 42,
        },
      },
    ],
    explanation: [
      {
        step: "Temperature (0.0-2.0)",
        description:
          "Controls randomness: 0.2 = predictable/factual, 0.7 = balanced, 0.9+ = creative/random. Try the same prompt with 0.2 vs 0.8 to see the difference!",
      },
      {
        step: "TopP (0.0-1.0)",
        description:
          "Nucleus sampling - controls vocabulary diversity: 0.2 = focused/narrow words, 0.9 = diverse/creative words. Lower = more predictable, higher = more variety.",
      },
      {
        step: "MaxTokens",
        description:
          "Maximum response length in tokens (~4 chars = 1 token). 50 = tweet, 150 = paragraph, 500+ = article. Controls how long the AI can respond.",
      },
      {
        step: "Combining Parameters",
        description:
          "Use together for fine control: low temp + low topP = precise answers, high temp + high topP = creative content. Adjust based on your use case!",
      },
      {
        step: "N - Number of Completions (1+)",
        description:
          "Generate multiple response variants: n=1 for single answer, n=3 for 3 different variations. Great for brainstorming! ⚠️ May not work with all DIAL deployments.",
      },
      {
        step: "FrequencyPenalty (0.0-2.0)",
        description:
          "Reduces word repetition: 0.0 = repetition OK, 1.5 = avoid repeating words. Higher values create more diverse vocabulary. Perfect for creative writing!",
      },
      {
        step: "Seed (any number)",
        description:
          "Makes results reproducible: same seed + same params + same prompt = similar output. Essential for testing and debugging. Try seed=42 twice!",
      },
    ],
    nextTask: "module1/task4",
  },
  "module1-task4": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task4",
    title: "Chatbot without Context",
    description:
      "Build a chatbot that responds to each message independently without remembering previous conversation.",
    objectives: [
      "Create a chat interface with message history",
      "Send only current message to API (no context)",
      "Understand limitations of stateless conversations",
      "See why context management is needed",
    ],
    isChatMode: true,
    defaultPrompt: "What are three key points of being healthy?",
    explanation: [
      {
        step: "No Context Management",
        description:
          "Each message is sent independently - the bot doesn't remember previous messages. Only the latest user message is sent to the API.",
      },
      {
        step: "Stateless Conversations",
        description:
          "The bot treats every question as brand new. References like 'the first one', 'that', 'it' won't work because there's no history.",
      },
      {
        step: "Visual History Only",
        description:
          "Messages are displayed in the UI for user convenience, but the AI doesn't receive them. It's like talking to someone with amnesia.",
      },
      {
        step: "Why This Matters",
        description:
          "Try asking a follow-up question like 'Tell me more about the first point' - the bot won't understand because it doesn't remember what 'first point' refers to.",
      },
    ],
    nextTask: "module1/task5",
  },
  "module1-task5": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task5",
    title: "Chatbot with Context",
    description:
      "Build a chatbot that maintains conversation history and context.",
    objectives: [
      "Understand context management",
      "Send conversation history to API",
      "Enable natural follow-up questions",
      "Compare with Task 4 to see the difference",
    ],
    isChatMode: true,
    hasContext: true,
    defaultPrompt: "My weight is 80 kg. How can I lose weight?",
    explanation: [
      {
        step: "Context Management",
        description:
          "All previous messages are sent to the API, allowing the bot to understand references and maintain coherent conversation.",
      },
      {
        step: "Follow-up Questions",
        description:
          "You can ask 'Tell me more about the first one' and the bot will understand what you're referring to. Or 'What is my weight?' and it will remember from history.",
      },
      {
        step: "Message History Array",
        description:
          "Every user and assistant message is included in the API request as messages array: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]",
      },
      {
        step: "Try This Test",
        description:
          "Ask: 'My weight is 80kg. How to lose weight?' → Get response → Then ask: 'What is my weight?' → Bot will remember 80kg!",
      },
    ],
    nextTask: "module1/task6",
  },
  "module1-task6": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task6",
    title: "Token Limits Management",
    description:
      "Learn 4 strategies to manage token limits in long conversations.",
    objectives: [
      "Understand what tokens are and why limits matter",
      "Compare Rolling Context strategy (simplicity)",
      "Compare Summarized History strategy (balance)",
      "Compare Categorized Excerpts strategy (scalability)",
      "Compare Hybrid Approach (production-ready, best overall)",
      "Learn when to use each approach",
    ],
    defaultPrompt: "",
    explanation: [
      {
        step: "What Are Tokens?",
        description:
          "Tokens are pieces of text that AI models process. ~1 token ≈ 0.75 words. For example, 'Hello world!' ≈ 3 tokens. Models have hard limits: GPT-4 = 8,192 tokens.",
      },
      {
        step: "Why Limits Matter",
        description:
          "In a chatbot with long history, you'll quickly exceed token limits. If history is 10,000 tokens but limit is 8,192 → API error. Need strategies to manage context.",
      },
      {
        step: "Strategy 1: Rolling Context",
        description:
          "Delete oldest messages when limit exceeded. PROS: Simple, fast, no extra cost. CONS: Lose old context completely. Best for: Short chats where old context isn't critical.",
      },
      {
        step: "Strategy 2: Summarized History",
        description:
          "AI compresses old messages into summaries. PROS: Preserve context essence, maintain coherence. CONS: Extra API calls (cost), can lose details. Best for: Important conversations.",
      },
      {
        step: "Strategy 3: Categorized Excerpts",
        description:
          "Split conversation into topics, send only relevant ones. PROS: Scales to huge histories, efficient token use. CONS: Complex, many API calls. Best for: Multi-topic, long histories.",
      },
      {
        step: "Strategy 4: Hybrid Approach 🧩",
        description:
          "Combines ALL previous strategies: Categories + Summarization + Priorities (Tier 1/2/3). GitHub Copilot uses this! PROS: Production-ready, smart prioritization, best balance. CONS: Most complex, requires tuning. Best for: Production chatbots.",
      },
      {
        step: "Interactive Demo",
        description:
          "Use the interactive demos above to test each strategy. Send multiple messages and watch how each handles token limits differently. Compare trade-offs! Read HYBRID_STRATEGY_EXPLAINED.md for deep dive.",
      },
    ],
  },
  "module1-task7": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task7",
    title: "Generating Images with DALL-E",
    description:
      "Generate images using the DALL-E 3 model from OpenAI. Explore creative possibilities with text-to-image generation.",
    objectives: [
      "Generate images using DALL-E based on text prompts",
      "Understand DALL-E 3 configuration options",
      "Experiment with different prompts and styles",
      "Learn prompt engineering for better results",
    ],
    defaultPrompt: "A futuristic cityscape at sunset",
    explanation: [
      {
        step: "Initialize DALL-E 3",
        description:
          "Configure Azure OpenAI with DIAL to use DALL-E 3. Set quality to 'hd', size to '1024x1024', and style to 'vivid' for best results.",
      },
      {
        step: "Send Text Prompt",
        description:
          "Use chat.completions.create with extraBody.customFields.configuration for DIAL. DALL-E may revise your prompt for safety and clarity.",
      },
      {
        step: "Extract Image URL",
        description:
          "DIAL returns attachments in response. The second attachment contains the image URL. Construct full URL: ${endpoint}/v1/${attachmentUrl}.",
      },
      {
        step: "Display Generated Image",
        description:
          "Show the image in the UI with metadata (model, size, quality, style). Allow users to open in new tab or download.",
      },
      {
        step: "Prompt Engineering Tips",
        description:
          "Be specific about style, colors, composition, lighting, and mood. Mention artistic styles (photorealistic, cartoon, oil painting). DALL-E excels at creative combinations!",
      },
    ],
    nextTask: "module1/task9",
  },
  "module1-task9": {
    module: "module1",
    moduleTitle: "OpenAI Essentials 🚀",
    task: "task9",
    title: "Voice AI Assistant",
    description:
      "Create an interactive voice assistant using OpenAI's Whisper (Speech-to-Text) and TTS (Text-to-Speech) APIs. Record voice input, transcribe it, get AI responses, and hear them spoken back.",
    objectives: [
      "Record voice input using browser MediaRecorder API",
      "Transcribe speech to text with Whisper (multilingual support)",
      "Generate AI responses with GPT-4",
      "Convert responses to speech with OpenAI TTS",
      "Build a conversational voice interface with history",
    ],
    defaultPrompt: "",
    explanation: [
      {
        step: "Browser Audio Capture",
        description:
          "Use navigator.mediaDevices.getUserMedia to request microphone permission. MediaRecorder captures audio as WebM format for Whisper API.",
      },
      {
        step: "Speech-to-Text with Whisper",
        description:
          "Send recorded audio to /api/transcribe. Whisper supports 50+ languages with auto-detection. Select language (auto, English, Russian, Ukrainian) for better accuracy.",
      },
      {
        step: "GPT-4 Conversation",
        description:
          "Send transcribed text to the chat API. Maintain conversation history for context. GPT-4 generates intelligent responses based on user's voice input.",
      },
      {
        step: "Text-to-Speech Synthesis",
        description:
          "Convert AI response to speech using /api/text-to-speech. Choose from 6 voices: Alloy (neutral), Echo (warm), Fable (expressive), Onyx (deep), Nova (feminine), Shimmer (bright).",
      },
      {
        step: "Interactive Voice UI",
        description:
          "Hold-to-talk button for recording (supports mouse and touch). View conversation history. Replay any AI response. Select voice and language preferences. Visual feedback during recording and processing.",
      },
    ],
  },
};

export function getTaskConfig(module: string, task: string): TaskConfig | null {
  const key = `${module}-${task}`;
  return tasksConfig[key] || null;
}

export function getAllTasks() {
  return Object.values(tasksConfig);
}
