import type { MCQuestion } from "@/lib/types/campaign";

// Mission 9: "Storage & Filesystems"
// Covers: Section 10 (synthesis), Filesystem Types Explorer
//         Cards (XFS, ext4, df, lsblk, fstab, tmpfs, smartctl, du)

export const MISSION_09_QUESTIONS: MCQuestion[] = [
  {
    id: "m09-q01",
    question: "What advantage does XFS have over ext4 for large-scale datacenter storage?",
    choices: [
      { label: "A", text: "XFS supports encryption; ext4 does not" },
      { label: "B", text: "XFS handles very large files and parallel I/O better — it was designed for high-performance workloads" },
      { label: "C", text: "XFS doesn't require formatting before use" },
      { label: "D", text: "XFS is the only filesystem supported by systemd" },
    ],
    correctAnswer: "B",
    explanation: "XFS excels at large files and parallel I/O, which is why RHEL chose it as the default. ext4 is more general-purpose. Both use journaling for crash recovery.",
  },
  {
    id: "m09-q02",
    question: "What does 'journaling' mean for a filesystem like ext4?",
    choices: [
      { label: "A", text: "It logs all file access for security auditing" },
      { label: "B", text: "It compresses files to save space" },
      { label: "C", text: "It records metadata changes before writing them — so after a crash, it replays the journal to restore consistency" },
      { label: "D", text: "It creates daily backup snapshots" },
    ],
    correctAnswer: "C",
    explanation: "Journaling writes planned metadata changes to a log before applying them. If power fails mid-write, the filesystem replays the journal on boot instead of needing a full disk scan.",
  },
  {
    id: "m09-q03",
    question: "You run `df -hT` and see a filesystem at 95% usage. The application writes logs here. What's the risk?",
    choices: [
      { label: "A", text: "Performance degrades linearly as the disk fills" },
      { label: "B", text: "The filesystem automatically compresses old files" },
      { label: "C", text: "When it hits 100%, all write operations fail — services crash, logs stop, databases corrupt" },
      { label: "D", text: "Linux reserves 20% of disk space, so 95% is actually only 75% full" },
    ],
    correctAnswer: "C",
    explanation: "A 100% full filesystem can't accept new writes. Services that write logs, temp files, or database records crash with 'No space left on device.' This is one of the most common datacenter incidents.",
  },
  {
    id: "m09-q04",
    question: "NFS differs from ext4 and XFS in a fundamental way. What is it?",
    choices: [
      { label: "A", text: "NFS is faster because it uses RAM instead of disk" },
      { label: "B", text: "NFS is a network filesystem — the data lives on a remote server, not the local disk" },
      { label: "C", text: "NFS doesn't support file permissions" },
      { label: "D", text: "NFS can only store files smaller than 1 GB" },
    ],
    correctAnswer: "B",
    explanation: "NFS (Network File System) mounts remote storage over the network. ext4 and XFS are local filesystems on directly-attached disks. NFS adds network latency but enables shared storage across servers.",
  },
  {
    id: "m09-q05",
    question: "You need to ensure a new data partition mounts automatically on every boot. Where do you configure this?",
    choices: [
      { label: "A", text: "`/etc/hosts`" },
      { label: "B", text: "`/etc/fstab`" },
      { label: "C", text: "`/proc/mounts`" },
      { label: "D", text: "`/var/log/mount.log`" },
    ],
    correctAnswer: "B",
    explanation: "`/etc/fstab` defines which filesystems mount at boot, where they mount, what type they are, and what options to use. `/proc/mounts` shows current mounts but is read-only.",
  },
  {
    id: "m09-q06",
    question: "A troubleshooting mental model has four layers: Hardware, OS, Network, Service. A web server returns '503 Service Unavailable' but the server pings fine and you can SSH in. Which layer is the problem?",
    choices: [
      { label: "A", text: "Hardware — disk or memory failure" },
      { label: "B", text: "OS — kernel crash or filesystem full" },
      { label: "C", text: "Network — connectivity issue between client and server" },
      { label: "D", text: "Service — the web server process is stopped, crashed, or misconfigured" },
    ],
    correctAnswer: "D",
    explanation: "Ping works = network is fine. SSH works = OS is running. The web server itself is the problem — stopped, crashed, or returning errors. Check with `systemctl status nginx` and the service logs.",
  },
  {
    id: "m09-q07",
    question: "You run `du -sh /* | sort -h` and see `/var` is 180 GB. What should you investigate next?",
    choices: [
      { label: "A", text: "Delete `/var` to free space immediately" },
      { label: "B", text: "Run `du -sh /var/*` to identify which subdirectory (likely `/var/log`) is consuming the space" },
      { label: "C", text: "Reformat the disk to reclaim fragmented space" },
      { label: "D", text: "Move `/var` to a faster NVMe drive" },
    ],
    correctAnswer: "B",
    explanation: "Drill down: `du -sh /var/*` shows per-subdirectory sizes. `/var/log` is usually the culprit (runaway logs). Then `find /var/log -size +100M` identifies the specific large files.",
  },
  {
    id: "m09-q08",
    question: "`smartctl` reports 'Current Pending Sector Count: 8' on a production disk. What does this mean?",
    choices: [
      { label: "A", text: "8 sectors are waiting for data to be written" },
      { label: "B", text: "8 sectors are unstable and may be reallocated — the disk is showing early signs of failure" },
      { label: "C", text: "The disk has 8 partitions" },
      { label: "D", text: "8 sectors are reserved for the journal" },
    ],
    correctAnswer: "B",
    explanation: "Pending sectors are areas the disk couldn't read reliably. They'll be reallocated on the next write attempt. A non-zero count is an early warning sign — plan for replacement.",
  },
];
