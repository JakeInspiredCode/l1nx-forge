import type { MCQuestion } from "@/lib/types/campaign";

// net-m02 "Switching & VLANs" — covers net-s3 (Switching, MAC Learning, ARP) + net-s4 (VLANs, Trunks, LACP)

export const NET_M02_QUESTIONS: MCQuestion[] = [
  {
    id: "net-m02-q01",
    question:
      "How does a switch know which port to forward a frame out of, and what happens the first time it sees a destination MAC it has never encountered?",
    choices: [
      { label: "A", text: "It builds a MAC-address table by learning source MACs on incoming frames. If the destination MAC is unknown, it floods the frame out all ports except the one it came in on, and learns from the reply" },
      { label: "B", text: "It consults a central controller via DNS" },
      { label: "C", text: "It broadcasts every frame to every port; switches don't actually filter" },
      { label: "D", text: "It reads the IP header to pick a port" },
    ],
    correctAnswer: "A",
    explanation:
      "Switches are L2 devices. They learn by observing source MACs and the ports they arrived on, building a forwarding table. For an unknown destination MAC, the switch floods the frame out every port in the VLAN (except the source port); the eventual reply teaches it the correct port. Entries age out after a few minutes of silence (default ~300s). Switches don't read IP headers — that's a router's job.",
  },
  {
    id: "net-m02-q02",
    question:
      "Two servers on the same subnet have been accidentally given the same IP address, `10.0.5.12`. Connections to `10.0.5.12` sometimes reach host A and sometimes host B. What's the underlying mechanism, and how would you confirm it quickly from a third host?",
    choices: [
      { label: "A", text: "Both hosts respond to ARP requests for 10.0.5.12. Neighbors cache whichever reply arrived most recently, and this can flip. `arping -I eth0 10.0.5.12` from a third host will show two different MACs replying to the same IP" },
      { label: "B", text: "The switch is broken and randomly picking servers" },
      { label: "C", text: "DNS is returning different A records each time" },
      { label: "D", text: "The servers are on different VLANs" },
    ],
    correctAnswer: "A",
    explanation:
      "Duplicate IPs produce an ARP race: both hosts answer requests, and neighbors' caches store whichever reply arrived last. The switch's MAC table may also flap between the two ports, which many switches log as warnings. `arping` on a third host reveals both MACs; `dmesg` on the conflicting hosts usually logs `duplicate address detected`. Fix: take one host off the network, correct its IP, and flush caches.",
  },
  {
    id: "net-m02-q03",
    question:
      "A server's NIC is replaced during a maintenance window. When it comes back up, the host can reach its default gateway but other hosts on the same subnet can't reach the server for about 5 minutes. Why, and what's the right way to speed recovery?",
    choices: [
      { label: "A", text: "The new NIC has a new MAC. Other hosts' ARP caches still have the old mapping and will age out in ~300s. Send a gratuitous ARP (`arping -U -I eth0 <own-ip>`) to update neighbors immediately" },
      { label: "B", text: "The switch needs to reboot after any NIC change" },
      { label: "C", text: "The new NIC is incompatible with the VLAN" },
      { label: "D", text: "DNS TTLs are holding the old IP" },
    ],
    correctAnswer: "A",
    explanation:
      "Replacing a NIC changes the MAC address. Neighbors' ARP caches point at the old MAC until entries age out. A **gratuitous ARP** broadcasts the new IP→MAC mapping, prompting neighbors to update immediately. Most Linux distros send gratuitous ARP on link-up automatically, but it's worth knowing how to trigger manually — and why the delay exists when it wasn't sent.",
  },
  {
    id: "net-m02-q04",
    question:
      "You configure three VLANs — 10, 20, 30 — on a switch and connect a Linux hypervisor to a port configured as a trunk. The hypervisor's management interface on VLAN 20 works; traffic on VLANs 10 and 30 fails. What's the most likely issue, and how do you confirm from the host?",
    choices: [
      { label: "A", text: "The switch's trunk is not allowing VLANs 10 and 30 (only VLAN 20 is permitted), or the hypervisor isn't creating tagged sub-interfaces for 10 and 30. `tcpdump -nni eth0 -e vlan` shows whether tagged frames for those VLANs are arriving" },
      { label: "B", text: "VLANs 10 and 30 are reserved and cannot be used" },
      { label: "C", text: "The hypervisor needs three separate physical NICs" },
      { label: "D", text: "The MTU on VLANs 10 and 30 must be higher than on VLAN 20" },
    ],
    correctAnswer: "A",
    explanation:
      "Trunks explicitly list which VLANs they carry (`switchport trunk allowed vlan 10,20,30`). If the allowed list is missing 10 and 30, those frames never hit the hypervisor. If the switch side is correct but the hypervisor has no sub-interface for those VLANs, tagged frames arrive but the kernel ignores them. `tcpdump -e` on the host exposes tagged frames; the combination of what's arriving and what's configured locally narrows the fault.",
  },
  {
    id: "net-m02-q05",
    question:
      "An operator configures a trunk on the switch but accidentally leaves the native VLAN mismatched between the switch port and the server's bond. What happens, and why is this considered a security issue?",
    choices: [
      { label: "A", text: "Untagged frames land on the wrong VLAN on one side, leaking traffic between networks that were supposed to be isolated. This is a classic VLAN hopping risk — traffic from one security zone can leak into another. Best practice: set the native VLAN to an unused ID and require all real VLANs to be tagged" },
      { label: "B", text: "The link drops entirely until the mismatch is fixed" },
      { label: "C", text: "Frames slow down but arrive correctly" },
      { label: "D", text: "It has no effect — native VLAN is cosmetic" },
    ],
    correctAnswer: "A",
    explanation:
      "Native VLAN is the VLAN on which untagged frames travel. If both sides disagree, untagged frames silently end up on the wrong VLAN — bypassing L2 isolation. An attacker can sometimes exploit this for VLAN hopping, reading traffic they shouldn't see. The standard defense is to use an unused ID as the native VLAN and require tagging on all real VLANs, so a mismatch becomes a drop rather than a silent crossover.",
  },
  {
    id: "net-m02-q06",
    question:
      "You bond two 25 Gb/s NICs with LACP between two servers. A single `iperf3` stream between them tops out at ~24 Gb/s. Is the bond broken?",
    choices: [
      { label: "A", text: "No. LACP distributes flows across members; one iperf3 connection is one flow that hashes to one member (~25 Gb/s). Running iperf3 with -P 8 or multiple connections with different ports will show traffic splitting across members and approaching 50 Gb/s aggregate" },
      { label: "B", text: "Yes — LACP should double single-flow throughput" },
      { label: "C", text: "Yes — one member is down" },
      { label: "D", text: "No, because 25 Gb/s NICs actually max out at 24 Gb/s" },
    ],
    correctAnswer: "A",
    explanation:
      "LACP is flow-level aggregation, not per-packet striping. Each flow (unique src/dst IP + port 5-tuple) hashes consistently to one member to avoid packet reordering. Single-flow speed is capped at one member's bandwidth; aggregate bandwidth scales with parallel flows. If you need 50 Gb/s for one flow, buy a single 50+ Gb/s NIC.",
  },
  {
    id: "net-m02-q07",
    question:
      "What does ARP actually accomplish at the boundary between L2 and L3, and why is it scoped to a single broadcast domain?",
    choices: [
      { label: "A", text: "ARP maps a local IP to its MAC, letting the OS translate L3 addresses into the L2 destination MAC the NIC needs. It uses L2 broadcast (`who has X?`) so only hosts in the same broadcast domain hear it — for remote IPs, the host ARPs its default gateway instead" },
      { label: "B", text: "ARP establishes TCP connections" },
      { label: "C", text: "ARP is an encryption protocol for secure network communication" },
      { label: "D", text: "ARP lets switches learn routing tables from each other" },
    ],
    correctAnswer: "A",
    explanation:
      "ARP resolves IP-to-MAC mappings within one L2 segment. A host sending to a remote IP never ARPs for that remote host directly; instead it ARPs for its **default gateway's** IP on the local segment, and the gateway ARPs its own neighbors on its own segments. Because ARP uses broadcast, it can't escape a broadcast domain — hence modern DC designs keep broadcast domains small (one rack / one subnet) and let L3 (routing) handle inter-rack traffic.",
  },
  {
    id: "net-m02-q08",
    question:
      "A DC architect argues: \"Let's make every rack its own /24 and route between racks at L3. No VLANs spanning racks.\" What's the main benefit, and what's the cost?",
    choices: [
      { label: "A", text: "Benefit: broadcast domains stay tiny, so ARP/DHCP storms can't spread DC-wide. No STP needed, every link is active, convergence is sub-second via BGP/ECMP. Cost: VM/container live-migration between racks no longer works on a shared L2 — needs overlay networks (VXLAN, GENEVE) if you need cross-rack L2" },
      { label: "B", text: "Benefit: cheaper switches. Cost: no real tradeoff" },
      { label: "C", text: "Benefit: IPv6 compatibility. Cost: higher latency" },
      { label: "D", text: "Benefit: simpler cabling. Cost: more expensive fiber" },
    ],
    correctAnswer: "A",
    explanation:
      "Per-rack subnets confine broadcast to small domains, eliminate the need for STP, and let BGP/ECMP handle multi-path routing actively. The tradeoff is that workloads which expected a flat L2 network (live-migrating a VM, MAC-based clustering) either have to stay in-rack or run on an overlay network — VXLAN or GENEVE tunneling L2 frames over the L3 fabric. Most modern DCs accept that tradeoff as a win.",
  },
];
