"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ModelId = "claude-sonnet-4-6" | "claude-haiku-4-5-20251001" | "claude-opus-4-6";

const MODEL_OPTIONS: { id: ModelId; label: string; short: string }[] = [
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", short: "S" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku", short: "H" },
  { id: "claude-opus-4-6", label: "Opus 4.6", short: "O" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

interface AgentChatProps {
  threadId: string;
  compact?: boolean;
  initialMessage?: string;
  personality?: string;
  onNewConversation?: () => void;
}

export default function AgentChat({ threadId, compact = false, initialMessage, personality: personalityProp, onNewConversation }: AgentChatProps) {
  // Use prop if provided, otherwise read from localStorage (for floating panel)
  const [localPersonality, setLocalPersonality] = useState<string>("sarcastic-friend");
  useEffect(() => {
    if (!personalityProp) {
      try {
        const stored = localStorage.getItem("l1nx-mascot-personality");
        if (stored) setLocalPersonality(stored);
      } catch {}
    }
  }, [personalityProp]);
  const personality = personalityProp || localPersonality;

  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [inputPanelHeight, setInputPanelHeight] = useState<number>(compact ? 120 : 160);
  const [hoveredMsg, setHoveredMsg] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [lastTurnTokens, setLastTurnTokens] = useState<{ in: number; out: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const autoSentRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  useEffect(() => {
    setInitialized(false);
    setMessages([]);
    setInput("");
    setStreaming(false);
    setLastTurnTokens(null);
    autoSentRef.current = false;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, [threadId]);

  const context = useQuery(api.forgeAgentContext.get);
  const createThread = useMutation(api.forgeConversations.create);
  const appendMessage = useMutation(api.forgeConversations.appendMessage);
  const truncateFromIndex = useMutation(api.forgeConversations.truncateFromIndex);
  const existingThread = useQuery(api.forgeConversations.getByThreadId, { threadId });

  useEffect(() => {
    if (initialized || existingThread === undefined) return;

    if (existingThread) {
      setMessages(existingThread.messages as Message[]);
      setInitialized(true);
    } else {
      createThread({ threadId }).then(() => {
        setInitialized(true);
      });
    }
  }, [existingThread, initialized, threadId, createThread]);

  // Auto-send initialMessage once initialized
  useEffect(() => {
    if (initialized && initialMessage && !autoSentRef.current && context && !streaming) {
      autoSentRef.current = true;
      sendMessage(initialMessage);
    }
  }, [initialized, initialMessage, context, streaming]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streaming]);

  const streamResponse = useCallback(async (apiMessages: { role: string; content: string }[], onContent: (text: string) => void): Promise<{ outputTokens: number; content: string }> => {
    const controller = new AbortController();
    abortRef.current = controller;
    let outputContent = "";

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, context, model, personality }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => `HTTP ${res.status}`);
      throw new Error(`${res.status}: ${errText}`);
    }

    const inputTokens = parseInt(res.headers.get("X-Input-Tokens") ?? "0", 10);
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("No response body");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      outputContent += chunk;
      onContent(outputContent);
    }

    const outputTokens = estimateTokens(outputContent);
    setLastTurnTokens({ in: inputTokens, out: outputTokens });
    return { outputTokens, content: outputContent };
  }, [context, model, personality]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming || !context) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    appendMessage({ threadId, role: "user", content: text.trim() });

    const apiMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    const assistantMsg: Message = { role: "assistant", content: "", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const result = await streamResponse(apiMessages, (content) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, content };
          return updated;
        });
      });

      appendMessage({ threadId, role: "assistant", content: result.content });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...assistantMsg,
            content: `Something went wrong: ${(err as Error).message}`,
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [streaming, context, messages, model, threadId, appendMessage, streamResponse]);

  const send = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleCopy = useCallback(async (idx: number) => {
    await navigator.clipboard.writeText(messages[idx].content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, [messages]);

  const handleDeleteFromHere = useCallback(async (idx: number) => {
    await truncateFromIndex({ threadId, fromIndex: idx });
    setMessages((prev) => prev.slice(0, idx));
  }, [threadId, truncateFromIndex]);

  const handleRegenerate = useCallback(async () => {
    if (streaming || messages.length < 2) return;

    // Find the last user message
    let lastUserIdx = messages.length - 1;
    while (lastUserIdx >= 0 && messages[lastUserIdx].role !== "user") lastUserIdx--;
    if (lastUserIdx < 0) return;

    const lastUserContent = messages[lastUserIdx].content;
    const trimmedMessages = messages.slice(0, lastUserIdx);

    // Update DB — remove from the last user message onward
    await truncateFromIndex({ threadId, fromIndex: lastUserIdx });
    setMessages(trimmedMessages);

    // Re-send
    const userMsg: Message = { role: "user", content: lastUserContent, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    appendMessage({ threadId, role: "user", content: lastUserContent });

    const apiMessages = [...trimmedMessages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    const assistantMsg: Message = { role: "assistant", content: "", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const result = await streamResponse(apiMessages, (content) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, content };
          return updated;
        });
      });

      appendMessage({ threadId, role: "assistant", content: result.content });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, content: `Error: ${(err as Error).message}` };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [streaming, messages, threadId, truncateFromIndex, appendMessage, streamResponse]);

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startHeight: inputPanelHeight };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      const newH = Math.max(80, Math.min(500, dragRef.current.startHeight + delta));
      setInputPanelHeight(newH);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [inputPanelHeight]);

  const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);

  const containerClass = compact
    ? "flex flex-col h-full"
    : "flex flex-col h-full";

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 shrink-0">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as ModelId)}
          disabled={streaming}
          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-forge-text/70 focus:outline-none focus:border-forge-accent/50 disabled:opacity-50"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.id} value={m.id} className="bg-forge-bg text-forge-text">
              {m.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3 text-[10px] text-forge-text/30 font-mono">
          {lastTurnTokens && (
            <span title="Last turn: input → output tokens">
              {formatTokens(lastTurnTokens.in)} → {formatTokens(lastTurnTokens.out)}
            </span>
          )}
          <span title="Estimated total conversation tokens">
            {formatTokens(totalTokens)} / 169K
          </span>
          {totalTokens > 120000 && (
            <span className="text-forge-warning" title="Conversation is getting large — older messages may be trimmed">
              ⚠
            </span>
          )}
        </div>

        {!compact && messages.length >= 2 && (
          <button
            onClick={handleRegenerate}
            disabled={streaming}
            className="text-[10px] text-forge-text/40 hover:text-forge-text/70 border border-white/10 rounded px-2 py-0.5 transition-colors disabled:opacity-30"
            title="Regenerate last response"
          >
            ↻ Retry
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" ref={containerRef}>
        {!initialized && (
          <div className="text-forge-text/40 text-sm text-center mt-8">Loading context...</div>
        )}
        {initialized && messages.length === 0 && (
          <div className="text-forge-text/30 text-sm text-center mt-8">
            Start a conversation — the agent has your full study context.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
            onMouseEnter={() => setHoveredMsg(i)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            <div className="relative max-w-[85%]">
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
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

              {/* Message actions */}
              {hoveredMsg === i && !streaming && (
                <div className={`absolute top-0 flex gap-1 ${msg.role === "user" ? "right-full mr-1" : "left-full ml-1"}`}>
                  <button
                    onClick={() => handleCopy(i)}
                    className="p-1 rounded text-[10px] text-forge-text/30 hover:text-forge-text/70 hover:bg-white/10 transition-colors"
                    title="Copy"
                  >
                    {copiedIdx === i ? "✓" : "⧉"}
                  </button>
                  <button
                    onClick={() => handleDeleteFromHere(i)}
                    className="p-1 rounded text-[10px] text-forge-text/30 hover:text-red-400 hover:bg-white/10 transition-colors"
                    title="Delete from here"
                  >
                    ✂
                  </button>
                </div>
              )}
            </div>
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

      {/* Drag divider */}
      {!compact && (
        <div
          onMouseDown={onDividerMouseDown}
          className="h-2 shrink-0 cursor-ns-resize flex items-center justify-center group border-t border-white/10 hover:border-forge-accent/40 transition-colors"
          title="Drag to resize"
        >
          <div className="w-8 h-0.5 rounded-full bg-white/10 group-hover:bg-forge-accent/40 transition-colors" />
        </div>
      )}

      {/* Input */}
      <div className="p-3 shrink-0" style={{ height: compact ? undefined : `${inputPanelHeight}px`, display: "flex", flexDirection: "column" }}>
        <div className="flex gap-2 flex-1 min-h-0">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming || !initialized}
            placeholder={streaming ? "Agent is responding..." : "Message the agent... (Enter to send, Shift+Enter for newline)"}
            className="flex-1 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-forge-text placeholder-forge-text/30 focus:outline-none focus:border-forge-accent/50 disabled:opacity-50 overflow-y-auto"
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim() || !initialized}
            className="px-4 py-2 rounded-lg bg-forge-accent/20 text-forge-accent border border-forge-accent/40 text-sm font-medium hover:bg-forge-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-end"
          >
            {streaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
