import type { MCQuestion } from "@/lib/types/campaign";

// net-m03 "IP & Routing" — covers net-s5 (IPv4, Subnetting, Routing) + net-s6 (Leaf-Spine, BGP, ECMP)

export const NET_M03_QUESTIONS: MCQuestion[] = [
  {
    id: "net-m03-q01",
    question:
      "Your cluster uses `10.42.0.0/16`. A new rack is carved out as `10.42.7.0/24`. How many usable host addresses does the rack get, and what are the first and last?",
    choices: [
      { label: "A", text: "256 hosts, first 10.42.7.0, last 10.42.7.255" },
      { label: "B", text: "254 hosts, first 10.42.7.1, last 10.42.7.254 (0 is the network, 255 is the broadcast)" },
      { label: "C", text: "255 hosts, first 10.42.7.0, last 10.42.7.254" },
      { label: "D", text: "1022 hosts, first 10.42.0.1, last 10.42.3.254" },
    ],
    correctAnswer: "B",
    explanation:
      "A /24 has 256 addresses but two are reserved: the network address (all host bits zero: 10.42.7.0) and the broadcast address (all host bits one: 10.42.7.255). That leaves 254 usable hosts, from 10.42.7.1 to 10.42.7.254. The trade for point-to-point links uses /31, which sacrifices the reservation convention to give you both addresses for real hosts.",
  },
  {
    id: "net-m03-q02",
    question:
      "A host has IP `10.0.5.77/24` and default gateway `10.0.5.1`. The user can ping `10.0.5.12` but not `10.0.6.12`. What does this pattern tell you?",
    choices: [
      { label: "A", text: "10.0.5.12 is on-subnet (direct ARP, no routing needed). 10.0.6.12 is off-subnet and must traverse the default gateway. The gateway either has no route to 10.0.6.0/24, is blocking traffic, or is itself down. Use `ip route get` and `traceroute` to locate the break" },
      { label: "B", text: "10.0.6.12 doesn't exist" },
      { label: "C", text: "The host has two NICs fighting each other" },
      { label: "D", text: "The subnet mask should be /16 on both" },
    ],
    correctAnswer: "A",
    explanation:
      "With /24, the host's subnet is 10.0.5.0–10.0.5.255. On-subnet destinations are delivered directly via ARP. Anything else gets handed to the default gateway. Confirm the routing decision with `ip route get 10.0.6.12` (should say `via 10.0.5.1`), then `ping 10.0.5.1`, then `traceroute 10.0.6.12` to see exactly where the path breaks. If the gateway itself were unreachable, on-subnet pings would still work but everything else would fail — matching the observed symptom.",
  },
  {
    id: "net-m03-q03",
    question:
      "A modern AI datacenter fabric has abandoned L2 spanning-tree between racks in favor of leaf-spine with BGP everywhere. What's the single biggest operational advantage?",
    choices: [
      { label: "A", text: "Every link is active, every leaf is exactly 3 hops from every other leaf, capacity grows by adding spines, and convergence is sub-second. No blocked ports, no STP recalculation events, no broadcast storms escaping a rack" },
      { label: "B", text: "Switches are cheaper" },
      { label: "C", text: "It doesn't require any cabling" },
      { label: "D", text: "It only needs IPv6" },
    ],
    correctAnswer: "A",
    explanation:
      "Leaf-spine with L3 delivers several wins at once: all links are active (STP used to block half of them for loop avoidance), predictable hop count, horizontal scale by adding spines, and sub-second convergence via BGP timers and BFD. Losing a spine drops 1/N of bandwidth but doesn't drop connectivity. Every rack being its own subnet also contains broadcast domains — ARP storms can't cross to another rack.",
  },
  {
    id: "net-m03-q04",
    question:
      "A DC operator finds that spine 3 of a 4-spine fabric runs consistently hotter (~75% utilization) than the other three (~45%). Traffic is normal in aggregate. What are the two most likely causes?",
    choices: [
      { label: "A", text: "(1) Hash polarization — the same ECMP hash function is used at multiple tiers, so flows landing on spine 3 in one layer also land on it in the next. (2) An elephant flow — one long-lived high-throughput connection hashes to spine 3 and dominates its load. Per-port counters on the spines identify which flow is eating it" },
      { label: "B", text: "Spine 3 has bad fiber only" },
      { label: "C", text: "Spine 3 has more ports than the others" },
      { label: "D", text: "Spine 3 is the BGP route reflector" },
    ],
    correctAnswer: "A",
    explanation:
      "Polarization and elephant flows both produce this exact pattern. Polarization is fixable by varying the hash seed across tiers or adding entropy (layer3+4 hashing). Elephant flows are harder: options include enabling adaptive routing on the fabric (common on RoCE/IB), redistributing the traffic with multiple parallel connections, or accepting it if the fabric has headroom. Either way, per-port counters on the spines pinpoint which source/dest pair is responsible.",
  },
  {
    id: "net-m03-q05",
    question:
      "A 4-spine leaf-spine fabric has one spine removed for maintenance. What should operators expect, assuming the fabric is well-behaved?",
    choices: [
      { label: "A", text: "Aggregate capacity drops about 25% as flows rehash onto the remaining 3 spines. Connectivity is uninterrupted, tail latency may rise slightly, and utilization on the remaining spines increases proportionally. Without ECMP, the impact would be a multi-second reconvergence and packet loss" },
      { label: "B", text: "The entire fabric goes down during the maintenance" },
      { label: "C", text: "Traffic is unaffected — the other spines absorb it automatically with no downside" },
      { label: "D", text: "Only traffic to that spine's IP is affected" },
    ],
    correctAnswer: "A",
    explanation:
      "ECMP load-balances flows across all equal-cost paths. Removing one of four paths drops 25% of aggregate capacity but has no effect on connectivity — the remaining 3 paths absorb the load. BGP withdraws routes cleanly, flows rehash, utilization rises a bit on the survivors. Without ECMP, a single-path design would either blackhole traffic to that spine or trigger a slow reconvergence event. This is why leaf-spine + ECMP is the DC default.",
  },
  {
    id: "net-m03-q06",
    question:
      "Why BGP instead of OSPF for a modern DC fabric?",
    choices: [
      { label: "A", text: "At DC scale, BGP is simpler to operate: flat peer relationships, clear policies, mature tooling, and per-peer isolation. OSPF's flooding and area-design overhead becomes harder to manage with thousands of devices. BGP also integrates naturally with internet connectivity at the edge" },
      { label: "B", text: "BGP is faster at convergence than OSPF" },
      { label: "C", text: "OSPF doesn't support ECMP" },
      { label: "D", text: "BGP doesn't need to be configured" },
    ],
    correctAnswer: "A",
    explanation:
      "Both protocols can work; the choice is operational. BGP scales gracefully, has per-peer isolation (one misbehaving peer is contained), enormous vendor and open-source tooling, and uses the same model as the internet edge. OSPF floods link-state updates across an area, which becomes chatty at thousands of nodes, and the area-design work required to contain that flooding is finicky. Convergence speed is comparable in practice with good BGP tuning (BFD, rapid timers).",
  },
  {
    id: "net-m03-q07",
    question:
      "Your host's routing table has three entries: `default via 10.0.5.1`, `10.0.5.0/24 dev eth0`, and `10.0.5.12/32 via 10.0.5.99`. You send a packet to 10.0.5.12. Where does it go, and why?",
    choices: [
      { label: "A", text: "Via 10.0.5.99 — the /32 is the most specific (longest prefix) match and wins over /24 and /0. Longest-prefix match is the fundamental rule of IP routing" },
      { label: "B", text: "Out eth0 directly, because it's in the local subnet" },
      { label: "C", text: "Via the default gateway 10.0.5.1" },
      { label: "D", text: "It drops — three routes for the same destination is invalid" },
    ],
    correctAnswer: "A",
    explanation:
      "Longest prefix match: /32 beats /24 beats /0. The host-specific route wins, sending traffic via 10.0.5.99. This technique is commonly used to steer specific flows through a proxy, debug server, or WAF while letting everything else flow normally. Multiple overlapping routes are perfectly valid; the kernel always picks the most specific match first, then uses metric as a tiebreaker among equally-specific routes.",
  },
  {
    id: "net-m03-q08",
    question:
      "An engineer proposes announcing the same VIP from 8 load balancers using BGP anycast. What's the practical effect inside the fabric, and what's the one thing clients must tolerate?",
    choices: [
      { label: "A", text: "The fabric's ECMP spreads incoming flows across all 8 LBs with no coordination needed. Adding/removing an LB is just advertising/withdrawing the VIP. Clients must tolerate that a given connection is handled by whichever LB its flow hashed to — state like session cookies must either stay on the LB (consistent hashing), be shared across LBs, or not exist" },
      { label: "B", text: "BGP anycast doesn't work inside a datacenter, only on the public internet" },
      { label: "C", text: "Clients need to query each LB individually" },
      { label: "D", text: "It forces IPv6 everywhere" },
    ],
    correctAnswer: "A",
    explanation:
      "Anycast + ECMP is how scale-out load balancing works inside DCs. The fabric does the balancing; the LBs are independent instances. Adding/removing capacity is trivial (advertise/withdraw the VIP in BGP). The tradeoff is that client flows are distributed by hash — stateful protocols require either consistent hashing (same client → same LB most of the time) or shared state between LBs. Session stickiness is a design choice, not an automatic property.",
  },
];
