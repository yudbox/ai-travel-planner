interface ParameterControlsProps {
  temperature: number;
  setTemperature: (value: number) => void;
  topP: number;
  setTopP: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  n: number;
  setN: (value: number) => void;
  frequencyPenalty: number;
  setFrequencyPenalty: (value: number) => void;
  seed: number | undefined;
  setSeed: (value: number | undefined) => void;
}

export function ParameterControls({
  temperature,
  setTemperature,
  topP,
  setTopP,
  maxTokens,
  setMaxTokens,
  n,
  setN,
  frequencyPenalty,
  setFrequencyPenalty,
  seed,
  setSeed,
}: ParameterControlsProps) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        🎛️ API Parameters
      </h3>

      {/* Temperature Slider */}
      <div className="mb-4">
        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span>🌡️ Temperature: {temperature.toFixed(2)}</span>
          <span className="text-xs text-gray-500">
            {temperature < 0.4
              ? "Precise ❄️"
              : temperature < 0.8
                ? "Balanced ⚖️"
                : "Creative 🎨"}
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.0</span>
          <span>1.0</span>
          <span>2.0</span>
        </div>
      </div>

      {/* TopP Slider */}
      <div className="mb-4">
        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span>🥧 TopP: {topP.toFixed(2)}</span>
          <span className="text-xs text-gray-500">
            {topP < 0.4
              ? "Focused 🎯"
              : topP < 0.8
                ? "Moderate 📊"
                : "Diverse 🌈"}
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={topP}
          onChange={(e) => setTopP(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.0</span>
          <span>0.5</span>
          <span>1.0</span>
        </div>
      </div>

      {/* MaxTokens Slider */}
      <div className="mb-4">
        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span>🔢 Max Tokens: {maxTokens}</span>
          <span className="text-xs text-gray-500">
            {maxTokens < 100
              ? "Short 📝"
              : maxTokens < 300
                ? "Medium 📄"
                : "Long 📚"}
          </span>
        </label>
        <input
          type="range"
          min="20"
          max="500"
          step="10"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20</span>
          <span>250</span>
          <span>500</span>
        </div>
      </div>

      {/* N (Number of completions) Slider */}
      <div className="mb-4">
        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span>🎲 N (Completions): {n}</span>
          <span className="text-xs text-gray-500">
            {n === 1 ? "Single ⚡" : n <= 3 ? "Multiple 🎯" : "Many 🌟"}
          </span>
        </label>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={n}
          onChange={(e) => setN(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>3</span>
          <span>5</span>
        </div>
      </div>

      {/* Frequency Penalty Slider */}
      <div className="mb-4">
        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span>🔄 Frequency Penalty: {frequencyPenalty.toFixed(1)}</span>
          <span className="text-xs text-gray-500">
            {frequencyPenalty === 0
              ? "No penalty 🔁"
              : frequencyPenalty < 1
                ? "Low 📉"
                : "High 🚫"}
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={frequencyPenalty}
          onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.0</span>
          <span>1.0</span>
          <span>2.0</span>
        </div>
      </div>

      {/* Seed Input */}
      <div className="mb-4">
        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span>🌱 Seed (Optional)</span>
          <span className="text-xs text-gray-500">
            {seed ? "Fixed 🔒" : "Random 🎲"}
          </span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="e.g., 42"
            value={seed ?? ""}
            onChange={(e) =>
              setSeed(e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => setSeed(42)}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            Set 42
          </button>
          <button
            onClick={() => setSeed(undefined)}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
          >
            Clear
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Use same seed for reproducible results
        </p>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded">
        💡 <strong>Tip:</strong> Try the same prompt with different parameters
        to see how they affect the response!
      </p>
    </div>
  );
}
