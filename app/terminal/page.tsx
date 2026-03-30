"use client";

import { useState, useCallback, useRef } from "react";
import Nav from "@/components/nav";
import TerminalSim from "@/components/terminal-sim";

const COMMAND_GROUPS = [
  { title: "System Info", cmds: ["uptime", "free -h", "uname -a", "whoami", "hostname"] },
  { title: "Disk & Storage", cmds: ["df -hT", "lsblk -f", "smartctl -a /dev/sda | grep -E 'Health|Reallocated|Pending'"] },
  { title: "GPU Status", cmds: ["nvidia-smi"] },
  { title: "Network", cmds: ["ip addr show", "ss -tlnp", "ethtool eth0"] },
  { title: "Processes", cmds: ["ps aux --sort=-%cpu | head -5", "systemctl status sshd"] },
  { title: "Logs & Debug", cmds: ["dmesg -T | tail -5", "journalctl -b -p err --no-pager | tail -10", "lsof | grep deleted", "dmidecode -t memory"] },
  { title: "Files", cmds: ["ls -la", "find /var -type f -size +100M -mmin -60"] },
  { title: "Hardware", cmds: ["ipmitool sensor list | head -10", "cat /proc/cpuinfo | head -20"] },
];

const SIZE_PRESETS = [
  { label: "S", height: 160 },
  { label: "M", height: 240 },
  { label: "L", height: 360 },
  { label: "XL", height: 500 },
];

export default function TerminalPage() {
  const [termHeight, setTermHeight] = useState(240);
  const [dragging, setDragging] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);

    const startY = e.clientY;
    const startH = termHeight;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientY - startY;
      setTermHeight(Math.max(120, Math.min(600, startH + delta)));
    };
    const onUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [termHeight]);

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="mono text-xl font-bold text-green-400 mb-1">
              Terminal Simulator
            </h1>
            <p className="text-xs text-forge-text-dim">
              Simulated GPU node — type{" "}
              <code className="mono text-green-400 bg-forge-surface px-1 py-0.5 rounded text-[10px]">
                help
              </code>{" "}
              or use the reference panel. Arrow keys for history.
            </p>
          </div>

          {/* Size presets */}
          <div className="flex items-center gap-1">
            <span className="mono text-[10px] text-forge-text-muted mr-1">SIZE</span>
            {SIZE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setTermHeight(p.height)}
                className="mono text-[10px] px-2 py-1 rounded transition-all"
                style={{
                  background: termHeight === p.height ? "rgba(34,197,94,0.15)" : "transparent",
                  color: termHeight === p.height ? "#22c55e" : "#555",
                  border: `1px solid ${termHeight === p.height ? "rgba(34,197,94,0.3)" : "#222"}`,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-side layout */}
        <div className="flex gap-4 items-start">
          {/* Terminal */}
          <div className="flex-1 min-w-0" ref={termRef}>
            <TerminalSim height={termHeight} />

            {/* Drag handle */}
            <div
              onMouseDown={onDragStart}
              className="h-2 flex items-center justify-center cursor-row-resize group"
            >
              <div
                className="w-12 h-0.5 rounded-full transition-colors"
                style={{ background: dragging ? "#22c55e" : "#333" }}
              />
            </div>
          </div>

          {/* Command reference sidebar */}
          <div className="w-56 shrink-0 hidden md:block">
            <div className="sticky top-4 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
              <div className="mono text-[9px] text-forge-text-muted font-bold tracking-widest mb-1">
                COMMAND REFERENCE
              </div>
              {COMMAND_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className="bg-forge-surface rounded-lg p-2.5 border border-forge-border"
                >
                  <div className="mono text-[9px] text-forge-text-muted font-bold mb-1.5 tracking-wider">
                    {group.title.toUpperCase()}
                  </div>
                  {group.cmds.map((cmd) => (
                    <div
                      key={cmd}
                      className="mono text-[10px] text-green-400/70 mb-0.5 truncate"
                      title={cmd}
                    >
                      $ {cmd}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: command reference below (md:hidden) */}
        <div className="mt-6 grid grid-cols-2 gap-2 md:hidden">
          {COMMAND_GROUPS.map((group) => (
            <div
              key={group.title}
              className="bg-forge-surface rounded-lg p-2.5 border border-forge-border"
            >
              <div className="mono text-[9px] text-forge-text-muted font-bold mb-1.5 tracking-wider">
                {group.title.toUpperCase()}
              </div>
              {group.cmds.map((cmd) => (
                <div
                  key={cmd}
                  className="mono text-[10px] text-green-400/70 mb-0.5 truncate"
                >
                  $ {cmd}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
