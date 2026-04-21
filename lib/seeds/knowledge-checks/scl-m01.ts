import type { MCQuestion } from "@/lib/types/campaign";

// scl-m01 "Infrastructure Vocabulary" — covers scl-s1 (Server/Host/Node/Box & form factors) + scl-s2 (Power & Connectivity Language)

export const SCL_M01_QUESTIONS: MCQuestion[] = [
  {
    id: "scl-m01-q01",
    question:
      "A ticket reads: \"Reseat the blade in chassis 7, slot 4.\" Which of the following is the correct interpretation?",
    choices: [
      { label: "A", text: "There is a standalone rack-mount server named \"chassis 7\" that you should reboot from its slot 4" },
      { label: "B", text: "A **blade server** (a stripped-down server with no individual PSUs or fans of its own) is in slot 4 of a shared **chassis** (the enclosure, numbered 7) that provides shared power, cooling, and often network fabric to every blade inside it. You should physically remove and reseat that blade — nothing to do with a rack-mount server" },
      { label: "C", text: "\"Chassis 7, slot 4\" means rack 7, row 4" },
      { label: "D", text: "Any server in rack 7 that boots first" },
    ],
    correctAnswer: "B",
    explanation:
      "Blade, chassis, and slot are not interchangeable with rack, row, and server. A blade is a form factor that only exists inside a chassis; the chassis provides power and cooling the blade lacks. Ticket precision here prevents touching the wrong device.",
  },
  {
    id: "scl-m01-q02",
    question:
      "One physical machine is referenced by your cluster manager as a **node**, by your asset system as a **server**, and by your sysadmin as the **host** they want you to SSH into. What's the disciplined way to handle this?",
    choices: [
      { label: "A", text: "Normalize everyone onto one term so your tickets stay consistent" },
      { label: "B", text: "Answer each person **in their vocabulary**, recognize that all three are the same physical machine, and match each action to the system of record that owns that framing. \"Server\" is the asset-system framing; \"host\" is the OS framing; \"node\" is the cluster-role framing. Translating silently between them is a core DC-ops skill" },
      { label: "C", text: "Insist that \"box\" is the only correct term" },
      { label: "D", text: "Refuse to proceed until the systems are merged" },
    ],
    correctAnswer: "B",
    explanation:
      "Same metal, three hats. The words describe different *views* of the same machine — asset, OS, cluster — not different machines. Matching your language to the system-of-record of each request is what keeps downstream automation, search, and audits coherent.",
  },
  {
    id: "scl-m01-q03",
    question:
      "A proposal says: \"We'll save a lot of cabling if we move from rack-mount servers to a blade-chassis design.\" What is the most important tradeoff to surface?",
    choices: [
      { label: "A", text: "Blades are always slower than rack servers" },
      { label: "B", text: "Blades concentrate the **failure blast radius**. A chassis PSU, fabric interconnect, or management-module failure takes down **every blade inside** — often 8 to 16 servers at once. Rack-mount servers fail one at a time. The cabling reduction is real, but so is the blast-radius concentration; hyperscale frequently avoids blades in compute for exactly this reason" },
      { label: "C", text: "Blades cannot be serviced" },
      { label: "D", text: "Blades always require liquid cooling" },
    ],
    correctAnswer: "B",
    explanation:
      "The blade tradeoff is always density and cabling vs blast radius and vendor lock-in. Knowing what's concentrated on a shared chassis is the core judgment call before committing to blades at scale.",
  },
  {
    id: "scl-m01-q04",
    question:
      "A new tech mixes up \"PSU\" and \"PDU\" in a ticket that says \"pull the PDU on r17-03\" when they meant \"pull the PSU in r17-03's top server.\" What's the actual consequence if someone executes the ticket literally?",
    choices: [
      { label: "A", text: "Nothing — the two words are interchangeable" },
      { label: "B", text: "**Pulling the PDU takes the entire rack's A-side (or B-side) power down** — every server in the rack drops on that feed, and any single-fed or misplugged server goes dark. Pulling a PSU affects one supply on one server and (if dual-corded) is a non-event. The two acronyms are three letters apart and a whole rack apart in blast radius. Ticket precision is not optional" },
      { label: "C", text: "Only the top server is affected" },
      { label: "D", text: "The rack is unaffected because PDUs are passive" },
    ],
    correctAnswer: "B",
    explanation:
      "This is the classic day-one vocabulary error. \"PSU\" is server-internal; \"PDU\" is rack-wide. Tickets that don't distinguish create catastrophic blast-radius confusion, which is why every DC drills the distinction early and often.",
  },
  {
    id: "scl-m01-q05",
    question:
      "What is a **whip** in DC terminology?",
    choices: [
      { label: "A", text: "A coiled fiber patch cord used between ToR and spine" },
      { label: "B", text: "A **flexible power cable** that drops from an overhead busbar (or tap box, or RPP) down into a rack, terminating in the upstream connector of a PDU. \"Whip\" always means the power drop cable — never a data cable. The electrician installs it when a rack is provisioned for power" },
      { label: "C", text: "An informal term for a ToR switch" },
      { label: "D", text: "A high-amperage breaker in the main switchgear" },
    ],
    correctAnswer: "B",
    explanation:
      "Whip is power, every time. A ticket that says \"the whip on r24-03 is sparking\" is telling you this is a power-safety event (de-energize upstream, cap the end, call an electrician), not a data-cable issue.",
  },
  {
    id: "scl-m01-q06",
    question:
      "Your rack has a **ToR switch**. A new architect proposes mounting it in the middle of the rack for better cable runs. A peer objects: \"It can't be a ToR if it's not at the top.\" Who's right?",
    choices: [
      { label: "A", text: "The peer — ToR means Top of Rack, literally" },
      { label: "B", text: "The architect. **\"ToR\" describes the role** — the rack-aggregation switch that every server in that rack connects to and that uplinks to spine switches — not the physical position. Many modern builds put the switch in the middle of the rack for better cable runs to servers above and below. The name is historical; the function is what matters" },
      { label: "C", text: "Neither — the switch should go at the bottom" },
      { label: "D", text: "ToR switches can't handle mid-rack mounting" },
    ],
    correctAnswer: "B",
    explanation:
      "ToR is role, not position. It's the switch that aggregates a rack and uplinks to the spine. \"Top of rack\" was the typical placement when the term emerged; today the term persists even when the switch is mounted mid-rack for cabling reasons.",
  },
  {
    id: "scl-m01-q07",
    question:
      "For a server-to-ToR link of about 2 meters at 25 Gbps, which option is the most practical choice and why?",
    choices: [
      { label: "A", text: "Single-mode fiber with long-reach optics" },
      { label: "B", text: "**DAC (Direct Attach Copper)**. It's a short copper cable with integrated transceivers on both ends — cheaper than fiber + optics, lower latency, and purpose-built for server-to-ToR runs under ~7 meters at 10/25/40/100 Gbps. Use fiber + optics only when distance, speed, or physical constraints rule out DAC" },
      { label: "C", text: "Cat6 Ethernet with RJ-45 connectors" },
      { label: "D", text: "Coaxial cable" },
    ],
    correctAnswer: "B",
    explanation:
      "DAC is the default for short intra-rack links at modern speeds. It avoids the cost of two separate optics, is more power-efficient, and has lower latency — all things that matter when a rack has dozens of uplinks.",
  },
  {
    id: "scl-m01-q08",
    question:
      "Walk the power chain in order from utility to server. Which ordering is correct?",
    choices: [
      { label: "A", text: "Utility → UPS → Generator → ATS → PDU → PSU" },
      { label: "B", text: "Utility → Switchgear → ATS → UPS → RPP / Busbar / Whip → PDU → PSU. Utility enters at the switchgear; the ATS decides utility vs generator; the UPS bridges the 10–30s gap during switchover; the RPP (or busbar with whips) distributes to racks; the PDU distributes inside the rack; the PSU converts AC to DC inside each server" },
      { label: "C", text: "Utility → PDU → PSU → UPS → Generator" },
      { label: "D", text: "Switchgear → PSU → PDU → UPS → Utility" },
    ],
    correctAnswer: "B",
    explanation:
      "The chain matters because every stage has distinct failure modes and distinct blast radii. Knowing which one is which is how you read facilities diagrams and triage outages by scope.",
  },
  {
    id: "scl-m01-q09",
    question:
      "\"The spine switch for pod 3 had a line-card fault.\" What does that tell you about the affected topology?",
    choices: [
      { label: "A", text: "Only one server is affected" },
      { label: "B", text: "In a spine-and-leaf topology, spines interconnect all the leaves (ToRs). A line-card fault on a spine **affects many-to-many connectivity paths for the pod** — typically one of multiple spines, so traffic re-routes through the surviving spines, but available bandwidth drops. If the topology has only two spines, the impact is much larger. Scope: pod-level, not rack-level" },
      { label: "C", text: "The whole datacenter is offline" },
      { label: "D", text: "It affects only the ToR directly cabled to that line card" },
    ],
    correctAnswer: "B",
    explanation:
      "Spine failures affect pod-scale east-west traffic. Every leaf connects to every spine, so losing one spine degrades bisection bandwidth — usually not an outage if there are multiple spines, but always a capacity event.",
  },
  {
    id: "scl-m01-q10",
    question:
      "Why do new techs frequently confuse **PSU**, **PDU**, and **RPP**, and what's the quick way to keep them straight?",
    choices: [
      { label: "A", text: "They're all the same device, just at different sizes" },
      { label: "B", text: "The acronyms rhyme and all relate to power, but they live in three different layers. **PSU** = inside a server (AC → DC conversion). **PDU** = inside a rack (distributes outlets to servers). **RPP** = on the DC floor (takes a big feed and breaks it into many rack-level circuits). Quick mnemonic: PSU lives *in the server*, PDU lives *in the rack*, RPP lives *on the floor*. Match the acronym to the physical location and you'll never mix them up" },
      { label: "C", text: "Only engineers need to know the difference" },
      { label: "D", text: "They're regional terms" },
    ],
    correctAnswer: "B",
    explanation:
      "Location is the simplest disambiguator: server, rack, floor. The three acronyms cover three distinct electrical stages, and their blast radii are *dramatically* different — pulling one is never equivalent to pulling another.",
  },
];
