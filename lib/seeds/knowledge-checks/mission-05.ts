import type { MCQuestion } from "@/lib/types/campaign";

// Mission 5: "File Operations"
// Covers: Section 4 (CPU/RAM/storage/PCIe hardware context)
//         Terminal practice (ls -la, cat, lsblk, df, find, mount)
//         Cards (touch, cp, rm, mkdir, tail, grep, du)

export const MISSION_05_QUESTIONS: MCQuestion[] = [
  {
    id: "m05-q01",
    question: "A server shows 125 GB of RAM 'used' out of 128 GB. Is the server in trouble?",
    choices: [
      { label: "A", text: "Yes — it's about to run out of memory and crash" },
      { label: "B", text: "No — Linux proactively uses free RAM for disk caching; check 'available' memory, not 'used'" },
      { label: "C", text: "It depends on how many CPUs the server has" },
      { label: "D", text: "Yes — anything over 80% usage requires a reboot" },
    ],
    correctAnswer: "B",
    explanation: "Linux intentionally fills RAM with disk cache to speed up file access. That cache is released instantly when a program needs memory. The 'available' column in `free -h` shows actual free memory.",
  },
  {
    id: "m05-q02",
    question: "A user reports the server is 'extremely slow.' You check and find high swap usage. What does this tell you?",
    choices: [
      { label: "A", text: "The disks are failing and need replacement" },
      { label: "B", text: "The network connection is saturated" },
      { label: "C", text: "The server has run out of physical RAM and is using much slower disk as overflow memory" },
      { label: "D", text: "The CPU is overheating and throttling" },
    ],
    correctAnswer: "C",
    explanation: "Swap is disk space used as emergency RAM overflow. Disk access is milliseconds; RAM is nanoseconds. Heavy swap usage means every memory access is ~1000x slower, causing massive performance degradation.",
  },
  {
    id: "m05-q03",
    question: "You need to find all files larger than 100 MB in `/var` that were modified in the last hour. Which command?",
    choices: [
      { label: "A", text: "`ls -la /var`" },
      { label: "B", text: "`du -sh /var/*`" },
      { label: "C", text: "`find /var -type f -size +100M -mmin -60`" },
      { label: "D", text: "`grep -r '100M' /var`" },
    ],
    correctAnswer: "C",
    explanation: "`find` is the right tool for searching by file attributes. `-size +100M` filters by size, `-mmin -60` filters by modification time (last 60 minutes). This is how you hunt the runaway log filling your disk.",
  },
  {
    id: "m05-q04",
    question: "What does `lsblk -f` show you that `df -hT` does not?",
    choices: [
      { label: "A", text: "Network-attached storage mounts" },
      { label: "B", text: "Unmounted partitions and their filesystem types — `df` only shows mounted filesystems" },
      { label: "C", text: "File permissions on each disk" },
      { label: "D", text: "Disk temperature and health status" },
    ],
    correctAnswer: "B",
    explanation: "`df` shows only mounted filesystems and their usage. `lsblk -f` shows ALL block devices including unmounted partitions, their filesystem type, and UUIDs. Essential for discovering available disks.",
  },
  {
    id: "m05-q05",
    question: "You run `cp important.conf important.conf.bak` before editing. Why is this a datacenter best practice?",
    choices: [
      { label: "A", text: "Linux requires a backup copy before allowing edits" },
      { label: "B", text: "It prevents other users from editing the file simultaneously" },
      { label: "C", text: "If your edit breaks the service, you can instantly restore the original with `cp important.conf.bak important.conf`" },
      { label: "D", text: "The `.bak` extension triggers automatic version control" },
    ],
    correctAnswer: "C",
    explanation: "Manual backup before editing is the simplest rollback strategy. If your change breaks something at 3 AM, you can restore the working config in seconds instead of trying to remember what you changed.",
  },
  {
    id: "m05-q06",
    question: "You run `grep -ri 'error' /var/log/`. What do the `-r` and `-i` flags do together?",
    choices: [
      { label: "A", text: "`-r` reverses the output, `-i` shows line numbers" },
      { label: "B", text: "`-r` searches recursively through all subdirectories, `-i` makes the search case-insensitive" },
      { label: "C", text: "`-r` reads from stdin, `-i` ignores binary files" },
      { label: "D", text: "`-r` shows recent matches only, `-i` inverts the match" },
    ],
    correctAnswer: "B",
    explanation: "`-r` (recursive) searches all files in all subdirectories. `-i` (insensitive) matches 'error', 'Error', 'ERROR', etc. Together they search every log file for any case variation of 'error'.",
  },
  {
    id: "m05-q07",
    question: "NVMe drives are faster than SATA SSDs. What physical bus makes this possible?",
    choices: [
      { label: "A", text: "USB 3.0" },
      { label: "B", text: "SCSI" },
      { label: "C", text: "PCIe — the same high-speed bus used by GPUs and network cards" },
      { label: "D", text: "Thunderbolt" },
    ],
    correctAnswer: "C",
    explanation: "NVMe drives connect via PCIe (Peripheral Component Interconnect Express), the same bus GPUs use. This gives them direct, low-latency access to the CPU — much faster than SATA's serial protocol.",
  },
  {
    id: "m05-q08",
    question: "SMART monitoring on a disk shows increasing 'Reallocated Sector Count.' What should you do?",
    choices: [
      { label: "A", text: "Ignore it — some reallocated sectors are normal" },
      { label: "B", text: "Reformat the disk to clear the bad sectors" },
      { label: "C", text: "Plan a disk replacement — increasing reallocated sectors indicate the disk is degrading and may fail soon" },
      { label: "D", text: "Increase the swap partition to compensate" },
    ],
    correctAnswer: "C",
    explanation: "Reallocated sectors mean the disk has found bad areas and moved data elsewhere. An increasing count means the disk is actively degrading. File an RMA and plan replacement before it fails completely.",
  },
];
