"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error to console
    console.error("💀 CRITICAL Global Error (layout crash):", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom right, #fee2e2, #fecaca)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "42rem",
              width: "100%",
              background: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <img
                src="https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif"
                alt="This is fine"
                style={{
                  height: "16rem",
                  width: "auto",
                  borderRadius: "0.5rem",
                  margin: "0 auto",
                }}
              />
            </div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#dc2626",
                marginBottom: "1rem",
              }}
            >
              💀 Critical Error
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#4b5563",
                marginBottom: "1.5rem",
              }}
            >
              Something went terribly wrong with the app layout
            </p>
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                }}
              >
                <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                  Debug Info:
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    color: "#991b1b",
                  }}
                >
                  {error.message}
                </p>
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  padding: "0.5rem 1.5rem",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  padding: "0.5rem 1.5rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
