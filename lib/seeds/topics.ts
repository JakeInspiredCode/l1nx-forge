import { ForgeCard, TopicId, CardType, Difficulty, Tier } from "../types";
const today = new Date().toISOString().split("T")[0];
function c(id: string, topicId: TopicId, type: CardType, tier: Tier, difficulty: Difficulty, front: string, back: string, sortOrder?: number): ForgeCard {
  return { id, topicId, type, front, back, difficulty, tier, sortOrder, easeFactor: 2.5, interval: 0, repetitions: 0, dueDate: today, lastReview: null };
}

// ═══════════════════════════════════════
// HARDWARE — Server Hardware & GPUs
// ═══════════════════════════════════════
export const hardware: ForgeCard[] = [
  // Tier 1 — ordered: what a server is → rack units → components → interconnects → management → failure modes → RMA
  c("hw-013","hardware","easy",1,1,"1U, 2U, 4U","Rack units (1.75\" each). 4U = typical GPU server. Standard rack = 42U.",10),
  c("hw-001","hardware","easy",1,1,"Main components of a GPU server","CPUs, RAM (512GB-2TB), GPUs (8x typical), NVMe storage, high-speed NIC, redundant PSUs, BMC/IPMI",20),
  c("hw-007","hardware","easy",1,1,"DIMMs","Physical RAM sticks. Populate channels evenly for max bandwidth. DDR5 current gen, 16-256GB per stick.",30),
  c("hw-004","hardware","easy",1,1,"ECC memory","Detects/corrects single-bit errors. Required for servers — non-ECC is unacceptable in production.",40),
  c("hw-008","hardware","easy",1,1,"SAS vs NVMe","SAS: 12 Gbps, enterprise reliable. NVMe: 7+ GB/s, direct PCIe, much lower latency. NVMe is standard now.",50),
  c("hw-003","hardware","easy",1,1,"PCIe Gen 4 vs Gen 5","Gen 4: 32 GB/s (x16). Gen 5: 64 GB/s (x16). GPUs use x16, NVMe uses x4.",60),
  c("hw-002","hardware","easy",1,1,"NVLink","NVIDIA GPU-to-GPU interconnect. H100: 900 GB/s bidirectional. Much faster than PCIe.",70),
  c("hw-010","hardware","easy",1,1,"InfiniBand","High-bandwidth, low-latency RDMA fabric. NDR: 400 Gbps. Used for GPU cluster interconnect.",80),
  c("hw-015","hardware","easy",1,1,"ToR switch","Top-of-Rack — aggregates all server connections (typically 48 ports). Uplinks to spine switches.",90),
  c("hw-005","hardware","easy",1,1,"BMC/IPMI","Remote power control, console, sensor monitoring, event logs — works even if OS is dead.",100),
  c("hw-014","hardware","easy",1,1,"UEFI vs BIOS","UEFI: modern, GPT support (>2TB), Secure Boot, faster. BIOS: legacy, MBR, 2TB limit.",110),
  c("hw-006","hardware","easy",1,1,"Hot-swappable components","Drives, PSUs, fans. NOT hot-swappable: CPU, RAM, motherboard.",120),
  c("hw-011","hardware","easy",1,1,"Server failure frequency (most→least)","Disks → Memory → Fans → PSUs → NICs → GPUs → CPUs",130),
  c("hw-012","hardware","easy",1,1,"RAID","Redundant disk array. Hardware RAID: dedicated controller (MegaRAID). Software: `mdadm`. BBU protects write cache.",140),
  c("hw-009","hardware","easy",1,1,"H100 GPU TDP","700W per GPU. 8x H100s = 5.6kW just GPUs. Total server can exceed 10kW.",150),
  // Dropped-fact Tier 1
  c("hwf-001","hardware","easy",1,1,"PCIe stands for?","Peripheral Component Interconnect Express",160),
  c("hwf-002","hardware","easy",1,1,"What does NVLink enable?","Model parallelism across GPUs within a node",170),
  c("hwf-003","hardware","easy",1,1,"ECC: how many bit errors?","Corrects single-bit, detects double-bit",180),
  c("hwf-004","hardware","easy",1,1,"What is BMC serial-over-LAN (SOL)?","Remote console access — see server output without physical connection",190),
  c("hwf-005","hardware","easy",1,1,"Memory channels on modern Xeon?","8 channels per CPU — populate evenly for max bandwidth",200),
  c("hwf-006","hardware","easy",1,1,"NVMe form factors?","U.2 (2.5\" hot-swap bay) and M.2 (small board-mount)",210),
  c("hwf-007","hardware","easy",1,1,"What does GPU TDP determine?","Cooling requirements, power provisioning, and rack density limits",220),
  c("hwf-008","hardware","easy",1,1,"InfiniBand HDR speed?","200 Gbps",230),
  c("hwf-009","hardware","easy",1,1,"How to monitor server hardware health?","BMC sensors + SMART data",240),
  c("hwf-010","hardware","easy",1,1,"Downside of hardware RAID controller?","The controller itself is a single point of failure",250),
  c("hwf-011a","hardware","easy",1,1,"1U server?","Thin, limited expansion slots",260),
  c("hwf-011b","hardware","easy",1,1,"2U server?","Standard — more PCIe slots and drive bays",270),
  c("hwf-012","hardware","easy",1,1,"UEFI features over legacy BIOS?","Secure Boot, GPT (>2TB disks), network stack, faster boot",280),
  // New Tier 1 gap-fill
  c("hw-016","hardware","easy",1,1,"Common DC cable types","Power (C13/C14, C19/C20), Cat6/Cat6a (Ethernet), fiber patch cables, DAC (Direct Attach Copper) for short runs.",290),
  c("hw-017","hardware","easy",1,1,"RMA process basics","Identify failed component → document symptoms → open ticket with vendor → receive replacement → swap → verify → return defective part.",300),
  c("hw-018","hardware","easy",1,1,"Server labeling and asset tagging","Every server gets a unique asset tag (barcode/QR). Label front and rear. Track in inventory system. Mismatched labels cause outages.",310),
  c("hw-019","hardware","easy",1,1,"Drive form factors","2.5\" (SFF, most common in servers), 3.5\" (LFF, high capacity), U.2 (hot-swap NVMe), M.2 (board-mount, boot drives).",320),
  c("hw-020","hardware","easy",1,1,"POST and boot indicators","Power LED, HDD activity LED, amber/red = fault. Beep codes vary by vendor. BMC SEL logs POST failures.",330),
  c("hw-021","hardware","easy",1,1,"Hot-swap safety","Wear ESD strap grounded to rack. Verify correct slot. Never force a component. Check power draw limits before inserting.",340),
  c("hw-022","hardware","easy",1,1,"Tool kit essentials","ESD wrist strap, Phillips/Torx screwdrivers, cable tester, fiber scope, label maker, flashlight, laptop for BMC access.",350),
  c("hw-023","hardware","easy",1,1,"Common server vendors and form factors","Dell PowerEdge (R-series rack), HPE ProLiant (DL-series), Supermicro (custom configs). Most DCs use 1U or 2U for compute, 4U for GPU.",360),
  // Tier 2 — intermediate scenarios
  c("hw-101","hardware","intermediate",2,2,"GPU 'fell off the bus' in dmesg","Check `nvidia-smi`, `lspci | grep nvidia`. Try PCIe bus reset. Power cycle via IPMI. If persists: reseat GPU or RMA.",2010),
  c("hw-102","hardware","intermediate",2,2,"Increasing correctable memory errors","Check IPMI SEL → `edac-util -s` to identify DIMM → schedule replacement if rate exceeds threshold → `dmidecode -t memory` for serial.",2020),
  c("hw-103","hardware","intermediate",2,2,"NVSwitch","All-to-all GPU connectivity within a server. DGX H100: 4 NVSwitches connect 8 GPUs at full NVLink bandwidth.",2030),
  c("hw-104","hardware","intermediate",2,2,"Why is LLM inference memory-bound?","Must read all model weights per token. Few FLOPs per byte loaded. Throughput scales with memory bandwidth (H100: 3.35 TB/s), not compute.",2040),
  c("hw-105","hardware","intermediate",2,2,"Firmware update order of caution","Test on one server first. BMC → BIOS → drive → NIC → GPU firmware. Always have rollback plan + maintenance window.",2050),
  c("hwf-013","hardware","intermediate",2,2,"PCIe bus reset command?","`echo 1 > /sys/bus/pci/devices/<ADDR>/reset`",2060),
  c("hwf-014","hardware","intermediate",2,2,"GPU fell off bus: what to check via BMC?","Thermal sensors — was the GPU overheating before the fault?",2070),
  c("hwf-015","hardware","intermediate",2,2,"What is `memtest86+`?","Memory testing tool — run during maintenance window to confirm DIMM failure",2080),
  c("hwf-016","hardware","intermediate",2,2,"Replace DIMMs in mirrored config?","Replace in matching pairs",2090),
  c("hwf-017","hardware","intermediate",2,2,"What does NVSwitch replace?","Full mesh GPU connections (impractical at 8 GPUs). Enables efficient all-reduce.",2100),
  c("hwf-018","hardware","intermediate",2,2,"Check current NIC firmware version?","`ethtool -i eth0`",2110),
  c("hwf-019","hardware","intermediate",2,2,"NVSwitch firmware manager?","`nvidia-fabricmanager`",2120),
];

// ═══════════════════════════════════════
// NETWORKING
// ═══════════════════════════════════════
export const networking: ForgeCard[] = [
  // Tier 1 — ordered: what a network is → IP addressing → TCP vs UDP → DNS → switching → routing → DC topology → tools
  c("net-003","networking","easy",1,1,"Layer 2 vs Layer 3","L2: MAC addresses, switches, VLANs (local). L3: IP addresses, routers, subnets (connects networks).",10),
  c("net-010","networking","easy",1,1,"ARP","Maps IP→MAC on local network. `ip neigh show` to view. Flush: `ip neigh flush all`. L2 only — within a subnet.",20),
  c("net-001","networking","easy",1,1,"VLAN","Virtual LAN — logically segments a physical network. Different VLANs need a router (L3).",30),
  c("net-007","networking","easy",1,1,"DHCP process","DORA: Discover → Offer → Request → Acknowledge. Lease-based. DCs often use static IPs or DHCP reservations.",40),
  c("net-008","networking","easy",1,1,"DNS record types","A: hostname→IPv4. AAAA: →IPv6. CNAME: alias→canonical. PTR: IP→hostname (reverse).",50),
  c("net-004","networking","easy",1,1,"MTU / jumbo frames","Standard: 1500 bytes. Jumbo: 9000 bytes. Fewer packets = lower CPU overhead. Must match entire path.",60),
  c("net-005","networking","easy",1,1,"LACP","Link Aggregation — bonds multiple physical links for bandwidth + redundancy. Both switch and server must support.",70),
  c("net-006","networking","easy",1,1,"Leaf-spine topology","Every leaf (ToR) connects to every spine. Predictable latency, easy to scale, no spanning tree. ECMP distributes traffic.",80),
  c("net-002","networking","easy",1,1,"BGP","Border Gateway Protocol — routing between autonomous systems. Used for ECMP in leaf-spine fabrics.",90),
  c("net-009","networking","easy",1,1,"RDMA","Remote Direct Memory Access — read/write remote memory without CPU. Bypasses kernel. Used for GPU-to-GPU across nodes.",100),
  // Dropped-fact Tier 1
  c("netf-001","networking","easy",1,1,"VLAN use cases in DCs?","Security isolation, separating management/data/storage networks",110),
  c("netf-002","networking","easy",1,1,"BGP is what type of protocol?","Path-vector",120),
  c("netf-003","networking","easy",1,1,"DC networking trend: L3 everywhere?","Each rack is its own subnet — better scalability than L2 spanning tree",130),
  c("netf-004","networking","easy",1,1,"LACP IEEE standard?","802.3ad",140),
  c("netf-005","networking","easy",1,1,"Why no spanning tree in leaf-spine?","Every leaf connects to every spine — no loops to prevent",150),
  c("netf-006","networking","easy",1,1,"DHCP: what are leases?","Time-limited IP assignments — clients must renew or lose their address",160),
  c("netf-007","networking","easy",1,1,"Two ways to run RDMA?","InfiniBand (native) or RoCE (RDMA over Converged Ethernet)",170),
  c("netf-008","networking","easy",1,1,"Common ARP issues?","Storms (broadcast floods), stale entries, IP conflicts",180),
  // New Tier 1 gap-fill
  c("net-011","networking","easy",1,1,"IPv4 address structure","4 octets in dotted decimal (e.g., 192.168.1.1). Each octet is 0-255. Total: 32 bits.",190),
  c("net-012","networking","easy",1,1,"Private vs public IP ranges","Private: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Not routable on the internet. DCs use private IPs internally.",200),
  c("net-013","networking","easy",1,1,"Subnet mask basics","Defines network vs host portion. `/24` = 255.255.255.0 = 254 usable hosts. Smaller prefix = larger network.",210),
  c("net-014","networking","easy",1,1,"VLAN tagged vs untagged","Tagged (trunk): carries multiple VLANs with 802.1Q header. Untagged (access): single VLAN, no tag. Servers typically connect to access ports.",220),
  c("net-015","networking","easy",1,1,"Spine-leaf DC topology","Leaf switches (ToR) connect servers. Spine switches interconnect all leaves. Every leaf connects to every spine. Predictable 3-hop max.",230),
  c("net-016","networking","easy",1,1,"Default gateway","The router a host sends traffic to when the destination is outside its subnet. Set via DHCP or static config.",240),
  c("net-017","networking","easy",1,1,"DHCP basics","Automatically assigns IP, subnet mask, gateway, and DNS to devices. Reduces manual config. DCs often use reservations (fixed IP per MAC).",250),
  c("net-018","networking","easy",1,1,"Common ports","SSH: 22, HTTP: 80, HTTPS: 443, DNS: 53, DHCP: 67/68, NTP: 123, SNMP: 161/162, IPMI: 623.",260),
  c("net-019","networking","easy",1,1,"`ping` usage","Tests reachability: `ping 10.0.0.1`. Shows round-trip time and packet loss. First tool for network troubleshooting.",270),
  c("net-020","networking","easy",1,1,"`traceroute` usage","Shows each hop between you and the destination. Identifies where packets are delayed or dropped. Use `traceroute` (Linux) or `tracert` (Windows).",280),
  c("net-021","networking","easy",1,1,"`ss` / `netstat` for connections","`ss -tlnp` shows listening TCP ports with process names. Replaced `netstat`. Essential for checking what services are running.",290),
  c("net-022","networking","easy",1,1,"TCP vs UDP","TCP: reliable, ordered, connection-based (SSH, HTTP). UDP: fast, no guarantee (DNS, NTP, streaming). TCP retransmits lost packets; UDP doesn't.",300),
  // Tier 2
  c("net-101","networking","intermediate",2,2,"5% packet loss — diagnose?","`mtr` for per-hop loss → `ethtool -S eth0` for NIC errors → `ip -s link` for interface stats → check switch counters → swap cable/SFP.",2010),
  c("net-102","networking","intermediate",2,2,"ECMP in leaf-spine","Equal-Cost Multi-Path: hash-based (src+dst IP+ports) distributes flows across all spine paths. N spines = N paths.",2020),
  c("net-103","networking","intermediate",2,2,"RoCE vs InfiniBand","RoCE: RDMA over Ethernet (cheaper, uses existing switches). IB: purpose-built, lower latency, more reliable. GPU clusters often use IB.",2030),
  c("netf-009","networking","intermediate",2,2,"RoCEv1 vs RoCEv2?","v1: L2 only (same VLAN). v2: UDP/IP (routable). v2 preferred.",2040),
  c("netf-010","networking","intermediate",2,2,"How does ECMP prevent packet reordering?","Each flow hashes to one consistent path",2050),
  c("netf-011","networking","intermediate",2,2,"Check driver-level NIC errors?","`dmesg | grep eth0`",2060),
  c("netf-012","networking","intermediate",2,2,"Check switch port counters?","Via switch CLI (`show interface counters`)",2070),
];

// ═══════════════════════════════════════
// FIBER & CABLING
// ═══════════════════════════════════════
export const fiber: ForgeCard[] = [
  // Tier 1 — ordered: why fiber → SM vs MM → connectors → transceivers → cleaning → cable management
  c("fib-001","fiber","easy",1,1,"Single-mode vs multi-mode fiber","SMF: 9μm core, long distance (km+), yellow. MMF: 50μm, short (~550m), aqua/orange. MMF used inside DCs.",10),
  c("fib-006","fiber","easy",1,1,"LC vs SC vs MTP connectors","LC: small, latching, most common (SFP). SC: larger, push-pull, older. MTP: wide, multi-fiber (trunks).",20),
  c("fib-003","fiber","easy",1,1,"MTP/MPO connector","Multi-fiber (12/24 fibers in one connector). Used for 40G/100G/400G links. Breakout cables split to LC.",30),
  c("fib-002","fiber","easy",1,1,"SFP / QSFP transceivers","SFP28: 25G. QSFP28: 100G (4x25). QSFP56: 200G. QSFP-DD: 400G. Must match fiber type + distance.",40),
  c("fib-005","fiber","easy",1,1,"#1 cause of fiber signal loss","Dirty connectors. Always inspect and clean before connecting.",50),
  c("fib-008","fiber","easy",1,1,"Fiber cleaning procedure","Inspect → dry clean (one-click cleaner) → re-inspect → wet clean if needed → re-inspect. Never touch ferrule.",60),
  c("fib-004","fiber","easy",1,1,"OTDR","Optical Time Domain Reflectometer — sends light pulses to locate faults, measure loss, certify cable runs.",70),
  c("fib-007","fiber","easy",1,1,"Structured cabling","Organized trunks from MDA to racks, breakout panels, color-coded by network type. Avoids spaghetti.",80),
  // Dropped-fact Tier 1
  c("fibf-001","fiber","easy",1,1,"Where is single-mode fiber used?","Inter-building / campus runs (long distance, km+)",90),
  c("fibf-002","fiber","easy",1,1,"Fiber loss: bend radius?","Too tight a bend = light leaks out of the core",100),
  c("fibf-003","fiber","easy",1,1,"Fiber loss: bad splice?","Misaligned cores = signal loss at junction",110),
  c("fibf-004","fiber","easy",1,1,"Fiber loss: wrong transceiver?","Wavelength or SM/MM type mismatch with the fiber",120),
  c("fibf-005","fiber","easy",1,1,"First step before cleaning fiber?","Inspect with fiber scope FIRST — identify contamination type",130),
  c("fibf-006","fiber","easy",1,1,"Wet-clean fiber with what?","IPA (isopropyl alcohol), then dry clean after",140),
  c("fibf-007","fiber","easy",1,1,"Unused fiber connectors?","Always cap them — prevents contamination",150),
  c("fibf-008","fiber","easy",1,1,"Structured cabling: color coding?","Different colors for management, data, and storage networks",160),
  // New Tier 1 gap-fill
  c("fib-009","fiber","easy",1,1,"SM vs MM: distance, color, cost","Single-mode (yellow): 10+ km, more expensive. Multi-mode (aqua/orange): ~550m max, cheaper. Use MM inside DCs, SM between buildings.",170),
  c("fib-010","fiber","easy",1,1,"Transceiver types overview","SFP (1G), SFP+ (10G), SFP28 (25G), QSFP28 (100G), QSFP-DD (400G). Always match transceiver to fiber type and distance.",180),
  c("fib-011","fiber","easy",1,1,"Light levels and dB loss","Measured in dBm. Each connector adds ~0.3dB loss, each splice ~0.1dB. If Rx power drops below threshold, link errors occur.",190),
  c("fib-012","fiber","easy",1,1,"Bend radius","Fiber bends too tight → light escapes the core → signal loss. Minimum bend radius: ~30mm for patch cables. Use proper cable management.",200),
  c("fib-013","fiber","easy",1,1,"TIA-568 structured cabling standard","Industry standard for cabling infrastructure. Defines cable types, distances, connectors, and pathways. Ensures interoperability.",210),
  c("fib-014","fiber","easy",1,1,"Cable management best practices","Label both ends. Use cable trays/ladders. Maintain service loops (slack). Route neatly — never drape across other equipment. Document runs.",220),
  c("fib-015","fiber","easy",1,1,"Fiber vs copper in DCs","Fiber: higher bandwidth, longer distance, no EMI. Copper (Cat6a): cheaper, easier termination, limited to ~100m. DAC for short rack-to-rack.",230),
  c("fib-016","fiber","easy",1,1,"Polarity in MPO/MTP","Fiber pairs must be correctly aligned (Tx→Rx). Three polarity methods (A, B, C). Incorrect polarity = no link. Check with visual fault locator.",240),
  // Tier 2
  c("fib-101","fiber","intermediate",2,2,"Intermittent CRC errors on 100G link","Check light levels (`ethtool -m`) → clean both ends FIRST → swap transceiver → swap patch cable → OTDR for trunk faults → check bend radius.",2010),
  c("fibf-009","fiber","intermediate",2,2,"Check fiber light levels?","`ethtool -m eth0` (or switch: `show interface transceiver`). Compare Rx power to spec.",2020),
  c("fibf-010","fiber","intermediate",2,2,"CRC errors: verify fiber type match?","Confirm SM vs MM matches transceiver spec",2030),
];

// ═══════════════════════════════════════
// POWER & COOLING
// ═══════════════════════════════════════
export const powerCooling: ForgeCard[] = [
  // Tier 1 — ordered: redundant power → A+B feeds → PDUs → UPS → hot/cold aisle → CRAH/CRAC → PUE
  c("pc-002","power-cooling","easy",1,1,"N+1 vs 2N redundancy","N+1: one extra unit. 2N: fully duplicated paths. 2N+1: two paths + one extra. GPU DCs need at least 2N.",10),
  c("pc-001","power-cooling","easy",1,1,"PDU","Power Distribution Unit — distributes power in a rack. Types: basic, metered, switched, monitored. 2 per rack for redundancy.",20),
  c("pc-005","power-cooling","easy",1,1,"UPS types for DCs","Online/double-conversion: always through inverter, best protection, DC standard. Line-interactive and standby are not for DCs.",30),
  c("pc-004","power-cooling","easy",1,1,"Hot aisle / cold aisle","Racks alternate direction. Cold aisle: intakes face each other (chilled air). Hot aisle: exhausts (ducted to cooling). Containment prevents mixing.",40),
  c("pc-003","power-cooling","easy",1,1,"PUE","Power Usage Effectiveness = Total Power / IT Power. 1.0 = perfect. Good: 1.2. Average: 1.5. Lower = less cooling waste.",50),
  c("pc-006","power-cooling","easy",1,1,"GPU rack power draw","4 GPU servers (8x H100 each) = 40-60kW per rack. Traditional rack: 5-15kW. Large GPU clusters exceed 100kW/rack.",60),
  c("pc-007","power-cooling","easy",1,1,"Liquid cooling types","Direct-to-chip: cold plates on GPUs (most common). Rear-door heat exchangers. Immersion: server submerged in fluid (most efficient).",70),
  // Dropped-fact Tier 1
  c("pcf-001","power-cooling","easy",1,1,"PDU types?","Basic (dumb), Metered (shows usage), Switched (remote on/off), Monitored (per-outlet metering)",80),
  c("pcf-002","power-cooling","easy",1,1,"N+1 redundancy example?","3 UPS units where 2 would suffice",90),
  c("pcf-003","power-cooling","easy",1,1,"2N redundancy advantage?","Can lose an entire power path and still operate",100),
  c("pcf-004","power-cooling","easy",1,1,"Best-in-class PUE?","Google/Meta achieve 1.1-1.2",110),
  c("pcf-005","power-cooling","easy",1,1,"UPS bridges power until what?","Generators start (typically 10-30 seconds)",120),
  c("pcf-006","power-cooling","easy",1,1,"Air cooling rack power limit?","~30-40kW — GPU racks exceed this, requiring liquid cooling",130),
  c("pcf-007","power-cooling","easy",1,1,"Missing blanking panels in a rack?","Hot air recirculates to cold aisle — raises inlet temps",140),
  // New Tier 1 gap-fill
  c("pc-008","power-cooling","easy",1,1,"A+B redundant power feeds","Each server has dual PSUs. Feed A from one circuit, Feed B from another. Losing one feed = zero downtime. Never plug both PSUs into the same PDU.",150),
  c("pc-009","power-cooling","easy",1,1,"Breaker panels and circuits","Each rack fed by breakers (typically 30A or 50A per circuit). Overloading trips the breaker. Monitor per-circuit load before adding servers.",160),
  c("pc-010","power-cooling","easy",1,1,"CRAH vs CRAC units","CRAC: compressor-based (DX), self-contained. CRAH: uses chilled water from central plant, more efficient at scale. Most large DCs use CRAH.",170),
  c("pc-011","power-cooling","easy",1,1,"Generator and transfer switch","Generators provide backup power during utility outage. ATS (Automatic Transfer Switch) detects failure and switches to generator in 10-30 seconds.",180),
  c("pc-012","power-cooling","easy",1,1,"Environmental monitoring","Sensors track temperature (68-77°F intake recommended), humidity (40-60% RH). Alerts trigger before thresholds are exceeded.",190),
  c("pc-013","power-cooling","easy",1,1,"Power capacity planning","Know kW per rack, circuits per rack, and total facility capacity. GPU racks need 40-60kW — much more than traditional 5-10kW racks.",200),
  c("pc-014","power-cooling","easy",1,1,"Hot/cold aisle containment","Physical barriers (curtains, doors, panels) prevent hot and cold air from mixing. Dramatically improves cooling efficiency and PUE.",210),
  c("pc-015","power-cooling","easy",1,1,"Power connector types","C13/C14: standard server PSU (10A). C19/C20: high-power (16-20A). Match connector to PDU outlet. Color-coded cables help identify A/B feeds.",220),
  // Tier 2
  c("pc-101","power-cooling","intermediate",2,2,"Rack inlet temp rising — response?","One rack or many? Check CRAC/CRAH units → containment intact? → airflow obstructions? → blanking panels missing? → reduce load if critical → escalate to facilities.",2010),
];

// ═══════════════════════════════════════
// OPS & PROCESSES
// ═══════════════════════════════════════
export const opsProcesses: ForgeCard[] = [
  // Tier 1 — ordered: why process matters → ticketing → incident response → escalation → change mgmt → MOPs → maintenance windows → PIR
  c("ops-001","ops-processes","easy",1,1,"5 phases of incident management","Detect → Triage → Investigate → Resolve → Post-mortem (blameless)",10),
  c("ops-006","ops-processes","easy",1,1,"P1 vs P2 vs P3 vs P4","P1: service down, immediate. P2: major degradation, 30min. P3: partial impact, 4h. P4: minor, next business day.",20),
  c("ops-002","ops-processes","easy",1,1,"MTTR","Mean Time To Recovery. Lower = better. Directly correlates to cluster uptime and training job completion.",30),
  c("ops-003","ops-processes","easy",1,1,"Change management process","Request → Review (risk + rollback plan) → Approve → Implement (maintenance window) → Verify → Document",40),
  c("ops-004","ops-processes","easy",1,1,"Runbook","Step-by-step procedure for known tasks/incidents. Enables any on-call engineer to handle issues without tribal knowledge.",50),
  c("ops-005","ops-processes","easy",1,1,"Key DC monitoring metrics","Server: CPU, memory, disk, GPU, temps. Network: bandwidth, errors, latency. Storage: IOPS, capacity. Facility: power, temp, humidity.",60),
  c("ops-007","ops-processes","easy",1,1,"SLI vs SLO vs SLA","SLI: measurable metric. SLO: target value. SLA: contract with consequences. SLIs measure, SLOs target, SLAs enforce.",70),
  // Dropped-fact Tier 1
  c("opsf-001","ops-processes","easy",1,1,"What should a runbook contain?","Title, scope, prerequisites, steps, expected outputs, rollback, escalation contacts",80),
  c("opsf-002","ops-processes","easy",1,1,"Common DC monitoring tools?","Prometheus/Grafana, Nagios, Datadog, Zabbix",90),
  c("opsf-003","ops-processes","easy",1,1,"Why is MTTR critical at large GPU scale?","Every minute of downtime wastes massive compute resources",100),
  c("opsf-004","ops-processes","easy",1,1,"MTBF vs MTTR at scale?","MTTR matters more — failures are constant, speed of recovery is what counts",110),
  // New Tier 1 gap-fill
  c("ops-008","ops-processes","easy",1,1,"Ticketing basics","Every task gets a ticket: create → assign → update → resolve → close. Include symptoms, steps taken, resolution. No work without a ticket.",120),
  c("ops-009","ops-processes","easy",1,1,"Escalation paths","L1 (frontline): basic troubleshooting. L2 (specialist): deeper diagnosis. L3 (engineering): root cause and fixes. Know when to escalate, not just how.",130),
  c("ops-010","ops-processes","easy",1,1,"MOP — Method of Procedure","Step-by-step document for a specific task (e.g., 'Replace failed disk in rack A12'). Reviewed and approved before execution. Includes rollback steps.",140),
  c("ops-011","ops-processes","easy",1,1,"SOP vs MOP","SOP: general repeatable process (e.g., 'How to handle disk failures'). MOP: specific procedure for one task (e.g., 'Replace disk sda in server X'). SOPs guide, MOPs execute.",150),
  c("ops-012","ops-processes","easy",1,1,"Maintenance windows","Scheduled time for planned work. Communicate to stakeholders. Have rollback plan. Never make production changes outside a window unless emergency.",160),
  c("ops-013","ops-processes","easy",1,1,"Post-incident review (PIR)","Blameless review after incidents. Timeline of events, root cause, what went well, what didn't, action items. Goal: prevent recurrence.",170),
  c("ops-014","ops-processes","easy",1,1,"Documentation standards","'If it isn't documented, it didn't happen.' Document every action, change, and decision. Use standard templates. Keep runbooks current.",180),
  c("ops-015","ops-processes","easy",1,1,"Shift handoff","Outgoing shift tells incoming: open tickets, active incidents, pending work, anything unusual. Use a standard handoff template. Never leave gaps.",190),
  // Tier 2
  c("ops-101","ops-processes","intermediate",2,2,"First 30 min on unfamiliar on-call?","Get access (dashboards, VPN, SSH) → read runbook index → check active incidents → review alert thresholds → shadow outgoing on-call → verify you can reach IPMI/switches → test one action.",2010),
];

// ═══════════════════════════════════════
// SCALE & ARCHITECTURE
// ═══════════════════════════════════════
export const scaleContext: ForgeCard[] = [
  // Tier 1 — ordered: hyperscale vs colo → rack density → cluster hierarchy → monitoring concepts
  c("sc-001","scale","easy",1,1,"Hyperscale vs colocation vs on-prem","Hyperscale: company-built mega facility (Google, Meta, AWS). Colo: leased space in shared building. On-prem: your own server room. Scale changes everything.",10),
  c("sc-002","scale","easy",1,1,"DC Ops Tech role","Hardware install/repair, cabling, troubleshooting, IPMI/BMC management, incident response, inventory tracking, documentation.",20),
  c("sc-003","scale","easy",1,1,"Why scale changes everything","At 10K+ servers, daily hardware failures are guaranteed. Automation, fast replacement, and monitoring matter more than prevention.",30),
  c("sc-004","scale","easy",1,1,"Row / pod / cluster / AZ hierarchy","Rack → row → pod (power/cooling unit) → cluster (management unit) → availability zone → region. Each level has its own failure domain.",40),
  c("sc-005","scale","easy",1,1,"Why build a purpose-built facility?","Cheap power, available real estate, fiber connectivity, proximity to network hubs, speed of buildout.",50),
  // New Tier 1 gap-fill
  c("sc-006","scale","easy",1,1,"Monitoring concepts at scale","Prometheus (metrics collection), Grafana (dashboards), Nagios/Zabbix (alerting). At scale, monitoring IS the nervous system — no manual checking.",60),
  c("sc-007","scale","easy",1,1,"Capacity planning basics","Track current utilization vs total capacity: power (kW), cooling (tons), space (U), network (ports). Plan 6-12 months ahead for procurement.",70),
  c("sc-008","scale","easy",1,1,"Failure domains","A failure domain is the blast radius of a single failure. A tripped breaker affects one rack. A failed CRAH affects one row. Design so failures stay contained.",80),
  c("sc-009","scale","easy",1,1,"Automation at scale","Manual processes don't scale past ~100 servers. Ansible, Puppet, or Salt for config management. Automated provisioning, monitoring, and alerting are essential.",90),
  c("sc-010","scale","easy",1,1,"Colo vs hyperscale operations","Colo: shared facility, limited customization, SLA-based support. Hyperscale: custom-built, full control, in-house team. Different operational models.",100),
  // Tier 2
  c("sc-101","scale","intermediate",2,2,"Expected daily failures at large scale?","At 10K+ servers: 3-17 component failures/day (0.1-0.5% monthly rate). Disks, memory, fans, NICs, GPUs. Job is fast detection + replacement, not prevention.",2010),
];

// ═══════════════════════════════════════
// BEHAVIORAL
// ═══════════════════════════════════════
export const behavioral: ForgeCard[] = [
  // Tier 1 — ordered: STAR framework → situation examples → question types → practice
  c("beh-001","behavioral","easy",1,1,"STAR method","Situation → Task → Action → Result. Use 'I' not 'we'. Include metrics.",10),
  c("beh-002","behavioral","easy",1,1,"'Why this company?' framework","Mission alignment + scale + culture (speed, first principles) + personal fit. Be specific, not generic.",20),
  c("beh-003","behavioral","easy",1,1,"'Worked under pressure' — key elements","Specific scenario, stakes, YOUR actions, quantified outcome, what you learned. No vague 'we' stories.",30),
  c("beh-004","behavioral","easy",1,1,"'First 30 days?' framework","Week 1: learn systems. Week 2: shadow experienced techs. Week 3: document/contribute to runbooks. Week 4: ship independently.",40),
  c("beh-005","behavioral","easy",1,1,"Show 'ownership' in interviews","Use 'I'. Be proactive (you found the problem). Show follow-through (prevented recurrence). Own mistakes. Quantify YOUR impact.",50),
  // Dropped-fact Tier 1
  c("behf-001","behavioral","easy",1,1,"Weak 'Why this company?' answer?","Generic 'I love AI' — be specific about mission, scale, culture fit",60),
  c("behf-002","behavioral","easy",1,1,"Red flags in 'under pressure' answers?","Vague stories, blaming others, no specific actions",70),
  c("behf-003","behavioral","easy",1,1,"'First 30 days' tone?","Humble enough to learn, motivated enough to contribute quickly",80),
  // Tier 2
  c("beh-101","behavioral","intermediate",2,2,"'Process you improved' — STAR template","S: 'At [X], process for [Y] was [problem].' T: 'I was responsible for [scope], taking [metric].' A: 'I [specific actions].' R: 'Reduced [X] by [%]. Team adopted as standard.'",2010),
];
