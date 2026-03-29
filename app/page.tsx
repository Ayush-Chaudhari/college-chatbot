// app/page.tsx

"use client";
import { useState, useEffect } from "react";
import UploadPanel from "@/components/UploadPanel";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: unknown[];
}

export default function Home() {
const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat-history");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        role: "assistant",
        content: "Hi! I'm your college assistant. Ask me anything about fees, hostel rules, syllabus, or academic calendar!",
      },
    ];
  });
const [input, setInput] = useState("");
useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat-history", JSON.stringify(messages));
    }
  }, [messages]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources ? [...new Set<string>(data.sources)] : [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
{/* Header */}
<div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center">
  <div>
    <h1 className="text-xl font-semibold text-gray-800">
      College Assistant
    </h1>
    <p className="text-sm text-gray-500">
      Powered by RAG — answers from your college documents
    </p>
  </div>
  <button
    onClick={() => {
      localStorage.removeItem("chat-history");
      setMessages([{
        role: "assistant",
        content: "Hi! I'm your college assistant. Ask me anything about fees, hostel rules, syllabus, or academic calendar!",
      }]);
    }}
    className="text-sm text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 px-3 py-1.5 rounded-lg transition-colors"
  >
    Clear Chat
  </button>
</div>

      {/* Admin Upload Panel */}
      <div className="px-4 py-4 max-w-2xl mx-auto w-full">
        <UploadPanel />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Sources:</p>
                  {[...new Set(msg.sources as string[])].map((source, idx) => (
                  <span
                key={idx}
                  className="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mr-1 mb-1"
                  >
        {source}
      </span>
    ))}
  </div>
)}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}/>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}/>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about fees, hostel, syllabus..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}
