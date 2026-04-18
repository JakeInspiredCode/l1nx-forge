import type { MCQuestion } from "@/lib/types/campaign";

// net-m01 "OSI & TCP/IP" — covers net-s1 (Layers, Frames, Packets) + net-s2 (TCP, UDP, Tools)

export const NET_M01_QUESTIONS: MCQuestion[] = [
  {
    id: "net-m01-q01",
    question:
      "When a user types a URL and hits Enter, the request is wrapped in multiple headers as it travels down the stack. In what order are the headers added, from outermost (first-seen on the wire) to innermost?",
    choices: [
      { label: "A", text: "HTTP → TCP → IP → Ethernet" },
      { label: "B", text: "Ethernet → IP → TCP → HTTP" },
      { label: "C", text: "IP → Ethernet → TCP → HTTP" },
      { label: "D", text: "TCP → HTTP → IP → Ethernet" },
    ],
    correctAnswer: "B",
    explanation:
      "On the wire, the outermost header is the Ethernet frame (L2), then the IP packet (L3), then the TCP segment (L4), and finally the HTTP request (L7) as payload. Each switch and router reads only the layer it cares about — ToRs look at MAC, routers look at IP, servers look at port and payload. Encapsulation is built bottom-up before transmission and peeled top-down on receipt.",
  },
  {
    id: "net-m01-q02",
    question:
      "You SSH into a server and confirm a web service is running. From your laptop, `ping <server-ip>` succeeds with 0.3 ms replies, but `curl http://<server-ip>/` hangs until timeout. What layer is most likely broken and what tool would confirm it fastest?",
    choices: [
      { label: "A", text: "L1 (physical) — swap the cable" },
      { label: "B", text: "L3 (network) — check the routing table" },
      { label: "C", text: "L4 (transport) — use `nc -zv <ip> <port>` or `ss -tln` on the server to confirm the port is listening and reachable" },
      { label: "D", text: "L7 (application) — restart the web service" },
    ],
    correctAnswer: "C",
    explanation:
      "`ping` uses ICMP, below L4 — so a successful ping proves L1–L3 are fine. The service is running, so L7 is fine on the server side. That leaves L4: the port is either blocked by a firewall, bound only to localhost, or being silently dropped. `ss -tln` on the server shows the bind address and port state; `nc -zv` from the laptop tests reachability directly. Don't touch the app until L4 is confirmed.",
  },
  {
    id: "net-m01-q03",
    question:
      "A developer insists on using UDP instead of TCP for an internal metrics stream that \"must not lose data.\" What's the core problem with this choice?",
    choices: [
      { label: "A", text: "UDP is always slower than TCP in a datacenter" },
      { label: "B", text: "UDP has no built-in reliability, ordering, or congestion control. \"Must not lose data\" on UDP means the application has to reimplement retransmission and ordering — exactly what TCP already does. Unless there's a latency reason to avoid TCP's setup, this is rebuilding TCP badly" },
      { label: "C", text: "UDP is not routable between subnets" },
      { label: "D", text: "UDP can't support IPv6" },
    ],
    correctAnswer: "B",
    explanation:
      "UDP is fire-and-forget — no handshake, no acknowledgments, no retries, no congestion control. A \"reliable UDP metrics stream\" ends up reimplementing ack/retry logic in the app, usually worse than TCP. UDP wins when you specifically want its properties: ultra-low overhead (DNS queries), fixed-rate streaming where stale data is worse than missing data (NTP, voice), or RDMA where the NIC handles reliability. Reliability over a bulk stream is TCP's home turf.",
  },
  {
    id: "net-m01-q04",
    question:
      "A host tries to open a TCP connection to port 443 on `10.0.5.12`. The TCP SYN is sent but no response arrives; after ~30 seconds the app reports `Connection timed out`. What's the most likely cause, and how does that differ from `Connection refused`?",
    choices: [
      { label: "A", text: "Timed out = no response at all, usually a firewall silently dropping the SYN or no route to the host. Refused = the host responded with RST (reset), so it's reachable but nothing is listening on that port" },
      { label: "B", text: "Both mean the same thing; the wording is just different in different tools" },
      { label: "C", text: "Timed out means the server is overloaded, refused means the firewall blocked it" },
      { label: "D", text: "Timed out means the port is open but slow, refused means the port is closed" },
    ],
    correctAnswer: "A",
    explanation:
      "`Connection timed out` means the SYN went out and nothing came back — most often a DROP-style firewall rule, no network route, or the destination host is down. `Connection refused` means a TCP RST came back — the host is up and reachable at L3/L4, but the port isn't accepting connections (nothing is listening, or a REJECT rule). The distinction tells you which layer is the problem without any other tool.",
  },
  {
    id: "net-m01-q05",
    question:
      "You're told that two servers in different racks should be using jumbo frames (MTU 9000), but throughput is capped at around the speed you'd expect for MTU 1500. What's the test that confirms whether jumbo frames are really configured end-to-end?",
    choices: [
      { label: "A", text: "`ping -M do -s 8972 <ip>` — if it fails but `-s 1472` succeeds, jumbo frames aren't configured end-to-end. Every switch, router, and endpoint has to agree on MTU, and anything in between set to 1500 will silently drop oversized packets when DF is set" },
      { label: "B", text: "Run `iperf3` and look at the throughput number" },
      { label: "C", text: "Check the NIC's `ethtool` output only on one server" },
      { label: "D", text: "Try `scp` of a large file and measure the speed" },
    ],
    correctAnswer: "A",
    explanation:
      "`ping -M do` sets the Don't-Fragment bit, forcing the packet to travel as-is. 8972 is the maximum data payload for MTU 9000 (9000 − 20 IP − 8 ICMP). If it fails, some hop doesn't accept 9000-byte packets and silently drops them. Throughput tests are indirect — you'd see the effect on throughput but not the cause. MTU must be consistent across every hop on the path.",
  },
  {
    id: "net-m01-q06",
    question:
      "A senior engineer asks you which of the six essential networking tools you'd grab first if users report \"the app is slow, but pings are fine.\" Why is `ping` misleading here and what replaces it?",
    choices: [
      { label: "A", text: "`mtr -n <ip>` — it runs continuously and shows per-hop latency and packet loss, catching a degraded hop that ping would miss by measuring only end-to-end round trip" },
      { label: "B", text: "`ethtool -i eth0` — because all slowness is NIC-related" },
      { label: "C", text: "`nslookup` — to check DNS" },
      { label: "D", text: "`ps aux` — because it's probably the app" },
    ],
    correctAnswer: "A",
    explanation:
      "`ping` measures one RTT at low rate and in one direction. It won't reveal packet loss under load, a flaky spine mid-path, or asymmetric latency. `mtr` keeps pinging every hop and shows loss percentage per hop, which is exactly how you find the spot where things are actually degrading. Combine with `ss -tn` for socket queue depth and `ethtool -S` for NIC-level drops — together they separate \"slow network\" from \"slow app\" from \"overloaded NIC.\"",
  },
  {
    id: "net-m01-q07",
    question:
      "Which statement about MAC addresses vs IP addresses is most accurate in a datacenter context?",
    choices: [
      { label: "A", text: "MAC addresses are assigned by DHCP; IPs are burned into the NIC" },
      { label: "B", text: "MAC addresses are L2, unique per NIC, used for forwarding within a broadcast domain; IPs are L3, routable across subnets, and can change as hosts move networks" },
      { label: "C", text: "MAC addresses are only used in IPv6; IPs are only used in IPv4" },
      { label: "D", text: "MAC addresses and IP addresses are interchangeable; you can use either at any layer" },
    ],
    correctAnswer: "B",
    explanation:
      "MAC addresses live at L2 — they're used for Ethernet frame forwarding within a single broadcast domain, unique per NIC, and change if you swap a NIC. IP addresses live at L3 — routable, assigned logically, and a given IP can move between NICs (via DHCP or manual config). ARP is the glue: your OS looks up the MAC for a destination IP on the local subnet, or for the default gateway's IP when sending to a remote subnet.",
  },
  {
    id: "net-m01-q08",
    question:
      "A developer asks why TCP needs a handshake at all — \"can't we just start sending data?\" What's the clearest explanation of what the handshake accomplishes?",
    choices: [
      { label: "A", text: "It synchronizes sequence numbers so each side can detect lost or out-of-order segments, confirms both directions of the path work, and negotiates options like window scaling and MTU/MSS before any application data flows" },
      { label: "B", text: "It's a historical artifact from early ARPANET that modern TCP could skip" },
      { label: "C", text: "It encrypts the connection" },
      { label: "D", text: "It's only needed when the client and server are in different time zones" },
    ],
    correctAnswer: "A",
    explanation:
      "The three-way handshake (SYN, SYN-ACK, ACK) does three jobs in one: (1) each side picks an initial sequence number and proves it can receive the other's, enabling reliable ordered delivery; (2) it verifies the return path works before sending application data; (3) TCP options are negotiated — window scaling, MSS, SACK, timestamps. UDP skips this but inherits none of the reliability.",
  },
  {
    id: "net-m01-q09",
    question:
      "You run `ss -tlnp` on a server and see: `LISTEN 0 128 127.0.0.1:5432`. A remote client can't connect to that port on the server. What's the problem and how do you fix it?",
    choices: [
      { label: "A", text: "The Postgres service is bound to localhost (127.0.0.1) only — it literally isn't listening on the external IP. Remote clients cannot reach it. Fix the bind address in the service config (e.g., `listen_addresses = '0.0.0.0'`) and restart the service" },
      { label: "B", text: "The firewall is blocking port 5432 — add an ACCEPT rule" },
      { label: "C", text: "The connection count is too low (128) — raise `somaxconn`" },
      { label: "D", text: "DNS isn't resolving — update /etc/hosts" },
    ],
    correctAnswer: "A",
    explanation:
      "The `127.0.0.1:5432` in `ss` output is the bind address. A service bound to `127.0.0.1` accepts connections only from the same host. Even with a wide-open firewall, remote clients can't reach it — the kernel never receives packets for that address on any other interface. Fixing the bind address (0.0.0.0 for all interfaces, or a specific IP) is the right answer; adjusting firewalls or connection limits solves neither this problem nor anything else.",
  },
  {
    id: "net-m01-q10",
    question:
      "An on-call engineer wants a discipline for triaging any network-feeling outage. What's the best general-purpose rule, and why is \"start with the application\" the wrong one?",
    choices: [
      { label: "A", text: "Work bottom-up through the layers (L1 link state → L2 ARP/MAC → L3 ping/route → L4 ss/nc → L7 curl/app). You stop at the lowest broken layer because anything above it depends on it working" },
      { label: "B", text: "Always restart the server first; most issues are caches" },
      { label: "C", text: "Start at the app layer because that's what users see" },
      { label: "D", text: "Rely on monitoring dashboards only; don't run commands by hand" },
    ],
    correctAnswer: "A",
    explanation:
      "Layer 7 depends on every layer below. If L3 is broken, L7 cannot work — and spending time reading app logs wastes effort. The discipline is bottom-up: is the link up? Can I ARP? Can I ping? Is the port reachable? Does the application respond? As soon as one layer fails, stop — everything above it will also fail. This triage order turns \"the network is broken\" into a concrete, actionable finding.",
  },
];
