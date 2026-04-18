import type { ChapterSection } from "@/lib/types/chapter";

// ═══════════════════════════════════════════════════════════════════════════
// Operation Run Book — Ops & Processes chapters (ops-s1 .. ops-s8)
// Each mission (ops-m01..ops-m04) pulls from 2 chapter sections.
// ═══════════════════════════════════════════════════════════════════════════

// ── ops-m01 Incident Response ──────────────────────────────────────────────

const opsS1: ChapterSection = {
  id: "ops-s1",
  topicId: "ops-processes",
  title: "The Incident Lifecycle",
  subtitle: "What happens between the page at 02:17 and the all-clear.",
  icon: "◉",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "It's 02:17. Your phone buzzes with a PagerDuty alert: *\"Training cluster US-WEST-3: all-reduce latency > 500ms for 2 minutes.\"* You're not asleep anymore. In the next 30 minutes your job is not to **be heroic**. It's to do the same dozen steps every on-call engineer on every good ops team has done since forever — find the blast radius, stop the bleeding, get the right people on the bridge, and start writing down what you're seeing. How you do those next 30 minutes decides whether this becomes a half-hour blip or a five-hour Twitter thread.",
    },
    { kind: "heading", level: 3, text: "The five phases of incident response" },
    {
      kind: "table",
      headers: ["Phase", "Goal", "Typical signal"],
      rows: [
        ["Detect", "Something is wrong; someone / something is paged", "Monitoring alert, user report, failed job"],
        ["Triage", "Assess scope + severity; assemble the right people", "You say P1 or P2 out loud; the bridge opens"],
        ["Investigate", "Find what's broken, not what caused it", "Logs, dashboards, `dmesg`, packet captures"],
        ["Resolve", "Stop the bleeding — restore service, even if ugly", "Failover, restart, drain, roll back"],
        ["Post-mortem", "Blameless review; action items; prevent recurrence", "Written document, owners, deadlines"],
      ],
    },
    {
      kind: "prose",
      html:
        "The phases are sequential in theory and **overlapping in practice**. You keep investigating while you're resolving. You keep communicating the whole way. Post-mortem happens days later, not in the heat.",
    },
    { kind: "heading", level: 3, text: "Stop the bleeding before fixing the cause" },
    {
      kind: "prose",
      html:
        "The single most misunderstood thing about incident response: **you are not trying to find the root cause during the incident.** You are trying to stop user-visible damage. Rollback beats debugging. Failover beats patching. Kicking a bad node out of a cluster beats fixing it in place. You can investigate the root cause in the cold light of Monday.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Resolve first, understand second",
      body:
        "If you can make the symptom go away in 3 minutes by rolling back a deploy, do it. Every minute spent debugging a live incident is a minute of user pain. You'll still investigate — but with the service restored and no one's quarterly review on the line.",
    },
    { kind: "heading", level: 3, text: "The Incident Commander role" },
    {
      kind: "prose",
      html:
        "On any incident larger than one person can handle, someone has to be the **Incident Commander (IC)**. Their job is *not* to fix the problem. It is to:",
    },
    {
      kind: "bullets",
      items: [
        "**Keep the plot.** Who's doing what, what's been tried, what's known, what's next.",
        "**Manage the bridge.** Assign specific tasks to specific people. Cut off tangents. Park debates for later.",
        "**Broadcast status.** Post updates to status pages, exec channels, customer-facing channels on a cadence (often every 15–30 min).",
        "**Decide.** When there's a choice between failover and debugging, it's the IC who calls it. No committees during incidents.",
      ],
    },
    {
      kind: "prose",
      html:
        "Bad incidents usually have no IC. Everyone SSHs into something, tries something, and twenty minutes later nobody knows what's been tried. Good incidents have an IC who never touches a keyboard.",
    },
    { kind: "heading", level: 3, text: "MTTR — the number on every ops leader's wall" },
    {
      kind: "prose",
      html:
        "**MTTR** (Mean Time To Recovery) is the most important number in incident response. Lower MTTR means less user-visible pain, smaller SLO burn, and less wasted compute on stalled jobs. At AI-DC scale, every minute a training job is blocked costs thousands of dollars in idle GPUs — **recovery speed literally has a dollar value**.",
    },
    {
      kind: "bullets",
      items: [
        "**MTTD** (Mean Time To Detect) — paging to eyes-on-screen. Lower is better.",
        "**MTTR** (Mean Time To Recovery) — page to service-restored. Lower is better.",
        "**MTTRk** (Mean Time To Root-Cause) — measured in days, not minutes. Good teams don't confuse this with MTTR.",
      ],
    },
    { kind: "heading", level: 3, text: "Take notes as you go" },
    {
      kind: "prose",
      html:
        "During the incident, **write down everything you try and when you tried it** — in the bridge chat, in a notebook, in a scratch document. Timestamps. Commands you ran. What you saw. You will not remember at 10 AM tomorrow, and the post-mortem will be a much better document because of it. Many teams keep a #incident-live channel specifically for this purpose.",
    },
    {
      kind: "think-about-it",
      scenario:
        "Pager fires at 03:30: a GPU node in a 64-node training job has gone unresponsive and the job has stalled. You have access to the BMC. What are the first three moves and what's the thing you *don't* do?",
      hint: "Stop the bleeding. You can autopsy the node later.",
      answer:
        "(1) Drain the bad node from the cluster's job scheduler so the job can resume without it (or so the operator can restart without the dead node in the roster). (2) Let the job resume / be restarted on healthy capacity — user-visible pain stops now. (3) Open a ticket, pull the BMC SEL and `dmesg` output from the dead node so you have artifacts for the morning investigation. What you *don't* do: spend 45 minutes trying to live-debug the dead node's kernel panic while the rest of the job sits idle at a five-figure-per-hour burn rate. You can autopsy the corpse tomorrow. Tonight you keep the cluster running.",
    },
    {
      kind: "knowledge-check",
      question:
        "A teammate is on-call for their first incident solo. They find the cause — a bad config push — within 10 minutes, but spend the next 40 minutes carefully rolling back through each environment, reading logs the whole time, and writing a live summary. Users are impacted the whole time. What went wrong, and what should they have done differently?",
      answer:
        "They confused investigation with resolution. As soon as they identified the bad push as the likely cause, the right move was an immediate rollback — even a full revert to the prior release — to restore service. Careful, log-reading, stepwise rollback is an investigation pattern; it belongs in dev, not in production during a live incident. The correct sequence: rollback fast, confirm service restored, then open the investigation phase from a position of no user pain. The live summary and careful logs are useful for the post-mortem, but they should not delay the bleed-stopping action. MTTR isn't about being thorough — it's about restoring service quickly and investigating in calm air.",
    },
  ],
};

const opsS2: ChapterSection = {
  id: "ops-s2",
  topicId: "ops-processes",
  title: "Severity, Escalation, and Communication",
  subtitle: "Who to wake up, who to tell, and how to cut through the noise.",
  icon: "◈",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "The difference between a **P1** and \"annoying\" is the difference between waking up five people and waiting until 09:00. Misclassify an incident and you either burn political capital paging senior engineers for nothing, or you let a real outage rot for hours. Severity is not a feeling — it's a **rubric**, and every good ops team has one everyone understands the same way.",
    },
    { kind: "heading", level: 3, text: "Severity levels" },
    {
      kind: "table",
      headers: ["Sev", "What it means", "Response SLA", "Typical example"],
      rows: [
        ["P1 / Sev-1", "Service down or major user-visible outage; money / training / contracts on fire", "Immediate — page now, assemble bridge", "Training cluster unreachable; production DB unavailable"],
        ["P2 / Sev-2", "Significant degradation or partial outage; clear user impact", "~30 min — page on-call, open ticket", "Latency 10× baseline; one AZ failing"],
        ["P3 / Sev-3", "Minor impact or single-customer issue", "~4 h — ticket, next business hour", "One rack losing packets; intermittent single-host issue"],
        ["P4 / Sev-4", "No current user impact; needs scheduled attention", "Next business day", "Drive failure in RAID-6 array; TODO in a runbook"],
      ],
    },
    {
      kind: "prose",
      html:
        "Exact numbers vary by shop. What matters is that everyone knows the rubric and that **overclassifying and underclassifying are both costs**. Every P1 that wakes senior engineers at 03:00 for nothing burns their trust; every P3-that-was-really-a-P1 hides real damage.",
    },
    { kind: "heading", level: 3, text: "Escalation paths — L1, L2, L3" },
    {
      kind: "prose",
      html:
        "Most DC and ops teams have a **tiered escalation model**. First-line (L1) responders take the page, run the runbook, apply known fixes. If they don't resolve it quickly, they escalate to a specialist (L2). If L2 can't fix it either, it reaches engineering or vendor (L3).",
    },
    {
      kind: "bullets",
      items: [
        "**L1 (frontline / on-call tech)** — runs runbooks, handles known scenarios, opens tickets, triages severity, calls for help.",
        "**L2 (specialist / senior SRE)** — deeper debugging, cross-team coordination, unusual failure modes.",
        "**L3 (engineering / vendor)** — root cause in code, firmware, or product; rare escalations with long turnarounds.",
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Escalation is a skill, not a weakness",
      body:
        "A good L1 escalates early and precisely — with a clear summary of what they've tried and what they suspect. \"I've done steps 1–4 in the runbook, condition X isn't clearing, BMC sensors show Y\" is a great handoff. Waiting an extra 30 minutes to \"figure it out on my own\" just extends MTTR.",
    },
    { kind: "heading", level: 3, text: "Communication — who actually needs to know" },
    {
      kind: "prose",
      html:
        "During an incident, the IC is broadcasting status to multiple audiences at different cadences. Getting this right is the difference between \"we're on top of it\" and \"nobody has any idea what's happening\":",
    },
    {
      kind: "table",
      headers: ["Audience", "Channel", "What they want", "Cadence"],
      rows: [
        ["Engineers on the bridge", "War room (Zoom, Slack #incident-X)", "Raw facts, commands, hypotheses", "Continuous"],
        ["Broader engineering", "Status channel (#ops-status)", "What's impacted, who's on it, ETA if known", "Every 15–30 min"],
        ["Customers", "Public status page, email", "What's affected, ETA to resolution, workarounds", "Every 30–60 min"],
        ["Executives / leadership", "Exec brief (DM or dedicated channel)", "Business impact, decision points, ETA", "Every 30 min or on change"],
      ],
    },
    {
      kind: "prose",
      html:
        "The **blast radius of a status message** matters. A P1 on a small subcluster is not something to announce to all customers with an all-caps email. A real regional outage is not something to hide in a Slack thread.",
    },
    { kind: "heading", level: 3, text: "Shift handoff" },
    {
      kind: "prose",
      html:
        "On-call rotations change shifts. **Never leave gaps.** The outgoing on-call tells the incoming one: open tickets, active incidents, anything \"watching\" but not yet paged, and anything unusual — \"spine switch 3 has been flapping but we haven't root-caused, keep an eye.\" Standard templates help; written handoff notes beat verbal ones. Most on-call disasters happen when something gets lost in a handoff.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A customer files a ticket at 22:00: *\"Our training job is way slower than yesterday.\"* Your dashboards look normal — no alerts firing, no errors, GPU utilization is at the usual level. Is this P1, P2, P3, or P4?",
      hint: "Severity isn't customer feelings; it's evidence of impact.",
      answer:
        "Without more evidence, this is a P3 at most — single-customer, no confirmed systemic impact, no dashboards flashing. The right response is to acknowledge the ticket, ask for specifics (job ID, start time, expected vs observed throughput, which cluster), and investigate while keeping an eye on broader telemetry. It could turn into a P2 or P1 once you confirm a real fleet-wide issue — and severity can *rise* during investigation. But you don't wake five people because one customer said \"slow.\" You do triage the claim and respond like the first victim of a real outage might be that one customer.",
    },
    {
      kind: "knowledge-check",
      question:
        "At 02:30, an L1 tech has been working alone on a P1 for 40 minutes with no progress. They're tired, haven't slept, and their runbook is exhausted. They haven't paged anyone else because \"it would be embarrassing to give up.\" What's wrong with that reasoning, and what's the disciplined move?",
      answer:
        "The L1 is confusing ego with professionalism. On a P1, *failing to escalate* is the mistake — every minute of delay is real user pain and real SLO burn. The disciplined move is to page L2 now, with a clean 60-second summary: \"P1 since 01:50, symptom X, tried steps 1–4 in runbook Y, current hypothesis Z, I need help.\" That handoff is the fastest way to get the right eyes on the problem. Post-incident, there's nothing to be embarrassed about — the post-mortem will note the escalation timing as a data point, not a judgment. On-call teams that punish escalation breed slow MTTR and burned-out engineers; teams that normalize it are the ones with low MTTR and durable humans.",
    },
  ],
};

// ── ops-m02 Change Management ──────────────────────────────────────────────

const opsS3: ChapterSection = {
  id: "ops-s3",
  topicId: "ops-processes",
  title: "Changes, Risk, and Rollback",
  subtitle: "Why 90% of outages are self-inflicted, and how to stop doing it.",
  icon: "◐",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "Here's an uncomfortable statistic: on most ops teams, **a majority of outages are caused by the team itself** — a deploy, a config change, a firmware flash, a cable pull, a \"just one quick fix.\" Hardware fails, but it fails on a schedule the industry has made peace with. Human-made outages are the tractable ones — and they all come through the same funnel: **change management**.",
    },
    { kind: "heading", level: 3, text: "Three types of change" },
    {
      kind: "table",
      headers: ["Change type", "What it is", "Review path"],
      rows: [
        ["Standard", "Pre-approved, low-risk, frequent (replace a failed drive, rotate an SSH key)", "No CAB review — the SOP itself is the approval"],
        ["Normal", "Non-routine, non-emergency (firmware upgrade, new rack, network config)", "CAB reviews; risk + rollback plan required"],
        ["Emergency", "Can't wait — security patch, live outage fix, imminent failure", "Approved after-the-fact; minimal review up front; full PIR after"],
      ],
    },
    {
      kind: "prose",
      html:
        "The **CAB** (Change Advisory Board) is a cross-team group that reviews normal changes. They're not there to be a bureaucratic filter — they're there to catch the dumb mistakes: *\"This change conflicts with a planned maintenance window on the same hosts,\" \"This affects a downstream team that hasn't been notified,\" \"Your rollback plan doesn't handle scenario X.\"* Skipping CAB for \"simple\" changes is how \"simple\" changes take down production.",
    },
    { kind: "heading", level: 3, text: "Risk assessment" },
    {
      kind: "prose",
      html:
        "Every proposed change gets judged on three axes:",
    },
    {
      kind: "bullets",
      items: [
        "**Reversibility** — can this be undone? A firmware flash is partially reversible; a `DROP TABLE` in production is not.",
        "**Blast radius** — if this goes wrong, how much breaks? One host? One rack? One region? The fleet?",
        "**Timing** — peak traffic vs maintenance window? Weekend vs Monday morning? During another team's known-risky change?",
      ],
    },
    {
      kind: "prose",
      html:
        "High-risk changes (broad blast, hard to reverse, bad timing) need **more scrutiny**, not more speed. High-throughput shops don't move faster by skipping review; they move faster by making low-risk changes the default — pre-approved SOPs, small batches, automated rollouts.",
    },
    { kind: "heading", level: 3, text: "Rollback — the one line of defense" },
    {
      kind: "prose",
      html:
        "Before you apply any change, answer one question: **if this goes wrong, how do I undo it?** If the answer is \"I don't know\" or \"I can't,\" the change is not ready. A rollback plan must be written, tested, and ready before the change begins — not after something breaks.",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Rollback plans that look like rollback plans but aren't",
      body:
        "\"We'll restore from backup\" — when was the restore last tested? How long does it take? \"We'll revert the git commit\" — has this been verified in staging? \"We'll flash the old firmware\" — do you have the file, the tool, and the known-good image? A rollback plan that hasn't been dry-run is just a wish.",
    },
    { kind: "heading", level: 3, text: "Staged rollouts — blast-radius discipline" },
    {
      kind: "prose",
      html:
        "The single most important pattern in change safety: **don't apply to the whole fleet at once**. Even a \"safe\" change can have unknown interactions. The professional move is to stage:",
    },
    {
      kind: "bullets",
      items: [
        "**1 node / canary** — apply to a single representative node. Wait. Watch dashboards.",
        "**1 rack / cell** — small bounded group. Verify metrics haven't regressed.",
        "**10% of the fleet** — enough to catch unlikely interactions; small enough to recover from.",
        "**50% / 100%** — now you've seen the change survive under real load.",
      ],
    },
    {
      kind: "prose",
      html:
        "Between stages, there's a **go/no-go gate**: explicit checks that must pass before continuing. Two bad nodes in a staged rollout is a minor incident. Five hundred bad nodes from a one-shot fleet-wide apply is a career-defining catastrophe — and the difference is just patience.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A team lead wants to push a new kernel to all 2,000 GPU nodes tonight \"because QA already tested it.\" QA has a single test lab with 4 nodes. What's the problem, and what's the disciplined counter-proposal?",
      hint: "Four nodes at one vendor revision in a QA lab prove almost nothing about a fleet-wide deploy.",
      answer:
        "The QA test proves the kernel boots on 4 nodes — not that it survives on 2,000 nodes with real production workloads, diverse hardware revisions, mixed driver versions, and long-running training jobs. Fleet-wide deploys with lab-only validation is a classic catastrophic pattern (see the cases where a single kernel version bricked thousands of hosts). Disciplined counter-proposal: canary on 1 node overnight → 1 rack tomorrow → 10% of the fleet next week → 50% → 100%. Each step has explicit metrics (boot success, kernel crashes, job pass rate) and a defined rollback. \"We move faster by shipping small\" — not \"we move faster by shipping big.\"",
    },
    {
      kind: "knowledge-check",
      question:
        "An emergency change is needed — a zero-day CVE requires a patched OpenSSH across the fleet. There's no time for a full CAB review. How do you still apply the standard change-safety discipline without paralyzing the response?",
      answer:
        "Emergency changes still follow the safety playbook, just on compressed timescales. (1) Write the change as an MOP even in a hurry — commands, validation, rollback. (2) Canary on 1–2 hosts. Verify SSH still works, no regression. (3) Apply to one cell / rack. Check. (4) Roll across the fleet in waves — 10%, 50%, 100% — with brief verification between waves. (5) Announce in the status channel so everyone knows why servers are bouncing. (6) **Post-incident review afterwards** — was the emergency real, was the response proportional, should any of this become a standard change? Urgency is not an excuse to skip staging; it's a reason to keep the stages short and automated.",
    },
  ],
};

const opsS4: ChapterSection = {
  id: "ops-s4",
  topicId: "ops-processes",
  title: "Maintenance Windows and MOPs",
  subtitle: "Saturday 01:00 — the bridge call, the runbook, the go/no-go.",
  icon: "◑",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "It's Saturday 01:00. Thirty people on a Zoom bridge. A shared doc on the screen with 84 steps. Someone is narrating step 12 out loud while three others watch dashboards. Nothing breaks because everything breakable has been talked about three times before the first command ran. This is what a **maintenance window** looks like when it's done right.",
    },
    { kind: "heading", level: 3, text: "Why maintenance windows exist" },
    {
      kind: "bullets",
      items: [
        "**Planned downtime** — you can do things you wouldn't risk at peak (swap cables, reboot the fleet, flash firmware).",
        "**Concentrated attention** — the right people are awake, on the bridge, and focused on this one change.",
        "**Pre-announced** — customers know, downstream teams know, no one is surprised.",
        "**Bounded blast** — if it goes wrong, it goes wrong during the window, not at 09:00 Monday.",
      ],
    },
    {
      kind: "prose",
      html:
        "Windows are usually at low-traffic times — Saturday/Sunday overnight for user-facing services, or during scheduled pauses for training clusters. A shop with good windows runs many changes through them; a shop with bad windows pushes everything to the chaos of business hours.",
    },
    { kind: "heading", level: 3, text: "SOP vs MOP vs runbook" },
    {
      kind: "table",
      headers: ["", "Purpose", "Scope", "Example"],
      rows: [
        ["SOP", "Generic repeatable process", "\"How we handle X\" — class of work", "\"How to replace a failed disk\""],
        ["MOP", "Specific step-by-step for one task", "\"What we will do, literally\" — single event", "\"Replace disk sda in server r17-03 on 2026-04-22\""],
        ["Runbook", "Troubleshooting / scenario response", "\"What to do when Y happens\"", "\"GPU fell off the bus\""],
      ],
    },
    {
      kind: "prose",
      html:
        "For a maintenance window, the artifact you live by is the **MOP**. It's the concrete, specific, do-exactly-this-in-exactly-this-order document. A well-written MOP can be executed by someone who's never done the task before, as long as they can read and type carefully.",
    },
    { kind: "heading", level: 3, text: "MOP structure — the sections every good one has" },
    {
      kind: "bullets",
      items: [
        "**Header** — change ID, date, window times, IC, approver, affected hosts.",
        "**Prerequisites** — what must be true before starting (backups, access, patch downloaded, rollback image staged).",
        "**Pre-checks** — commands to verify current state; if any fail, don't start.",
        "**Steps** — numbered, explicit, one atomic action per step. Include exact commands, expected outputs, and what \"success\" looks like for each.",
        "**Validation** — commands and dashboards to prove success at the end.",
        "**Rollback** — step-by-step to undo if anything fails at any point. Include the trigger conditions that would make you invoke rollback.",
        "**Escalation** — names, pager numbers, when to call them.",
      ],
    },
    {
      kind: "code",
      label: "A TYPICAL MOP STEP",
      language: "text",
      code:
        "Step 7 of 14 — Drain the node from the scheduler\n  Command: `ssh r17-03 && systemctl stop slurmd`\n  Expected: `systemctl status slurmd` shows \"inactive (dead)\"\n  Success:  Node state in `sinfo` reads \"DRAIN\"\n  If fails: STOP. Do not proceed to step 8. Invoke rollback (§Rollback step R1).",
    },
    { kind: "heading", level: 3, text: "Dry run and the go/no-go gate" },
    {
      kind: "prose",
      html:
        "Before the window, good teams run the MOP in a **lower environment** (staging, a test cell, a single node) to catch typos, missing permissions, or unexpected behavior. The day of the window starts with a **go/no-go call** — the IC asks each relevant team if they're ready. One \"no\" from anyone postpones. The cost of postponing is a day; the cost of rushing is an outage.",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "When a MOP step fails silently",
      body:
        "You execute step 7. The command returns 0. No error. You move to step 8. But step 7 didn't actually do what it was supposed to. This is the most dangerous failure mode because it hides. That's why every step has **explicit validation** — don't trust exit codes alone. Check the observable state change. If \"drain the node\" is the goal, confirm the scheduler reports it drained; don't just trust that `systemctl stop` returned 0.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You're executing a MOP to upgrade firmware across a rack. Step 4 of 11 fails — the firmware tool reports `Device not found`. Steps 1–3 succeeded. What do you do, and what do you NOT do?",
      hint: "The MOP is a contract. What does it say about failures?",
      answer:
        "What you do: stop. Every serious MOP has an explicit rule — a failure that isn't covered in the \"If fails\" clause for that step means **halt and invoke the rollback procedure** from whichever step you're at. You look at the rollback section, execute the steps from your current point back to a known-good state, and post to the bridge what happened. What you *don't* do: skip step 4 and move on, try to \"just fix it,\" or assume the issue is cosmetic. A maintenance window is a time-bounded, controlled environment — you don't go improvising in it. Close the window, reconvene, debug in a calm environment, schedule another window.",
    },
    {
      kind: "knowledge-check",
      question:
        "An engineer proposes: \"Let's skip the dry run for this firmware upgrade — we've done similar ones before, the window is tight.\" Why is skipping dry run a bad tradeoff, and what's actually lost by doing it?",
      answer:
        "Dry runs catch three classes of problem cheaply: typos in commands, missing tooling or permissions, and assumptions that are wrong in the target environment (wrong driver version, unexpected firmware revision, NFS mount points that have changed). All of these, if discovered during the live window, either blow the schedule or force rollback. A 20-minute dry run in staging on Friday costs almost nothing; the same bugs discovered at 02:30 Saturday cost hours. The \"we've done similar\" argument is exactly the one that produces complacency-driven outages — \"similar\" is not \"identical.\" The right tradeoff is always to dry-run unless you physically can't; the window tightness is a reason to plan better, not to skip validation.",
    },
  ],
};

// ── ops-m03 Monitoring & Alerting ──────────────────────────────────────────

const opsS5: ChapterSection = {
  id: "ops-s5",
  topicId: "ops-processes",
  title: "What to Monitor and Why",
  subtitle: "The golden signals, the three pillars, and building dashboards that actually help.",
  icon: "◎",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "prose",
      html:
        "Walk into any NOC and you'll see a wall of screens — dashboards, status pages, heatmaps. Most of what's on those screens will never be looked at in an incident. Good monitoring is not about displaying everything; it's about exposing the **handful of numbers that predict or describe every kind of failure you care about**.",
    },
    { kind: "heading", level: 3, text: "The four golden signals" },
    {
      kind: "prose",
      html:
        "Google SRE popularized the idea that **any service** can be monitored with four signals, and if you have to pick the absolute minimum, pick these:",
    },
    {
      kind: "table",
      headers: ["Signal", "What it measures", "Typical unit"],
      rows: [
        ["Latency", "How long requests take (especially p95/p99 tails)", "ms"],
        ["Traffic", "How much demand — requests, jobs, packets", "req/sec, jobs/hour"],
        ["Errors", "How many failed — and how (retryable vs fatal)", "errors/sec or %"],
        ["Saturation", "How full the system is relative to capacity", "% of CPU, memory, bandwidth, queue depth"],
      ],
    },
    {
      kind: "prose",
      html:
        "Every service should have these four on one dashboard. Most incidents show up as a change in at least one of them before users notice. If your dashboard doesn't have all four, fix that first.",
    },
    { kind: "heading", level: 3, text: "What to monitor in a datacenter" },
    {
      kind: "table",
      headers: ["Layer", "What to watch", "Why"],
      rows: [
        ["Servers", "CPU, memory, disk, GPU util, temps, ECC errors", "Health of the compute itself"],
        ["Network", "Bandwidth, packet loss, latency, link state, PFC pauses", "Fabric is the common-path dependency"],
        ["Storage", "IOPS, latency, capacity, SMART health", "Drives fail more than anything else"],
        ["Power / cooling", "PDU draw, inlet / outlet temps, CRAH status, humidity", "Facility issues take out racks or rows, not individual servers"],
        ["Services", "Request rate, error rate, latency, saturation", "What customers actually experience"],
      ],
    },
    { kind: "heading", level: 3, text: "The three pillars of observability" },
    {
      kind: "bullets",
      items: [
        "**Metrics** — numeric time series (CPU %, req/sec). Cheap to store, fast to query. Good for dashboards and alerts. Prometheus, InfluxDB, CloudWatch.",
        "**Logs** — textual events with timestamps. Good for \"what exactly happened at 02:17?\" High volume, more expensive. Elasticsearch, Loki, Splunk.",
        "**Traces** — per-request end-to-end paths. Good for \"which of the 7 services in this call made it slow?\" OpenTelemetry, Jaeger, Datadog APM.",
      ],
    },
    {
      kind: "prose",
      html:
        "All three feed each other. An alert on a metric (\"p99 latency spiked\") leads to a log search (\"what errors fired in that window?\") leads to a trace (\"which downstream service actually timed out?\"). Any one pillar alone is incomplete.",
    },
    { kind: "heading", level: 3, text: "SLIs — the metrics you actually stake reputations on" },
    {
      kind: "prose",
      html:
        "A **Service Level Indicator (SLI)** is a carefully chosen metric that describes user-visible success — not a raw resource number. For a training cluster, an SLI might be *\"% of training jobs that complete within expected wall time.\"* For a storage service, *\"% of reads that return within 100ms.\"* The SLI is the thing you promise against.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Good SLI, bad SLI",
      body:
        "**Bad SLI:** \"CPU utilization below 80%.\" Nobody uses a service to watch its CPU. **Good SLI:** \"95% of API requests complete in under 200ms.\" Users can tell the difference. SLIs should describe *what the user experiences*, not internal resource numbers.",
    },
    { kind: "heading", level: 3, text: "Dashboards that help vs dashboards that just look cool" },
    {
      kind: "bullets",
      items: [
        "**One question per dashboard.** \"Is my service healthy right now?\" is one dashboard. \"Historical capacity trends\" is another. Don't mix.",
        "**Top left is most important.** Eye goes there first. Put the primary SLI there.",
        "**Use color sparingly** — red/green is fine, a rainbow is noise.",
        "**Axis scales and units matter.** Latency in ms is not the same as latency in s; show units.",
        "**Link to runbooks.** An alert that fires should have a link to the dashboard, which has a link to the runbook for that condition. Chain the tools.",
      ],
    },
    {
      kind: "code",
      label: "THE MINIMUM VIABLE COMMANDS (WHEN DASHBOARDS LIE)",
      language: "bash",
      code:
        "# Host health\ntop; htop                            # CPU, mem\ndf -h                                # disk space\nfree -m                              # memory\ndmesg -T | tail -40                  # recent kernel events (OOM, errors)\njournalctl -p err -S -15min          # systemd errors in the last 15 min\n\n# Services\nsystemctl status <svc>\nss -s; ss -tlnp\ncurl -s localhost:<port>/healthz",
    },
    {
      kind: "think-about-it",
      scenario:
        "All your dashboards are green. No alerts are firing. Customers are telling you the system is broken. What's the disciplined first move, and what does this scenario reveal about your monitoring?",
      hint: "The dashboards are telling you what you *chose* to measure.",
      answer:
        "Believe the customers. A green dashboard doesn't prove the system is healthy — it proves that everything you chose to measure is within threshold. What's happening is almost always a **monitoring gap**: either a signal you don't collect (maybe tail latency p99, maybe a specific error type, maybe a dependency), or a threshold set too loose to catch real degradation. The disciplined move: reproduce the customer symptom with your own tools (curl the API, submit a test job, measure from the outside), then work backwards from what you observe to the missing signal. Afterwards, add the missing monitoring as an action item. Every \"dashboards green, users angry\" incident is a direct prompt to improve coverage — the incident is the teacher.",
    },
    {
      kind: "knowledge-check",
      question:
        "Your team argues about whether to monitor CPU utilization at 80% threshold. Half want to alert on it; half say it's a useless metric. What's the right framing, and how do you decide whether CPU utilization deserves an alert at all?",
      answer:
        "CPU utilization is a **saturation signal**, not a user-experience signal. It's useful for capacity planning (\"are we trending toward being full?\") and sometimes as a contributing signal during incident investigation — but it's a bad *alert*. A service at 95% CPU that's still meeting its SLI is fine; a service at 20% CPU that's returning errors is not. The right framing is: **alert on SLIs** (what users experience), not on raw resource saturation. If the team really wants CPU coverage, make it a *dashboard* metric with a soft threshold for capacity trending, and make the pager-waking alert fire on latency or error rate instead. The discipline is: every page must be actionable and correlated to user impact.",
    },
  ],
};

const opsS6: ChapterSection = {
  id: "ops-s6",
  topicId: "ops-processes",
  title: "Alerts, Thresholds, and On-Call",
  subtitle: "SLOs, error budgets, burn rate — and how to not page someone for nothing.",
  icon: "◇",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "The phone buzzes at 03:00. You reach for it, squinting: *\"Disk usage on /tmp over 80% on host r17-03.\"* You clear it. It's the **10th this week**. The on-call next to you has stopped reading the alert text at all — they just click acknowledge and go back to sleep. This is **alert fatigue**, and it's the single most dangerous thing that happens to an ops team slowly over months.",
    },
    { kind: "heading", level: 3, text: "Every alert must pass three tests" },
    {
      kind: "bullets",
      items: [
        "**Actionable.** There is a specific response the on-call can perform *right now* that addresses the condition. \"High CPU\" fails this test if nobody has a runbook for it. \"/tmp full\" fails unless you want the on-call engineer to manually clear temp files.",
        "**Urgent.** This can't wait until tomorrow morning. A P4 ticket is not an alert.",
        "**Important.** It materially affects users or the business. Alerting on internal curiosities burns trust.",
      ],
    },
    {
      kind: "prose",
      html:
        "Every alert that doesn't pass all three belongs in a ticket, a dashboard, or a daily email digest — not a pager. The worst thing you can do to an on-call rotation is to keep adding \"just in case\" alerts. A month of false pages creates the 10th-of-the-week problem above, and then the *real* page — the one that matters — gets clicked away too.",
    },
    { kind: "heading", level: 3, text: "SLI, SLO, SLA — the triad" },
    {
      kind: "table",
      headers: ["Term", "What it is", "Example"],
      rows: [
        ["SLI", "Measured value", "98.3% of API requests completed in < 200 ms this week"],
        ["SLO", "Internal target", "99% of API requests should complete in < 200 ms"],
        ["SLA", "External contract with consequences", "\"If availability drops below 99%, customer gets a 10% credit\""],
      ],
    },
    {
      kind: "prose",
      html:
        "You measure SLIs, you target SLOs, you commit to SLAs. Most teams don't need SLAs (those are contracts), but every team benefits from well-defined SLOs — they tell you when to stop shipping features and focus on reliability.",
    },
    { kind: "heading", level: 3, text: "Error budget — the reliability math" },
    {
      kind: "prose",
      html:
        "An SLO of **99.9%** over 30 days gives you a **0.1% error budget** — about 43 minutes of downtime or failed requests per month. That's your budget to spend on risky changes, surprises, and bad luck. Once you're close to burning it, you stop deploying risky changes; once you've burned it, you stop deploying anything until you're back in the green.",
    },
    {
      kind: "table",
      headers: ["SLO", "Budget / 30 days", "Rough feeling"],
      rows: [
        ["99%", "~7.2 hours", "Easy — one full afternoon of outage is \"fine\""],
        ["99.9%", "~43 minutes", "Normal for most services"],
        ["99.99%", "~4.3 minutes", "Tight — one bad deploy eats half the budget"],
        ["99.999%", "~26 seconds", "Aspirational; typically requires multi-region automation"],
      ],
    },
    { kind: "heading", level: 3, text: "Burn rate — multi-window alerting" },
    {
      kind: "prose",
      html:
        "**Burn rate** is how fast you're spending the error budget. A 1× burn is sustainable (you'll miss SLO by exactly the budget amount in 30 days). A **10× burn** eats your whole month of budget in 3 hours — so a real 10× burn needs to page *right now*. A 1% burn is not urgent at all and can wait for tomorrow.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Multi-window burn-rate alerting (simplified)",
      body:
        "Modern SRE alerting uses multiple windows simultaneously: \"Page if the burn rate over 5 minutes exceeds 14× *and* the burn rate over 1 hour exceeds 14×\" — this catches true fast problems while filtering out tiny transient blips. It's a big upgrade over threshold alerts like \"error rate > 1%.\"",
    },
    { kind: "heading", level: 3, text: "On-call rotations" },
    {
      kind: "bullets",
      items: [
        "**Primary + secondary** — one person gets the first page; the second is a safety net if the first doesn't ack.",
        "**Weekly rotations** — long enough to get context, short enough not to burn anyone out.",
        "**Handoff notes** — open tickets, watched issues, known flakiness. Every rotation starts with a review.",
        "**Compensation** — paid on-call, comp days, or time off after hard weeks. Volunteer on-call is a recipe for turnover.",
        "**Escalation policy** — who's next if primary doesn't ack in 5 minutes? 10 minutes? Always have a path up.",
      ],
    },
    { kind: "heading", level: 3, text: "Fixing alert fatigue" },
    {
      kind: "prose",
      html:
        "The cure isn't \"try harder.\" It's to **audit every alert after every on-call shift** and ask: was this actionable? Was it urgent? Did I do something about it? Alerts that fail those questions get demoted (move to dashboard), merged (dedupe), re-thresholded, or deleted. An on-call shift with fewer than 2–5 pages is healthy; more than that is a system problem, not a tolerance problem.",
    },
    {
      kind: "think-about-it",
      scenario:
        "Over two weeks your team gets 73 pages for \"disk /tmp over 80%.\" In none of them did anyone do anything — /tmp just cleaned itself up within an hour. What's the problem, and what are the three tiers of possible fix?",
      hint: "The alert is legitimate (the observation is true), but that's not the same as useful.",
      answer:
        "The alert is **observationally correct but operationally useless**. Nobody takes action on it, so it fails the actionable test and it's training the on-call to ignore alerts. Three tiers of fix, cheapest to most involved: (1) **Raise the threshold** or add a duration requirement — only page if /tmp is >90% for 15 minutes continuously. (2) **Demote from pager to ticket** — let the condition open a P4 that engineering triages in business hours, since it's never truly urgent. (3) **Fix the underlying cause** — find what's writing aggressively to /tmp without cleanup (a misconfigured service? a failed cron rotation?) and remove the condition itself. The third is best, the first two are cheap triage, and the ugly anti-option is \"leave it as-is because we've always had it.\"",
    },
    {
      kind: "knowledge-check",
      question:
        "Your service has an SLO of 99.5% weekly. You're the on-call, and at the start of the week one bad deploy burned 30% of the monthly error budget in a single 45-minute incident. It's Monday morning now. What's the disciplined operational decision, and what does \"error budget\" actually buy you here?",
      answer:
        "You stop shipping risky changes for the rest of the week. The error budget is the price you pay for moving fast — and you've just consumed most of it in one shot. Pushing another risky change this week risks busting the SLO and surfacing as a customer-facing reliability problem. The disciplined move: freeze non-essential deploys, run the already-overdue post-incident action items, and only merge changes that directly improve reliability. If the team disagrees, escalate: the error budget is supposed to be the objective referee that ends these arguments. What it buys you is *permission to take calculated risks* — as long as you haven't spent all of it. Once you have, you temporarily switch modes from shipping to healing until budget replenishes.",
    },
  ],
};

// ── ops-m04 Documentation & Runbooks ───────────────────────────────────────

const opsS7: ChapterSection = {
  id: "ops-s7",
  topicId: "ops-processes",
  title: "Runbooks, SOPs, and Institutional Memory",
  subtitle: "Writing down what the team knows so you're not the single point of failure.",
  icon: "◩",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "A veteran DC tech quits. Within a month, three things break that nobody knows how to fix. A runbook entry that was a two-line note in her head is now a four-hour detective story for the next on-call. This is the most predictable failure mode of any ops team: **knowledge that only lives in the heads of a few senior people**. The fix isn't hiring more seniors. It's writing things down on purpose, and maintaining them like code.",
    },
    { kind: "heading", level: 3, text: "SOP vs MOP vs runbook — a reminder" },
    {
      kind: "bullets",
      items: [
        "**SOP (Standard Operating Procedure)** — *class* of work. \"How we replace a failed disk.\" Reusable.",
        "**MOP (Method of Procedure)** — *specific* task on a specific day. \"Replace disk sda in r17-03 on 2026-04-22.\" One-off.",
        "**Runbook** — troubleshooting / response to a *scenario*. \"When the GPU falls off the bus, do this.\"",
      ],
    },
    {
      kind: "prose",
      html:
        "You want all three in an ops organization. SOPs describe *how work is done* so new techs have a template. MOPs are the execution artifacts. Runbooks carry the hard-won knowledge for on-call to act on fast.",
    },
    { kind: "heading", level: 3, text: "What a good runbook contains" },
    {
      kind: "table",
      headers: ["Section", "Purpose"],
      rows: [
        ["Title + scope", "What scenario does this apply to? (Be specific)"],
        ["Prerequisites", "Access, credentials, tools you'll need before starting"],
        ["Symptoms", "What the alert / ticket / dashboard looks like"],
        ["Steps", "Numbered, explicit, with expected output for each"],
        ["Validation", "How do you know it's actually fixed?"],
        ["Rollback", "If your steps make it worse, how do you back out?"],
        ["Escalation", "Who to call, when — with current contact info"],
        ["Related", "Links to dashboards, tickets, past incidents, related runbooks"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "\"If it isn't documented, it didn't happen\"",
      body:
        "This isn't bureaucratic. It's operational. A fix that exists only in chat history is unfindable in six months. A runbook step that works but isn't written down will be re-invented every time. Treat documentation as a first-class deliverable, not an afterthought.",
    },
    { kind: "heading", level: 3, text: "Runbook drift — the silent killer" },
    {
      kind: "prose",
      html:
        "A runbook written two years ago references a command-line tool that's been deprecated, a dashboard that's been renamed, and an on-call person who's left the company. A tired on-call hits step 3, the command errors, they improvise, and now two things are broken. **Runbook drift** is the gap between what the runbook says and what reality is.",
    },
    {
      kind: "bullets",
      items: [
        "**Date every runbook.** Last-reviewed date prominently at the top.",
        "**Expire them.** Anything >6 months without review is suspect; anything >12 months is presumed stale.",
        "**Link to living sources.** If a dashboard URL is in the runbook, link it — if that dashboard ever moves, the link breaks obviously rather than silently.",
        "**Own them.** Every runbook has a team owner. No owner = no runbook.",
        "**Test them.** Tabletop exercises and game days where the team actually runs the runbook in a controlled setting.",
      ],
    },
    { kind: "heading", level: 3, text: "Shift handoff — documentation in miniature" },
    {
      kind: "prose",
      html:
        "Every on-call rotation ends with a **handoff note**: open tickets, ongoing incidents, things you're watching, anything unusual. This is real-time documentation — ephemeral, but essential. The canonical bad handoff is: *\"everything's fine, pager's yours.\"* Five hours later the incoming on-call is paged for a flapping switch that the outgoing one had been quietly mitigating for three days.",
    },
    {
      kind: "code",
      label: "A HANDOFF TEMPLATE WORTH STEALING",
      language: "text",
      code:
        "# On-call handoff — 2026-04-18 07:00\n\n## Active incidents\n- INC-2144 (P2): spine-3 intermittent drops. Acknowledged; Grafana dashboard X. Not paging right now.\n\n## Open tickets (still mine to close)\n- JIRA-8811: waiting on vendor RMA for failed PSU on r17-12 — ETA Mon.\n\n## Watched / flaky\n- GPU server r23-04: transient NVLink errors noted in SEL twice this week. Not severe, not paging. Logs linked in ticket JIRA-8841.\n\n## Upcoming changes / windows\n- Tonight 02:00 BIOS upgrade on row 12 (MOP: CHG-00231). IC: J. Chen.\n\n## Credentials / access\n- All tokens valid. VPN config updated Tuesday.\n\n## Anything unusual\n- None this week.",
    },
    { kind: "heading", level: 3, text: "Game days and tabletop exercises" },
    {
      kind: "prose",
      html:
        "The only way to know your runbooks work is to *run them*. **Tabletop exercises** are scenario walk-throughs (\"power feed A goes down; what do we do?\") run in a meeting. **Game days** are live simulated failures in production or staging (kill a random node, fail over a storage cluster, saturate a network link) with the team responding to real telemetry. Both surface runbook drift, missing alerts, and ambiguous escalation paths before real incidents do.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You open a runbook during a P2 incident. Step 4 says `ipmitool -H bmc.r17-03 -U admin power cycle`. You run it, and you get `Error: Unable to establish LAN session`. The runbook has no troubleshooting for this case. What do you do in the moment, and what do you do afterward?",
      hint: "In the moment: get the service back. Afterward: fix the runbook.",
      answer:
        "In the moment, escalate or work around — don't sit and stare. The runbook failed; that's now a sub-incident. Options: try the BMC web UI in a browser, try SSH to a neighboring host that can ping the BMC, escalate to the network team to check the management VLAN. Your priority is still service recovery; the runbook is a tool, not a commandment. *Afterward* — and this is the critical half — file a change to the runbook adding a \"what if ipmitool fails\" branch. Could be \"try the web UI,\" \"check management-VLAN connectivity from a bastion,\" \"escalate to NetEng if both fail.\" Every incident is an opportunity to improve documentation; every \"undocumented edge case\" you hit and then fail to write down is one you or a teammate will hit again.",
    },
    {
      kind: "knowledge-check",
      question:
        "A veteran on-call says \"I don't really use the runbooks, I just know this stuff.\" The team treats this as a sign of seniority. Why is it actually a risk, and what's the move to address it without being insulting?",
      answer:
        "It's the definition of **key-person risk**. When knowledge lives in one person's head, the team's MTTR for any scenario they're absent on is catastrophic. Vacation, illness, a job change — and suddenly that expertise is gone. The fix is not to criticize the veteran; it's to use them. Pair them with a writer or a junior engineer to extract runbooks: \"walk me through what you do when GPU fabric manager hangs.\" Record the session, turn it into a runbook, have the junior try to run it next time while the veteran supervises. The veteran's expertise doesn't shrink — it scales, because now the team can act on it when she's not there. A team's seniority is measured in part by how much of their knowledge is in shared docs, not how much is in private heads.",
    },
  ],
};

const opsS8: ChapterSection = {
  id: "ops-s8",
  topicId: "ops-processes",
  title: "Post-Incident Reviews and Learning",
  subtitle: "Blameless reviews, the 5 whys, and turning pain into improvement.",
  icon: "◪",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "prose",
      html:
        "An incident ends. The bridge disbands. Everyone goes home. Done, right? Not remotely. The incident is **data** — expensive, painful, hard-won data — about how the system actually behaves under stress. A team that doesn't run a careful **Post-Incident Review (PIR)** is a team that pays for the same outage again six weeks later. A team that runs PIRs well turns every scar into a systemic improvement.",
    },
    { kind: "heading", level: 3, text: "Blameless — and what it actually means" },
    {
      kind: "prose",
      html:
        "**Blameless** doesn't mean *people made no mistakes*. It means **the review does not assign individual blame as the root cause**. If the answer to \"why did this happen\" is \"because Alice made a mistake,\" the analysis stopped too early. The real question is: *what system allowed a tired Alice to do something serious at 02:00 with no safeguard?* That's an actionable question — it produces fixes like \"add a confirmation prompt,\" \"require paired approval,\" \"automate the step.\" \"Alice should be more careful\" produces nothing.",
    },
    {
      kind: "callout",
      variant: "info",
      title: "Blameless isn't \"no accountability\"",
      body:
        "Blame-free review protects people *in the PIR* so the facts come out honestly. It does not exempt people from ongoing professional standards. If someone repeatedly violates clear rules, that's a management conversation — separately and privately. The PIR is not the place to litigate individuals; it's the place to improve the system.",
    },
    { kind: "heading", level: 3, text: "PIR structure" },
    {
      kind: "table",
      headers: ["Section", "Purpose"],
      rows: [
        ["Summary", "One paragraph — what happened, when, how long, who was impacted"],
        ["Timeline", "Minute-by-minute record of detection, triage, actions, resolution"],
        ["Impact", "Users affected, money lost, SLO burn, compute wasted"],
        ["Root cause", "The technical trigger (the thing that directly broke)"],
        ["Contributing factors", "The conditions that let it break — monitoring gaps, process issues, tooling gaps"],
        ["What went well", "Things the response got right — explicitly named, to reinforce"],
        ["Action items", "Concrete follow-ups, each with an owner and a date"],
        ["Meta", "Trends, recurring themes, cross-incident observations"],
      ],
    },
    { kind: "heading", level: 3, text: "The 5 whys" },
    {
      kind: "prose",
      html:
        "A technique for reaching systemic causes: ask *why* five times. Each answer becomes the subject of the next *why*. Most teams stop too early; the discipline is to push until you hit an organizational, process, or design cause — not just a technical one.",
    },
    {
      kind: "code",
      label: "A WORKED EXAMPLE",
      language: "text",
      code:
        "Why did the cluster go down?\n  → Because the BGP peering with the spine dropped.\nWhy did the peering drop?\n  → Because config was pushed that added a wrong AS number.\nWhy wasn't that caught?\n  → The config linter doesn't validate AS numbers against peers.\nWhy not?\n  → That check was planned but de-prioritized a year ago.\nWhy was that planned but not done?\n  → It wasn't tracked anywhere after the initial proposal; the engineer who owned it left.\n\nAction items: (a) Implement the lint check. (b) Add BGP AS validation to the staging pre-check. \n                (c) Build a process where \"planned but not done\" safety work has a tracked backlog, not memory.",
    },
    { kind: "heading", level: 3, text: "Action items — what makes them stick" },
    {
      kind: "bullets",
      items: [
        "**Owner.** One name, not a team. \"SRE\" is not an owner; \"Alex\" is.",
        "**Deadline.** A date. \"Q2\" is not a deadline; \"May 15\" is.",
        "**Measurable.** \"Improve documentation\" is not measurable; \"Add runbook for scenario X by May 15, reviewed by on-call team\" is.",
        "**Tracked.** In the same ticket system as other work, visible in planning, reviewable.",
        "**Prioritized.** Action items from real outages beat new feature work for a reasonable window. Otherwise they'll be ignored.",
      ],
    },
    {
      kind: "prose",
      html:
        "A common failure mode: PIRs generate great action items and then nobody does them, because they compete with feature work and product pressure. Teams that win long-term reliability battles protect post-incident work — at least for the first two weeks after an outage.",
    },
    { kind: "heading", level: 3, text: "Meta-review — patterns across incidents" },
    {
      kind: "prose",
      html:
        "Every single PIR is a data point. Quarterly or biannually, **review the stack of PIRs together** and look for patterns. *\"Four of our last six outages involved a config push.\"* *\"Three of our last five required a cold boot of the fabric manager.\"* Patterns point at systemic issues that no individual PIR can surface — and fixing them is often the highest-leverage reliability work a team can do.",
    },
    {
      kind: "think-about-it",
      scenario:
        "In a PIR, the IC writes: *\"Root cause: Alice ran `rm -rf /var/lib/postgresql` by accident at 02:30.\"* The action item is: *\"Alice will be more careful with `rm` in the future.\"* What's wrong with this analysis, and what does a good version look like?",
      hint: "\"The operator was careless\" is the symptom of a bad analysis, not a finding.",
      answer:
        "This is the textbook failure mode of a non-blameless PIR. The real questions: Why did any individual have `rm -rf` permission on a production DB host at 02:30 without confirmation or safety rails? Why did the production and staging hosts have the same shell history, making it easy to paste a staging command into a prod terminal? Why wasn't there a visual cue (colored prompt, host banner) indicating \"YOU ARE IN PROD\"? Why did the runbook for that task not have a review-before-apply gate? A good PIR reads: *Root cause: unrestricted `rm -rf` executed against a critical data directory with no confirmation prompt, in an environment where staging and prod shells are visually identical.* Action items: (a) Replace direct `rm` with a safer wrapper that requires `--yes-i-really-mean-it`. (b) Colored shell prompts and host banners distinguishing prod. (c) For destructive prod operations, require paired-engineer approval. Now the system is harder to break — no matter how tired the next operator is.",
    },
    {
      kind: "knowledge-check",
      question:
        "A team holds a PIR after an outage; the notes are thorough, action items have owners and deadlines. Six weeks later, the same incident recurs. What most likely went wrong between the PIR and the recurrence, and how would you run things differently?",
      answer:
        "Almost always: **the action items weren't actually done**. They were filed, prioritized low against feature work, and faded. The PIR was a rituals rather than a commitment. The fix is process: (1) PIR action items are tracked in the same backlog as regular work, not in a side doc. (2) They are assigned a deliberate priority — often higher than feature work for the next 2–4 weeks, explicitly. (3) Weekly team ops review checks progress on open post-incident items. (4) Any recurrence of the same issue automatically reopens the original PIR and promotes its items to highest priority. Teams that treat action items as suggestions have flat reliability curves; teams that treat them as commitments trend improving. The PIR *write* is the easy part; the *follow-through* is the discipline.",
    },
  ],
};

// ── Registry ────────────────────────────────────────────────────────────────

export const OPS_CHAPTERS: ChapterSection[] = [
  opsS1,
  opsS2,
  opsS3,
  opsS4,
  opsS5,
  opsS6,
  opsS7,
  opsS8,
];
