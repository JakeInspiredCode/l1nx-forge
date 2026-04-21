import type { MCQuestion } from "@/lib/types/campaign";

// pwr-m04 "Efficiency & Environmental Response" — covers pwr-s7 (PUE, Density) + pwr-s8 (When Things Go Wrong)

export const PWR_M04_QUESTIONS: MCQuestion[] = [
  {
    id: "pwr-m04-q01",
    question:
      "A 20 MW DC currently runs at PUE 1.55. A vendor pitches a \$3M aisle-containment + chiller-tuning retrofit projected to hit PUE 1.35. What's the approximate payback, and why is this class of project almost always greenlit?",
    choices: [
      { label: "A", text: "Rejected — over 5 year payback" },
      { label: "B", text: "20 MW × 8760 h × (1.55 − 1.35) × \$0.07/kWh ≈ \$2.45M/year savings. Payback ≈ 14 months. The savings are essentially permanent (the retrofit keeps delivering for 10+ years). PUE-reduction projects targeting physical containment and chiller efficiency are some of the highest-ROI capex items in DC operations" },
      { label: "C", text: "Negative payback" },
      { label: "D", text: "10-year payback" },
    ],
    correctAnswer: "B",
    explanation:
      "PUE savings × load × annual hours × rate gives you the back-of-envelope number any DC lead should be able to do in their head. The 0.2 PUE gap at 20 MW pays the project off in a little over a year and saves millions every year after.",
  },
  {
    id: "pwr-m04-q02",
    question:
      "Which statement most accurately captures what PUE is and what it's good for?",
    choices: [
      { label: "A", text: "PUE is the ratio of cooling power to IT power" },
      { label: "B", text: "PUE = Total facility power / IT load power. 1.0 is theoretical perfection; 1.1 is best-in-class; 1.2 is good; 1.5 is average. It's the single most useful efficiency metric for a DC because every 0.1 of PUE maps directly to annual utility spend at scale. Lower PUE means less non-IT overhead and less electricity wasted on anything other than compute" },
      { label: "C", text: "PUE is a score from 0 to 100" },
      { label: "D", text: "PUE measures GPU utilization" },
    ],
    correctAnswer: "B",
    explanation:
      "PUE is the universal DC efficiency metric. The math is simple, the implication is direct: every 0.1 of PUE at a 10 MW site is roughly \$800k/year. Know the number and where yours sits relative to best-in-class.",
  },
  {
    id: "pwr-m04-q03",
    question:
      "Given two candidate PUE-reduction projects on a 10 MW DC — (A) \$1M chiller VSD upgrade for 0.05 PUE, (B) \$300k aisle-containment + blanking panels for 0.07 PUE — which do you do first and why?",
    choices: [
      { label: "A", text: "(A) — chiller work is more modern" },
      { label: "B", text: "(B) first. Containment and blanking is lower cost, faster to deploy, lower operational risk, and delivers more PUE improvement. Back-of-envelope: 10 MW × 8760 × 0.07 × \$0.07 ≈ \$430k/yr → payback ~8 months. Chiller VSDs are a good project but capital-heavy with multi-year payback — do the cheap, physical wins first, then reassess what's still worth capital investment" },
      { label: "C", text: "Both at the same time to maximize downtime" },
      { label: "D", text: "Neither — PUE doesn't matter" },
    ],
    correctAnswer: "B",
    explanation:
      "The order of operations in PUE work is: physical cheap wins first (containment, blanking panels, setpoint tuning), then capital projects. You get the fastest payback and may find the remaining capital projects are no longer as compelling. Always sequence low-risk / high-leverage before high-risk / high-capital.",
  },
  {
    id: "pwr-m04-q04",
    question:
      "A colleague argues PUE matters less for AI-heavy datacenters because 'GPUs dominate the load anyway.' What's the correct counter?",
    choices: [
      { label: "A", text: "They're right — GPUs are everything" },
      { label: "B", text: "PUE matters *more* at AI scale, not less. Yes, GPUs dominate the IT load share, but the cooling required to move that heat is proportionally larger too — more chillers, pumps, UPS losses on a bigger absolute load. A 50 MW GPU campus going from PUE 1.5 to 1.3 saves roughly \$6M/year. That's exactly why direct-to-chip cooling is getting designed into AI builds — the PUE improvement dominates the capex premium at scale" },
      { label: "C", text: "PUE doesn't apply to AI DCs" },
      { label: "D", text: "Only applies to cloud DCs" },
    ],
    correctAnswer: "B",
    explanation:
      "Share vs absolute is the confusion. AI DCs are huge in megawatts, so even a small PUE delta translates to millions of dollars. The industry's push toward liquid cooling is itself largely PUE-driven.",
  },
  {
    id: "pwr-m04-q05",
    question:
      "A CRAH alarms offline in a GPU hall at 03:12. Inlet temps rise ~1°C/min in the affected row. Your IC asks for the first three moves. What's the right sequence?",
    choices: [
      { label: "A", text: "Turn off the whole hall immediately" },
      { label: "B", text: "(1) Confirm scope — one CRAH or many, one row or whole hall. (2) Notify facilities/chiller plant and page cooling specialist. (3) Start proactive load-shed planning — identify training jobs that can be paused and services that must stay up; have the shed plan *ready* by the time you hit the 15-minute mark even if you haven't yet executed. Do NOT start any compute restarts; the live problem is removing heat, not adding compute" },
      { label: "C", text: "Wait and see if it's a false alarm" },
      { label: "D", text: "Open doors for natural airflow" },
    ],
    correctAnswer: "B",
    explanation:
      "Thermal incidents reward preparation. Waiting wastes the initial 10–15 minutes of margin; turning the hall off is self-inflicted outage; opening doors doesn't meaningfully cool a 10 MW hall. Scope → escalate → prepare the shed plan is the professional cadence.",
  },
  {
    id: "pwr-m04-q06",
    question:
      "During a walkthrough of a liquid-cooled hall, you find half a cup of water in a drip pan below a CDU — no alarms fired. What's the right response?",
    choices: [
      { label: "A", text: "Wipe it up; continue walkthrough" },
      { label: "B", text: "Photograph with timestamp, check leak-detection-cable and BMS logs (why didn't it alarm?), notify facilities and the liquid-cooling vendor on-call immediately, inspect the CDU for visible seepage / loose fittings / degraded gaskets, and evaluate de-energizing the rack if water is near live components. Always create a ticket; that half-cup is either the start of a trend or the tail of an event, and you cannot tell by looking" },
      { label: "C", text: "Assume it's condensation" },
      { label: "D", text: "Pour the water out and move on" },
    ],
    correctAnswer: "B",
    explanation:
      "In a liquid-cooled environment, a wet drip pan is an unfired alarm's physical evidence. The protocol is: document, investigate, escalate. Never 'just wipe it.' If the detection cable didn't alarm, the detection itself has a problem that matters as much as the leak.",
  },
  {
    id: "pwr-m04-q07",
    question:
      "Why is it essential that external crews (cleaning, contractors, non-DC staff) receive walkthroughs about red EPO buttons in a datacenter?",
    choices: [
      { label: "A", text: "Compliance only" },
      { label: "B", text: "Because EPO buttons look to an untrained eye like door-release or alarm-silence buttons. Accidental EPOs are one of the most recurring causes of preventable datacenter outages — cleaners leaning mops into them, contractors confused by red mushroom buttons at exits. Break-glass covers, clear signage, and mandatory day-one walkthroughs for any non-DC staff on the floor dramatically reduce the chance of an accidental full-hall outage" },
      { label: "C", text: "Buttons are only for staff" },
      { label: "D", text: "Everyone knows what EPOs are" },
    ],
    correctAnswer: "B",
    explanation:
      "The one-button outage risk is real. Every outage story about 'the cleaner who leaned on the button' is a site that didn't have break-glass covers, clear signage, or a walkthrough. Treat outside-crew orientation as mandatory safety training, not paperwork.",
  },
  {
    id: "pwr-m04-q08",
    question:
      "A colleague says power/cooling ops only needs to worry about equipment staying up — software teams handle their own incident response. Why is that framing dangerous?",
    choices: [
      { label: "A", text: "They're right; stay in your lane" },
      { label: "B", text: "The outage the customer sees is the downstream effect of what the facilities team is watching upstream. A cooling event turns into GPU throttling → latency spike → customer ticket — but nothing in that chain starts on the software side. If power/cooling ops operates in isolation, software teams spend hours triaging symptoms before connecting them to the infrastructure event. Integrated incident response (facilities + software on the same bridge, with proactive upstream notifications) collapses MTTR from hours to minutes" },
      { label: "C", text: "Facilities has no effect on software" },
      { label: "D", text: "Only SRE handles incidents" },
    ],
    correctAnswer: "B",
    explanation:
      "Silos cost minutes — many of them — during every real incident. A facilities tech who proactively posts 'CRAH-4 is offline, expect degraded perf in row 8' into the SRE channel is worth more than a tech who fixes twice as fast but tells no one. Integrated incident response is arguably the single biggest MTTR improvement any mature DC makes.",
  },
];
