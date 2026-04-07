// ── Foundations Section Metadata ──
// Content for each section lives in components/linux-foundations.tsx
// This file contains section navigation data and the quick reference glossary

export interface FoundationSection {
  id: number;
  title: string;
  icon: string;
}

export const SECTIONS: FoundationSection[] = [
  { id: 1, title: "What Is an Operating System?", icon: "◈" },
  { id: 2, title: "What Is Linux?", icon: "◆" },
  { id: 3, title: "The Command Line", icon: "▸" },
  { id: 4, title: "How Computers Work", icon: "◧" },
  { id: 5, title: "Filesystem & Paths", icon: "▤" },
  { id: 6, title: "Users, Groups & Permissions", icon: "◩" },
  { id: 7, title: "Processes", icon: "⟳" },
  { id: 8, title: "Networking Fundamentals", icon: "◎" },
  { id: 9, title: "Servers & Datacenter", icon: "▥" },
  { id: 10, title: "Putting It All Together", icon: "✦" },
];

export interface QuickRefEntry {
  term: string;
  def: string;
}

export const QUICK_REF: QuickRefEntry[] = [
  { term: "Operating System", def: "Software layer that manages hardware and provides abstractions for programs" },
  { term: "Kernel", def: "The core of the OS that runs with full hardware access and handles scheduling, memory, and devices" },
  { term: "Linux Distribution", def: "The kernel packaged with tools, a package manager, and default configuration" },
  { term: "Terminal", def: "The application that displays your command-line session" },
  { term: "Shell (Bash)", def: "The program that interprets your typed commands" },
  { term: "Absolute Path", def: "Full address from root: /var/log/syslog" },
  { term: "Relative Path", def: "Address from current location: ../log/syslog" },
  { term: "Root /", def: "The top of the filesystem tree" },
  { term: "root user", def: "The superuser account with unrestricted system access" },
  { term: "sudo", def: "Run a single command with root privileges" },
  { term: "PID", def: "Unique numeric identifier for a running process" },
  { term: "Daemon", def: "A background process providing a continuous service" },
  { term: "SIGTERM / SIGKILL", def: "Graceful stop vs. forced stop signals for processes" },
  { term: "IP Address", def: "Numeric identifier for a device on a network" },
  { term: "Port", def: "Numeric identifier for a specific service on a device" },
  { term: "TCP / UDP", def: "Reliable vs. fast transport protocols" },
  { term: "DNS", def: "Translates hostnames to IP addresses" },
  { term: "SSH", def: "Encrypted remote command-line access to a server" },
  { term: "BMC / IPMI", def: "Out-of-band hardware management controller on a server" },
  { term: "PDU", def: "Power Distribution Unit — distributes electricity within a rack" },
  { term: "ToR Switch", def: "Top-of-Rack network switch aggregating server connections" },
];
