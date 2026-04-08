import type { MCQuestion } from "@/lib/types/campaign";

// Mission 4: "Users & Permissions"
// Covers: Section 6 (multi-user, owner/group/others, rwx, octal, chown, sudo, SUID)

export const MISSION_04_QUESTIONS: MCQuestion[] = [
  {
    id: "m04-q01",
    question: "A web server process runs as user `www-data`, not root. Why?",
    choices: [
      { label: "A", text: "Root is too slow for network operations" },
      { label: "B", text: "If the web server is compromised, the attacker only has `www-data` privileges — they can't modify system files or access other services" },
      { label: "C", text: "Only one process can run as root at a time" },
      { label: "D", text: "Network ports require a dedicated user account" },
    ],
    correctAnswer: "B",
    explanation: "Service isolation: each service runs as its own user with minimal permissions. A compromised web server can only damage what `www-data` can access — not the entire system.",
  },
  {
    id: "m04-q02",
    question: "A file has permissions `rwxr-x---`. Who can execute this file?",
    choices: [
      { label: "A", text: "Only the owner" },
      { label: "B", text: "The owner and members of the file's group" },
      { label: "C", text: "Everyone on the system" },
      { label: "D", text: "Nobody — execute requires write permission too" },
    ],
    correctAnswer: "B",
    explanation: "`rwxr-x---` breaks down: owner=rwx (full), group=r-x (read+execute), others=--- (none). Both the owner and group members can execute it. Others have no access at all.",
  },
  {
    id: "m04-q03",
    question: "Convert `rw-r--r--` to octal notation.",
    choices: [
      { label: "A", text: "755" },
      { label: "B", text: "664" },
      { label: "C", text: "644" },
      { label: "D", text: "744" },
    ],
    correctAnswer: "C",
    explanation: "r=4, w=2, x=1. Owner: rw- = 4+2+0 = 6. Group: r-- = 4+0+0 = 4. Others: r-- = 4+0+0 = 4. Result: 644.",
  },
  {
    id: "m04-q04",
    question: "You run `chmod 700 secrets.txt`. What can the group and others do with this file now?",
    choices: [
      { label: "A", text: "Read it but not write or execute" },
      { label: "B", text: "Nothing — 700 means only the owner has any access" },
      { label: "C", text: "Execute it but not read its contents" },
      { label: "D", text: "See it in directory listings but not open it" },
    ],
    correctAnswer: "B",
    explanation: "700 = owner:rwx, group:---, others:---. The group and others have zero permissions. They can't read, write, or execute the file.",
  },
  {
    id: "m04-q05",
    question: "You run `usermod -G docker ops` (without the `-a` flag). What happens to the `ops` user?",
    choices: [
      { label: "A", text: "Nothing changes — `-G` requires `-a` to work" },
      { label: "B", text: "`ops` is added to the `docker` group alongside their existing groups" },
      { label: "C", text: "`ops` is removed from ALL other groups and only belongs to `docker` now" },
      { label: "D", text: "The command fails because `-a` is mandatory" },
    ],
    correctAnswer: "C",
    explanation: "Without `-a` (append), `-G` REPLACES the user's group list. The user loses membership in every other group. Always use `usermod -aG` to add groups safely.",
  },
  {
    id: "m04-q06",
    question: "The `/usr/bin/passwd` command has the SUID bit set. What does this mean?",
    choices: [
      { label: "A", text: "It encrypts its output with the owner's key" },
      { label: "B", text: "It can only be run by root" },
      { label: "C", text: "When any user runs it, it executes with root's permissions — allowing normal users to change their own password in the root-owned password file" },
      { label: "D", text: "It logs all usage to a security audit file" },
    ],
    correctAnswer: "C",
    explanation: "SUID (Set User ID) makes a program run as the file's owner, not the person executing it. `passwd` is owned by root, so any user running it gets root-level access to modify `/etc/shadow`.",
  },
  {
    id: "m04-q07",
    question: "What does the `x` (execute) permission mean on a DIRECTORY?",
    choices: [
      { label: "A", text: "You can run the directory as a program" },
      { label: "B", text: "You can delete the directory" },
      { label: "C", text: "You can list the files inside it" },
      { label: "D", text: "You can `cd` into it and access files inside — without it, you're locked out even if you have read permission" },
    ],
    correctAnswer: "D",
    explanation: "On directories: r=list contents, w=create/delete files, x=enter (cd into) the directory. Without execute on a directory, you can't access anything inside it, even if the files themselves are readable.",
  },
  {
    id: "m04-q08",
    question: "Why does a datacenter team use `sudo` instead of logging in directly as root?",
    choices: [
      { label: "A", text: "sudo is faster than switching users" },
      { label: "B", text: "Root login is disabled in all Linux distributions" },
      { label: "C", text: "sudo creates an audit trail — every privileged command is logged with who ran it and when" },
      { label: "D", text: "Root can only run one command at a time" },
    ],
    correctAnswer: "C",
    explanation: "With sudo, every elevated command is logged: who ran it, when, what they ran. Direct root login has no accountability — if three people share the root password, you can't tell who did what.",
  },
  {
    id: "m04-q09",
    question: "You run `chown -R appuser:appgroup /opt/myapp/`. What does the `-R` flag do?",
    choices: [
      { label: "A", text: "Reverts ownership to the previous owner" },
      { label: "B", text: "Restricts the change to read-only files" },
      { label: "C", text: "Applies the ownership change recursively to all files and subdirectories inside `/opt/myapp/`" },
      { label: "D", text: "Requires root confirmation before proceeding" },
    ],
    correctAnswer: "C",
    explanation: "`-R` means recursive — the ownership change applies to the directory AND everything inside it (files, subdirectories, nested contents). Without it, only the top-level directory changes.",
  },
  {
    id: "m04-q10",
    question: "A script file has permissions 644 (`rw-r--r--`). You try to run it with `./script.sh` and get 'Permission denied.' Why?",
    choices: [
      { label: "A", text: "The file is corrupted" },
      { label: "B", text: "You need to run it with sudo" },
      { label: "C", text: "The script needs a shebang line (`#!/bin/bash`)" },
      { label: "D", text: "644 has no execute (`x`) bit — you need to `chmod +x script.sh` first" },
    ],
    correctAnswer: "D",
    explanation: "To run a file directly with `./`, the execute bit must be set. 644 = rw-r--r-- (no x anywhere). Run `chmod +x script.sh` or `chmod 755 script.sh` to make it executable.",
  },
];
