import type { MCQuestion } from "@/lib/types/campaign";

// ops-m03 "Monitoring & Alerting" — covers ops-s5 (What to Monitor) + ops-s6 (Alerts, Thresholds, On-Call)

export const OPS_M03_QUESTIONS: MCQuestion[] = [
  {
    id: "ops-m03-q01",
    question:
      "Google SRE popularized the \"four golden signals\" as the minimum viable monitoring for any service. What are they, and why just these four?",
    choices: [
      { label: "A", text: "Latency, Traffic, Errors, Saturation. Together they cover user experience (latency, errors) and system health (traffic, saturation) for nearly any service. Most incidents show up as a change in at least one before users notice — the minimum viable dashboard for any service" },
      { label: "B", text: "CPU, Memory, Disk, Network" },
      { label: "C", text: "Availability, Reliability, Scalability, Security" },
      { label: "D", text: "Input, Output, Errors, Logs" },
    ],
    correctAnswer: "A",
    explanation:
      "Latency (p95/p99), Traffic (demand), Errors (failure rate), Saturation (% full). These four together describe *what users experience* (latency, errors) and *what the system is doing* (traffic, saturation). Most real incidents cause at least one of them to move before users notice — so any service without these four on a dashboard is under-monitored. Raw resource metrics like CPU% are secondary; they're inputs to saturation, not standalone SLIs.",
  },
  {
    id: "ops-m03-q02",
    question:
      "A team argues about whether to monitor CPU utilization at 80% and page on it. What's the correct framing, and why is CPU% a bad pager alert?",
    choices: [
      { label: "A", text: "CPU utilization is a saturation signal, not a user-experience signal. A service at 95% CPU still meeting its SLI is fine; a service at 20% CPU returning errors is not. Alert on SLIs (user-visible success), not raw resource saturation. CPU makes a fine dashboard metric for capacity trending, not a pager alert" },
      { label: "B", text: "Always page on CPU — it's the most important metric" },
      { label: "C", text: "Only page on CPU during business hours" },
      { label: "D", text: "CPU is meaningless and should never be collected" },
    ],
    correctAnswer: "A",
    explanation:
      "Every pager alert should fail three tests: actionable, urgent, important. High CPU alone fails all three for most services — it's not actionable if there's no clear runbook, it's not urgent if users are still happy, and it's not important unless it correlates with user pain. The right pattern is to alert on SLIs (\"p99 latency breaches threshold\") and use CPU as a diagnostic or capacity-trending metric, not a pager alert.",
  },
  {
    id: "ops-m03-q03",
    question:
      "Your dashboards are green, no alerts are firing, but customers are reporting the service is broken. What's the disciplined first move, and what does this scenario reveal?",
    choices: [
      { label: "A", text: "Believe the customers. Green dashboards only prove that what you chose to measure is within threshold. Reproduce the symptom from outside (curl, test job, measure what the customer measures), identify the missing signal, add it as an action item. Every \"green but users angry\" is a prompt to improve coverage" },
      { label: "B", text: "Tell customers the system is fine — dashboards don't lie" },
      { label: "C", text: "Ignore until alerts fire" },
      { label: "D", text: "Restart the dashboard server" },
    ],
    correctAnswer: "A",
    explanation:
      "Monitoring coverage is never complete — there's always a signal you didn't collect or a threshold set too loose. When customer reports and dashboards disagree, it's almost always a coverage gap, not customer error. The disciplined response: reproduce from the outside, work backwards to find the missing signal, add it. Over time this cycle slowly closes the gap between \"what we measure\" and \"what users experience.\"",
  },
  {
    id: "ops-m03-q04",
    question:
      "An SLO of 99.9% weekly on a service. What's the weekly error budget, and what does \"burn rate\" describe?",
    choices: [
      { label: "A", text: "~10 min of downtime/errors per week is the budget. Burn rate = how fast you're spending it. 1× burn is sustainable (will miss SLO by exactly the budget over the period); 10× burn eats a month's budget in ~3 hours, so it needs to page right now. Multi-window burn-rate alerts (both short and long windows high) are the modern SRE standard" },
      { label: "B", text: "~1 hour of downtime; burn rate is a vendor metric" },
      { label: "C", text: "24 hours of downtime; burn rate is not used in SRE" },
      { label: "D", text: "No downtime is allowed; burn rate is the deploy count" },
    ],
    correctAnswer: "A",
    explanation:
      "99.9% = 0.1% error budget = ~10 min/week (or ~43 min/month). Burn rate expresses how fast the budget is being consumed, and is far more useful than threshold alerts because it distinguishes slow drizzle from fast catastrophe. Multi-window burn-rate alerts (\"fire if 5-min burn AND 1-hour burn are both high\") catch real fast-burning problems while filtering out tiny transient blips — a big upgrade over \"error rate > 1%\" style alerts.",
  },
  {
    id: "ops-m03-q05",
    question:
      "Over two weeks your team gets 73 pages for \"disk /tmp over 80%.\" In none did anyone do anything — /tmp cleaned itself up. What are the three tiers of fix, cheapest to best?",
    choices: [
      { label: "A", text: "(1) Raise threshold or add duration (page only if >90% for 15 min); (2) demote from pager to ticket; (3) fix the underlying cause (find and remove the aggressive writer). The third is best; the anti-option is leaving it as-is because \"we've always had it\"" },
      { label: "B", text: "Only raise the threshold — the rest is over-engineering" },
      { label: "C", text: "Ignore it; the on-call will adapt" },
      { label: "D", text: "Replace the on-call team" },
    ],
    correctAnswer: "A",
    explanation:
      "Every false-positive page desensitizes the on-call — the next real alert risks being clicked away. Three tiers of remediation: cheap (raise threshold/duration), medium (move to ticket), best (remove the underlying condition). Most ops teams do only the first tier; the disciplined path includes the third whenever feasible. The worst outcome is leaving a noisy alert in place out of inertia.",
  },
  {
    id: "ops-m03-q06",
    question:
      "Three \"pillars of observability\" are commonly cited — metrics, logs, traces. What does each give you, and why do you need all three rather than one?",
    choices: [
      { label: "A", text: "Metrics: numeric time series, cheap, fast — good for dashboards and alerts. Logs: textual events with timestamps — good for \"what exactly happened at T?\" Traces: per-request end-to-end paths — good for \"which of the 7 services made this slow?\" You need all three because they answer different questions; any one alone is incomplete" },
      { label: "B", text: "They're alternatives — pick one" },
      { label: "C", text: "Traces and logs are the same thing" },
      { label: "D", text: "Only metrics are needed in modern ops" },
    ],
    correctAnswer: "A",
    explanation:
      "Each pillar answers a different question. An alert on a metric triggers a log search for context, which triggers a trace for the per-request path that shows which downstream service is actually the problem. Without metrics you can't efficiently detect; without logs you can't reconstruct events; without traces you can't diagnose distributed systems. Modern observability stacks integrate all three for this reason.",
  },
  {
    id: "ops-m03-q07",
    question:
      "Your service has an SLO of 99.5% weekly. One bad deploy on Monday burned 30% of the monthly error budget in a single 45-minute incident. What's the disciplined move, and what is an error budget actually buying you?",
    choices: [
      { label: "A", text: "Stop shipping risky changes for the rest of the period. The error budget is the price you pay for moving fast — you've just consumed most of it. Push another risky change now and you risk busting the SLO. The error budget gives objective permission to take calculated risk when you have budget, and objective permission to slow down when you don't" },
      { label: "B", text: "Deploy more features to hide the outage in aggregate stats" },
      { label: "C", text: "Error budgets don't apply after an incident" },
      { label: "D", text: "Fire the engineer who made the deploy" },
    ],
    correctAnswer: "A",
    explanation:
      "Error budgets are the objective referee in \"do we ship features or fix reliability\" debates. With budget remaining, you move fast. With budget spent, you focus on reliability until the budget replenishes. The best part is depersonalizing the decision — the budget is a number, not a team politics argument. This is what lets SLOs actually guide engineering priorities rather than just sit in a doc.",
  },
  {
    id: "ops-m03-q08",
    question:
      "Which statement best describes a healthy on-call rotation, and why do \"volunteer\" on-call models often fail over time?",
    choices: [
      { label: "A", text: "Healthy: primary + secondary, weekly rotations (long enough for context, short enough not to burn out), written handoff notes, compensation (paid on-call, comp days), clear escalation policy. Volunteer models fail because burnout is real — after a few hard weeks people opt out, leaving the rotation thin and the remaining volunteers worse off. Reliable on-call is compensated work" },
      { label: "B", text: "Weekly rotations are too long; daily is better" },
      { label: "C", text: "Only senior engineers should be on-call" },
      { label: "D", text: "On-call should be 24/7 for a single person" },
    ],
    correctAnswer: "A",
    explanation:
      "On-call is work — it interrupts sleep, causes stress, and accumulates over time. Compensation isn't a perk, it's what makes the system sustainable. Daily rotations leave no time to learn context; monthly rotations burn people out. Weekly is the typical sweet spot. Primary + secondary provides a safety net. Written handoffs keep context across rotations. Teams that treat on-call as \"free\" labor see turnover and then weaker on-call coverage; it's a direct trade-off.",
  },
];
