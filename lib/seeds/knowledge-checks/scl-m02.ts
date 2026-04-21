import type { MCQuestion } from "@/lib/types/campaign";

// scl-m02 "Rack & Cluster Design" — covers scl-s3 (U math, density, weight, A+B) + scl-s4 (Airflow, cable discipline, cluster hierarchy)

export const SCL_M02_QUESTIONS: MCQuestion[] = [
  {
    id: "scl-m02-q01",
    question:
      "You have a 42U rack and need to reserve space for ToR + cable management at the top and horizontal cable management at the bottom. Approximately how many U of usable server space remain?",
    choices: [
      { label: "A", text: "42U — vertical PDUs don't consume U-space, so nothing is lost" },
      { label: "B", text: "**About 38U.** Reserve roughly 2U at the top (patch panel + ToR) and 2U at the bottom (cable management). Vertical PDUs mount on the 0U side rails and don't consume U-space, but the top and bottom reservations do. Planning against 38 usable U is more accurate than assuming the full 42" },
      { label: "C", text: "21U — exactly half" },
      { label: "D", text: "32U — reserve 10U for airflow" },
    ],
    correctAnswer: "B",
    explanation:
      "New techs plan to the nameplate 42U and run out of room for cabling. Subtracting ~4U for the top and bottom reservations gives you the honest figure you should size designs against.",
  },
  {
    id: "scl-m02-q02",
    question:
      "A rack has 38U free, two 208V 30A circuits, and is rated for 17 kW usable. The design calls for 19 × 2U servers at 800W each. What's the binding constraint?",
    choices: [
      { label: "A", text: "U-space — 19 × 2U = 38U fits exactly, approve" },
      { label: "B", text: "**Power.** 19 × 800W = 15.2 kW nameplate — approaching the 17 kW cap, and real-world training-workload ramps push past derates. Also check weight: ~60 lb × 19 servers + rack + PDUs can approach the static limit. Every rack has three independent budgets (U, kW, lb); U looks spacious but the kW limit binds first. Ship 16–17 servers, leave headroom" },
      { label: "C", text: "Weight — 38U of server is always too heavy" },
      { label: "D", text: "Cooling — 38U of server always exceeds cold-aisle capacity" },
    ],
    correctAnswer: "B",
    explanation:
      "kW is almost always the first budget you hit, then weight, then U. The discipline is to compute all three *before* you plan the layout — \"U-space looks roomy\" is how you end up tripping breakers a month after install.",
  },
  {
    id: "scl-m02-q03",
    question:
      "You're asked to roll a fully loaded 2,200 lb rack across a raised floor rated at 500 PSF. Rack static capacity is 2,500 lb; dynamic capacity is 1,500 lb. What's the problem?",
    choices: [
      { label: "A", text: "Nothing — 2,200 lb is under 2,500 lb static, rack is fine" },
      { label: "B", text: "**The rack is over its dynamic load capacity while rolling.** Static capacity (2,500 lb) assumes the rack is bolted into position; dynamic capacity (1,500 lb) governs when it's rolling on casters. At 2,200 lb in motion you risk caster failure or frame flex. Separately, the rolling load concentrated on a small footprint may momentarily exceed floor-tile ratings along the path. Unload to under dynamic capacity, move, then reload in position" },
      { label: "C", text: "The floor is too strong — PSF is backward" },
      { label: "D", text: "Rolling weight is always safer than static weight" },
    ],
    correctAnswer: "B",
    explanation:
      "Static and dynamic are two different numbers for two different situations. Exceeding dynamic rating is how casters fail under load. Unload before moving — every time, even if it's inconvenient.",
  },
  {
    id: "scl-m02-q04",
    question:
      "You audit a freshly-built rack. Every server's PSUs report healthy. PDU-A reads 19 A; PDU-B reads 6 A. What is almost certainly the problem?",
    choices: [
      { label: "A", text: "Normal variance — PDU readings often differ" },
      { label: "B", text: "**Silent misplugs.** Multiple servers have both PSU cords plugged into PDU-A, leaving PDU-B under-loaded. Each PSU individually reports OK because it has input power — nothing in the PSU self-check knows *which PDU* it's plugged into. Redundancy is a property of the pair, not the individual PSU. Fix: walk each server and verify one red cord (A) and one blue cord (B). Color-coded cords exist exactly to make this audit fast" },
      { label: "C", text: "PDU-B is broken" },
      { label: "D", text: "The IPMI would alarm if this were real" },
    ],
    correctAnswer: "B",
    explanation:
      "Lopsided draw between A and B is the classic misplug signature. Walk every server physically; laminated A/B cord tags and color-coded cords make misplugs visible before they become outages.",
  },
  {
    id: "scl-m02-q05",
    question:
      "A customer reports \"CPU is pegged but throughput has collapsed\" on an AI training rack. What's the most likely explanation and the first thing you check?",
    choices: [
      { label: "A", text: "Software regression — roll back the last deploy" },
      { label: "B", text: "**Thermal throttling from airflow impedance.** CPUs/GPUs drop clock speed when temperatures exceed thresholds; the OS sees CPUs \"busy\" at 100% while throughput falls silently — there's no obvious alarm. First checks: inlet/outlet temperatures, fan RPMs, and **the back of the rack for obstructed cabling or missing blanking panels**. The root cause is usually cabling done months ago — clean cabling is cooling" },
      { label: "C", text: "The CRAH unit failed; call facilities" },
      { label: "D", text: "The training job has a bug" },
    ],
    correctAnswer: "B",
    explanation:
      "\"CPU busy, throughput low\" is the signature of thermal throttling. The kill path is invisible from the OS — no panicked logs, no obvious alarm, just slower jobs. The fix is almost always in the cable management behind the rack, not in the cooling plant.",
  },
  {
    id: "scl-m02-q06",
    question:
      "The NOC pages: \"**14 racks in row 4 are dark**. Rows 3 and 5 are healthy. Utility and main switchgear are reported normal.\" Where do you look first?",
    choices: [
      { label: "A", text: "Assume the servers crashed; start power-cycling them" },
      { label: "B", text: "Scope is **row-level** — one row dark with neighbors healthy and upstream healthy points at **row-level infrastructure**. First check: the floor PDU or row-main breaker feeding row 4 specifically, for tripped mains and alarms. Call facilities. Don't power-cycle servers — they aren't broken, their feed is. Don't reset tripped breakers without understanding why they tripped" },
      { label: "C", text: "The issue must be at the utility level" },
      { label: "D", text: "Restart every ToR switch in the row" },
    ],
    correctAnswer: "B",
    explanation:
      "Scope tells you tier. Row-level scope with neighbors fine = row-level infrastructure. The hierarchy (rack → row → pod → hall) is exactly how you turn a \"14 racks dark\" page into a short suspect list in seconds.",
  },
  {
    id: "scl-m02-q07",
    question:
      "Why are missing **blanking panels** a common finding on hot-aisle walkthroughs?",
    choices: [
      { label: "A", text: "They're cosmetic and don't affect operations" },
      { label: "B", text: "Missing blanking panels let **hot-aisle exhaust air recirculate through the empty U-slots back into the cold aisle**, mixing hot and cold and defeating aisle containment. The rack leaks its own exhaust into its own intake. Cheap to install, large thermal impact, easy to miss on a rushed install. A proper rack has blanking panels filling every unused U-slot" },
      { label: "C", text: "They reduce cooling by blocking airflow" },
      { label: "D", text: "They're only needed in Tier IV facilities" },
    ],
    correctAnswer: "B",
    explanation:
      "Blanking panels are a high-leverage small thing — a few dollars each, huge thermal consequences if missing. \"Empty U-slot without a blanking panel\" is equivalent to \"air leak in the containment.\" Walkthrough checklists always include them.",
  },
  {
    id: "scl-m02-q08",
    question:
      "A facilities engineer wants to replace all four PDUs in row 12 during business hours. \"Tier III facility — concurrently maintainable — it's safe.\" Before agreeing, what's the most important question?",
    choices: [
      { label: "A", text: "Can we do it during lunch hour to be extra safe?" },
      { label: "B", text: "**\"Are we replacing all four at once, or one at a time, and have we audited the rack cords for misplugs first?\"** Concurrent maintainability means *one path* can be offline without impact — not *both sides simultaneously*. Replacing all four at once drops the whole row. Tier III protects the facility only; misplugs in the racks defeat everything regardless of tier. Audit, stagger, and plan a rollback before you start" },
      { label: "C", text: "\"What time does the vendor arrive?\"" },
      { label: "D", text: "\"Can we do it without a MOP?\"" },
    ],
    correctAnswer: "B",
    explanation:
      "Tier III gives you the ability to do concurrent maintenance; it doesn't give you license to do both sides at once or to skip audits of the physical installation. \"Safe\" is a property of the specific plan, not a property of the tier.",
  },
];
