import type { MCQuestion } from "@/lib/types/campaign";

// ops-m01 "Incident Response" — covers ops-s1 (Incident Lifecycle) + ops-s2 (Severity, Escalation, Comms)

export const OPS_M01_QUESTIONS: MCQuestion[] = [
  {
    id: "ops-m01-q01",
    question:
      "A training cluster goes unresponsive at 02:17. You have access to dashboards and the BMC. An engineer on the bridge immediately starts diving into kernel logs on the suspected bad node. What's the most important thing to do instead?",
    choices: [
      { label: "A", text: "Keep debugging — finding root cause is the most important job" },
      { label: "B", text: "Stop the bleeding first — drain the bad node, restart the job on healthy capacity, and only then open the autopsy. Live kernel-log debugging while users or jobs are blocked is the single most common MTTR mistake" },
      { label: "C", text: "Wait until 09:00 so more engineers can join" },
      { label: "D", text: "Reboot the entire cluster to be safe" },
    ],
    correctAnswer: "B",
    explanation:
      "Incident response is a two-phase problem: first you stop user-visible damage, then you investigate root cause. Rollback, failover, drain — whatever restores service fastest is the right first move, even if ugly. The dead node's kernel logs will still be there in the morning; the stalled training job is literally burning money every minute it waits. Separate \"resolve\" from \"root cause\" in your head.",
  },
  {
    id: "ops-m01-q02",
    question:
      "On a large incident (P1 with multiple engineers), what's the role of the Incident Commander (IC), and what's the most common failure mode when there is no IC?",
    choices: [
      { label: "A", text: "IC fixes the problem themselves" },
      { label: "B", text: "IC doesn't touch a keyboard — they assign tasks, track what's been tried, keep the plot, broadcast status, and make hard calls. Without an IC, everyone SSHs into things in parallel and 20 minutes later nobody knows what's been tried or tested" },
      { label: "C", text: "IC is the most senior engineer, always" },
      { label: "D", text: "IC writes the post-mortem" },
    ],
    correctAnswer: "B",
    explanation:
      "The IC is a coordination role, not a fixing role. Their value is all in preventing the chaos of uncoordinated response — assigning explicit tasks, cutting tangents, managing the bridge, and broadcasting status to stakeholders. Incidents without ICs typically have much worse MTTR because the same ground gets covered multiple times, competing hypotheses are pursued in parallel, and nobody is deciding what to try next.",
  },
  {
    id: "ops-m01-q03",
    question:
      "A customer reports their training job is \"slow\" at 22:00. Your dashboards show normal metrics — no alerts firing, GPU utilization at baseline, no error spikes. How should this be classified and handled?",
    choices: [
      { label: "A", text: "P1 — wake everyone up" },
      { label: "B", text: "P3 at most — single-customer, no confirmed systemic impact. Acknowledge the ticket, ask for specifics (job ID, expected vs observed throughput, cluster), investigate while watching broader telemetry. Severity can escalate to P2 or P1 if real fleet-wide impact is confirmed" },
      { label: "C", text: "Ignore — if dashboards are clean there's no issue" },
      { label: "D", text: "P2, because customer complaints are always P2" },
    ],
    correctAnswer: "B",
    explanation:
      "Severity is evidence-driven, not feeling-driven. One customer saying \"slow\" without corroborating telemetry is a P3. The right response is to *triage the claim* — gather specifics, reproduce if possible, check systemic signals. If during investigation you find real fleet-wide impact, escalate; many real P1s start as a single customer ticket. The mistake is neither dismissing nor overreacting — it's the disciplined middle of \"investigate precisely.\"",
  },
  {
    id: "ops-m01-q04",
    question:
      "An L1 engineer has been working solo on a P1 for 40 minutes at 02:30 with no progress and the runbook exhausted. They haven't escalated because they feel it would be embarrassing. What's the correct framing?",
    choices: [
      { label: "A", text: "They're right — escalation is a weakness" },
      { label: "B", text: "Failing to escalate is the real mistake. Escalation is a skill, not a weakness. A clean handoff (\"P1 since 01:50, symptom X, tried steps 1–4 in runbook Y, hypothesis Z, need help\") is the fastest way to get the right eyes on the problem" },
      { label: "C", text: "Escalate only during business hours" },
      { label: "D", text: "Escalate only after trying every runbook in the index" },
    ],
    correctAnswer: "B",
    explanation:
      "Every minute of delay on a P1 is real user pain and real SLO burn. A good engineer escalates *early and precisely*, with a clean summary. Teams that punish or stigmatize escalation breed slow MTTR and burned-out engineers; teams that normalize it have low MTTR and durable humans. The goal during an incident is *the fastest possible resolution*, not to prove self-sufficiency.",
  },
  {
    id: "ops-m01-q05",
    question:
      "Which statement correctly describes MTTR vs MTBF, and why MTTR matters more at large GPU scale?",
    choices: [
      { label: "A", text: "MTTR = Mean Time To Recovery (page → service restored). MTBF = Mean Time Between Failures. At large scale, failures are *inevitable and frequent*, so how fast you recover (MTTR) matters more than how long between failures (MTBF)" },
      { label: "B", text: "MTTR and MTBF are the same thing with different names" },
      { label: "C", text: "MTBF is more important because preventing failures is cheaper" },
      { label: "D", text: "MTTR is only for software; MTBF is only for hardware" },
    ],
    correctAnswer: "A",
    explanation:
      "At 10,000+ servers, failures happen daily — trying to push MTBF higher hits diminishing returns. MTTR directly translates to SLO burn, training-job completion rates, and dollar-cost-of-downtime. Every minute of training cluster downtime wastes thousands of dollars of idle GPUs. That's why modern DC ops is organized around *fast detection and fast replacement*, not prevention alone.",
  },
  {
    id: "ops-m01-q06",
    question:
      "A P1 incident is ongoing for 45 minutes. The IC is posting updates every 30 minutes to the status channel. Executives are complaining they don't know what's happening. Is the IC doing the right thing?",
    choices: [
      { label: "A", text: "Yes — 30 minutes is the right cadence for all audiences" },
      { label: "B", text: "Different audiences need different cadences and different detail levels. Engineers on the bridge: continuous. Internal status channel: every 15–30 min. Customers (public): every 30–60 min. Executives: a dedicated channel, every 30 min or on a material change — with business-impact framing, not raw technical detail" },
      { label: "C", text: "Yes — more frequent updates would be spam" },
      { label: "D", text: "No — incidents should happen quietly until resolved" },
    ],
    correctAnswer: "B",
    explanation:
      "Communication cadence and content should vary by audience. Engineers need raw facts; execs need business-impact framing and ETA. A single 30-minute update to a single channel won't serve everyone. Good ICs have a template for each audience and deliberately broadcast on each. The \"blast radius\" of a status message matters too — don't announce minor incidents to all customers, and don't hide major incidents in a Slack thread.",
  },
  {
    id: "ops-m01-q07",
    question:
      "During an incident, why is writing down what you try — commands, timestamps, observations — in the bridge chat or a scratch doc a critical discipline, not just bureaucracy?",
    choices: [
      { label: "A", text: "It prevents duplicated work across responders, creates a timeline that becomes the post-mortem's spine, and preserves context if the incident hands off between shifts or escalates to a new team. You will not remember all of it at 10 AM tomorrow" },
      { label: "B", text: "Compliance reasons only" },
      { label: "C", text: "For annual reviews" },
      { label: "D", text: "It's not critical — notes can be written after" },
    ],
    correctAnswer: "A",
    explanation:
      "Live notes serve three concrete purposes: de-duplication (\"Alice already tried a reset, don't re-try\"), continuity (if the shift changes, the next IC can pick up), and post-mortem quality (an accurate timeline is invaluable for root-cause analysis). \"I'll remember\" is a promise nobody keeps after a 3-hour adrenaline-fueled incident. Write as you go, even if scrappy.",
  },
  {
    id: "ops-m01-q08",
    question:
      "Which best describes the relationship between P1/P2/P3/P4 severity levels and who gets paged, at a typical ops team?",
    choices: [
      { label: "A", text: "All four wake up everyone — severity only affects post-mortem depth" },
      { label: "B", text: "P1: page immediately, war room, all hands; P2: page on-call, open bridge; P3: ticket within ~4 h, next business hour; P4: next business day. Escalation paths and customer comms also scale with severity" },
      { label: "C", text: "Only P1 gets paged; everything else is a ticket" },
      { label: "D", text: "Severity is for metrics only — response is the same" },
    ],
    correctAnswer: "B",
    explanation:
      "Severity is the lever that controls *response intensity*. P1 gets immediate multi-team response with executive visibility. P2 is on-call-owned with faster escalation. P3/P4 are ticket-tracked, business-hours work. The exact SLAs vary, but the pattern is universal: higher sev = more people, faster response, more external comms. Misclassifying in either direction has real costs — underclassifying hides outages, overclassifying burns trust.",
  },
  {
    id: "ops-m01-q09",
    question:
      "The outgoing on-call hands off to the incoming on-call with just a message: \"pager's yours, everything's fine.\" The next morning a P2 fires for a condition the outgoing shift was quietly mitigating for 3 days. What's the process issue here?",
    choices: [
      { label: "A", text: "No process issue — fresh eyes are better" },
      { label: "B", text: "A bad handoff. Every rotation must include a structured handoff: open tickets, active incidents, watched conditions, upcoming changes, recent unusual behavior. \"Everything's fine\" is never true and hides information the incoming shift needs" },
      { label: "C", text: "The incoming on-call should have asked more questions" },
      { label: "D", text: "Handoffs should be done in person only" },
    ],
    correctAnswer: "B",
    explanation:
      "Shift handoffs are real-time documentation. The outgoing on-call has context — flakiness they've been watching, tickets they've been nursing, changes that landed — that the incoming one needs. Good teams use a written handoff template (active incidents, open tickets, watched/flaky, upcoming changes, unusual observations) to prevent gaps. Most on-call disasters happen when context is lost in handoff.",
  },
  {
    id: "ops-m01-q10",
    question:
      "A senior engineer says: \"Don't confuse MTTR with MTTRk (Mean Time To Root-Cause).\" What's the distinction, and why does mixing them cause problems?",
    choices: [
      { label: "A", text: "MTTR is restoring service (minutes to hours); MTTRk is finding and fixing root cause (days to weeks). Mixing them leads to delayed recoveries because engineers try to fully understand before acting, extending user pain. Resolve first (fast), investigate after (careful)" },
      { label: "B", text: "They're the same metric" },
      { label: "C", text: "MTTRk is for vendor incidents only" },
      { label: "D", text: "MTTR only applies to hardware" },
    ],
    correctAnswer: "A",
    explanation:
      "Recovery and root-cause are different goals on different timescales. MTTR measures how fast you restore service — the priority during the incident. MTTRk measures how fast you understand *why* and prevent recurrence — the priority during post-incident review. Conflating them causes the engineer's instinct to \"understand before acting,\" which extends user impact. The professional discipline: stop the bleeding in minutes, understand the cause in days, prevent the recurrence in weeks.",
  },
];
