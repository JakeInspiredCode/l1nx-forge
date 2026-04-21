import type { MCQuestion } from "@/lib/types/campaign";

// pwr-m01 "Power Distribution" — covers pwr-s1 (Following the Watt) + pwr-s2 (PDUs, Circuits, A+B Feeds)

export const PWR_M01_QUESTIONS: MCQuestion[] = [
  {
    id: "pwr-m01-q01",
    question:
      "During a utility outage, which device actually carries the load for the 10–30 second window before the generator stabilizes?",
    choices: [
      { label: "A", text: "The generator — it starts instantly" },
      { label: "B", text: "The UPS — sized specifically to bridge that 10–30 s window from its battery string until the generator comes up to speed and the ATS transfers the load" },
      { label: "C", text: "The ATS alone" },
      { label: "D", text: "The PDU's internal battery" },
    ],
    correctAnswer: "B",
    explanation:
      "The UPS has exactly one job: carry the full load across the gap while the generator starts. Generators take seconds to come up to rated speed and frequency; during that interval, the UPS provides DC-bus-inverted AC to the load. Neither the ATS (which just switches between sources) nor the PDU (which just distributes) store any meaningful energy.",
  },
  {
    id: "pwr-m01-q02",
    question:
      "You're asked why modern AI datacenters use 2N power topology instead of N+1. What's the correct framing?",
    choices: [
      { label: "A", text: "N+1 is cheaper and adequate for GPUs" },
      { label: "B", text: "2N provides two fully independent paths — A feed and B feed from separate switchgear, UPS systems, and PDUs. A whole-path failure (planned maintenance, a bad switchgear bus, a UPS maintenance window) costs zero uptime. N+1 tolerates a single component failure but not a full-path loss. At AI-DC economics, tolerating a whole-path outage is worth the capital premium" },
      { label: "C", text: "2N uses less copper" },
      { label: "D", text: "Both are identical; it's marketing" },
    ],
    correctAnswer: "B",
    explanation:
      "2N is about path redundancy, not component redundancy. You can lose a whole side of the electrical topology — for maintenance, for an equipment failure, for a fault at the switchgear level — and keep running. N+1 only survives small failures. The premium is justified by the business cost of downtime at AI scale.",
  },
  {
    id: "pwr-m01-q03",
    question:
      "A dual-PSU server is reporting both PSUs healthy. A power technician audits the rack and finds both PSUs are plugged into PDU-A; PDU-B is untouched. What's the real state of that server's redundancy?",
    choices: [
      { label: "A", text: "Fine — both PSUs are up" },
      { label: "B", text: "Effectively single-fed. Each PSU individually looks healthy because it has input power and is converting, but redundancy is a property of the pair, not the individual PSU. If feed A takes any kind of outage (maintenance, breaker trip, fault), the server goes dark. The PSUs can't tell you about the misplug — only a physical cord audit can" },
      { label: "C", text: "The server will automatically fail over to generator" },
      { label: "D", text: "The IPMI will alarm on this condition" },
    ],
    correctAnswer: "B",
    explanation:
      "The silent misplug is one of the most common datacenter quality-of-installation issues. PSUs self-check based on their own input; neither PSU knows what the *other* is plugged into. Color-coded cords (red = A, blue = B), laminated cord tags, and periodic physical audits are how real sites catch this before it bites.",
  },
  {
    id: "pwr-m01-q04",
    question:
      "A rack is fed by two 30A 208V single-phase circuits. One circuit's metered PDU reads 23A. The team wants to add a 2.4 kW 1U server. What's the disciplined call?",
    choices: [
      { label: "A", text: "Add it — 23A is under 30A" },
      { label: "B", text: "Don't add it. 2.4 kW at 208V ≈ 11.5A; 23 + 11.5 = 34.5A, well above the 24A continuous-load limit (80% of 30A per NEC). Either move to a new circuit or upsize. The 80% rule exists because continuous loads near or at breaker rating nuisance-trip and create fire risk" },
      { label: "C", text: "Add it briefly during off-peak hours only" },
      { label: "D", text: "Overloading is fine for short periods" },
    ],
    correctAnswer: "B",
    explanation:
      "The 80% rule is not a suggestion. Breakers are rated for continuous load at 80% of nameplate; pushing closer to 100% guarantees nuisance trips and creates real safety hazards. The only correct answer is more copper — a new circuit or higher-capacity circuits.",
  },
  {
    id: "pwr-m01-q05",
    question:
      "You're comparing PDU types for a new rack deployment. Which feature set represents the minimum-viable PDU for a modern production DC rack?",
    choices: [
      { label: "A", text: "Basic (dumb) strip — cheapest option" },
      { label: "B", text: "At minimum, metered — real-time amperage shown on the PDU and exposed via SNMP. Without that, you have no capacity visibility. Switched (remote outlet on/off) and monitored (per-outlet metering) are incremental upgrades; metered is the floor" },
      { label: "C", text: "Any model supporting C19 connectors" },
      { label: "D", text: "Any with LED lights for wayfinding" },
    ],
    correctAnswer: "B",
    explanation:
      "Metered is the baseline: you must know what each circuit is drawing. Switched adds remote power-cycle (huge on-call improvement). Monitored (per-outlet) adds the ability to detect failing PSUs by abnormal draw. Dumb strips belong in closets, not in production DC racks.",
  },
  {
    id: "pwr-m01-q06",
    question:
      "The NOC alerts show 14 racks in row 4 suddenly dark simultaneously. Racks in rows 3 and 5 are healthy. Utility and generator status both normal. Where do you look first?",
    choices: [
      { label: "A", text: "Assume the servers crashed; start rebooting them" },
      { label: "B", text: "Scope points at row-level infrastructure — most likely a floor PDU or row-main breaker feeding only that row tripped. Utility/gen are fine (they feed the whole hall). First move: check the floor PDU for row 4 for tripped mains and alarms; then call facilities. Don't power-cycle servers — they aren't broken, their feed is" },
      { label: "C", text: "Call every customer using row 4" },
      { label: "D", text: "Flip the EPO to reset everything" },
    ],
    correctAnswer: "B",
    explanation:
      "The pattern (a single row out, neighbors healthy, upstream healthy) is textbook row-PDU or row-main. Trying to recover servers makes no sense — they're not broken. Never reset tripped breakers without understanding why they tripped; resetting into a fault is how an outage turns into a fire.",
  },
  {
    id: "pwr-m01-q07",
    question:
      "A proposed AI rack holds three 8× H100 servers, each drawing about 10.2 kW at load. It's planned into a rack with two 30A 415V three-phase circuits (derated to ~17 kW usable per feed — ~17 kW per side). What's wrong with the plan, and what does a disciplined AI-capable rack design look like?",
    choices: [
      { label: "A", text: "Plan is fine — feeds are redundant" },
      { label: "B", text: "Three servers × 10.2 kW ≈ 30.6 kW total — nearly double the ~17 kW usable per feed, so breakers trip the moment training ramps. The disciplined AI rack design uses higher-amperage circuits (60A or 100A three-phase) and is designed for 40–60+ kW per rack. Don't retrofit GPU loads into a traditional 30A rack; rebuild the power" },
      { label: "C", text: "Use only 2 of the 3 servers" },
      { label: "D", text: "Run them at 50% TDP" },
    ],
    correctAnswer: "B",
    explanation:
      "Modern AI rack density (40–60+ kW per rack) is fundamentally incompatible with traditional 30A-class infrastructure. You can't 'manage the load' into a rack that can't carry it — plan capacity in kW and amps first, then allocate U-space.",
  },
  {
    id: "pwr-m01-q08",
    question:
      "Which statement most accurately describes the relationship between C13/C14 and C19/C20 connectors in a datacenter?",
    choices: [
      { label: "A", text: "They're identical except for color" },
      { label: "B", text: "C13/C14 is the standard lower-amperage (~10A) connector used by most 1U/2U server PSUs and most rack PDU outlets. C19/C20 is the chunkier higher-amperage (~16–20A) version used for high-draw PSUs (GPU servers, dense 2U/4U compute) and on high-capacity PDUs. Match the connector to the PDU outlet; they are not interchangeable" },
      { label: "C", text: "C19 is only for Europe" },
      { label: "D", text: "C13 is used only for power strips, not servers" },
    ],
    correctAnswer: "B",
    explanation:
      "Knowing your connectors is basic DC hygiene. You'll walk into a new GPU rack and need to know whether it expects C13 or C19 jumpers, what amperage the cord is rated for, and whether the PDU outlet matches. Mismatched connectors mean mismatched capacity.",
  },
  {
    id: "pwr-m01-q09",
    question:
      "In a 2N topology, a facilities team schedules a planned maintenance window to take UPS-A offline for battery replacement. The DC operator objects on the grounds that 'the workload will be unprotected during that window.' Who's right?",
    choices: [
      { label: "A", text: "The operator — workload should pause during any maintenance" },
      { label: "B", text: "The facilities team — the whole point of 2N is that an entire path can be taken out of service for maintenance with the surviving path carrying full load. Dual-corded servers don't even notice the A-side outage; single-corded devices should already be behind an STS that's fed from both UPS outputs. This is exactly what 2N was bought for" },
      { label: "C", text: "Both are wrong; call vendor" },
      { label: "D", text: "Neither — force majeure" },
    ],
    correctAnswer: "B",
    explanation:
      "A common misunderstanding: 2N isn't 'double protection during failures,' it's 'one full path can always be offline.' Maintenance on UPS-A is a planned, safe, routine operation in a 2N DC — it's what lets you replace batteries, test transfer, upgrade firmware without downtime.",
  },
  {
    id: "pwr-m01-q10",
    question:
      "You walk a newly built rack. PDU-A reads 18A; PDU-B reads 6A. The rack is loaded with servers that should draw similar power. What's the likely explanation?",
    choices: [
      { label: "A", text: "Normal variance between PDUs" },
      { label: "B", text: "Multiple servers are silently misplugged with both PSUs on PDU-A, leaving PDU-B under-loaded. The 3:1 ratio is the tell. Physical audit: walk each server and verify one red cord and one blue cord. Every misplug is a single-feed server hiding in the rack" },
      { label: "C", text: "PDU-B is broken" },
      { label: "D", text: "The IPMI would alarm if something was wrong" },
    ],
    correctAnswer: "B",
    explanation:
      "Lopsided draw between A and B is the classic signature of misplugs. In a healthy rack with dual-corded servers the two sides should be near-equal. When they're not, the servers with misplugs are single-fed and will drop during any A-side event. Fix by audit.",
  },
];
