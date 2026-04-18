import type { ChapterSection } from "@/lib/types/chapter";

// ═══════════════════════════════════════════════════════════════════════════
// Operation Net Sweep — Networking chapters (net-s1 .. net-s8)
// Each mission (net-m01..net-m04) pulls from 2 chapter sections.
// ═══════════════════════════════════════════════════════════════════════════

// ── net-m01 OSI & TCP/IP ───────────────────────────────────────────────────

const netS1: ChapterSection = {
  id: "net-s1",
  topicId: "networking",
  title: "Layers, Frames, and Packets",
  subtitle: "What actually happens when you type a URL and hit Enter.",
  icon: "≡",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "You run `curl https://api.prod.example.com/v1/health` from your laptop. Behind that one second, your machine builds a **stack of headers**, sticks the payload at the bottom, hands the whole thing to a **network card**, which sends electrical pulses down a copper cable to a **switch**, which forwards it through a **router**, which sends it across wider pipes to the datacenter, where the **reverse happens** on the way up to the server's application. Every layer has its own job, its own addressing, and its own way of failing.",
    },
    {
      kind: "prose",
      html:
        "The **layered model** is the single most useful piece of intuition in networking. When something breaks, you don't debug \"the network.\" You debug the specific layer that failed, using tools that target that layer.",
    },
    { kind: "heading", level: 3, text: "The layers you care about" },
    {
      kind: "table",
      headers: ["Layer", "Name", "Addresses", "Example", "Tools"],
      rows: [
        ["L1", "Physical", "—", "Electrons on copper, photons on fiber", "cable tester, fiber scope, `ethtool`"],
        ["L2", "Data link (Ethernet)", "MAC addresses", "A frame on the same VLAN", "`ip link`, `arp`, `ip neigh`"],
        ["L3", "Network (IP)", "IPv4 / IPv6 addresses", "A packet routed across subnets", "`ping`, `traceroute`, `ip route`"],
        ["L4", "Transport (TCP/UDP)", "Port numbers", "An HTTPS connection on 443", "`ss`, `tcpdump`, `nc`"],
        ["L7", "Application", "URLs, headers", "The HTTP request itself", "`curl`, `wget`, browser devtools"],
      ],
    },
    {
      kind: "prose",
      html:
        "The **OSI model** has seven layers; **TCP/IP** collapses them to four (Link, Internet, Transport, Application). In practice you only need to think about L2, L3, L4, and L7. L5 and L6 rarely surface in operational work.",
    },
    { kind: "heading", level: 3, text: "Encapsulation — headers on headers" },
    {
      kind: "prose",
      html:
        "Your HTTP request isn't sent directly. Each layer wraps the one above it, like an onion:",
    },
    {
      kind: "code",
      label: "WHAT'S ACTUALLY ON THE WIRE",
      language: "text",
      code:
        "┌── Ethernet ─────────────────────────────────────────────┐\n│ dst MAC │ src MAC │ 802.1Q (VLAN) │                       │\n│         ┌── IP ───────────────────────────────────────┐     │\n│         │ dst IP (10.0.5.12) │ src IP (10.0.5.77) │ │     │\n│         │         ┌── TCP ──────────────────────┐  │     │\n│         │         │ dst port 443 │ src port 52138│  │     │\n│         │         │         ┌── TLS/HTTP ───┐  │  │     │\n│         │         │         │ GET /v1/health│  │  │     │\n│         │         │         └────────────────┘  │  │     │\n│         │         └────────────────────────────┘  │     │\n│         └────────────────────────────────────────────┘    │\n└──────────────────────────────────────────────────────────┘",
    },
    {
      kind: "prose",
      html:
        "Every switch and router on the path reads **just the layer it cares about**. The ToR switch looks at the MAC; the leaf-spine router looks at the IP; the server's kernel looks at the TCP port; the application looks at the HTTP URL. This division is why networks scale.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Debugging by layer — the universal rule",
      body:
        "If something doesn't work, ask *which layer failed*. L1 — is the link up? L2 — can I see the gateway's MAC in `ip neigh`? L3 — does `ping` reach the destination? L4 — does `ss -tln` show the port listening? L7 — does the HTTP response actually come back? You stop as soon as one layer fails, because everything above it will fail too.",
    },
    { kind: "heading", level: 3, text: "Addresses at each layer" },
    {
      kind: "bullets",
      items: [
        "**MAC address** (L2) — 48-bit hardware address burned into every NIC. Format `aa:bb:cc:11:22:33`. Unique per interface. Changes when you swap a NIC.",
        "**IP address** (L3) — the logical address. IPv4 is 32-bit (`10.0.5.77`); IPv6 is 128-bit (`2001:db8::1`). Can change as hosts move networks.",
        "**Port** (L4) — a 16-bit number naming a specific service on a host. `443` is HTTPS, `22` is SSH, `53` is DNS. An OS can have tens of thousands of concurrent connections by multiplexing ports.",
        "**URL / hostname** (L7) — human-readable. `api.prod.example.com` is resolved to an IP via DNS before any packet leaves.",
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "Your laptop can `curl` a service successfully. Your teammate's laptop, on the same Wi-Fi, using the same URL, gets `Connection refused`. Where do you start looking, and why not start at the application?",
      hint: "Start at the lowest layer that differs between the two laptops.",
      answer:
        "Work bottom-up on the layer that could differ. L3 first: does their laptop resolve the hostname to the same IP (`dig api.prod.example.com`)? If a different IP, DNS is the suspect — maybe a split-horizon DNS, or a stale `/etc/hosts` entry. If the same IP, does `ping` work from both? If L3 is clean, check L4: does `nc -zv <ip> 443` succeed from the failing laptop? `Connection refused` usually means L4 reached the host but nothing is listening — often a firewall rule, VPN route, or NAT quirk specific to that laptop's network path. You don't touch the app until L1–L4 are proven equal.",
    },
    { kind: "heading", level: 3, text: "Why this matters operationally" },
    {
      kind: "prose",
      html:
        "A datacenter technician who can **name the layer a problem lives on** is 10× more effective than one who can't. \"The network is slow\" becomes \"L3 traceroute shows a 40ms hop between spine 3 and spine 4\" — an actionable finding a network engineer can reason about. Every layered tool (`tcpdump`, `ss`, `ethtool`, `ip route`) is a lens focused on one layer. Learning which lens to grab when is the core skill.",
    },
    {
      kind: "knowledge-check",
      question:
        "A user reports that an internal web app is \"broken.\" You SSH into the server hosting it and confirm the process is running. From your laptop you can `ping` the server's IP and get replies, but loading the web page hangs indefinitely. Which layer is most likely the problem, what tool do you grab first, and what are the two most likely causes?",
      answer:
        "L4 is the suspect. `ping` uses ICMP (below L4), so a successful ping proves L1–L3 are healthy. The service is running on the server, so L7 on the server side is fine. That leaves something between your L4 traffic and the server's L4 stack. Grab `nc -zv <server-ip> <port>` or `ss -tln` on the server. The two most common causes: (1) a firewall rule blocking the port (iptables/nftables on the host, or a security group upstream), or (2) the service is listening on `127.0.0.1` instead of `0.0.0.0`, so it accepts no external connections — `ss -tln` shows the bind address and confirms it instantly.",
    },
  ],
};

const netS2: ChapterSection = {
  id: "net-s2",
  topicId: "networking",
  title: "TCP, UDP, and the Essential Tools",
  subtitle: "How a connection is made, and the six commands that solve most outages.",
  icon: "⇄",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "Two transport protocols carry nearly all the traffic in a datacenter. **TCP** is the reliable, ordered, connection-oriented one — used by SSH, HTTPS, most APIs, databases, and file transfers. **UDP** is the fire-and-forget one — used by DNS queries, NTP, streaming, and RoCE/RDMA. They each won their corners of the network for specific reasons.",
    },
    {
      kind: "table",
      headers: ["", "TCP", "UDP"],
      rows: [
        ["Connection setup", "3-way handshake (SYN, SYN-ACK, ACK)", "None — just send"],
        ["Reliability", "Acknowledgments, retransmits, ordering", "None — packets can be lost or reordered"],
        ["Congestion control", "Slows down when the network is busy", "None — the app must handle it"],
        ["Overhead per packet", "~20 byte header + state per connection", "~8 byte header, no state"],
        ["When it wins", "Anything where losing data is unacceptable", "Latency-sensitive, real-time, or very low-overhead workloads"],
        ["Common ports", "22 SSH, 80 HTTP, 443 HTTPS, 3306 MySQL", "53 DNS, 123 NTP, 161 SNMP, 4789 VXLAN"],
      ],
    },
    { kind: "heading", level: 3, text: "The TCP three-way handshake" },
    {
      kind: "prose",
      html:
        "Every TCP connection starts with three packets — the **handshake** — before any application data flows. This is where many \"connection refused\" and \"connection timed out\" problems show up:",
    },
    {
      kind: "code",
      label: "THE HANDSHAKE",
      language: "text",
      code:
        "Client                                Server\n  │  ───── SYN (seq=x) ─────────→       │   \"hello, I want to connect\"\n  │  ←──── SYN-ACK (seq=y, ack=x+1) ──  │   \"hello back, here's my seq\"\n  │  ───── ACK (ack=y+1) ─────────→     │   \"got it, let's go\"\n  │                                      │\n  │  ◂══════ established ═══════▸       │   application data flows",
    },
    {
      kind: "bullets",
      items: [
        "**No response to SYN** — firewall silently dropped it, or there's no route. Shows up as `Connection timed out`.",
        "**RST (reset) instead of SYN-ACK** — the host is reachable but nothing is listening on that port. Shows up as `Connection refused`.",
        "**SYN-ACK arrives but ACK never does** — asymmetric routing; return path is broken. Half-open connections pile up server-side.",
      ],
    },
    {
      kind: "prose",
      html:
        "\"Connection refused\" vs \"timed out\" is a **free diagnostic**: the first means you reached the host but not the service; the second means you didn't reach the host at all. Different causes, different fixes.",
    },
    { kind: "heading", level: 3, text: "MTU — the size of a single packet" },
    {
      kind: "prose",
      html:
        "Every link has a **Maximum Transmission Unit**: the largest single packet it accepts. Ethernet defaults to **1500 bytes**; storage and HPC fabrics often use **9000-byte jumbo frames** for efficiency (fewer packets = less CPU per GB). If MTU mismatches somewhere on the path and the DF (\"don't fragment\") bit is set, the packet gets dropped silently — a classic \"it works locally, fails over VPN\" bug.",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "The MTU test",
      body:
        "Run `ping -M do -s 1472 <ip>` (1472 = 1500 − 20 IP header − 8 ICMP header). If that works and `-s 8972` fails on a supposedly-jumbo path, jumbo frames aren't configured end-to-end. Every switch, router, and both endpoints need to agree on MTU or jumbo traffic gets blackholed.",
    },
    { kind: "heading", level: 3, text: "The six tools that solve most outages" },
    {
      kind: "code",
      label: "YOUR GO-TO KIT",
      language: "bash",
      code:
        "ping 10.0.5.12                    # L3 reachability + round-trip time\ntraceroute 10.0.5.12              # every hop on the path\nmtr -n 10.0.5.12                  # live traceroute + per-hop loss % — the best one\nss -tlnp                          # which TCP ports are listening, owned by which process\ntcpdump -nni eth0 port 443        # show every matching packet in real time\nethtool -S eth0                   # NIC-level counters: drops, errors, link speed",
    },
    {
      kind: "bullets",
      items: [
        "**`ping`** — does ICMP go there and come back? Round-trip time? Packet loss?",
        "**`traceroute`** / **`mtr`** — *which hop* is adding latency or dropping packets? `mtr` is the one you want because it runs continuously and shows loss per hop.",
        "**`ss`** (`ss -tlnp`) — what is this host actually listening on? Replaces old `netstat`.",
        "**`tcpdump`** — the truth-teller. When nothing else makes sense, capture packets and look at what's actually on the wire.",
        "**`ethtool`** — link speed, duplex, driver counters, transceiver status. The NIC's own view of reality.",
        "**`ip`** (`ip addr`, `ip route`, `ip link`, `ip neigh`) — the modern replacement for `ifconfig` and friends. Every L2/L3 thing on a Linux host is visible through `ip`.",
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "You deploy a new HTTP service on port 8080. From the server itself, `curl http://localhost:8080/` works. From another host on the same subnet, `curl http://<server-ip>:8080/` hangs until timeout. `ping <server-ip>` from the other host succeeds. What's probably happening?",
      hint: "What changes between `localhost` and an external IP?",
      answer:
        "Two likely causes. First: the service is bound only to `127.0.0.1`, not to `0.0.0.0`. On the server run `ss -tlnp | grep 8080` — if you see `127.0.0.1:8080`, the service literally can't be reached from anywhere else; fix the bind address in the app config. Second: a firewall (iptables/nftables/firewalld) is dropping the inbound packet. `sudo iptables -L INPUT -n -v` or equivalent shows the rules. The hang (rather than `Connection refused`) hints at a DROP rule — a REJECT would return RST, a DROP silently discards. `tcpdump -nni eth0 port 8080` from the server confirms whether the SYN is arriving at all.",
    },
    {
      kind: "knowledge-check",
      question:
        "A team reports their app is \"suddenly slow since this morning.\" Pings to the app server show about 0.4 ms — same as always. What tool do you reach for next, what exactly are you looking for, and why is ping misleading here?",
      answer:
        "Reach for `mtr` (or `traceroute`) and for `ss` / `ethtool -S` on the endpoints. `ping` measures ICMP on a single RTT — it's useful for reachability but tells you nothing about bandwidth, packet loss at higher rates, or per-hop latency. `mtr -n <ip>` running for a minute shows per-hop loss and jitter, pinpointing whether the degradation is a specific hop (usually a congested uplink or a flaky spine). On the server, `ethtool -S eth0` exposes `rx_errors`, `rx_dropped`, and similar — NIC-level problems that don't register as ping loss. `ss -tn 'state established'` plus its `Send-Q`/`Recv-Q` columns tells you whether TCP sockets are backed up (slow app, not slow network).",
    },
  ],
};

// ── net-m02 Switching & VLANs ──────────────────────────────────────────────

const netS3: ChapterSection = {
  id: "net-s3",
  topicId: "networking",
  title: "Switching, MAC Learning, and ARP",
  subtitle: "What the ToR switch actually does with each frame.",
  icon: "⊞",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "At the top of every rack sits a **Top-of-Rack (ToR) switch** — 48 ports on the front facing servers, 4–8 high-speed uplinks on the back reaching up to the spines. Nothing else in the datacenter pulls its weight as silently. A good ToR forwards **millions of frames per second** with sub-microsecond latency and you will almost never think about it — until one port starts dropping packets at 3 AM.",
    },
    { kind: "heading", level: 3, text: "A switch is a MAC-address machine" },
    {
      kind: "prose",
      html:
        "A **switch** operates at L2. It doesn't care about IP addresses. It cares about **MAC addresses** — 48-bit hardware identifiers like `aa:bb:cc:11:22:33` burned into every NIC. Its job is: *given a frame with a destination MAC, get it out the right port — and only that port — as fast as possible.*",
    },
    {
      kind: "prose",
      html:
        "To do that, the switch keeps a **MAC address table** (sometimes called the CAM or forwarding table). It fills the table by **learning**:",
    },
    {
      kind: "bullets",
      items: [
        "A frame arrives on port 12 with source MAC `aa:bb:cc:11:22:33`. The switch records: *MAC `aa:bb:cc:11:22:33` is on port 12.*",
        "Next frame arrives for destination MAC `aa:bb:cc:11:22:33`. The switch looks it up and forwards **only out port 12**.",
        "If the destination MAC isn't in the table yet, the switch **floods** the frame out every port except the one it came in on. The reply teaches it where to go.",
      ],
    },
    {
      kind: "prose",
      html:
        "Table entries **age out** after a few minutes of silence (default ~300 seconds on most switches). That's why a host that's been idle for a while may briefly receive a flooded frame as the network \"remembers\" where it lives.",
    },
    { kind: "heading", level: 3, text: "ARP — bridging L3 to L2" },
    {
      kind: "prose",
      html:
        "Your OS wants to send an IP packet to `10.0.5.12`. But the NIC only speaks Ethernet — it needs a destination MAC. How does it translate?",
    },
    {
      kind: "prose",
      html:
        "**ARP** (Address Resolution Protocol). Your host broadcasts: *\"Who has 10.0.5.12? Tell 10.0.5.77.\"* The host that owns that IP replies: *\"10.0.5.12 is at aa:bb:cc:11:22:33.\"* Your OS caches the mapping and uses the MAC from then on. That cache is the **neighbor table**, visible with `ip neigh`:",
    },
    {
      kind: "code",
      label: "ARP / NEIGHBOR CACHE",
      language: "bash",
      code:
        "ip neigh show                  # current IP→MAC mappings on this host\nip neigh show dev eth0         # scoped to one interface\nip neigh flush all             # wipe the cache (forces re-ARP)\narping -I eth0 10.0.5.12       # manually ARP a target — useful for duplicate IP detection",
    },
    {
      kind: "callout",
      variant: "info",
      title: "ARP only works inside a broadcast domain",
      body:
        "Because ARP is a broadcast, it's scoped to a single L2 segment (same VLAN / same subnet). Your host never ARPs for a remote IP — it ARPs for its **default gateway**, then sends the packet there. The gateway ARPs its own neighbors. Each L3 hop does its own ARP on its own segment.",
    },
    { kind: "heading", level: 3, text: "Broadcast domains and why they're dangerous at scale" },
    {
      kind: "prose",
      html:
        "A **broadcast domain** is the set of hosts that all see the same broadcast frame. Every ARP request, every DHCP discover, every gratuitous ARP floods all of them. With 50 hosts in a VLAN, that's fine. With 5,000 it's a problem — **broadcast storms** and **ARP storms** can saturate a switch's CPU and crush everything on the segment.",
    },
    {
      kind: "prose",
      html:
        "This is a big reason modern datacenters **keep broadcast domains small**. Each rack is often its own subnet (often its own /24 or /26), with routing — L3 — between racks. Broadcast traffic never leaves the rack.",
    },
    { kind: "heading", level: 3, text: "STP — and why DCs killed it" },
    {
      kind: "prose",
      html:
        "Older networks used **Spanning Tree Protocol (STP)** to prevent loops in an L2 network. STP picks a root switch and deliberately **blocks** redundant links so frames don't circulate forever. The cost: the blocked links are wasted, reconvergence after a failure takes seconds (or longer on old STP), and configuration mistakes cause dramatic outages.",
    },
    {
      kind: "prose",
      html:
        "Modern DCs sidestep STP by using **L3 to every ToR** (leaf-spine with BGP) — no L2 between racks, no loops to worry about, every link is active. You'll still see STP on small enterprise networks and management VLANs, but the high-performance fabric runs L3.",
    },
    {
      kind: "think-about-it",
      scenario:
        "Two servers on the same subnet have accidentally been configured with the *same* IP address, `10.0.5.12`. Intermittently, connections to `10.0.5.12` go to the wrong server. What's happening at L2, and how would you confirm?",
      hint: "Whichever MAC answered the last ARP wins — and that can flip.",
      answer:
        "It's a duplicate-IP / ARP race. Both hosts respond to ARP requests for `10.0.5.12`. Other hosts' neighbor caches store whichever reply arrived most recently — and that can flip as each sends gratuitous ARPs or answers real ones. Result: connections oscillate between the two real hosts depending on whose MAC is currently cached on the switch and the client. Confirm with `arping -I eth0 10.0.5.12` from a third host — you'll see **two different MACs replying** to the same IP. Other tells: `dmesg | grep 'duplicate address'` on Linux, or switch logs warning about MAC flaps on two ports.",
    },
    {
      kind: "knowledge-check",
      question:
        "A server's NIC is replaced during a maintenance window. When the host comes back up, it can reach its default gateway just fine, but other hosts on the same subnet can't reach the server for about 5 minutes. Why, and how would you speed up recovery?",
      answer:
        "The NIC swap changed the server's **MAC address**. Other hosts still have the old MAC cached in their ARP tables; until those entries age out (~300 seconds default), they send frames to a MAC that no longer exists and the switch either floods or drops them. The server can reach outbound because it initiates its own fresh ARPs. To speed recovery, the server can send a **gratuitous ARP** announcing its new MAC — `arping -U -I eth0 <own-ip>` — which prompts neighbors and the ToR's MAC table to update immediately. Most Linux distros do this automatically on link-up, but it's worth knowing why the delay exists and how to force the update.",
    },
  ],
};

const netS4: ChapterSection = {
  id: "net-s4",
  topicId: "networking",
  title: "VLANs, Trunks, and LACP",
  subtitle: "One wire, ten networks, and how two cables become one bonded pipe.",
  icon: "⌘",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "Your ToR switch has 48 ports. You want to use it for production traffic, a management network, and a storage network — three logically separate networks that shouldn't mix. You could buy three switches. Or you could use **VLANs**: a way to carve up a single switch (and a single cable, via trunks) into many isolated L2 networks.",
    },
    { kind: "heading", level: 3, text: "What a VLAN actually is" },
    {
      kind: "prose",
      html:
        "A **VLAN** (Virtual LAN) is a number — an ID between 1 and 4094 — that's stamped onto Ethernet frames as they traverse switches. Frames tagged with different VLAN IDs **never see each other** at L2, even on the same physical switch. To cross VLANs you must go through a router (L3) that has legs in both.",
    },
    {
      kind: "table",
      headers: ["VLAN", "Purpose", "Typical subnet"],
      rows: [
        ["10", "Production data", "10.0.10.0/24"],
        ["20", "Management (BMC, switch mgmt)", "10.0.20.0/24"],
        ["30", "Storage", "10.0.30.0/24"],
        ["40", "Backup", "10.0.40.0/24"],
      ],
    },
    { kind: "heading", level: 3, text: "Access vs trunk ports" },
    {
      kind: "bullets",
      items: [
        "**Access port** — belongs to exactly one VLAN. Frames arriving untagged are placed on that VLAN; frames leaving are sent untagged. This is what a normal server connects to — the server doesn't know or care that VLANs exist.",
        "**Trunk port** — carries multiple VLANs. Frames are **tagged** with a 4-byte `802.1Q` header carrying the VLAN ID. Used between switches, or to a server that needs to be on multiple VLANs (a hypervisor, for example).",
      ],
    },
    {
      kind: "code",
      label: "LINUX VLAN INTERFACES ON A TRUNK",
      language: "bash",
      code:
        "# Create a VLAN sub-interface for VLAN 30 on eth0\nip link add link eth0 name eth0.30 type vlan id 30\nip addr add 10.0.30.77/24 dev eth0.30\nip link set eth0.30 up\n\n# See all VLAN interfaces\nip -d link show | grep -B1 vlan",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The native-VLAN trap",
      body:
        "Trunks have a **native VLAN** — frames on this VLAN are sent *untagged*. If both sides don't agree on the native VLAN, untagged frames silently land on the wrong VLAN. This is a classic security issue (**VLAN hopping**) and a classic debugging nightmare. Best practice: set the native VLAN to an unused ID, and configure all real VLANs as tagged.",
    },
    { kind: "heading", level: 3, text: "LACP — two cables, one pipe" },
    {
      kind: "prose",
      html:
        "A single 25 Gb/s cable isn't enough, or you want redundancy in case one fails. **LACP** (IEEE 802.3ad Link Aggregation Control Protocol) lets you bundle 2, 4, or more physical links into one logical interface that:",
    },
    {
      kind: "bullets",
      items: [
        "**Multiplies bandwidth** — 2× 25G links give you up to 50 Gb/s *in aggregate* (not for a single flow).",
        "**Survives failures** — pulling a cable is transparent; traffic shifts to the remaining members.",
        "**Balances traffic** using a hash (typically of `src-ip + dst-ip + src-port + dst-port`). Each flow sticks to one member, preventing packet reordering.",
      ],
    },
    {
      kind: "prose",
      html:
        "LACP is **symmetric** — both the switch side and the server side must be configured for it, with matching hash policy and link-partner selection. Mismatches cause intermittent packet loss that's brutally hard to diagnose.",
    },
    {
      kind: "code",
      label: "LINUX LACP BOND",
      language: "bash",
      code:
        "# Create an LACP bond with eth0 + eth1 as members\nip link add bond0 type bond mode 802.3ad miimon 100 lacp_rate fast\nip link set eth0 master bond0\nip link set eth1 master bond0\nip link set bond0 up\n\n# Inspect\ncat /proc/net/bonding/bond0   # member status, LACP partner info, hash policy",
    },
    {
      kind: "prose",
      html:
        "The important state to check in `/proc/net/bonding/bond0`: each slave's **Aggregator ID** must match its partner — if they don't, LACP isn't actually running. Also check the **hash policy** (`layer2`, `layer2+3`, `layer3+4`) — `layer3+4` gives the best flow distribution for most DC workloads.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You bond two 25G NICs with LACP and expect ~50 Gb/s between two servers. A single `iperf3` between them tops out at ~24 Gb/s. Is the bond broken?",
      hint: "What does \"per flow\" mean for hashing?",
      answer:
        "The bond is fine. LACP distributes **flows** across members, and a single `iperf3` connection is one flow that hashes to one member — giving you ~25 Gb/s. To prove the aggregate works, run `iperf3` with `-P 8` (8 parallel streams) or multiple instances with different source ports; you'll see traffic split across both members and approach 50 Gb/s. This is LACP working as designed — it improves **aggregate** throughput and reliability, not single-flow speed. If you need 50 Gb/s for one flow, buy a 50 Gb/s NIC.",
    },
    {
      kind: "knowledge-check",
      question:
        "A new hypervisor is plugged into a trunk port that should carry VLANs 10, 20, and 30. The hypervisor's management IP on VLAN 20 is reachable, but VMs on VLANs 10 and 30 can't talk to anything. What's likely misconfigured, and how do you confirm?",
      answer:
        "Two classic candidates. (1) The trunk on the switch side is allowing only VLAN 20 (the native VLAN for that port), not 10 and 30 — the switch config's `switchport trunk allowed vlan` list is incomplete. (2) The hypervisor's VLAN sub-interfaces (or virtual-switch tagging) aren't created for 10 and 30. Confirm from the server with `tcpdump -nni eth0 -e vlan` — if you see no tagged frames for 10 or 30 arriving, the switch side is blocking them. If you see them arriving but the VMs still can't use them, the hypervisor's bridge isn't forwarding them. Also compare the switch's `show interface trunk` against what you expect. Native-VLAN mismatches cause the same symptom too — if the hypervisor is tagging VLAN 20 while the switch expects it untagged, the management traffic would fail while 10/30 would work, so the direction of the mismatch matters.",
    },
  ],
};

// ── net-m03 IP & Routing ────────────────────────────────────────────────────

const netS5: ChapterSection = {
  id: "net-s5",
  topicId: "networking",
  title: "IPv4, Subnetting, and Routing",
  subtitle: "CIDR math, default gateways, and reading a routing table.",
  icon: "⌖",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "You're on-call. A new rack has been provisioned with the subnet `10.42.128.0/22`. Someone asks you: *\"How many usable host addresses is that, and what's the first and last?\"* You have 10 seconds. This is the moment CIDR math pays for itself.",
    },
    { kind: "heading", level: 3, text: "IPv4 in one paragraph" },
    {
      kind: "prose",
      html:
        "An IPv4 address is **32 bits**, written as four octets in dotted decimal: `10.0.5.77`. Each octet is 0–255. A **subnet mask** (or CIDR prefix) says how many of those 32 bits are the *network portion*; the rest are the *host portion*. `/24` means the first 24 bits are the network, and the remaining 8 bits (256 values) are host addresses on that subnet.",
    },
    {
      kind: "table",
      headers: ["CIDR", "Mask", "Hosts on the subnet", "Typical use"],
      rows: [
        ["/32", "255.255.255.255", "1 (a single host)", "Loopback, host route"],
        ["/31", "255.255.255.254", "2 (point-to-point link)", "Router-to-router"],
        ["/30", "255.255.255.252", "2 usable", "Small point-to-point"],
        ["/29", "255.255.255.248", "6 usable", "Tiny segments"],
        ["/24", "255.255.255.0", "254 usable", "Rack or small subnet"],
        ["/22", "255.255.252.0", "1022 usable", "Large rack or cluster"],
        ["/16", "255.255.0.0", "65,534 usable", "Data center zone"],
        ["/8", "255.0.0.0", "16,777,214 usable", "Entire private block"],
      ],
    },
    {
      kind: "prose",
      html:
        "The two reserved addresses per subnet are the **network address** (all host bits zero, e.g., `10.0.5.0`) and the **broadcast address** (all host bits one, e.g., `10.0.5.255`). That's why `/24` has 256 addresses but only **254 usable** hosts.",
    },
    { kind: "heading", level: 3, text: "Private vs public — RFC 1918" },
    {
      kind: "prose",
      html:
        "Three IPv4 ranges are reserved as **private** — they cannot be routed on the public internet. Datacenters use them internally:",
    },
    {
      kind: "bullets",
      items: [
        "**`10.0.0.0/8`** — 16M addresses. Most common in large DCs.",
        "**`172.16.0.0/12`** — 1M addresses. Often used by smaller infra or VPNs.",
        "**`192.168.0.0/16`** — 65K addresses. Common on home / small-office networks.",
      ],
    },
    { kind: "heading", level: 3, text: "The default gateway" },
    {
      kind: "prose",
      html:
        "Your host knows how to reach addresses **on its own subnet** — it ARPs for the MAC and sends directly. For any other address, it sends the packet to its **default gateway** — the router that knows how to reach the rest of the world. The gateway is configured per host (via DHCP or static config) and lives at a specific IP on the local subnet, by convention usually `.1` (`10.0.5.1`).",
    },
    { kind: "heading", level: 3, text: "Reading the routing table" },
    {
      kind: "code",
      label: "LINUX ROUTING COMMANDS",
      language: "bash",
      code:
        "ip addr show                  # interfaces and their IPs/subnets\nip route show                 # the routing table\nip route get 10.42.0.7        # which route would be taken for this destination?\nip -s link show eth0          # per-interface packet counters\nip rule show                  # policy routing rules (multi-homed hosts)",
    },
    {
      kind: "code",
      label: "TYPICAL `ip route` OUTPUT",
      language: "text",
      code:
        "default via 10.0.5.1 dev eth0 proto dhcp metric 100\n10.0.5.0/24 dev eth0 proto kernel scope link src 10.0.5.77\n169.254.0.0/16 dev eth0 scope link metric 1000",
    },
    {
      kind: "prose",
      html:
        "The kernel matches the **most specific prefix** (longest prefix match) — a `/32` beats a `/24` beats a `/0` (the default route). The **metric** is the tiebreaker when multiple routes match at the same specificity (lower metric wins).",
    },
    {
      kind: "callout",
      variant: "info",
      title: "The on-call subnet reflex",
      body:
        "When someone asks \"is this host on my subnet?\", do the bit test: AND the host IP with the subnet mask and compare to the network address. Or, cheat: `ip route get <ip>` on the host — if the answer's `dev` is a local interface (not the default gateway), it's on a local subnet.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A host has IP `10.0.5.77/24` and default gateway `10.0.5.1`. A user reports they can ping `10.0.5.12` but not `10.0.6.12`. What's the most likely cause?",
      hint: "Both IPs are just two octets apart — but are they on the same subnet?",
      answer:
        "With `/24` the subnet is `10.0.5.0–10.0.5.255`. `10.0.5.12` is on-subnet (direct L2 delivery via ARP); `10.0.6.12` is off-subnet and must go through the default gateway. If the gateway can't reach `10.0.6.0/24` — no route, ACL blocking it, or the gateway itself is misconfigured — you see exactly this pattern. Check `ip route get 10.0.6.12` on the host (should show `via 10.0.5.1`), then `ping 10.0.5.1` to confirm the gateway is alive, then `traceroute 10.0.6.12` to see where the path breaks. If the host were missing a default gateway at all, even `ping 10.0.6.12` from your own machine would fail with `Network is unreachable` rather than timing out.",
    },
    {
      kind: "knowledge-check",
      question:
        "Your cluster uses the supernet `10.42.0.0/16`. A new rack needs to be carved out with exactly 256 addresses (254 usable) for its hosts. What CIDR would you assign, how many such subnets fit in the supernet, and what single command would confirm whether a given host IP is inside the supernet?",
      answer:
        "A **`/24`** gives you 256 addresses, 254 usable. A `/16` contains **256 `/24`s** (2^(24-16)). To confirm a host is inside the supernet from Linux: `ip route get <host-ip>` — if your routing for `10.42.0.0/16` goes out the right interface, any address inside that prefix will match that route; anything outside will match the default. For a pure \"does this IP belong to that prefix\" test without any routing setup, `python3 -c 'import ipaddress; print(ipaddress.ip_address(\"10.42.7.12\") in ipaddress.ip_network(\"10.42.0.0/16\"))'` does it, or `ipcalc 10.42.7.12/16` shows the subnet boundaries.",
    },
  ],
};

const netS6: ChapterSection = {
  id: "net-s6",
  topicId: "networking",
  title: "Leaf-Spine, BGP, and ECMP",
  subtitle: "The fabric that moves a million packets per second per GPU.",
  icon: "⌬",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "Old DC networks were built as trees: a core layer, distribution, and access — with **STP** disabling half the links to prevent loops. That design collapsed under AI-scale traffic. A modern DC fabric is a **leaf-spine** — every rack's ToR is a leaf, and every leaf connects to every spine switch. No loops, no STP, every link active, predictable hop count. This is the fabric an all-reduce operation runs on.",
    },
    { kind: "heading", level: 3, text: "The shape of a leaf-spine" },
    {
      kind: "code",
      label: "LEAF-SPINE (8 leaves, 4 spines, simplified)",
      language: "text",
      code:
        "              ┌──────────────────────────────────────┐\n              │            Spine layer               │\n              │   S1       S2       S3       S4       │\n              └───┬────────┬────────┬────────┬────────┘\n                  │  (full mesh between spines and leaves)\n         ┌────────┼────────┼────────┼────────┼────────┐\n         │    ┌───┴───┐┌───┴───┐┌───┴───┐┌───┴───┐    │\n         │    │  L1   ││  L2   ││  ...  ││  L8   │    │\n         │    └───┬───┘└───┬───┘└───┬───┘└───┬───┘    │\n         │   servers  servers   servers  servers      │\n         │        ↑ 48 per leaf, 4 uplinks up ↑       │\n         └─────────────────────────────────────────────┘",
    },
    {
      kind: "bullets",
      items: [
        "Every host is exactly **3 hops** from every other host: leaf → spine → leaf. Predictable latency.",
        "With N spines, each leaf has N uplinks — losing one spine just drops 1/N of the bandwidth, not connectivity.",
        "Capacity scales by **adding spines**. No core-layer upgrade, no re-cabling.",
        "The number of leaves it can support is bounded by the number of ports on a spine — large DCs use two-level fabrics (**super-spine**) to go further.",
      ],
    },
    { kind: "heading", level: 3, text: "L3 everywhere, BGP to the ToR" },
    {
      kind: "prose",
      html:
        "Modern fabrics run **L3 down to every ToR** — each rack is its own subnet, and every switch is a router. The protocol that distributes routes is **BGP**, yes, the same one that powers the internet. Used at the DC scale it goes by names like **BGP-to-the-host** or **BGP unnumbered** depending on the design.",
    },
    {
      kind: "table",
      headers: ["", "Internet BGP (eBGP)", "DC fabric BGP"],
      rows: [
        ["Peering", "Between autonomous systems, often over long distances", "Between every leaf and every spine, inside one building"],
        ["Policy", "Complex — business relationships, attributes", "Simple — load-balance by ECMP, filter a few prefixes"],
        ["Convergence", "Seconds to minutes", "Sub-second (BFD timers, fast reconvergence)"],
        ["Scale", "Tens of thousands of AS's globally", "Hundreds or thousands of switches in one DC"],
      ],
    },
    {
      kind: "prose",
      html:
        "Why BGP and not OSPF? At DC scale BGP is **simpler to operate**: flat peer relationships, clear policies, massive software and tooling ecosystem. OSPF's flooding behavior and area design become hard to manage at thousands-of-devices scale.",
    },
    { kind: "heading", level: 3, text: "ECMP — the magic of parallel paths" },
    {
      kind: "prose",
      html:
        "Between any leaf and any spine you might have only one link. But between **two leaves**, there are N paths — one through each spine. **ECMP** (Equal-Cost Multi-Path) is how the fabric uses all of them at once.",
    },
    {
      kind: "prose",
      html:
        "For each packet, the switch hashes a set of header fields — typically `src IP + dst IP + src port + dst port + protocol` — and picks a spine based on the hash modulo N. Identical flows go the same way (no reordering), different flows spread across spines (max throughput).",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "Hash polarization — one spine is hot, the rest are cold",
      body:
        "If every hop in the fabric hashes the *same way*, flows that get sent to spine 1 at layer 1 also get sent to super-spine 1 at layer 2, piling up on one path. This is **hash polarization**. Mitigations: use a different hash seed at each tier, hash on different header fields, or add entropy (e.g., UDP source port jitter in VXLAN/GENEVE encaps). Monitoring spine utilization catches it.",
    },
    { kind: "heading", level: 3, text: "Elephant flows" },
    {
      kind: "prose",
      html:
        "ECMP load-balances **flows**, not bytes. A long-lived, high-bandwidth flow — an **elephant flow** like a GPU-to-GPU all-reduce or a storage replication stream — will saturate whichever spine it's hashed to, while other spines idle. GPU fabrics fight this with finer-grained load balancing (per-packet, per-flowlet, or adaptive routing in RoCE and InfiniBand). In normal TCP fabrics, the only real answer is enough spines that a single elephant doesn't matter.",
    },
    {
      kind: "code",
      label: "INSPECTING FABRIC BEHAVIOR FROM A HOST",
      language: "bash",
      code:
        "traceroute -n 10.42.7.12        # which spine is this flow taking right now?\n# Repeat with different src ports and you'll see different paths:\nfor p in 52000 52001 52002 52003 52004; do\n  tcpdump -nni eth0 -c 1 &\n  curl --local-port $p http://10.42.7.12/ > /dev/null\ndone\nethtool -S eth0 | grep -iE 'drop|error|rx|tx'",
    },
    {
      kind: "think-about-it",
      scenario:
        "A DC operator finds that spine 3 in their 4-spine fabric runs consistently hotter than spine 1, 2, and 4 — ~75% utilization vs ~45% on the others. Traffic patterns look normal. What are the two most likely causes and what would you investigate?",
      hint: "Think about what could make the ECMP hash prefer spine 3 specifically.",
      answer:
        "Two likely explanations. (1) **Hash polarization** — the fabric is using the same hash function across multiple tiers, so flows that landed on spine 3 at one layer also land on it at the next. Look at the hash seeds on the leaves and spines; introducing different seeds per tier, or switching to a `layer3+4` hash that includes transport ports, usually fixes it. (2) **An elephant flow** — one long-lived high-throughput connection is pinned to spine 3 because it hashes there, and it's simply big. `show interface counters` on each spine identifies the port carrying it; from there you can trace it back to a source. Fix options: wait it out, kill the flow, or (for GPU fabrics) enable adaptive routing so the NICs break the flow across spines.",
    },
    {
      kind: "knowledge-check",
      question:
        "Your leaf-spine has 4 spines and 16 leaves. One spine is removed for maintenance. How much does aggregate capacity drop, what's the observable symptom on a well-behaved fabric, and what *would* it look like on a fabric without ECMP?",
      answer:
        "Capacity drops by about 25% — one of four equal paths is gone. On a well-behaved fabric with ECMP, flows just rehash onto the remaining three spines; aggregate throughput caps at 75% of peak, but connectivity is uninterrupted and there's no packet loss once convergence settles. The observable symptoms are raised utilization on the remaining spines and slightly higher tail latency on flows that rehashed. Without ECMP — a single-path fabric — removing a spine either kills all traffic that was pinned to it (if the control plane hasn't rerouted) or causes a multi-second reconvergence event with packet loss. This is why leaf-spine with ECMP is the DC default.",
    },
  ],
};

// ── net-m04 DNS & Load Balancing ───────────────────────────────────────────

const netS7: ChapterSection = {
  id: "net-s7",
  topicId: "networking",
  title: "DNS, DHCP, and Name Resolution",
  subtitle: "The invisible infrastructure everyone blames when anything breaks.",
  icon: "◬",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "A pager goes off: *\"half the region can't reach payments.example.com.\"* In the next 30 seconds of triage, someone will say *\"is it DNS?\"* — and they'll be right about 40% of the time. DNS is the glue that lets your laptop, your laptop's 100 tabs, your 10,000-server fleet, and the internet all agree that `payments.example.com` means `10.42.5.77`. When the glue dries out, everything falls apart.",
    },
    { kind: "heading", level: 3, text: "What DNS actually does" },
    {
      kind: "prose",
      html:
        "DNS (**Domain Name System**) is a distributed, cached, hierarchical key-value store: names to values. Its fundamental operations:",
    },
    {
      kind: "bullets",
      items: [
        "A **client** wants to resolve `api.example.com`.",
        "It asks its **recursive resolver** (`/etc/resolv.conf`, usually a local DC server or `8.8.8.8`).",
        "The resolver asks **root** servers, then **TLD** servers (`.com`), then the **authoritative** servers for `example.com`, then returns the answer.",
        "Every step caches for the record's **TTL** (Time To Live) — seconds to days.",
      ],
    },
    { kind: "heading", level: 3, text: "The record types that actually show up" },
    {
      kind: "table",
      headers: ["Record", "Meaning", "Example"],
      rows: [
        ["A", "hostname → IPv4", "`api.example.com. 300 A 10.42.5.77`"],
        ["AAAA", "hostname → IPv6", "`api.example.com. 300 AAAA 2001:db8::1`"],
        ["CNAME", "alias → another hostname", "`www.example.com. 300 CNAME api.example.com.`"],
        ["PTR", "IP → hostname (reverse)", "`77.5.42.10.in-addr.arpa. 300 PTR api.example.com.`"],
        ["MX", "mail server for the domain", "`example.com. 3600 MX 10 mail.example.com.`"],
        ["SRV", "service location (`_<svc>._<proto>`)", "`_ldap._tcp.example.com. 3600 SRV 0 0 389 ldap.example.com.`"],
        ["TXT", "free text (SPF, verifications)", "`example.com. 3600 TXT \"v=spf1 ~all\"`"],
        ["NS", "authoritative server for a zone", "`example.com. 86400 NS ns1.example.com.`"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "TTL — the knob you turn before a migration",
      body:
        "The TTL on a record tells resolvers how long to cache. Default values are typically 5 minutes to 1 hour. Before a planned IP change, lower the TTL (e.g., to 60 s) a **full old-TTL-duration ahead of time** so caches expire quickly. After the change is stable, raise it back for efficiency.",
    },
    { kind: "heading", level: 3, text: "The DNS tools you need" },
    {
      kind: "code",
      label: "DNS CLI KIT",
      language: "bash",
      code:
        "dig api.example.com                 # full response incl. TTL, answer section\ndig +short api.example.com          # just the IP\ndig @8.8.8.8 api.example.com        # force a specific resolver\ndig api.example.com MX              # ask for a specific record type\ndig -x 10.42.5.77                   # reverse lookup (PTR)\nhost api.example.com                # shorter output, defaults to all types\ngetent hosts api.example.com        # what the *OS* resolver returns, via nsswitch",
    },
    {
      kind: "prose",
      html:
        "`dig` goes straight to DNS. `getent hosts` goes through **nsswitch.conf** — which may include `/etc/hosts`, `mdns`, or other sources. A discrepancy between the two means something is overriding DNS locally (stale `/etc/hosts`, a container-local resolver, an `NSS` module). Knowing which one you're using while debugging is critical.",
    },
    { kind: "heading", level: 3, text: "DHCP — automatic addressing" },
    {
      kind: "prose",
      html:
        "**DHCP** (Dynamic Host Configuration Protocol) hands out IP addresses, masks, gateways, and DNS servers to hosts on boot. The four-step dance is **DORA**: **D**iscover (broadcast from client) → **O**ffer (from server) → **R**equest (from client) → **A**cknowledge (from server). The client ends up with a time-limited **lease** on an IP and the config to use it.",
    },
    {
      kind: "bullets",
      items: [
        "**Dynamic pool** — random IP from a range. Common on office networks.",
        "**DHCP reservation** — a fixed IP assigned to a specific MAC. Common in DCs where \"static but not hard-coded\" is the right spot.",
        "**Pure static** — burned into the host's config. Used for switches, gateways, and DNS servers themselves (things that need to work before DHCP does).",
      ],
    },
    { kind: "heading", level: 3, text: "Why DNS issues are uniquely painful" },
    {
      kind: "bullets",
      items: [
        "**Caching hides root causes** — your authoritative fix may take minutes or hours to propagate depending on TTLs and intermediate caches.",
        "**Fallback behavior is inconsistent** — glibc's resolver, systemd-resolved, and Go's resolver have different retry and timeout defaults; one service might tolerate a flaky DNS server while another implodes.",
        "**Partial outages cascade** — services that fail DNS lookups often retry aggressively, overloading the working resolvers in a feedback loop.",
        "**It's often not DNS.** Before blaming DNS, confirm: `dig` works, but `curl` doesn't? That rules DNS out.",
      ],
    },
    {
      kind: "think-about-it",
      scenario:
        "Users report: *\"The website is slow and sometimes fails to load, but it eventually works after a retry.\"* From a server in the same DC, `curl` to the same hostname is consistently fast. What's a plausible DNS-related cause, and how would you confirm?",
      hint: "Clients and DC-internal hosts may use different resolvers.",
      answer:
        "Plausible scenario: one of the recursive resolvers the users depend on is slow or intermittently failing, while the DC-internal resolver used by the server is healthy. Client resolvers typically try each name server in `/etc/resolv.conf` with a timeout — if the first one is down, the second takes over after ~5s, exactly matching \"sometimes fails, works after retry.\" Confirm by running `dig @<each-resolver> <hostname>` from a client machine, measuring response time and success rate. Also check `dig +trace <hostname>` to see if any authoritative servers are slow. Fix: remove or fix the failing resolver; long-term, lower resolver timeouts and use a highly-available anycast resolver.",
    },
    {
      kind: "knowledge-check",
      question:
        "You update the A record for `api.example.com` from `10.0.1.5` to `10.0.2.5`. TTL was 1 hour. Immediately after, half your users still land on the old IP. What's happening, how long until it's fully resolved, and what should you have done differently before the change?",
      answer:
        "The old IP is still cached in intermediate resolvers and in client OS caches — they'll keep handing it out until their cached record expires. Worst case is **one full TTL** after your change (one hour here), though sticky clients and browser caches can sometimes hold on longer. The standard prep is to **pre-lower the TTL** a full old-TTL-duration before the planned change: set TTL to 60 seconds 1+ hour before the cutover, then perform the change, then raise TTL back afterward once things are stable. Pre-lowering gives you a tight propagation window at the moment of change; leaving a long TTL means you're committed to an hour of \"users stuck on the old IP.\"",
    },
  ],
};

const netS8: ChapterSection = {
  id: "net-s8",
  topicId: "networking",
  title: "Load Balancing, RDMA, and AI Fabrics",
  subtitle: "From a front-door VIP to a thousand GPUs doing lossless all-reduce.",
  icon: "⎔",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "Two very different \"load balancers\" live in a modern DC. The one most people picture — an HAProxy or Envoy at the front door, spreading HTTPS traffic across a fleet of web servers. And a very different one — the **fabric itself** spreading GPU all-reduce traffic across hundreds of links with sub-microsecond coordination. They share the same word and almost nothing else. This section walks both.",
    },
    { kind: "heading", level: 3, text: "L4 vs L7 load balancing" },
    {
      kind: "table",
      headers: ["", "L4 (transport)", "L7 (application)"],
      rows: [
        ["Inspects", "IP + port; opaque payload", "Full HTTP request — headers, path, cookies"],
        ["Routing decisions", "Per TCP connection", "Per HTTP request"],
        ["Stateful", "Connection tracking", "Yes + session, sticky, auth awareness"],
        ["Latency overhead", "Microseconds", "Hundreds of μs to milliseconds"],
        ["Example software", "IPVS, Maglev, LVS, HW ASICs", "HAProxy, Envoy, NGINX, Traefik"],
        ["When to use", "Raw TCP/UDP, arbitrary protocols, ultra-low latency", "HTTP routing, path-based rules, A/B tests"],
      ],
    },
    { kind: "heading", level: 3, text: "Anycast and ECMP as load balancing" },
    {
      kind: "prose",
      html:
        "**Anycast** is a beautifully simple idea: announce the *same IP* from many physical locations, and let the network's routing choose the nearest one. Clients using that IP are automatically distributed by topology. Used extensively for DNS (`1.1.1.1`, `8.8.8.8`), CDN edges, and DC-wide load-balancer VIPs.",
    },
    {
      kind: "prose",
      html:
        "Inside a DC, anycast + ECMP means: N load balancers advertise the same VIP; the spine's ECMP hash spreads incoming connections across them with no coordination between the LBs. Add a new LB, announce the VIP, done. Remove one, withdraw, connections drain onto the others.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Consistent hashing — why clients don't break when LBs come and go",
      body:
        "Naive hashing rebalances **every** flow when the pool changes — connections break. Consistent hashing (**Maglev** / **rendezvous** / **ring hashing**) rebalances only ~1/N of flows when one instance joins or leaves, so most clients don't notice. This is why modern L4 LBs (Katran, Maglev) use it by default.",
    },
    { kind: "heading", level: 3, text: "RDMA — the kernel gets out of the way" },
    {
      kind: "prose",
      html:
        "In a GPU training cluster, a single all-reduce step might move **tens of GB** between nodes every few milliseconds. If each byte went through the kernel's TCP stack — interrupts, context switches, memcpy, syscalls — the CPUs would melt and throughput would collapse. **RDMA** (Remote Direct Memory Access) is the trick that makes it feasible: one node's NIC writes directly into another node's memory, with zero CPU involvement after setup.",
    },
    {
      kind: "bullets",
      items: [
        "**Kernel bypass** — user-space libraries (libibverbs) talk to the NIC directly via pinned memory queues.",
        "**Zero-copy** — data moves from GPU memory to NIC to remote NIC to remote GPU memory, never through CPU RAM.",
        "**Ultra-low latency** — ~1–3 μs node-to-node (vs ~30+ μs for a tuned TCP path).",
        "**Requires lossless networks** — RDMA tolerates almost no packet drops; a dropped packet collapses throughput.",
      ],
    },
    { kind: "heading", level: 3, text: "RoCE vs InfiniBand" },
    {
      kind: "table",
      headers: ["", "RoCE (RDMA over Ethernet)", "InfiniBand"],
      rows: [
        ["Physical layer", "Standard Ethernet switches and NICs", "Purpose-built IB switches and HCAs"],
        ["Speeds", "100/200/400/800 GbE", "NDR 400 Gb/s, XDR 800 Gb/s, roadmap continues"],
        ["Latency", "~2–5 μs", "~1–2 μs"],
        ["Lossless mechanism", "PFC + ECN (see below) — painful to tune", "Credit-based flow control — inherently lossless"],
        ["Operational familiarity", "Ethernet-native — same tooling as the rest of the DC", "Separate ecosystem, separate expertise"],
        ["Cost", "Lower per port, existing switch ecosystem", "Higher, purpose-built"],
      ],
    },
    {
      kind: "prose",
      html:
        "Which one a cluster uses usually comes down to who built it and what they're comfortable operating. Many of the largest AI training clusters publicly document both choices. The performance difference is small if RoCE is tuned correctly and catastrophic if it isn't.",
    },
    { kind: "heading", level: 3, text: "ECN and PFC — how Ethernet pretends to be lossless" },
    {
      kind: "bullets",
      items: [
        "**ECN** (Explicit Congestion Notification) — when a switch queue is filling up, it marks packets so the endpoints slow down *before* it drops anything. RoCE's congestion control (DCQCN) uses this.",
        "**PFC** (Priority Flow Control / 802.1Qbb) — a heavier hammer. The switch sends pause frames on a specific priority class, telling the upstream to stop sending *that class* for a few microseconds until the queue drains.",
        "**The tuning trap** — set PFC thresholds too tight and small bursts stop traffic; too loose and you drop packets. Miscalibrated PFC is one of the most common causes of mysterious RoCE cluster slowdowns.",
        "**Head-of-line blocking / deadlocks** — if PFC pauses ripple through multiple hops and form a cycle, the entire fabric can freeze. Modern designs mitigate this with careful traffic-class engineering.",
      ],
    },
    {
      kind: "code",
      label: "HEALTH CHECKS FOR A RoCE / IB FABRIC",
      language: "bash",
      code:
        "ibstat                              # IB: port state, speed, lid, LinkUp\nibv_devinfo                         # verbose device info, active MTU\nibping -S                           # latency tests (run with -S on server, -c on client)\nib_write_bw                         # bandwidth test over RDMA write\nethtool -S eth0 | grep -i pfc       # RoCE: PFC pause counters — any non-zero is worth a look\nmlnx_qos -i eth0                    # Mellanox QoS / PFC config on a NIC\nshow interface priority-flow-control  # switch-side (varies by vendor)",
    },
    {
      kind: "think-about-it",
      scenario:
        "A GPU training job across 64 nodes runs fine for 20 minutes, then throughput collapses to 20% and stays there. No GPUs have failed; no links are down. All-reduce times spike from 5 ms to 200 ms. What kind of problem is this, and what do you investigate first?",
      hint: "RoCE is lossless — until it isn't.",
      answer:
        "Classic RoCE / fabric-level distress. A likely candidate is packet loss on the fabric: a switch buffer overflowing, a PFC misconfiguration, or a flapping port dropping packets. RDMA cannot tolerate loss — even a tiny drop rate collapses throughput. First checks: per-port **PFC pause counters** and drop counters on the spines and leaves involved in the job's path. Any non-zero PFC pauses that are climbing point at congestion hot spots. On the NIC side, `ethtool -S` for RoCE ports and `ibv_devinfo` / `ibstat` for IB. If one specific spine or leaf shows rising errors, drain it. If PFC pauses are fabric-wide, ECN and PFC need retuning (lower thresholds, ensure DCQCN is on). Worth checking: did a new job start at the 20-minute mark that's creating congestion on a shared path? Elephant flows from one tenant can damage another via shared queues.",
    },
    {
      kind: "knowledge-check",
      question:
        "You're designing a front-door load-balancing tier for an internal DC service. Describe when you'd pick each of these three options — (a) anycast + ECMP with L4 LBs (Katran-style), (b) a single HAProxy/Envoy cluster behind a VIP, and (c) DNS round-robin — and name the main weakness of each.",
      answer:
        "(a) **Anycast + ECMP + L4 LB**: best for very high-throughput, stateless, TCP/UDP traffic where you want horizontal scale without central coordination. Weakness: per-request routing is L4 only — no HTTP-aware features (path routing, cookies, canary). Requires BGP in the fabric. (b) **HAProxy / Envoy L7 LB cluster**: best for HTTP services that need path-based routing, retries, rate limiting, or session affinity. Weakness: per-connection CPU cost is higher, and the LB cluster itself is now a critical path you must make HA — often combined with anycast *in front of* the LB cluster to get both. (c) **DNS round-robin**: simplest option — just return multiple A records and let clients pick. Weakness: clients cache aggressively, cache doesn't react to failures, and most resolvers return records in non-uniform order, so real load distribution is poor. Fine for casual internal tools, wrong answer for real traffic.",
    },
  ],
};

// ── Registry ────────────────────────────────────────────────────────────────

export const NETWORKING_CHAPTERS: ChapterSection[] = [
  netS1,
  netS2,
  netS3,
  netS4,
  netS5,
  netS6,
  netS7,
  netS8,
];
