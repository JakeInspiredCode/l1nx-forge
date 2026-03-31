"use client";

import { useState, useMemo } from "react";
import commands, { COMMAND_CATEGORIES, Command, searchCommands } from "@/lib/seeds/commands";

interface Props {
  onBack: () => void;
}

function CommandCard({ cmd }: { cmd: Command }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-forge-surface border border-forge-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-forge-surface-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="mono text-forge-accent font-bold text-sm">{cmd.command}</span>
          <span className="text-xs text-forge-text-dim">{cmd.description}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] mono text-forge-text-muted bg-forge-surface-2 px-1.5 py-0.5 rounded">
            {cmd.flags.length} flags
          </span>
          <span className="text-xs text-forge-text-dim">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-forge-border px-4 py-3 space-y-3">
          {/* Flags */}
          {cmd.flags.length > 0 && (
            <div>
              <span className="text-[10px] uppercase text-forge-text-muted font-semibold tracking-wider">Flags</span>
              <div className="mt-1 space-y-1">
                {cmd.flags.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mono text-xs text-forge-accent shrink-0 w-24">{f.flag}</span>
                    <span className="text-xs text-forge-text-dim">{f.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {cmd.examples.length > 0 && (
            <div>
              <span className="text-[10px] uppercase text-forge-text-muted font-semibold tracking-wider">Examples</span>
              <div className="mt-1 space-y-1.5">
                {cmd.examples.map((ex, i) => (
                  <div key={i} className="bg-forge-surface-2 rounded-lg px-3 py-2">
                    <code className="text-xs mono text-forge-accent block">{ex.usage}</code>
                    <span className="text-[11px] text-forge-text-dim">{ex.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommandDissector({ onBack }: Props) {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = category === "all" ? commands : commands.filter((c) => c.category === category);
    if (search.trim()) {
      const hits = searchCommands(search);
      result = result.filter((c) => hits.some((h) => h.id === c.id));
    }
    return result;
  }, [category, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Command Dissector — {commands.length} commands</h3>
        <button onClick={onBack} className="text-xs text-forge-text-muted hover:text-forge-text">
          Back
        </button>
      </div>

      {/* Search + category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commands..."
          className="flex-1 min-w-[200px] bg-forge-surface border border-forge-border rounded-lg px-3 py-1.5 text-sm mono outline-none focus:border-forge-accent/50 placeholder:text-forge-text-muted"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-forge-surface border border-forge-border rounded-lg px-2 py-1.5 text-xs mono text-forge-text outline-none focus:border-forge-accent/50"
        >
          <option value="all">All Categories ({commands.length})</option>
          {COMMAND_CATEGORIES.map((cat) => {
            const count = commands.filter((c) => c.category === cat.id).length;
            return (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Command list */}
      <div className="space-y-2 max-h-[65vh] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-forge-text-muted py-8">No commands match.</p>
        )}
        {filtered.map((cmd) => (
          <CommandCard key={cmd.id} cmd={cmd} />
        ))}
      </div>
    </div>
  );
}
