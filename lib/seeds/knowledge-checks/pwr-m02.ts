import type { MCQuestion } from "@/lib/types/campaign";

// pwr-m02 "UPS & Backup Power" — covers pwr-s3 (UPS — 10-Second Bridge) + pwr-s4 (Generators & ATS)

export const PWR_M02_QUESTIONS: MCQuestion[] = [
  {
    id: "pwr-m02-q01",
    question:
      "Which UPS topology is the only acceptable choice for a modern AI training cluster, and why?",
    choices: [
      { label: "A", text: "Standby (offline) — cheapest" },
      { label: "B", text: "Online / double-conversion. The load is *always* running on the inverter, with batteries floating in parallel on the DC bus. Utility loss simply changes the DC-bus input from rectifier to battery — the load sees zero switchover. RDMA training fabrics and clustered storage cannot tolerate the 2–15 ms transfer gap that line-interactive or standby topologies have" },
      { label: "C", text: "Line-interactive — good compromise" },
      { label: "D", text: "Any topology — all are equivalent at scale" },
    ],
    correctAnswer: "B",
    explanation:
      "Online / double-conversion is the only topology with true zero-switchover. Line-interactive still has a small transfer time, and standby is worse. For latency-sensitive workloads (RDMA, high-availability clusters), even a 10 ms interruption causes measurable damage — job restarts, storage-cluster recovery, lost training compute.",
  },
  {
    id: "pwr-m02-q02",
    question:
      "A facilities engineer says the site's UPS is 'rated for 30 minutes at full load.' What's the right follow-up question?",
    choices: [
      { label: "A", text: "'Can we bank 10 of those minutes for later?'" },
      { label: "B", text: "'When did we last verify actual runtime under load, and has battery capacity been tested recently?' Nameplate runtime is a fresh-battery / nominal-temp figure. Aged VRLA or degraded Li-ion commonly delivers far less than spec — a '30-minute' UPS with 3-year-old batteries might deliver 8 minutes when you need it. Reliability is measured via self-tests, impedance tests, and load-bank tests, not nameplate" },
      { label: "C", text: "'Is the UPS plugged in?'" },
      { label: "D", text: "'What's the warranty?'" },
    ],
    correctAnswer: "B",
    explanation:
      "Plate rating and real-world delivered capacity diverge over time. Battery state degrades gradually with age, cycles, and temperature. A UPS that hasn't been load-tested in 18 months is running on faith. Every serious reliability conversation about runtime starts with 'when did we last verify.'",
  },
  {
    id: "pwr-m02-q03",
    question:
      "Why has the industry moved new builds toward Li-ion (especially LFP chemistry) UPS batteries instead of VRLA lead-acid?",
    choices: [
      { label: "A", text: "Li-ion is always cheaper upfront" },
      { label: "B", text: "Li-ion has roughly 2–3× the lifetime (8–15 years vs 3–5), takes ~1/3 the space, tolerates heat and cycles much better, and has integrated BMS monitoring per cell. Total cost of ownership over 10+ years beats VRLA despite higher upfront cost. Footprint savings in a DC are also real capex — battery rooms get a lot of their space back" },
      { label: "C", text: "Li-ion never catches fire" },
      { label: "D", text: "Li-ion doesn't need testing" },
    ],
    correctAnswer: "B",
    explanation:
      "TCO plus footprint plus monitoring beats upfront cost handily. Fire risk exists but is managed by BMS and containment design; it doesn't reverse the economics. Li-ion still needs testing — what changes is that the BMS gives you continuous per-cell visibility instead of the periodic-impedance-test approach that VRLA required.",
  },
  {
    id: "pwr-m02-q04",
    question:
      "A facility runs no-load generator tests monthly (engine starts and runs without load for 30 minutes) and declares generator reliability 'tested.' What's the critical gap?",
    choices: [
      { label: "A", text: "No gap — engines that start are reliable" },
      { label: "B", text: "No-load proves only that the engine starts and runs. It doesn't verify that the ATS actually transfers the load, that the alternator handles real kW, that voltage/frequency stay in spec under load, or that paralleling works with other gens. Generators commonly start at no-load and then fail under load from fuel, cooling, or ATS issues. Load-bank or real-load testing must be part of the program" },
      { label: "C", text: "Should test only every 6 months" },
      { label: "D", text: "Generators never need testing" },
    ],
    correctAnswer: "B",
    explanation:
      "This is the textbook reliability-theater failure. 'Our gen tests perfectly' + 'the real outage failed' almost always means the tests were no-load. Real testing includes periodic load-bank runs (quarterly minimum) and actual ATS transfers, not just spinning the engine.",
  },
  {
    id: "pwr-m02-q05",
    question:
      "What's the key distinction between an ATS and an STS, and when do you use each?",
    choices: [
      { label: "A", text: "They're interchangeable" },
      { label: "B", text: "ATS switches between utility and generator on seconds timescales — it waits for the generator to start and stabilize before transferring load. STS switches between two already-live AC sources (usually UPS-A and UPS-B outputs) on millisecond timescales — for single-corded devices that still need dual-path redundancy. Different jobs, different timescales, different physics" },
      { label: "C", text: "STS is just a newer ATS" },
      { label: "D", text: "Both work only for single-phase power" },
    ],
    correctAnswer: "B",
    explanation:
      "Knowing which device does what means you're pointing at the right panel during incidents. 'The STS alarmed' is a very different event from 'the ATS alarmed,' and mixing them up during a bridge call costs precious diagnostic minutes.",
  },
  {
    id: "pwr-m02-q06",
    question:
      "At 03:15 utility drops. UPS alarms briefly, then clears — the load never saw the event. The generator didn't crank. What are the two most important things to investigate, beyond 'relieved nobody noticed'?",
    choices: [
      { label: "A", text: "Nothing — the UPS covered it" },
      { label: "B", text: "(1) Did the battery actually discharge and recharge cleanly? Check BMS for discharge event, state-of-charge dip, and return to 100%. (2) Why didn't the generator attempt to start? ATS start-command wiring, gen test-inhibit flags, or a battery/air-start fault can all cause an ATS to see the utility fault but fail to start the gen. A free utility blip that passed silently is a free warning that the next event might be longer — fix the start-signal issue before it matters" },
      { label: "C", text: "Replace all fuses" },
      { label: "D", text: "Ignore — single events aren't worth investigating" },
    ],
    correctAnswer: "B",
    explanation:
      "Free learning events are gold. The UPS did its job, but the generator not starting on a qualifying fault means the next 40-minute outage will find you without the generator. A 4-second blip that you investigate now is a career-defining outage you prevent in six weeks.",
  },
  {
    id: "pwr-m02-q07",
    question:
      "Why is UPS 'bypass mode' both useful and dangerous, and how should it be treated operationally?",
    choices: [
      { label: "A", text: "Bypass is a safer operating mode than normal — use always" },
      { label: "B", text: "Bypass routes mains directly to the load *around* the UPS — useful for maintaining or replacing the UPS without a load drop. Dangerous because while in bypass, there is NO UPS protection: a utility event during bypass drops the load immediately. Operationally, bypass is a planned, time-bounded, announced operation — never a steady state. Treat it as 'protected time' with explicit entry and exit criteria and a mitigation if utility faults during the window" },
      { label: "C", text: "Bypass is only used during lightning storms" },
      { label: "D", text: "Bypass is the same as online mode" },
    ],
    correctAnswer: "B",
    explanation:
      "Bypass is a scalpel, not a shield. It lets you work on the UPS without dropping the load, but you trade protection for access. Good sites treat bypass operations like any other risky maintenance: documented MOP, short window, communication, contingency.",
  },
  {
    id: "pwr-m02-q08",
    question:
      "A storm knocks out utility at 03:15. UPS takes the load; generator cranks for 20 seconds and fails. UPS is rated 10 minutes. What's the disciplined response in the next 5 minutes?",
    choices: [
      { label: "A", text: "Crank the generator repeatedly until it starts" },
      { label: "B", text: "(1) Page IC and facilities; open a bridge and start the incident log. (2) Call the generator maintenance vendor emergency line. (3) If trained, attempt a manual start at the panel (fuel valve, air-start, emergency-run). (4) Build a proactive load-shed plan — identify training jobs that can be paused and services that must stay up — so you can execute it before the UPS cliff if needed. (5) Notify customers of impending outage; visibility before impact is dramatically better than impact with no notice" },
      { label: "C", text: "Turn off the UPS to save battery" },
      { label: "D", text: "Announce outage to public after gear dies" },
    ],
    correctAnswer: "B",
    explanation:
      "The UPS just gave you a runtime budget — treat it as a timeline. The response ladder is escalate, engage the vendor, attempt manual start, plan proactive shedding, communicate. Repeated cranking can kill the starter motor; turning off the UPS is self-sabotage; hiding the outage destroys trust.",
  },
];
