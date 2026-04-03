// ═══════════════════════════════════════
// Linux Boot Process — Learning + Triage Data
// ═══════════════════════════════════════

// ── L1 Stage definitions ──

export interface BootStage {
  id: string;
  order: number;
  name: string;
  icon: string;
  color: string;
  summary: string;
  detail: string;
  recallQuestion: string;
  recallAnswer: string;
  recallDistractors: string[];
}

export const BOOT_STAGES: BootStage[] = [
  {
    id: "firmware",
    order: 1,
    name: "Firmware (UEFI/BIOS)",
    icon: "⏻",
    color: "#f59e0b",
    summary: "Checks hardware and finds the boot disk.",
    detail: "POST (Power-On Self-Test) runs. Firmware initializes CPU, memory controller, PCIe bus, then enumerates devices. UEFI reads boot entries from NVRAM and locates the .efi bootloader on the EFI System Partition.",
    recallQuestion: "What is the primary diagnostic tool during the firmware phase when no OS is loaded?",
    recallAnswer: "BMC/IPMI (System Event Log)",
    recallDistractors: ["dmesg", "journalctl -xb", "GRUB console"],
  },
  {
    id: "bootloader",
    order: 2,
    name: "Bootloader (GRUB2)",
    icon: "⟐",
    color: "#3b82f6",
    summary: "Loads the kernel into memory.",
    detail: "GRUB loads from the ESP, reads /boot/grub2/grub.cfg, and loads two things into memory: the kernel image (vmlinuz) and the initial RAM filesystem (initramfs). This is where you select older kernels or pass emergency parameters.",
    recallQuestion: "What two things does GRUB load into memory?",
    recallAnswer: "The kernel image (vmlinuz) and initramfs",
    recallDistractors: ["systemd and the root filesystem", "The BIOS and the MBR", "Device drivers and swap partition"],
  },
  {
    id: "kernel",
    order: 3,
    name: "Kernel Initialization",
    icon: "⬡",
    color: "#8b5cf6",
    summary: "Starts up, detects hardware, mounts temporary filesystem.",
    detail: "The kernel decompresses (vmlinuz is self-extracting), initializes CPU scheduler, memory manager, interrupt handlers. It walks the PCIe bus loading drivers, then extracts the initramfs cpio archive into a tmpfs rootfs. Everything is logged to the kernel ring buffer (dmesg).",
    recallQuestion: "How do you access the kernel's boot-time hardware detection log?",
    recallAnswer: "dmesg (kernel ring buffer)",
    recallDistractors: ["journalctl -xb", "ipmitool sel list", "/var/log/boot.log"],
  },
  {
    id: "initramfs",
    order: 4,
    name: "initramfs",
    icon: "◈",
    color: "#06b6d4",
    summary: "Loads storage drivers and mounts the real root disk.",
    detail: "initramfs loads storage drivers (NVMe, RAID, LVM, filesystem modules) not compiled into the kernel. Once the real root partition mounts, it calls switch_root — deleting initramfs from memory and pivoting to the real root filesystem's init system.",
    recallQuestion: "What mechanism does modern initramfs use to hand off to the real root filesystem?",
    recallAnswer: "switch_root",
    recallDistractors: ["pivot_root", "chroot", "mount --move"],
  },
  {
    id: "systemd",
    order: 5,
    name: "systemd (PID 1)",
    icon: "⊞",
    color: "#22c55e",
    summary: "Starts all services in parallel based on dependencies.",
    detail: "The kernel executes /sbin/init (symlinked to systemd). systemd becomes PID 1, processes unit files organized into targets, and parallelizes service startup using socket activation and dependency graphs. The default server target is multi-user.target.",
    recallQuestion: "Why can a failed mount cause a seemingly unrelated network service to fail?",
    recallAnswer: "systemd's dependency graph — services that depend on that mount point are blocked",
    recallDistractors: ["The kernel panics on mount failure", "NetworkManager restarts on any error", "GRUB disables networking if mounts fail"],
  },
  {
    id: "ready",
    order: 6,
    name: "System Ready",
    icon: "◉",
    color: "#10b981",
    summary: "Login prompt appears — server is operational.",
    detail: "Once the target's dependency tree is fully satisfied, getty spawns on TTYs, sshd accepts connections, and monitoring agents come online. The server is operational and accepting work.",
    recallQuestion: "If the server booted but is unreachable via SSH, how do you get console access remotely?",
    recallAnswer: "BMC Serial-Over-LAN (ipmitool sol activate)",
    recallDistractors: ["Reboot into single-user mode", "SSH to a different port", "Check GRUB for network parameters"],
  },
];

// ── L2 Deep Dive cards (per stage) ──

export interface DeepDiveCard {
  stageId: string;
  id: string;
  topic: string;
  front: string;         // question / forced recall prompt
  back: string;          // answer revealed after attempt
  category: "tools" | "failure" | "recovery" | "concept";
}

export const DEEP_DIVE_CARDS: DeepDiveCard[] = [
  // ── Firmware ──
  {
    stageId: "firmware", id: "dd-fw-1", topic: "SEL Diagnostics",
    category: "tools",
    front: "A server has no POST output but fans are spinning. What is your first remote diagnostic step?",
    back: "Pull the BMC System Event Log with `ipmitool sel list`. The SEL captures hardware faults (bad DIMMs, failed CPUs, PSU faults, thermal events) at the firmware level, even with no OS running.",
  },
  {
    stageId: "firmware", id: "dd-fw-2", topic: "POST Failure Modes",
    category: "failure",
    front: "A server enters a POST loop — it restarts repeatedly before reaching the bootloader. Name two likely causes.",
    back: "BIOS/firmware corruption, or incompatible hardware (e.g., unseated DIMM, bad CPU). Recovery: clear CMOS, attempt BMC firmware recovery, try minimal config (1 CPU, 1 DIMM, no GPUs).",
  },
  {
    stageId: "firmware", id: "dd-fw-3", topic: "UEFI Boot Entries",
    category: "concept",
    front: "Where does UEFI store its boot entries, and what userspace tool manages them?",
    back: "Boot entries are stored in NVRAM on the motherboard. Each entry specifies a disk, partition, and path to an .efi binary. `efibootmgr` is the userspace tool for viewing and modifying these entries.",
  },
  {
    stageId: "firmware", id: "dd-fw-4", topic: "Secure Boot Chain",
    category: "concept",
    front: "In a Secure Boot environment, what verifies the bootloader before it executes, and what is 'shim'?",
    back: "UEFI firmware verifies the bootloader's cryptographic signature against keys in the UEFI key database. `shim` is a first-stage bootloader signed by Microsoft's UEFI CA that chain-loads GRUB. Most enterprise Linux distros use this approach.",
  },
  // ── Bootloader ──
  {
    stageId: "bootloader", id: "dd-bl-1", topic: "Remote GRUB Access",
    category: "tools",
    front: "You need to select an older kernel on a remote server you can't physically reach. How do you interact with GRUB?",
    back: "Serial-Over-LAN via `ipmitool sol activate` gives you remote console visibility into GRUB, letting you select kernels or edit boot parameters without being at the rack.",
  },
  {
    stageId: "bootloader", id: "dd-bl-2", topic: "GRUB Rescue",
    category: "failure",
    front: "You see `grub rescue>` on the console. What does this mean and what can you do from this prompt?",
    back: "The boot partition was not found — could be disk failure, bad partition table, or misconfigured GRUB. From the rescue prompt, use `ls` to enumerate available partitions and `set` to configure root/prefix before loading the normal module.",
  },
  {
    stageId: "bootloader", id: "dd-bl-3", topic: "Verbose Boot",
    category: "recovery",
    front: "A server stalls during boot with no useful output. What kernel parameters do you remove in GRUB to see what's happening?",
    back: "Remove `quiet` and `rhgb` from the kernel command line in GRUB. This enables verbose console output showing each step of kernel initialization and service startup.",
  },
  // ── Kernel ──
  {
    stageId: "kernel", id: "dd-k-1", topic: "vmlinuz Internals",
    category: "concept",
    front: "What is vmlinuz, structurally? What happens when GRUB hands execution to it?",
    back: "vmlinuz is a compressed kernel image wrapped in a decompression stub. When executed, the stub decompresses the actual kernel (using gzip/lzma/xz/lz4) into memory, then jumps to the kernel entry point. This happens before any kernel initialization.",
  },
  {
    stageId: "kernel", id: "dd-k-2", topic: "Kernel Panic Triage",
    category: "failure",
    front: "You see a kernel panic with a stack trace during boot. The trace references `drivers/nvme/...`. What is your immediate recovery step?",
    back: "Boot an older kernel from the GRUB menu. The panic in an NVMe driver indicates a driver fault or incompatible kernel module — likely from a recent kernel update. After booting the old kernel, check `dmesg` for the specific failure.",
  },
  // ── initramfs ──
  {
    stageId: "initramfs", id: "dd-ir-1", topic: "switch_root vs pivot_root",
    category: "concept",
    front: "Why does modern initramfs use switch_root instead of pivot_root?",
    back: "switch_root is designed for tmpfs-backed initramfs (cpio archive). It deletes the old rootfs contents from RAM, moves the real root to /, chroots into it, and executes init. pivot_root was for legacy initrd (block device images) and moves the old root to a subdirectory. They are not interchangeable — you cannot pivot_root out of rootfs.",
  },
  {
    stageId: "initramfs", id: "dd-ir-2", topic: "initramfs Failure Recovery",
    category: "recovery",
    front: "The server drops to an emergency shell with 'Unable to mount root fs'. The root disk was recently replaced. What is the most likely cause and fix?",
    back: "UUID mismatch in /etc/fstab — the new disk has a different UUID. Fix: boot from rescue media, mount the root partition manually, update the UUID in /etc/fstab, and rebuild initramfs with `dracut -f` (RHEL) or `update-initramfs -u` (Debian).",
  },
  {
    stageId: "initramfs", id: "dd-ir-3", topic: "Missing Storage Drivers",
    category: "failure",
    front: "After a kernel update, the server hangs at initramfs — the root disk is not detected. What went wrong?",
    back: "The new kernel's initramfs was not rebuilt with the required storage drivers (NVMe, RAID, LVM modules). The initramfs can't load the drivers needed to access the real disk. Recovery: boot the old kernel, then rebuild initramfs for the new kernel with `dracut -f`.",
  },
  // ── systemd ──
  {
    stageId: "systemd", id: "dd-sd-1", topic: "Dependency Cascades",
    category: "concept",
    front: "A monitoring agent won't start. You trace it back to a failed mount. Explain the cascade mechanism.",
    back: "systemd generators (like systemd-fstab-generator) dynamically create mount units from /etc/fstab at early boot. A bad fstab entry creates a mount unit that fails, which blocks anything declaring After= or Requires= on that mount point. The cascade can chain through network services to monitoring agents.",
  },
  {
    stageId: "systemd", id: "dd-sd-2", topic: "Socket Activation",
    category: "concept",
    front: "What is socket activation and how can it complicate troubleshooting?",
    back: "systemd creates a listening socket for a service before the service process is running. The first connection triggers the actual process start. A service can appear 'active' to dependents before its binary has loaded — which speeds boot but means the process might fail on first access, not at startup.",
  },
  {
    stageId: "systemd", id: "dd-sd-3", topic: "Boot Diagnostics",
    category: "tools",
    front: "The server stalls at 'Starting [service]...'. What two commands give you the most actionable information?",
    back: "`systemctl list-units --failed` shows which units failed, and `journalctl -xb` gives the full boot log with explanatory context. You can filter to a specific unit with `journalctl -u <service>`.",
  },
  {
    stageId: "systemd", id: "dd-sd-4", topic: "Dependency Tracing",
    category: "tools",
    front: "How do you find the root cause when a unit fails due to a dependency chain?",
    back: "`systemctl list-dependencies <unit>` shows the full dependency tree. Walk the tree to find the first failed dependency — that's your root cause. Combine with `systemctl status <failed-unit>` for the specific error.",
  },
  // ── System Ready ──
  {
    stageId: "ready", id: "dd-sr-1", topic: "SSH Unreachable",
    category: "failure",
    front: "The server booted successfully but is unreachable via SSH. What is your diagnostic approach?",
    back: "Use BMC SOL (`ipmitool sol activate`) for console access. Then check: `ip a` (is the NIC up with an IP?), `systemctl status sshd` (is sshd running?), `journalctl -u NetworkManager` (did networking come up?). The OS is running — the issue is at the service layer.",
  },
  {
    stageId: "ready", id: "dd-sr-2", topic: "Evidence Capture",
    category: "recovery",
    front: "What is the cardinal rule before rebooting a server that failed to come up properly?",
    back: "Capture evidence first. SEL logs, console output, kernel panic traces, journalctl output — document everything before rebooting. Rebooting without capturing can destroy the information needed to prevent recurrence.",
  },
];

// ── Boot Triage Game scenarios ──

export interface TriageChoice {
  label: string;
  isCorrect: boolean;
}

export interface TriageStep {
  prompt: string;
  context?: string;             // simulated output / observation
  choices: TriageChoice[];
  correctExplanation: string;   // shown after correct answer
  teachingNote: string;         // shown after wrong answer
}

export interface TriageScenario {
  id: string;
  title: string;
  ticket: string;               // opening incident ticket text
  difficulty: "standard" | "advanced";
  steps: TriageStep[];
  rootCause: string;
  resolution: string;
  keyTakeaway: string;
}

export const TRIAGE_SCENARIOS: TriageScenario[] = [
  // ── Scenario 1: POST Loop after DIMM replacement ──
  {
    id: "triage-001",
    title: "POST Loop After Maintenance",
    ticket: "TICKET-4821: gpu-train-node-17 is not responding after scheduled DIMM replacement during maintenance window. Monitoring shows host unreachable for 23 minutes. On-site tech reports fans are spinning but the server keeps restarting.",
    difficulty: "standard",
    steps: [
      {
        prompt: "The server is power-cycling repeatedly. What is the FIRST thing you check?",
        choices: [
          { label: "Can I reach the BMC remotely?", isCorrect: true },
          { label: "SSH into the server", isCorrect: false },
          { label: "Check GRUB configuration", isCorrect: false },
          { label: "Review systemd journal", isCorrect: false },
        ],
        correctExplanation: "Always start with BMC. The server is in a POST loop — no OS is running, so SSH, GRUB, and journalctl are all unreachable. BMC operates independently of the host OS.",
        teachingNote: "The server never reaches the OS. SSH, GRUB, and systemd are all layers above firmware. You need an out-of-band tool — BMC/IPMI — which runs on its own embedded controller regardless of host state.",
      },
      {
        prompt: "You reach BMC. What do you pull first?",
        context: "BMC web interface is accessible. Server power status shows 'On' with repeated power cycles.",
        choices: [
          { label: "ipmitool sel list — pull the System Event Log", isCorrect: true },
          { label: "ipmitool sol activate — watch the console", isCorrect: false },
          { label: "ipmitool power cycle — reboot the server", isCorrect: false },
          { label: "ipmitool chassis status — check power state", isCorrect: false },
        ],
        correctExplanation: "The SEL captures hardware faults at the firmware level. On a POST loop, the SEL will tell you exactly which component is failing — before you spend time watching console output that may flash by too fast in a loop.",
        teachingNote: "SOL is useful but on a fast POST loop the output scrolls past. Chassis status just confirms what you already know (it's power cycling). Never blindly reboot — that destroys evidence. SEL is your primary evidence source at the firmware layer.",
      },
      {
        prompt: "The SEL shows a memory training error on DIMM slot B2. What is your recommended action?",
        context: "SEL output:\n0x01 | Memory | Correctable ECC | DIMM B2 — training failure\n0x02 | System Event | OEM — POST failure, restart initiated",
        choices: [
          { label: "Reseat DIMM B2 — the replacement may not be fully seated", isCorrect: true },
          { label: "Replace the motherboard — memory controller failure", isCorrect: false },
          { label: "Clear CMOS and retry POST", isCorrect: false },
          { label: "Boot with DIMM B2 removed to isolate", isCorrect: false },
        ],
        correctExplanation: "After a DIMM replacement, the most common cause of a training failure is an incompletely seated module. Reseat first — it's the simplest fix and matches the maintenance that was just performed. Escalate to replacement only if reseating fails.",
        teachingNote: "Always try the simplest physical fix first, especially when it directly correlates with recent work. Replacing the motherboard is premature. Clearing CMOS won't fix a physically unseated DIMM. Booting without the DIMM works as isolation but isn't the fix.",
      },
    ],
    rootCause: "DIMM B2 was not fully seated during the maintenance window DIMM replacement.",
    resolution: "Reseat DIMM B2. Verify POST completes. Confirm SEL is clean. Monitor for correctable ECC errors over the next 24 hours.",
    keyTakeaway: "On a POST loop, BMC SEL is your primary tool. The failure pattern points to firmware-layer hardware faults. Always correlate with recent maintenance — the simplest explanation tied to recent work is usually correct.",
  },
  // ── Scenario 2: Emergency shell after disk replacement ──
  {
    id: "triage-002",
    title: "Emergency Shell After Disk Swap",
    ticket: "TICKET-5103: storage-node-42 dropped to an emergency shell after a failed NVMe drive was hot-swapped during the previous shift. The on-site tech confirmed the new drive is physically installed. Server is not serving traffic.",
    difficulty: "standard",
    steps: [
      {
        prompt: "The ticket says the server is in an emergency shell. What boot phase does this indicate?",
        choices: [
          { label: "initramfs — it failed to mount the real root filesystem", isCorrect: true },
          { label: "Firmware — POST failed", isCorrect: false },
          { label: "GRUB — bootloader can't find the kernel", isCorrect: false },
          { label: "systemd — a service dependency failed", isCorrect: false },
        ],
        correctExplanation: "An emergency shell with 'Unable to mount root fs' or a dracut/initramfs prompt means the initramfs loaded successfully but couldn't find or mount the real root partition. This is squarely in the initramfs phase.",
        teachingNote: "POST failures show no output or beep codes. GRUB failures show `grub>` or `grub rescue>`. systemd failures show the system partially booted with failed services. An emergency shell at the initramfs level is a distinct symptom.",
      },
      {
        prompt: "You connect via SOL and see the dracut emergency shell. The drive was just replaced. What is the most likely root cause?",
        context: "dracut shell output:\nWarning: /dev/disk/by-uuid/a3f8e2d1-... does not exist\nWarning: Boot has failed. To debug, run journalctl.\nDropping to emergency shell.",
        choices: [
          { label: "UUID mismatch in /etc/fstab — new drive has a different UUID", isCorrect: true },
          { label: "The NVMe driver is missing from initramfs", isCorrect: false },
          { label: "The kernel is corrupted", isCorrect: false },
          { label: "systemd can't find the default target", isCorrect: false },
        ],
        correctExplanation: "The error message says the UUID doesn't exist. After a disk replacement, the new drive gets a new UUID. /etc/fstab still references the old UUID, so initramfs can't find the root partition.",
        teachingNote: "Read the error output carefully — it explicitly says the UUID doesn't exist. Missing NVMe drivers would show 'no block devices found', not a UUID lookup failure. The kernel loaded fine (you're in the dracut shell). systemd hasn't started yet.",
      },
      {
        prompt: "How do you fix this from the emergency shell?",
        choices: [
          { label: "Mount root manually, fix /etc/fstab UUID, rebuild initramfs with dracut -f", isCorrect: true },
          { label: "Reboot — the drive might need a second attempt", isCorrect: false },
          { label: "Reinstall the OS from scratch", isCorrect: false },
          { label: "Replace the NVMe drive again — it might be defective", isCorrect: false },
        ],
        correctExplanation: "From the emergency shell: find the new UUID with `blkid`, mount the root partition manually (e.g., `mount /dev/nvme0n1p2 /sysroot`), edit /etc/fstab to update the UUID, then rebuild initramfs with `dracut -f` so the next boot works cleanly.",
        teachingNote: "Rebooting won't change anything — the fstab still has the wrong UUID. Reinstalling is extreme overkill for a config fix. The drive is fine — the error is about UUID lookup, not hardware. Always fix the config, rebuild initramfs, then reboot.",
      },
    ],
    rootCause: "UUID mismatch — /etc/fstab referenced the old NVMe drive's UUID; the replacement drive has a new UUID.",
    resolution: "Mount root manually from dracut shell, update /etc/fstab with the new UUID (from blkid), rebuild initramfs with `dracut -f`, reboot.",
    keyTakeaway: "Disk replacements change UUIDs. /etc/fstab entries using UUID= must be updated. Always read the error output — it tells you exactly what's missing.",
  },
  // ── Scenario 3: Kernel panic after update ──
  {
    id: "triage-003",
    title: "Kernel Panic After Scheduled Update",
    ticket: "TICKET-5287: compute-node-88 failed to come back online after a scheduled kernel update and reboot. BMC is reachable. Monitoring shows host unreachable for 8 minutes.",
    difficulty: "advanced",
    steps: [
      {
        prompt: "BMC is reachable and SEL is clean. What is your next step?",
        choices: [
          { label: "Activate SOL to see where the boot stopped", isCorrect: true },
          { label: "Power cycle the server", isCorrect: false },
          { label: "Check /var/log/messages", isCorrect: false },
          { label: "Run memtest from BMC", isCorrect: false },
        ],
        correctExplanation: "SEL clean means no hardware fault. You need to see the console output to determine how far the boot got. SOL (`ipmitool sol activate`) gives you remote eyes on the screen.",
        teachingNote: "Power cycling destroys evidence. /var/log/messages requires a running OS. memtest is for suspected memory issues — SEL would show memory errors first. Clean SEL + unreachable host = you need to see the console.",
      },
      {
        prompt: "SOL shows a kernel panic with a stack trace. The trace references `drivers/gpu/drm/...`. What do you do?",
        context: "Kernel panic - not syncing: Fatal exception\nCall Trace:\n  drivers/gpu/drm/amdgpu/amdgpu_device.c:3842\n  drivers/gpu/drm/amdgpu/amdgpu_init.c:412\n  kernel/module.c:3903\n---[ end trace ]---",
        choices: [
          { label: "Boot the previous kernel from GRUB — the new kernel has a GPU driver fault", isCorrect: true },
          { label: "Remove all GPUs and boot without them", isCorrect: false },
          { label: "Reinstall the kernel package", isCorrect: false },
          { label: "Flash new GPU firmware", isCorrect: false },
        ],
        correctExplanation: "The stack trace names the offending module (amdgpu). This is a driver compatibility issue with the new kernel. GRUB keeps the previous kernel — select it to recover the system, then investigate the driver incompatibility.",
        teachingNote: "The stack trace tells you exactly what failed — read it. Removing GPUs from a GPU training node defeats its purpose. Reinstalling won't help if the new kernel's driver is the problem. GPU firmware is unrelated to a kernel driver panic. Boot the old kernel first — recover, then investigate.",
      },
      {
        prompt: "You've booted the old kernel and the server is up. What do you do before closing the ticket?",
        choices: [
          { label: "Document the panic trace, verify services are running, flag the kernel version as incompatible for GPU nodes", isCorrect: true },
          { label: "Update to the new kernel again to see if it was a one-time issue", isCorrect: false },
          { label: "Close the ticket — the server is up", isCorrect: false },
          { label: "Rebuild initramfs for the new kernel", isCorrect: false },
        ],
        correctExplanation: "Capture evidence (the panic trace), confirm the server is fully operational (services, monitoring), and escalate/document the kernel incompatibility so fleet-wide updates skip this version for GPU nodes. Don't re-introduce the failure.",
        teachingNote: "Never retry the same failure without understanding it — you'll just create the same outage. Closing without documentation means the next person hits the same issue. Rebuilding initramfs won't fix a kernel driver bug.",
      },
    ],
    rootCause: "New kernel version has an incompatible GPU driver (amdgpu) that panics during device enumeration.",
    resolution: "Boot previous kernel via GRUB. Document the panic trace. Flag kernel version as incompatible for GPU-equipped nodes. Coordinate with kernel/driver team for a fix.",
    keyTakeaway: "Read the stack trace — it names the offending module. GRUB keeps previous kernels for exactly this reason. Always capture evidence before recovering, and document to prevent fleet-wide recurrence.",
  },
  // ── Scenario 4: systemd dependency cascade ──
  {
    id: "triage-004",
    title: "Network Service Cascade Failure",
    ticket: "TICKET-5441: inference-node-06 booted after a reboot but the GPU monitoring agent (dcgm-exporter) is not reporting metrics. The server is reachable via SSH. Other services appear to be running.",
    difficulty: "advanced",
    steps: [
      {
        prompt: "The server is reachable via SSH, so the boot completed. Where do you start?",
        choices: [
          { label: "systemctl status dcgm-exporter — check the failed service directly", isCorrect: true },
          { label: "Check BMC SEL for hardware errors", isCorrect: false },
          { label: "dmesg | grep gpu — look for driver errors", isCorrect: false },
          { label: "Reboot the server to retry", isCorrect: false },
        ],
        correctExplanation: "The server booted and is reachable — this is a service-layer issue, not hardware or kernel. Start with `systemctl status` on the specific failing service to get the error message and see its state.",
        teachingNote: "BMC SEL is for firmware-layer faults — the OS is running fine. dmesg is for kernel-level issues — if GPUs had a driver problem, more things would be broken. Never reboot as a first diagnostic step. Go straight to systemd for service failures.",
      },
      {
        prompt: "dcgm-exporter status shows 'inactive (dead)'. The journal says it depends on a mount that failed. What tool traces this?",
        context: "$ systemctl status dcgm-exporter\n  Loaded: loaded\n  Active: inactive (dead)\n  Condition: start condition failed at boot\n\n$ journalctl -u dcgm-exporter\n  Dependency failed for DCGM Exporter\n  dcgm-exporter.service depends on data-metrics.mount",
        choices: [
          { label: "systemctl list-dependencies dcgm-exporter — trace the dependency tree", isCorrect: true },
          { label: "systemctl restart dcgm-exporter — try starting it manually", isCorrect: false },
          { label: "Check /etc/dcgm-exporter.conf for misconfigurations", isCorrect: false },
          { label: "nvidia-smi — check if GPUs are detected", isCorrect: false },
        ],
        correctExplanation: "`systemctl list-dependencies` shows the full dependency tree. You already know the mount failed — now trace which mount, why it failed, and what else it's blocking. Fix the root cause (the mount), and the dependent service will come up.",
        teachingNote: "Restarting a service whose dependency failed will just fail again. The config is probably fine — the service never started because its precondition failed. The GPUs are likely fine — this is a mount dependency issue. Trace the dependency chain to the root cause.",
      },
      {
        prompt: "The dependency tree shows dcgm-exporter requires data-metrics.mount, which failed. You check and find a typo in /etc/fstab for that mount. After fixing fstab, what do you do?",
        choices: [
          { label: "systemctl daemon-reload, then mount the filesystem, then start dcgm-exporter", isCorrect: true },
          { label: "Reboot the server to apply the fstab change", isCorrect: false },
          { label: "Just start dcgm-exporter — it will mount automatically", isCorrect: false },
          { label: "Run dracut -f to rebuild initramfs", isCorrect: false },
        ],
        correctExplanation: "After editing fstab, `systemctl daemon-reload` regenerates mount units from the updated fstab. Then mount the filesystem manually (`systemctl start data-metrics.mount` or `mount -a`), then start the dependent service. No reboot needed.",
        teachingNote: "Rebooting works but is unnecessary downtime. dcgm-exporter won't auto-mount its dependencies. dracut -f is for initramfs issues — this is a systemd service-layer problem on an already-running system. daemon-reload + mount + start is the surgical fix.",
      },
    ],
    rootCause: "Typo in /etc/fstab for the /data/metrics mount point caused the mount unit to fail, which cascaded to dcgm-exporter via systemd's dependency graph.",
    resolution: "Fix the fstab entry, `systemctl daemon-reload`, mount the filesystem, start dcgm-exporter. Verify metrics are flowing to monitoring.",
    keyTakeaway: "systemd dependency cascades can make failures appear far from their root cause. Always trace the dependency tree back to the first failure. A bad fstab entry can break services that seem completely unrelated to storage.",
  },
  // ── Scenario 5: No power, no BMC ──
  {
    id: "triage-005",
    title: "Complete Power Loss — Dead Server",
    ticket: "TICKET-5590: gpu-cluster-node-31 completely unresponsive. No ping, no BMC, no LEDs. Adjacent servers in the same rack are online. Scheduled for GPU training workload in 45 minutes.",
    difficulty: "standard",
    steps: [
      {
        prompt: "No BMC, no LEDs, no fans. This is pre-firmware — no boot has occurred. What do you check first?",
        choices: [
          { label: "Physical inspection: PSU LEDs, power cord, PDU circuit", isCorrect: true },
          { label: "Try a different network cable for BMC", isCorrect: false },
          { label: "Check GRUB configuration from rescue media", isCorrect: false },
          { label: "Pull the SEL from the adjacent server for clues", isCorrect: false },
        ],
        correctExplanation: "No power at all means you're below the firmware layer. Check the physical power chain: is the power cord seated? Is the PDU circuit on? Do the PSU LEDs show standby power? Adjacent servers being online narrows it to this server's power path.",
        teachingNote: "BMC needs power too — if BMC is unreachable AND there are no LEDs, the server has no power. GRUB requires a booted system. The adjacent server's SEL won't tell you about this server's power. Start with the physical layer.",
      },
      {
        prompt: "You check and find the power cord is firmly seated. The PDU port shows 0W draw for this outlet. What next?",
        context: "Physical inspection:\n- Power cords: firmly seated, both PSUs\n- PSU LEDs: completely dark (no standby)\n- PDU readout: Port 14 — 0W (all other ports show 800-1200W)\n- Adjacent servers: all operational",
        choices: [
          { label: "Cycle the PDU outlet — the breaker may have tripped, or try a different PDU port", isCorrect: true },
          { label: "Replace both PSUs immediately", isCorrect: false },
          { label: "Swap the power cords with the adjacent server", isCorrect: false },
          { label: "Escalate to facilities — the rack needs new power", isCorrect: false },
        ],
        correctExplanation: "The PDU shows 0W on this specific outlet while others are fine. The circuit breaker for this outlet may have tripped, or the outlet itself may be faulty. Cycle the outlet or move to a different PDU port before replacing hardware.",
        teachingNote: "Replacing PSUs is premature — the PSUs may be fine, the outlet is providing no power. Swapping cords is misdirected — the cords are seated and the issue is at the PDU outlet. Facilities escalation is premature — try the simple PDU fix first. Work from the source of power forward.",
      },
    ],
    rootCause: "PDU outlet breaker tripped (or outlet failure), cutting all power to the server including BMC.",
    resolution: "Reset the PDU outlet breaker (or move to a different outlet). Verify server powers on and completes POST. Check SEL after boot for any power event artifacts.",
    keyTakeaway: "No power, no LEDs, no BMC = pre-firmware. Work the physical power chain from source (PDU) to server. The cheapest troubleshooting step is always checking the thing closest to the wall.",
  },
];
