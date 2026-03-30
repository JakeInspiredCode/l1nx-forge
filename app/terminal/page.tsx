"use client";

import Nav from "@/components/nav";
import TerminalSim from "@/components/terminal-sim";

export default function TerminalPage() {
  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="mono text-xl font-bold text-green-400 mb-1">
            Terminal Simulator
          </h1>
          <p className="text-sm text-forge-text-dim">
            Practice real DC ops commands in a simulated GPU node environment.
            Type{" "}
            <code className="mono text-green-400 bg-forge-surface px-1.5 py-0.5 rounded text-xs">
              help
            </code>{" "}
            for available commands. Use arrow keys for command history.
          </p>
        </div>

        <TerminalSim />

        {/* Quick reference */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "System Info", cmds: ["uptime", "free -h", "uname -a"] },
            { title: "Disk & Storage", cmds: ["df -hT", "lsblk -f"] },
            { title: "GPU Status", cmds: ["nvidia-smi"] },
            { title: "Network", cmds: ["ip addr show", "ss -tlnp", "ethtool eth0"] },
            { title: "Processes", cmds: ["ps aux --sort=-%cpu | head -5"] },
            { title: "Debug", cmds: ["dmesg -T | tail -5", "lsof | grep deleted"] },
          ].map((group) => (
            <div
              key={group.title}
              className="bg-forge-surface rounded-lg p-3 border border-forge-border"
            >
              <div className="mono text-[10px] text-forge-text-muted font-bold mb-2 tracking-wider">
                {group.title.toUpperCase()}
              </div>
              {group.cmds.map((cmd) => (
                <div
                  key={cmd}
                  className="mono text-xs text-green-400/80 mb-0.5 truncate"
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
