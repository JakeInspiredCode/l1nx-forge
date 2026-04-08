import type { MCQuestion } from "@/lib/types/campaign";

// Mission 10: "The Boot Process"
// Covers: Boot Process Explorer (firmware → bootloader → kernel → initramfs → systemd → ready)

export const MISSION_10_QUESTIONS: MCQuestion[] = [
  {
    id: "m10-q01",
    question: "What is the correct order of the Linux boot sequence?",
    choices: [
      { label: "A", text: "Kernel → Firmware → GRUB → systemd → initramfs → Login" },
      { label: "B", text: "Firmware (UEFI/BIOS) → Bootloader (GRUB) → Kernel → initramfs → systemd → System Ready" },
      { label: "C", text: "GRUB → Firmware → initramfs → Kernel → Login → systemd" },
      { label: "D", text: "systemd → Kernel → GRUB → Firmware → initramfs → Login" },
    ],
    correctAnswer: "B",
    explanation: "The boot chain: firmware initializes hardware and finds the bootloader. GRUB loads the kernel and initramfs. The kernel initializes, initramfs loads storage drivers, then systemd starts all services.",
  },
  {
    id: "m10-q02",
    question: "A server passes POST but never reaches the GRUB menu. Where is the boot failing?",
    choices: [
      { label: "A", text: "The kernel is panicking" },
      { label: "B", text: "systemd can't find the root filesystem" },
      { label: "C", text: "The firmware can't locate or load the bootloader — check boot order settings and the boot disk" },
      { label: "D", text: "initramfs is corrupted" },
    ],
    correctAnswer: "C",
    explanation: "POST passes = firmware is working. No GRUB = firmware can't find the bootloader on any disk. Check UEFI boot entries, verify the boot disk is detected, and ensure the EFI system partition is intact.",
  },
  {
    id: "m10-q03",
    question: "What is the role of initramfs in the boot process?",
    choices: [
      { label: "A", text: "It runs the POST hardware check" },
      { label: "B", text: "It provides the GRUB menu interface" },
      { label: "C", text: "A temporary root filesystem loaded into RAM that contains drivers needed to mount the real root filesystem" },
      { label: "D", text: "It starts the SSH daemon for remote access" },
    ],
    correctAnswer: "C",
    explanation: "The kernel can't mount the real root disk if it needs a special driver (RAID, LVM, NVMe). initramfs is a minimal filesystem in RAM that contains these drivers. Once the real root is mounted, initramfs hands off.",
  },
  {
    id: "m10-q04",
    question: "systemd is 'PID 1' — the first user-space process. Why is this significant?",
    choices: [
      { label: "A", text: "PID 1 runs faster than other processes" },
      { label: "B", text: "If PID 1 crashes, the entire system crashes — it's the parent of all other processes and manages their lifecycle" },
      { label: "C", text: "PID 1 has exclusive access to the network" },
      { label: "D", text: "It's just a convention with no technical significance" },
    ],
    correctAnswer: "B",
    explanation: "PID 1 (systemd) is the root of the process tree. It starts services, manages dependencies, and adopts orphaned processes. If PID 1 dies, the kernel panics — there's nothing left to manage the system.",
  },
  {
    id: "m10-q05",
    question: "You see 'Kernel panic - not syncing' on the console during boot. At which stage did the failure occur?",
    choices: [
      { label: "A", text: "Firmware — before the kernel loaded" },
      { label: "B", text: "Bootloader — GRUB failed to decompress the kernel" },
      { label: "C", text: "Kernel initialization — the kernel loaded but encountered a fatal error (bad driver, missing root filesystem, hardware fault)" },
      { label: "D", text: "systemd — a critical service failed to start" },
    ],
    correctAnswer: "C",
    explanation: "A kernel panic means the kernel loaded and started executing but hit an unrecoverable error. Common causes: corrupt initramfs, failed storage driver, bad kernel parameter, or hardware memory errors.",
  },
  {
    id: "m10-q06",
    question: "A server boots to a shell prompt that says '(initramfs)' and stops. What does this mean?",
    choices: [
      { label: "A", text: "The server booted successfully in maintenance mode" },
      { label: "B", text: "initramfs couldn't mount the real root filesystem — likely a missing driver, wrong root= parameter, or failed disk" },
      { label: "C", text: "The server is waiting for a network connection before continuing" },
      { label: "D", text: "GRUB needs to be reinstalled" },
    ],
    correctAnswer: "B",
    explanation: "Dropping to an initramfs shell means the handoff from temporary to real root filesystem failed. Check: Is the disk detected? Is the filesystem intact? Is the root= kernel parameter pointing to the right device?",
  },
  {
    id: "m10-q07",
    question: "What kernel tool shows boot-time hardware messages, including driver loading and device detection?",
    choices: [
      { label: "A", text: "`systemctl log`" },
      { label: "B", text: "`cat /var/log/boot`" },
      { label: "C", text: "`dmesg` — the kernel ring buffer containing hardware messages from boot through current" },
      { label: "D", text: "`top -b`" },
    ],
    correctAnswer: "C",
    explanation: "`dmesg` reads the kernel ring buffer — a running log of hardware events. At boot, it shows device detection, driver loading, and any hardware errors. Use `dmesg -T` for human-readable timestamps.",
  },
  {
    id: "m10-q08",
    question: "systemd starts services using a dependency graph, not a fixed sequence. Why is this better?",
    choices: [
      { label: "A", text: "It starts independent services in parallel, significantly reducing boot time" },
      { label: "B", text: "It uses less memory than sequential startup" },
      { label: "C", text: "It's easier to write configuration files" },
      { label: "D", text: "It prevents services from conflicting with each other" },
    ],
    correctAnswer: "A",
    explanation: "A dependency graph lets systemd start services that don't depend on each other simultaneously. A sequential boot waits for each service to finish before starting the next — much slower on servers with dozens of services.",
  },
];
