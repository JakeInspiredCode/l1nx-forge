// ═══════════════════════════════════════
// L0 — Boot Process Mental Model (3 Layers × 2 Steps)
// ═══════════════════════════════════════

export interface BootLayer {
  id: string;
  name: string;
  subtitle: string;
  failureHint: string;
  color: string;
  accentHex: string;
  steps: BootLayerStep[];
}

export interface BootLayerStep {
  number: number;
  name: string;
  question: string;
  answer: string;
  detail: string;
}

export const BOOT_LAYERS: BootLayer[] = [
  {
    id: "hardware",
    name: "Hardware",
    subtitle: "Is the machine alive?",
    failureHint: "If it fails here, something physical is broken.",
    color: "orange",
    accentHex: "#f97316",
    steps: [
      {
        number: 1,
        name: "Firmware / POST",
        question: "Does the hardware work?",
        answer: "CPU, RAM, and PCIe devices all passed their self-check.",
        detail: "Power hits the server. The CPU is physically wired to start reading instructions from a specific chip on the motherboard — a flash memory chip that holds the firmware. Firmware is software, but it lives on a chip instead of a hard drive, which is why it can run before anything else exists. This firmware runs POST (Power-On Self-Test): it checks that the CPU works, memory responds, and all devices on the PCIe bus (GPUs, NICs, storage controllers) are present. If something physical is broken, the server stops here. If everything passes, firmware does one final job: it looks up a boot entry list stored in NVRAM that says 'go to this disk, this partition, this file' — and that file is the bootloader. Firmware loads it and hands off control.",
      },
      {
        number: 2,
        name: "Bootloader / GRUB",
        question: "Where is the OS?",
        answer: "Kernel found on disk and loaded into memory.",
        detail: "Firmware's boot entry pointed to GRUB — a bootloader sitting on a small disk partition called the ESP. GRUB is now in control. It reads its own config file to figure out what to load, and presents a menu if needed (useful for picking an older kernel when the latest one is broken). GRUB then loads two things into RAM as raw data: the kernel image (vmlinuz) and a temporary driver toolkit (initramfs). Neither one is running yet — they're just data sitting in memory. GRUB transfers execution to the kernel, and GRUB is done. It never runs again unless the server reboots.",
      },
    ],
  },
  {
    id: "loading",
    name: "Loading",
    subtitle: "Can software talk to hardware?",
    failureHint: "If it fails here, a driver is missing or a disk ID changed.",
    color: "amber",
    accentHex: "#f59e0b",
    steps: [
      {
        number: 3,
        name: "Kernel",
        question: "What hardware is available?",
        answer: "All devices detected and registered.",
        detail: "GRUB just transferred execution to the kernel. The kernel decompresses itself (vmlinuz is compressed) and takes over. It initializes its core systems — CPU scheduler, memory manager — then scans every device on the PCIe bus: GPUs, NICs, storage controllers. It builds a complete map of the hardware. But here's the problem: the kernel found the storage controller, but it doesn't have the driver needed to actually read the disk. That driver is a loadable module — and the module is stored on the very disk it can't read yet. Chicken and egg. That's where initramfs comes in — and it's already sitting in RAM, because GRUB loaded it alongside the kernel.",
      },
      {
        number: 4,
        name: "initramfs",
        question: "Can I reach the real disk?",
        answer: "Storage drivers loaded, real root filesystem mounted.",
        detail: "The kernel unpacks the initramfs archive that GRUB placed in RAM into a tiny temporary filesystem. This filesystem carries the storage drivers the kernel was missing — NVMe, RAID, LVM, filesystem modules. initramfs loads those drivers, and now the kernel can finally talk to the physical disk. initramfs mounts the real root filesystem (the one with /etc, /var, all the server's actual software). Then it calls switch_root: this deletes the entire temporary filesystem from RAM, pivots the real disk to become the root, and executes /sbin/init from that disk. initramfs is gone. And /sbin/init? That's systemd.",
      },
    ],
  },
  {
    id: "running",
    name: "Running",
    subtitle: "Is everything working?",
    failureHint: "If it fails here, a service or config is wrong.",
    color: "emerald",
    accentHex: "#22c55e",
    steps: [
      {
        number: 5,
        name: "systemd",
        question: "Are all services running?",
        answer: "All services started in parallel based on dependencies.",
        detail: "The kernel just executed /sbin/init from the real disk — and that file is systemd. It becomes PID 1, the first real process. systemd reads unit files that describe every service the server needs: networking, SSH, monitoring, applications. It builds a dependency graph and starts everything that has no blockers immediately, in parallel. Things that depend on other things wait only for their specific prerequisites. This is why Linux boots fast. But it's also why failures cascade: if a filesystem mount fails, everything that depends on that mount gets stuck — even services that seem completely unrelated to storage.",
      },
      {
        number: 6,
        name: "System ready",
        question: "Can users connect?",
        answer: "SSH open, monitoring live, server is operational.",
        detail: "systemd's dependency graph has fully resolved. Every service that needed to start has started. SSH is listening for connections. Monitoring agents have phoned home. The server is doing real work. If it made it all the way here but one specific thing isn't working — SSH is refused, or a monitoring agent isn't reporting — the problem is narrow. Hardware is fine, the OS is fine, the boot completed. A specific service failed or is misconfigured. That's a targeted fix, not a deep investigation.",
      },
    ],
  },
];

// ── L0 Recall Quiz ──

export interface L0RecallQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  distractors: string[];
}

export const L0_RECALL_QUIZ: L0RecallQuestion[] = [
  {
    id: "l0-q1",
    question: "What are the three layers of the boot process, in order?",
    correctAnswer: "Hardware, Loading, Running",
    distractors: [
      "Firmware, Kernel, Services",
      "POST, initramfs, systemd",
      "BIOS, GRUB, Login",
    ],
  },
  {
    id: "l0-q2",
    question: "A server fails during POST. Is this most likely a hardware, driver, or configuration problem?",
    correctAnswer: "Hardware — something physical is broken",
    distractors: [
      "Driver — a kernel module is missing",
      "Configuration — a service file has a typo",
      "Could be any of the three equally",
    ],
  },
  {
    id: "l0-q3",
    question: "What does initramfs do, and what happens to it afterward?",
    correctAnswer: "Loads storage drivers to access the real disk, then deletes itself from memory",
    distractors: [
      "Starts all services in parallel, then becomes PID 1",
      "Checks hardware health, then hands off to the bootloader",
      "Mounts the boot partition and stays resident for recovery",
    ],
  },
  {
    id: "l0-q4",
    question: "A server booted to the login prompt but SSH connections are refused. Which layer has the problem?",
    correctAnswer: "Running — a service (sshd) failed or is misconfigured",
    distractors: [
      "Hardware — the network card is faulty",
      "Loading — the kernel can't detect the NIC",
      "Loading — initramfs didn't load network drivers",
    ],
  },
  {
    id: "l0-q5",
    question: "Why can a failed filesystem mount cause a monitoring agent to stop working?",
    correctAnswer: "systemd's dependency graph — the agent depends on that mount, even indirectly",
    distractors: [
      "The kernel panics when any mount fails",
      "initramfs deletes the monitoring config when it self-destructs",
      "GRUB disables non-essential services on mount errors",
    ],
  },
];
