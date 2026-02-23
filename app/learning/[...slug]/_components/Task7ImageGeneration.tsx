"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EXAMPLE_PROMPTS = [
  "A futuristic cityscape at sunset",
  "A dragon flying over a mountain",
  "A cozy cabin in the woods during winter",
  "A robot painting a portrait",
  "A mystical forest with glowing mushrooms",
  "An astronaut riding a horse on Mars",
];

export function Task7ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setImageUrl(null);
    setRevisedPrompt(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setImageUrl(data.imageUrl);
      setRevisedPrompt(data.revisedPrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter your image prompt:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>🎨 Generate Image</>
            )}
          </Button>

          {/* Example Prompts */}
          <div>
            <p className="text-sm font-medium mb-2">Example prompts:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-300 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400">
                  Error
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-pulse text-6xl">🎨</div>
              <p className="text-lg font-medium">Creating your image...</p>
              <p className="text-sm text-gray-500">
                This may take 10-30 seconds
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Image */}
      {imageUrl && !loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">✅ Generated Image</h3>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open in new tab →
              </a>
            </div>

            {/* Revised Prompt */}
            {revisedPrompt && revisedPrompt !== prompt && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                  📝 DALL-E revised your prompt to:
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  {revisedPrompt}
                </p>
              </div>
            )}

            {/* Image Display - Production optimized */}
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <Image
                src={imageUrl}
                alt={prompt}
                width={1024}
                height={1024}
                className="w-full h-auto"
                unoptimized
                priority
                onError={() => setError("Failed to load image")}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
            </div>

            {/* Image Info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Model:</span>
                <span className="font-semibold">DALL-E 3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span className="font-semibold">1024x1024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Quality:
                </span>
                <span className="font-semibold">HD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Style:</span>
                <span className="font-semibold">Vivid</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            💡 Tips for better prompts:
          </h4>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
            <li>• Be specific about style, colors, and composition</li>
            <li>• Mention lighting conditions (sunset, twilight, etc.)</li>
            <li>
              • Add artistic styles (photorealistic, cartoon, oil painting)
            </li>
            <li>• Include mood and atmosphere descriptors</li>
            <li>• DALL-E may revise your prompt for safety and clarity</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
