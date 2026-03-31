// ═══════════════════════════════════════
// 75 Linux/DC-Ops Commands — shared by Quick Draw + Visual Explorer
// ═══════════════════════════════════════

export interface CommandFlag {
  flag: string;
  description: string;
}

export interface CommandExample {
  usage: string;
  explanation: string;
}

export interface CommandPart {
  part: string;
  role: string;
}

export interface Command {
  id: string;
  command: string;
  category: string;
  description: string;
  flags: CommandFlag[];
  examples: CommandExample[];
  parts?: CommandPart[];
}

export type CommandCategory =
  | "file-ops"
  | "text-processing"
  | "system-info"
  | "process-mgmt"
  | "networking"
  | "permissions"
  | "package-mgmt"
  | "disk-storage"
  | "gpu-hardware";

export const COMMAND_CATEGORIES: { id: CommandCategory; label: string }[] = [
  { id: "file-ops", label: "File Operations" },
  { id: "text-processing", label: "Text Processing" },
  { id: "system-info", label: "System Info" },
  { id: "process-mgmt", label: "Process Management" },
  { id: "networking", label: "Networking" },
  { id: "permissions", label: "Permissions" },
  { id: "package-mgmt", label: "Package Management" },
  { id: "disk-storage", label: "Disk & Storage" },
  { id: "gpu-hardware", label: "GPU & Hardware" },
];

const commands: Command[] = [
  // ── File Operations ──
  {
    id: "cmd-001", command: "ls", category: "file-ops",
    description: "List directory contents",
    flags: [
      { flag: "-l", description: "Long format (permissions, owner, size, date)" },
      { flag: "-a", description: "Show hidden files (starting with .)" },
      { flag: "-h", description: "Human-readable sizes" },
      { flag: "-R", description: "Recursive listing" },
      { flag: "-t", description: "Sort by modification time" },
    ],
    examples: [
      { usage: "ls -la", explanation: "List all files in long format" },
      { usage: "ls -lhS", explanation: "Long format, human-readable, sorted by size" },
    ],
  },
  {
    id: "cmd-002", command: "cd", category: "file-ops",
    description: "Change directory",
    flags: [],
    examples: [
      { usage: "cd /var/log", explanation: "Change to /var/log (absolute)" },
      { usage: "cd -", explanation: "Return to previous directory" },
      { usage: "cd ~", explanation: "Go to home directory" },
    ],
  },
  {
    id: "cmd-003", command: "pwd", category: "file-ops",
    description: "Print current working directory",
    flags: [],
    examples: [{ usage: "pwd", explanation: "Shows absolute path like /home/ops/scripts" }],
  },
  {
    id: "cmd-004", command: "cp", category: "file-ops",
    description: "Copy files or directories",
    flags: [
      { flag: "-r", description: "Recursive (required for directories)" },
      { flag: "-p", description: "Preserve permissions and timestamps" },
      { flag: "-v", description: "Verbose — show each file copied" },
    ],
    examples: [{ usage: "cp -r /src /dest", explanation: "Copy directory recursively" }],
  },
  {
    id: "cmd-005", command: "mv", category: "file-ops",
    description: "Move or rename files",
    flags: [
      { flag: "-i", description: "Prompt before overwrite" },
      { flag: "-v", description: "Verbose" },
    ],
    examples: [{ usage: "mv old.txt new.txt", explanation: "Rename a file" }],
  },
  {
    id: "cmd-006", command: "rm", category: "file-ops",
    description: "Remove files or directories",
    flags: [
      { flag: "-r", description: "Recursive (for directories)" },
      { flag: "-f", description: "Force — no confirmation prompts" },
      { flag: "-i", description: "Prompt before each removal" },
    ],
    examples: [{ usage: "rm -rf /tmp/old_logs", explanation: "Recursively force-delete (no undo)" }],
  },
  {
    id: "cmd-007", command: "mkdir", category: "file-ops",
    description: "Create directories",
    flags: [{ flag: "-p", description: "Create parent directories as needed" }],
    examples: [{ usage: "mkdir -p /opt/app/logs", explanation: "Create nested path" }],
  },
  {
    id: "cmd-008", command: "touch", category: "file-ops",
    description: "Create empty file or update timestamp",
    flags: [],
    examples: [{ usage: "touch newfile.txt", explanation: "Create empty file" }],
  },
  {
    id: "cmd-009", command: "find", category: "file-ops",
    description: "Search for files in directory tree",
    flags: [
      { flag: "-name", description: "Match filename pattern" },
      { flag: "-type f", description: "Files only" },
      { flag: "-type d", description: "Directories only" },
      { flag: "-mtime -1", description: "Modified in last 24 hours" },
      { flag: "-mmin -30", description: "Modified in last 30 minutes" },
      { flag: "-exec", description: "Run command on each match" },
    ],
    examples: [
      { usage: "find /var/log -name '*.log' -mtime +7", explanation: "Logs older than 7 days" },
      { usage: "find / -type f -name '*.conf'", explanation: "Find all .conf files" },
    ],
  },
  {
    id: "cmd-010", command: "ln", category: "file-ops",
    description: "Create links between files",
    flags: [{ flag: "-s", description: "Symbolic (soft) link" }],
    examples: [{ usage: "ln -s /opt/app/current /opt/app/latest", explanation: "Create symlink" }],
  },
  {
    id: "cmd-011", command: "tar", category: "file-ops",
    description: "Archive and compress files",
    flags: [
      { flag: "-c", description: "Create archive" },
      { flag: "-x", description: "Extract archive" },
      { flag: "-z", description: "gzip compression" },
      { flag: "-v", description: "Verbose" },
      { flag: "-f", description: "Filename (must be last flag)" },
    ],
    examples: [
      { usage: "tar -czf backup.tar.gz /etc", explanation: "Create gzipped archive of /etc" },
      { usage: "tar -xzf backup.tar.gz", explanation: "Extract gzipped archive" },
    ],
  },
  {
    id: "cmd-012", command: "rsync", category: "file-ops",
    description: "Efficient file sync (local or remote)",
    flags: [
      { flag: "-a", description: "Archive mode (preserves everything)" },
      { flag: "-v", description: "Verbose" },
      { flag: "-z", description: "Compress during transfer" },
      { flag: "-P", description: "Progress + partial (resumable)" },
      { flag: "--bwlimit", description: "Bandwidth limit in kbps" },
    ],
    examples: [{ usage: "rsync -avzP user@remote:/path/ ./local/", explanation: "Sync from remote, resumable" }],
  },

  // ── Text Processing ──
  {
    id: "cmd-013", command: "grep", category: "text-processing",
    description: "Search text patterns in files",
    flags: [
      { flag: "-i", description: "Case-insensitive" },
      { flag: "-r", description: "Recursive directory search" },
      { flag: "-n", description: "Show line numbers" },
      { flag: "-v", description: "Invert match (exclude lines)" },
      { flag: "-c", description: "Count matching lines" },
      { flag: "-l", description: "List filenames only" },
    ],
    examples: [
      { usage: 'grep -rn "error" /var/log/', explanation: "Search recursively with line numbers" },
      { usage: 'grep -i "fail" syslog', explanation: "Case-insensitive search" },
    ],
  },
  {
    id: "cmd-014", command: "awk", category: "text-processing",
    description: "Pattern scanning and text processing",
    flags: [
      { flag: "-F", description: "Set field separator" },
    ],
    examples: [
      { usage: "awk '{print $1, $3}' file.txt", explanation: "Print columns 1 and 3" },
      { usage: "awk -F: '{print $1}' /etc/passwd", explanation: "List usernames" },
    ],
  },
  {
    id: "cmd-015", command: "sed", category: "text-processing",
    description: "Stream editor for text transformation",
    flags: [
      { flag: "-i", description: "Edit file in-place (use -i.bak for safety)" },
      { flag: "-n", description: "Suppress default output" },
    ],
    examples: [
      { usage: "sed 's/old/new/g' file.txt", explanation: "Replace all occurrences" },
      { usage: "sed -i.bak 's/foo/bar/g' config.conf", explanation: "In-place edit with backup" },
    ],
  },
  {
    id: "cmd-016", command: "cut", category: "text-processing",
    description: "Extract columns from text",
    flags: [
      { flag: "-d", description: "Set delimiter" },
      { flag: "-f", description: "Select fields" },
    ],
    examples: [{ usage: "cut -d: -f1 /etc/passwd", explanation: "Extract usernames" }],
  },
  {
    id: "cmd-017", command: "sort", category: "text-processing",
    description: "Sort lines of text",
    flags: [
      { flag: "-n", description: "Numeric sort" },
      { flag: "-r", description: "Reverse order" },
      { flag: "-h", description: "Human-readable numbers (1K, 2M)" },
      { flag: "-u", description: "Unique (remove duplicates)" },
    ],
    examples: [{ usage: "du -sh /* | sort -h", explanation: "Sort directories by size" }],
  },
  {
    id: "cmd-018", command: "head", category: "text-processing",
    description: "Show first N lines of file",
    flags: [{ flag: "-n", description: "Number of lines (default 10)" }],
    examples: [{ usage: "head -20 /var/log/syslog", explanation: "First 20 lines" }],
  },
  {
    id: "cmd-019", command: "tail", category: "text-processing",
    description: "Show last N lines of file",
    flags: [
      { flag: "-n", description: "Number of lines" },
      { flag: "-f", description: "Follow — stream new lines in real time" },
    ],
    examples: [{ usage: "tail -f /var/log/syslog", explanation: "Follow log in real time" }],
  },
  {
    id: "cmd-020", command: "wc", category: "text-processing",
    description: "Count lines, words, characters",
    flags: [
      { flag: "-l", description: "Lines only" },
      { flag: "-w", description: "Words only" },
    ],
    examples: [{ usage: "wc -l /etc/passwd", explanation: "Count users in passwd" }],
  },
  {
    id: "cmd-021", command: "tee", category: "text-processing",
    description: "Read stdin, write to stdout AND file",
    flags: [{ flag: "-a", description: "Append to file instead of overwrite" }],
    examples: [{ usage: "cmd 2>&1 | tee output.log", explanation: "Display and log output" }],
  },
  {
    id: "cmd-022", command: "xargs", category: "text-processing",
    description: "Build commands from stdin",
    flags: [
      { flag: "-I{}", description: "Replace string placeholder" },
      { flag: "-P", description: "Parallel execution (N processes)" },
    ],
    examples: [{ usage: "find . -name '*.log' | xargs gzip", explanation: "Compress all .log files" }],
  },

  // ── System Info ──
  {
    id: "cmd-023", command: "uname", category: "system-info",
    description: "Show system information",
    flags: [{ flag: "-a", description: "All info (kernel, hostname, arch)" }],
    examples: [{ usage: "uname -r", explanation: "Show kernel version" }],
  },
  {
    id: "cmd-024", command: "uptime", category: "system-info",
    description: "How long system has been running",
    flags: [],
    examples: [{ usage: "uptime", explanation: "Shows uptime, users, load averages" }],
  },
  {
    id: "cmd-025", command: "hostname", category: "system-info",
    description: "Show or set system hostname",
    flags: [],
    examples: [{ usage: "hostname -f", explanation: "Show fully qualified domain name" }],
  },
  {
    id: "cmd-026", command: "dmesg", category: "system-info",
    description: "Kernel ring buffer messages",
    flags: [
      { flag: "-T", description: "Human-readable timestamps" },
    ],
    examples: [
      { usage: "dmesg -T | tail -50", explanation: "Recent kernel messages with timestamps" },
      { usage: 'dmesg | grep -i "error"', explanation: "Filter for errors" },
    ],
  },
  {
    id: "cmd-027", command: "lscpu", category: "system-info",
    description: "CPU architecture info",
    flags: [],
    examples: [{ usage: "lscpu", explanation: "Shows cores, threads, model, cache sizes" }],
  },
  {
    id: "cmd-028", command: "free", category: "system-info",
    description: "Memory and swap usage",
    flags: [{ flag: "-h", description: "Human-readable (GB, MB)" }],
    examples: [{ usage: "free -h", explanation: "'available' column = actual free memory" }],
  },
  {
    id: "cmd-029", command: "lspci", category: "system-info",
    description: "List PCI devices (GPUs, NICs, controllers)",
    flags: [{ flag: "-v", description: "Verbose device details" }],
    examples: [{ usage: "lspci | grep -i nvidia", explanation: "Filter for NVIDIA GPUs" }],
  },
  {
    id: "cmd-030", command: "dmidecode", category: "system-info",
    description: "Read hardware info from BIOS/UEFI",
    flags: [{ flag: "-t memory", description: "DIMM slot details (serial, speed, size)" }],
    examples: [{ usage: "dmidecode -t memory", explanation: "Identify failed DIMM by slot/serial" }],
  },

  // ── Process Management ──
  {
    id: "cmd-031", command: "ps", category: "process-mgmt",
    description: "List running processes",
    flags: [
      { flag: "a", description: "All users" },
      { flag: "u", description: "User format (CPU%, MEM%)" },
      { flag: "x", description: "Include no-terminal processes" },
    ],
    examples: [
      { usage: "ps aux", explanation: "All processes, all users" },
      { usage: "ps aux --sort=-%cpu | head", explanation: "Top CPU consumers" },
    ],
  },
  {
    id: "cmd-032", command: "top", category: "process-mgmt",
    description: "Real-time process monitor",
    flags: [
      { flag: "-bn1", description: "Batch mode, 1 iteration (for scripting)" },
    ],
    examples: [{ usage: "top", explanation: "Press P to sort by CPU, M by memory" }],
  },
  {
    id: "cmd-033", command: "kill", category: "process-mgmt",
    description: "Send signal to process",
    flags: [
      { flag: "-15 (SIGTERM)", description: "Graceful shutdown (default)" },
      { flag: "-9 (SIGKILL)", description: "Force kill — no cleanup" },
      { flag: "-1 (SIGHUP)", description: "Reload config (for daemons)" },
    ],
    examples: [
      { usage: "kill 1234", explanation: "SIGTERM to PID 1234" },
      { usage: "kill -9 1234", explanation: "Force kill PID 1234" },
      { usage: "kill -HUP $(pidof nginx)", explanation: "Reload nginx config" },
    ],
  },
  {
    id: "cmd-034", command: "systemctl", category: "process-mgmt",
    description: "Manage systemd services",
    flags: [
      { flag: "start", description: "Start service now" },
      { flag: "stop", description: "Stop service now" },
      { flag: "restart", description: "Restart service" },
      { flag: "enable", description: "Start on boot" },
      { flag: "enable --now", description: "Start now + on boot" },
      { flag: "status", description: "Show service state + recent logs" },
      { flag: "cat", description: "Show unit file contents" },
      { flag: "list-timers", description: "Show scheduled timers" },
    ],
    examples: [
      { usage: "systemctl status sshd", explanation: "Check SSH daemon status" },
      { usage: "systemctl enable --now nginx", explanation: "Start + enable on boot" },
    ],
  },
  {
    id: "cmd-035", command: "journalctl", category: "process-mgmt",
    description: "Query systemd journal logs",
    flags: [
      { flag: "-u", description: "Filter by unit/service" },
      { flag: "-f", description: "Follow in real time" },
      { flag: "-p err", description: "Error priority only" },
      { flag: "-b", description: "Current boot only" },
      { flag: "--since", description: 'Time filter (e.g., "1 hour ago")' },
      { flag: "-o json", description: "JSON output" },
    ],
    examples: [
      { usage: "journalctl -u nginx -f", explanation: "Follow nginx logs" },
      { usage: 'journalctl --since "1 hour ago" -p err', explanation: "Recent errors" },
    ],
  },
  {
    id: "cmd-036", command: "nice", category: "process-mgmt",
    description: "Run command with adjusted priority",
    flags: [{ flag: "-n", description: "Priority (-20 highest to 19 lowest)" }],
    examples: [{ usage: "nice -n 10 ./backup.sh", explanation: "Run at lower priority" }],
  },
  {
    id: "cmd-037", command: "renice", category: "process-mgmt",
    description: "Change priority of running process",
    flags: [],
    examples: [{ usage: "renice +10 1234", explanation: "Lower priority of PID 1234" }],
  },
  {
    id: "cmd-038", command: "nohup", category: "process-mgmt",
    description: "Run command immune to hangup signal",
    flags: [],
    examples: [{ usage: "nohup ./script.sh &", explanation: "Survives SSH disconnect, output to nohup.out" }],
  },
  {
    id: "cmd-039", command: "lsof", category: "process-mgmt",
    description: "List open files",
    flags: [
      { flag: "+D", description: "Files in directory" },
      { flag: "-i", description: "Network connections" },
    ],
    examples: [
      { usage: "lsof +D /var/log | grep deleted", explanation: "Find deleted-but-held files" },
      { usage: "lsof -i :8080", explanation: "What process is using port 8080" },
    ],
  },

  // ── Networking ──
  {
    id: "cmd-040", command: "ip", category: "networking",
    description: "Network interface and routing config",
    flags: [
      { flag: "addr show", description: "Show IP addresses" },
      { flag: "link show", description: "Show interface state" },
      { flag: "-s link", description: "Interface stats (errors, drops)" },
      { flag: "route", description: "Show routing table" },
      { flag: "neigh", description: "ARP table" },
    ],
    examples: [
      { usage: "ip a", explanation: "All interfaces + IPs (replaces ifconfig)" },
      { usage: "ip -s link show eth0", explanation: "Interface error counters" },
    ],
  },
  {
    id: "cmd-041", command: "ss", category: "networking",
    description: "Socket statistics (replaces netstat)",
    flags: [
      { flag: "-t", description: "TCP sockets" },
      { flag: "-u", description: "UDP sockets" },
      { flag: "-l", description: "Listening only" },
      { flag: "-n", description: "Numeric (no DNS resolution)" },
      { flag: "-p", description: "Show process name/PID" },
    ],
    examples: [{ usage: "ss -tlnp", explanation: "Listening TCP ports with processes" }],
  },
  {
    id: "cmd-042", command: "ping", category: "networking",
    description: "Test network connectivity",
    flags: [
      { flag: "-c", description: "Count (stop after N packets)" },
    ],
    examples: [{ usage: "ping -c 4 10.0.1.1", explanation: "Send 4 pings" }],
  },
  {
    id: "cmd-043", command: "traceroute", category: "networking",
    description: "Show path packets take to destination",
    flags: [],
    examples: [{ usage: "traceroute 10.0.1.1", explanation: "Show each hop to destination" }],
  },
  {
    id: "cmd-044", command: "mtr", category: "networking",
    description: "Continuous traceroute with packet loss stats",
    flags: [],
    examples: [{ usage: "mtr 10.0.1.1", explanation: "Live per-hop loss and latency" }],
  },
  {
    id: "cmd-045", command: "curl", category: "networking",
    description: "Transfer data from/to URLs",
    flags: [
      { flag: "-o", description: "Output to file" },
      { flag: "-s", description: "Silent mode" },
      { flag: "-I", description: "Headers only" },
    ],
    examples: [{ usage: "curl -s http://localhost:8080/health", explanation: "Check health endpoint" }],
  },
  {
    id: "cmd-046", command: "dig", category: "networking",
    description: "DNS lookup",
    flags: [],
    examples: [
      { usage: "dig example.com", explanation: "Query A record" },
      { usage: "dig -x 10.0.1.1", explanation: "Reverse DNS lookup" },
    ],
  },
  {
    id: "cmd-047", command: "ethtool", category: "networking",
    description: "NIC configuration and diagnostics",
    flags: [
      { flag: "-i", description: "Driver/firmware version" },
      { flag: "-S", description: "NIC error counters" },
      { flag: "-m", description: "Transceiver light levels (SFP/QSFP)" },
    ],
    examples: [
      { usage: "ethtool eth0", explanation: "Link speed, duplex, auto-negotiation" },
      { usage: "ethtool -S eth0", explanation: "CRC errors, drops, overruns" },
    ],
  },
  {
    id: "cmd-048", command: "ssh", category: "networking",
    description: "Secure remote shell",
    flags: [
      { flag: "-i", description: "Identity file (private key)" },
      { flag: "-p", description: "Port number" },
      { flag: "-o ConnectTimeout=5", description: "Connection timeout" },
    ],
    examples: [
      { usage: "ssh ops@10.0.1.50", explanation: "SSH as user ops" },
      { usage: "ssh -i ~/.ssh/key.pem user@host", explanation: "SSH with specific key" },
    ],
  },
  {
    id: "cmd-049", command: "scp", category: "networking",
    description: "Secure copy over SSH",
    flags: [{ flag: "-r", description: "Recursive (directories)" }],
    examples: [{ usage: "scp file.tar.gz user@remote:/tmp/", explanation: "Copy file to remote" }],
  },

  // ── Permissions ──
  {
    id: "cmd-050", command: "chmod", category: "permissions",
    description: "Change file permissions",
    flags: [{ flag: "-R", description: "Recursive" }],
    examples: [
      { usage: "chmod 755 script.sh", explanation: "rwxr-xr-x" },
      { usage: "chmod +x script.sh", explanation: "Add execute permission" },
      { usage: "chmod 1770 /shared", explanation: "rwxrwx--- with sticky bit" },
    ],
  },
  {
    id: "cmd-051", command: "chown", category: "permissions",
    description: "Change file owner and group",
    flags: [{ flag: "-R", description: "Recursive" }],
    examples: [{ usage: "chown ops:dcteam script.sh", explanation: "Set owner and group" }],
  },
  {
    id: "cmd-052", command: "chgrp", category: "permissions",
    description: "Change file group",
    flags: [{ flag: "-R", description: "Recursive" }],
    examples: [{ usage: "chgrp dcteam /opt/logs", explanation: "Set group ownership" }],
  },
  {
    id: "cmd-053", command: "umask", category: "permissions",
    description: "Set default permission mask for new files",
    flags: [],
    examples: [{ usage: "umask 022", explanation: "New files get 644, dirs get 755" }],
  },
  {
    id: "cmd-054", command: "usermod", category: "permissions",
    description: "Modify user account",
    flags: [
      { flag: "-aG", description: "Append to group (keep existing groups)" },
      { flag: "-L", description: "Lock account" },
      { flag: "-U", description: "Unlock account" },
    ],
    examples: [{ usage: "usermod -aG docker ops", explanation: "Add ops to docker group" }],
  },
  {
    id: "cmd-055", command: "id", category: "permissions",
    description: "Show user and group IDs",
    flags: [],
    examples: [{ usage: "id ops", explanation: "Shows uid, gid, and all groups" }],
  },

  // ── Package Management ──
  {
    id: "cmd-056", command: "apt", category: "package-mgmt",
    description: "Debian/Ubuntu package manager",
    flags: [
      { flag: "update", description: "Refresh package index" },
      { flag: "install", description: "Install package" },
      { flag: "remove", description: "Remove package" },
      { flag: "autoremove", description: "Remove unused dependencies" },
    ],
    examples: [{ usage: "apt update && apt install nginx", explanation: "Update index then install" }],
  },
  {
    id: "cmd-057", command: "dnf", category: "package-mgmt",
    description: "RHEL/Rocky package manager (replaced yum)",
    flags: [
      { flag: "install", description: "Install package" },
      { flag: "remove", description: "Remove package" },
      { flag: "update", description: "Update all packages" },
      { flag: "list installed", description: "Show installed packages" },
    ],
    examples: [{ usage: "dnf install httpd", explanation: "Install Apache" }],
  },
  {
    id: "cmd-058", command: "rpm", category: "package-mgmt",
    description: "RPM package query tool",
    flags: [
      { flag: "-qa", description: "List all installed packages" },
      { flag: "-qi", description: "Detailed info on one package" },
      { flag: "--setperms", description: "Restore package file permissions" },
    ],
    examples: [{ usage: "rpm -qa | grep nvidia", explanation: "Filter installed NVIDIA packages" }],
  },

  // ── Disk & Storage ──
  {
    id: "cmd-059", command: "df", category: "disk-storage",
    description: "Disk space usage by filesystem",
    flags: [
      { flag: "-h", description: "Human-readable sizes" },
      { flag: "-T", description: "Show filesystem type" },
    ],
    examples: [{ usage: "df -hT", explanation: "All filesystems with types and sizes" }],
  },
  {
    id: "cmd-060", command: "du", category: "disk-storage",
    description: "Disk usage by directory",
    flags: [
      { flag: "-s", description: "Summary (total only)" },
      { flag: "-h", description: "Human-readable" },
    ],
    examples: [{ usage: "du -sh /* | sort -h", explanation: "Largest top-level directories" }],
  },
  {
    id: "cmd-061", command: "lsblk", category: "disk-storage",
    description: "List block devices and partitions",
    flags: [],
    examples: [{ usage: "lsblk", explanation: "Tree of devices, sizes, mount points" }],
  },
  {
    id: "cmd-062", command: "blkid", category: "disk-storage",
    description: "Show block device UUIDs and types",
    flags: [],
    examples: [{ usage: "blkid", explanation: "UUIDs for /etc/fstab configuration" }],
  },
  {
    id: "cmd-063", command: "mount", category: "disk-storage",
    description: "Mount filesystems",
    flags: [
      { flag: "-o remount,rw", description: "Remount read-write" },
      { flag: "-t nfs", description: "Specify filesystem type" },
    ],
    examples: [{ usage: "mount | grep ' / '", explanation: "Check if root is ro or rw" }],
  },
  {
    id: "cmd-064", command: "umount", category: "disk-storage",
    description: "Unmount filesystems",
    flags: [
      { flag: "-f", description: "Force unmount" },
      { flag: "-l", description: "Lazy — detach now, cleanup when idle" },
    ],
    examples: [{ usage: "umount -l /mnt/nfs", explanation: "Lazy unmount stuck NFS" }],
  },
  {
    id: "cmd-065", command: "smartctl", category: "disk-storage",
    description: "SMART disk health monitoring",
    flags: [{ flag: "-a", description: "All SMART attributes and tests" }],
    examples: [{ usage: "smartctl -a /dev/sda", explanation: "Check for reallocated/pending sectors" }],
  },
  {
    id: "cmd-066", command: "iostat", category: "disk-storage",
    description: "Disk I/O statistics",
    flags: [
      { flag: "-x", description: "Extended stats (await, %util)" },
      { flag: "-z", description: "Skip idle devices" },
    ],
    examples: [{ usage: "iostat -xz 1", explanation: "Per-device I/O stats, 1-second refresh" }],
  },
  {
    id: "cmd-067", command: "mdadm", category: "disk-storage",
    description: "Software RAID management",
    flags: [
      { flag: "--detail", description: "Show array details" },
      { flag: "--manage --add", description: "Add disk to array" },
      { flag: "--manage --remove", description: "Remove disk from array" },
    ],
    examples: [{ usage: "cat /proc/mdstat", explanation: "Quick RAID status check" }],
  },
  {
    id: "cmd-068", command: "xfs_repair", category: "disk-storage",
    description: "Repair XFS filesystem (not fsck)",
    flags: [],
    examples: [{ usage: "xfs_repair /dev/sdb1", explanation: "Must unmount first" }],
  },
  {
    id: "cmd-069", command: "fsck", category: "disk-storage",
    description: "Filesystem check and repair (ext4)",
    flags: [],
    examples: [{ usage: "fsck /dev/sda2", explanation: "Check ext4 — must unmount first" }],
  },
  {
    id: "cmd-070", command: "fstrim", category: "disk-storage",
    description: "Batch TRIM for SSDs",
    flags: [],
    examples: [{ usage: "fstrim -av", explanation: "TRIM all mounted filesystems" }],
  },

  // ── GPU & Hardware ──
  {
    id: "cmd-071", command: "nvidia-smi", category: "gpu-hardware",
    description: "NVIDIA GPU status and management",
    flags: [
      { flag: "-q", description: "Full query (detailed info)" },
      { flag: "-i", description: "Specific GPU index" },
      { flag: "--query-gpu=...", description: "CSV output of specific fields" },
      { flag: "-r", description: "GPU reset (if supported)" },
    ],
    examples: [
      { usage: "nvidia-smi", explanation: "Temp, power, VRAM, utilization, processes" },
      { usage: "nvidia-smi --query-gpu=index,temperature.gpu --format=csv,noheader", explanation: "Script-friendly temp output" },
    ],
  },
  {
    id: "cmd-072", command: "ipmitool", category: "gpu-hardware",
    description: "IPMI/BMC management",
    flags: [
      { flag: "sel list", description: "System Event Log" },
      { flag: "chassis status", description: "Power state" },
      { flag: "chassis power cycle", description: "Power cycle server" },
      { flag: "sensor list", description: "Hardware sensors" },
      { flag: "-I lanplus -H", description: "Remote BMC connection" },
    ],
    examples: [
      { usage: "ipmitool sel list | tail", explanation: "Recent hardware events" },
      { usage: "ipmitool -I lanplus -H bmc-ip -U admin chassis power cycle", explanation: "Remote power cycle" },
    ],
  },
  {
    id: "cmd-073", command: "edac-util", category: "gpu-hardware",
    description: "ECC memory error reporting",
    flags: [{ flag: "-s", description: "Summary of errors by DIMM" }],
    examples: [{ usage: "edac-util -s", explanation: "Identify which DIMM has ECC errors" }],
  },
  {
    id: "cmd-074", command: "mcelog", category: "gpu-hardware",
    description: "Machine Check Exception decoder",
    flags: [{ flag: "--client", description: "Query running mcelog daemon" }],
    examples: [{ usage: "mcelog --client", explanation: "Decoded CPU/memory hardware errors" }],
  },
  {
    id: "cmd-075", command: "modprobe", category: "gpu-hardware",
    description: "Load/unload kernel modules",
    flags: [{ flag: "-r", description: "Remove (unload) module" }],
    examples: [
      { usage: "modprobe -r nvidia && modprobe nvidia", explanation: "Reload NVIDIA driver" },
    ],
  },
];

export default commands;

export function getCommandsByCategory(cat: string): Command[] {
  return commands.filter((c) => c.category === cat);
}

export function getCommandById(id: string): Command | undefined {
  return commands.find((c) => c.id === id);
}

export function searchCommands(query: string): Command[] {
  const q = query.toLowerCase();
  return commands.filter(
    (c) =>
      c.command.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.flags.some((f) => f.flag.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
  );
}
