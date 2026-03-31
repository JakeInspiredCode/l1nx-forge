import { ForgeCard, TopicId, CardType, Difficulty, Tier } from "../types";
const today = new Date().toISOString().split("T")[0];
function c(id: string, topicId: TopicId, type: CardType, tier: Tier, difficulty: Difficulty, front: string, back: string): ForgeCard {
  return { id, topicId, type, front, back, difficulty, tier, easeFactor: 2.5, interval: 0, repetitions: 0, dueDate: today, lastReview: null };
}

// ═══════════════════════════════════════
// HARDWARE — Server Hardware & GPUs
// ═══════════════════════════════════════
export const hardware: ForgeCard[] = [
  c("hw-001","hardware","easy",1,1,"Main components of a GPU server","CPUs, RAM (512GB-2TB), GPUs (8x typical), NVMe storage, high-speed NIC, redundant PSUs, BMC/IPMI"),
  c("hw-002","hardware","easy",1,1,"NVLink","NVIDIA GPU-to-GPU interconnect. H100: 900 GB/s bidirectional. Much faster than PCIe."),
  c("hw-003","hardware","easy",1,1,"PCIe Gen 4 vs Gen 5","Gen 4: 32 GB/s (x16). Gen 5: 64 GB/s (x16). GPUs use x16, NVMe uses x4."),
  c("hw-004","hardware","easy",1,1,"ECC memory","Detects/corrects single-bit errors. Required for servers — non-ECC is unacceptable in production."),
  c("hw-005","hardware","easy",1,1,"BMC/IPMI","Remote power control, console, sensor monitoring, event logs — works even if OS is dead."),
  c("hw-006","hardware","easy",1,1,"Hot-swappable components","Drives, PSUs, fans. NOT hot-swappable: CPU, RAM, motherboard."),
  c("hw-007","hardware","easy",1,1,"DIMMs","Physical RAM sticks. Populate channels evenly for max bandwidth. DDR5 current gen, 16-256GB per stick."),
  c("hw-008","hardware","easy",1,1,"SAS vs NVMe","SAS: 12 Gbps, enterprise reliable. NVMe: 7+ GB/s, direct PCIe, much lower latency. NVMe is standard now."),
  c("hw-009","hardware","easy",1,1,"H100 GPU TDP","700W per GPU. 8x H100s = 5.6kW just GPUs. Total server can exceed 10kW."),
  c("hw-010","hardware","easy",1,1,"InfiniBand","High-bandwidth, low-latency RDMA fabric. NDR: 400 Gbps. Used for GPU cluster interconnect."),
  c("hw-011","hardware","easy",1,1,"Server failure frequency (most→least)","Disks → Memory → Fans → PSUs → NICs → GPUs → CPUs"),
  c("hw-012","hardware","easy",1,1,"RAID","Redundant disk array. Hardware RAID: dedicated controller (MegaRAID). Software: `mdadm`. BBU protects write cache."),
  c("hw-013","hardware","easy",1,1,"1U, 2U, 4U","Rack units (1.75\" each). 4U = typical GPU server. Standard rack = 42U."),
  c("hw-014","hardware","easy",1,1,"UEFI vs BIOS","UEFI: modern, GPT support (>2TB), Secure Boot, faster. BIOS: legacy, MBR, 2TB limit."),
  c("hw-015","hardware","easy",1,1,"ToR switch","Top-of-Rack — aggregates all server connections (typically 48 ports). Uplinks to spine switches."),
  // Intermediate — keep as moderate scenario walkthroughs
  c("hw-101","hardware","intermediate",2,2,"GPU 'fell off the bus' in dmesg","Check `nvidia-smi`, `lspci | grep nvidia`. Try PCIe bus reset. Power cycle via IPMI. If persists: reseat GPU or RMA."),
  c("hw-102","hardware","intermediate",2,2,"Increasing correctable memory errors","Check IPMI SEL → `edac-util -s` to identify DIMM → schedule replacement if rate exceeds threshold → `dmidecode -t memory` for serial."),
  c("hw-103","hardware","intermediate",2,2,"NVSwitch","All-to-all GPU connectivity within a server. DGX H100: 4 NVSwitches connect 8 GPUs at full NVLink bandwidth."),
  c("hw-104","hardware","intermediate",2,2,"Why is LLM inference memory-bound?","Must read all model weights per token. Few FLOPs per byte loaded. Throughput scales with memory bandwidth (H100: 3.35 TB/s), not compute."),
  c("hw-105","hardware","intermediate",2,2,"Firmware update order of caution","Test on one server first. BMC → BIOS → drive → NIC → GPU firmware. Always have rollback plan + maintenance window."),

  // Dropped-fact recovery
  c("hwf-001","hardware","easy",1,1,"PCIe stands for?","Peripheral Component Interconnect Express"),
  c("hwf-002","hardware","easy",1,1,"What does NVLink enable?","Model parallelism across GPUs within a node"),
  c("hwf-003","hardware","easy",1,1,"ECC: how many bit errors?","Corrects single-bit, detects double-bit"),
  c("hwf-004","hardware","easy",1,1,"What is BMC serial-over-LAN (SOL)?","Remote console access — see server output without physical connection"),
  c("hwf-005","hardware","easy",1,1,"Memory channels on modern Xeon?","8 channels per CPU — populate evenly for max bandwidth"),
  c("hwf-006","hardware","easy",1,1,"NVMe form factors?","U.2 (2.5\" hot-swap bay) and M.2 (small board-mount)"),
  c("hwf-007","hardware","easy",1,1,"What does GPU TDP determine?","Cooling requirements, power provisioning, and rack density limits"),
  c("hwf-008","hardware","easy",1,1,"InfiniBand HDR speed?","200 Gbps"),
  c("hwf-009","hardware","easy",1,1,"How to monitor server hardware health?","BMC sensors + SMART data"),
  c("hwf-010","hardware","easy",1,1,"Downside of hardware RAID controller?","The controller itself is a single point of failure"),
  c("hwf-011a","hardware","easy",1,1,"1U server?","Thin, limited expansion slots"),
  c("hwf-011b","hardware","easy",1,1,"2U server?","Standard — more PCIe slots and drive bays"),
  c("hwf-012","hardware","easy",1,1,"UEFI features over legacy BIOS?","Secure Boot, GPT (>2TB disks), network stack, faster boot"),
  c("hwf-013","hardware","intermediate",2,2,"PCIe bus reset command?","`echo 1 > /sys/bus/pci/devices/<ADDR>/reset`"),
  c("hwf-014","hardware","intermediate",2,2,"GPU fell off bus: what to check via BMC?","Thermal sensors — was the GPU overheating before the fault?"),
  c("hwf-015","hardware","intermediate",2,2,"What is `memtest86+`?","Memory testing tool — run during maintenance window to confirm DIMM failure"),
  c("hwf-016","hardware","intermediate",2,2,"Replace DIMMs in mirrored config?","Replace in matching pairs"),
  c("hwf-017","hardware","intermediate",2,2,"What does NVSwitch replace?","Full mesh GPU connections (impractical at 8 GPUs). Enables efficient all-reduce."),
  c("hwf-018","hardware","intermediate",2,2,"Check current NIC firmware version?","`ethtool -i eth0`"),
  c("hwf-019","hardware","intermediate",2,2,"NVSwitch firmware manager?","`nvidia-fabricmanager`"),
];

// ═══════════════════════════════════════
// NETWORKING
// ═══════════════════════════════════════
export const networking: ForgeCard[] = [
  c("net-001","networking","easy",1,1,"VLAN","Virtual LAN — logically segments a physical network. Different VLANs need a router (L3)."),
  c("net-002","networking","easy",1,1,"BGP","Border Gateway Protocol — routing between autonomous systems. Used for ECMP in leaf-spine fabrics."),
  c("net-003","networking","easy",1,1,"Layer 2 vs Layer 3","L2: MAC addresses, switches, VLANs (local). L3: IP addresses, routers, subnets (connects networks)."),
  c("net-004","networking","easy",1,1,"MTU / jumbo frames","Standard: 1500 bytes. Jumbo: 9000 bytes. Fewer packets = lower CPU overhead. Must match entire path."),
  c("net-005","networking","easy",1,1,"LACP","Link Aggregation — bonds multiple physical links for bandwidth + redundancy. Both switch and server must support."),
  c("net-006","networking","easy",1,1,"Leaf-spine topology","Every leaf (ToR) connects to every spine. Predictable latency, easy to scale, no spanning tree. ECMP distributes traffic."),
  c("net-007","networking","easy",1,1,"DHCP process","DORA: Discover → Offer → Request → Acknowledge. Lease-based. DCs often use static IPs or DHCP reservations."),
  c("net-008","networking","easy",1,1,"DNS record types","A: hostname→IPv4. AAAA: →IPv6. CNAME: alias→canonical. PTR: IP→hostname (reverse)."),
  c("net-009","networking","easy",1,1,"RDMA","Remote Direct Memory Access — read/write remote memory without CPU. Bypasses kernel. Used for GPU-to-GPU across nodes."),
  c("net-010","networking","easy",1,1,"ARP","Maps IP→MAC on local network. `ip neigh show` to view. Flush: `ip neigh flush all`. L2 only — within a subnet."),
  c("net-101","networking","intermediate",2,2,"5% packet loss — diagnose?","`mtr` for per-hop loss → `ethtool -S eth0` for NIC errors → `ip -s link` for interface stats → check switch counters → swap cable/SFP."),
  c("net-102","networking","intermediate",2,2,"ECMP in leaf-spine","Equal-Cost Multi-Path: hash-based (src+dst IP+ports) distributes flows across all spine paths. N spines = N paths."),
  c("net-103","networking","intermediate",2,2,"RoCE vs InfiniBand","RoCE: RDMA over Ethernet (cheaper, uses existing switches). IB: purpose-built, lower latency, more reliable. GPU clusters often use IB."),

  // Dropped-fact recovery
  c("netf-001","networking","easy",1,1,"VLAN use cases in DCs?","Security isolation, separating management/data/storage networks"),
  c("netf-002","networking","easy",1,1,"BGP is what type of protocol?","Path-vector"),
  c("netf-003","networking","easy",1,1,"DC networking trend: L3 everywhere?","Each rack is its own subnet — better scalability than L2 spanning tree"),
  c("netf-004","networking","easy",1,1,"LACP IEEE standard?","802.3ad"),
  c("netf-005","networking","easy",1,1,"Why no spanning tree in leaf-spine?","Every leaf connects to every spine — no loops to prevent"),
  c("netf-006","networking","easy",1,1,"DHCP: what are leases?","Time-limited IP assignments — clients must renew or lose their address"),
  c("netf-007","networking","easy",1,1,"Two ways to run RDMA?","InfiniBand (native) or RoCE (RDMA over Converged Ethernet)"),
  c("netf-008","networking","easy",1,1,"Common ARP issues?","Storms (broadcast floods), stale entries, IP conflicts"),
  c("netf-009","networking","intermediate",2,2,"RoCEv1 vs RoCEv2?","v1: L2 only (same VLAN). v2: UDP/IP (routable). v2 preferred."),
  c("netf-010","networking","intermediate",2,2,"How does ECMP prevent packet reordering?","Each flow hashes to one consistent path"),
  c("netf-011","networking","intermediate",2,2,"Check driver-level NIC errors?","`dmesg | grep eth0`"),
  c("netf-012","networking","intermediate",2,2,"Check switch port counters?","Via switch CLI (`show interface counters`)"),
];

// ═══════════════════════════════════════
// FIBER & CABLING
// ═══════════════════════════════════════
export const fiber: ForgeCard[] = [
  c("fib-001","fiber","easy",1,1,"Single-mode vs multi-mode fiber","SMF: 9μm core, long distance (km+), yellow. MMF: 50μm, short (~550m), aqua/orange. MMF used inside DCs."),
  c("fib-002","fiber","easy",1,1,"SFP / QSFP transceivers","SFP28: 25G. QSFP28: 100G (4x25). QSFP56: 200G. QSFP-DD: 400G. Must match fiber type + distance."),
  c("fib-003","fiber","easy",1,1,"MTP/MPO connector","Multi-fiber (12/24 fibers in one connector). Used for 40G/100G/400G links. Breakout cables split to LC."),
  c("fib-004","fiber","easy",1,1,"OTDR","Optical Time Domain Reflectometer — sends light pulses to locate faults, measure loss, certify cable runs."),
  c("fib-005","fiber","easy",1,1,"#1 cause of fiber signal loss","Dirty connectors. Always inspect and clean before connecting."),
  c("fib-006","fiber","easy",1,1,"LC vs SC vs MTP connectors","LC: small, latching, most common (SFP). SC: larger, push-pull, older. MTP: wide, multi-fiber (trunks)."),
  c("fib-007","fiber","easy",1,1,"Structured cabling","Organized trunks from MDA to racks, breakout panels, color-coded by network type. Avoids spaghetti."),
  c("fib-008","fiber","easy",1,1,"Fiber cleaning procedure","Inspect → dry clean (one-click cleaner) → re-inspect → wet clean if needed → re-inspect. Never touch ferrule."),
  c("fib-101","fiber","intermediate",2,2,"Intermittent CRC errors on 100G link","Check light levels (`ethtool -m`) → clean both ends FIRST → swap transceiver → swap patch cable → OTDR for trunk faults → check bend radius."),

  // Dropped-fact recovery
  c("fibf-001","fiber","easy",1,1,"Where is single-mode fiber used?","Inter-building / campus runs (long distance, km+)"),
  c("fibf-002","fiber","easy",1,1,"Fiber loss: bend radius?","Too tight a bend = light leaks out of the core"),
  c("fibf-003","fiber","easy",1,1,"Fiber loss: bad splice?","Misaligned cores = signal loss at junction"),
  c("fibf-004","fiber","easy",1,1,"Fiber loss: wrong transceiver?","Wavelength or SM/MM type mismatch with the fiber"),
  c("fibf-005","fiber","easy",1,1,"First step before cleaning fiber?","Inspect with fiber scope FIRST — identify contamination type"),
  c("fibf-006","fiber","easy",1,1,"Wet-clean fiber with what?","IPA (isopropyl alcohol), then dry clean after"),
  c("fibf-007","fiber","easy",1,1,"Unused fiber connectors?","Always cap them — prevents contamination"),
  c("fibf-008","fiber","easy",1,1,"Structured cabling: color coding?","Different colors for management, data, and storage networks"),
  c("fibf-009","fiber","intermediate",2,2,"Check fiber light levels?","`ethtool -m eth0` (or switch: `show interface transceiver`). Compare Rx power to spec."),
  c("fibf-010","fiber","intermediate",2,2,"CRC errors: verify fiber type match?","Confirm SM vs MM matches transceiver spec"),
];

// ═══════════════════════════════════════
// POWER & COOLING
// ═══════════════════════════════════════
export const powerCooling: ForgeCard[] = [
  c("pc-001","power-cooling","easy",1,1,"PDU","Power Distribution Unit — distributes power in a rack. Types: basic, metered, switched, monitored. 2 per rack for redundancy."),
  c("pc-002","power-cooling","easy",1,1,"N+1 vs 2N redundancy","N+1: one extra unit. 2N: fully duplicated paths. 2N+1: two paths + one extra. GPU DCs need at least 2N."),
  c("pc-003","power-cooling","easy",1,1,"PUE","Power Usage Effectiveness = Total Power / IT Power. 1.0 = perfect. Good: 1.2. Average: 1.5. Lower = less cooling waste."),
  c("pc-004","power-cooling","easy",1,1,"Hot aisle / cold aisle","Racks alternate direction. Cold aisle: intakes face each other (chilled air). Hot aisle: exhausts (ducted to cooling). Containment prevents mixing."),
  c("pc-005","power-cooling","easy",1,1,"UPS types for DCs","Online/double-conversion: always through inverter, best protection, DC standard. Line-interactive and standby are not for DCs."),
  c("pc-006","power-cooling","easy",1,1,"GPU rack power draw","4 GPU servers (8x H100 each) = 40-60kW per rack. Traditional rack: 5-15kW. Large GPU clusters exceed 100kW/rack."),
  c("pc-007","power-cooling","easy",1,1,"Liquid cooling types","Direct-to-chip: cold plates on GPUs (most common). Rear-door heat exchangers. Immersion: server submerged in fluid (most efficient)."),
  c("pc-101","power-cooling","intermediate",2,2,"Rack inlet temp rising — response?","One rack or many? Check CRAC/CRAH units → containment intact? → airflow obstructions? → blanking panels missing? → reduce load if critical → escalate to facilities."),

  // Dropped-fact recovery
  c("pcf-001","power-cooling","easy",1,1,"PDU types?","Basic (dumb), Metered (shows usage), Switched (remote on/off), Monitored (per-outlet metering)"),
  c("pcf-002","power-cooling","easy",1,1,"N+1 redundancy example?","3 UPS units where 2 would suffice"),
  c("pcf-003","power-cooling","easy",1,1,"2N redundancy advantage?","Can lose an entire power path and still operate"),
  c("pcf-004","power-cooling","easy",1,1,"Best-in-class PUE?","Google/Meta achieve 1.1-1.2"),
  c("pcf-005","power-cooling","easy",1,1,"UPS bridges power until what?","Generators start (typically 10-30 seconds)"),
  c("pcf-006","power-cooling","easy",1,1,"Air cooling rack power limit?","~30-40kW — GPU racks exceed this, requiring liquid cooling"),
  c("pcf-007","power-cooling","easy",1,1,"Missing blanking panels in a rack?","Hot air recirculates to cold aisle — raises inlet temps"),
];

// ═══════════════════════════════════════
// OPS & PROCESSES
// ═══════════════════════════════════════
export const opsProcesses: ForgeCard[] = [
  c("ops-001","ops-processes","easy",1,1,"5 phases of incident management","Detect → Triage → Investigate → Resolve → Post-mortem (blameless)"),
  c("ops-002","ops-processes","easy",1,1,"MTTR","Mean Time To Recovery. Lower = better. Directly correlates to cluster uptime and training job completion."),
  c("ops-003","ops-processes","easy",1,1,"Change management process","Request → Review (risk + rollback plan) → Approve → Implement (maintenance window) → Verify → Document"),
  c("ops-004","ops-processes","easy",1,1,"Runbook","Step-by-step procedure for known tasks/incidents. Enables any on-call engineer to handle issues without tribal knowledge."),
  c("ops-005","ops-processes","easy",1,1,"Key DC monitoring metrics","Server: CPU, memory, disk, GPU, temps. Network: bandwidth, errors, latency. Storage: IOPS, capacity. Facility: power, temp, humidity."),
  c("ops-006","ops-processes","easy",1,1,"P1 vs P2 vs P3 vs P4","P1: service down, immediate. P2: major degradation, 30min. P3: partial impact, 4h. P4: minor, next business day."),
  c("ops-007","ops-processes","easy",1,1,"SLI vs SLO vs SLA","SLI: measurable metric. SLO: target value. SLA: contract with consequences. SLIs measure, SLOs target, SLAs enforce."),
  c("ops-101","ops-processes","intermediate",2,2,"First 30 min on unfamiliar on-call?","Get access (dashboards, VPN, SSH) → read runbook index → check active incidents → review alert thresholds → shadow outgoing on-call → verify you can reach IPMI/switches → test one action."),

  // Dropped-fact recovery
  c("opsf-001","ops-processes","easy",1,1,"What should a runbook contain?","Title, scope, prerequisites, steps, expected outputs, rollback, escalation contacts"),
  c("opsf-002","ops-processes","easy",1,1,"Common DC monitoring tools?","Prometheus/Grafana, Nagios, Datadog, Zabbix"),
  c("opsf-003","ops-processes","easy",1,1,"Why is MTTR critical at large GPU scale?","Every minute of downtime wastes massive compute resources"),
  c("opsf-004","ops-processes","easy",1,1,"MTBF vs MTTR at scale?","MTTR matters more — failures are constant, speed of recovery is what counts"),
];

// ═══════════════════════════════════════
// TARGET COMPANY & SCALE CONTEXT
// ═══════════════════════════════════════
export const scaleContext: ForgeCard[] = [
  c("sc-001","target-context","easy",1,1,"Large-scale GPU cluster","100K+ H100 GPUs. Purpose-built facility. Trains large AI models. Built in months, not years."),
  c("sc-002","target-context","easy",1,1,"Target company mission","Pushing the frontier of AI. Values: speed, scale, first-principles thinking."),
  c("sc-003","target-context","easy",1,1,"100K GPU scale challenges","5-10x power density, InfiniBand for 100K+ GPUs, daily hardware failures at scale, liquid cooling mandatory, infrastructure changes in days."),
  c("sc-004","target-context","easy",1,1,"DC Ops Tech role","Hardware install/repair, cabling, troubleshooting, IPMI/BMC mgmt, incident response, inventory, documentation."),
  c("sc-005","target-context","easy",1,1,"Why build a purpose-built facility?","Cheap power, available real estate, fiber connectivity, speed of buildout."),
  c("sc-101","target-context","intermediate",2,2,"Expected daily failures at 100K GPU scale?","3-17 GPU failures/day (0.1-0.5% monthly rate). Plus memory, disk, NIC, cable, fan failures. Job is fast detection + replacement, not prevention. MTTR > MTBF at scale."),
];

// ═══════════════════════════════════════
// BEHAVIORAL
// ═══════════════════════════════════════
export const behavioral: ForgeCard[] = [
  c("beh-001","behavioral","easy",1,1,"STAR method","Situation → Task → Action → Result. Use 'I' not 'we'. Include metrics."),
  c("beh-002","behavioral","easy",1,1,"'Why this company?' framework","Mission alignment + scale + culture (speed, first principles) + personal fit. Be specific, not generic."),
  c("beh-003","behavioral","easy",1,1,"'Worked under pressure' — key elements","Specific scenario, stakes, YOUR actions, quantified outcome, what you learned. No vague 'we' stories."),
  c("beh-004","behavioral","easy",1,1,"'First 30 days?' framework","Week 1: learn systems. Week 2: shadow experienced techs. Week 3: document/contribute to runbooks. Week 4: ship independently."),
  c("beh-005","behavioral","easy",1,1,"Show 'ownership' in interviews","Use 'I'. Be proactive (you found the problem). Show follow-through (prevented recurrence). Own mistakes. Quantify YOUR impact."),
  c("beh-101","behavioral","intermediate",2,2,"'Process you improved' — STAR template","S: 'At [X], process for [Y] was [problem].' T: 'I was responsible for [scope], taking [metric].' A: 'I [specific actions].' R: 'Reduced [X] by [%]. Team adopted as standard.'"),

  // Dropped-fact recovery
  c("behf-001","behavioral","easy",1,1,"Weak 'Why this company?' answer?","Generic 'I love AI' — be specific about mission, scale, culture fit"),
  c("behf-002","behavioral","easy",1,1,"Red flags in 'under pressure' answers?","Vague stories, blaming others, no specific actions"),
  c("behf-003","behavioral","easy",1,1,"'First 30 days' tone?","Humble enough to learn, motivated enough to contribute quickly"),
];
