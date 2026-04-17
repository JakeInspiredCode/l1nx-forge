import type { MCQuestion } from "@/lib/types/campaign";

// hw-m01 "Server Anatomy" — covers hw-s1 (Inside the Chassis) + hw-s2 (Redundancy & Failure Modes)

export const HW_M01_QUESTIONS: MCQuestion[] = [
  {
    id: "hw-m01-q01",
    question:
      "A colleague describes a server as \"a bigger, more powerful desktop computer.\" What's the single most important way a production server actually differs?",
    choices: [
      { label: "A", text: "Servers have more RAM and CPU cores than desktops" },
      { label: "B", text: "Servers are designed to keep running despite component failures and to be operated without a monitor or keyboard" },
      { label: "C", text: "Servers always run Linux and desktops always run Windows" },
      { label: "D", text: "Servers are quieter so they don't disturb office workers" },
    ],
    correctAnswer: "B",
    explanation:
      "More RAM and CPUs are true but symptomatic. The defining trait is that servers are built around three assumptions that reshape every component: continuous operation, survive-failure design (redundant PSUs, hot-swap drives, ECC memory, BMC), and remote/headless operation (no monitor, managed over the network).",
  },
  {
    id: "hw-m01-q02",
    question:
      "You rack a 4U GPU server drawing roughly 10 kW. Your datacenter rack is provisioned at 15 kW. How many of these servers can you fit in that rack, limited by power?",
    choices: [
      { label: "A", text: "Ten — a 42U rack fits ten 4U servers with room to spare" },
      { label: "B", text: "One — at 10 kW each, two would exceed the 15 kW rack budget" },
      { label: "C", text: "Four — just divide 42U by 4U" },
      { label: "D", text: "As many as you want; only physical space matters" },
    ],
    correctAnswer: "B",
    explanation:
      "Modern GPU servers are power-limited, not space-limited. Two 10 kW nodes would draw 20 kW and exceed a 15 kW rack. The 42U of physical space is irrelevant — AI racks routinely run half-empty because power density is the binding constraint. This is why hyperscalers are pushing to 40+ kW racks and liquid cooling.",
  },
  {
    id: "hw-m01-q03",
    question:
      "A tech installs 4 matched DIMMs into a dual-CPU server with 16 total DIMM slots (8 per CPU). Benchmarks show memory bandwidth about half of what identical servers in the same rack deliver. Nothing is broken. What's the explanation?",
    choices: [
      { label: "A", text: "The DIMMs are defective and returning slower speeds than rated" },
      { label: "B", text: "Memory bandwidth scales with populated channels — with only 4 DIMMs, most of the 16 channels are empty, leaving bandwidth on the table" },
      { label: "C", text: "The BIOS is set to power-saver mode" },
      { label: "D", text: "The server needs a firmware update" },
    ],
    correctAnswer: "B",
    explanation:
      "Each CPU has 8 memory channels; bandwidth scales with how many you populate, not how much RAM is installed. Four DIMMs activate at most 4 of 16 channels, delivering ~half the bandwidth. The fix is to install DIMMs in channel-matched groups (ideally fill all 16 slots or fill 8 per CPU).",
  },
  {
    id: "hw-m01-q04",
    question:
      "An electrician is about to work on power feed A, which feeds PDU-A. Your server has dual PSUs, one on each feed, both showing green LEDs. Your teammate says \"we're redundant, it's fine.\" You still want to verify — why?",
    choices: [
      { label: "A", text: "Green LEDs only indicate the PSU is present and healthy, not that it's currently drawing power from its feed" },
      { label: "B", text: "Electricians can't be trusted" },
      { label: "C", text: "The server needs to be shut down before any power work regardless" },
      { label: "D", text: "Green LEDs occasionally show false positives on new hardware" },
    ],
    correctAnswer: "A",
    explanation:
      "A green LED indicates a healthy PSU, not a live feed. If feed B silently failed weeks ago and nobody noticed, the server is running on feed A alone — and pulling feed A will kill it. Before any power work, verify both inputs via BMC sensors (IPMI reports per-PSU input voltage) so \"redundant\" is current fact, not historical assumption.",
  },
  {
    id: "hw-m01-q05",
    question:
      "In a fleet of 10,000 servers, which class of components typically fails the most frequently, and why?",
    choices: [
      { label: "A", text: "CPUs — they run hottest and are under constant stress" },
      { label: "B", text: "Motherboards — they have the most solder joints and capacitors" },
      { label: "C", text: "Spinning disks — they have moving parts (motors, heads, bearings) that wear out, while most other components are solid-state" },
      { label: "D", text: "Power supplies — they handle the highest current and run hottest" },
    ],
    correctAnswer: "C",
    explanation:
      "Mechanical parts lead the failure rate. The general ordering, most to least common: disks → DIMMs → fans → PSUs → NICs → GPUs → CPUs. This ordering drives operational patterns — spare disk and fan stock lives close to the rack, while CPU failures are rare enough to handle as vendor RMA.",
  },
  {
    id: "hw-m01-q06",
    question:
      "The BMC is often described as \"out-of-band\" management. Which scenario most clearly illustrates why that property matters?",
    choices: [
      { label: "A", text: "The server is running a heavy workload and you want to monitor CPU usage without slowing it down" },
      { label: "B", text: "The OS has crashed with a kernel panic and SSH is unreachable — you can still power-cycle the machine and view boot output via the BMC's separate processor and network interface" },
      { label: "C", text: "You want to update the OS packages without logging in as root" },
      { label: "D", text: "The BMC has a faster web UI than SSH" },
    ],
    correctAnswer: "B",
    explanation:
      "\"Out-of-band\" means independent of the main system's state. The BMC runs on its own processor, firmware, and network link — so it keeps working when the host OS is frozen or powered off. That's exactly when you need it: to power-cycle, read POST/boot messages via serial console, or pull the System Event Log.",
  },
  {
    id: "hw-m01-q07",
    question:
      "Which of the following is NOT typically hot-swappable in a standard rack-mount server?",
    choices: [
      { label: "A", text: "Front-bay NVMe drives" },
      { label: "B", text: "Redundant power supplies" },
      { label: "C", text: "Hot-swap fans" },
      { label: "D", text: "DIMM modules" },
    ],
    correctAnswer: "D",
    explanation:
      "DIMMs require the server to be powered off before being swapped — there's no safe way to replace system memory on a running machine. Drives in dedicated hot-swap bays, redundant PSUs, and fan modules in hot-swap sleds are all designed for live replacement.",
  },
  {
    id: "hw-m01-q08",
    question:
      "A technician replaces a failed PSU in a live server. The server stays up throughout. The ticket is closed. What essential step was probably missed?",
    choices: [
      { label: "A", text: "Verifying via BMC sensors that the new PSU is actually drawing power — a replacement can ship DOA, leaving the server running on a single PSU with no one noticing" },
      { label: "B", text: "Labeling the new PSU with the date" },
      { label: "C", text: "Rebooting the server to confirm the new PSU works under load" },
      { label: "D", text: "Updating the BIOS firmware" },
    ],
    correctAnswer: "A",
    explanation:
      "Closing a PSU-replacement ticket without checking BMC sensors leaves you exposed to silent single-PSU operation. A replacement PSU can be DOA, a cable can be loose, a breaker can be off. Post-swap: verify both PSUs show input voltage and are sharing load, confirm the new serial in inventory, and check the SEL for the closure event. Then close the ticket.",
  },
  {
    id: "hw-m01-q09",
    question:
      "A server has redundant dual PSUs. Both are connected to the same PDU. How much redundancy does this setup actually provide?",
    choices: [
      { label: "A", text: "Full redundancy — the server survives any single hardware fault" },
      { label: "B", text: "It protects against a single PSU failure but not against PDU or upstream power-feed failures — both PSUs share the same feed" },
      { label: "C", text: "No redundancy at all; both PSUs share the same power source, so they always fail together" },
      { label: "D", text: "Double redundancy — the server has two PSUs and one PDU" },
    ],
    correctAnswer: "B",
    explanation:
      "Dual PSUs protect against PSU failure, but if both plug into the same PDU, the PDU (or the breaker/feed behind it) is still a single point of failure. Proper redundancy requires each PSU on a separate feed (commonly labeled A and B), backed by different breakers and ideally different UPSes. This is why datacenter installs double-check the feed assignments, not just that both PSUs are plugged in.",
  },
  {
    id: "hw-m01-q10",
    question:
      "A server running a database reports increasing *correctable* ECC errors — from a few per day to about 80 per hour — on DIMM slot A2 over the past week. The server is otherwise healthy. What's the appropriate response?",
    choices: [
      { label: "A", text: "Ignore it — correctable errors are corrected by ECC, so no action is needed" },
      { label: "B", text: "Immediately shut down the server for emergency DIMM replacement" },
      { label: "C", text: "Treat it as a leading indicator of DIMM failure: identify the slot and serial via dmidecode, open an RMA, schedule a DIMM replacement in the next available maintenance window" },
      { label: "D", text: "Replace all 16 DIMMs simultaneously to be safe" },
    ],
    correctAnswer: "C",
    explanation:
      "Rising correctable errors are a classic early-failure signal — the DIMM still works, but the trend predicts a future uncorrectable error (which would crash the machine). The right move is a calm, scheduled swap: confirm the slot, open the RMA, and replace during a maintenance window before the rate climbs further. Ignoring it risks an unplanned outage; emergency action is overkill unless the rate is spiking rapidly.",
  },
];
