// ═══════════════════════════════════════
// Diagnosis Lab — troubleshooting scenarios
// ═══════════════════════════════════════

export type DiagnosisDifficulty = "learning" | "guided" | "independent" | "full";

export interface DiagnosisChoice {
  label: string;
  isCorrect: boolean;
}

export interface DiagnosisStep {
  prompt: string;
  choices: DiagnosisChoice[];
  command: string;
  output: string;
  interpretation: string;
  teachingNote: string;  // shown when user misses this step
}

export interface DiagnosisScenario {
  id: string;
  title: string;
  description: string;
  difficulty: DiagnosisDifficulty;
  category: string;
  steps: DiagnosisStep[];
  rootCause: string;
  resolution: string;
}

const scenarios: DiagnosisScenario[] = [
  // ── Learning tier ──
  {
    id: "diag-001",
    title: "Disk Full",
    description: "Alert: Root filesystem at 98% on web-prod-03. Application logs are failing to write.",
    difficulty: "learning",
    category: "storage",
    steps: [
      {
        prompt: "First, confirm which filesystem is full.",
        choices: [
          { label: "df -hT", isCorrect: true },
          { label: "free -h", isCorrect: false },
          { label: "top", isCorrect: false },
          { label: "lsblk", isCorrect: false },
        ],
        command: "df -hT",
        output: `Filesystem     Type   Size  Used Avail Use% Mounted on
/dev/sda2      ext4    50G   49G  512M  98% /
/dev/sda1      ext4   500M  120M  380M  24% /boot
tmpfs          tmpfs  7.8G     0  7.8G   0% /dev/shm`,
        interpretation: "Root filesystem (/) is at 98% — only 512MB free.",
        teachingNote: "`df -hT` shows disk usage per filesystem. `-h` = human-readable, `-T` = shows type. This is always the first check for disk space issues.",
      },
      {
        prompt: "Find what's consuming the most space on /.",
        choices: [
          { label: "du -sh /* | sort -h", isCorrect: true },
          { label: "ls -la /", isCorrect: false },
          { label: "find / -size +1G", isCorrect: false },
          { label: "iostat -xz 1", isCorrect: false },
        ],
        command: "du -sh /* 2>/dev/null | sort -h",
        output: `4.0K\t/mnt
16M\t/boot
120M\t/usr
45G\t/var`,
        interpretation: "/var is consuming 45GB — almost all disk space.",
        teachingNote: "`du -sh /*` shows size of each top-level directory. `sort -h` ranks by human-readable size. Always drill down into the largest.",
      },
      {
        prompt: "/var is 45GB. Drill deeper.",
        choices: [
          { label: "du -sh /var/* | sort -h", isCorrect: true },
          { label: "rm -rf /var/*", isCorrect: false },
          { label: "df -i", isCorrect: false },
          { label: "dmesg | tail", isCorrect: false },
        ],
        command: "du -sh /var/* 2>/dev/null | sort -h",
        output: `4.0K\t/var/tmp
12M\t/var/cache
44G\t/var/log`,
        interpretation: "/var/log is 44GB. Old logs haven't been rotated.",
        teachingNote: "Keep drilling with `du -sh` until you find the specific files. In this case, /var/log is the culprit — check log rotation config.",
      },
    ],
    rootCause: "Log rotation was misconfigured — old logs were never compressed or deleted.",
    resolution: "Compress old logs: `find /var/log -name '*.log' -mtime +7 -exec gzip {} \\;`. Fix logrotate config. Verify with `df -h`.",
  },

  {
    id: "diag-002",
    title: "High CPU Usage",
    description: "Users report the application is sluggish. Monitoring shows sustained 95%+ CPU on app-node-07.",
    difficulty: "learning",
    category: "cpu",
    steps: [
      {
        prompt: "Identify the process consuming CPU.",
        choices: [
          { label: "top (sort by CPU)", isCorrect: true },
          { label: "free -h", isCorrect: false },
          { label: "df -hT", isCorrect: false },
          { label: "ss -tlnp", isCorrect: false },
        ],
        command: "top -bn1 | head -15",
        output: `top - 14:23:01 up 45 days, load average: 7.82, 6.91, 5.44
Tasks: 203 total,   2 running, 201 sleeping
%Cpu(s): 94.2 us,  3.1 sy,  0.0 ni,  2.1 id,  0.0 wa,  0.6 hi
MiB Mem:  16384.0 total,   2048.0 free,  12288.0 used,  2048.0 buff/cache

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM COMMAND
  14523 app       20   0 4194304 3.2G   1.2M R  187.3  20.0 java
   1234 root      20   0  162540  12.1M  8.4M S    2.1   0.1 sshd`,
        interpretation: "PID 14523 (java) is at 187% CPU — saturating multiple cores.",
        teachingNote: "`top` sorted by CPU (press P) shows the heaviest processes. Load average 7.82 on this box means severe overload. The java process needs investigation.",
      },
      {
        prompt: "What are your options for this runaway process?",
        choices: [
          { label: "kill PID (SIGTERM first)", isCorrect: true },
          { label: "kill -9 immediately", isCorrect: false },
          { label: "reboot the server", isCorrect: false },
          { label: "ignore it", isCorrect: false },
        ],
        command: "kill 14523",
        output: `(no output — process received SIGTERM)`,
        interpretation: "SIGTERM gives the process a chance to shut down cleanly. Check if it responds.",
        teachingNote: "Always try SIGTERM (kill PID) before SIGKILL (kill -9). SIGTERM allows cleanup. Only escalate to -9 if the process ignores SIGTERM after a few seconds.",
      },
    ],
    rootCause: "Java application entered an infinite loop or GC death spiral.",
    resolution: "SIGTERM the process. If it's a service: `systemctl restart app`. Check application logs for the root cause of the loop.",
  },

  // ── Guided tier ──
  {
    id: "diag-003",
    title: "GPU Fallen Off Bus",
    description: "Monitoring alert: nvidia-smi reports ERR! for GPU 2 on gpu-rack12-node07. Training job paused.",
    difficulty: "guided",
    category: "gpu",
    steps: [
      {
        prompt: "What's the first thing to check?",
        choices: [
          { label: "dmesg for GPU/Xid errors", isCorrect: true },
          { label: "Reboot immediately", isCorrect: false },
          { label: "Check disk space", isCorrect: false },
          { label: "Check network connectivity", isCorrect: false },
        ],
        command: "dmesg -T | grep -i 'nvidia\\|xid' | tail -10",
        output: `[Tue Mar 31 02:14:33 2026] NVRM: Xid (PCI:0000:3b:00): 79, pid=0, GPU has fallen off the bus.
[Tue Mar 31 02:14:33 2026] NVRM: GPU at PCI:0000:3b:00 has fallen off the bus.`,
        interpretation: "Xid 79 — GPU has literally disconnected from the PCI bus. Hardware-level failure.",
        teachingNote: "`dmesg` shows kernel messages. Xid errors are NVIDIA's error codes. Xid 79 means the GPU is no longer communicating over PCIe — could be thermal shutdown, hardware fault, or PCIe issue.",
      },
      {
        prompt: "Is the GPU still visible on the PCI bus?",
        choices: [
          { label: "lspci | grep -i nvidia", isCorrect: true },
          { label: "nvidia-smi -q", isCorrect: false },
          { label: "systemctl status nvidia", isCorrect: false },
          { label: "cat /proc/cpuinfo", isCorrect: false },
        ],
        command: "lspci | grep -i nvidia",
        output: `3b:00.0 3D controller: NVIDIA Corporation [H100] (rev a1)
86:00.0 3D controller: NVIDIA Corporation [H100] (rev a1)
af:00.0 3D controller: NVIDIA Corporation [H100] (rev a1)`,
        interpretation: "Only 3 GPUs visible — the 4th (GPU 2) has disappeared from PCI enumeration.",
        teachingNote: "`lspci` queries the PCI bus directly. If a GPU doesn't appear here, the hardware has physically disconnected. Driver reloads won't help — need a power cycle or hardware intervention.",
      },
      {
        prompt: "Next step to attempt recovery?",
        choices: [
          { label: "Power cycle via IPMI", isCorrect: true },
          { label: "Reload nvidia driver (modprobe)", isCorrect: false },
          { label: "Delete the GPU device file", isCorrect: false },
          { label: "Run fsck", isCorrect: false },
        ],
        command: "ipmitool chassis power cycle",
        output: `Chassis Power Control: Cycle`,
        interpretation: "Power cycling resets the PCIe bus and may bring the GPU back.",
        teachingNote: "When a device falls off the PCI bus, a full power cycle (not just reboot) is needed to re-enumerate PCIe devices. Use IPMI for remote power cycle. If the GPU still doesn't come back after power cycle, it's a hardware RMA.",
      },
    ],
    rootCause: "GPU hardware fault — Xid 79 indicates PCIe communication failure.",
    resolution: "Power cycle via IPMI. If GPU returns: monitor closely. If not: drain node, file hardware RMA with GPU serial number and Xid logs.",
  },

  {
    id: "diag-004",
    title: "Service Won't Start",
    description: "After a server reboot, the monitoring agent (node-exporter) fails to start. systemctl shows 'failed'.",
    difficulty: "guided",
    category: "services",
    steps: [
      {
        prompt: "Check why the service failed.",
        choices: [
          { label: "systemctl status node-exporter", isCorrect: true },
          { label: "ps aux | grep node", isCorrect: false },
          { label: "df -h", isCorrect: false },
          { label: "ping localhost", isCorrect: false },
        ],
        command: "systemctl status node-exporter",
        output: `● node-exporter.service - Node Exporter
     Loaded: loaded (/etc/systemd/system/node-exporter.service; enabled)
     Active: failed (Result: exit-code) since Tue 2026-03-31 08:12:44 UTC
    Process: 1847 ExecStart=/usr/local/bin/node_exporter --web.listen-address=:9100
   Main PID: 1847 (code=exited, status=1/FAILURE)

Mar 31 08:12:44 web-prod-03 node_exporter[1847]: level=error msg="listen tcp :9100: bind: address already in use"`,
        interpretation: "Port 9100 is already in use — something else is binding to it.",
        teachingNote: "`systemctl status` shows the exit reason and recent log output. The error message 'address already in use' means another process is already on port 9100.",
      },
      {
        prompt: "Find what's using port 9100.",
        choices: [
          { label: "ss -tlnp | grep 9100", isCorrect: true },
          { label: "netstat -a", isCorrect: false },
          { label: "lsof /tmp", isCorrect: false },
          { label: "top", isCorrect: false },
        ],
        command: "ss -tlnp | grep 9100",
        output: `LISTEN  0  128  0.0.0.0:9100  0.0.0.0:*  users:(("old_monitor",pid=892,fd=5))`,
        interpretation: "An old monitoring agent (old_monitor, PID 892) is still running on port 9100.",
        teachingNote: "`ss -tlnp` shows listening ports with process names. `-t`=TCP, `-l`=listening, `-n`=numeric, `-p`=process. This is the go-to command for port conflicts.",
      },
      {
        prompt: "Resolve the port conflict.",
        choices: [
          { label: "Stop the old process, start node-exporter", isCorrect: true },
          { label: "Change node-exporter to a different port", isCorrect: false },
          { label: "Kill -9 both processes", isCorrect: false },
          { label: "Reboot the server", isCorrect: false },
        ],
        command: "kill 892 && systemctl start node-exporter",
        output: `(old_monitor stopped, node-exporter started successfully)`,
        interpretation: "Stopped the old agent, freed port 9100, and started the correct service.",
        teachingNote: "Fix the root cause: the old monitoring agent should be disabled so it doesn't start on boot. Run `systemctl disable old_monitor` or remove its startup script.",
      },
    ],
    rootCause: "Port conflict — legacy monitoring agent was still enabled and grabbed port 9100 before node-exporter.",
    resolution: "Stop old agent, disable it permanently, start node-exporter. Verify: `ss -tlnp | grep 9100`.",
  },

  // ── Independent tier ──
  {
    id: "diag-005",
    title: "Network Packet Loss",
    description: "Intermittent 5-8% packet loss reported between gpu-rack08-node03 and the storage cluster. Training throughput degraded.",
    difficulty: "independent",
    category: "network",
    steps: [
      {
        prompt: "Where do you start investigating packet loss?",
        choices: [
          { label: "mtr to the storage endpoint", isCorrect: true },
          { label: "Check disk space", isCorrect: false },
          { label: "Restart networking service", isCorrect: false },
          { label: "Check GPU status", isCorrect: false },
        ],
        command: "mtr -n --report -c 100 10.0.5.10",
        output: `HOST:                 Loss%  Snt   Last  Avg   Best  Wrst
1. 10.0.8.1            0.0%  100   0.3   0.4   0.2   1.1
2. 10.0.0.1            0.0%  100   0.5   0.6   0.3   1.8
3. 10.0.5.1            6.0%  100   0.8   1.2   0.4  12.3
4. 10.0.5.10           6.0%  100   0.9   1.4   0.5  13.1`,
        interpretation: "Loss starts at hop 3 (10.0.5.1) — a switch or link between hops 2 and 3.",
        teachingNote: "`mtr` combines ping + traceroute, showing per-hop loss over time. If loss starts at a specific hop and continues, the problem is AT that hop — likely a switch port, cable, or transceiver issue.",
      },
      {
        prompt: "Check the local NIC for errors.",
        choices: [
          { label: "ethtool -S eth0", isCorrect: true },
          { label: "ip addr show", isCorrect: false },
          { label: "cat /etc/hosts", isCorrect: false },
          { label: "dmesg | grep memory", isCorrect: false },
        ],
        command: "ethtool -S eth0 | grep -i 'error\\|drop\\|crc'",
        output: `rx_crc_errors: 4823
rx_dropped: 12
tx_errors: 0`,
        interpretation: "4823 CRC errors on receive — indicates a physical layer problem (cable, transceiver, or dirty fiber).",
        teachingNote: "`ethtool -S` shows NIC hardware counters. CRC errors almost always point to physical layer: dirty fiber connectors, bad cable, or failing transceiver. Clean connectors first, then swap components.",
      },
      {
        prompt: "Most likely physical cause of CRC errors?",
        choices: [
          { label: "Dirty fiber connectors", isCorrect: true },
          { label: "Wrong IP address", isCorrect: false },
          { label: "Firewall rules", isCorrect: false },
          { label: "DNS misconfiguration", isCorrect: false },
        ],
        command: "(physical inspection and cleaning)",
        output: "Cleaned both fiber connector ends. Re-checked light levels with ethtool -m eth0.",
        interpretation: "Contaminated fiber connectors are the #1 cause of CRC errors. Always clean first.",
        teachingNote: "#1 rule of fiber troubleshooting: clean first, diagnose second. Use a one-click cleaner, inspect with a fiber scope, then re-check error counters.",
      },
    ],
    rootCause: "Dirty fiber connectors causing CRC errors and packet loss at the ToR switch uplink.",
    resolution: "Clean fiber connectors on both ends. Verify: `ethtool -S eth0` — CRC errors should stop accumulating. Re-run `mtr` to confirm loss resolved.",
  },

  // ── Full tier ──
  {
    id: "diag-006",
    title: "OOM Killer Strikes",
    description: "3 AM alert: critical process 'ml-trainer' was killed by the OOM killer on gpu-node-22. Training job lost 4 hours of checkpoint data.",
    difficulty: "full",
    category: "memory",
    steps: [
      {
        prompt: "Confirm the OOM kill and identify what happened.",
        choices: [
          { label: "dmesg | grep -i oom", isCorrect: true },
          { label: "top", isCorrect: false },
          { label: "df -h", isCorrect: false },
          { label: "nvidia-smi", isCorrect: false },
        ],
        command: "dmesg -T | grep -i 'oom\\|killed process'",
        output: `[Tue Mar 31 03:14:22 2026] Out of memory: Killed process 8842 (ml-trainer) total-vm:98304000kB, anon-rss:62521344kB
[Tue Mar 31 03:14:22 2026] oom_kill_constraint=CONSTRAINT_NONE`,
        interpretation: "OOM killer terminated ml-trainer (PID 8842). It was using ~60GB RSS when killed.",
        teachingNote: "The OOM killer is the kernel's last resort when memory is exhausted. `dmesg` logs which process was killed and why. The kernel prints a full memory snapshot at OOM time.",
      },
      {
        prompt: "Check current memory state.",
        choices: [
          { label: "free -h", isCorrect: true },
          { label: "iostat", isCorrect: false },
          { label: "lspci", isCorrect: false },
          { label: "ss -tlnp", isCorrect: false },
        ],
        command: "free -h",
        output: `              total        used        free      shared  buff/cache   available
Mem:          125Gi       118Gi       1.2Gi       4.0Gi       5.8Gi       2.1Gi
Swap:           0B          0B          0B`,
        interpretation: "125GB total, only 2.1GB available. No swap configured. System is still under heavy memory pressure.",
        teachingNote: "'available' is the key column — it accounts for reclaimable cache. No swap means there's zero cushion before the OOM killer strikes again.",
      },
      {
        prompt: "Investigate what's consuming the remaining memory.",
        choices: [
          { label: "ps aux --sort=-%mem | head", isCorrect: true },
          { label: "du -sh /*", isCorrect: false },
          { label: "uptime", isCorrect: false },
          { label: "cat /etc/fstab", isCorrect: false },
        ],
        command: "ps aux --sort=-%mem | head -8",
        output: `USER  PID  %CPU %MEM     VSZ    RSS COMMAND
app  9102  45.2 42.1 6400000  52.6G data-preprocessor
app  9205  12.1 22.3 3200000  27.8G checkpoint-writer
root 1102   0.1  1.2  204800   1.5G prometheus`,
        interpretation: "data-preprocessor (52.6GB) + checkpoint-writer (27.8GB) = 80.4GB. They're consuming most of the 125GB.",
        teachingNote: "`ps aux --sort=-%mem` ranks by memory. RSS (Resident Set Size) is the actual physical memory used. Together these two processes use 64% of system RAM.",
      },
      {
        prompt: "How do you prevent this from happening again?",
        choices: [
          { label: "Set MemoryMax in systemd unit files", isCorrect: true },
          { label: "Add more disk space", isCorrect: false },
          { label: "Disable the OOM killer entirely", isCorrect: false },
          { label: "Reduce CPU cores", isCorrect: false },
        ],
        command: "systemctl edit ml-trainer (add MemoryMax=64G)",
        output: "[Service]\nMemoryMax=64G",
        interpretation: "Cgroup memory limits prevent any single service from consuming all system RAM.",
        teachingNote: "`MemoryMax=` in the systemd unit file sets a hard cgroup limit. If the process exceeds it, only that process is killed — not a random victim. Also consider adding swap as a buffer, and protecting critical processes with `oom_score_adj=-1000`.",
      },
    ],
    rootCause: "No memory limits configured. data-preprocessor grew unbounded, exhausting system RAM. OOM killer targeted ml-trainer instead.",
    resolution: "Set `MemoryMax=` limits on all training processes via systemd. Protect ml-trainer with `oom_score_adj=-1000`. Consider adding swap as a safety buffer.",
  },

  {
    id: "diag-007",
    title: "Read-Only Filesystem",
    description: "Applications on db-node-05 failing with 'Read-only file system' errors. Database writes are blocked.",
    difficulty: "guided",
    category: "storage",
    steps: [
      {
        prompt: "Confirm the filesystem state.",
        choices: [
          { label: "mount | grep ' / '", isCorrect: true },
          { label: "free -h", isCorrect: false },
          { label: "top", isCorrect: false },
          { label: "nvidia-smi", isCorrect: false },
        ],
        command: "mount | grep ' / '",
        output: `/dev/sda2 on / type ext4 (ro,relatime)`,
        interpretation: "Root is mounted read-only (ro). Kernel remounted it to prevent data loss.",
        teachingNote: "The kernel automatically remounts filesystems read-only when it detects I/O errors. This is a protective mechanism — the underlying disk likely has a problem.",
      },
      {
        prompt: "Why did the kernel remount it?",
        choices: [
          { label: "Check dmesg for I/O errors", isCorrect: true },
          { label: "Check network logs", isCorrect: false },
          { label: "Run top", isCorrect: false },
          { label: "Check GPU status", isCorrect: false },
        ],
        command: "dmesg -T | grep -i 'i/o\\|ext4\\|error' | tail -5",
        output: `[Tue Mar 31 01:22:11 2026] EXT4-fs error (device sda2): ext4_find_entry:1234: inode #524288: comm nginx: reading directory lblock 0
[Tue Mar 31 01:22:11 2026] EXT4-fs (sda2): Remounting filesystem read-only`,
        interpretation: "ext4 detected I/O errors reading from sda2 and remounted read-only.",
        teachingNote: "Always check `dmesg` when a filesystem goes read-only. The kernel logs the exact error that triggered the remount. I/O errors usually indicate disk hardware problems.",
      },
      {
        prompt: "Check if the disk is failing.",
        choices: [
          { label: "smartctl -a /dev/sda", isCorrect: true },
          { label: "blkid", isCorrect: false },
          { label: "lsblk", isCorrect: false },
          { label: "fdisk -l", isCorrect: false },
        ],
        command: "smartctl -a /dev/sda | grep -E 'Reallocated|Pending|Uncorrectable|Health'",
        output: `SMART overall-health self-assessment test result: FAILED
  5 Reallocated_Sector_Ct   0x0033   084   084   036    Pre-fail  148
197 Current_Pending_Sector   0x0012   100   100   000    Old_age   12
198 Offline_Uncorrectable    0x0010   100   100   000    Old_age   3`,
        interpretation: "SMART FAILED. 148 reallocated sectors, 12 pending, 3 uncorrectable. This disk is dying.",
        teachingNote: "SMART indicators: Reallocated sectors = bad sectors remapped. Pending sectors = suspected bad, not yet confirmed. Uncorrectable = data loss. Any of these above zero is a warning; SMART FAILED means replace immediately.",
      },
    ],
    rootCause: "Physical disk degradation — SMART shows failing sectors causing I/O errors.",
    resolution: "Drain workloads. File hardware RMA with SMART data + disk serial. Replace disk, restore from backup. Verify new disk health with `smartctl`.",
  },

  {
    id: "diag-008",
    title: "Memory Errors",
    description: "Monitoring shows increasing correctable ECC memory errors on compute-node-15. No crashes yet, but error rate is climbing.",
    difficulty: "independent",
    category: "hardware",
    steps: [
      {
        prompt: "Check the memory error details.",
        choices: [
          { label: "edac-util -s", isCorrect: true },
          { label: "free -h", isCorrect: false },
          { label: "df -hT", isCorrect: false },
          { label: "nvidia-smi", isCorrect: false },
        ],
        command: "edac-util -s",
        output: `mc0: csrow2: ch0: 847 Correctable errors
mc0: csrow2: ch1: 0 Correctable errors`,
        interpretation: "847 correctable errors on memory controller 0, row 2, channel 0 — one specific DIMM.",
        teachingNote: "`edac-util` decodes ECC errors by memory controller, row, and channel. This maps to a physical DIMM slot. Correctable errors mean ECC is catching them, but the DIMM is degrading.",
      },
      {
        prompt: "Identify the physical DIMM.",
        choices: [
          { label: "dmidecode -t memory", isCorrect: true },
          { label: "lscpu", isCorrect: false },
          { label: "lsblk", isCorrect: false },
          { label: "top", isCorrect: false },
        ],
        command: "dmidecode -t memory | grep -A5 'Locator: DIMM_A2'",
        output: `\tLocator: DIMM_A2
\tBank Locator: NODE 0
\tType: DDR5
\tSize: 64 GB
\tPart Number: M321RBGA-CB
\tSerial Number: 3A4B5C6D`,
        interpretation: "The failing DIMM is in slot DIMM_A2, serial 3A4B5C6D, 64GB DDR5.",
        teachingNote: "`dmidecode -t memory` reads BIOS/UEFI data to show physical DIMM locations, serials, and specs. Cross-reference the EDAC row/channel with the DIMM locator to find the exact stick.",
      },
      {
        prompt: "What's the plan?",
        choices: [
          { label: "Mark node degraded, schedule DIMM replacement", isCorrect: true },
          { label: "Ignore it — ECC is handling it", isCorrect: false },
          { label: "Reboot immediately", isCorrect: false },
          { label: "Add more RAM", isCorrect: false },
        ],
        command: "(action plan)",
        output: "Node marked degraded. Hardware RMA filed for DIMM_A2 (serial 3A4B5C6D). Drain scheduled.",
        interpretation: "Correctable errors that are increasing will eventually become uncorrectable. Replace proactively.",
        teachingNote: "Correctable errors = ECC doing its job, but a rising count indicates physical degradation. Don't wait for uncorrectable errors (which cause crashes/data corruption). Schedule replacement during a maintenance window.",
      },
    ],
    rootCause: "Physical DIMM degradation in slot DIMM_A2 — correctable errors increasing toward failure threshold.",
    resolution: "Drain node, replace DIMM_A2, run memtest86+ after replacement, monitor for 24h before returning to production.",
  },

  {
    id: "diag-009",
    title: "NFS Stale Handle",
    description: "Researchers report 'Stale NFS file handle' errors when accessing shared datasets on ml-node-03.",
    difficulty: "guided",
    category: "storage",
    steps: [
      {
        prompt: "Check the current NFS mount state.",
        choices: [
          { label: "mount | grep nfs", isCorrect: true },
          { label: "df -hT", isCorrect: false },
          { label: "lsblk", isCorrect: false },
          { label: "top", isCorrect: false },
        ],
        command: "mount | grep nfs",
        output: `nfs-server:/datasets on /mnt/datasets type nfs4 (rw,relatime,vers=4.2)`,
        interpretation: "Mount exists and shows as rw, but the stale handle means the server-side reference is invalid.",
        teachingNote: "A stale NFS handle means the client's cached file reference no longer matches what the server has. Usually caused by server-side changes (re-export, restart, or path change).",
      },
      {
        prompt: "Fix the stale mount.",
        choices: [
          { label: "umount -l then remount", isCorrect: true },
          { label: "Reboot the client", isCorrect: false },
          { label: "Delete /mnt/datasets", isCorrect: false },
          { label: "Run fsck on NFS", isCorrect: false },
        ],
        command: "umount -l /mnt/datasets && mount -t nfs4 nfs-server:/datasets /mnt/datasets",
        output: `(mount successful)`,
        interpretation: "Lazy unmount detaches immediately, then fresh mount re-establishes the connection.",
        teachingNote: "`umount -l` (lazy) is key for stuck NFS mounts — it detaches without waiting for open files to close. Then remount fresh. `-f` (force) sometimes works too.",
      },
    ],
    rootCause: "NFS server restarted or re-exported the share, invalidating client-side file handles.",
    resolution: "Lazy unmount + remount. If recurring: check NFS server stability, verify `/etc/exports`, ensure autofs or fstab entries are correct.",
  },

  {
    id: "diag-010",
    title: "Rack Switch Failure",
    description: "8 nodes in Rack 22 simultaneously lost network connectivity. BMCs are also unreachable.",
    difficulty: "full",
    category: "network",
    steps: [
      {
        prompt: "What's the most likely cause of 8 simultaneous failures?",
        choices: [
          { label: "Shared infrastructure — ToR switch or PDU", isCorrect: true },
          { label: "Virus on all 8 nodes", isCorrect: false },
          { label: "DNS failure", isCorrect: false },
          { label: "NFS server down", isCorrect: false },
        ],
        command: "ssh tor-switch-rack22 (connection refused)",
        output: `ssh: connect to host tor-switch-rack22 port 22: Connection refused`,
        interpretation: "ToR switch is unreachable. If it's down, all nodes in the rack lose network.",
        teachingNote: "Simultaneous multi-node failures point to shared infrastructure, not coincidental individual failures. Think: switch, PDU, circuit breaker, cabling.",
      },
      {
        prompt: "You go to the rack. Switch LEDs are dark, but servers have fans spinning. What happened?",
        choices: [
          { label: "Switch lost power — check PDU/cable", isCorrect: true },
          { label: "Switch firmware crash", isCorrect: false },
          { label: "All ports failed", isCorrect: false },
          { label: "Fiber cut to rack", isCorrect: false },
        ],
        command: "(physical inspection — re-seat power cable)",
        output: "Power cable re-seated. Switch LEDs come on. Boot sequence starting.",
        interpretation: "Switch power cable was loose. Servers were on a separate PDU circuit.",
        teachingNote: "Physical inspection is essential for DC ops. Dark LEDs + running servers = switch power issue. Servers on separate PDU stayed up but lost network when the switch died.",
      },
      {
        prompt: "Switch is back. 6/8 nodes recovered. 2 still down. Next step?",
        choices: [
          { label: "Check those 2 switch ports + reseat cables", isCorrect: true },
          { label: "Reboot all 8 nodes", isCorrect: false },
          { label: "Replace the switch", isCorrect: false },
          { label: "Wait 30 minutes", isCorrect: false },
        ],
        command: "(reseat cables for the 2 non-responsive nodes)",
        output: "Both cables re-seated. Links came up. Nodes reconnected.",
        interpretation: "The switch power loss may have caused link state issues on those 2 ports. Re-seating fixed it.",
        teachingNote: "After a switch outage, not all ports may recover cleanly. Physical re-seat of cables is the first step. If that doesn't work: try different switch ports, check the NIC on the server side.",
      },
    ],
    rootCause: "ToR switch lost power due to loose power cable. 2 ports had link state issues after recovery.",
    resolution: "Re-seat switch power + 2 server cables. Post-incident: recommend dual power feeds for switch, add switch uptime monitoring, keep cold spare available.",
  },
];

export default scenarios;

export function getScenariosByDifficulty(difficulty: DiagnosisDifficulty): DiagnosisScenario[] {
  return scenarios.filter((s) => s.difficulty === difficulty);
}

export function getScenarioById(id: string): DiagnosisScenario | undefined {
  return scenarios.find((s) => s.id === id);
}
