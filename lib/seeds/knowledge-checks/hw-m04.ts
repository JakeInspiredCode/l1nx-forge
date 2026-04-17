import type { MCQuestion } from "@/lib/types/campaign";

// hw-m04 "BIOS & Firmware" — covers hw-s7 (UEFI, POST, Boot) + hw-s8 (BMC, IPMI, Firmware discipline)

export const HW_M04_QUESTIONS: MCQuestion[] = [
  {
    id: "hw-m04-q01",
    question:
      "A server powers on but takes about two minutes before anything appears on the console. Fans spin, lights blink, but no boot messages. What's happening during that window and what's usually the slowest step?",
    choices: [
      { label: "A", text: "POST is running: CPU init, memory training, PCIe enumeration, storage probe, firmware health checks. Memory training on servers with many DIMMs is typically the slowest step" },
      { label: "B", text: "The server is downloading updates from the internet" },
      { label: "C", text: "The OS is decrypting the boot drive" },
      { label: "D", text: "The BMC is booting its own OS and blocking the main server" },
    ],
    correctAnswer: "A",
    explanation:
      "POST is a deliberate sequence that initializes hardware and validates it before handing off to an OS. Memory training — the firmware negotiating timings with every DIMM — is usually the long step, especially on large-DIMM-count servers. If POST fails, you get diagnostic LEDs, beep codes, or a BMC SEL entry rather than a booting OS.",
  },
  {
    id: "hw-m04-q02",
    question:
      "A server reboots after a firmware update and comes up in an emergency rescue shell instead of its normal OS. The BMC SEL shows no hardware errors. What's the most likely explanation and where do you look first?",
    choices: [
      { label: "A", text: "The firmware update reset or reordered UEFI boot entries; the server is booting a recovery entry rather than the usual root filesystem. Use efibootmgr to inspect and restore the correct boot order" },
      { label: "B", text: "The filesystem is corrupted" },
      { label: "C", text: "The OS license expired" },
      { label: "D", text: "The server needs a complete reinstall" },
    ],
    correctAnswer: "A",
    explanation:
      "BIOS/UEFI updates sometimes reset or reorder NVRAM boot entries. The server finds *some* bootable target (a rescue entry) and uses it. `efibootmgr -v` from the rescue shell lists entries and current order; `efibootmgr -o <order>` restores the right one. Many shops snapshot `efibootmgr` output before firmware upgrades so they have a known-good reference.",
  },
  {
    id: "hw-m04-q03",
    question:
      "A node boots fine from a cold power-on but fails to come back after a warm reboot — it loops POST indefinitely. BMC SEL entries show \"memory training failed on DIMM A1.\" What's the likely explanation?",
    choices: [
      { label: "A", text: "Warm reboots re-run memory training without full power cycle; a borderline DIMM may pass cold training but fail warm. A1 is the suspect — plan a reseat and have a replacement ready" },
      { label: "B", text: "Warm reboots aren't supported on this server" },
      { label: "C", text: "The BIOS is corrupt" },
      { label: "D", text: "The CPU is overheating" },
    ],
    correctAnswer: "A",
    explanation:
      "A DIMM at the edge of spec can pass one training path and fail another — the difference between cold and warm reboots exposes it. The BMC SEL points straight at A1, giving you the root cause. First action: reseat A1 (sometimes it's a contact issue); keep a same-spec DIMM on standby. Also check for a BIOS/memory-training firmware update — bad memory training firmware has shipped.",
  },
  {
    id: "hw-m04-q04",
    question:
      "It's 3 AM. A server is unreachable over SSH; data-network monitoring is red. The BMC responds. You're 500 miles from the datacenter. Which BMC capability is most likely to get you actionable information first, and how do you use it?",
    choices: [
      { label: "A", text: "Serial-over-LAN (ipmitool ... sol activate) — it attaches to the server's serial console so you can see kernel panic output, GRUB, or a stuck login prompt. Exit with ~." },
      { label: "B", text: "Power off the server and try again later" },
      { label: "C", text: "Open a vendor support ticket and wait for callback" },
      { label: "D", text: "Schedule a physical site visit" },
    ],
    correctAnswer: "A",
    explanation:
      "SOL is the single most useful BMC capability for 3-AM diagnosis. It shows you what the server's console is showing right now — kernel panic, fsck prompt, GRUB menu, anything. Combined with `ipmitool sel list` for hardware events and `power cycle` if needed, you can often diagnose and recover without leaving your chair. Exit with `~.` when done.",
  },
  {
    id: "hw-m04-q05",
    question:
      "A coworker wants to put BMCs on the same network as regular production traffic \"to simplify firewall rules.\" What's the security concern?",
    choices: [
      { label: "A", text: "BMCs run small embedded OSes that historically have had serious vulnerabilities including default credentials and auth bypasses. A compromised BMC can power-cycle, re-image, or take over the server. BMCs belong on an isolated management VLAN with strict ACLs, never exposed to production networks or the internet" },
      { label: "B", text: "BMC traffic is incompatible with TCP" },
      { label: "C", text: "BMCs use too much bandwidth" },
      { label: "D", text: "It isn't actually a security concern" },
    ],
    correctAnswer: "A",
    explanation:
      "BMCs are a powerful attack surface — they can do anything to the server. Their firmware is updated less often than OSes and has a history of severe CVEs. Keeping them on an isolated management VLAN with narrow ACLs is standard practice. Mixing them with production traffic or exposing them to the internet turns every BMC into a high-value target.",
  },
  {
    id: "hw-m04-q06",
    question:
      "Your team wants to flash new BIOS firmware to 500 nodes to save time. What's the disciplined approach, and why is \"all at once\" specifically dangerous?",
    choices: [
      { label: "A", text: "Pilot on one node first. Then stage the rollout (e.g., 10% at a time, verify, continue). A failed flash batch affecting all 500 nodes would be catastrophic; staging contains the blast radius to a manageable number of recovery events" },
      { label: "B", text: "Flash all 500 at once with a failover script" },
      { label: "C", text: "Flash during peak hours so errors are caught quickly" },
      { label: "D", text: "Disable the BMC during the flash" },
    ],
    correctAnswer: "A",
    explanation:
      "Firmware upgrades can fail in subtle, fleet-wide ways — bad firmware image, unexpected interaction with BMC, memory training quirks. Piloting on one node and then staging (10%, then 25%, etc.) contains the blast radius. Two bad nodes in a staged rollout is a small incident; five hundred bad nodes is a catastrophe. \"Go fast\" and \"recover from disaster\" are competing goals — bias to staging.",
  },
  {
    id: "hw-m04-q07",
    question:
      "A BIOS flash hangs partway through on two nodes. They power on, the BMC responds, but the main server won't POST. What's the recovery path?",
    choices: [
      { label: "A", text: "Most enterprise boards support BMC-driven BIOS recovery or a dual-BIOS failover path. Use the vendor's specific recovery procedure (iDRAC lifecycle controller for Dell, iLO for HPE, Supermicro SUM, etc.) to re-flash the main BIOS from the BMC. Worst case is RMA the motherboard" },
      { label: "B", text: "Replace the CPU" },
      { label: "C", text: "Disconnect the server from the network and hope it self-recovers" },
      { label: "D", text: "Nothing — a bricked BIOS is unrecoverable" },
    ],
    correctAnswer: "A",
    explanation:
      "Enterprise servers are designed so a bad flash isn't a bricked machine. The BMC can typically re-flash the main BIOS even when the server won't POST — that's part of why the BMC is independent. The specific procedure varies by vendor (Dell iDRAC, HPE iLO, Supermicro SUM), but the principle is universal: the out-of-band controller is your recovery path. RMA is only the last resort.",
  },
  {
    id: "hw-m04-q08",
    question:
      "A server is unresponsive over SSH. Via the BMC serial console you see the kernel is stuck in a panic about a filesystem error. What's the disciplined recovery sequence, using only BMC capabilities?",
    choices: [
      { label: "A", text: "1) Capture the panic output as diagnostic evidence. 2) Check ipmitool sel list for correlated hardware events (DIMM, disk, thermal). 3) If clean, power-cycle via IPMI. 4) If it panics again the same way, mount a rescue ISO through BMC virtual media, boot into rescue, run fsck, investigate the underlying cause" },
      { label: "B", text: "Power off immediately without capturing output" },
      { label: "C", text: "Keep retrying SSH until it responds" },
      { label: "D", text: "Reformat the disks remotely" },
    ],
    correctAnswer: "A",
    explanation:
      "Capture evidence first — the panic text is the diagnostic. Check the SEL to rule out correlated hardware faults that caused the panic. A single power-cycle often recovers transient issues. If it panics again at the same point, mount a rescue ISO via BMC virtual media and run `fsck` from rescue mode. Throughout, you're working entirely remotely — which is exactly why the BMC exists.",
  },
];
