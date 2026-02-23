"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details to console for debugging
    console.error("🔥 Global Error Handler caught an error:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-6 flex justify-center">
            {/* Funny dog GIF from Giphy */}
            <img
              src="https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif"
              alt="This is fine dog"
              className="h-64 w-auto rounded-lg object-cover"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
            🔥 Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">
              Don&apos;t worry, it&apos;s not you... it&apos;s probably us 🐕
            </p>
          </div>

          {/* Error details for development */}
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="mb-2 font-semibold text-red-800 dark:text-red-300">
                Debug Info (dev only):
              </p>
              <p className="font-mono text-sm text-red-700 dark:text-red-400">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-500">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => reset()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              🔄 Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
            >
              🏠 Go to Home Page
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            If this problem persists, please check the console for more details
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
