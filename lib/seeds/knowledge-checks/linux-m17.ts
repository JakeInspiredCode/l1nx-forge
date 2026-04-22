import type { MCQuestion } from "@/lib/types/campaign";

// linux-m17 "Advanced Networking" — covers lxa-s9 (Bonding/VLANs/Bridges/Namespaces)
// + lxa-s10 (TCP tuning, conntrack, forensic tools)

export const LINUX_M17_QUESTIONS: MCQuestion[] = [
  {
    id: "linux-m17-q01",
    question:
      "You configure a Linux bond in mode 802.3ad (LACP). `cat /proc/net/bonding/bond0` shows slaves `up` but with no `Partner:` information, and one slave carries no traffic. What's the fix?",
    choices: [
      { label: "A", text: "Increase `miimon` interval" },
      { label: "B", text: "Configure the switch-side ports as an LACP port-channel — LACP requires both sides to negotiate; if the switch isn't in LACP mode, no aggregation forms" },
      { label: "C", text: "Switch bond mode to mode 0 (round-robin)" },
      { label: "D", text: "Upgrade the kernel" },
    ],
    correctAnswer: "B",
    explanation:
      "LACP is a protocol that requires both endpoints to exchange LACPDUs and agree. If the switch-side port isn't configured for LACP (Cisco: `channel-group X mode active`, Arista: `port-channel`, etc.), the Linux side sends LACPDUs to no one and the bond never aggregates. 'Up but no Partner' is the unambiguous symptom.",
  },
  {
    id: "linux-m17-q02",
    question:
      "Which bond mode provides fault tolerance with no switch-side configuration required?",
    choices: [
      { label: "A", text: "Mode 0 (balance-rr)" },
      { label: "B", text: "Mode 1 (active-backup) — one NIC active, one standby, no switch cooperation needed" },
      { label: "C", text: "Mode 4 (802.3ad LACP)" },
      { label: "D", text: "Mode 6 (balance-alb)" },
    ],
    correctAnswer: "B",
    explanation:
      "Mode 1 (active-backup) keeps one NIC carrying traffic and the other as a hot standby — it works with any switches, even two different switches with no interconnection. Mode 4 (LACP) provides better bandwidth but requires matching LACP configuration on the switch. Mode 0 and 6 have their own requirements. When you don't control the switch config, active-backup is the safe fallback.",
  },
  {
    id: "linux-m17-q03",
    question:
      "You want to carry management traffic (VLAN 10) and data traffic (VLAN 20) over a single bonded pair. What layer of the Linux network stack handles 802.1Q tagging?",
    choices: [
      { label: "A", text: "The physical NIC driver" },
      { label: "B", text: "VLAN sub-interfaces on top of the bond (`bond0.10`, `bond0.20`) — each is a logical interface that tags/untags frames with its VLAN ID" },
      { label: "C", text: "The switch adds VLAN tags automatically" },
      { label: "D", text: "iptables rules" },
    ],
    correctAnswer: "B",
    explanation:
      "Linux creates VLAN sub-interfaces (`bond0.VLAN_ID`) that live on top of a physical or bonded device. Frames sent through `bond0.10` get an 802.1Q tag with VLAN 10 before hitting the wire; received frames tagged with 10 come up through `bond0.10`. The switch port must be in **trunk** mode allowing those VLANs (access-mode ports strip the tag).",
  },
  {
    id: "linux-m17-q04",
    question:
      "You want to run a command inside a container's network namespace from the host (for debugging), given the container's PID. What command does it?",
    choices: [
      { label: "A", text: "`docker exec` — always use the Docker API" },
      { label: "B", text: "`sudo nsenter -t <PID> -n <cmd>` — enter the container's network namespace by PID and run cmd" },
      { label: "C", text: "`ip netns exec <PID> <cmd>`" },
      { label: "D", text: "`chroot /proc/<PID>/root <cmd>`" },
    ],
    correctAnswer: "B",
    explanation:
      "`nsenter` enters the namespace(s) of a running process by PID. `-n` selects the network namespace. `ip netns exec` works only for namespaces created by `ip netns add` — it doesn't see Docker/container-runtime namespaces because those aren't symlinked into `/var/run/netns` by default. For production container debugging, `nsenter` is the right tool.",
  },
  {
    id: "linux-m17-q05",
    question:
      "On a 100 Gbps DC-to-DC link with 20 ms RTT, a single iperf flow maxes out at ~3 Gbps. The hardware is fine. What is the most likely kernel-level cause?",
    choices: [
      { label: "A", text: "The kernel's default TCP send/receive buffer maxes are too small for the bandwidth-delay product of the link" },
      { label: "B", text: "iperf uses UDP by default" },
      { label: "C", text: "The NIC's ring buffer is too large" },
      { label: "D", text: "The congestion control algorithm is turned off" },
    ],
    correctAnswer: "A",
    explanation:
      "Single-flow TCP throughput ≈ window / RTT. At 20 ms RTT, filling 100 Gbps requires a window of ~250 MB. Default `net.core.rmem_max` and `net.ipv4.tcp_rmem` values cap you at a few MB, which translates to ~1-3 Gbps on that link. The fix: raise `rmem_max`/`wmem_max` and the `tcp_rmem`/`tcp_wmem` ceilings, and switch congestion control to `bbr` for high-latency paths.",
  },
  {
    id: "linux-m17-q06",
    question:
      "You enable BBR (`net.ipv4.tcp_congestion_control=bbr`) but throughput doesn't improve. Which additional change does BBR typically require to work correctly?",
    choices: [
      { label: "A", text: "Disable nf_conntrack" },
      { label: "B", text: "Use the `fq` queueing discipline on the egress interface — BBR's pacing depends on the kernel actually pacing packets" },
      { label: "C", text: "Rebuild the kernel with BBR built-in" },
      { label: "D", text: "Switch to UDP" },
    ],
    correctAnswer: "B",
    explanation:
      "BBR's central mechanism is **pacing** — sending packets at a controlled rate that matches the estimated bottleneck bandwidth. The kernel can only pace packets if the egress qdisc supports it, which means `fq` (fair queueing) on the egress interface. Without it, BBR loads (doesn't error) but pacing isn't enforced and performance regresses to a less-tuned baseline. Set with `tc qdisc replace dev eth0 root fq`.",
  },
  {
    id: "linux-m17-q07",
    question:
      "A web-tier node reports \"Cannot assign requested address\" errors for new outbound connections. `ss -s` shows 450K sockets in TIME-WAIT. What's the root cause and a kernel-level mitigation?",
    choices: [
      { label: "A", text: "DNS cache full — restart systemd-resolved" },
      { label: "B", text: "Ephemeral port exhaustion. Mitigations: widen `net.ipv4.ip_local_port_range`, reduce `net.ipv4.tcp_fin_timeout`, and set `net.ipv4.tcp_tw_reuse=1` so the kernel can reuse TIME-WAIT sockets for new outbound connections" },
      { label: "C", text: "Too many TCP SYN packets — enable SYN cookies" },
      { label: "D", text: "ARP cache overflow" },
    ],
    correctAnswer: "B",
    explanation:
      "Each outbound TCP connection from a single source IP to one (dst-IP, dst-port) needs a unique ephemeral source port. With TIME-WAIT at 60 seconds per closed connection and hundreds of thousands of them piling up, the ~28000-port default range exhausts. Wider port range + shorter fin_timeout + `tcp_tw_reuse` address the kernel side. Real fix at the application level: connection pooling so you don't create-and-tear-down TCP at that rate.",
  },
  {
    id: "linux-m17-q08",
    question:
      "You set MTU 9000 on your bond interface to enable jumbo frames, but performance gets **worse**. `ping -M do -s 8972 remote` fails with fragmentation-needed. What's the diagnosis?",
    choices: [
      { label: "A", text: "Jumbo frames don't work on Linux" },
      { label: "B", text: "Some hop in the path (a switch, router, or peer NIC) has an MTU < 9000; for jumbo to work it must be configured end-to-end" },
      { label: "C", text: "Jumbo frames require `nobarrier`" },
      { label: "D", text: "MTU 9000 is invalid; use 1500" },
    ],
    correctAnswer: "B",
    explanation:
      "Jumbo frames require every device along the path — your NIC, every switch, the peer NIC — to use MTU ≥ 9000. If even one hop is at 1500, fragmentation is needed (Path MTU Discovery hits ICMP 'fragmentation needed, DF set' and the sender retransmits at the smaller MTU, often with retries). `ping -M do -s 8972` intentionally sets the Don't-Fragment bit at 8972 bytes payload and fails fast if any hop is smaller. Fix: configure every hop consistently, or revert to 1500.",
  },
  {
    id: "linux-m17-q09",
    question:
      "A NIC shows `Speed: 100000Mb/s Duplex: Full Link detected: yes` but `ethtool -S eth0` reveals climbing `rx_dropped` and `rx_missed_errors`. What's most likely happening?",
    choices: [
      { label: "A", text: "The link is physically broken" },
      { label: "B", text: "Packets are arriving faster than the NIC ring buffer can drain into the kernel — raise RX ring buffer (`ethtool -G eth0 rx 4096`) and/or fix IRQ affinity so RX interrupts spread across CPUs" },
      { label: "C", text: "The MTU is too large" },
      { label: "D", text: "BBR isn't loaded" },
    ],
    correctAnswer: "B",
    explanation:
      "`rx_dropped` / `rx_missed_errors` on an up, healthy link mean the NIC is receiving packets faster than the kernel (via softirq) can process them. Typical fixes: raise the RX ring buffer size toward the NIC max (`ethtool -G`), spread RX IRQs across multiple CPUs (via `/proc/irq/N/smp_affinity` or vendor scripts), and raise `net.core.netdev_max_backlog` which caps the per-CPU packet queue. Physical-layer is fine; this is a CPU/softirq bottleneck.",
  },
  {
    id: "linux-m17-q10",
    question:
      "Which command, and which flag, gives you per-socket TCP internal metrics (congestion window, RTT, retransmits) for active connections?",
    choices: [
      { label: "A", text: "`netstat -s`" },
      { label: "B", text: "`ss -ti` — `-t` TCP, `-i` show per-socket internals (cwnd, rto, rtt, retrans, wscale, etc.)" },
      { label: "C", text: "`ip -s link`" },
      { label: "D", text: "`tcpdump -tttt`" },
    ],
    correctAnswer: "B",
    explanation:
      "`ss -ti` is the canonical way to inspect live TCP connection state: congestion window, smoothed RTT, retransmit counts, scaling, and more. `netstat -s` gives system-wide aggregates (still useful for trends). `ip -s link` shows interface-level counters, not per-flow. `tcpdump` captures packets, not socket state.",
  },
];
