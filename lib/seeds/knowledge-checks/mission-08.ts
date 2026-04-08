import type { MCQuestion } from "@/lib/types/campaign";

// Mission 8: "Networking Basics"
// Covers: Section 8 (IPv4, private ranges, ports, TCP/UDP, DNS, SSH)

export const MISSION_08_QUESTIONS: MCQuestion[] = [
  {
    id: "m08-q01",
    question: "A server's IP address is `10.42.5.100`. Can this address be reached from the public internet?",
    choices: [
      { label: "A", text: "Yes — all IP addresses are publicly routable" },
      { label: "B", text: "Only if the server has a DNS record" },
      { label: "C", text: "No — `10.0.0.0/8` is a private range, only reachable within the local network" },
      { label: "D", text: "Yes, but only over IPv6" },
    ],
    correctAnswer: "C",
    explanation: "`10.0.0.0/8` is one of three private IP ranges (along with `172.16.0.0/12` and `192.168.0.0/16`). Private addresses are not routed on the public internet. Datacenters use them internally.",
  },
  {
    id: "m08-q02",
    question: "A service is running on port 443. What service is this most likely?",
    choices: [
      { label: "A", text: "SSH" },
      { label: "B", text: "DNS" },
      { label: "C", text: "HTTPS" },
      { label: "D", text: "MySQL" },
    ],
    correctAnswer: "C",
    explanation: "Port 443 = HTTPS (encrypted web traffic). Port 22 = SSH, Port 53 = DNS, Port 3306 = MySQL. Memorizing well-known ports lets you identify services at a glance.",
  },
  {
    id: "m08-q03",
    question: "You can ping a server by IP (`10.42.5.50`) but not by hostname (`webserver01`). What is most likely broken?",
    choices: [
      { label: "A", text: "The server's firewall is blocking hostname-based connections" },
      { label: "B", text: "The network cable is faulty" },
      { label: "C", text: "The server's NIC has failed" },
      { label: "D", text: "DNS — the system that translates hostnames to IP addresses is not resolving this name" },
    ],
    correctAnswer: "D",
    explanation: "If IP works but hostname doesn't, the server is reachable — the name resolution is failing. Check DNS configuration (`/etc/resolv.conf`), the DNS server itself, or `/etc/hosts`.",
  },
  {
    id: "m08-q04",
    question: "A database uses TCP. A monitoring agent sends metrics via UDP. Why the different protocols?",
    choices: [
      { label: "A", text: "Databases are larger, so they need a bigger protocol" },
      { label: "B", text: "TCP guarantees delivery (critical for database transactions); UDP is faster with no delivery guarantee (acceptable for metrics that come every few seconds)" },
      { label: "C", text: "TCP is encrypted; UDP is not" },
      { label: "D", text: "TCP is newer and databases require modern protocols" },
    ],
    correctAnswer: "B",
    explanation: "TCP retransmits lost packets — essential when every database write must arrive. UDP sends and forgets — faster, and if one metric packet is lost, the next one arrives in seconds anyway.",
  },
  {
    id: "m08-q05",
    question: "What does SSH provide that makes it the #1 protocol for datacenter operations?",
    choices: [
      { label: "A", text: "Encrypted remote command-line access to servers — you can manage thousands of servers from your desk" },
      { label: "B", text: "Graphical remote desktop with hardware acceleration" },
      { label: "C", text: "Automatic software updates over the network" },
      { label: "D", text: "File synchronization between servers" },
    ],
    correctAnswer: "A",
    explanation: "SSH gives you an encrypted, authenticated command-line session on a remote server. It's how every datacenter technician interacts with servers that may be thousands of miles away.",
  },
  {
    id: "m08-q06",
    question: "The subnet mask for a /24 network is `255.255.255.0`. How many usable host addresses does this allow?",
    choices: [
      { label: "A", text: "256" },
      { label: "B", text: "255" },
      { label: "C", text: "254 — subtract network address and broadcast address" },
      { label: "D", text: "24" },
    ],
    correctAnswer: "C",
    explanation: "A /24 has 256 total addresses (2^8). Subtract 1 for the network address and 1 for the broadcast address = 254 usable host addresses.",
  },
  {
    id: "m08-q07",
    question: "You run `ss -tlnp` and see `*:22` with process `sshd`. What does this mean?",
    choices: [
      { label: "A", text: "sshd is trying to connect to port 22 on another server" },
      { label: "B", text: "sshd is listening on port 22 on all network interfaces, ready to accept incoming SSH connections" },
      { label: "C", text: "Port 22 is blocked by the firewall" },
      { label: "D", text: "sshd has crashed and port 22 is orphaned" },
    ],
    correctAnswer: "B",
    explanation: "`*:22` means listening on port 22 on all interfaces (`*` = any IP). The process is `sshd`. This is normal — the SSH daemon is ready for incoming connections.",
  },
  {
    id: "m08-q08",
    question: "You run `ethtool eth0` and see `Speed: 25000Mb/s` and `Link detected: yes`. What does this tell you?",
    choices: [
      { label: "A", text: "The server is transferring data at 25 Gbps right now" },
      { label: "B", text: "The NIC is connected at 25 Gbps and the physical link is up — but this is the maximum speed, not current throughput" },
      { label: "C", text: "The NIC has failed and is reporting a false speed" },
      { label: "D", text: "The switch port is configured for 25 Gbps but the cable doesn't support it" },
    ],
    correctAnswer: "B",
    explanation: "`ethtool` shows the negotiated link speed and whether a physical connection exists. 25 Gbps is the link capacity, not current usage. `Link detected: yes` confirms the cable and switch port are working.",
  },
  {
    id: "m08-q09",
    question: "A datacenter uses `10.42.0.0/16` internally. How many hosts can this network contain?",
    choices: [
      { label: "A", text: "42" },
      { label: "B", text: "256" },
      { label: "C", text: "65,534 — a /16 gives 16 bits for host addresses" },
      { label: "D", text: "16 million" },
    ],
    correctAnswer: "C",
    explanation: "A /16 leaves 16 bits for hosts: 2^16 = 65,536 total addresses, minus 2 (network + broadcast) = 65,534 usable. That's enough for a large datacenter's internal network.",
  },
  {
    id: "m08-q10",
    question: "Port 53 serves DNS. DNS queries typically use UDP. Why would a DNS response switch to TCP?",
    choices: [
      { label: "A", text: "TCP is always faster for DNS" },
      { label: "B", text: "When the DNS response is too large for a single UDP packet (>512 bytes), it falls back to TCP for reliable delivery" },
      { label: "C", text: "TCP is used for secure DNS only" },
      { label: "D", text: "It never switches — DNS is UDP only" },
    ],
    correctAnswer: "B",
    explanation: "DNS uses UDP for speed on small queries. If the response is too large (zone transfers, DNSSEC), it falls back to TCP which handles large payloads reliably. That's why firewalls must allow both TCP and UDP on port 53.",
  },
];
