"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode = "coach" | "quiz" | "mock-interview";
type ModelId = "claude-sonnet-4-6-20250514" | "claude-haiku-4-5-20251001" | "claude-opus-4-6";

const MODEL_OPTIONS: { id: ModelId; label: string }[] = [
  { id: "claude-sonnet-4-6-20250514", label: "Sonnet 4.6" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku" },
  { id: "claude-opus-4-6", label: "Opus 4.6" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const MODE_CONFIG: Record<Mode, { label: string; description: string; starter: string }> = {
  coach: {
    label: "Coach",
    description: "Strategy, advice, and Q&A",
    starter: "I've reviewed your study data. What would you like to work on? I can analyze your weak areas, explain concepts you're struggling with, or help you build a study strategy.",
  },
  quiz: {
    label: "Quiz Me",
    description: "Agent picks your weakest cards",
    starter: "Ready to drill your weak spots. I'll pick questions from your struggling areas and evaluate your answers in depth. Say 'go' when you're ready for the first question.",
  },
  "mock-interview": {
    label: "Mock Interview",
    description: "Conversational interview with follow-ups",
    starter: "I'm your interviewer today. We'll go through several questions — I'll probe your answers and give feedback after each one. Take a breath, and tell me: are you ready to begin?",
  },
};

interface AgentChatProps {
  threadId: string;
  compact?: boolean; // true = floating panel mode
  initialMode?: Mode;      // override starting mode (e.g. from "Quiz me on X" button)
  initialMessage?: string; // auto-send this message after initialization
}

export default function AgentChat({ threadId, compact = false, initialMode, initialMessage }: AgentChatProps) {
  const [mode, setMode] = useState<Mode>(initialMode ?? "coach");
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6-20250514");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const autoSentRef = useRef(false);

  const context = useQuery(api.forgeAgentContext.get);
  const createThread = useMutation(api.forgeConversations.create);
  const appendMessage = useMutation(api.forgeConversations.appendMessage);
  const updateMode = useMutation(api.forgeConversations.updateMode);
  const existingThread = useQuery(api.forgeConversations.getByThreadId, { threadId });

  // Initialize thread + starter message
  useEffect(() => {
    if (initialized || existingThread === undefined) return;

    if (existingThread) {
      // Restore existing conversation — apply initialMode override if present
      setMessages(existingThread.messages as Message[]);
      if (initialMode && initialMode !== existingThread.mode) {
        setMode(initialMode);
        updateMode({ threadId, mode: initialMode });
        const starter: Message = {
          role: "assistant",
          content: MODE_CONFIG[initialMode].starter,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `— Switched to ${MODE_CONFIG[initialMode].label} mode —`, timestamp: new Date().toISOString() },
          starter,
        ]);
        appendMessage({ threadId, role: "assistant", content: starter.content });
      } else {
        setMode(existingThread.mode as Mode);
      }
      setInitialized(true);
    } else {
      // New thread
      createThread({ threadId, mode }).then(() => {
        const starter: Message = {
          role: "assistant",
          content: MODE_CONFIG[mode].starter,
          timestamp: new Date().toISOString(),
        };
        setMessages([starter]);
        appendMessage({ threadId, role: "assistant", content: starter.content });
        setInitialized(true);
      });
    }
  }, [existingThread, initialized, threadId, mode, initialMode, createThread, appendMessage, updateMode]);

  // Auto-send initialMessage once initialized
  useEffect(() => {
    if (initialized && initialMessage && !autoSentRef.current && context && !streaming) {
      autoSentRef.current = true;
      setInput(initialMessage);
      // Defer to next tick so the input state is set before send reads it
      setTimeout(() => {
        setInput("");
        // Manually trigger the send flow with the initial message
        const userMsg: Message = { role: "user", content: initialMessage, timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, userMsg]);
        appendMessage({ threadId, role: "user", content: initialMessage });
        setStreaming(true);

        const apiMessages = [...messages, userMsg]
          .filter((m) => !m.content.startsWith("— Switched to"))
          .map((m) => ({ role: m.role, content: m.content }));

        const assistantMsg: Message = { role: "assistant", content: "", timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, assistantMsg]);

        const controller = new AbortController();
        abortRef.current = controller;
        let assistantContent = "";

        fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, context, mode }),
          signal: controller.signal,
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("Agent request failed");
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("No response body");
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              assistantContent += decoder.decode(value, { stream: true });
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...assistantMsg, content: assistantContent };
                return updated;
              });
            }
            appendMessage({ threadId, role: "assistant", content: assistantContent });
          })
          .catch((err) => {
            if ((err as Error).name !== "AbortError") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...assistantMsg, content: "Something went wrong reaching the agent." };
                return updated;
              });
            }
          })
          .finally(() => {
            setStreaming(false);
            abortRef.current = null;
          });
      }, 0);
    }
  }, [initialized, initialMessage, context, streaming]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const switchMode = useCallback(async (newMode: Mode) => {
    if (streaming) return;
    setMode(newMode);
    updateMode({ threadId, mode: newMode });

    const starter: Message = {
      role: "assistant",
      content: MODE_CONFIG[newMode].starter,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, { role: "assistant", content: `— Switched to ${MODE_CONFIG[newMode].label} mode —`, timestamp: new Date().toISOString() }, starter]);
    appendMessage({ threadId, role: "assistant", content: starter.content });
  }, [streaming, threadId, updateMode, appendMessage]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming || !context) return;

    const userMsg: Message = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    // Persist user message
    appendMessage({ threadId, role: "user", content: text });

    // Build messages array for API (exclude system separators)
    const apiMessages = [...messages, userMsg]
      .filter((m) => !m.content.startsWith("— Switched to"))
      .map((m) => ({ role: m.role, content: m.content }));

    // Stream response
    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = "";
    const assistantMsg: Message = { role: "assistant", content: "", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, context, mode, model }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Agent request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, content: assistantContent };
          return updated;
        });
      }

      // Persist final assistant message
      appendMessage({ threadId, role: "assistant", content: assistantContent });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...assistantMsg,
            content: "Something went wrong reaching the agent. Check your ANTHROPIC_API_KEY.",
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, context, messages, mode, model, threadId, appendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const containerClass = compact
    ? "flex flex-col h-full"
    : "flex flex-col h-full max-w-3xl mx-auto";

  return (
    <div className={containerClass}>
      {/* Mode selector */}
      <div className="flex gap-2 p-3 border-b border-white/10 shrink-0">
        {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            disabled={streaming}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
              mode === m
                ? "bg-forge-accent/20 text-forge-accent border-forge-accent/40"
                : "text-forge-text/50 border-white/10 hover:border-white/20 hover:text-forge-text/80"
            }`}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}
        <span className="ml-auto text-xs text-forge-text/30 self-center hidden sm:block">
          {MODE_CONFIG[mode].description}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {!initialized && (
          <div className="text-forge-text/40 text-sm text-center mt-8">Loading context...</div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.content.startsWith("— Switched to") ? (
              <div className="text-xs text-forge-text/30 text-center w-full py-1">{msg.content}</div>
            ) : (
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-forge-accent/20 text-forge-text border border-forge-accent/30"
                    : "bg-white/5 text-forge-text border border-white/10"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || (streaming && i === messages.length - 1 ? "▋" : "")}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            )}
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-forge-text/50 text-sm">
              ▋
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as ModelId)}
            disabled={streaming}
            className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-forge-text/70 focus:outline-none focus:border-forge-accent/50 disabled:opacity-50"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id} className="bg-forge-bg text-forge-text">
                {m.label}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-forge-text/25">{MODEL_OPTIONS.find((m) => m.id === model)?.label}</span>
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming || !initialized}
            placeholder={streaming ? "Agent is responding..." : "Message your coach... (Enter to send, Shift+Enter for newline)"}
            rows={1}
            className="flex-1 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-forge-text placeholder-forge-text/30 focus:outline-none focus:border-forge-accent/50 disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: "38px" }}
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim() || !initialized}
            className="px-4 py-2 rounded-lg bg-forge-accent/20 text-forge-accent border border-forge-accent/40 text-sm font-medium hover:bg-forge-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {streaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
