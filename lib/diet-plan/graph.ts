import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { extractPreferences } from "./nodes/extractPreferences";
import { askForPreferences } from "./nodes/askForPreferences";
import { reactAgent } from "./nodes/reactAgent";
import { retrieveMemory } from "./nodes/retrieveMemory";
import { generatePlan } from "./nodes/generatePlan";
import { saveMemory } from "./nodes/saveMemory";
import { shouldAskForPreferences } from "./utils/conditionalEdge";
import type { Recipe, SimilarPlan } from "./types";

/**
 * State Annotation for Diet Plan Agent
 */
const DietPlanAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  dietType: Annotation<string | undefined>({
    reducer: (acc, value) => value ?? acc, // Keep existing if new is undefined
    default: () => undefined,
  }),
  goal: Annotation<string | undefined>({
    reducer: (acc, value) => value ?? acc, // Keep existing if new is undefined
    default: () => undefined,
  }),
  restrictions: Annotation<string[] | undefined>({
    reducer: (acc, value) => value ?? acc, // Keep existing if new is undefined
    default: () => [],
  }),
  recipes: Annotation<Recipe[] | undefined>({
    reducer: (acc, value) => value ?? acc, // Keep existing if new is undefined
    default: () => [],
  }),
  similarPlans: Annotation<SimilarPlan[] | undefined>({
    reducer: (acc, value) => value ?? acc, // Keep existing if new is undefined
    default: () => [],
  }),
  generatedPlan: Annotation<string | undefined>({
    reducer: (acc, value) => value ?? acc, // Keep existing if new is undefined
    default: () => undefined,
  }),
  error: Annotation<string | undefined>({
    reducer: (acc, value) => value ?? acc, // Keep existing if new is undefined
    default: () => undefined,
  }),
});

/**
 * Global checkpointer instance - persists across requests
 * IMPORTANT: Must be singleton to preserve state between API calls
 */
const globalCheckpointer = new MemorySaver();

/**
 * Create the Diet Plan Agent StateGraph
 */
export function createDietPlanGraph() {
  // Initialize state graph with Annotation
  const workflow = new StateGraph(DietPlanAnnotation)
    .addNode("extractPreferences", extractPreferences)
    .addNode("askForPreferences", askForPreferences)
    .addNode("reactAgent", reactAgent)
    .addNode("retrieveMemory", retrieveMemory)
    .addNode("generatePlan", generatePlan)
    .addNode("saveMemory", saveMemory)
    // Set entry point
    .addEdge(START, "extractPreferences")
    // Add conditional edge from extractPreferences
    .addConditionalEdges("extractPreferences", shouldAskForPreferences, {
      askForPreferences: "askForPreferences",
      reactAgent: "reactAgent",
    })
    // askForPreferences loops back to END (user needs to provide more info)
    .addEdge("askForPreferences", END)
    // Normal edges: reactAgent → retrieveMemory → generatePlan → saveMemory → END
    .addEdge("reactAgent", "retrieveMemory")
    .addEdge("retrieveMemory", "generatePlan")
    .addEdge("generatePlan", "saveMemory")
    .addEdge("saveMemory", END);

  // Compile graph with GLOBAL checkpointer (persists between requests)
  const graph = workflow.compile({ checkpointer: globalCheckpointer });

  console.log("✅ StateGraph compiled successfully");

  return graph;
}
