import type { MCQuestion } from "@/lib/types/campaign";

// fib-m04 "Inspection & Troubleshooting" — covers fib-s7 (Inspect Before You Connect) + fib-s8 (Power, Budget & Diagnosis)

export const FIB_M04_QUESTIONS: MCQuestion[] = [
  {
    id: "fib-m04-q01",
    question:
      "What percentage of fiber link issues are attributed to contamination, and why is that number operationally important?",
    choices: [
      { label: "A", text: "Less than 10% — contamination is rare in climate-controlled DCs" },
      { label: "B", text: "**70–85%.** That number dictates diagnostic priority: inspect and clean BEFORE anything else. A tech who arrives at a broken-link ticket with a scope, a click cleaner, and the discipline to inspect first fixes most problems in under five minutes without touching the switch config or the cables themselves. Skipping the inspect-clean step guarantees you'll waste 30+ minutes chasing phantom optic or cable faults on a problem that was always contamination" },
      { label: "C", text: "About 20% — usually the optics are at fault" },
      { label: "D", text: "Over 95% — almost every fiber issue is dirty" },
    ],
    correctAnswer: "B",
    explanation:
      "The 70–85% figure is the industry consensus and drives the universal 'inspect before you connect' rule. It's not trivia; it's the single most useful probability in fiber work and should reorder your troubleshooting instincts.",
  },
  {
    id: "fib-m04-q02",
    question:
      "What's the single most important fiber-handling rule, and why does skipping it make things worse, not just neutral?",
    choices: [
      { label: "A", text: "Always reboot the switch first" },
      { label: "B", text: "**Inspect before you connect.** Every time. 10 seconds with a scope. Skipping it doesn't just risk a problem — it guarantees contamination, because if the connector is dirty, the act of plugging it in deposits debris onto the mating surface inside the optic. Now you have TWO dirty end faces to clean, and cleaning the inside of a plugged-in optic is much harder than cleaning the connector you were about to use. The rule saves work, not just time" },
      { label: "C", text: "Always wear gloves" },
      { label: "D", text: "Never touch a connector in a running DC" },
    ],
    correctAnswer: "B",
    explanation:
      "The inspect-before-connect rule is the highest-ROI single habit in fiber work. The negative consequence of skipping it is asymmetric: best case you got lucky; worst case you doubled your cleaning work and contaminated a port that's now harder to reach.",
  },
  {
    id: "fib-m04-q03",
    question:
      "A 10G-SR link reports **RX power of -13 dBm**, and the optic's minimum RX sensitivity is -11.1 dBm. Is the link healthy, and what's the right next action?",
    choices: [
      { label: "A", text: "Healthy — -13 dBm is well above zero" },
      { label: "B", text: "**Unhealthy — RX is ~2 dB below the minimum sensitivity threshold.** The receiver cannot reliably decode the signal at that power; the link will flap or fail. First action: **inspect and clean both end faces.** Contamination typically causes multi-dB losses, and cleaning often buys back enough margin to fix the problem. If clean doesn't help, check for bent/pinched fiber along the run, then swap the optic" },
      { label: "C", text: "Borderline — no action needed" },
      { label: "D", text: "The TX side must be dead" },
    ],
    correctAnswer: "B",
    explanation:
      "Receiver sensitivity is a hard cliff. Below -11.1 dBm the 10G-SR optic cannot lock the signal reliably. Cleaning connectors is always the first action — it's cheap, fast, and fixes most marginal-link problems. Don't escalate before cleaning.",
  },
  {
    id: "fib-m04-q04",
    question:
      "A colleague justifies using their shirt to 'quick-wipe' a fiber connector because 'the scope showed just a little dust.' Why is that worse than leaving the dust there?",
    choices: [
      { label: "A", text: "It's actually fine if the shirt is clean" },
      { label: "B", text: "**Three distinct contaminants get deposited.** (1) Textile fibers/lint — thread-sized particles, far larger than the 9 μm core, block signal directly. (2) Skin oils — sticky, attract more dust over time, and don't dry-clean off. (3) Abrasive particles (detergent, fabric sizing) that can scratch the ferrule permanently. The original loose dust was click-cleanable; after a shirt-wipe you need wet-dry or reterminate. Shirt wipe converted a 30-second fix into a 10-minute wet-clean, or worse, a discard" },
      { label: "C", text: "Shirt-wipes release static electricity" },
      { label: "D", text: "Only alcohol wipes should be used" },
    ],
    correctAnswer: "B",
    explanation:
      "The shirt-wipe temptation is a classic way to turn a simple problem into a hard one. Shirts deposit lint, oils, and micro-abrasives that make the original contamination worse. Always use a real click cleaner; never improvise with clothing, paper towels, or compressed air.",
  },
  {
    id: "fib-m04-q05",
    question:
      "Which tool is best suited for verifying MPO trunk polarity without needing a switch?",
    choices: [
      { label: "A", text: "OPM (Optical Power Meter)" },
      { label: "B", text: "**VFL (Visual Fault Locator).** A pocket red laser at 650 nm (visible light). Shine into fiber 1 at one end; watch which fiber glows at the far end. Instant polarity diagnosis — Type A sends fiber 1 → fiber 1, Type B sends fiber 1 → fiber 12, etc. An OPM measures power but not which fiber; an OTDR is expensive overkill; a multimeter is electrical, not optical. VFL is cheap, fast, and exactly right for this" },
      { label: "C", text: "OTDR" },
      { label: "D", text: "Multimeter" },
    ],
    correctAnswer: "B",
    explanation:
      "Polarity is a wiring-diagram problem, not a power problem. A VFL makes the wiring visible. Every fiber toolkit should include one — they're inexpensive and cover polarity checks, short-run fiber tracing, and break-finding.",
  },
  {
    id: "fib-m04-q06",
    question:
      "After three cleaning attempts on a connector, the fiberscope still flags contamination on or near the core. What's the correct next step?",
    choices: [
      { label: "A", text: "Keep cleaning — it has to come off eventually" },
      { label: "B", text: "**Stop cleaning. The connector is damaged.** A scratch, a pit, or an embedded contaminant the click cleaner can't shift. Cleaning beyond three attempts starts damaging the ferrule in its own right. Discard the patch cord or have the fiber reterminated. Budgeting for periodic patch-cord replacement is normal DC hygiene — a patch cord is cheaper than an hour of chasing a problem that can't be cleaned out" },
      { label: "C", text: "Use compressed air this time" },
      { label: "D", text: "Switch to a paper towel" },
    ],
    correctAnswer: "B",
    explanation:
      "Three attempts is the industry rule of thumb. If the scope still flags the connector, the glass or ferrule is physically damaged; more cleaning won't help and starts causing damage itself. Replace the patch cord.",
  },
  {
    id: "fib-m04-q07",
    question:
      "A tech is asked: 'Before you even open your scope, know your budget.' Why does that framing change the order of what you check on a marginal link?",
    choices: [
      { label: "A", text: "Budget only matters for finance teams" },
      { label: "B", text: "**Knowing the budget makes every DDM reading a diagnostic number, not a raw value.** On a 7 dB-budget link running at 6 dB loss, you're 1 dB from disaster — priorities shift to buying back easy dB. That reorders actions: clean connectors first (0.5–1 dB each), check every mated pair along the run (each ~0.5 dB, dirt/misalignment can triple), then check for physical abuse (bends, tight zip-ties). Optic swap or OTDR comes after, because those are expensive and usually unnecessary. Without the budget in your head, you guess; with it, you run a prioritized sequence" },
      { label: "C", text: "Budget only applies to single-mode fiber" },
      { label: "D", text: "Budget is irrelevant at short distances" },
    ],
    correctAnswer: "B",
    explanation:
      "The budget reframes every measurement. 'RX is -9 dBm' becomes 'we have 1.6 dB of headroom, so any single contamination event tips it over.' That specificity drives prioritized action. Techs who don't track budget end up over-swapping optics and over-calling OTDRs.",
  },
  {
    id: "fib-m04-q08",
    question:
      "For which scenario would you reach for an OTDR rather than a VFL or OPM?",
    choices: [
      { label: "A", text: "Quickly confirming MPO polarity" },
      { label: "B", text: "**Locating a fiber break in a long run (hundreds of meters to kilometers), quantifying connector and splice losses at exact distances, or characterizing degradation along a fiber.** OTDR (Optical Time-Domain Reflectometer) builds a distance-vs-loss graph by sending pulses and measuring reflections. Use it when VFL has failed to localize, the run is too long for visual inspection, or you need evidence-grade loss data for commissioning. Expensive and requires training — usually a senior tech or installer tool, not daily Tier 1" },
      { label: "C", text: "Cleaning a dirty connector" },
      { label: "D", text: "Checking if an optic is powered on" },
    ],
    correctAnswer: "B",
    explanation:
      "OTDR is the specialized tool for questions VFL and OPM can't answer: 'where exactly is the break?' 'how much loss does each connector along this 800 m trunk contribute?' It's overkill for short-run or polarity problems. Tier 1 techs should know when to ask for one, not own and use one routinely.",
  },
];
