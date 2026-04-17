import type { ChapterSection } from "@/lib/types/chapter";

// ═══════════════════════════════════════════════════════════════════════════
// Operation Rack & Stack — Hardware chapters (hw-s1 .. hw-s8)
// Each mission (hw-m01..hw-m04) pulls from 2 chapter sections.
// ═══════════════════════════════════════════════════════════════════════════

// ── hw-m01 Server Anatomy ───────────────────────────────────────────────────

const hwS1: ChapterSection = {
  id: "hw-s1",
  topicId: "hardware",
  title: "Inside the Chassis",
  subtitle: "What actually lives inside a rack-mount server.",
  icon: "◧",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "You slide a **Dell PowerEdge R760** out of the rack on its rails. The top comes off with one thumbscrew. What are you looking at? Two **CPU sockets** under black shrouds, twenty-four **DIMM slots** in rows around them, a fat backplane of **NVMe drive bays** at the front, a column of **hot-swap fans** in the middle, and two **power supplies** that clip out the back. Somewhere near the edge, a tiny chip with its own Ethernet port: the **BMC**. Every piece is replaceable. Most of them you can swap without shutting the machine down.",
    },
    {
      kind: "prose",
      html:
        "A server is not a bigger desktop. It's a machine designed for one purpose: run services continuously, survive component failures, and let you operate it remotely. Everything inside is shaped by those three requirements.",
    },
    { kind: "heading", level: 3, text: "Rack units — the measuring stick" },
    {
      kind: "prose",
      html:
        "Servers are measured in **U** — rack units, each **1.75 inches** tall. A standard datacenter rack is **42U** (about 6 feet). A thin pizza-box 1U server fits 42 per rack; a 4U GPU beast only 10.",
    },
    {
      kind: "table",
      headers: ["Form", "Height", "Typical use", "Trade-off"],
      rows: [
        ["1U", "1.75\"", "Web frontends, DNS, small compute", "Few PCIe slots, fewer drive bays"],
        ["2U", "3.5\"", "General-purpose compute, databases", "More slots, more drives, standard workhorse"],
        ["4U", "7\"", "GPU servers (8× H100), storage nodes", "Dense but heavy; constrains rack density"],
      ],
    },
    {
      kind: "prose",
      html:
        "Rack density matters because **power and cooling** — not floor space — are the real limits. An 8× H100 box draws over **10 kW**. Cram four of those into a rack and you're at the limit of most datacenter PDUs.",
    },
    { kind: "heading", level: 3, text: "The core components" },
    {
      kind: "bullets",
      items: [
        "**CPUs** — usually 2 sockets (dual-socket). A single modern Xeon has 32–64 cores. The OS presents them as one pool.",
        "**DIMMs** — physical RAM sticks. Modern Xeon has **8 memory channels per CPU**, so populate slots **in matched pairs** (or octets) for full bandwidth.",
        "**NVMe / SAS drives** — storage. NVMe plugs into PCIe directly (7+ GB/s). SAS is older and slower (12 Gbps) but enterprise-hardened.",
        "**NICs** — network cards. A DC server typically has a low-speed management NIC plus one or two high-speed ports (100/200/400 GbE, or InfiniBand).",
        "**PSUs** — power supplies. Always **redundant** (2× is the minimum). Either can fail; the other keeps the server up.",
        "**BMC** — Baseboard Management Controller. A tiny embedded computer with its own Ethernet port and OS. It runs even when the main server is powered off.",
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Specific numbers to internalize",
      body:
        "**H100 GPU TDP:** 700W. **8× H100 server** drains ≥ **5.6 kW just for GPUs**, over 10 kW total. **PCIe Gen 5 ×16:** 64 GB/s. **NVLink per GPU:** 900 GB/s. **DDR5 channel bandwidth:** ~38 GB/s per channel. Round numbers are fine for intuition; exact numbers are how you catch misconfigurations.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A teammate installs 4 DIMMs into a 2-CPU server that has 16 total slots (8 per CPU). Benchmarks come back and memory bandwidth is *half* what the same hardware delivers in another rack. Nothing is broken. What happened?",
      hint: "How many memory channels did they activate?",
      answer:
        "DIMMs need to fill memory channels evenly. With 4 DIMMs spread across 16 slots, only a few of the 8 channels per CPU are populated, leaving the rest idle. The fix: move to 8 or 16 DIMMs so every channel is populated. Memory bandwidth scales with populated channels, not total capacity.",
    },
    { kind: "heading", level: 3, text: "The BMC — a server inside your server" },
    {
      kind: "prose",
      html:
        "The **BMC** (often accessed via the **IPMI** protocol) is not optional — it's how you manage a server that's powered off, frozen, or mid-kernel-panic. It has its own IP address, its own user accounts, its own firmware. Through it you can power-cycle the machine, read **sensor data** (fan RPM, inlet temp, CPU temp, voltage rails), pull the **System Event Log**, and get a **Serial-over-LAN (SOL)** console that shows you the boot screen remotely.",
    },
    {
      kind: "code",
      label: "TYPICAL BMC ACCESS",
      language: "bash",
      code:
        "ssh admin@10.0.99.12     # the management network, separate from data\n# Or the HTTPS web UI at https://10.0.99.12\nipmitool -H 10.0.99.12 -U admin -P <pw> sensor   # read sensors via IPMI",
    },
    {
      kind: "prose",
      html:
        "Datacenters put BMCs on a separate **management network** (often `10.x.99.0/24` or similar). If the data network fails, management still works. This separation is the whole point of *out-of-band* management.",
    },
    {
      kind: "knowledge-check",
      question:
        "Why is it important that the BMC runs independently of the main OS, and what specific things can you do through it that you can't do through SSH to the running server?",
      answer:
        "The BMC has its own embedded CPU, firmware, network port, and power — it keeps running even when the main server is off, hung, or mid-boot. Through the BMC you can power-cycle the machine, open a virtual console that captures BIOS/boot messages, read hardware sensors (temperatures, fan speeds, voltages), access the System Event Log for hardware faults, and mount remote ISOs for reinstalls. SSH needs the OS to be alive; the BMC doesn't.",
    },
  ],
};

const hwS2: ChapterSection = {
  id: "hw-s2",
  topicId: "hardware",
  title: "Redundancy & Failure Modes",
  subtitle: "What fails first, and how servers are built to keep running when it does.",
  icon: "▥",
  estimatedMinutes: 8,
  blocks: [
    {
      kind: "prose",
      html:
        "At fleet scale, parts fail **every day**. A datacenter with 10,000 servers can easily replace tens of drives, fans, DIMMs, and PSUs per week. The design of a server assumes failure — the goal isn't to prevent it, it's to make every failure a routine maintenance event, not an outage.",
    },
    { kind: "heading", level: 3, text: "The failure frequency ladder" },
    {
      kind: "prose",
      html:
        "Some parts fail far more often than others. After a year or two on the floor you can almost predict it:",
    },
    {
      kind: "table",
      headers: ["Component", "Relative failure rate", "Why"],
      rows: [
        ["Spinning disks", "Highest", "Mechanical — motors, heads, bearings wear out"],
        ["DIMMs", "High", "Billions of transistors; single-bit errors from cosmic rays, wear"],
        ["Fans", "Medium-high", "Moving parts; bearings and motors are lifetime-limited"],
        ["PSUs", "Medium", "Capacitors age; thermal stress"],
        ["NICs", "Low", "Solid-state but cable/connector wear shows up here"],
        ["GPUs", "Low but expensive", "Rare failures, but NVLink/VRM issues surface as 'fell off bus'"],
        ["CPUs", "Very low", "Rarely fail; when they do it's usually an install defect"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Why this ordering matters",
      body:
        "Spare inventory and on-call procedures mirror this ladder. Every rack has spare drives and fans within arm's reach. CPUs are RMA'd because a failure is rare enough that stocking spares would be wasteful.",
    },
    { kind: "heading", level: 3, text: "Hot-swap vs cold-swap" },
    {
      kind: "prose",
      html:
        "A part is **hot-swappable** if you can replace it with the server running, with no interruption to the OS. That's not decided by policy — it's decided by the chassis design (connectors, backplane, firmware). Confuse the two and you crash production.",
    },
    {
      kind: "bullets",
      items: [
        "**Hot-swap:** SAS/NVMe drives in front-loading bays, PSUs, most fan modules. Pull one, slot the replacement, move on.",
        "**Cold-swap (reboot required):** DIMMs, add-in PCIe cards (most), CPUs, motherboards. You drain the node and schedule a maintenance window.",
        "**Never-swap in the field:** CPUs that are BGA-soldered (some embedded), onboard NICs, firmware chips. These mean RMA the whole chassis.",
      ],
    },
    { kind: "heading", level: 3, text: "Redundancy patterns" },
    {
      kind: "prose",
      html:
        "Redundancy is the word for \"planned duplication so a failure is a non-event.\" Every serious server has several overlapping layers:",
    },
    {
      kind: "bullets",
      items: [
        "**Dual PSUs on separate power feeds** (A-feed and B-feed). If a PDU trips or a feed is cut, the server stays up.",
        "**Redundant fans** — if one fails the others ramp up. Replace during a normal shift.",
        "**RAID or software mirroring** for boot drives — losing one drive doesn't lose the OS.",
        "**ECC memory** — single-bit errors are corrected on the fly; double-bit errors are detected and logged before they corrupt data.",
        "**Bonded NICs (LACP)** — two network ports hashed as one; pull a cable and nothing notices.",
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "A server has two PSUs and shows both green. Your electrician is about to work on breaker A, which feeds PDU-A. Your teammate says \"we're fine, we have redundant PSUs\" and moves on. Why are you still nervous?",
      hint: "Did you verify both PSUs are actually drawing power right now?",
      answer:
        "A green LED means the PSU is *present and healthy*, not that its feed is live. If PSU B failed silently last month and nobody caught it, the server is running on PSU A alone — and pulling breaker A will kill it. Before any power work, verify both feeds via BMC sensors (`ipmitool sensor` shows input voltage per PSU) or the BMC web UI. Redundancy only helps if you confirm both sides are actually working *right now*.",
    },
    { kind: "heading", level: 3, text: "The RMA process" },
    {
      kind: "prose",
      html:
        "When a part fails, the repair path is an **RMA** — Return Merchandise Authorization — with the vendor. The basic loop is the same everywhere: identify the failed component, document the symptoms (logs, serial number, part number), open a vendor case, receive a replacement, install it, verify the fix, and return the defective part. Tracking the serials in an inventory system matters: a \"new\" part that turns out to be a previously-returned failure is a surprise nobody wants.",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "Tool kit essentials",
      body:
        "Grounded **ESD wrist strap** (static kills silicon), **Phillips and Torx** drivers, **labeled flashlight**, **laptop** for BMC console access, **fiber scope** for optical inspection, **cable tester** for copper, and a **label maker** so the next person can find what you just replaced.",
    },
    {
      kind: "knowledge-check",
      question:
        "A technician replaces a failed PSU. The server stays up throughout (thanks to the redundant PSU). What should still happen *after* the swap, even though nothing was disrupted?",
      answer:
        "Verify both PSUs are now active and drawing power via the BMC sensors — a replacement PSU can be DOA, and without checking you'd be running single-PSU again. Pull the System Event Log to confirm the replacement registered. Update the inventory system with the new serial number so RMA tracking is accurate. Close the original ticket with the root cause (capacitor failure, thermal, DOA from factory, etc.) so trend data is useful.",
    },
  ],
};

// ── hw-m02 GPUs & Accelerators ──────────────────────────────────────────────

const hwS3: ChapterSection = {
  id: "hw-s3",
  topicId: "hardware",
  title: "Why GPUs Win at AI",
  subtitle: "Parallelism, memory bandwidth, and the physics of 700-watt chips.",
  icon: "◆",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "You look at an **NVIDIA H100** chip: a single piece of silicon about the size of a credit card that turns **700 watts** of electricity into heat. It has **16,896 CUDA cores** and **80 GB** of HBM3 memory welded around it. A CPU with the same power budget would have maybe 64 cores. Why do the AI people want the 16,896 tiny ones instead of the 64 big ones?",
    },
    { kind: "heading", level: 3, text: "Different jobs, different chips" },
    {
      kind: "table",
      headers: ["", "CPU (e.g., Xeon 8490H)", "GPU (e.g., H100)"],
      rows: [
        ["Cores", "Tens (32–64)", "Thousands (16,896)"],
        ["Clock speed", "High (3–4 GHz)", "Lower (~1.8 GHz)"],
        ["Best at", "Branchy, latency-sensitive work", "Uniform, parallel math"],
        ["Memory bandwidth", "~300 GB/s", "~3.35 TB/s (HBM3)"],
        ["Power draw", "~350W", "~700W"],
      ],
    },
    {
      kind: "prose",
      html:
        "A CPU is a few skilled workers who can read emails, make decisions, switch context fast. A GPU is a **massive assembly line**: thousands of identical workers doing the same operation on different pieces of data. AI training is literally matrix multiplication at enormous scale — the same math, billions of times. Perfect assembly line work.",
    },
    { kind: "heading", level: 3, text: "Memory bandwidth is the real bottleneck" },
    {
      kind: "prose",
      html:
        "Here's a counterintuitive truth: **large-language-model inference is memory-bound, not compute-bound**. To generate one token, the GPU must read every weight in the model (tens of GB). It does only a few math operations per byte loaded. The limit is how fast you can feed weights from memory into the compute units.",
    },
    {
      kind: "prose",
      html:
        "That's why H100 uses **HBM3** — high-bandwidth memory stacked *on the same package* as the GPU, delivering **3.35 TB/s**. Regular DDR5 DIMM tops out around 38 GB/s per channel. If your GPU could only reach DDR5 speeds, throughput would drop by ~100×.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Rule of thumb: roofline analysis",
      body:
        "For a workload, compute **FLOPs required per byte of memory read**. If that ratio is *low* (like inference), the job is memory-bound and faster memory wins. If it's *high* (training, dense matmul on large batches), the job is compute-bound and more cores or lower-precision math wins.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A team reports that upgrading their rack from H100s to a chip with 2× the compute but the *same* memory bandwidth barely improved inference throughput. Why?",
      hint: "What's actually bottlenecked?",
      answer:
        "Inference is memory-bound. Adding compute doesn't help if the GPU is already waiting on memory. The bottleneck is **weights/sec**, which is governed by HBM bandwidth, not FLOPs. To speed up inference they'd need higher-bandwidth memory, a smaller model (via quantization), or smarter batching to amortize weight reads across many tokens.",
    },
    { kind: "heading", level: 3, text: "TDP and the rack math" },
    {
      kind: "prose",
      html:
        "**TDP** (Thermal Design Power) is roughly the steady-state heat output — and it equals the power draw, since nearly all the electricity ends up as heat. For H100 that's **700W per GPU**.",
    },
    {
      kind: "prose",
      html:
        "An 8× H100 server: `8 × 700W = 5.6 kW` for GPUs alone. Add CPUs (~700W), DIMMs, NICs, drives, and fan power and you land around **10–12 kW per node**. Traditional racks were designed for 5–10 kW total. Modern AI racks need **≥ 40 kW per rack** with specialized PDUs, hot-aisle containment, and increasingly **liquid cooling** because air alone can't carry heat away fast enough.",
    },
    {
      kind: "code",
      label: "GPU VISIBILITY AND HEALTH",
      language: "bash",
      code:
        "nvidia-smi                              # overview: util, memory, temp, power draw\nnvidia-smi -q -d POWER                  # per-GPU power draw over time\nnvidia-smi dmon -s pucvmet               # live monitor: power, utilization, temps\nlspci | grep -i nvidia                   # PCIe enumeration — confirms GPUs are visible",
    },
    { kind: "heading", level: 3, text: "NVLink — why PCIe isn't fast enough" },
    {
      kind: "prose",
      html:
        "When two GPUs need to exchange data (e.g., training a model split across them), the pipe between them matters as much as the pipe to memory. **PCIe Gen 5 ×16** gives you 64 GB/s. That sounds fast, but for activation tensors in a large model it's already the bottleneck.",
    },
    {
      kind: "prose",
      html:
        "**NVLink** is NVIDIA's GPU-to-GPU interconnect: **900 GB/s** per H100 — more than **14×** PCIe Gen 5. Inside a node, GPUs talk over NVLink to each other and PCIe to the CPUs. Cross-node, you need a different fabric (that's what InfiniBand and NVSwitch are for — next section).",
    },
    {
      kind: "knowledge-check",
      question:
        "You deploy a new training job. GPU utilization is stuck at 50% but NCCL traces show GPUs waiting on communication. PCIe is healthy. What's likely constraining the job, and what's the first thing you'd check?",
      answer:
        "The job is communication-bound — GPUs are waiting on other GPUs, not compute or PCIe. Inside a node, that points to NVLink health: run `nvidia-smi nvlink -s` to check NVLink state and error counters. If link speeds are degraded (e.g., running at half NVLink bandwidth because one link is down) you'll see it there. Across nodes, the fabric (InfiniBand/NVSwitch) becomes the suspect.",
    },
  ],
};

const hwS4: ChapterSection = {
  id: "hw-s4",
  topicId: "hardware",
  title: "Interconnects: PCIe, NVSwitch, InfiniBand",
  subtitle: "How thousands of GPUs pretend to be one huge GPU.",
  icon: "◎",
  estimatedMinutes: 8,
  blocks: [
    {
      kind: "prose",
      html:
        "Modern AI isn't a single GPU doing all the work — it's **hundreds or thousands** of GPUs doing fractions of it and constantly swapping intermediate results. Every exchange costs time. The interconnect is the thing that decides whether your cluster is a supercomputer or a very expensive room of disconnected toasters.",
    },
    { kind: "heading", level: 3, text: "PCIe — the universal bus" },
    {
      kind: "prose",
      html:
        "Every GPU, NIC, and NVMe drive connects to the CPU over **PCIe**. Generation and lane count both matter:",
    },
    {
      kind: "table",
      headers: ["Generation", "Per-lane bandwidth", "×16 total"],
      rows: [
        ["PCIe Gen 3", "~1 GB/s", "~16 GB/s"],
        ["PCIe Gen 4", "~2 GB/s", "~32 GB/s"],
        ["PCIe Gen 5", "~4 GB/s", "~64 GB/s"],
      ],
    },
    {
      kind: "prose",
      html:
        "GPUs use ×16; NVMe drives use ×4. If a GPU that normally runs at `Gen 5 x16` shows up as `Gen 3 x8` in `lspci`, something went wrong — a bad seat, a dirty contact, a dying riser. Performance drops off a cliff and nobody flags it because technically the GPU still works.",
    },
    {
      kind: "code",
      label: "CONFIRM LINK WIDTH AND SPEED",
      language: "bash",
      code:
        "lspci -vvv -s <BDF> | grep -E 'LnkSta|LnkCap'\n# LnkCap: what the slot is capable of\n# LnkSta: what it's actually negotiated right now",
    },
    { kind: "heading", level: 3, text: "NVSwitch — full-mesh inside a node" },
    {
      kind: "prose",
      html:
        "Eight GPUs in one chassis all need to talk to each other. A direct mesh between them would need 28 NVLink cables — messy, impossible at full bandwidth. **NVSwitch** is a crossbar that connects all 8 GPUs at full NVLink speed simultaneously. In an NVIDIA HGX/DGX H100 node there are **4 NVSwitch chips** on the board, together providing all-to-all GPU bandwidth.",
    },
    {
      kind: "prose",
      html:
        "The control plane for NVSwitches is `nvidia-fabricmanager`, a systemd service. If fabric manager fails to start, the GPUs are visible but training jobs see no NVSwitch topology and fall back to PCIe — tanking performance. It's a surprisingly common first-day-in-production bug.",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "When GPUs are visible but NVLink is broken",
      body:
        "`nvidia-smi nvlink -s` shows NVLink state per GPU. `systemctl status nvidia-fabricmanager` shows the fabric service. `journalctl -u nvidia-fabricmanager` shows why it failed. Missing or mismatched NVSwitch firmware vs driver is the classic cause.",
    },
    { kind: "heading", level: 3, text: "InfiniBand — across nodes" },
    {
      kind: "prose",
      html:
        "NVSwitch connects GPUs *inside* a node. To connect GPUs *across* nodes — say, one rack to another — you need a separate fabric. The two dominant options in AI clusters:",
    },
    {
      kind: "bullets",
      items: [
        "**InfiniBand (IB)** — purpose-built for HPC. **NDR (400 Gbps)** is current generation. Very low latency (~1 μs), hardware-accelerated **RDMA**. Different switches, cables, and NICs than Ethernet.",
        "**RoCE (RDMA over Converged Ethernet)** — RDMA on top of standard 100/200/400 GbE. Reuses your Ethernet infrastructure. Slightly higher latency than IB, but cheaper and more operationally familiar.",
      ],
    },
    {
      kind: "prose",
      html:
        "**RDMA** is the key trick: one node's NIC writes directly into another node's memory without either CPU getting involved. Kernel bypass, zero-copy, lower latency. Without RDMA, all-reduce operations during distributed training would collapse under CPU overhead.",
    },
    {
      kind: "think-about-it",
      scenario:
        "Benchmarks show all-reduce operations run fine within a single node but slow down ~10× when the job spans two nodes. Link speeds show normal. What should you investigate first?",
      hint: "What carries GPU-to-GPU traffic *across* nodes?",
      answer:
        "Inside a node, traffic goes over NVSwitch at 900 GB/s. Across nodes, it takes the NIC fabric — InfiniBand or RoCE — which is typically 400 Gbps = 50 GB/s, already 18× slower. Check the NIC counters (`ibstat`, `ibv_devinfo`, `ethtool -S`) for link errors, drops, or congestion. Also confirm the fabric is using RDMA (not falling back to TCP/IP sockets), that MTU/jumbo frames are configured end-to-end, and that ECMP is actually distributing traffic across spine switches rather than pinning one path.",
    },
    { kind: "heading", level: 3, text: "Firmware versions must line up" },
    {
      kind: "prose",
      html:
        "GPUs, NVSwitches, InfiniBand NICs, and switches all run firmware that is **matched in pairs** — a driver expects a specific firmware range, and vice versa. When an upgrade is rolled out, do it in a careful order: test one node → BMC firmware → BIOS → NIC → GPU/NVSwitch. Always have a rollback plan, always do it during a maintenance window, and always keep a golden known-good firmware set in reserve.",
    },
    {
      kind: "knowledge-check",
      question:
        "A freshly-provisioned GPU node appears in `nvidia-smi` but `nvidia-smi nvlink -s` shows all NVLinks as `Inactive`. Training jobs run, but throughput is ~1/10 of the neighboring (identical) nodes. What's the most likely cause, and where would you look first?",
      answer:
        "NVSwitch fabric isn't initialized. The GPUs fall back to PCIe for inter-GPU communication, which is about 14× slower than NVLink — matching the ~10× throughput hit. First check `systemctl status nvidia-fabricmanager` and its journal (`journalctl -u nvidia-fabricmanager -b`). Common root causes: fabric-manager service not enabled, a version mismatch between the driver and NVSwitch firmware, or an NVSwitch training failure at boot that's logged in the BMC SEL. Restart the service, confirm versions match, or reseat/power-cycle if the NVSwitch is in a bad state.",
    },
  ],
};

// ── hw-m03 Memory & Storage ─────────────────────────────────────────────────

const hwS5: ChapterSection = {
  id: "hw-s5",
  topicId: "hardware",
  title: "DIMMs, ECC, and Memory Channels",
  subtitle: "Why the layout of your RAM matters more than the total GB.",
  icon: "▤",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "A technician installs **512 GB of RAM** in your new node — a generous amount. A week later, a benchmark shows the server hitting only **half** the expected memory bandwidth of its sibling servers. Nothing is broken. Everything works. The RAM is fine.",
    },
    {
      kind: "prose",
      html:
        "The problem: the 512 GB was eight 64 GB sticks, all installed on one CPU's slots. The other CPU sits with empty slots. Memory bandwidth is not about capacity — it's about **how many memory channels you're actually using**.",
    },
    { kind: "heading", level: 3, text: "DIMMs and channels" },
    {
      kind: "prose",
      html:
        "A **DIMM** is a physical RAM stick — usually DDR5 in modern servers. Each CPU has a fixed number of **memory channels** connecting it to its DIMM slots. On current Xeon: **8 channels per CPU**, with 1–2 DIMMs per channel. Each channel is an independent pipe to memory, running in parallel.",
    },
    {
      kind: "bullets",
      items: [
        "**Bandwidth scales with populated channels**, not GB installed. Populate 4 of 8 channels: you get half the bandwidth the CPU is capable of.",
        "**Populate channels evenly across both CPUs**. Dual-socket servers have **NUMA** — each CPU has its own local memory. Unbalanced population creates hotspots.",
        "**Match DIMM size, speed, and rank** within a channel. Mismatched sticks force the controller to run the whole channel at the slowest common setting.",
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The rule most shops follow",
      body:
        "Fill all DIMM slots, all CPUs. If cost forbids that, fill in octets (8 DIMMs at a time per CPU), populating one full row of channels first. Never install an odd number like 4 or 12 — you're leaving bandwidth on the table.",
    },
    { kind: "heading", level: 3, text: "ECC: the invisible safety net" },
    {
      kind: "prose",
      html:
        "Computer memory gets hit by cosmic rays. Seriously. A high-energy particle can flip a single bit in a DRAM cell. On a desktop you barely notice; in a datacenter with thousands of servers running for months, it's constant. **ECC (Error-Correcting Code) memory** detects and corrects these flips before they corrupt your data.",
    },
    {
      kind: "table",
      headers: ["Error type", "What ECC does"],
      rows: [
        ["Single-bit", "Corrects on the fly; the program never sees it. Logged in the Machine Check Architecture log."],
        ["Double-bit", "Detects but cannot correct. Typically crashes the offending process or panics the kernel — deliberately, to avoid silent corruption."],
        ["Address errors", "ECC can detect some forms depending on mode; not all."],
      ],
    },
    {
      kind: "prose",
      html:
        "**Non-ECC memory has no place in a production server.** A flipped bit in your filesystem metadata or database page can silently corrupt data and you'd never know until hours or days later when something breaks.",
    },
    { kind: "heading", level: 3, text: "Reading the error logs" },
    {
      kind: "code",
      label: "CORRECTABLE + UNCORRECTABLE ERROR TOOLS",
      language: "bash",
      code:
        "sudo edac-util -s               # summary of CE (correctable) + UE (uncorrectable) per DIMM\nsudo dmidecode -t memory | head     # which slot is which, serial numbers\nsudo ras-mc-ctl --errors            # detailed error history (EDAC / RAS)",
    },
    {
      kind: "prose",
      html:
        "A steady trickle of correctable errors on one DIMM is **not fine**. It's a leading indicator that the DIMM is degrading — even though the system is still working correctly. Every shop has a threshold (often \"> N CEs per hour on one DIMM\") at which they schedule a DIMM replacement during the next maintenance window.",
    },
    {
      kind: "think-about-it",
      scenario:
        "Your monitoring alerts: correctable ECC errors on DIMM slot A2 jumped from ~3/day to ~80/hour over the past two days. The server is running a critical database. What do you do *right now*, and what do you do *soon*?",
      hint: "Correctable means the data is still valid — for now.",
      answer:
        "Right now: don't panic. Correctable errors are corrected — no data is lost yet. Confirm the slot and serial number via `dmidecode -t memory`, open an RMA ticket, and schedule a maintenance window in the next few days. Soon: replace the DIMM before the rate rises further or a double-bit error occurs (which *would* crash the machine). The trendline — 3/day → 80/hour — is a classic early-failure signal; waiting risks turning a scheduled swap into an unscheduled outage.",
    },
    {
      kind: "knowledge-check",
      question:
        "Your team installs 4 DIMMs in a dual-socket server that has 16 total slots. The system boots and reports the full installed capacity. Why should you still push back on calling the build complete?",
      answer:
        "Capacity and bandwidth are different things. With 4 DIMMs across 16 slots, you're populating at most 4 of the 16 memory channels (2 per CPU out of 8), so memory bandwidth will be about a quarter of what this server could deliver. That's a permanent, silent performance loss. Either fill evenly across channels (ideally 8 or 16 DIMMs, matched), or expect the team running workloads on this node to hit memory-bandwidth bottlenecks that didn't exist on other racks.",
    },
  ],
};

const hwS6: ChapterSection = {
  id: "hw-s6",
  topicId: "hardware",
  title: "NVMe, SAS, RAID, and SMART",
  subtitle: "Drives die more often than anything else. How we catch it.",
  icon: "◩",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "A drive fails. One of thousands in the datacenter, on an ordinary afternoon. The OS logs the failure. RAID picks up the slack. A ticket opens, a replacement is on the shelf, the tech walks over and swaps it. By evening the RAID is rebuilding. This is what routine failure looks like — and it only works if every layer is set up to expect it.",
    },
    { kind: "heading", level: 3, text: "NVMe vs SAS — the two drive worlds" },
    {
      kind: "table",
      headers: ["", "NVMe", "SAS"],
      rows: [
        ["Bus", "PCIe (direct to CPU)", "Dedicated SAS controller"],
        ["Per-drive bandwidth", "7+ GB/s (Gen 4)", "~1.5 GB/s (12 Gbps)"],
        ["Latency", "Microseconds", "Sub-millisecond"],
        ["Form factors", "U.2 (2.5\" hot-swap), M.2 (board-mount)", "2.5\" SFF, 3.5\" LFF"],
        ["Typical role", "Primary storage, databases, caches", "Bulk capacity, legacy arrays"],
      ],
    },
    {
      kind: "prose",
      html:
        "Most new servers are NVMe-first for performance and SAS/SATA only where you need huge cheap capacity. M.2 sticks (smaller, board-mounted) are commonly used as the **boot drive** — two of them, mirrored — because they don't need to be hot-swappable.",
    },
    { kind: "heading", level: 3, text: "RAID: protecting the data" },
    {
      kind: "prose",
      html:
        "**RAID** (Redundant Array of Independent Disks) combines multiple physical drives into one logical volume, with redundancy so one failure doesn't lose data. The common levels you'll see on servers:",
    },
    {
      kind: "bullets",
      items: [
        "**RAID 1 (mirror)** — 2 drives, identical copies. Usable capacity = 1 drive. Tolerates any 1 drive failing. Common for boot drives.",
        "**RAID 5** — N drives, distributed parity. Usable = N-1. Tolerates 1 drive failing. Rebuild stresses remaining drives.",
        "**RAID 6** — like RAID 5 but two parity blocks. Usable = N-2. Tolerates 2 drives failing. Safer for large arrays.",
        "**RAID 10** — stripe across mirrored pairs. Fast and safe, but costs half your capacity.",
        "**JBOD / no-RAID** — the OS or application handles redundancy (ZFS, Ceph, erasure coding). Increasingly common at hyperscale.",
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "RAID is not backup",
      body:
        "RAID protects you from one or two *drive* failures. It does not protect you from accidental `rm`, a filesystem corruption, a malicious actor, or a controller that silently corrupts data. **Always have a separate backup.**",
    },
    { kind: "heading", level: 3, text: "Hardware RAID vs software RAID" },
    {
      kind: "prose",
      html:
        "Hardware RAID uses a dedicated controller card (classic: **MegaRAID**) with its own cache and a battery-backed unit (**BBU**) to protect that cache during power loss. Fast, but the controller itself becomes a single point of failure — lose it without a compatible spare on hand and the array may need to be rebuilt from scratch. Software RAID (`mdadm` on Linux) uses the CPU — slightly more overhead, but portable and transparent. Modern distributed storage (Ceph, ZFS) often treats individual drives directly with no RAID underneath.",
    },
    { kind: "heading", level: 3, text: "SMART — the drive's self-report" },
    {
      kind: "prose",
      html:
        "Modern drives track their own health using **SMART** (Self-Monitoring, Analysis and Reporting Technology). Temperature, read errors, reallocated sectors, wear leveling on SSDs, NAND endurance — all surfaced by the drive itself. Good monitoring watches trends, not absolute thresholds.",
    },
    {
      kind: "code",
      label: "SMART QUERIES",
      language: "bash",
      code:
        "sudo smartctl -a /dev/sda                # full SMART report\nsudo smartctl -H /dev/sda                # overall PASSED/FAILED\nsudo smartctl -a /dev/nvme0 -d nvme       # NVMe needs -d nvme\nsudo smartctl -t short /dev/sda           # run a quick self-test",
    },
    {
      kind: "prose",
      html:
        "The attributes that actually predict failure: **reallocated sector count**, **pending sector count**, **offline uncorrectable**, **media wearout indicator** (on SSDs). A drive that passes the overall self-test but has 500 reallocated sectors is on its way out.",
    },
    {
      kind: "think-about-it",
      scenario:
        "RAID 5 across 10 drives. One fails. The rebuild starts automatically. 14 hours in, a second drive fails. What have you probably just lost, and why did this happen?",
      hint: "Rebuild reads every surviving drive at full throttle.",
      answer:
        "You've likely lost the array. RAID 5 tolerates only one failure; the second failure during rebuild means data loss on any stripe that can't be reconstructed. The *reason* it happens is that a rebuild forces every surviving drive to do sustained full-speed reads for hours — exactly the conditions that expose latent defects in aging drives that have been sitting at low load. That's why **RAID 6 or mirroring is preferred for large arrays** today, and why rebuild time is a design concern, not just a nuisance.",
    },
    {
      kind: "knowledge-check",
      question:
        "A server's `smartctl -H` reports `PASSED` for every drive, yet the team is reporting intermittent read errors on one filesystem. What else should you check, and why might SMART have missed the issue?",
      answer:
        "SMART's overall PASS/FAIL is a coarse summary — it can still report PASSED while specific attributes are trending toward failure. Check the detailed output (`smartctl -a`) for rising **reallocated sectors**, **pending sectors**, **offline uncorrectable**, and **media wearout** counters. Cross-reference with kernel logs (`dmesg | grep -i error`), filesystem errors (`journalctl -k`), and if you're on hardware RAID, the controller logs (`MegaCli` / `storcli`). The drive's own judgment is useful but not authoritative.",
    },
  ],
};

// ── hw-m04 BIOS & Firmware ──────────────────────────────────────────────────

const hwS7: ChapterSection = {
  id: "hw-s7",
  topicId: "hardware",
  title: "UEFI, POST, and the Boot Order",
  subtitle: "Everything that happens before the OS starts.",
  icon: "⟳",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "You hit the power button. A **long** time passes — maybe two minutes — with fans spinning and lights blinking but no output. Somewhere in the dark the server is running **POST** (Power-On Self-Test), initializing memory, scanning PCIe devices, checking firmware signatures, and deciding what to boot. If you understand this window, you can diagnose a huge class of \"server won't come up\" issues.",
    },
    { kind: "heading", level: 3, text: "POST — the machine checks itself" },
    {
      kind: "prose",
      html:
        "When power hits the board, the CPU jumps to a **reset vector** — a fixed address in firmware. That firmware runs a sequence that checks the hardware:",
    },
    {
      kind: "bullets",
      items: [
        "CPU microcode initializes; basic caches come online.",
        "Memory training — the firmware negotiates timing with every DIMM. This is the slow step; on a server with many DIMMs it can take a minute or more.",
        "PCIe enumeration — every slot is scanned; each device's configuration space is read.",
        "Storage probe — drives report themselves; the firmware builds a list of bootable devices.",
        "Health checks — each subsystem reports its state; failures are logged to the **BMC System Event Log (SEL)**.",
      ],
    },
    {
      kind: "prose",
      html:
        "When POST finishes cleanly, control is handed to the **boot loader** on the configured boot device. When it fails, you get a code on the board's diagnostic LEDs, a specific beep code, or a line in the BMC SEL — and boot stops before an OS ever runs.",
    },
    { kind: "heading", level: 3, text: "UEFI vs legacy BIOS" },
    {
      kind: "prose",
      html:
        "The firmware that runs POST and hands off to the OS has two generations. You will rarely touch legacy BIOS on modern servers, but you need to recognize both.",
    },
    {
      kind: "table",
      headers: ["", "Legacy BIOS", "UEFI"],
      rows: [
        ["Partition table", "MBR (max 2 TB disks)", "GPT (practically unlimited)"],
        ["Boot format", "Master Boot Record → stage 1 loader", "EFI System Partition → `.efi` file"],
        ["Secure Boot", "Not supported", "Supported (signed boot chain)"],
        ["Boot speed", "Slow; text-mode only", "Faster; can have a UI"],
        ["Extensibility", "Very limited", "Network stack, scripting, rich drivers"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Secure Boot",
      body:
        "UEFI can verify a cryptographic signature on the bootloader before executing it. That's **Secure Boot** — it defends against pre-OS rootkits. It also complicates things: custom kernels, out-of-tree drivers, and some Linux distributions need extra work (signed modules, MOK enrollment) when Secure Boot is enabled.",
    },
    { kind: "heading", level: 3, text: "The boot order" },
    {
      kind: "prose",
      html:
        "UEFI maintains a **boot order list** — an ordered list of bootable targets. The firmware tries each in turn until one succeeds. On a server the typical order is something like:",
    },
    {
      kind: "bullets",
      items: [
        "**Boot from NVMe 0** (the mirrored boot drives)",
        "**Boot from NVMe 1** (the other mirror)",
        "**PXE over NIC 0** (network boot, used for re-imaging)",
        "**PXE over NIC 1** (fallback)",
        "**USB** (last resort, physical access needed)",
      ],
    },
    {
      kind: "prose",
      html:
        "**PXE boot** is how datacenters re-image servers at scale. The server asks the network for a boot image, downloads it, and installs the OS without anyone touching the hardware. If your boot order is wrong — or a failed drive is still listed first — the server can get stuck trying unreachable entries and eventually give up.",
    },
    {
      kind: "code",
      label: "INSPECT AND MODIFY UEFI BOOT ORDER FROM LINUX",
      language: "bash",
      code:
        "sudo efibootmgr -v            # list all UEFI boot entries and current order\nsudo efibootmgr -o 0001,0002,0003  # set order to entries 1, 2, 3\nsudo efibootmgr -n 0002           # boot ONCE from entry 2, then revert",
    },
    {
      kind: "think-about-it",
      scenario:
        "A server reboots after maintenance and comes up in an emergency shell instead of booting normally. The BMC SEL shows no hardware errors. Everything was fine before the firmware update. What's your theory?",
      hint: "What lives in firmware that knows where the OS is?",
      answer:
        "A BIOS/UEFI firmware update can reset or reorder the **UEFI boot entries**. The server is finding *a* bootable target (maybe a recovery/rescue entry) but not the usual root filesystem boot entry. Log in via BMC console, use `efibootmgr` to inspect the boot order, and restore the correct entry for the installed OS. For this reason, many shops snapshot `efibootmgr -v` output before firmware upgrades so they have a known-good reference.",
    },
    {
      kind: "knowledge-check",
      question:
        "A node you provisioned yesterday comes up fine from power-off but fails to come back after a warm reboot — it loops POST and never reaches the boot loader. The BMC SEL shows repeated entries for \"memory training failed on DIMM A1.\" What's likely happening, and what do you check first?",
      answer:
        "Warm reboots re-run memory training without a full power cycle; a borderline DIMM may pass training from cold but fail the warm-reboot path. The BMC SEL is pointing straight at DIMM A1. First: drain traffic off the node. Then schedule a window to reseat DIMM A1 (sometimes it's a contact issue), and have a replacement DIMM of identical spec ready. Also check that the BIOS has the recommended memory training settings and that firmware is up to date — bad memory training firmware has shipped more than once and is a common fix by firmware upgrade alone.",
    },
  ],
};

const hwS8: ChapterSection = {
  id: "hw-s8",
  topicId: "hardware",
  title: "BMC, IPMI, and Firmware Discipline",
  subtitle: "Remote management, and how you upgrade firmware without burning down the fleet.",
  icon: "✦",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "It's 3 AM. A server you need is unreachable over SSH. You're **500 miles from the datacenter**. The Slack channel is lit up. What saves you is the **BMC** — the out-of-band controller we introduced in chapter 1 — and the fact that somebody configured it right six months ago.",
    },
    { kind: "heading", level: 3, text: "What the BMC actually does" },
    {
      kind: "bullets",
      items: [
        "**Power control** — on, off, hard reset, graceful shutdown. Works when the OS is frozen.",
        "**Console** — **Serial-over-LAN (SOL)** or a KVM-over-IP video stream showing BIOS screens and the OS login prompt as if you were at the physical console.",
        "**Sensor data** — temperatures, fan RPM, voltage rails, PSU input/output, inlet and outlet air.",
        "**System Event Log (SEL)** — historical log of hardware events: DIMM errors, thermal trips, PSU failures, POST failures.",
        "**Virtual media** — mount an ISO from your laptop to reinstall an OS remotely.",
        "**Firmware management** — upload new BMC and BIOS firmware without going near the server.",
      ],
    },
    {
      kind: "prose",
      html:
        "Because it's a separate computer on a separate network, the BMC is **also a security surface**. Treat its management network like production: strong credentials, rotated keys, no exposure to the internet, audit logs. A compromised BMC can brick or take over the main server.",
    },
    { kind: "heading", level: 3, text: "IPMI — the protocol" },
    {
      kind: "prose",
      html:
        "**IPMI** (Intelligent Platform Management Interface) is the long-standing protocol for talking to BMCs. Vendors now offer HTTPS-based **Redfish** APIs as a modern replacement, but `ipmitool` is still universal in operational scripts:",
    },
    {
      kind: "code",
      label: "COMMON IPMITOOL COMMANDS",
      language: "bash",
      code:
        "ipmitool -H bmc.example.com -U admin -P <pw> power status\nipmitool -H bmc.example.com -U admin -P <pw> power cycle\nipmitool -H bmc.example.com -U admin -P <pw> sensor\nipmitool -H bmc.example.com -U admin -P <pw> sel list      # recent hardware events\nipmitool -H bmc.example.com -U admin -P <pw> sol activate   # attach to serial console",
    },
    {
      kind: "prose",
      html:
        "`sol activate` is the one to memorize. It drops you into the server's serial console as if you'd plugged in a physical cable — you'll see kernel boot messages, login prompts, even the GRUB menu. To exit, type `~.` (tilde + period).",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Never expose BMCs to the internet",
      body:
        "BMCs run small embedded OSes, often with slow firmware update cadences. Historical vulnerabilities include default credentials, authentication bypasses, and full remote takeover. They belong on an isolated **management VLAN** with strict ACLs.",
    },
    { kind: "heading", level: 3, text: "Firmware — the careful upgrade order" },
    {
      kind: "prose",
      html:
        "Every component has firmware: BMC, BIOS/UEFI, NICs, drives, RAID controllers, GPUs, NVSwitches. Upgrading firmware can fix bugs — and can introduce new ones, or subtly change behavior. The discipline that separates calm shops from chaotic ones is **order, validation, and rollback**.",
    },
    {
      kind: "bullets",
      items: [
        "**Test on one node first.** Always. Every time. Never flash the fleet without a pilot.",
        "**Upgrade in a known order.** A common sequence: **BMC → BIOS → drive firmware → NIC firmware → GPU/NVSwitch firmware**. Each step is verified before the next.",
        "**Confirm after each step.** `dmidecode -s bios-version`, `ethtool -i eth0`, `nvidia-smi -q`, controller vendor tools. Record versions before and after.",
        "**Have a rollback path.** Know which firmware versions are known-good. Keep the previous image. Test the rollback procedure at least once.",
        "**Do it in a maintenance window.** Firmware flashes typically require reboots; the node is out of service for the duration.",
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "Your team flashes BIOS firmware on 50 nodes in parallel to save time. Everything goes fine on 48. Two nodes hang partway through the flash and are now unresponsive — power LEDs on, BMC responds, but the main server won't POST. What's the situation, and what's the recovery path?",
      hint: "A partially-flashed BIOS leaves the chip in an unknown state.",
      answer:
        "A failed BIOS flash can leave the firmware chip corrupted and the server unable to POST. Many enterprise boards have a **dual BIOS** or a **BMC-based firmware recovery** path: the BMC can re-flash the BIOS chip even when the main system is dead. Consult the vendor's recovery procedure (Dell iDRAC lifecycle controller, HPE iLO repair firmware, Supermicro SUM tool, etc.). The real lesson: **never flash 50 nodes in parallel**. Stagger (e.g., 10% at a time, observe, continue) so a bad firmware batch doesn't take out your whole rack at once. Two bad nodes in a controlled rollout is a minor incident; forty-eight would have been a catastrophe.",
    },
    {
      kind: "knowledge-check",
      question:
        "A node is completely unresponsive — no SSH, no ping to the data IP. The BMC responds normally. From the BMC console (SOL), you see the server is stuck on a kernel panic message about a filesystem error. Walk through the recovery path, using only what the BMC gives you.",
      answer:
        "Capture the panic text first — that's your diagnostic evidence. Then: `ipmitool sel list` to check for correlated hardware events (memory, disk, thermal) that may have caused the panic. If clean, power-cycle via `ipmitool power reset`. If the system panics again at the same step, mount a rescue ISO through the BMC's virtual media, boot into rescue mode, run `fsck` on the affected filesystem, and investigate the root cause (bad drive? hung RAID rebuild? full disk?). If the BMC also supports it, examine boot logs via serial console. Throughout, you're working without physical access — everything is over the management network, which is exactly what the BMC exists for.",
    },
  ],
};

// ── Registry ────────────────────────────────────────────────────────────────

export const HARDWARE_CHAPTERS: ChapterSection[] = [
  hwS1,
  hwS2,
  hwS3,
  hwS4,
  hwS5,
  hwS6,
  hwS7,
  hwS8,
];
