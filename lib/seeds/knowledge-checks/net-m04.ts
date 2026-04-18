import type { MCQuestion } from "@/lib/types/campaign";

// net-m04 "DNS & Load Balancing" — covers net-s7 (DNS, DHCP) + net-s8 (Load Balancing, RDMA, AI Fabrics)

export const NET_M04_QUESTIONS: MCQuestion[] = [
  {
    id: "net-m04-q01",
    question:
      "You change the A record for `api.example.com` from 10.0.1.5 to 10.0.2.5. TTL is 3600. Immediately after the change, half your users still land on the old IP. How long until it's fully resolved, and what should have been done before the change?",
    choices: [
      { label: "A", text: "Up to 1 full TTL (3600s) for caches to expire; sticky clients and browsers can linger longer. The right prep is to lower the TTL (e.g., to 60s) at least one full old-TTL-duration before the change, then raise it back once the migration is stable" },
      { label: "B", text: "Caches expire immediately — users are seeing the old IP for another reason" },
      { label: "C", text: "The fix is to restart the client browsers" },
      { label: "D", text: "DNS changes always take effect instantly; it must be a firewall issue" },
    ],
    correctAnswer: "A",
    explanation:
      "Resolvers and client OSes cache until the TTL expires. Setting a new record doesn't purge old caches — it just says what to return *next* time someone asks. The standard prep is to pre-lower the TTL one full old-TTL duration before the planned cutover, so by change time only short caches remain. Afterwards, raise the TTL back for efficiency. Never ship a blind DNS cutover with a long TTL.",
  },
  {
    id: "net-m04-q02",
    question:
      "You run `dig api.example.com` from your workstation and get back `10.0.5.77`. But `curl http://api.example.com/` is resolving to a different IP. What's the most likely explanation?",
    choices: [
      { label: "A", text: "The OS resolver is pulling from another source ahead of DNS — `/etc/hosts`, systemd-resolved's cache, or an nsswitch-configured alternative. `getent hosts api.example.com` shows what the OS resolver actually returns, which may differ from what `dig` shows" },
      { label: "B", text: "`dig` and `curl` use different DNS servers by design and always disagree" },
      { label: "C", text: "The server has two IPs and one of them is broken" },
      { label: "D", text: "`curl` ignores DNS and connects by name" },
    ],
    correctAnswer: "A",
    explanation:
      "`dig` queries DNS directly. `curl` uses the OS resolver, which follows `/etc/nsswitch.conf` — often `files dns` meaning `/etc/hosts` wins before DNS. Containers, VPN clients, and systemd-resolved can also inject entries. `getent hosts <name>` shows what the OS actually hands to apps. When `dig` and `getent` disagree, something is overriding DNS locally — usually `/etc/hosts` or a DNS helper daemon.",
  },
  {
    id: "net-m04-q03",
    question:
      "Users report \"the website sometimes fails to load but works on retry.\" From a DC server, `curl` to the same hostname is always fast. What's a plausible DNS-related cause?",
    choices: [
      { label: "A", text: "A recursive resolver the clients depend on is intermittently failing. Their `/etc/resolv.conf` tries each listed server with a timeout; if the first is down, they fall back to the second after ~5s. `dig @<each-resolver> <hostname>` from a client confirms which resolver is slow or flaky" },
      { label: "B", text: "The DC server's DNS is faster, which makes clients slow" },
      { label: "C", text: "The site is returning 500s intermittently" },
      { label: "D", text: "DNS can't cause retries — it must be the app" },
    ],
    correctAnswer: "A",
    explanation:
      "Client resolvers use ordered lists and fall back on failure with ~5s timeouts by default. If the primary resolver is intermittently unreachable or slow, users get a mix of fast responses (resolver healthy) and retried-after-5s responses (fallback). DC-internal servers use different resolvers and wouldn't see it. Confirm by querying each resolver from a client machine. Fix: repair or remove the failing resolver; long-term, move to an HA anycast resolver.",
  },
  {
    id: "net-m04-q04",
    question:
      "A DC architect asks you to choose between L4 and L7 load balancing for a new HTTP service that needs path-based routing and canary deployments. What's the right choice, and why?",
    choices: [
      { label: "A", text: "L7 (HAProxy, Envoy, NGINX). L7 LBs parse the HTTP request — URL path, headers, cookies — which is required for path-based routing, canary traffic splits, and header-based A/B tests. L4 can't see above the TCP segment, so those features are impossible there" },
      { label: "B", text: "L4 — it's always faster so you should use it regardless" },
      { label: "C", text: "DNS round-robin, because it's the simplest" },
      { label: "D", text: "Either works identically for HTTP" },
    ],
    correctAnswer: "A",
    explanation:
      "L4 balances at the transport layer — IP + port, opaque payload — so it can't inspect HTTP paths or headers. L7 parses the full request and can route on any piece of it. Path-based routing, canary deploys, header-driven experiments, and authentication-aware policies all require L7. The cost is higher per-request overhead (hundreds of μs to ms), but for HTTP services that's usually acceptable and often trivial compared to backend response time.",
  },
  {
    id: "net-m04-q05",
    question:
      "An engineer asks why AI training clusters use RDMA instead of TCP. What's the most accurate answer?",
    choices: [
      { label: "A", text: "RDMA bypasses the kernel and moves data directly between remote memory regions (or GPU memory). TCP's per-packet CPU cost — interrupts, context switches, memcpy — would dominate at the bandwidths and latencies AI needs. RDMA delivers ~1–3 μs node-to-node, but requires a near-lossless fabric" },
      { label: "B", text: "TCP can't handle speeds above 10 Gb/s" },
      { label: "C", text: "RDMA encrypts everything and TCP doesn't" },
      { label: "D", text: "RDMA is required for IPv6" },
    ],
    correctAnswer: "A",
    explanation:
      "RDMA's core value is zero-copy, kernel-bypass data movement — the NIC writes directly to remote memory without CPU involvement after setup. This is essential for GPU training, where all-reduce operations move tens of GB between nodes every few ms. TCP's CPU cost per packet would collapse under that load. The tradeoff is strict fabric requirements: RDMA tolerates almost no packet loss, which is why RoCE needs carefully tuned PFC/ECN or InfiniBand's inherent flow control.",
  },
  {
    id: "net-m04-q06",
    question:
      "A GPU training job across 64 nodes runs fine for 20 minutes, then all-reduce times collapse to 1/5 of baseline. No GPUs have failed, no links are down. What class of problem is this, and what counters do you check first?",
    choices: [
      { label: "A", text: "Fabric-level distress — likely packet loss or PFC misconfiguration on the RoCE/IB path. Check per-port PFC pause counters and drop counters on the spines and leaves in the job's path. Rising PFC pauses point at congestion hot spots. If fabric-wide, DCQCN/ECN may need retuning" },
      { label: "B", text: "A user with a bad GPU is slowing the cluster" },
      { label: "C", text: "The PSU feed dropped voltage" },
      { label: "D", text: "DNS caches expired" },
    ],
    correctAnswer: "A",
    explanation:
      "RDMA fabrics are essentially lossless; small drop rates collapse throughput because retransmits are catastrophic. The usual suspects are PFC/ECN misconfiguration (bursts triggering pause frames that cascade and stall traffic), switch buffer exhaustion (a new job adds load on a shared path), or a fabric port silently dropping frames. PFC pause counters on the involved switches and drop counters on the spine reveal the hot spot. Long term fixes involve tuning DCQCN, lowering PFC thresholds, or isolating tenants on separate traffic classes.",
  },
  {
    id: "net-m04-q07",
    question:
      "A team deploys `/etc/hosts` entries for internal services \"because it's simpler than DNS.\" What's the long-term problem?",
    choices: [
      { label: "A", text: "Every host's `/etc/hosts` becomes a private, un-versioned copy of the service inventory. IPs change, hosts diverge, bugs become un-reproducible, and migrations require editing hundreds or thousands of files. DNS (or a service discovery system) exists precisely to avoid this" },
      { label: "B", text: "`/etc/hosts` has a size limit" },
      { label: "C", text: "It breaks IPv6" },
      { label: "D", text: "It isn't supported on modern Linux" },
    ],
    correctAnswer: "A",
    explanation:
      "`/etc/hosts` is fine for a handful of overrides (testing, dev loopbacks, emergency pins). As a primary source of truth for an internal service mesh, it's a maintenance nightmare — each host's file diverges over time, IP changes become fleet-wide edits, and debugging \"why does this host see a different IP?\" becomes detective work. DNS (or a proper service-discovery system like Consul, Kubernetes CoreDNS, etc.) exists to centralize name→IP mapping with caching and TTL semantics.",
  },
  {
    id: "net-m04-q08",
    question:
      "Two engineers argue about when to use anycast. Which framing is the most accurate summary of its strengths and limits?",
    choices: [
      { label: "A", text: "Anycast is excellent for stateless, connection-short services where any instance can answer (DNS, CDN caches, front-door LB VIPs). It uses the fabric's routing to distribute clients to the topologically nearest instance. Limits: long-lived stateful connections can be reshuffled between instances when routing changes, so session state needs to live somewhere consistent (shared store, consistent hashing)" },
      { label: "B", text: "Anycast only works for TCP" },
      { label: "C", text: "Anycast requires a central coordinator" },
      { label: "D", text: "Anycast is only useful on the public internet" },
    ],
    correctAnswer: "A",
    explanation:
      "Anycast's strength: multiple independent instances advertise the same IP; the network's routing picks the nearest one for each client with no coordination overhead. Ideal for DNS resolvers (`8.8.8.8`), CDN edges, and scale-out L4 load-balancer tiers. Its weakness: if routing changes mid-connection (a BGP reconvergence), a stateful session may shift to a different instance that has no context. Mitigations: keep state in a shared backend, use consistent hashing on the LB, or accept that connections occasionally reset. Stateless or short-lived connections avoid this entirely.",
  },
];
