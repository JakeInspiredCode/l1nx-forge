import type { MCQuestion } from "@/lib/types/campaign";

// linux-m16 "Advanced Storage" — covers lxa-s7 (LVM) + lxa-s8 (RAID, filesystems, I/O)

export const LINUX_M16_QUESTIONS: MCQuestion[] = [
  {
    id: "linux-m16-q01",
    question:
      "A production node's `/var` LV is 97% full at 02:00 and filling. The VG has 50 GB of free extents. Which command sequence adds 20 GB of space with zero downtime?",
    choices: [
      { label: "A", text: "Reboot into single-user mode, then `lvextend`" },
      { label: "B", text: "`lvextend -r -L +20G /dev/rootvg/varlv` — extends the LV and resizes the filesystem in one step, online" },
      { label: "C", text: "`umount /var; lvextend -L +20G ...; mount /var`" },
      { label: "D", text: "`dd if=/dev/zero ...` to preallocate then grow" },
    ],
    correctAnswer: "B",
    explanation:
      "LVM was designed for exactly this case. `lvextend -r` extends the logical volume and (with `-r`) invokes the appropriate filesystem resize tool — `xfs_growfs` for XFS, `resize2fs` for ext4 — automatically. The mounted filesystem stays live. No unmount, no reboot, no service interruption. This is the canonical 2 AM save that LVM exists for.",
  },
  {
    id: "linux-m16-q02",
    question:
      "You need to take a 500 GB snapshot of an active, write-heavy database LV that will last about 4 hours while a backup runs. Which sizing is appropriate, and which type should you use?",
    choices: [
      { label: "A", text: "A classic snapshot at 10% of origin size — LVM compresses unused space" },
      { label: "B", text: "A thin snapshot from a thin pool — draws from a shared pool with no fixed preallocation" },
      { label: "C", text: "A tiny (1 GB) classic snapshot — it only holds deltas, not data" },
      { label: "D", text: "No snapshot is needed if the database is transactional" },
    ],
    correctAnswer: "B",
    explanation:
      "For long-lived snapshots on busy origins, thin snapshots (backed by a thin pool) are the right tool: they don't require a fixed preallocation, so they won't overflow and invalidate if write activity exceeds prediction. Classic snapshots are fine for short-lived, low-change-rate cases, but a 4-hour snapshot on a write-heavy DB will likely fill a classic CoW allocation and be dropped as 'invalid,' taking your backup with it.",
  },
  {
    id: "linux-m16-q03",
    question:
      "A disk in a RAID 10 array starts reporting rising reallocated sector counts via SMART but hasn't failed yet. The RAID is still `[UUUU]`. What's the right action?",
    choices: [
      { label: "A", text: "Wait — if SMART hasn't declared failure, the drive is fine" },
      { label: "B", text: "Proactively replace the drive: `mdadm /dev/md0 --replace /dev/sdX --with /dev/sdNEW` (or --fail, --remove, --add sequence) during a maintenance window" },
      { label: "C", text: "Flip the array to RAID 0 temporarily for better performance" },
      { label: "D", text: "Run `fsck` on the mounted filesystem" },
    ],
    correctAnswer: "B",
    explanation:
      "Rising reallocated sectors are a drive's way of saying \"I'm wearing out — cells are going bad and I'm relocating data.\" Wait for the hard failure and you're rebuilding under pressure; a second drive fault during that window loses data in RAID 5 and may in RAID 10 (depending on which pair). Proactive replacement is clean and bounded.",
  },
  {
    id: "linux-m16-q04",
    question:
      "Which statement about XFS is correct?",
    choices: [
      { label: "A", text: "XFS can grow and shrink online" },
      { label: "B", text: "XFS can grow online but cannot shrink at all" },
      { label: "C", text: "XFS requires unmount for any resize" },
      { label: "D", text: "XFS grows only at boot-time" },
    ],
    correctAnswer: "B",
    explanation:
      "XFS grows online with `xfs_growfs`. It does **not** support shrinking, period — by design. Plan sizing with this in mind: start conservative and extend as needed, or migrate to ext4 if shrinking is a likely future requirement (rare in practice).",
  },
  {
    id: "linux-m16-q05",
    question:
      "During an iostat incident you see one device with `%util=99`, `await=250ms` while its three peer mirrors show `%util=20`, `await=3ms`. The workload is identical (mirror pair). What's the first diagnostic you should run?",
    choices: [
      { label: "A", text: "`smartctl -a /dev/sdX` to check SMART attributes for failing health signals" },
      { label: "B", text: "`fsck -y` on the slow device" },
      { label: "C", text: "Reboot to rebalance I/O" },
      { label: "D", text: "Increase the I/O scheduler's queue depth" },
    ],
    correctAnswer: "A",
    explanation:
      "Asymmetric latency on mirror-peer devices is the signature of one drive going bad. SMART exposes reallocated sectors, pending sectors, offline uncorrectable errors — the signals that a drive is degrading. A failing drive often services reads and writes intermittently, spiking queue depth and await while its peers handle the same load just fine.",
  },
  {
    id: "linux-m16-q06",
    question:
      "You're given a new NVMe drive to configure as a high-throughput data volume. Which I/O scheduler should you use and why?",
    choices: [
      { label: "A", text: "`bfq` for fair CPU scheduling" },
      { label: "B", text: "`mq-deadline` for consistent latency" },
      { label: "C", text: "`none` — NVMe drives have their own internal scheduling and CPU-side scheduling adds overhead without benefit" },
      { label: "D", text: "`cfq` (Completely Fair Queuing)" },
    ],
    correctAnswer: "C",
    explanation:
      "Modern NVMe hardware has deep parallel queues and internal request scheduling that outperform any CPU-side reordering; adding a kernel scheduler just wastes cycles. `none` lets requests flow straight to the device. `mq-deadline` is appropriate for SATA SSDs/SAS drives; `bfq` is for desktop-fair workloads on slower media. `cfq` is legacy single-queue and doesn't exist on modern blk-mq kernels.",
  },
  {
    id: "linux-m16-q07",
    question:
      "`top` shows iowait at 40% on a database host. `iostat -xz 1` shows every local block device at <10% util and <5ms await. Where is the I/O load likely living?",
    choices: [
      { label: "A", text: "A network filesystem (NFS/Ceph/iSCSI mount) — iostat only shows block devices it knows about" },
      { label: "B", text: "The kernel's page cache" },
      { label: "C", text: "The CPU's internal L3 cache" },
      { label: "D", text: "The BMC's out-of-band management bus" },
    ],
    correctAnswer: "A",
    explanation:
      "iostat reports on block devices only. Filesystems mounted over the network (NFS, Ceph, iSCSI) or via FUSE don't appear — but time spent waiting on them still counts as iowait. Check `mount` for network filesystems and use the layer's own tools: `nfsiostat`, `ceph daemon osd.N perf dump`, or `pidstat -d 1` to see per-process I/O regardless of backing storage.",
  },
  {
    id: "linux-m16-q08",
    question:
      "A team deploys SSDs and notices write performance drops 40% after a few months of use. Which mount option change, combined with a weekly systemd timer, typically restores performance?",
    choices: [
      { label: "A", text: "Add `noatime` to /etc/fstab" },
      { label: "B", text: "Use `nodiscard` and enable `fstrim.timer` (or schedule `fstrim -a` weekly) so TRIM runs in bulk rather than on every delete" },
      { label: "C", text: "Switch the filesystem to ext4" },
      { label: "D", text: "Lower the I/O scheduler queue depth" },
    ],
    correctAnswer: "B",
    explanation:
      "SSDs slow down when the drive's internal 'free block pool' is exhausted — the controller has to erase-before-write, which is slow. TRIM tells the drive which blocks are freed. `discard` (TRIM on every delete) has per-op overhead; `nodiscard` + weekly `fstrim -a` (or the shipped `fstrim.timer` systemd unit) is the standard production pattern. Most SSD vendors explicitly recommend this.",
  },
  {
    id: "linux-m16-q09",
    question:
      "A failing disk needs to be physically replaced. Which LVM command sequence lets you evacuate its contents to other PVs in the VG while the filesystem stays mounted and the database keeps running?",
    choices: [
      { label: "A", text: "`pvmove /dev/sdc` then `vgreduce datavg /dev/sdc` then `pvremove /dev/sdc`" },
      { label: "B", text: "`umount /srv/data; pvmove; mount /srv/data`" },
      { label: "C", text: "`dd if=/dev/sdc of=/dev/sdd; pvremove /dev/sdc`" },
      { label: "D", text: "`lvremove` and recreate the LV" },
    ],
    correctAnswer: "A",
    explanation:
      "`pvmove` copies all used extents off a PV onto other PVs in the same VG — online, with no unmount required. Then `vgreduce` detaches the now-empty PV from the VG, and `pvremove` clears its LVM metadata. After that the drive is safe to pull. No downtime, no data loss, fully recoverable if interrupted (`pvmove --abort`).",
  },
  {
    id: "linux-m16-q10",
    question:
      "You take a 20 GB classic LVM snapshot of `/dev/vg/data` at 18:00. At 20:30, `lvs` shows the snapshot at 100% and journald reports 'snapshot invalid'. What is the root cause?",
    choices: [
      { label: "A", text: "LVM has a 2-hour TTL on snapshots" },
      { label: "B", text: "The origin LV received more than 20 GB of changed blocks during the snapshot's lifetime; the classic snapshot's copy-on-write area filled and LVM invalidated it to protect the origin" },
      { label: "C", text: "The filesystem on the origin was unmounted briefly" },
      { label: "D", text: "Snapshots automatically delete after 2 hours if unused" },
    ],
    correctAnswer: "B",
    explanation:
      "A classic snapshot has a **fixed** CoW area. Every *changed* block on the origin has its original version copied into that area before being overwritten. When the area fills, LVM invalidates the snapshot — it can no longer reconstruct the original view of some blocks. Sized at 20 GB, the snapshot survived roughly 2.5 hours of the workload before exceeding capacity. Fix: size larger, keep the snapshot shorter, or use a thin snapshot backed by a thin pool that can grow.",
  },
];
