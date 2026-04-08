// ═══════════════════════════════════════
// Linux Filesystem Hierarchy — interactive tree data
// Based on FHS 3.0 (Filesystem Hierarchy Standard)
// ═══════════════════════════════════════

export type FSDifficulty = "easy" | "moderate" | "hard";

export interface FSNode {
  name: string;
  path: string;
  description: string;
  difficulty?: FSDifficulty; // for quiz filtering — omit on parent-only nodes
  children?: FSNode[];
}

export const FILESYSTEM_TREE: FSNode = {
  name: "/",
  path: "/",
  description: "Root — all files branch from here",
  children: [
    // ── Easy: top-level directories every tech should know ──
    {
      name: "bin",
      path: "/bin",
      description: "Essential user command binaries (ls, cp, mv, grep) — often symlinked to /usr/bin",
      difficulty: "easy",
      children: [],
    },
    {
      name: "sbin",
      path: "/sbin",
      description: "Essential system admin binaries (fdisk, mount, reboot) — often symlinked to /usr/sbin",
      difficulty: "easy",
      children: [],
    },
    {
      name: "boot",
      path: "/boot",
      description: "Boot loader (GRUB), kernel image, and initramfs",
      difficulty: "easy",
      children: [],
    },
    {
      name: "dev",
      path: "/dev",
      description: "Device files — hardware and virtual device nodes",
      difficulty: "easy",
      children: [
        { name: "sda", path: "/dev/sda", description: "First SCSI/SATA disk device", difficulty: "moderate" },
        { name: "null", path: "/dev/null", description: "Black hole — discards all data written to it", difficulty: "easy" },
        { name: "zero", path: "/dev/zero", description: "Produces an infinite stream of zero bytes", difficulty: "moderate" },
        { name: "shm", path: "/dev/shm", description: "POSIX shared memory backed by tmpfs", difficulty: "hard" },
        { name: "ttyS0", path: "/dev/ttyS0", description: "First serial port (console access)", difficulty: "hard" },
        { name: "nvidia0", path: "/dev/nvidia0", description: "First NVIDIA GPU device node", difficulty: "moderate" },
      ],
    },
    {
      name: "etc",
      path: "/etc",
      description: "System-wide configuration files",
      difficulty: "easy",
      children: [
        { name: "hostname", path: "/etc/hostname", description: "File containing the system's hostname", difficulty: "easy" },
        { name: "fstab", path: "/etc/fstab", description: "Filesystem table — persistent mount definitions", difficulty: "moderate" },
        { name: "hosts", path: "/etc/hosts", description: "Static hostname-to-IP address mappings", difficulty: "easy" },
        { name: "resolv.conf", path: "/etc/resolv.conf", description: "DNS resolver configuration (nameservers)", difficulty: "moderate" },
        { name: "passwd", path: "/etc/passwd", description: "User account database (name, UID, shell, home)", difficulty: "easy" },
        { name: "shadow", path: "/etc/shadow", description: "Hashed user passwords — readable by root only", difficulty: "easy" },
        { name: "group", path: "/etc/group", description: "Group definitions and membership", difficulty: "moderate" },
        { name: "sudoers", path: "/etc/sudoers", description: "Defines which users may run sudo and how", difficulty: "moderate" },
        { name: "crontab", path: "/etc/crontab", description: "System-wide cron scheduled task table", difficulty: "moderate" },
        {
          name: "ssh",
          path: "/etc/ssh",
          description: "SSH client and server configuration directory",
          difficulty: "easy",
          children: [
            { name: "ssh_config", path: "/etc/ssh/ssh_config", description: "SSH client config — controls outbound connections", difficulty: "hard" },
            { name: "sshd_config", path: "/etc/ssh/sshd_config", description: "SSH daemon (server) config — controls inbound connections", difficulty: "hard" },
          ],
        },
        {
          name: "systemd",
          path: "/etc/systemd",
          description: "Local systemd configuration and unit file overrides",
          difficulty: "moderate",
          children: [
            { name: "system", path: "/etc/systemd/system", description: "Admin-created or overridden systemd unit files", difficulty: "hard" },
          ],
        },
      ],
    },
    {
      name: "home",
      path: "/home",
      description: "User home directories — one subdirectory per user",
      difficulty: "easy",
      children: [],
    },
    {
      name: "lib",
      path: "/lib",
      description: "Essential shared libraries for /bin and /sbin — often symlinked to /usr/lib",
      difficulty: "moderate",
      children: [],
    },
    {
      name: "media",
      path: "/media",
      description: "Auto-mount point for removable media (USB drives, CDs)",
      difficulty: "moderate",
      children: [],
    },
    {
      name: "mnt",
      path: "/mnt",
      description: "Temporary mount point for admin-mounted filesystems",
      difficulty: "moderate",
      children: [],
    },
    {
      name: "opt",
      path: "/opt",
      description: "Optional add-on application packages (third-party software)",
      difficulty: "moderate",
      children: [],
    },
    {
      name: "proc",
      path: "/proc",
      description: "Virtual filesystem — live kernel and process info (not on disk)",
      difficulty: "easy",
      children: [
        { name: "cpuinfo", path: "/proc/cpuinfo", description: "CPU model, cores, and feature flags", difficulty: "moderate" },
        { name: "meminfo", path: "/proc/meminfo", description: "Live memory and swap usage statistics", difficulty: "moderate" },
        { name: "mdstat", path: "/proc/mdstat", description: "Software RAID array status", difficulty: "hard" },
        { name: "mounts", path: "/proc/mounts", description: "Currently mounted filesystems (live view)", difficulty: "hard" },
        { name: "uptime", path: "/proc/uptime", description: "System uptime in seconds since boot", difficulty: "moderate" },
      ],
    },
    {
      name: "root",
      path: "/root",
      description: "Home directory for the root (superuser) account",
      difficulty: "easy",
      children: [],
    },
    {
      name: "run",
      path: "/run",
      description: "Runtime data since last boot — PIDs, sockets, locks (tmpfs)",
      difficulty: "hard",
      children: [],
    },
    {
      name: "srv",
      path: "/srv",
      description: "Data served by this system (web, FTP, repos)",
      difficulty: "hard",
      children: [],
    },
    {
      name: "sys",
      path: "/sys",
      description: "Virtual filesystem — kernel view of hardware, drivers, and devices",
      difficulty: "moderate",
      children: [
        { name: "block", path: "/sys/block", description: "Block device info (disks, partitions)", difficulty: "hard" },
        { name: "class", path: "/sys/class", description: "Devices grouped by class (net, tty, gpu)", difficulty: "hard" },
      ],
    },
    {
      name: "tmp",
      path: "/tmp",
      description: "Temporary files cleared automatically on every reboot (tmpfs)",
      difficulty: "easy",
      children: [],
    },
    {
      name: "usr",
      path: "/usr",
      description: "User programs and shared libraries (read-only in normal operation)",
      difficulty: "easy",
      children: [
        { name: "bin", path: "/usr/bin", description: "Most user command binaries (non-essential)", difficulty: "moderate" },
        { name: "sbin", path: "/usr/sbin", description: "Non-essential system admin binaries", difficulty: "moderate" },
        { name: "lib", path: "/usr/lib", description: "Shared libraries for /usr/bin and /usr/sbin", difficulty: "moderate" },
        {
          name: "local",
          path: "/usr/local",
          description: "Locally compiled or manually installed software",
          difficulty: "moderate",
          children: [
            { name: "bin", path: "/usr/local/bin", description: "Locally installed user commands", difficulty: "hard" },
            { name: "lib", path: "/usr/local/lib", description: "Locally installed libraries", difficulty: "hard" },
          ],
        },
        { name: "share", path: "/usr/share", description: "Architecture-independent data (docs, man pages, icons)", difficulty: "hard" },
      ],
    },
    {
      name: "var",
      path: "/var",
      description: "Variable data — files that change during operation",
      difficulty: "easy",
      children: [
        {
          name: "log",
          path: "/var/log",
          description: "System and application log files",
          difficulty: "easy",
          children: [
            { name: "syslog", path: "/var/log/syslog", description: "General system log on Debian/Ubuntu", difficulty: "moderate" },
            { name: "messages", path: "/var/log/messages", description: "General system log on RHEL/CentOS", difficulty: "moderate" },
            { name: "auth.log", path: "/var/log/auth.log", description: "Authentication and authorization events log", difficulty: "moderate" },
            { name: "dmesg", path: "/var/log/dmesg", description: "Kernel ring buffer snapshot captured at boot", difficulty: "hard" },
            { name: "kern.log", path: "/var/log/kern.log", description: "Kernel-only messages log", difficulty: "hard" },
          ],
        },
        { name: "tmp", path: "/var/tmp", description: "Temporary files that persist across reboots", difficulty: "moderate" },
        { name: "cache", path: "/var/cache", description: "Application cache data (apt, yum, etc.)", difficulty: "moderate" },
        { name: "spool", path: "/var/spool", description: "Queued data for processing (mail, print, cron)", difficulty: "hard" },
        { name: "lib", path: "/var/lib", description: "Persistent application state data (databases, package info)", difficulty: "hard" },
      ],
    },
  ],
};

// Flatten tree for quiz modes
export function flattenTree(node: FSNode): FSNode[] {
  const result: FSNode[] = [node];
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenTree(child));
    }
  }
  return result;
}

// Get quiz-worthy nodes, optionally filtered by difficulty
export function getQuizNodes(difficulty?: FSDifficulty): { path: string; description: string }[] {
  return flattenTree(FILESYSTEM_TREE)
    .filter((n) => n.path !== "/" && n.description.length > 5 && n.difficulty)
    .filter((n) => !difficulty || n.difficulty === difficulty)
    .map((n) => ({ path: n.path, description: n.description }));
}
