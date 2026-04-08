import type { MCQuestion } from "@/lib/types/campaign";

// Mission 2: "The Shell"
// Covers: Section 3 (terminal vs shell, command anatomy, PATH, scripts)
//         Terminal practice (help, pwd, ls, whoami, hostname)
//         Flashcards (pwd, cd, ls, touch, cp, rm, mkdir, tail, pipe, redirection)

export const MISSION_02_QUESTIONS: MCQuestion[] = [
  {
    id: "m02-q01",
    question: "You type `ls` and press Enter. The shell shows your files. Where did the shell find the `ls` program?",
    choices: [
      { label: "A", text: "It's built into the shell itself" },
      { label: "B", text: "The kernel executed it directly without the shell" },
      { label: "C", text: "The shell downloaded it from the package repository" },
      { label: "D", text: "The shell searched directories listed in the PATH variable until it found an executable named `ls`" },
    ],
    correctAnswer: "D",
    explanation: "The shell searches PATH directories in order (/usr/local/bin, /usr/bin, /bin, etc.) for a matching executable. If not found: 'command not found.'",
  },
  {
    id: "m02-q02",
    question: "What's the difference between a terminal and a shell?",
    choices: [
      { label: "A", text: "The terminal is the display window; the shell is the command interpreter running inside it" },
      { label: "B", text: "They're the same thing — different names for the command line" },
      { label: "C", text: "The terminal runs on the server; the shell runs on your laptop" },
      { label: "D", text: "The shell is graphical; the terminal is text-only" },
    ],
    correctAnswer: "A",
    explanation: "Terminal = container/display. Shell = interpreter (bash, zsh). You can run different shells inside the same terminal.",
  },
  {
    id: "m02-q03",
    question: "You run `grep \"error\" /var/log/syslog | tail -20`. What does the `|` (pipe) do?",
    choices: [
      { label: "A", text: "Writes the output of `grep` to a file called `tail`" },
      { label: "B", text: "Runs both commands simultaneously and merges their output" },
      { label: "C", text: "Sends the stdout of `grep` as the stdin of `tail`" },
      { label: "D", text: "Filters the output of `tail` through `grep`" },
    ],
    correctAnswer: "C",
    explanation: "Pipe sends the left command's output as input to the right command. grep finds all 'error' lines, then tail shows only the last 20.",
  },
  {
    id: "m02-q04",
    question: "What's the difference between `>` and `>>`?",
    choices: [
      { label: "A", text: "`>` creates a file, `>>` creates a directory" },
      { label: "B", text: "`>` writes to stdout, `>>` writes to stderr" },
      { label: "C", text: "`>` is for text files, `>>` is for binary files" },
      { label: "D", text: "`>` overwrites the file, `>>` appends to it" },
    ],
    correctAnswer: "D",
    explanation: "`>` replaces the file content entirely. `>>` adds to the end. Using `>` on an existing file destroys its previous contents.",
  },
  {
    id: "m02-q05",
    question: "You need to create `/opt/monitoring/logs/archive` but none of the parent directories exist. Which command works?",
    choices: [
      { label: "A", text: "`mkdir /opt/monitoring/logs/archive`" },
      { label: "B", text: "`mkdir -p /opt/monitoring/logs/archive`" },
      { label: "C", text: "`touch /opt/monitoring/logs/archive`" },
      { label: "D", text: "`cp -r /opt/monitoring/logs/archive`" },
    ],
    correctAnswer: "B",
    explanation: "`mkdir -p` creates the entire path including missing parents. Without `-p`, mkdir fails if the parent doesn't exist.",
  },
  {
    id: "m02-q06",
    question: "You want to watch a log file update in real time as events happen. Which command?",
    choices: [
      { label: "A", text: "`cat /var/log/syslog`" },
      { label: "B", text: "`head -f /var/log/syslog`" },
      { label: "C", text: "`grep -f /var/log/syslog`" },
      { label: "D", text: "`tail -f /var/log/syslog`" },
    ],
    correctAnswer: "D",
    explanation: "`tail -f` follows the file, displaying new lines as they're appended. Essential for live log monitoring during incidents.",
  },
  {
    id: "m02-q07",
    question: "In the command `ls -la /var/log`, identify the parts:",
    choices: [
      { label: "A", text: "`ls` = argument, `-la` = command, `/var/log` = option" },
      { label: "B", text: "`ls` = command, `-la` = options, `/var/log` = argument" },
      { label: "C", text: "`ls` = command, `-la` = argument, `/var/log` = flag" },
      { label: "D", text: "`ls -la` = command, `/var/log` = target" },
    ],
    correctAnswer: "B",
    explanation: "Standard anatomy: command first, then options (with dashes), then arguments (what to act on). `-la` combines `-l` (long) and `-a` (all).",
  },
  {
    id: "m02-q08",
    question: "You accidentally run `rm -rf /important/data`. What happens?",
    choices: [
      { label: "A", text: "Everything under `/important/data` is permanently deleted with no undo" },
      { label: "B", text: "The system asks for confirmation before deleting" },
      { label: "C", text: "The files are moved to a trash folder for 30 days" },
      { label: "D", text: "The command fails because `-rf` is not a valid flag combination" },
    ],
    correctAnswer: "A",
    explanation: "`rm -rf` means recursive + force. No confirmation, no trash, no recovery. Always verify paths before running destructive commands.",
  },
  {
    id: "m02-q09",
    question: "You type `hostname` on a server and see `gpu-rack12-node07`. Why should you run this before a maintenance procedure?",
    choices: [
      { label: "A", text: "To verify the server is online" },
      { label: "B", text: "To check if the hostname DNS is configured correctly" },
      { label: "C", text: "To confirm you're on the correct server before running destructive commands" },
      { label: "D", text: "To see if the server has been rebooted recently" },
    ],
    correctAnswer: "C",
    explanation: "Wrong-server operations are a common and serious incident cause. Always verify hostname before maintenance. It takes 2 seconds and prevents disasters.",
  },
  {
    id: "m02-q10",
    question: "You need to check disk usage, verify services, and review logs on 200 servers every morning. What approach scales?",
    choices: [
      { label: "A", text: "SSH into each server individually and run the commands" },
      { label: "B", text: "Set up a GUI monitoring dashboard on each server" },
      { label: "C", text: "Ask each server's assigned technician to check manually" },
      { label: "D", text: "Write a shell script with the commands and execute it against all servers" },
    ],
    correctAnswer: "D",
    explanation: "Scripts are the bridge from operator to automator. One script, 200 servers, one command. This is why the CLI exists.",
  },
];
