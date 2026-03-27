import { ForgeCard, TopicId, CardType, Difficulty, Tier } from "../types";

const today = new Date().toISOString().split("T")[0];

function card(
  id: string, topicId: TopicId, type: CardType, tier: Tier, difficulty: Difficulty,
  front: string, back: string, steps?: string[]
): ForgeCard {
  return {
    id, topicId, type, front, back, difficulty, tier, steps,
    easeFactor: 2.5, interval: 0, repetitions: 0, dueDate: today, lastReview: null,
  };
}

// ═══════════════════════════════════════
// LINUX — 50 Easy, 25 Intermediate, 22 Scenario, 3 Branching
// ═══════════════════════════════════════

const linux: ForgeCard[] = [
  // ── Tier 1: Foundations (Easy) ──
  card("linux-001", "linux", "easy", 1, 1, "What command shows currently running processes with CPU and memory usage?", "`top` or `htop`. `top` is installed by default on most systems. `htop` provides a more user-friendly, color-coded interactive display."),
  card("linux-002", "linux", "easy", 1, 1, "How do you check disk usage on a Linux system?", "`df -h` shows filesystem disk usage in human-readable format. `du -sh /path` shows the size of a specific directory."),
  card("linux-003", "linux", "easy", 1, 1, "What is the purpose of `systemctl`?", "`systemctl` controls the systemd service manager. Used to start/stop/restart/enable/disable services, check status, and manage system state (reboot, poweroff)."),
  card("linux-004", "linux", "easy", 1, 1, "How do you view the last 100 lines of a log file in real-time?", "`tail -n 100 -f /var/log/syslog` — the `-f` flag follows the file as new lines are appended. Essential for live troubleshooting."),
  card("linux-005", "linux", "easy", 1, 1, "What does `chmod 755 script.sh` do?", "Sets permissions: owner can read/write/execute (7), group can read/execute (5), others can read/execute (5). Binary: rwxr-xr-x."),
  card("linux-006", "linux", "easy", 1, 1, "How do you find all files modified in the last 24 hours under /var/log?", "`find /var/log -mtime -1 -type f` — `-mtime -1` means modified less than 1 day ago, `-type f` limits to files."),
  card("linux-007", "linux", "easy", 1, 1, "What is the difference between `kill` and `kill -9`?", "`kill` sends SIGTERM (15) — asks the process to terminate gracefully. `kill -9` sends SIGKILL — forces immediate termination. Always try SIGTERM first."),
  card("linux-008", "linux", "easy", 1, 1, "How do you check which ports are listening on a Linux server?", "`ss -tlnp` or `netstat -tlnp`. Shows TCP listening ports with process names. `-t` = TCP, `-l` = listening, `-n` = numeric, `-p` = process."),
  card("linux-009", "linux", "easy", 1, 1, "What is an inode in Linux?", "A data structure storing file metadata (permissions, owner, timestamps, data block pointers). Every file has an inode. `ls -i` shows inode numbers. Running out of inodes can prevent file creation even with free disk space."),
  card("linux-010", "linux", "easy", 1, 1, "How do you check system memory usage?", "`free -h` shows total, used, free, shared, buff/cache, and available memory in human-readable format. `available` is the most useful metric — it includes reclaimable cache."),
  card("linux-011", "linux", "easy", 1, 1, "What does `journalctl -u nginx --since '1 hour ago'` do?", "Queries the systemd journal for logs from the nginx service within the last hour. `journalctl` is the primary log viewer for systemd-based systems."),
  card("linux-012", "linux", "easy", 1, 1, "What is a symbolic link vs a hard link?", "**Symlink**: Points to a pathname (like a shortcut). Can cross filesystems, breaks if target is deleted. `ln -s target link`\n**Hard link**: Points to the same inode. Same filesystem only, persists if original name is deleted. `ln target link`"),
  card("linux-013", "linux", "easy", 1, 1, "How do you check the kernel version?", "`uname -r` shows kernel release. `uname -a` shows all system info (kernel, hostname, architecture). Also: `cat /proc/version`."),
  card("linux-014", "linux", "easy", 1, 1, "What does `/etc/fstab` control?", "Filesystem mount table — defines how disk partitions and storage devices are mounted at boot. Each line specifies: device, mount point, filesystem type, options, dump, pass."),
  card("linux-015", "linux", "easy", 1, 1, "How do you search for a string across all files in a directory?", "`grep -r 'pattern' /path/to/dir` — recursive search. Add `-l` to show only filenames, `-i` for case-insensitive, `-n` for line numbers."),
  card("linux-016", "linux", "easy", 1, 1, "What is the purpose of `cron` and how do you edit cron jobs?", "`cron` is the time-based job scheduler. `crontab -e` edits the current user's cron table. Format: `min hour day month weekday command`. `crontab -l` lists jobs."),
  card("linux-017", "linux", "easy", 1, 1, "How do you check which user you are logged in as?", "`whoami` shows current username. `id` shows UID, GID, and group memberships. `w` shows all logged-in users and their activity."),
  card("linux-018", "linux", "easy", 1, 1, "What does the `lsblk` command display?", "Lists block devices (disks, partitions) in a tree format showing name, type, size, and mount points. Essential for understanding storage layout."),
  card("linux-019", "linux", "easy", 1, 1, "How do you redirect both stdout and stderr to a file?", "`command > output.log 2>&1` or in bash: `command &> output.log`. `2>&1` redirects stderr (fd 2) to wherever stdout (fd 1) is going."),
  card("linux-020", "linux", "easy", 1, 1, "What is the difference between `apt` and `yum`/`dnf`?", "`apt` = Debian/Ubuntu package manager. `yum`/`dnf` = RHEL/CentOS/Fedora package manager. Same function, different distro families. In DC environments, RHEL-based is more common."),
];

export default linux;
