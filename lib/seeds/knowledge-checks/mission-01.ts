import type { MCQuestion } from "@/lib/types/campaign";

// Mission 1: "What is Linux?"
// Covers: Section 1 (OS, kernel, system calls, process isolation)
//         Section 2 (Linux kernel vs distro, servers, packages, distributions)

export const MISSION_01_QUESTIONS: MCQuestion[] = [
  {
    id: "m01-q01",
    question: "A program needs to read a config file from disk. What actually happens?",
    choices: [
      { label: "A", text: "The program reads the disk directly using its own driver" },
      { label: "B", text: "The shell reads the file and passes it to the program" },
      { label: "C", text: "The OS copies the entire disk into memory first" },
      { label: "D", text: "The program makes a system call, and the kernel handles the disk I/O" },
    ],
    correctAnswer: "D",
    explanation: "Programs can't access hardware directly. They request the kernel via system calls. The kernel checks permissions, locates the data, and returns it.",
  },
  {
    id: "m01-q02",
    question: "A Java process crashes with a segfault. Every other service on the server keeps running normally. What made this possible?",
    choices: [
      { label: "A", text: "Java has built-in crash protection" },
      { label: "B", text: "The kernel isolates each process in its own virtual memory space" },
      { label: "C", text: "The crashed process was running as a low-priority user" },
      { label: "D", text: "The server has ECC memory that corrected the error" },
    ],
    correctAnswer: "B",
    explanation: "Process isolation via virtual memory means each process gets its own memory space. A crash in one process cannot corrupt another's memory.",
  },
  {
    id: "m01-q03",
    question: "\"Linux\" technically refers to:",
    choices: [
      { label: "A", text: "The full operating system including GUI and tools" },
      { label: "B", text: "Any open-source operating system" },
      { label: "C", text: "Only the kernel — the core that manages hardware and processes" },
      { label: "D", text: "The command-line shell (bash)" },
    ],
    correctAnswer: "C",
    explanation: "Linux is the kernel. A \"distribution\" bundles the kernel with a package manager, tools, and default configurations.",
  },
  {
    id: "m01-q04",
    question: "You manage 5,000 servers. Why is the command-line interface critical at this scale?",
    choices: [
      { label: "A", text: "GUIs are too slow to render on server hardware" },
      { label: "B", text: "CLIs use less RAM so more is available for workloads" },
      { label: "C", text: "Servers don't have network connections for GUI protocols" },
      { label: "D", text: "Text commands can be scripted and run against all servers simultaneously" },
    ],
    correctAnswer: "D",
    explanation: "Automation via scripting is the fundamental advantage of CLI at scale. One script, thousands of servers, one command.",
  },
  {
    id: "m01-q05",
    question: "Ubuntu uses `apt`. Rocky Linux uses `dnf`. Both can install the same nginx web server. What does this tell you?",
    choices: [
      { label: "A", text: "They use different kernels optimized for different software" },
      { label: "B", text: "nginx has separate versions compiled for each distribution" },
      { label: "C", text: "You must choose your distribution based on what software you need" },
      { label: "D", text: "They package software differently, but the underlying programs are the same" },
    ],
    correctAnswer: "D",
    explanation: "Distributions differ in packaging, defaults, and tooling — not in the software itself. Learn one, and the other is a short translation.",
  },
  {
    id: "m01-q06",
    question: "A datacenter team mirrors package repositories locally instead of letting 5,000 machines download from the internet. What are they optimizing for?",
    choices: [
      { label: "A", text: "Bandwidth and control — fast LAN downloads and the ability to test updates before deploying" },
      { label: "B", text: "Security only — preventing malware from external repos" },
      { label: "C", text: "Cost — internet bandwidth is billed per gigabyte" },
      { label: "D", text: "Speed — the local server has faster disks than the internet repo" },
    ],
    correctAnswer: "A",
    explanation: "Local mirrors prevent internet link saturation (5,000 simultaneous downloads) and let the team test updates on staging before pushing to production.",
  },
  {
    id: "m01-q07",
    question: "You install a package and the package manager also installs three other packages you didn't request. Why?",
    choices: [
      { label: "A", text: "They're recommended but optional extras" },
      { label: "B", text: "The package manager bundles popular packages together" },
      { label: "C", text: "They're dependencies — shared libraries the program needs to run" },
      { label: "D", text: "They're security patches that should be applied at the same time" },
    ],
    correctAnswer: "C",
    explanation: "Dependency resolution is the package manager's critical capability. Most programs rely on shared libraries that must be present.",
  },
  {
    id: "m01-q08",
    question: "What runs in kernel space vs. user space?",
    choices: [
      { label: "A", text: "Kernel space: all system services. User space: only user-started programs." },
      { label: "B", text: "Kernel space: everything that starts at boot. User space: everything started after login." },
      { label: "C", text: "Kernel space: hardware. User space: software." },
      { label: "D", text: "Kernel space: device drivers and memory management. User space: your web server, terminal, file manager." },
    ],
    correctAnswer: "D",
    explanation: "Kernel space has full hardware access (drivers, memory management, scheduling). User space programs must request kernel services via system calls.",
  },
  {
    id: "m01-q09",
    question: "Rocky Linux and Ubuntu are both Linux distributions. Which statement is FALSE?",
    choices: [
      { label: "A", text: "They share the same Linux kernel" },
      { label: "B", text: "They require different versions of application source code" },
      { label: "C", text: "They use different package managers (dnf vs apt)" },
      { label: "D", text: "They have different default filesystems (XFS vs ext4)" },
    ],
    correctAnswer: "B",
    explanation: "Source code is the same across distributions. They differ in packaging, defaults, and tooling — not the underlying software.",
  },
  {
    id: "m01-q10",
    question: "A server is running but you can't access it remotely. A tech plugs in a monitor and sees a login prompt — no graphical desktop. Why?",
    choices: [
      { label: "A", text: "The GUI crashed and needs to be restarted" },
      { label: "B", text: "Remote access disables the GUI to save bandwidth" },
      { label: "C", text: "The server was never configured with a graphical interface — servers use CLI only" },
      { label: "D", text: "The monitor doesn't support the server's resolution" },
    ],
    correctAnswer: "C",
    explanation: "Production servers almost never have GUIs installed. They're accessed remotely via CLI, and locally via console when remote access fails.",
  },
];
