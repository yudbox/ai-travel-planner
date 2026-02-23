"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
type Language = "auto" | "en" | "ru" | "uk";

interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  audioUrl?: string;
  timestamp: Date;
}

const VOICES: { value: Voice; label: string; emoji: string }[] = [
  { value: "alloy", label: "Alloy", emoji: "🤖" },
  { value: "echo", label: "Echo", emoji: "🔊" },
  { value: "fable", label: "Fable", emoji: "📖" },
  { value: "onyx", label: "Onyx", emoji: "🎭" },
  { value: "nova", label: "Nova", emoji: "✨" },
  { value: "shimmer", label: "Shimmer", emoji: "💫" },
];

const LANGUAGES: { value: Language; label: string; emoji: string }[] = [
  { value: "auto", label: "Auto-detect", emoji: "🌍" },
  { value: "en", label: "English", emoji: "🇬🇧" },
  { value: "ru", label: "Русский", emoji: "🇷🇺" },
  { value: "uk", label: "Українська", emoji: "🇺🇦" },
];

export function Task9VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>("alloy");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("auto");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to find the best supported MIME type for Whisper
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
      ];

      const supportedMimeType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      console.log("🎙️ Supported MIME types checked:");
      mimeTypes.forEach((type) => {
        console.log(
          `   ${type}: ${MediaRecorder.isTypeSupported(type) ? "✅" : "❌"}`,
        );
      });
      console.log(`   Selected: ${supportedMimeType || "default"}`);

      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`   📊 Audio chunk received: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordingDuration = Date.now() - recordingStartTimeRef.current;
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        console.log("🎙️ Recording stopped:");
        console.log(`   Duration: ${recordingDuration}ms`);
        console.log(`   Total chunks: ${audioChunksRef.current.length}`);
        console.log(`   MIME type: ${mimeType}`);
        console.log(`   Total blob size: ${audioBlob.size} bytes`);

        // Validate recording duration (minimum 200ms - very short for testing)
        if (recordingDuration < 200) {
          setError(
            `Recording too short (${recordingDuration}ms)! Hold the button while speaking (minimum 200ms).`,
          );
          console.error(
            "   ❌ Recording too short:",
            recordingDuration,
            "ms (minimum 200ms required)",
          );
          stream.getTracks().forEach((track) => track.stop());
          setIsProcessing(false);
          return;
        }

        // Validate audio size (minimum 500 bytes - reduced for short test phrases)
        if (audioBlob.size < 500) {
          setError(
            `Recording too small (${audioBlob.size} bytes). Hold button longer while speaking.`,
          );
          console.error(
            "   ❌ Recording too small:",
            audioBlob.size,
            "bytes (minimum 500 bytes required)",
          );
          stream.getTracks().forEach((track) => track.stop());
          setIsProcessing(false);
          return;
        }

        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording with timeslice to collect data periodically
      recordingStartTimeRef.current = Date.now();
      mediaRecorder.start(100); // Collect data every 100ms
      console.log("🎙️ Recording started (collecting data every 100ms)");
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Failed to access microphone. Please grant permission.");
      console.error("Microphone error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    console.log("🎯 [VOICE] Starting audio processing pipeline");
    console.log("   Audio blob size:", audioBlob.size, "bytes");
    console.log("   Audio type:", audioBlob.type);
    console.log("   Selected language:", selectedLanguage);
    console.log("   Selected voice:", selectedVoice);

    try {
      // Step 1: Transcribe audio (STT)
      console.log("\n📤 [STEP 1/3] Sending audio to transcribe API...");

      // Determine file extension based on MIME type
      const mimeType = audioBlob.type;
      let extension = "webm";
      if (mimeType.includes("mp4")) extension = "mp4";
      else if (mimeType.includes("mpeg") || mimeType.includes("mp3"))
        extension = "mp3";
      else if (mimeType.includes("wav")) extension = "wav";
      else if (mimeType.includes("webm")) extension = "webm";

      const fileName = `recording.${extension}`;
      console.log("   File name:", fileName);

      const formData = new FormData();
      formData.append("audio", audioBlob, fileName);
      formData.append(
        "language",
        selectedLanguage === "auto" ? "" : selectedLanguage,
      );

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      console.log(
        "   Response status:",
        transcribeResponse.status,
        transcribeResponse.statusText,
      );

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("   ❌ Transcribe failed:", errorData);
        throw new Error(
          `Failed to transcribe audio: ${errorData.error || errorData.details || transcribeResponse.statusText}`,
        );
      }

      const { text: transcribedText } = await transcribeResponse.json();
      console.log("   ✅ Transcribed text:", transcribedText);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        text: transcribedText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Step 2: Get AI response
      console.log("\n📤 [STEP 2/3] Sending to GPT-4 voice chat API...");
      const chatResponse = await fetch("/api/voice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful travel assistant. Provide concise, friendly responses.",
            },
            { role: "user", content: transcribedText },
          ],
        }),
      });

      console.log(
        "   Response status:",
        chatResponse.status,
        chatResponse.statusText,
      );

      if (!chatResponse.ok) {
        const errorData = await chatResponse
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("   ❌ Chat failed:", errorData);
        throw new Error(
          `Failed to get AI response: ${errorData.error || chatResponse.statusText}`,
        );
      }

      const { message: aiResponse } = await chatResponse.json();
      console.log("   ✅ AI response:", aiResponse);

      // Step 3: Convert AI response to speech (TTS)
      console.log("\n📤 [STEP 3/3] Converting to speech (TTS)...");
      const ttsResponse = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiResponse,
          voice: selectedVoice,
        }),
      });

      console.log(
        "   Response status:",
        ttsResponse.status,
        ttsResponse.statusText,
      );

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("   ❌ TTS failed:", errorData);
        throw new Error(
          `Failed to generate speech: ${errorData.error || errorData.details || ttsResponse.statusText}`,
        );
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      console.log("   ✅ Generated audio:", audioBuffer.byteLength, "bytes");

      const ttsAudioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(ttsAudioBlob);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: aiResponse,
        audioUrl,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-play assistant response
      console.log("\n🔊 Playing audio response...");
      const audio = new Audio(audioUrl);
      audio.play();

      console.log("\n✅ [VOICE] Pipeline completed successfully!\n");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process audio";
      console.error("\n❌ [VOICE] Pipeline failed:", errorMessage);
      console.error("   Error details:", err);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">🎤 Voice AI Assistant</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Press and hold to speak. AI will respond with voice!
          </p>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                AI Voice:
              </label>
              <div className="flex flex-wrap gap-2">
                {VOICES.map((voice) => (
                  <Badge
                    key={voice.value}
                    variant={
                      selectedVoice === voice.value ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedVoice(voice.value)}
                  >
                    {voice.emoji} {voice.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Language:
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Badge
                    key={lang.value}
                    variant={
                      selectedLanguage === lang.value ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedLanguage(lang.value)}
                  >
                    {lang.emoji} {lang.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Record Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className={`w-32 h-32 rounded-full text-2xl ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                "⏳"
              ) : isRecording ? (
                <>
                  🔴
                  <br />
                  <span className="text-sm">Release</span>
                </>
              ) : (
                <>
                  🎤
                  <br />
                  <span className="text-sm">Hold</span>
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages History */}
      {messages.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">💬 Conversation History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-2xl">
                        {message.type === "user" ? "👤" : "🤖"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.audioUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => playAudio(message.audioUrl!)}
                            >
                              🔊 Play
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
