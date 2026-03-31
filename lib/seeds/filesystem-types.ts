// ═══════════════════════════════════════
// FILESYSTEM TYPES — Interactive Reference + Quiz Data
// ═══════════════════════════════════════

export interface FilesystemType {
  name: string;
  fullName: string;
  category: "linux" | "compat" | "virtual" | "network";
  description: string;
  useCases: string[];
  characteristics: string[];
  mountPoints: string[];
  commands: string[];
}

export interface FSTypeQuiz {
  scenario: string;
  answer: string;
  teaching: string;
}

export const CATEGORY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  linux:   { label: "Linux Native",  color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30" },
  compat:  { label: "Compatibility", color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/30" },
  virtual: { label: "Virtual",       color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/30" },
  network: { label: "Network",       color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
};

export const FILESYSTEM_TYPES: FilesystemType[] = [
  {
    name: "ext4",
    fullName: "Fourth Extended Filesystem",
    category: "linux",
    description: "Standard Linux filesystem — the default for most distributions.",
    useCases: [
      "Root filesystem (/) on most Linux installs",
      "General-purpose storage partitions",
      "Boot partitions (/boot)",
    ],
    characteristics: [
      "Journaling for crash recovery",
      "Max volume size: 1 EiB, max file size: 16 TiB",
      "Backward compatible with ext2/ext3",
      "Supports extents for large file performance",
    ],
    mountPoints: ["/", "/boot", "/home"],
    commands: ["mkfs.ext4", "tune2fs", "e2fsck", "resize2fs"],
  },
  {
    name: "xfs",
    fullName: "XFS High-Performance Filesystem",
    category: "linux",
    description: "High-performance journaling filesystem — excels with large files and parallel I/O.",
    useCases: [
      "Large data volumes and media storage",
      "RHEL/CentOS default filesystem",
      "Database storage with heavy write loads",
    ],
    characteristics: [
      "Excellent parallel I/O performance",
      "Online defragmentation and growth (but no shrink)",
      "Max volume size: 8 EiB",
      "Allocation groups enable concurrent operations",
    ],
    mountPoints: ["/", "/data", "/var/lib"],
    commands: ["mkfs.xfs", "xfs_repair", "xfs_growfs", "xfs_info"],
  },
  {
    name: "btrfs",
    fullName: "B-Tree Filesystem",
    category: "linux",
    description: "Modern copy-on-write filesystem with built-in snapshots and RAID.",
    useCases: [
      "Systems needing snapshots and rollbacks",
      "openSUSE/Fedora default on some installs",
      "Multi-device storage pools without LVM",
    ],
    characteristics: [
      "Copy-on-write (CoW) — never overwrites in place",
      "Native snapshots and subvolumes",
      "Built-in RAID 0/1/10 and compression",
      "Online resize (grow and shrink)",
    ],
    mountPoints: ["/", "/home", "/snapshots"],
    commands: ["mkfs.btrfs", "btrfs subvolume", "btrfs snapshot", "btrfs balance"],
  },
  {
    name: "tmpfs",
    fullName: "Temporary Filesystem",
    category: "virtual",
    description: "RAM-backed filesystem — blazing fast, but contents are lost on reboot.",
    useCases: [
      "Temporary files and caches",
      "Shared memory (/dev/shm)",
      "Build directories for speed-critical compilation",
    ],
    characteristics: [
      "Stored entirely in RAM (and swap if needed)",
      "Contents do not survive reboot",
      "Dynamically sized — only uses RAM for actual content",
      "No disk I/O — extremely fast reads/writes",
    ],
    mountPoints: ["/tmp", "/run", "/dev/shm"],
    commands: ["mount -t tmpfs", "df -h /tmp", "free -h"],
  },
  {
    name: "vfat",
    fullName: "Virtual FAT (FAT32)",
    category: "compat",
    description: "FAT32 filesystem — universal compatibility, used for EFI boot and USB drives.",
    useCases: [
      "EFI System Partition (/boot/efi)",
      "USB flash drives shared with Windows/macOS",
      "Embedded systems and firmware updates",
    ],
    characteristics: [
      "No journaling — vulnerable to corruption on unclean unmount",
      "Max file size: 4 GiB",
      "No Unix permissions or symlinks",
      "Readable by virtually every OS",
    ],
    mountPoints: ["/boot/efi", "/mnt/usb"],
    commands: ["mkfs.vfat", "dosfsck", "fatlabel"],
  },
  {
    name: "ntfs",
    fullName: "New Technology File System",
    category: "compat",
    description: "Windows default filesystem — Linux supports read/write via ntfs-3g driver.",
    useCases: [
      "Dual-boot systems accessing Windows partitions",
      "External drives formatted on Windows",
      "Large file storage when FAT32's 4 GiB limit is too small",
    ],
    characteristics: [
      "Journaling and ACL-based permissions",
      "Max file size: 16 EiB (theoretical)",
      "Linux uses FUSE-based ntfs-3g for read/write",
      "Native Linux support improving with ntfs3 kernel driver",
    ],
    mountPoints: ["/mnt/windows", "/media/external"],
    commands: ["mount -t ntfs-3g", "ntfsfix", "ntfsresize"],
  },
  {
    name: "nfs",
    fullName: "Network File System",
    category: "network",
    description: "Network filesystem — mount remote directories as if they were local.",
    useCases: [
      "Shared home directories across servers",
      "Centralized storage in data centers",
      "Read-only media libraries and software repos",
    ],
    characteristics: [
      "Transparent network access — apps see a normal directory",
      "Stateless protocol (NFSv3) or stateful (NFSv4)",
      "Performance depends on network latency and bandwidth",
      "Kerberos authentication available in NFSv4",
    ],
    mountPoints: ["/mnt/nfs", "/home (network-mounted)", "/shared"],
    commands: ["mount -t nfs", "exportfs", "showmount", "nfsstat"],
  },
];

// ═══════════════════════════════════════
// QUIZ SCENARIOS
// ═══════════════════════════════════════

export const FS_TYPE_QUIZZES: FSTypeQuiz[] = [
  {
    scenario: "You need a filesystem for the EFI System Partition that every OS can read during boot.",
    answer: "vfat",
    teaching: "The EFI spec requires FAT32 (vfat) for the boot partition — it's the universal standard every bootloader and UEFI firmware can read.",
  },
  {
    scenario: "Your /tmp is using RAM instead of disk. Files disappear after every reboot.",
    answer: "tmpfs",
    teaching: "tmpfs lives entirely in RAM. It's fast but volatile — perfect for temp files that don't need to survive a reboot.",
  },
  {
    scenario: "You're setting up a new Ubuntu server and the installer defaults to this journaling filesystem for /.",
    answer: "ext4",
    teaching: "ext4 is the default root filesystem for most Linux distributions — reliable, well-tested, and journaled for crash recovery.",
  },
  {
    scenario: "The RHEL admin is using a filesystem that excels at parallel I/O but cannot be shrunk — only grown.",
    answer: "xfs",
    teaching: "XFS is the RHEL/CentOS default. Its allocation groups enable high parallelism, but the trade-off is it only supports online growth, not shrinking.",
  },
  {
    scenario: "You want to take instant snapshots before a risky upgrade, with built-in rollback support.",
    answer: "btrfs",
    teaching: "Btrfs has native snapshot and subvolume support — copy-on-write means snapshots are instant and space-efficient.",
  },
  {
    scenario: "You need to mount a Windows partition on a dual-boot laptop to access files from Linux.",
    answer: "ntfs",
    teaching: "Windows uses NTFS by default. Linux can read/write NTFS partitions using the ntfs-3g FUSE driver or the newer ntfs3 kernel driver.",
  },
  {
    scenario: "Multiple servers in the data center need to access the same shared directory as if it were local.",
    answer: "nfs",
    teaching: "NFS (Network File System) makes remote directories appear local — the standard for shared storage in Linux data centers.",
  },
  {
    scenario: "You run `df -Th` and see a filesystem type that uses copy-on-write and supports built-in RAID without LVM.",
    answer: "btrfs",
    teaching: "Btrfs is the only common Linux filesystem with built-in RAID and CoW — no need for mdadm or LVM for multi-device setups.",
  },
  {
    scenario: "A USB drive formatted for maximum cross-platform compatibility, but files can't exceed 4 GiB.",
    answer: "vfat",
    teaching: "FAT32 (vfat) is universally readable but has a hard 4 GiB file size limit — the classic trade-off for compatibility.",
  },
  {
    scenario: "You're troubleshooting why /dev/shm is using memory. This is expected behavior for this filesystem type.",
    answer: "tmpfs",
    teaching: "/dev/shm is a tmpfs mount used for POSIX shared memory. It's backed by RAM — that's by design, not a bug.",
  },
  {
    scenario: "The database server uses a filesystem optimized for large sequential writes with excellent throughput on multi-core systems.",
    answer: "xfs",
    teaching: "XFS was designed for large files and high-throughput workloads. Its allocation group architecture scales well across multiple CPU cores.",
  },
  {
    scenario: "You need to run `exportfs` and `showmount` to debug why a remote mount point isn't accessible.",
    answer: "nfs",
    teaching: "exportfs and showmount are NFS-specific tools — exportfs manages the server's share list, showmount queries what's available.",
  },
];
