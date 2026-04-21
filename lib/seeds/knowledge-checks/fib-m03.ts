import type { MCQuestion } from "@/lib/types/campaign";

// fib-m03 "Cable Management" — covers fib-s5 (Trunks, Patches & Bend Radius) + fib-s6 (Labels, Color, Panels & Breakouts)

export const FIB_M03_QUESTIONS: MCQuestion[] = [
  {
    id: "fib-m03-q01",
    question:
      "A 3 mm duplex LC patch cable is being installed in a rack. What's the minimum static bend radius you should respect?",
    choices: [
      { label: "A", text: "10 mm — fiber is flexible" },
      { label: "B", text: "**30 mm** (about a golf-ball size). Static bend radius is 10× the cable outer diameter; for 3 mm that's 30 mm. Dynamic (during pulling or flexing) is 20× OD = 60 mm. Tighter than these introduces macro-bending loss and can crack the glass internally, creating failures that appear weeks or months later" },
      { label: "C", text: "5 mm — modern BIF handles this" },
      { label: "D", text: "Any radius is fine once installed" },
    ],
    correctAnswer: "B",
    explanation:
      "The 10×OD static / 20×OD dynamic rule is universal for standard fiber. For 3 mm cable: 30 mm static, 60 mm dynamic. Bend-insensitive fiber (BIF) tolerates tighter bends but still has limits — never assume BIF without confirming.",
  },
  {
    id: "fib-m03-q02",
    question:
      "A tech cleans up a rack by tightly zip-tying bundles of patch cables to the vertical manager. Two weeks later, three links develop intermittent CRC errors. What's the most likely cause?",
    choices: [
      { label: "A", text: "The cables aged faster due to the cleanup" },
      { label: "B", text: "**Over-tightened zip-ties caused macro-bending loss.** Compressed fiber jackets squeeze the cladding and create the same effect as tight bends — distributed micro-bending along the bundle, each adding fractional dB of loss. Multiple links crossed their marginal budget and started erroring. The fix: replace zip-ties with Velcro (hook-and-loop) straps and loosen every bundle. Never over-tighten anything on fiber" },
      { label: "C", text: "The optics failed simultaneously" },
      { label: "D", text: "Electrical interference from the zip-ties" },
    ],
    correctAnswer: "B",
    explanation:
      "Over-tightened zip-ties are the single most common cause of post-cleanup link degradation. Compressed jackets create distributed loss that eats budget slowly until marginal links fail. Always use Velcro/hook-and-loop for fiber. A 'neat' rack that errors is a failure.",
  },
  {
    id: "fib-m03-q03",
    question:
      "Why does the DC industry use a trunk-and-patch pattern instead of running direct cables from switch ports to servers?",
    choices: [
      { label: "A", text: "It's just tradition" },
      { label: "B", text: "**Trunks handle permanent infrastructure (installed once, tested, left alone). Patches handle flexibility (short cords between patch panel and active equipment, moved during MACs).** This separation makes moves/adds/changes fast and low-risk, gives troubleshooting a known decoupling point, and lets trunks be test-once-leave-alone. Direct wiring means every change requires re-pulling a full-length cable through shared bundles — slower, riskier, harder to troubleshoot" },
      { label: "C", text: "It's cheaper up front" },
      { label: "D", text: "Required by local building codes" },
    ],
    correctAnswer: "B",
    explanation:
      "The two-layer pattern is about operational tempo. Trunks are stable; patches are flexible. Skipping it feels simpler on day one and becomes painful by month six, when every small change requires disturbing shared bundles.",
  },
  {
    id: "fib-m03-q04",
    question:
      "A patch cord is labeled 'SRV-R12-07:NIC2 → TOR-R12-A:Eth1/7' on one end only. The other end is unlabeled. Why is this bad, and what's the specific risk?",
    choices: [
      { label: "A", text: "It's fine — one label is enough" },
      { label: "B", text: "**Labels belong on both ends, near the connector.** A cable is usually accessed from whichever end is closer, and a tech working the unlabeled end can't safely identify it. The specific risk: during a move/add/change the tech traces by hand, risks tugging adjacent cables, and has a real chance of unplugging the wrong cable — turning a routine change into an outage. Labels on both ends is the minimum discipline" },
      { label: "C", text: "Labels only matter on the server side" },
      { label: "D", text: "Only trunks need labels; patches are disposable" },
    ],
    correctAnswer: "B",
    explanation:
      "Single-ended labeling is an invisible trap. Every cable gets labels on both ends, near the connector. The cost is seconds; the benefit is the difference between a safe change and an outage-causing one.",
  },
  {
    id: "fib-m03-q05",
    question:
      "A new tech plugs a 100G-SR4 breakout cable (QSFP28 → 4× SFP28 LC) into the switch port and the four target servers. After 10 minutes, none of the server NICs show link. The MPO end's DDM telemetry looks normal. What went wrong?",
    choices: [
      { label: "A", text: "The breakout cable is defective" },
      { label: "B", text: "**The switch port is still in single-channel (100G) mode and hasn't been configured for breakout.** By default a QSFP28 port runs as one 100G channel; plugging a breakout cable into it doesn't split anything until the port is explicitly reconfigured (e.g., `interface breakout module X port Y map 4x25G`). The MPO end shows DDM because the optic is live — it's the logical split that's missing. All four legs stay dark until breakout mode is enabled" },
      { label: "C", text: "The SFP28 optics on the servers are dead" },
      { label: "D", text: "Cable is plugged in backwards" },
    ],
    correctAnswer: "B",
    explanation:
      "Breakout-mode misconfiguration is one of the most common 'new build' failures. The physical layer is fine, the optics are fine, the cable is fine — the switch just treats the port as a single 100G channel. Reconfigure the interface for 4×25G and all four legs come up immediately.",
  },
  {
    id: "fib-m03-q06",
    question:
      "A colleague argues that jacket color coding is 'nice to have' but redundant if labels are good. What's the case that color still matters?",
    choices: [
      { label: "A", text: "Color is purely aesthetic" },
      { label: "B", text: "**Color tells you the fiber's physical type at a glance, readable from 6 feet away without flashlight or ladder.** Aqua = OM3/OM4 MM. Yellow = OS2 SM. Lime = OM5. Labels give endpoint info; color gives cable type. Both matter because they communicate different information. Color also catches misplaced cables (a yellow cable in a patch field of aqua stands out) and speeds up procurement (pull the right spare from a drawer by color). Eliminating color is how techs accidentally plug SM patches into MM optics" },
      { label: "C", text: "Color affects signal quality" },
      { label: "D", text: "Labels always fall off, so color is the backup" },
    ],
    correctAnswer: "B",
    explanation:
      "Labels and colors carry different information at different distances and levels of detail. Good cabling discipline uses both. Color is the fast, at-distance indicator of fiber type; labels are the up-close indicator of endpoints. Dropping color is how fiber-type mismatches happen.",
  },
  {
    id: "fib-m03-q07",
    question:
      "What's the right amount of slack to leave on a patch cable behind a rackmount server?",
    choices: [
      { label: "A", text: "None — tight cables look clean" },
      { label: "B", text: "**Enough to pull the server forward 3–6 inches without tension on the connector** (~150 mm, coiled neatly into a figure-8 or small loop in the rear cable manager). Too tight: strain on connectors, no service slack. Too loose: tangled mess, blocked airflow, hard to trace. A small service loop is the industry norm; tight coils violate bend radius and bird's-nests block airflow" },
      { label: "C", text: "As much as possible — more is always better" },
      { label: "D", text: "Exactly 12 inches on every cable" },
    ],
    correctAnswer: "B",
    explanation:
      "The right slack is job-specific: enough to service the equipment without tension. 3–6 inches pull-out is the tested standard. Coil neatly (figure-8 or loose loop) in the rear cable manager. Extremes in either direction cause distinct problems.",
  },
  {
    id: "fib-m03-q08",
    question:
      "You inherit a rack where none of the cables are labeled, but everything is working. Your manager says 'if it works, don't fix it.' Why should you push back?",
    choices: [
      { label: "A", text: "The manager is right — don't touch working systems" },
      { label: "B", text: "**Two operational risks.** (1) The next tech who needs to make any change starts by tracing cables by hand — slow, and increases the odds of tugging the wrong cable and causing an unplanned outage. (2) At 02:00 during a P1, an unlabeled rack is where mistakes happen under pressure; the team unplugs the wrong thing trying to 'isolate' a link and turns one outage into two. Labels aren't aesthetic overhead; they're insurance. Half a day now prevents hours of outages and tempo-related errors for the life of the equipment" },
      { label: "C", text: "Labels are required by SLA" },
      { label: "D", text: "Modern switches can't identify unlabeled cables" },
    ],
    correctAnswer: "B",
    explanation:
      "Unlabeled cables feel fine until someone has to change something — then they become a fragility tax paid forever. A half-day of labeling is one of the highest-ROI investments a new shift can make. Push back with specifics: 'this will shorten our next MAC by hours and reduce outage risk.'",
  },
];
