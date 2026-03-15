"use client";

import type { TaskConfig } from "../../tasks-config";
import { useTaskDemo } from "@/hooks/useTaskDemo";
import { SystemMessageInput } from "./TaskDemo/SystemMessageInput";
import { ExperimentButtons } from "./TaskDemo/ExperimentButtons";
import { ParameterControls } from "./TaskDemo/ParameterControls";
import { PromptInput } from "./TaskDemo/PromptInput";
import { SubmitButton } from "./TaskDemo/SubmitButton";
import { ChatConversation } from "./TaskDemo/ChatConversation";
import { ResponseDisplay } from "./TaskDemo/ResponseDisplay";
import { ErrorDisplay } from "./TaskDemo/ErrorDisplay";
import { Task6TokenLimits } from "./Task6TokenLimits";
import { Task7ImageGeneration } from "./Task7ImageGeneration";
import { Task9VoiceAssistant } from "./Task9VoiceAssistant";
import { TravelExperiences } from "./TravelExperiences";
import { MultiPersonalityChat } from "./MultiPersonalityChat";
import { SmartRAGAdvisor } from "./SmartRAGAdvisor";

interface TaskDemoProps {
  config: TaskConfig;
  slug: string[];
}

export function TaskDemo({ config, slug }: TaskDemoProps) {
  const state = useTaskDemo({ config, slug });

  // Special rendering for Module 2 Task 1 (Travel Experiences)
  if (config.module === "module2" && config.task === "task1") {
    return <TravelExperiences />;
  }

  // Special rendering for Module 3 Task 1 (Multi-Personality Chat)
  if (config.module === "module3" && config.task === "task1") {
    return <MultiPersonalityChat />;
  }

  // Special rendering for Module 3 Task 2 (Smart RAG Advisor)
  if (config.module === "module3" && config.task === "task2") {
    return <SmartRAGAdvisor />;
  }

  // Special rendering for Task 6 (Token Limits)
  if (config.task === "task6") {
    return <Task6TokenLimits />;
  }

  // Special rendering for Task 7 (Image Generation)
  if (config.task === "task7") {
    return <Task7ImageGeneration />;
  }

  // Special rendering for Task 9 (Voice Assistant)
  if (config.task === "task9") {
    return <Task9VoiceAssistant />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🧪 Try it Out
      </h2>

      {config.systemMessage && (
        <SystemMessageInput
          systemMessage={state.systemMessage}
          setSystemMessage={state.setSystemMessage}
        />
      )}

      {config.hasParameters && config.experimentPrompts && (
        <ExperimentButtons
          experiments={config.experimentPrompts}
          setPrompt={state.setPrompt}
          setTemperature={state.setTemperature}
          setTopP={state.setTopP}
          setMaxTokens={state.setMaxTokens}
          setN={state.setN}
          setFrequencyPenalty={state.setFrequencyPenalty}
          setSeed={state.setSeed}
        />
      )}

      {config.hasParameters && (
        <ParameterControls
          temperature={state.temperature}
          setTemperature={state.setTemperature}
          topP={state.topP}
          setTopP={state.setTopP}
          maxTokens={state.maxTokens}
          setMaxTokens={state.setMaxTokens}
          n={state.n}
          setN={state.setN}
          frequencyPenalty={state.frequencyPenalty}
          setFrequencyPenalty={state.setFrequencyPenalty}
          seed={state.seed}
          setSeed={state.setSeed}
        />
      )}

      <PromptInput
        prompt={state.prompt}
        setPrompt={state.setPrompt}
        makeAPICall={state.makeAPICall}
        config={config}
      />

      <SubmitButton
        loading={state.loading}
        makeAPICall={state.makeAPICall}
        config={config}
      />

      {config.isChatMode && (
        <ChatConversation
          chatMessages={state.chatMessages}
          setChatMessages={state.setChatMessages}
          loading={state.loading}
          config={config}
        />
      )}

      {!config.isChatMode && <ResponseDisplay response={state.response} />}

      <ErrorDisplay error={state.error} />
    </div>
  );
}
