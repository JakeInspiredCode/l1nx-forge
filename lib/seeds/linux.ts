import { ForgeCard, TopicId, CardType, Difficulty, Tier } from "../types";

const today = new Date().toISOString().split("T")[0];

function card(
  id: string, topicId: TopicId, type: CardType, tier: Tier, difficulty: Difficulty,
  front: string, back: string, steps?: string[], sortOrder?: number
): ForgeCard {
  return {
    id, topicId, type, front, back, difficulty, tier, steps, sortOrder,
    easeFactor: 2.5, interval: 0, repetitions: 0, dueDate: today, lastReview: null,
  };
}

const linux: ForgeCard[] = [
  // ── Tier 1: Foundations (Rapid-Fire) ──

  // Commands — core
  card("linux-001", "linux", "easy", 1, 1, "Print current directory", "`pwd`"),
  card("linux-002", "linux", "easy", 1, 1, "`cd -`", "Return to previous directory"),
  card("linux-003", "linux", "easy", 1, 1, "List all files, long format", "`ls -la`"),
  card("linux-003a", "linux", "easy", 1, 1, "`ls -a`", "Show hidden files (starting with `.`)"),
  card("linux-003b", "linux", "easy", 1, 1, "`ls -l`", "Long format: permissions, owner, size, date"),
  card("linux-009", "linux", "easy", 1, 1, "Create empty file / update timestamp", "`touch <file>`"),
  card("linux-010", "linux", "easy", 1, 1, "Copy directory recursively", "`cp -r <src> <dest>`"),
  card("linux-011", "linux", "easy", 1, 1, "`rm -rf`", "Recursive force delete — no undo"),
  card("linux-012", "linux", "easy", 1, 1, "Create dir with missing parents", "`mkdir -p <path>`"),
  card("linux-013", "linux", "easy", 1, 1, "Follow log file in real time", "`tail -f <file>`"),

  // grep
  card("linux-014", "linux", "easy", 1, 1, "Search text pattern in file", '`grep "pattern" <file>`'),
  card("linux-014a", "linux", "easy", 1, 1, "`grep -i`", "Case-insensitive search"),
  card("linux-014b", "linux", "easy", 1, 1, "`grep -r`", "Recursive directory search"),
  card("linux-014c", "linux", "easy", 1, 1, "`grep -n`", "Show line numbers in output"),

  // Shell operators
  card("linux-015", "linux", "easy", 1, 1, "Pipe `|`", "Send stdout of left command as stdin to right"),
  card("linux-016", "linux", "easy", 1, 1, "`>` vs `>>`", "`>` overwrites file, `>>` appends"),

  // Filesystem hierarchy
  card("linux-004", "linux", "easy", 1, 1, "Root of Linux filesystem", "`/` — all files branch from here"),
  card("linux-005", "linux", "easy", 1, 1, "`/var/log`", "System and application logs"),
  card("linux-006", "linux", "easy", 1, 1, "`/etc`", "System-wide configuration files"),
  card("linux-007", "linux", "easy", 1, 1, "`/proc`", "Virtual filesystem — kernel and process info at runtime"),
  card("linux-049", "linux", "easy", 1, 1, "`/dev`", "Device files — hardware and virtual devices"),
  card("linux-008", "linux", "easy", 1, 1, "Absolute vs relative path", "Absolute starts from `/`, relative from current dir"),

  // Permissions
  card("linux-017", "linux", "easy", 1, 1, "`rwxr-xr--`", "Owner: rwx, Group: r-x, Others: r--"),
  card("linux-018", "linux", "easy", 1, 1, "`rwxr-xr-x` in octal", "`755`"),
  card("linux-018a", "linux", "easy", 1, 1, "`rw-r--r--` in octal", "`644`"),
  card("linux-018b", "linux", "easy", 1, 1, "`rwx------` in octal", "`700`"),
  card("linux-018c", "linux", "easy", 1, 1, "Octal: r, w, x", "r=4, w=2, x=1"),
  card("linux-019", "linux", "easy", 1, 1, "Change file owner and group", "`chown owner:group <file>`"),
  card("linux-019a", "linux", "easy", 1, 1, "`chown -R`", "Change ownership recursively"),
  card("linux-020", "linux", "easy", 1, 1, "SUID bit on executable", "Runs as file owner, not executing user"),
  card("linux-021", "linux", "easy", 1, 1, "Add user to group (keep existing)", "`usermod -aG <group> <user>`"),
  card("linux-021a", "linux", "easy", 1, 1, "`usermod -aG` — why `-a`?", "Without it, user is removed from all other groups"),

  // Package managers
  card("linux-022", "linux", "easy", 1, 1, "RHEL/Rocky package manager", "`dnf`"),
  card("linux-023", "linux", "easy", 1, 1, "Ubuntu/Debian package manager", "`apt`"),
  card("linux-024", "linux", "easy", 1, 1, "List installed RPM packages", "`rpm -qa`"),
  card("linux-025", "linux", "easy", 1, 1, "Why not `apt upgrade` in prod?", "Uncontrolled updates break things — use change tickets"),

  // Filesystems
  card("linux-026", "linux", "easy", 1, 1, "Default filesystem on RHEL", "XFS"),
  card("linux-027", "linux", "easy", 1, 1, "ext4 crash resilience", "Journaling — replays metadata changes after crash"),
  card("linux-028", "linux", "easy", 1, 1, "Mounted filesystems + disk usage", "`df -hT`"),
  card("linux-029", "linux", "easy", 1, 1, "List block devices + partitions", "`lsblk`"),
  card("linux-030", "linux", "easy", 1, 1, "Persistent mount config file", "`/etc/fstab`"),
  card("linux-031", "linux", "easy", 1, 1, "`tmpfs`", "RAM-based filesystem, lost on reboot"),

  // Processes & services
  card("linux-032", "linux", "easy", 1, 1, "List all running processes", "`ps aux`"),
  card("linux-033", "linux", "easy", 1, 1, "`kill` vs `kill -9`", "SIGTERM (graceful) vs SIGKILL (forced, no cleanup)"),
  card("linux-034", "linux", "easy", 1, 1, "Check systemd service status", "`systemctl status <service>`"),
  card("linux-035", "linux", "easy", 1, 1, "View logs for a systemd service", "`journalctl -u <service>`"),
  card("linux-036", "linux", "easy", 1, 1, "`enable` vs `start` (systemd)", "`start` = run now, `enable` = run on boot"),
  card("linux-036a", "linux", "easy", 1, 1, "Start + enable in one command", "`systemctl enable --now <service>`"),
  card("linux-037", "linux", "easy", 1, 1, "Zombie process", "Finished but parent hasn't collected exit status (`Z`)"),

  // System & hardware inspection
  card("linux-038", "linux", "easy", 1, 1, "View kernel messages", "`dmesg` — hardware errors, drivers, boot"),
  card("linux-039", "linux", "easy", 1, 1, "List PCI devices (GPUs, NICs)", "`lspci`"),
  card("linux-040", "linux", "easy", 1, 1, "Show network interfaces + IPs", "`ip addr show` (or `ip a`)"),
  card("linux-041", "linux", "easy", 1, 1, "Show listening TCP ports + processes", "`ss -tlnp`"),
  card("linux-042", "linux", "easy", 1, 1, "Disk I/O stats per device", "`iostat -xz 1`"),
  card("linux-043", "linux", "easy", 1, 1, "Memory and swap usage", "`free -h`"),
  card("linux-044", "linux", "easy", 1, 1, "GPU status command", "`nvidia-smi`"),
  card("linux-050", "linux", "easy", 1, 1, "Check disk SMART health", "`smartctl -a /dev/sda`"),
  card("linux-051", "linux", "easy", 1, 1, "`ethtool eth0`", "NIC link speed, duplex, auto-negotiation"),
  card("linux-052", "linux", "easy", 1, 1, "Find largest directories", "`du -sh /* | sort -h`"),

  // Bash scripting basics
  card("linux-045", "linux", "easy", 1, 1, "Shebang line", "`#!/bin/bash` — sets the interpreter"),
  card("linux-046", "linux", "easy", 1, 1, "Exit code `0`", "Success. Non-zero = failure. Check with `$?`"),
  card("linux-047", "linux", "easy", 1, 1, "Single vs double quotes (bash)", "Single: literal. Double: expands variables"),
  card("linux-048", "linux", "easy", 1, 1, "`$(command)`", "Command substitution — replaced by output"),

  // ── Dropped-fact recovery cards ──

  // Filesystem paths — specific files
  card("lx-001", "linux", "easy", 1, 1, "What is the general system log file?", "`/var/log/syslog` (Ubuntu) or `/var/log/messages` (RHEL)"),
  card("lx-002", "linux", "easy", 1, 1, "What log file records authentication events?", "`/var/log/auth.log`"),
  card("lx-003", "linux", "easy", 1, 1, "Is `/var/log/dmesg` updated after boot?", "No — boot-time snapshot only. Use `dmesg` or `journalctl -k` for live kernel messages."),
  card("lx-004a", "linux", "easy", 1, 1, "`/etc/hostname`", "Stores the system's hostname"),
  card("lx-004b", "linux", "easy", 1, 1, "`/etc/hosts`", "Local hostname-to-IP mappings (bypasses DNS)"),
  card("lx-004c", "linux", "easy", 1, 1, "`/etc/ssh/sshd_config`", "SSH server configuration file"),
  card("lx-005", "linux", "easy", 1, 1, "`/proc/cpuinfo`", "CPU details (model, cores, speed)"),
  card("lx-006", "linux", "easy", 1, 1, "`/proc/meminfo`", "Detailed memory statistics"),
  card("lx-008", "linux", "easy", 1, 1, "`/dev/nvidia0`", "First GPU device file"),
  card("lx-009", "linux", "easy", 1, 1, "Missing device file in `/dev` means?", "Driver failure or hardware not detected"),
  card("lx-010a", "linux", "easy", 1, 1, "Where is `tmpfs` commonly mounted?", "`/tmp` and `/dev/shm`"),
  card("lx-010b", "linux", "easy", 1, 1, "What does it mean to 'mount' a filesystem?", "Attach a filesystem to a directory so its contents become accessible"),

  // Command flags — dmesg
  card("lx-011", "linux", "easy", 1, 1, "What does the `-T` flag do in `dmesg`?", "Shows human-readable timestamps"),
  card("lx-012", "linux", "easy", 1, 1, "`dmesg | tail -50`", "Show most recent 50 kernel messages"),

  // Command flags — lspci
  card("lx-013", "linux", "easy", 1, 1, "What does the `-v` flag do in `lspci`?", "Verbose device details"),
  card("lx-014", "linux", "easy", 1, 1, "Filter `lspci` for NVIDIA GPUs?", "`lspci | grep -i nvidia`"),

  // Command flags — journalctl
  card("lx-015", "linux", "easy", 1, 1, "What does the `-f` flag do in `journalctl`?", "Follow log output in real time"),
  card("lx-016", "linux", "easy", 1, 1, "Filter `journalctl` to last hour?", '`journalctl --since "1 hour ago"`'),

  // Command flags — ss
  card("lx-017", "linux", "easy", 1, 1, "`ss` flags: -t, -l, -n, -p", "-t=TCP, -l=listening, -n=numeric (no DNS), -p=show process"),
  card("lx-018", "linux", "easy", 1, 1, "`ss` replaces what deprecated tool?", "`netstat`"),

  // Command flags — iostat
  card("lx-019a", "linux", "easy", 1, 1, "What does `-x` do in `iostat`?", "Extended stats: includes await (latency) and %util"),
  card("lx-019b", "linux", "easy", 1, 1, "What package provides `iostat`?", "`sysstat`"),

  // Command flags — ps
  card("lx-020", "linux", "easy", 1, 1, "`ps aux` flag breakdown?", "a=all users, u=user format (CPU%, MEM%), x=include no-terminal processes"),

  // Command flags — df
  card("lx-021a", "linux", "easy", 1, 1, "What does `-h` do in `df`?", "Human-readable sizes (GB, MB)"),
  card("lx-021b", "linux", "easy", 1, 1, "What does `-T` do in `df`?", "Shows filesystem type column (ext4, xfs, etc.)"),

  // Quick facts
  card("lx-022", "linux", "easy", 1, 1, "How do you stop `tail -f`?", "`Ctrl+C`"),
  card("lx-023", "linux", "easy", 1, 1, "`ip addr` replaces what deprecated tool?", "`ifconfig`"),
  card("lx-024", "linux", "easy", 1, 1, "Filter installed RPM packages?", "`rpm -qa | grep <name>`"),
  card("lx-025", "linux", "easy", 1, 1, "Detailed info on one RPM package?", "`rpm -qi <package>`"),

  // Signal numbers
  card("lx-026a", "linux", "easy", 1, 1, "SIGTERM signal number?", "15"),
  card("lx-026b", "linux", "easy", 1, 1, "SIGKILL signal number?", "9"),
  card("lx-027", "linux", "easy", 1, 1, "Which kill signal should you try first?", "SIGTERM (15) — always try graceful before forced"),

  // Key concepts
  card("lx-028", "linux", "easy", 1, 1, "Are `systemctl start` and `enable` dependent?", "No — independent. You usually need both."),
  card("lx-029", "linux", "easy", 1, 1, "Best column in `free -h` for actual free memory?", "'available' — accounts for reclaimable cache"),
  card("lx-030", "linux", "easy", 1, 1, "What fields does `nvidia-smi` show?", "GPU name, temp, power, VRAM used/total, utilization %, running processes"),
  card("lx-031", "linux", "easy", 1, 1, "SMART indicators of imminent disk failure?", "Reallocated sectors, pending sectors, uncorrectable errors"),
  card("lx-032", "linux", "easy", 1, 1, "What package provides `smartctl`?", "`smartmontools`"),
  card("lx-033", "linux", "easy", 1, 1, "Risk of errors in `/etc/fstab`?", "Can prevent system from booting"),
  card("lx-034", "linux", "easy", 1, 1, "Are zombie processes dangerous?", "Usually harmless in small numbers — indicates buggy parent process"),
  card("lx-035", "linux", "easy", 1, 1, "Classic SUID example?", "`/usr/bin/passwd` — lets normal users update root-owned password file"),
  card("lx-036", "linux", "easy", 1, 1, "Does Linux use drive letters?", "No — single root `/`, no C: or D:"),
  card("lx-037", "linux", "easy", 1, 1, "`dnf` vs `yum`?", "dnf replaced yum. yum still works (aliased to dnf) on RHEL-family."),
  card("lx-038", "linux", "easy", 1, 1, "What to run before `apt install`?", "`apt update` — refreshes the package index"),
  card("lx-039", "linux", "easy", 1, 1, "Absolute or relative paths in scripts?", "Absolute — works from any location"),
  card("lx-040", "linux", "easy", 1, 1, "What happens if you `cp` a directory without `-r`?", "It fails — `-r` is required for directories"),
  card("lx-041", "linux", "easy", 1, 1, "Backtick `` `cmd` `` vs `$(cmd)`?", "Both do command substitution. `$()` preferred — nestable and clearer."),

  // Examples as recall cards
  card("lx-042", "linux", "easy", 1, 1, '`echo "$HOME"` vs `echo \'$HOME\'`?', "Double quotes: prints path. Single quotes: prints literal $HOME"),
  card("lx-043", "linux", "easy", 1, 1, "`DATE=$(date +%Y-%m-%d)` does what?", "Stores today's date in variable DATE (command substitution)"),
  card("lx-044", "linux", "easy", 1, 1, '`echo "note" >> log.txt` does what?', "Appends 'note' to log.txt"),
  card("lx-045", "linux", "easy", 1, 1, '`dmesg | grep -i "error"` does what?', "Filters kernel messages for errors"),
];

export default linux;
