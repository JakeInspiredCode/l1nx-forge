import type { MCQuestion } from "@/lib/types/campaign";

// linux-m19 "Cascading Failures" — covers lxa-s13 (Anatomy) + lxa-s14 (Incident Response)

export const LINUX_M19_QUESTIONS: MCQuestion[] = [
  {
    id: "linux-m19-q01",
    question:
      "A single DNS resolver returns SERVFAIL for one internal hostname. Within minutes, traffic to every service that depends on that hostname has risen to 3x normal. What pattern is this?",
    choices: [
      { label: "A", text: "A retry storm — each client retries 3× on failure, amplifying load on the already-struggling resolver and its downstream" },
      { label: "B", text: "A memory leak" },
      { label: "C", text: "DDoS from outside" },
      { label: "D", text: "Healthy client behavior" },
    ],
    correctAnswer: "A",
    explanation:
      "Retry storms are the archetypal cascading-failure amplifier. A brief failure plus any retry mechanism produces amplified load, which worsens the failure, which produces more retries. Brakes that defeat it: exponential backoff with jitter, capped retry counts, and circuit breakers that stop retrying when downstream health is bad.",
  },
  {
    id: "linux-m19-q02",
    question:
      "Your service's error rate is flat at 0.1% but retry rate has climbed from 0.1% to 5% across the fleet. p99 latency is drifting up. What should you do?",
    choices: [
      { label: "A", text: "Ignore it — errors are flat" },
      { label: "B", text: "Scale up the downstream — more capacity for the load" },
      { label: "C", text: "Treat it as an early-phase retry storm: investigate what's triggering the retries, consider rate-limiting or reducing retry counts before user-facing errors appear" },
      { label: "D", text: "Restart all clients" },
    ],
    correctAnswer: "C",
    explanation:
      "Retries that succeed leave error rate looking fine — but the *load* from retries is real, and rising p99 means downstream is starting to strain. Caught here, you break the loop with a rate limit or reduced retry count. Caught 10 minutes later, p50 has followed p99 up and you're in a full cascade. Scaling up during a cascade often makes it worse by adding amplifier instances.",
  },
  {
    id: "linux-m19-q03",
    question:
      "A service under memory pressure starts spending 80% of its time in garbage collection. Throughput drops 95%. Queue depth grows, needing more memory. What's the failure pattern and the fix?",
    choices: [
      { label: "A", text: "GC death spiral — memory pressure causes more GC, which slows throughput, which grows queue, which worsens memory pressure. Fix: bounded queues that reject excess traffic, memory headroom, horizontal scaling before the spiral starts" },
      { label: "B", text: "Disk-full cascade" },
      { label: "C", text: "DNS resolution failure" },
      { label: "D", text: "Network saturation" },
    ],
    correctAnswer: "A",
    explanation:
      "The GC death spiral is a classic positive feedback loop: low resources → slow work → more buffered work → lower resources. The fix is to break the loop — bounded queues that reject when full (so the pile doesn't grow unboundedly) and enough memory headroom that the spiral doesn't start. Scaling *out* (more instances) addresses it if caught early.",
  },
  {
    id: "linux-m19-q04",
    question:
      "During a cascading failure, your instinct is to add capacity. Why is that often the wrong move?",
    choices: [
      { label: "A", text: "New instances can't be provisioned during an incident" },
      { label: "B", text: "New instances join the amplifier: they hit the same slow downstream, build their own retry queues, and worsen overall load. Stabilize first (load shedding, breaking the amplifier), then scale" },
      { label: "C", text: "Autoscaling is disabled in production" },
      { label: "D", text: "Scaling is cheaper at 4 AM" },
    ],
    correctAnswer: "B",
    explanation:
      "In a cascade, the bottleneck is usually not capacity — it's the amplifier. More instances add to the amplification (more clients, more retry traffic, more connection-pool strain on the struggling service). Shed load first (rate limits, circuit breakers, reduced retry counts); once the loop is broken and the system is stabilizing, *then* add capacity. 'Stop amplifying before you scale' is the rule.",
  },
  {
    id: "linux-m19-q05",
    question:
      "A service is exhibiting elevated p99 latency while p50 is fine. What's the most likely early-stage failure mode?",
    choices: [
      { label: "A", text: "All traffic is affected uniformly" },
      { label: "B", text: "A small subset of requests is hitting a slow path — one bad instance behind a load balancer, pool exhaustion on some code path, or a downstream hiccup affecting some fraction of calls" },
      { label: "C", text: "Clock drift" },
      { label: "D", text: "The monitoring system is broken" },
    ],
    correctAnswer: "B",
    explanation:
      "Divergence between p50 and p99 is the textbook early-warning signal of uneven system health. Something is slow for *some* requests — a single bad pod behind a load balancer, a connection-pool exhaustion on one code path, a localized downstream failure. Acting at this stage often prevents a full cascade; waiting until p50 climbs means the problem has spread.",
  },
  {
    id: "linux-m19-q06",
    question:
      "Your team is responding to a SEV-1 incident. Someone suggests paging a senior SRE for help, but hesitates — \"we should try another 15 minutes first.\" What's the better call, and why?",
    choices: [
      { label: "A", text: "Page immediately — the cost of paging someone at minute 5 of an incident is cheap; the cost of escalating at minute 45 after the cascade has spread is expensive" },
      { label: "B", text: "Wait 15 minutes — you don't want to disturb senior staff" },
      { label: "C", text: "Wait until morning" },
      { label: "D", text: "Post in the general channel and hope someone volunteers" },
    ],
    correctAnswer: "A",
    explanation:
      "Escalation is cheap; unhandled cascades are expensive. Senior engineers expect to be paged on SEV-1s, are not insulted by early wake-ups, and have seen patterns the on-call may not recognize. The right error is over-paging, not under-paging — especially when under-paging costs customer-visible downtime.",
  },
  {
    id: "linux-m19-q07",
    question:
      "During an incident, someone in the channel says \"Why did you deploy without code review yesterday?\" What's the right response, and why?",
    choices: [
      { label: "A", text: "Answer the question in detail — air the grievance now" },
      { label: "B", text: "Politely redirect: \"That's a postmortem question; right now we're focused on recovery.\" Blame-finding during an incident slows response and alienates the person doing the work" },
      { label: "C", text: "Quietly restart the servers to hide the deploy" },
      { label: "D", text: "Leave the channel" },
    ],
    correctAnswer: "B",
    explanation:
      "The incident channel has one job: coordinate recovery. Blame-finding derails responders, wastes cycles, and starts an antagonistic loop. Every \"why did X do Y\" question is a postmortem question, not an incident-response question. The incident commander's role includes politely deferring these to keep the team focused.",
  },
  {
    id: "linux-m19-q08",
    question:
      "Which of these action items in a postmortem is well-written?",
    choices: [
      { label: "A", text: "\"The team should improve monitoring.\"" },
      { label: "B", text: "\"By 2026-04-15, Maria will add alerting on retry-rate spikes crossing 2× baseline for 5 minutes; verified by firing a synthetic test alert.\"" },
      { label: "C", text: "\"We should be more careful with deploys.\"" },
      { label: "D", text: "\"Consider rewriting the service in Rust.\"" },
    ],
    correctAnswer: "B",
    explanation:
      "A real action item names an **owner**, a **deadline**, and a **measurable success criterion**. Without all three, it's a wish, not a commitment. Vague prescriptions (\"be careful,\" \"improve monitoring,\" \"consider rewriting\") don't produce change. The discipline of writing precise action items is what separates postmortems that prevent recurrence from those that read well but don't matter.",
  },
  {
    id: "linux-m19-q09",
    question:
      "What is the defining characteristic of a **blameless** postmortem compared to a blameful one?",
    choices: [
      { label: "A", text: "No names are used anywhere" },
      { label: "B", text: "The focus is on how the *system and process* enabled the mistake, producing action items that change the system — rather than on who made the mistake, which only produces defensive engineers" },
      { label: "C", text: "Managers aren't invited" },
      { label: "D", text: "It's published anonymously" },
    ],
    correctAnswer: "B",
    explanation:
      "Blameless postmortems assume every engineer is competent and acting in good faith — so when something goes wrong, the interesting question is *what in the system made the mistake possible or invisible*. This produces structural fixes (more guardrails, better monitoring, clearer runbooks). Blameful postmortems produce defensive engineers who hide small failures until they become large ones. Names are fine in a blameless doc; the *tone* and *focus* are what differ.",
  },
  {
    id: "linux-m19-q10",
    question:
      "A service's logs are filling `/var/log` at 200 MB/s during an incident. Other services on the same host start to misbehave because they can't log. What's the root cause pattern and the preventive fix?",
    choices: [
      { label: "A", text: "Log-flood cascade. Preventive: log rate-limiting at the service level (e.g., log every Nth occurrence of identical errors), logs on a dedicated volume from service data, and alerts on disk-usage climb rate (not just threshold)" },
      { label: "B", text: "Network congestion" },
      { label: "C", text: "CPU starvation" },
      { label: "D", text: "Clock skew" },
    ],
    correctAnswer: "A",
    explanation:
      "A log flood is a classic secondary cascade: the original error creates writes that fill disk, and disk-full causes new unrelated failures. Preventives: service-level log rate-limiting (don't write the same stack trace 10,000 times/sec), logs on a separate volume so disk-full doesn't take down the service's main storage, and monitoring that alerts on disk climb *rate* so you catch it at 30% before 100%.",
  },
];
