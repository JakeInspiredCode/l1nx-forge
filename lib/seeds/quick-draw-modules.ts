// ═══════════════════════════════════════
// Quick Draw content modules — each is a set of prompt→answer pairs
// ═══════════════════════════════════════

export interface QuickDrawItem {
  id: string;
  prompt: string;
  answer: string;
  acceptableAnswers?: string[];  // fuzzy match alternatives
  category?: string;
}

export interface QuickDrawModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: QuickDrawItem[];
}

// ── Permission Blitz ──
const permissionItems: QuickDrawItem[] = [
  // rwx → octal
  { id: "perm-001", prompt: "rwxr-xr-x → octal?", answer: "755" },
  { id: "perm-002", prompt: "rw-r--r-- → octal?", answer: "644" },
  { id: "perm-003", prompt: "rwx------ → octal?", answer: "700" },
  { id: "perm-004", prompt: "rwxr-x--- → octal?", answer: "750" },
  { id: "perm-005", prompt: "rw-rw-r-- → octal?", answer: "664" },
  { id: "perm-006", prompt: "rwxrwxrwx → octal?", answer: "777" },
  { id: "perm-007", prompt: "r--r--r-- → octal?", answer: "444" },
  { id: "perm-008", prompt: "rwx--x--x → octal?", answer: "711" },
  // octal → rwx
  { id: "perm-009", prompt: "755 → rwx?", answer: "rwxr-xr-x" },
  { id: "perm-010", prompt: "644 → rwx?", answer: "rw-r--r--" },
  { id: "perm-011", prompt: "600 → rwx?", answer: "rw-------" },
  { id: "perm-012", prompt: "440 → rwx?", answer: "r--r-----" },
  { id: "perm-013", prompt: "777 → rwx?", answer: "rwxrwxrwx" },
  // description → octal or rwx
  { id: "perm-014", prompt: "Owner: full, Group: read+exec, Others: none", answer: "750", acceptableAnswers: ["rwxr-x---"] },
  { id: "perm-015", prompt: "Owner: read+write, Group: read, Others: read", answer: "644", acceptableAnswers: ["rw-r--r--"] },
  { id: "perm-016", prompt: "Everyone: full access", answer: "777", acceptableAnswers: ["rwxrwxrwx"] },
  { id: "perm-017", prompt: "Owner only: read+write", answer: "600", acceptableAnswers: ["rw-------"] },
  // special bits
  { id: "perm-018", prompt: "What does the 's' in rwsr-xr-x mean?", answer: "SUID — runs as file owner", acceptableAnswers: ["suid", "setuid"] },
  { id: "perm-019", prompt: "Sticky bit octal prefix?", answer: "1", acceptableAnswers: ["1xxx", "1000"] },
  { id: "perm-020", prompt: "SGID octal prefix?", answer: "2", acceptableAnswers: ["2xxx", "2000"] },
  { id: "perm-021", prompt: "SUID octal prefix?", answer: "4", acceptableAnswers: ["4xxx", "4000"] },
  { id: "perm-022", prompt: "Octal value of r?", answer: "4" },
  { id: "perm-023", prompt: "Octal value of w?", answer: "2" },
  { id: "perm-024", prompt: "Octal value of x?", answer: "1" },
];

// ── Port Snap ──
const portItems: QuickDrawItem[] = [
  { id: "port-001", prompt: "SSH → port?", answer: "22" },
  { id: "port-002", prompt: "HTTP → port?", answer: "80" },
  { id: "port-003", prompt: "HTTPS → port?", answer: "443" },
  { id: "port-004", prompt: "DNS → port?", answer: "53" },
  { id: "port-005", prompt: "DHCP server → port?", answer: "67" },
  { id: "port-006", prompt: "DHCP client → port?", answer: "68" },
  { id: "port-007", prompt: "FTP data → port?", answer: "20" },
  { id: "port-008", prompt: "FTP control → port?", answer: "21" },
  { id: "port-009", prompt: "SMTP → port?", answer: "25" },
  { id: "port-010", prompt: "NFS → port?", answer: "2049" },
  { id: "port-011", prompt: "MySQL → port?", answer: "3306" },
  { id: "port-012", prompt: "PostgreSQL → port?", answer: "5432" },
  { id: "port-013", prompt: "Redis → port?", answer: "6379" },
  { id: "port-014", prompt: "IPMI → port?", answer: "623" },
  // reverse: port → service
  { id: "port-015", prompt: "Port 22 → service?", answer: "SSH" },
  { id: "port-016", prompt: "Port 443 → service?", answer: "HTTPS" },
  { id: "port-017", prompt: "Port 53 → service?", answer: "DNS" },
  { id: "port-018", prompt: "Port 80 → service?", answer: "HTTP" },
  { id: "port-019", prompt: "Port 3306 → service?", answer: "MySQL" },
  { id: "port-020", prompt: "Port 623 → service?", answer: "IPMI" },
];

// ── Kill Signals ──
const signalItems: QuickDrawItem[] = [
  { id: "sig-001", prompt: "Graceful stop signal?", answer: "SIGTERM", acceptableAnswers: ["15", "sigterm", "kill PID"] },
  { id: "sig-002", prompt: "Force kill signal?", answer: "SIGKILL", acceptableAnswers: ["9", "sigkill", "kill -9"] },
  { id: "sig-003", prompt: "Reload config signal?", answer: "SIGHUP", acceptableAnswers: ["1", "sighup", "HUP"] },
  { id: "sig-004", prompt: "SIGTERM number?", answer: "15" },
  { id: "sig-005", prompt: "SIGKILL number?", answer: "9" },
  { id: "sig-006", prompt: "SIGHUP number?", answer: "1" },
  { id: "sig-007", prompt: "Signal 15 name?", answer: "SIGTERM" },
  { id: "sig-008", prompt: "Signal 9 name?", answer: "SIGKILL" },
  { id: "sig-009", prompt: "Signal 1 name?", answer: "SIGHUP" },
  { id: "sig-010", prompt: "Can SIGKILL be caught?", answer: "No", acceptableAnswers: ["no", "false", "n"] },
  { id: "sig-011", prompt: "Can SIGTERM be caught?", answer: "Yes", acceptableAnswers: ["yes", "true", "y"] },
  { id: "sig-012", prompt: "Which signal should you try first?", answer: "SIGTERM", acceptableAnswers: ["15", "term", "sigterm"] },
];

// ── IP Ranges ──
const ipItems: QuickDrawItem[] = [
  { id: "ip-001", prompt: "Private Class A range?", answer: "10.0.0.0/8", acceptableAnswers: ["10.0.0.0/8", "10.x.x.x"] },
  { id: "ip-002", prompt: "Private Class B range?", answer: "172.16.0.0/12", acceptableAnswers: ["172.16.0.0/12", "172.16-31.x.x"] },
  { id: "ip-003", prompt: "Private Class C range?", answer: "192.168.0.0/16", acceptableAnswers: ["192.168.0.0/16", "192.168.x.x"] },
  { id: "ip-004", prompt: "Loopback address?", answer: "127.0.0.1", acceptableAnswers: ["127.0.0.1", "localhost", "127.0.0.1/8"] },
  { id: "ip-005", prompt: "APIPA / link-local range?", answer: "169.254.0.0/16", acceptableAnswers: ["169.254.x.x"] },
  { id: "ip-006", prompt: "10.0.0.0/8 — private class?", answer: "A", acceptableAnswers: ["a", "class a"] },
  { id: "ip-007", prompt: "192.168.0.0/16 — private class?", answer: "C", acceptableAnswers: ["c", "class c"] },
  { id: "ip-008", prompt: "Subnet mask for /24?", answer: "255.255.255.0" },
  { id: "ip-009", prompt: "Subnet mask for /16?", answer: "255.255.0.0" },
  { id: "ip-010", prompt: "Subnet mask for /8?", answer: "255.0.0.0" },
  { id: "ip-011", prompt: "How many hosts in a /24?", answer: "254", acceptableAnswers: ["254", "256-2"] },
  { id: "ip-012", prompt: "Broadcast address for 10.0.1.0/24?", answer: "10.0.1.255" },
];

// ── SSH Drill ──
const sshItems: QuickDrawItem[] = [
  { id: "ssh-001", prompt: "SSH as ops to 10.0.1.50", answer: "ssh ops@10.0.1.50" },
  { id: "ssh-002", prompt: "SSH on port 2222 to host", answer: "ssh -p 2222 user@host", acceptableAnswers: ["ssh -p 2222"] },
  { id: "ssh-003", prompt: "SSH with specific key file", answer: "ssh -i ~/.ssh/key.pem user@host", acceptableAnswers: ["ssh -i"] },
  { id: "ssh-004", prompt: "SCP file to remote /tmp/", answer: "scp file.txt user@remote:/tmp/", acceptableAnswers: ["scp"] },
  { id: "ssh-005", prompt: "SCP directory recursively", answer: "scp -r dir/ user@remote:/path/", acceptableAnswers: ["scp -r"] },
  { id: "ssh-006", prompt: "SSH with 5-second timeout", answer: "ssh -o ConnectTimeout=5 user@host", acceptableAnswers: ["-o ConnectTimeout"] },
  { id: "ssh-007", prompt: "Copy remote file to local", answer: "scp user@remote:/path/file ./", acceptableAnswers: ["scp user@"] },
  { id: "ssh-008", prompt: "Run remote command without shell", answer: 'ssh user@host "uptime"', acceptableAnswers: ["ssh user@host uptime"] },
];

// ── Command Recall (generated from commands.ts at runtime) ──
// This module is built dynamically from the 75-command dataset

// ── Flag Sniper (generated from commands.ts at runtime) ──
// This module is built dynamically — picks random flags from the command dataset

export const QUICK_DRAW_MODULES: QuickDrawModule[] = [
  {
    id: "permissions",
    title: "Permission Blitz",
    description: "rwx ↔ octal ↔ description — fast conversion drill",
    icon: "🔒",
    items: permissionItems,
  },
  {
    id: "ports",
    title: "Port Snap",
    description: "Service ↔ port number — know them cold",
    icon: "🔌",
    items: portItems,
  },
  {
    id: "signals",
    title: "Kill Signals",
    description: "Signal names, numbers, and when to use each",
    icon: "💀",
    items: signalItems,
  },
  {
    id: "ip-ranges",
    title: "IP Ranges",
    description: "Private ranges, subnets, CIDR notation",
    icon: "🌐",
    items: ipItems,
  },
  {
    id: "ssh",
    title: "SSH Drill",
    description: "Build SSH/SCP commands from scenarios",
    icon: "🔑",
    items: sshItems,
  },
];

// Dynamic modules built from command seed data
import commands from "./commands";

export function buildCommandRecallModule(): QuickDrawModule {
  const items: QuickDrawItem[] = commands.map((cmd) => ({
    id: `cmdrecall-${cmd.id}`,
    prompt: cmd.description,
    answer: cmd.command,
    category: cmd.category,
  }));
  return {
    id: "command-recall",
    title: "Command Recall",
    description: "Description → command name — 75 commands",
    icon: "⌨",
    items,
  };
}

export function buildFlagSniperModule(): QuickDrawModule {
  const items: QuickDrawItem[] = [];
  for (const cmd of commands) {
    for (const flag of cmd.flags) {
      items.push({
        id: `flag-${cmd.id}-${flag.flag}`,
        prompt: `${cmd.command} ${flag.flag} — what does it do?`,
        answer: flag.description,
        category: cmd.category,
      });
    }
  }
  return {
    id: "flag-sniper",
    title: "Flag Sniper",
    description: "Command flag → what it does — deep flag knowledge",
    icon: "🎯",
    items,
  };
}

export function getAllModules(): QuickDrawModule[] {
  return [
    buildCommandRecallModule(),
    buildFlagSniperModule(),
    ...QUICK_DRAW_MODULES,
  ];
}
