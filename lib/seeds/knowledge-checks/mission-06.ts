import type { MCQuestion } from "@/lib/types/campaign";

// Mission 6: "Process Management"
// Covers: Section 7 (program vs process, lifecycle, signals, daemons, systemd, zombie processes)

export const MISSION_06_QUESTIONS: MCQuestion[] = [
  {
    id: "m06-q01",
    question: "What is the difference between a program and a process?",
    choices: [
      { label: "A", text: "A program runs in kernel space; a process runs in user space" },
      { label: "B", text: "A program is a file on disk; a process is that program loaded into memory and executing" },
      { label: "C", text: "Programs are written in C; processes are written in any language" },
      { label: "D", text: "There is no difference — the terms are interchangeable" },
    ],
    correctAnswer: "B",
    explanation: "A program is static instructions stored on disk. A process is a running instance of that program in memory. The same program can have multiple processes running simultaneously.",
  },
  {
    id: "m06-q02",
    question: "A service keeps crashing. You want it to restart automatically. Which tool manages this?",
    choices: [
      { label: "A", text: "`cron` — it schedules the restart" },
      { label: "B", text: "`grep` — it monitors the logs for crash messages" },
      { label: "C", text: "`systemd` — the service manager that starts services, monitors them, and restarts them on failure" },
      { label: "D", text: "`top` — it detects the crash and triggers recovery" },
    ],
    correctAnswer: "C",
    explanation: "systemd is the service manager on modern Linux. It starts services at boot, monitors their health, and can automatically restart them when they crash — all configured in unit files.",
  },
  {
    id: "m06-q03",
    question: "You need to stop a stuck process. You send SIGTERM but it doesn't respond. What's your next step?",
    choices: [
      { label: "A", text: "Wait indefinitely — SIGTERM always works eventually" },
      { label: "B", text: "Send SIGKILL (kill -9) — the kernel forcibly terminates it with no chance for cleanup" },
      { label: "C", text: "Reboot the server" },
      { label: "D", text: "Send SIGTERM again — it needs to receive it twice" },
    ],
    correctAnswer: "B",
    explanation: "SIGTERM asks politely; a process can ignore it. SIGKILL is handled by the kernel directly — the process cannot catch, block, or ignore it. Always try SIGTERM first; SIGKILL is the last resort.",
  },
  {
    id: "m06-q04",
    question: "What does `systemctl enable nginx` do vs. `systemctl start nginx`?",
    choices: [
      { label: "A", text: "Both start nginx immediately; `enable` is just an alias" },
      { label: "B", text: "`start` downloads nginx; `enable` installs it" },
      { label: "C", text: "`enable` configures nginx to start automatically on boot; `start` runs it right now" },
      { label: "D", text: "`start` runs in foreground; `enable` runs in background" },
    ],
    correctAnswer: "C",
    explanation: "`start` and `enable` are independent. `start` = run now. `enable` = run on boot. You usually need both. `systemctl enable --now` does both in one command.",
  },
  {
    id: "m06-q05",
    question: "You see a process in state `Z` (zombie) in `ps aux`. Should you be worried?",
    choices: [
      { label: "A", text: "Yes — it's consuming CPU and must be killed immediately" },
      { label: "B", text: "Yes — zombie processes corrupt memory of other processes" },
      { label: "C", text: "A few zombies are harmless — they indicate the parent process hasn't collected the exit status yet" },
      { label: "D", text: "No — zombies don't exist in modern Linux" },
    ],
    correctAnswer: "C",
    explanation: "A zombie is a finished process whose parent hasn't collected its exit code. It uses no CPU or memory — just a process table entry. A few are harmless; hundreds indicate a buggy parent process.",
  },
  {
    id: "m06-q06",
    question: "A process exits with code 0. What does this mean?",
    choices: [
      { label: "A", text: "It crashed with zero errors logged" },
      { label: "B", text: "It timed out after 0 seconds" },
      { label: "C", text: "It was killed by the kernel" },
      { label: "D", text: "It completed successfully — non-zero exit codes indicate failure" },
    ],
    correctAnswer: "D",
    explanation: "Exit code 0 = success. Any non-zero value = failure. Scripts use `$?` to check the last command's exit code. This is how automation determines if each step succeeded.",
  },
  {
    id: "m06-q07",
    question: "You run a long data transfer with `rsync`. Halfway through, you accidentally close your SSH terminal. What happens to the rsync process?",
    choices: [
      { label: "A", text: "It keeps running — closing the terminal doesn't affect processes" },
      { label: "B", text: "It pauses until you reconnect" },
      { label: "C", text: "It receives SIGHUP and terminates — you should have used `nohup`, `tmux`, or `screen`" },
      { label: "D", text: "The server automatically backgrounds it" },
    ],
    correctAnswer: "C",
    explanation: "When a terminal closes, the shell sends SIGHUP (hangup) to its child processes, killing them. Use `nohup rsync ...`, `tmux`, or `screen` to keep processes running after disconnect.",
  },
  {
    id: "m06-q08",
    question: "What command shows you which process is listening on port 443?",
    choices: [
      { label: "A", text: "`ps aux | grep 443`" },
      { label: "B", text: "`ss -tlnp` — shows listening TCP sockets with the process name and PID for each port" },
      { label: "C", text: "`top -p 443`" },
      { label: "D", text: "`cat /proc/net/443`" },
    ],
    correctAnswer: "B",
    explanation: "`ss -tlnp` shows all listening TCP sockets (-t=TCP, -l=listening, -n=numeric ports, -p=show process). You'll see which PID and program owns each port.",
  },
  {
    id: "m06-q09",
    question: "An `sshd` daemon is described as a 'background process running continuously.' Why must it be always running?",
    choices: [
      { label: "A", text: "It caches SSH keys in memory for faster login" },
      { label: "B", text: "It must be listening for incoming SSH connections at all times — if it stops, no one can remotely access the server" },
      { label: "C", text: "It compresses network traffic in the background" },
      { label: "D", text: "It periodically checks for operating system updates" },
    ],
    correctAnswer: "B",
    explanation: "Daemons are background services that provide ongoing functionality. `sshd` listens on port 22 for incoming connections. If it crashes and systemd doesn't restart it, the server becomes remotely inaccessible.",
  },
];
