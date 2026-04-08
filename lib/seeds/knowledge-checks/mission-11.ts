import type { MCQuestion } from "@/lib/types/campaign";

// Mission 11: "Troubleshooting I"
// Covers: Diagnosis scenarios (Disk Full, High CPU), diagnostic commands (dmesg, free, iostat, ps, ss)

export const MISSION_11_QUESTIONS: MCQuestion[] = [
  {
    id: "m11-q01",
    question: "Services are crashing with 'No space left on device.' You run `df -hT` and see root at 99%. What's your first diagnostic step?",
    choices: [
      { label: "A", text: "Reboot the server to clear temporary files" },
      { label: "B", text: "Run `du -sh /var/log/*` to find which log files are consuming the most space" },
      { label: "C", text: "Add more disk space with `fdisk`" },
      { label: "D", text: "Delete `/tmp` to free space" },
    ],
    correctAnswer: "B",
    explanation: "Identify before you act. `/var/log` is the most common culprit. `du -sh` shows per-directory sizes. Then target the specific large files — don't blindly delete or reboot.",
  },
  {
    id: "m11-q02",
    question: "You find a 45 GB file: `/var/log/app/debug.log`. The application is still writing to it. What's the safest way to reclaim space?",
    choices: [
      { label: "A", text: "`rm /var/log/app/debug.log` — delete it immediately" },
      { label: "B", text: "`truncate -s 0 /var/log/app/debug.log` — empties the file without deleting it, so the app keeps writing without error" },
      { label: "C", text: "Stop the application, delete the log, restart the application" },
      { label: "D", text: "Move it to another disk with `mv`" },
    ],
    correctAnswer: "B",
    explanation: "If you `rm` a file that a process has open, the space isn't freed until the process closes its file handle. `truncate` empties the file while keeping the file handle valid — instant space recovery.",
  },
  {
    id: "m11-q03",
    question: "`top` shows one process at 98% CPU and system idle at 1.3%. What's happening?",
    choices: [
      { label: "A", text: "The server has a virus" },
      { label: "B", text: "A single process is consuming nearly all CPU capacity — other processes are starved for CPU time" },
      { label: "C", text: "The CPU is failing and needs replacement" },
      { label: "D", text: "98% is normal for a busy server" },
    ],
    correctAnswer: "B",
    explanation: "One process at 98% with only 1.3% idle means the CPU is saturated. Other processes queue up waiting for CPU time, causing system-wide sluggishness. Identify the process and investigate.",
  },
  {
    id: "m11-q04",
    question: "You see high CPU `wa` (wait) time at 34% in `top`. What does this indicate?",
    choices: [
      { label: "A", text: "The CPU is overheating and throttling" },
      { label: "B", text: "34% of CPU time is wasted on failed calculations" },
      { label: "C", text: "The CPU is idle 34% of the time, waiting on slow I/O (disk or network) — the bottleneck is not the CPU itself" },
      { label: "D", text: "34% of processes are in a wait queue" },
    ],
    correctAnswer: "C",
    explanation: "`wa` (I/O wait) means the CPU has nothing to do while waiting for disk or network I/O. High wa% points to a storage bottleneck (slow disk, heavy swap) or network issue — not a CPU problem.",
  },
  {
    id: "m11-q05",
    question: "You suspect a memory issue. `free -h` shows 187 MB free, 7.6 GB swap used. What's the diagnosis?",
    choices: [
      { label: "A", text: "Normal — swap is supposed to be used" },
      { label: "B", text: "Physical RAM is exhausted and the system is heavily swapping to disk — this is the root cause of slow performance" },
      { label: "C", text: "The swap partition is too small and needs to be expanded" },
      { label: "D", text: "187 MB free is enough for a healthy server" },
    ],
    correctAnswer: "B",
    explanation: "7.6 GB of active swap means the system ran out of RAM and is using disk as overflow. Every memory access hitting swap is ~1000x slower than RAM. Find and fix the memory-hungry process.",
  },
  {
    id: "m11-q06",
    question: "What's the difference between using `dmesg` vs `journalctl` for troubleshooting?",
    choices: [
      { label: "A", text: "They show the same data — use either one" },
      { label: "B", text: "`dmesg` shows kernel-level hardware messages; `journalctl` shows service-level logs from systemd — use both for different layers" },
      { label: "C", text: "`dmesg` is real-time only; `journalctl` shows historical data" },
      { label: "D", text: "`journalctl` replaces `dmesg` on modern systems" },
    ],
    correctAnswer: "B",
    explanation: "`dmesg` = kernel ring buffer (hardware faults, driver messages, boot issues). `journalctl` = systemd journal (service start/stop, application errors, authentication events). Different layers, different tools.",
  },
  {
    id: "m11-q07",
    question: "A disk shows 55% usage with plenty of space, but the system still throws 'No space left on device.' What else could be exhausted?",
    choices: [
      { label: "A", text: "CPU cycles" },
      { label: "B", text: "Network bandwidth" },
      { label: "C", text: "Inodes — the filesystem ran out of file entries even though disk space remains" },
      { label: "D", text: "RAM — disk errors spill into memory" },
    ],
    correctAnswer: "C",
    explanation: "Each file consumes an inode (index entry). A filesystem can run out of inodes before running out of space — common when millions of tiny files exist. Check with `df -i`.",
  },
  {
    id: "m11-q08",
    question: "You're troubleshooting and need to work through the problem systematically. What's the correct approach?",
    choices: [
      { label: "A", text: "Try fixes until something works" },
      { label: "B", text: "Reboot first, then investigate if the problem recurs" },
      { label: "C", text: "Check the four layers in order — hardware, OS, network, service — gathering evidence at each level before making changes" },
      { label: "D", text: "Ask a senior engineer to handle it" },
    ],
    correctAnswer: "C",
    explanation: "Systematic troubleshooting: check hardware (CPU, RAM, disk, NIC), then OS (kernel, filesystem, permissions), then network (connectivity, DNS, firewall), then service (daemon status, config, logs). Evidence first, changes second.",
  },
];
