// ═══════════════════════════════════════
// Linux Filesystem Hierarchy — interactive tree data
// ═══════════════════════════════════════

export interface FSNode {
  name: string;
  path: string;
  description: string;
  children?: FSNode[];
}

export const FILESYSTEM_TREE: FSNode = {
  name: "/",
  path: "/",
  description: "Root — all files branch from here",
  children: [
    {
      name: "bin",
      path: "/bin",
      description: "Essential user binaries (ls, cp, mv, grep)",
      children: [],
    },
    {
      name: "sbin",
      path: "/sbin",
      description: "System binaries (fdisk, mount, reboot) — usually root-only",
      children: [],
    },
    {
      name: "etc",
      path: "/etc",
      description: "System-wide configuration files",
      children: [
        { name: "hostname", path: "/etc/hostname", description: "System hostname" },
        { name: "fstab", path: "/etc/fstab", description: "Persistent filesystem mounts" },
        { name: "hosts", path: "/etc/hosts", description: "Local hostname→IP mappings" },
        { name: "passwd", path: "/etc/passwd", description: "User account info" },
        { name: "shadow", path: "/etc/shadow", description: "Encrypted passwords (root only)" },
        { name: "sudoers", path: "/etc/sudoers", description: "Sudo permissions (0440)" },
        {
          name: "ssh",
          path: "/etc/ssh",
          description: "SSH configuration",
          children: [
            { name: "sshd_config", path: "/etc/ssh/sshd_config", description: "SSH server config" },
          ],
        },
        {
          name: "systemd",
          path: "/etc/systemd",
          description: "systemd admin overrides",
          children: [
            { name: "system", path: "/etc/systemd/system", description: "Admin unit file overrides" },
          ],
        },
      ],
    },
    {
      name: "var",
      path: "/var",
      description: "Variable data — logs, caches, spool",
      children: [
        {
          name: "log",
          path: "/var/log",
          description: "System and application logs",
          children: [
            { name: "syslog", path: "/var/log/syslog", description: "General system log (Ubuntu)" },
            { name: "messages", path: "/var/log/messages", description: "General system log (RHEL)" },
            { name: "auth.log", path: "/var/log/auth.log", description: "Authentication events" },
            { name: "dmesg", path: "/var/log/dmesg", description: "Boot-time kernel snapshot" },
          ],
        },
        { name: "tmp", path: "/var/tmp", description: "Temporary files (survives reboot)" },
        { name: "cache", path: "/var/cache", description: "Application cache data" },
      ],
    },
    {
      name: "home",
      path: "/home",
      description: "User home directories",
      children: [
        { name: "ops", path: "/home/ops", description: "Example user home" },
      ],
    },
    {
      name: "root",
      path: "/root",
      description: "Root user's home directory",
      children: [],
    },
    {
      name: "tmp",
      path: "/tmp",
      description: "Temporary files (cleared on reboot, tmpfs)",
      children: [],
    },
    {
      name: "usr",
      path: "/usr",
      description: "User programs and libraries (read-only)",
      children: [
        { name: "bin", path: "/usr/bin", description: "User commands" },
        { name: "sbin", path: "/usr/sbin", description: "System commands" },
        { name: "lib", path: "/usr/lib", description: "Libraries" },
        {
          name: "lib/systemd/system",
          path: "/usr/lib/systemd/system",
          description: "Vendor unit files (don't edit directly)",
        },
        { name: "local", path: "/usr/local", description: "Locally installed software" },
      ],
    },
    {
      name: "opt",
      path: "/opt",
      description: "Optional/third-party software",
      children: [],
    },
    {
      name: "proc",
      path: "/proc",
      description: "Virtual FS — kernel and process info (not on disk)",
      children: [
        { name: "cpuinfo", path: "/proc/cpuinfo", description: "CPU details" },
        { name: "meminfo", path: "/proc/meminfo", description: "Memory statistics" },
        { name: "mdstat", path: "/proc/mdstat", description: "Software RAID status" },
        { name: "<PID>/status", path: "/proc/<PID>/status", description: "Per-process info" },
      ],
    },
    {
      name: "sys",
      path: "/sys",
      description: "Virtual FS — hardware and driver info",
      children: [],
    },
    {
      name: "dev",
      path: "/dev",
      description: "Device files — hardware and virtual devices",
      children: [
        { name: "sda", path: "/dev/sda", description: "First disk" },
        { name: "nvidia0", path: "/dev/nvidia0", description: "First GPU" },
        { name: "null", path: "/dev/null", description: "Discard output" },
        { name: "shm", path: "/dev/shm", description: "Shared memory (tmpfs)" },
        { name: "ttyS0", path: "/dev/ttyS0", description: "First serial port" },
      ],
    },
    {
      name: "mnt",
      path: "/mnt",
      description: "Temporary mount point",
      children: [],
    },
    {
      name: "boot",
      path: "/boot",
      description: "Boot loader, kernel, initramfs",
      children: [],
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

// Get quiz-worthy nodes (have a meaningful description)
export function getQuizNodes(): { path: string; description: string }[] {
  return flattenTree(FILESYSTEM_TREE)
    .filter((n) => n.path !== "/" && n.description.length > 5)
    .map((n) => ({ path: n.path, description: n.description }));
}
