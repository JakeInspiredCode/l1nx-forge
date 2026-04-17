import type { MCQuestion } from "@/lib/types/campaign";

// hw-m03 "Memory & Storage" — covers hw-s5 (DIMMs, ECC, channels) + hw-s6 (NVMe, SAS, RAID, SMART)

export const HW_M03_QUESTIONS: MCQuestion[] = [
  {
    id: "hw-m03-q01",
    question:
      "A dual-socket server has 8 memory channels per CPU. A team installs 8 DIMMs on CPU 0 and leaves CPU 1's slots empty. What's the most important practical consequence?",
    choices: [
      { label: "A", text: "Memory is fully populated for bandwidth, but it's all remote to CPU 1. Workloads on CPU 1 access memory via the inter-socket link, creating a NUMA imbalance that can halve effective bandwidth for those workloads" },
      { label: "B", text: "The server will refuse to boot with unbalanced DIMM population" },
      { label: "C", text: "This is ideal — it simplifies memory addressing" },
      { label: "D", text: "There is no consequence at all" },
    ],
    correctAnswer: "A",
    explanation:
      "Each CPU has its own memory controller and local DIMMs. An unbalanced population means CPU 1 has no local memory and must fetch everything across the inter-socket link — slower and bandwidth-limited. Benchmarks on CPU 1 will collapse. The fix is to populate both CPUs symmetrically.",
  },
  {
    id: "hw-m03-q02",
    question:
      "A production server is configured with non-ECC DIMMs \"because the workload isn't mission-critical.\" What's the subtle danger being dismissed?",
    choices: [
      { label: "A", text: "A cosmic-ray-induced bit flip in a filesystem metadata page or database record goes undetected and silently corrupts data — hours or days later, something breaks for reasons nobody can diagnose" },
      { label: "B", text: "Non-ECC memory runs hotter and damages the CPU" },
      { label: "C", text: "Non-ECC memory is slower than ECC" },
      { label: "D", text: "No real danger — ECC is only marketing" },
    ],
    correctAnswer: "A",
    explanation:
      "The danger isn't speed or temperature — it's *silent* corruption. ECC detects and corrects single-bit errors and detects double-bit errors so you can react. Without ECC, a bit flip in a sensitive page (filesystem, database, cache) leaves no trace and produces delayed, unexplainable bugs. Every production server should use ECC.",
  },
  {
    id: "hw-m03-q03",
    question:
      "`edac-util -s` reports: `DIMM slot A2: 480 CEs in the last hour; all other slots: 0–1 per day`. What's the appropriate response, and why not take emergency action?",
    choices: [
      { label: "A", text: "A2 is showing a clear early-failure trend; data is still correct (corrected errors), so schedule a DIMM replacement in the next maintenance window rather than an emergency shutdown. Open an RMA, record the slot and serial from dmidecode" },
      { label: "B", text: "Immediately shut down the server and replace the DIMM" },
      { label: "C", text: "Do nothing — correctable errors are handled by ECC" },
      { label: "D", text: "Replace all DIMMs in the server" },
    ],
    correctAnswer: "A",
    explanation:
      "A correctable-error trend from 1/day to 480/hour is the textbook early-failure signal — no data loss yet, but the rate predicts an uncorrectable error soon. Emergency shutdown is overkill; ignoring is negligence. Open the RMA, confirm the slot/serial via `dmidecode -t memory`, and swap during the next window while the data is still valid.",
  },
  {
    id: "hw-m03-q04",
    question:
      "Your boot mirror is two M.2 NVMe sticks in RAID 1. One fails overnight. The server keeps booting and running fine. What's the most important property of the remaining \"healthy\" drive right now?",
    choices: [
      { label: "A", text: "It's the only copy — no redundancy until the replacement is in and the mirror is rebuilt. Any further issue with it risks an outage" },
      { label: "B", text: "It will wear out twice as fast now" },
      { label: "C", text: "It must be replaced along with the failed drive" },
      { label: "D", text: "Nothing special — the server is safe" },
    ],
    correctAnswer: "A",
    explanation:
      "Mirror broken = single point of failure. The \"healthy\" drive is doing all the work alone; any latent issue with it now risks an unbootable server. Treat the window until the replacement is installed and resynced as elevated risk — prioritize the swap and confirm the rebuild completes cleanly.",
  },
  {
    id: "hw-m03-q05",
    question:
      "A 10-drive RAID 5 array experiences a drive failure. Fourteen hours into the rebuild, a second drive fails. What's the likely outcome, and why did this happen?",
    choices: [
      { label: "A", text: "The array is likely lost. RAID 5 tolerates one failure; a second during rebuild means data loss on affected stripes. Rebuilds force sustained full-speed reads across every surviving drive — exactly the stress that exposes latent defects in aging drives that had been sitting at low load" },
      { label: "B", text: "The RAID will rebuild from a tertiary parity" },
      { label: "C", text: "The array will survive because the second failure was quickly detected" },
      { label: "D", text: "It means the RAID controller has failed" },
    ],
    correctAnswer: "A",
    explanation:
      "RAID 5 survives 1 drive failure, not 2. Rebuilds hammer the surviving drives with sustained reads for hours — the exact conditions that surface latent defects. The longer the rebuild, the higher the probability of a second failure. This is why modern shops prefer RAID 6 (tolerates 2 failures) or software-defined storage with erasure coding for large arrays.",
  },
  {
    id: "hw-m03-q06",
    question:
      "A user complains that a filesystem is returning intermittent read errors. `smartctl -H /dev/sda` reports `PASSED`. What does this tell you about the drive, and where do you look next?",
    choices: [
      { label: "A", text: "The SMART overall verdict is coarse — a drive can be PASSED while specific attributes are trending badly. Check smartctl -a for reallocated sectors, pending sectors, offline uncorrectable, and media wearout. Cross-check dmesg and any RAID controller logs" },
      { label: "B", text: "The drive is fine; the filesystem must be corrupt" },
      { label: "C", text: "SMART PASSED means no action is ever needed" },
      { label: "D", text: "Run a defragmentation tool" },
    ],
    correctAnswer: "A",
    explanation:
      "The overall PASSED flag is a summary that can miss trending attributes. The detailed counters — reallocated sectors, pending sectors, offline uncorrectable, media wearout on SSDs — tell the real story. Combine with kernel logs (`dmesg`, `journalctl -k`) and RAID controller state (MegaCli/storcli) to triangulate. If those counters are rising, the drive is on its way out.",
  },
  {
    id: "hw-m03-q07",
    question:
      "A team claims \"we have RAID 6, so we don't need backups.\" What's the fundamental error in that argument?",
    choices: [
      { label: "A", text: "RAID protects against drive hardware failures, not against accidental deletion, filesystem corruption, malware, or controller bugs that silently corrupt data. Backups are a separate concern — a copy of the data at a known point in time, somewhere else" },
      { label: "B", text: "RAID 6 only protects against one drive failure" },
      { label: "C", text: "RAID 6 requires more drives than a backup" },
      { label: "D", text: "Backups are slower than RAID" },
    ],
    correctAnswer: "A",
    explanation:
      "RAID = redundancy for drive hardware failures. Backups = point-in-time copies that survive the *current* storage. A typo that deletes a critical file, a ransomware event, a rogue RAID controller corrupting writes — RAID won't help. Always pair redundancy with a separate backup strategy; they solve different problems.",
  },
  {
    id: "hw-m03-q08",
    question:
      "You're choosing between NVMe and SAS drives for a new database server. What's the honest trade-off, and when would SAS actually make sense?",
    choices: [
      { label: "A", text: "NVMe is far faster (7+ GB/s vs ~1.5 GB/s) and lower latency, so it wins for databases and hot data. SAS makes sense for bulk capacity tiers (big, cheap, still enterprise-reliable) and brownfield deployments where existing SAS infrastructure can be reused" },
      { label: "B", text: "SAS is always slower and shouldn't be used in new builds" },
      { label: "C", text: "NVMe is less reliable than SAS under sustained load" },
      { label: "D", text: "They are functionally identical" },
    ],
    correctAnswer: "A",
    explanation:
      "NVMe wins on bandwidth and latency for anything hot — databases, caches, primary storage. SAS is still useful where capacity per dollar matters more than speed (bulk archives, secondary tiers) and in existing infrastructure where the controllers and chassis are already there. They coexist in most datacenters; the right answer depends on the workload tier.",
  },
];
