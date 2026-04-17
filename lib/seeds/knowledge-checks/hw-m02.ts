import type { MCQuestion } from "@/lib/types/campaign";

// hw-m02 "GPUs & Accelerators" — covers hw-s3 (Why GPUs Win) + hw-s4 (Interconnects)

export const HW_M02_QUESTIONS: MCQuestion[] = [
  {
    id: "hw-m02-q01",
    question:
      "At identical power budgets, a GPU might have 16,896 cores where a CPU has 64. Why is the GPU a better fit for AI training even though each of its cores is weaker?",
    choices: [
      { label: "A", text: "GPUs have a faster clock speed per core than CPUs" },
      { label: "B", text: "AI training is mostly uniform, parallel matrix math — perfect work for thousands of slower cores running in lockstep; CPUs are optimized for branchy, latency-sensitive serial work" },
      { label: "C", text: "GPUs can execute any instruction set, CPUs cannot" },
      { label: "D", text: "CPUs cannot access memory quickly enough for AI workloads" },
    ],
    correctAnswer: "B",
    explanation:
      "The workload determines the winner. Training is identical math on billions of different numbers — embarrassingly parallel. GPUs turn that into an assembly line: 16,896 weaker workers beat 64 stronger ones when every worker is doing the same thing. CPUs win when work is branchy, irregular, or latency-sensitive.",
  },
  {
    id: "hw-m02-q02",
    question:
      "An H100 has ~3.35 TB/s of HBM3 memory bandwidth; a DDR5 DIMM channel delivers ~38 GB/s. Why is the gap this extreme, and why does it matter for LLM inference?",
    choices: [
      { label: "A", text: "HBM is stacked on the same package as the GPU and has a much wider bus; LLM inference is memory-bound, so bandwidth directly governs tokens-per-second" },
      { label: "B", text: "GPUs use magnets to accelerate memory access" },
      { label: "C", text: "HBM stores data in a different format than DDR" },
      { label: "D", text: "DDR5 is artificially slow and will catch up within a year" },
    ],
    correctAnswer: "A",
    explanation:
      "HBM is co-packaged with the GPU with an extremely wide bus; a single HBM3 stack has thousands of bits of interface. Inference must read every model weight per token with few FLOPs per byte — so throughput is governed by how fast you can feed memory into the compute units. Cut that bandwidth and tokens-per-second drops proportionally.",
  },
  {
    id: "hw-m02-q03",
    question:
      "A team doubles the raw compute of their chip (2× FLOPs) while keeping memory bandwidth unchanged. LLM inference throughput improves only slightly. Why?",
    choices: [
      { label: "A", text: "Inference is memory-bound — if the GPU is already waiting on memory, more compute just waits faster. Throughput is governed by weights/second, not FLOPs" },
      { label: "B", text: "The software drivers weren't recompiled for the new chip" },
      { label: "C", text: "Inference doesn't benefit from any hardware improvement" },
      { label: "D", text: "The data center's cooling couldn't keep up" },
    ],
    correctAnswer: "A",
    explanation:
      "Adding compute to a memory-bound workload doesn't help. The rooftop analysis here: weights-per-second = memory bandwidth / weights read per token. To speed inference you need more bandwidth, smaller models (quantization), or batching that amortizes weight reads across many simultaneous tokens — not more raw FLOPs.",
  },
  {
    id: "hw-m02-q04",
    question:
      "An 8× H100 server. What's the approximate steady-state power draw just from the GPUs, and why does this matter for rack planning?",
    choices: [
      { label: "A", text: "About 2 kW — modern chips are very efficient" },
      { label: "B", text: "About 5.6 kW — 8 × 700W TDP; a full rack of these nodes forces planning around 40+ kW power density and aggressive cooling" },
      { label: "C", text: "About 700 W — the 8 GPUs share one power budget" },
      { label: "D", text: "About 20 kW — GPUs routinely exceed their TDP" },
    ],
    correctAnswer: "B",
    explanation:
      "TDP ≈ power draw, and 8 × 700W = 5.6 kW just for the GPUs. Add CPUs, DIMMs, NICs, drives, fans and a node lands around 10–12 kW. Four such nodes would exceed most traditional rack power budgets, which is why AI rack designs push to 40+ kW and often require liquid cooling.",
  },
  {
    id: "hw-m02-q05",
    question:
      "Two H100s in the same server exchange data. Over NVLink you get ~900 GB/s; over PCIe Gen 5 ×16 you get ~64 GB/s. Why is the gap so large, and why did NVIDIA build NVLink when PCIe already exists?",
    choices: [
      { label: "A", text: "NVLink is a purpose-built GPU-to-GPU bus with much wider and faster lanes than PCIe; PCIe is a general-purpose peripheral bus and is fundamentally too slow for tensor exchanges between GPUs" },
      { label: "B", text: "NVLink is simply a proprietary name for PCIe" },
      { label: "C", text: "NVLink uses light; PCIe uses electricity" },
      { label: "D", text: "PCIe Gen 5 is broken on GPU configurations" },
    ],
    correctAnswer: "A",
    explanation:
      "NVLink is a custom, high-bandwidth interconnect designed specifically for GPU-to-GPU traffic — it has many more lanes running at higher speed than PCIe and skips generic bus overhead. When you split training across GPUs, activation tensors move constantly between them; PCIe's 64 GB/s would bottleneck training. NVLink's ~14× speedup is why it exists.",
  },
  {
    id: "hw-m02-q06",
    question:
      "A freshly-provisioned 8-GPU node runs — `nvidia-smi` lists all 8 GPUs — but training throughput is ~1/10 of identical nodes in the cluster. `nvidia-smi nvlink -s` shows all NVLinks as `Inactive`. What's the most likely root cause and where do you look first?",
    choices: [
      { label: "A", text: "A GPU is defective — RMA the whole node" },
      { label: "B", text: "The nvidia-fabricmanager service isn't running or is failing to initialize the NVSwitches, so GPUs fall back to PCIe (~14× slower). Check systemctl status and journalctl -u nvidia-fabricmanager first" },
      { label: "C", text: "PCIe is broken" },
      { label: "D", text: "The BIOS is outdated" },
    ],
    correctAnswer: "B",
    explanation:
      "GPUs visible but NVLinks inactive is a fabric-manager failure pattern. Without NVSwitches up, GPUs communicate over PCIe — exactly the ~10–14× slowdown observed. Root causes: the fabric-manager service isn't enabled, the driver/NVSwitch firmware versions don't match, or an NVSwitch failed at boot (check BMC SEL). Restarting the service or aligning firmware usually resolves it.",
  },
  {
    id: "hw-m02-q07",
    question:
      "You check `lspci` for a GPU you just installed and see `LnkSta: Speed 8GT/s, Width x8`. The slot is wired for PCIe Gen 5 ×16. What happened, and why should you care even though the GPU \"works\"?",
    choices: [
      { label: "A", text: "The GPU is running at Gen 3 ×8 rather than Gen 5 ×16 — a link-training failure. It works but at a fraction of expected bandwidth; the GPU will perform much worse than its peers with no obvious error, which is a common silent-degradation bug" },
      { label: "B", text: "GPUs always negotiate down to ×8 on initialization" },
      { label: "C", text: "It's a cosmetic reporting issue; ignore it" },
      { label: "D", text: "lspci output is unreliable for GPUs" },
    ],
    correctAnswer: "A",
    explanation:
      "PCIe links negotiate speed and width on training; a bad seat, damaged pin, or dirty contact can drop a ×16 Gen 5 slot to ×8 Gen 3 — about 1/8th the bandwidth. The GPU still functions, so it passes obvious health checks but becomes a silent bottleneck. Fleet monitoring should flag any link whose negotiated state doesn't match the slot capability; reseat or swap risers as appropriate.",
  },
  {
    id: "hw-m02-q08",
    question:
      "All-reduce operations run fine within a single 8-GPU node but slow down about 10× when the job spans two nodes. What class of problem is this, and what do you investigate first?",
    choices: [
      { label: "A", text: "A GPU has failed" },
      { label: "B", text: "Inside a node, GPUs traffic on NVSwitch (~900 GB/s). Across nodes, they traffic on the InfiniBand/RoCE fabric at a fraction of that. Check fabric link speed, errors, whether RDMA is actually active, MTU, and spine ECMP balance" },
      { label: "C", text: "Kernel version mismatch" },
      { label: "D", text: "Some GPUs are busy with other workloads" },
    ],
    correctAnswer: "B",
    explanation:
      "This is a classic intra-vs-inter-node bandwidth step. NVSwitch delivers ~900 GB/s per GPU within the node; across nodes you're on the NIC fabric, which is typically 400 Gbps = 50 GB/s — already 18× slower. Investigate NIC link health (`ibstat`, `ethtool -S`), confirm RDMA (not TCP fallback), verify MTU/jumbo frames end-to-end, and check that ECMP is distributing traffic across spines rather than pinning one path.",
  },
];
