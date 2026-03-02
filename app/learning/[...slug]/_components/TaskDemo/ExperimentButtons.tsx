import type { TaskConfig } from "../../../tasks-config";
import { Button } from "@/components/ui/button";

interface ExperimentButtonsProps {
  experiments: NonNullable<TaskConfig["experimentPrompts"]>;
  setPrompt: (value: string) => void;
  setTemperature: (value: number) => void;
  setTopP: (value: number) => void;
  setMaxTokens: (value: number) => void;
  setN: (value: number) => void;
  setFrequencyPenalty: (value: number) => void;
  setSeed: (value: number | undefined) => void;
}

export function ExperimentButtons({
  experiments,
  setPrompt,
  setTemperature,
  setTopP,
  setMaxTokens,
  setN,
  setFrequencyPenalty,
  setSeed,
}: ExperimentButtonsProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        🎯 Quick Experiments:
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {experiments.map((exp, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => {
              setPrompt(exp.prompt);
              setTemperature(exp.recommendedParams.temperature ?? 0.7);
              setTopP(exp.recommendedParams.topP ?? 0.9);
              setMaxTokens(exp.recommendedParams.maxTokens ?? 150);
              setN(exp.recommendedParams.n ?? 1);
              setFrequencyPenalty(
                exp.recommendedParams.frequencyPenalty ?? 0.0,
              );
              setSeed(exp.recommendedParams.seed);
            }}
            className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 justify-start h-auto"
          >
            {exp.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        💡 Click a button to load a prompt with recommended parameters
      </p>
    </div>
  );
}
