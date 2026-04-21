import type { ChapterSection } from "@/lib/types/chapter";

// ═══════════════════════════════════════════════════════════════════════════
// Operation Power Grid — Power & Cooling chapters (pwr-s1 .. pwr-s8)
// Each mission (pwr-m01..pwr-m04) pulls from 2 chapter sections.
// Instructional design mirrors Linux Operations (ops) with extra interactive
// beats: why-this-matters intros, collapsible drill-downs, fill-blank
// reinforcement, flip-to-recall cards, and inline MCQ checks.
// ═══════════════════════════════════════════════════════════════════════════

// ── pwr-m01 Power Distribution ─────────────────────────────────────────────

const pwrS1: ChapterSection = {
  id: "pwr-s1",
  topicId: "power-cooling",
  title: "Following the Watt",
  subtitle: "From the substation to the server — the path every electron takes, and where it can fail.",
  icon: "◉",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "A datacenter is, first and foremost, **a building that moves electricity**. Compute, networking, storage — they're all consumers hanging off a power grid you built inside your walls. When a PDU trips at 02:00, or a utility feeder goes down during a storm, *which* upstream device is feeding *which* rack is the difference between a 45-second blip and a six-hour outage. Knowing the path is the whole job.",
    },
    {
      kind: "prose",
      html:
        "Imagine a single watt leaving a coal plant 90 miles away. It rides the utility grid at hundreds of thousands of volts, gets stepped down at a substation, then at a transformer outside your facility, then again inside. It passes through a **main switchgear**, maybe a **generator transfer switch**, then an **UPS**, then a **PDU at the rack**, and finally into the **PSU** of a server where it becomes 12V DC feeding a GPU. Each of those steps is a device that can fail. Each is something you'll hear about when an incident page fires.",
    },
    { kind: "heading", level: 3, text: "The standard chain, in order" },
    {
      kind: "table",
      headers: ["Stage", "What it does", "What fails like"],
      rows: [
        ["**Utility feed**", "Grid power (A feed + B feed from different substations for 2N sites)", "Whole-facility brownout, total outage"],
        ["**Main switchgear**", "High-voltage bus; first breakers; meters; protection relays", "Loud trips, loss of whole halls"],
        ["**ATS / STS**", "Automatic/Static Transfer Switch — fails over between utility and generator or between A/B", "Failed transfer → double outage"],
        ["**Generator**", "Diesel (sometimes natural gas); starts on utility loss", "Fails to start, runs out of fuel, faults"],
        ["**UPS**", "Battery-backed inverter bridging the 10–30 s until gens are up", "Battery EOL, inverter fault, overload"],
        ["**PDU (floor / rack)**", "Steps down & distributes to racks / outlets", "Breaker trips, outlet failures"],
        ["**Server PSU**", "AC → DC conversion in the server", "Fan fails, capacitors pop, one of two redundant"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Key mental model: serial dependencies, parallel paths",
      body:
        "The chain is **serial** — every watt passes through every stage. Any one broken link stops flow. The defense is **parallel paths** — two utility feeds, two UPS strings, two PDUs per rack, two PSUs per server. Redundancy isn't about being cautious; it's the only way to survive the fact that every component has a non-zero failure rate.",
    },
    {
      kind: "collapsible",
      intro:
        "Open each stage to see what actually sits in that rack or room in a modern AI datacenter:",
      items: [
        {
          title: "Main switchgear",
          body:
            "A cabinet (often room-sized) carrying **480V or 13.8 kV** three-phase power from the utility. Contains main breakers, protective relays, metering, and transformer taps. Touched by electricians and facilities engineers, almost never by IT. When it trips, **entire halls** go dark.",
        },
        {
          title: "ATS (Automatic Transfer Switch)",
          body:
            "Sits between the utility and the load. When utility power fails, the ATS commands the generator to start and switches the load over — typically **in 10–30 seconds**. During that gap, the UPS keeps servers alive. When utility returns, ATS switches back.",
        },
        {
          title: "Generator",
          body:
            "Big diesel engines, usually on the roof or in a yard. Tested monthly under real load. Fuel on-site for 24–72 hours depending on tier. The most common real-world power incident: a gen fails to start when it's finally needed.",
        },
        {
          title: "UPS — the 10-second bridge",
          body:
            "Batteries (lead-acid or increasingly Li-ion) plus an inverter. Online/double-conversion UPS means mains power is *always* passing through the inverter, giving zero-switchover protection. The UPS exists for exactly one purpose: cover the gap until the generator picks up.",
        },
        {
          title: "PDUs — at the row and at the rack",
          body:
            "Two tiers. **Floor / row PDUs** are refrigerator-sized cabinets with breakers feeding multiple racks. **Rack PDUs** (aka \"zero-U strips\") run vertically up each rack with 24–42 outlets. Two per rack: one on feed A, one on feed B. Modern rack PDUs are **metered and switched** — remote-visible amperage and outlet-level power control.",
        },
        {
          title: "Server PSU",
          body:
            "Two per server — hot-swappable, 80+ Platinum rated. One plugs into PDU-A, the other into PDU-B. Either can fail or be unplugged without the server blinking. Efficiency matters at fleet scale: 1% PSU efficiency gain on 10,000 servers is a real six-figure annual saving.",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "Fill in the path",
    },
    {
      kind: "fill-blank",
      prompt:
        "During a utility outage, write the order of devices that keeps a running server alive.",
      sentence:
        "The utility drops. The {0} engine starts. During the 10-30 second gap, the {1} bridges from its batteries. Once the engine is stable, the {2} switches the load to generator power. Each rack takes its share through redundant {3}s, and finally each server draws from its redundant {4}s.",
      blanks: [
        { answer: "generator", hint: "diesel ___", alternates: ["gen", "genset"] },
        { answer: "UPS", hint: "battery bridge", alternates: ["ups", "u.p.s"] },
        { answer: "ATS", hint: "3-letter transfer", alternates: ["automatic transfer switch"] },
        { answer: "PDU", hint: "power distribution ___", alternates: ["pdus", "rack pdu"] },
        { answer: "PSU", hint: "server power supply", alternates: ["psus", "power supply", "power supplies"] },
      ],
      reveal:
        "Generator → UPS → ATS → PDU → PSU. The UPS covers the seconds, the generator covers the hours, the ATS is what actually moves the load between them, the PDU is what distributes to the rack, and the PSU is what each server consumes.",
    },
    {
      kind: "flip-cards",
      intro:
        "Two quick recall beats before we move into the rack itself — try each front, flip to check.",
      cards: [
        {
          front: "How long is the UPS designed to carry full load alone?",
          back:
            "Long enough to cover **generator startup — typically 10 to 30 seconds at full rated load**, with a small margin. Not \"hours.\" Runtime is a design trade-off against battery footprint and cost.",
        },
        {
          front: "In a 2N power topology, losing one whole path means…",
          back:
            "**Zero downtime.** The surviving path carries full load alone. This is the only topology AI/GPU datacenters consider — an N+1 DC eats a risky single-path outage when the wrong component fails.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A fresh-on-shift technician is told \"the server in r17-03 lost power but it's still running.\" Which interpretation is most likely correct?",
      choices: [
        { label: "A", text: "The server is impossible to contact — it's definitely off" },
        { label: "B", text: "One of its two PSUs lost its feed (bad cord, tripped breaker on PDU-A, etc.); the other PSU on feed B is carrying the whole server. The machine is running on one redundant supply and needs attention before the second feed also fails" },
        { label: "C", text: "The server is running on residual capacitor charge and will die in seconds" },
        { label: "D", text: "The generator must already be running" },
      ],
      correctAnswer: "B",
      explanation:
        "Dual-PSU servers with A+B feeds are designed to tolerate losing either feed at the PSU level. \"Lost power but still running\" is the exact symptom of single-feed loss — the other PSU is doing the whole job. The urgent move: restore the missing feed *before* anything happens to the good one, because right now the server has zero redundancy.",
    },
    {
      kind: "think-about-it",
      scenario:
        "At 01:47 the NOC sees 14 racks in row 4 go dark simultaneously. Racks in rows 3 and 5 are healthy. Utility power and generators both look normal on the facilities dashboard. What does the pattern tell you, where do you look first, and what's the *don't* move?",
      hint: "Scope tells you which tier of the chain tripped.",
      answer:
        "A whole row dark with neighbors healthy points at **row-level infrastructure** — most likely a floor PDU or main row breaker feeding just that row. Utility/generators are fine because they feed the whole hall. First move: check the floor PDU for that row — look for tripped main breakers, alarms on the PDU display, smell for burnt insulation. A very fast second move: call facilities, because breakers don't trip themselves, and resetting one without understanding why is how you turn a 14-rack outage into a fire. What you *don't* do: power-cycle servers in row 4 trying to recover them. They aren't broken; their feed is.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain why \"N+1\" redundancy is considered insufficient for a modern GPU-heavy AI datacenter, and what 2N actually buys you that N+1 doesn't.",
      answer:
        "N+1 provides *one spare* unit at each tier — enough to tolerate a single failure, but not a whole path failure. If a feeder, switchgear bus, or maintenance window takes a full path down, N+1 loses capacity. **2N** provides two fully independent paths from utility to rack — A feed and B feed, separate breakers, separate UPS systems, separate PDUs. Losing an entire path (planned maintenance, equipment replacement, unplanned failure) costs you zero uptime because the other path carries full load. At AI-DC economics — tens of millions of dollars of GPUs behind every megawatt — tolerating a whole-path outage is worth the capital premium. N+1 is for offices; 2N is for training clusters.",
    },
  ],
};

const pwrS2: ChapterSection = {
  id: "pwr-s2",
  topicId: "power-cooling",
  title: "PDUs, Circuits, and A+B Feeds",
  subtitle: "Amps, breakers, and the single plug mistake that kills redundancy without anyone noticing.",
  icon: "◈",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "A datacenter runs on **the amps you haven't yet used**. Every circuit has a hard ceiling; every rack has a kW budget; every PDU has outlets that are going to get argued over. The specific mistake every new tech makes once — *plugging both PSUs into the same PDU* — silently halves a server's redundancy. The customer never sees it. The outage six weeks later does.",
    },
    { kind: "heading", level: 3, text: "Watts, amps, and why you can't guess" },
    {
      kind: "prose",
      html:
        "You'll live in these three numbers forever: **volts × amps = watts**. A 208V × 30A circuit = 6,240 W nameplate. Subtract the 80% continuous-load derate (NEC) and you're at ~**5 kW usable**. That's *one* 30A rack circuit. A modern 8× H100 box draws **over 10 kW alone** — which is why AI racks run on multiple 50A or even 60A circuits.",
    },
    {
      kind: "table",
      headers: ["Circuit", "Voltage", "Nameplate", "Usable (80%)", "Typical server fit"],
      rows: [
        ["**20A / 120V**", "120V", "2.4 kW", "1.9 kW", "Small 1U, networking gear"],
        ["**30A / 208V**", "208V", "6.2 kW", "5.0 kW", "Traditional rack of 1U/2U servers"],
        ["**30A / 415V 3Φ**", "415V three-phase", "21.6 kW", "17.3 kW", "Dense rack — CPU compute"],
        ["**60A / 415V 3Φ**", "415V three-phase", "43.2 kW", "34.6 kW", "GPU rack, mid-density AI"],
        ["**100A+**", "415V three-phase", "~70 kW+", "~55 kW+", "Liquid-cooled H100/B200 racks"],
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Never run a continuous circuit past 80%",
      body:
        "NEC code (U.S.) caps continuous loads at **80% of nameplate**. A 30A breaker feeding a 30A continuous load will nuisance-trip — and worse, it's a fire risk. Design to 80%, monitor the actual draw, and alert at 75%. That safety margin is also why a 30A circuit \"only\" gets you 5 kW of actual server capacity.",
    },
    { kind: "heading", level: 3, text: "PDU flavors — you will meet all four" },
    {
      kind: "collapsible",
      intro:
        "Click each flavor — the differences don't matter much until the one time you need a specific capability at 02:00:",
      items: [
        {
          title: "Basic (dumb) PDU",
          body:
            "Just a power strip with beefy outlets. No visibility, no control. Cheap. Appropriate for edge / closet deployments and nowhere else in a real DC. If you're managing capacity by \"the circuit hasn't tripped yet,\" you have dumb PDUs.",
        },
        {
          title: "Metered PDU",
          body:
            "Shows **real-time amps** on a small LCD and (if networked) exposes it over SNMP. This is the *minimum* for a modern DC. Without metered PDUs you have no idea what any rack is actually drawing, and capacity planning becomes guessing.",
        },
        {
          title: "Switched PDU",
          body:
            "Metered plus **remote outlet-level control** (on/off). You can reboot a wedged server by power-cycling its outlet from a web UI without driving to the DC. Huge on-call quality-of-life feature.",
        },
        {
          title: "Monitored / intelligent PDU",
          body:
            "Switched plus **per-outlet metering**. You see amps per outlet, not just per strip. Lets you enforce the A/B rule by inspection and catch an outlet drawing way more than expected (failing PSU drawing funny current before it dies).",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "A+B feeds — the specific discipline",
    },
    {
      kind: "prose",
      html:
        "Every production rack has two rack-PDUs: one on feed A, one on feed B. They're fed by **separate circuits from separate floor PDUs from separate UPS systems**. A dual-PSU server plugs **one PSU into each PDU**. Lose feed A entirely — the server runs. Lose feed B entirely — the server runs. Plug both PSUs into PDU-A to clear the cable mess and you just silently demoted the machine to single-feed.",
    },
    {
      kind: "code",
      label: "THE A+B RULE — LOOKS LIKE THIS",
      language: "text",
      code:
        "  RACK 17-03\n  ┌─────────────────────────────────────┐\n  │   PDU-A (red cords)   PDU-B (blue)  │\n  │       │                   │         │\n  │   PSU-1 ← server-01 → PSU-2          │   one in each\n  │   PSU-1 ← server-02 → PSU-2          │\n  │   PSU-1 ← server-03 → PSU-2          │\n  │       │                   │         │\n  │  feed A cab             feed B cab   │\n  │  (UPS-A, ATS-A)       (UPS-B, ATS-B) │\n  └─────────────────────────────────────┘\n\n  NEVER:   PSU-1 ──┐\n                   ├── both into PDU-A\n           PSU-2 ──┘   → server is now single-fed",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "Spot the silent misplug",
      body:
        "Walk a rack: every server should have **one red cord** to the left PDU and **one blue cord** to the right. If you see two reds on one server, that's a misplug — the redundancy indicator LEDs on the server's IPMI won't tell you; both PSUs show \"OK.\" The only clue is the physical audit. Many sites laminate laminated A/B cord tags on every jumper for exactly this reason.",
      },
    {
      kind: "fill-blank",
      prompt: "Compute the rack capacity and the misplug risk:",
      sentence:
        "A rack fed by two 60A 415V three-phase circuits has a nameplate of about {0} kW per side but only about {1} kW usable per side after derate. If a server has two PSUs and both cords end up on PDU-A, losing feed A now takes the server {2}.",
      blanks: [
        { answer: "43", hint: "60 × 415 × √3 / 1000 ≈ ?", alternates: ["43.2", "43.1", "~43", "43kw"] },
        { answer: "35", hint: "× 0.8", alternates: ["34", "34.6", "~35", "35kw"] },
        { answer: "down", hint: "single word", alternates: ["offline", "off", "dark"] },
      ],
      reveal:
        "Each 60A × 415V × √3 circuit nameplate ≈ **43.2 kW**; at the 80% derate about **34.6 kW** is actually usable. If both PSUs of a server share PDU-A, losing feed A drops power to *both* PSUs and the server goes **down** — the A+B topology has been silently defeated.",
    },
    {
      kind: "flip-cards",
      intro: "Two recall cards on common PDU questions:",
      cards: [
        {
          front: "What does a C13/C14 connector plug into, and where does C19/C20 belong?",
          back:
            "**C13/C14** is the standard kettle-plug-style connector rated ~10A — it's what most 1U/2U server PSUs and the outlets on most rack PDUs use. **C19/C20** is chunkier and rated ~16–20A — used on high-draw PSUs (GPU servers, high-density 2U/4U compute) and matching outlets on high-capacity PDUs.",
        },
        {
          front: "Why is color-coding (red for A, blue for B) worth the trouble?",
          back:
            "So misplugs are **visible by inspection**, not discovered during an outage. A room full of black cords looks tidy and hides dozens of single-fed servers. A room with color-coded cords exposes every mistake in seconds.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A new 30A / 208V rack circuit shows 23A draw on the PDU display. The rack has room for one more 2.4 kW 1U server. A peer suggests adding it tonight to finish the cluster. What's the right call?",
      choices: [
        { label: "A", text: "Sure — 23A is under the 30A breaker, plenty of room" },
        { label: "B", text: "Do not add the server. 23A + 11.5A (2.4 kW at 208V) ≈ 34.5A, well above the 24A continuous-load budget (80% of 30A). Either use a new circuit or increase circuit capacity. Landing right at or above 80% is a guaranteed nuisance trip and a safety issue" },
        { label: "C", text: "Add it but turn the server off at peak to keep amps low" },
        { label: "D", text: "It's fine as long as it's temporary" },
      ],
      correctAnswer: "B",
      explanation:
        "Continuous-load budget on a 30A breaker is ~24A (80%). At 23A you're already effectively at the cap — adding a 2.4 kW (≈11.5A) server pushes you well over. The fix is *always* more copper, not creative rationalizations. Modern monitored PDUs will warn at 75%; pay attention when they do.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You're auditing a freshly built rack. Every server has two PSUs blinking healthy. The rack's PDU-A shows 18A; PDU-B shows 6A. What's probably wrong, and how did every PSU pass its self-check?",
      hint: "PSU LEDs show 'OK' as long as each PSU has input power.",
      answer:
        "At least a third of the servers in the rack are **double-plugged into PDU-A** — the lopsided draw (18A vs 6A on what should be near-symmetric loads) is the tell. Each PSU is individually fine: it has power, it's converting, its LED is green. The redundancy is the property of *the pair*, not the individual PSUs, and nothing in the PSU self-check validates which PDU it's plugged into. The fix is a physical walk of every server's power cords, re-dressing any misplugs so every box has one red and one blue. Without the audit these servers all look healthy — until feed A takes a maintenance hit and half the rack goes dark.",
    },
    {
      kind: "knowledge-check",
      question:
        "A rack is rated for 17 kW (two 30A 415V three-phase feeds, derated). The team wants to install three 8× H100 GPU servers, each drawing ~10.2 kW at load. What goes wrong, and what's the disciplined plan instead of cramming them in?",
      answer:
        "Three H100 servers × 10.2 kW = **30.6 kW** — almost double the rack's usable 17 kW. At best, breakers trip as soon as training workloads ramp. At worst, you've created a fire risk. The disciplined plan is to recognize that **traditional 30A-class racks cannot hold modern GPU boxes** — the rack needs either higher-amperage circuits (60A or 100A three-phase), a whole-row power redesign, or fewer servers per rack. Modern AI-DC rack builds anticipate **40–60+ kW per rack** for exactly this reason; retrofitting an old rack with GPU loads without power work is the classic mistake. Capacity planning is always answered in kW and amps first, then in U-space.",
    },
  ],
};

// ── pwr-m02 UPS & Backup Power ─────────────────────────────────────────────

const pwrS3: ChapterSection = {
  id: "pwr-s3",
  topicId: "power-cooling",
  title: "UPS — The 10-Second Bridge",
  subtitle: "Batteries, inverters, and the single purpose every UPS actually has.",
  icon: "◐",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "People outside the industry think **UPS = backup power for hours**. That's a desk-under-your-feet consumer UPS. In a datacenter, the UPS has **one job**: carry the full load through the **10 to 30 second window** between utility loss and the generator coming up to speed. Understand that and every sizing decision, battery-chemistry choice, and maintenance cadence falls into place.",
    },
    { kind: "heading", level: 3, text: "Three UPS topologies — you only want one" },
    {
      kind: "table",
      headers: ["Topology", "How it works", "Switchover", "DC verdict"],
      rows: [
        ["**Standby (offline)**", "Mains goes direct to load; UPS kicks in only when mains fails", "5–15 ms", "No — switchover is too slow; residential only"],
        ["**Line-interactive**", "Mains + voltage regulator; UPS inverts on failure", "2–4 ms", "No — still has a transfer; small offices only"],
        ["**Online (double-conversion)**", "Mains is *always* converted AC → DC → AC through the inverter", "**0 ms — continuous**", "**Yes — DC standard**. No switchover; perfect sine; isolates load from mains noise"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Why \"zero switchover\" matters",
      body:
        "In online/double-conversion, the load is **always** running on inverter power, with the batteries sitting in parallel. Utility loss simply means the inverter's input switches from mains rectifier to battery bus. The load sees *nothing*. A standby UPS, by contrast, has a ~10ms gap when utility drops — fine for a desktop PC but enough to crash clustered training jobs with microsecond-sensitive RDMA fabrics.",
    },
    {
      kind: "collapsible",
      intro: "Inside a modern DC UPS — the pieces that can fail or surprise you:",
      items: [
        {
          title: "Rectifier (AC → DC)",
          body:
            "Takes incoming mains AC and produces a DC bus. Modern IGBT-based rectifiers give high efficiency and low harmonic injection. Failure here takes the UPS to bypass mode (running direct from utility) if the bypass is online.",
        },
        {
          title: "DC bus + battery string",
          body:
            "Batteries float in parallel with the DC bus. During normal operation, the rectifier keeps them topped; during a mains event, they provide DC until exhausted or until utility/generator comes back.",
        },
        {
          title: "Inverter (DC → AC)",
          body:
            "Produces the clean, regulated AC that the load actually consumes. The inverter is *always* running in online topology. It regulates voltage and frequency independent of what utility is doing.",
        },
        {
          title: "Bypass",
          body:
            "A mechanical + static transfer that can route mains *around* the UPS directly to the load — used when the UPS itself needs maintenance, or if the UPS faults. A maintenance bypass lets you take the whole UPS offline without dropping the load.",
        },
        {
          title: "Static Transfer Switch (STS)",
          body:
            "Not the UPS itself, but often paired: switches load between two independent sources (e.g., UPS-A output and UPS-B output) **within a few milliseconds**, no interruption. Critical for single-corded devices that still need dual-path redundancy.",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "Battery chemistry — VRLA vs Li-ion",
    },
    {
      kind: "table",
      headers: ["", "VRLA (lead-acid)", "Li-ion (LFP / NMC)"],
      rows: [
        ["Lifetime", "3–5 years typical; capacity fades with cycles + heat", "**8–15 years**; tolerates heat and cycles much better"],
        ["Footprint", "Large — lots of cabinets per MW of load", "**~1/3 the space**; much higher energy density"],
        ["Upfront cost", "Lower $/kWh", "Higher $/kWh but **lower TCO over 10 years**"],
        ["Monitoring", "Per-string voltage + impedance testing periodically", "Integrated BMS reports per-cell health continuously"],
        ["Failure mode", "Gradual capacity loss; swell/leak with heat", "Rare thermal runaway — managed by BMS; fire containment design matters"],
      ],
    },
    {
      kind: "prose",
      html:
        "New builds today are overwhelmingly **Li-ion (usually LFP chemistry)** for the TCO, footprint, and monitoring story. Existing DCs have VRLA they're rotating out as it ages. Either way, the **BMS / battery monitoring** is non-negotiable — silent string failure is how a UPS with nominally fine batteries fails to carry the load when it finally matters.",
    },
    {
      kind: "heading",
      level: 3,
      text: "Runtime math — sized for seconds, not hours",
    },
    {
      kind: "prose",
      html:
        "A DC-grade UPS is usually spec'd at **5 to 15 minutes** of runtime at full rated load — far longer than the 10–30s generator startup target, giving a healthy margin for a generator that's slow to start. Beyond that, batteries get exponentially more expensive per minute. The model is: **UPS covers the gap; generator covers the hours**.",
    },
    {
      kind: "fill-blank",
      prompt: "Pull together the sizing and purpose:",
      sentence:
        "An online double-conversion UPS is sized to carry the load for about {0} minutes at full draw, with the goal of bridging until the {1} stabilizes. Switchover time for an online UPS is effectively {2} milliseconds — the load is always running on the inverter.",
      blanks: [
        { answer: "5-15", hint: "range", alternates: ["5 to 15", "5–15", "10", "ten"] },
        { answer: "generator", hint: "diesel ___", alternates: ["gen", "genset"] },
        { answer: "0", hint: "a single digit", alternates: ["zero"] },
      ],
      reveal:
        "Runtime: about **5–15 minutes** at full load — enough headroom for the **generator** to come up and pick up the load, even if it stumbles on the first attempt. Switchover time is **0 ms** (effectively) in an online topology because the inverter is always active and the battery simply becomes the DC source when utility drops.",
    },
    {
      kind: "flip-cards",
      intro: "Two high-leverage recalls on UPS health:",
      cards: [
        {
          front: "What's a 'UPS self-test' and why is it both useful and risky?",
          back:
            "A self-test briefly transfers the load to battery to verify the batteries, inverter, and transfer mechanism work. **Useful:** catches failing batteries before a real event. **Risky:** if batteries are worse than expected, the test itself can cause an outage. Good teams run self-tests during announced low-risk windows, not blindly.",
        },
        {
          front: "Why does a UPS 'bypass' mode exist, and what does it mean for redundancy?",
          back:
            "Bypass routes mains *directly to the load* so the UPS itself can be serviced. **While in bypass, you have no UPS protection** — a utility event during bypass immediately drops the load. Treat bypass as a planned, time-bounded operation — never a steady state.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A facilities engineer says \"our UPS is rated for 30 minutes at full load.\" Your DC has a generator designed to start in 15 seconds. What's the first question you should ask?",
      choices: [
        { label: "A", text: "Can we save money by cutting runtime to 10 minutes?" },
        { label: "B", text: "When did we last verify the actual runtime under full load, and has the battery capacity been tested against spec recently? A '30-minute' UPS with 3-year-old VRLA batteries may actually deliver 8 minutes when you need it. Plate rating and real-world capacity diverge" },
        { label: "C", text: "Should we bypass the UPS during storms?" },
        { label: "D", text: "Can we turn off the generator since the UPS can handle it?" },
      ],
      correctAnswer: "B",
      explanation:
        "Nameplate runtime is a fresh-battery-at-nominal-temp figure. Real runtime degrades with battery age, temperature, and cycles. The disciplined question is *when did we last measure* — via self-test, load-bank test, or battery impedance testing. A UPS that hasn't been load-tested in 18 months is running on faith, not math. Plans that depend on 30 minutes of runtime need evidence, not the spec sheet.",
    },
    {
      kind: "think-about-it",
      scenario:
        "At 14:20 the utility blinks briefly — out for about 4 seconds. Your UPS alarms light up momentarily. The load didn't see the event. You check the generator — it didn't start. Everyone breathes. What should you *actually* be asking yourself right now?",
      hint: "The UPS did its job. But did it mask something you need to know about?",
      answer:
        "Two things. First: **did the battery actually discharge, and by how much?** A 4-second utility drop means the UPS was briefly on battery. The BMS/monitoring should show a dip in state-of-charge and a short discharge event in the log. Confirm batteries recharged back to full within spec. Second, and more important: **why didn't the generator attempt to start?** Most ATS logic starts the generator after a short qualifying delay (often 2–5 seconds) on any utility fault — a 4-second event should have triggered at least a start attempt. If the gen didn't roll, the ATS start signal may be miswired, the gen may be in a test-inhibited state, or a battery/air-start failure is hiding. A successful utility blip that the UPS covered but the generator ignored is a free warning — run the diagnostic now, because the next utility event might last 40 minutes.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain why a consumer-grade 'standby' UPS is unsuitable for a modern AI training cluster — even if it had unlimited runtime. Be specific about what breaks.",
      answer:
        "Two related reasons. First, the **switchover time** — a standby UPS takes ~10 ms to transfer from mains-pass-through to battery-inverted output. RDMA-based training fabrics (RoCE, InfiniBand) and clustered storage protocols are intolerant of multi-millisecond interruptions; jobs abort, storage clusters enter recovery, and you blow compute hours. Online/double-conversion UPSes run the inverter continuously so the load sees zero transfer. Second, **power quality** — standby UPSes pass raw utility through most of the time, so every sag, spike, frequency deviation, and harmonic on the line hits your gear directly. An online UPS isolates the load behind the inverter, delivering clean regulated sine regardless of what utility is doing. Runtime is almost never the issue; switchover and isolation are. That's why \"better batteries\" on a standby UPS doesn't make it suitable — the topology itself is wrong for the workload.",
    },
  ],
};

const pwrS4: ChapterSection = {
  id: "pwr-s4",
  topicId: "power-cooling",
  title: "Generators and the ATS",
  subtitle: "The diesel that carries the hours — and the hidden test you never see succeed.",
  icon: "◑",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "UPS is the seconds. **The generator is the hours.** Every serious datacenter has diesel (or natural gas) generators sitting in a yard or on a roof, fed from a tank that's designed to survive a 24–72 hour utility outage. Most of the time they never run. The one time they're called on — 02:00, storm took out a substation — is the one time they can't afford to fail. Which is why the real work is the *monthly test run*, not the generator itself.",
    },
    { kind: "heading", level: 3, text: "Generator basics" },
    {
      kind: "bullets",
      items: [
        "**Prime mover:** diesel engine (most common), sometimes natural gas (fuel is piped in, less fuel-storage concern, more utility dependency).",
        "**Alternator:** the engine spins a synchronous generator producing 3-phase AC at utility voltage and 60 Hz (50 Hz outside NA).",
        "**Day tank + bulk tank:** day tank sits near the engine (small, ~8 hrs), fed from a buried bulk tank (24–72 hrs or more).",
        "**Starter:** electric cranking motor or compressed air; batteries maintained continuously.",
        "**Control panel:** handles start/stop logic, monitors oil, coolant, fuel, and talks to the ATS.",
        "**Paralleling gear:** if multiple generators, switchgear synchronizes them and shares load.",
      ],
    },
    { kind: "heading", level: 3, text: "ATS and STS — how the swap actually happens" },
    {
      kind: "prose",
      html:
        "The **ATS (Automatic Transfer Switch)** sits between the utility and the backup path. It's the device that physically decides, \"utility looks bad — start the generator, swap the load.\" A typical sequence:",
    },
    {
      kind: "code",
      label: "ATS EVENT SEQUENCE",
      language: "text",
      code:
        "t=0.0s   Utility voltage drops below threshold\nt=0.5s   ATS qualifies the fault (avoids transferring on a 50ms glitch)\nt=3s     ATS sends START signal to generator\nt=8-15s  Generator cranks, runs up to rated speed/voltage/frequency\nt=12-20s ATS transfers load from utility bus to generator bus\n         — during this whole time the UPS is carrying the load —\n...\nUtility returns\nt+N      ATS detects stable utility for ~5 minutes\nt+N+5m   Transfer load back to utility\nt+N+15m  Generator cool-down run, then stop",
    },
    {
      kind: "callout",
      variant: "info",
      title: "STS vs ATS — not the same",
      body:
        "An **STS (Static Transfer Switch)** swaps between two live AC sources (usually UPS-A and UPS-B) in **milliseconds**, for single-corded devices. An **ATS** swaps between utility and generator in **seconds** (by design, because it's waiting for a generator to spin up). Different jobs, different timescales, different physics.",
    },
    {
      kind: "heading",
      level: 3,
      text: "The monthly test — where real reliability is bought",
    },
    {
      kind: "prose",
      html:
        "DC operators run generators under load **at least monthly** — usually 30 minutes to an hour — to verify: the engine starts on the air-start batteries, reaches rated voltage and frequency, takes load via the ATS, sustains it, and transfers back cleanly. Anything that fails in that controlled test is something that would have failed in a real outage. Shops that skip gen tests \"because we can't afford the risk\" are exactly the ones whose generators fail when it counts.",
    },
    {
      kind: "collapsible",
      intro: "Common gen-test findings that would have caused outages — each worth its own war story:",
      items: [
        {
          title: "Bad air-start batteries",
          body:
            "The engine's cranking batteries age just like UPS batteries. They pass a voltmeter check and still fail to crank a cold engine. Every monthly test includes verifying the engine cranked in the first few seconds — if not, replace the batteries immediately.",
        },
        {
          title: "Clogged fuel filter / water in fuel",
          body:
            "Diesel fuel degrades in storage — water collects, algae grow in water, fuel gels in cold. Monthly tests surface this as sluggish startup, smoke, or failure to stabilize under load. Fuel polishing (filtering the tank contents through a cleanup skid) is standard PM.",
        },
        {
          title: "Coolant leaks",
          body:
            "Diesel engines run hot. A slow coolant leak that's fine during short tests can cause shutdown on a 6-hour real run. Monthly tests should include visible inspection and coolant-level check after the run.",
        },
        {
          title: "ATS miswire or inhibit",
          body:
            "The generator starts fine but the ATS doesn't transfer load. Usually a control-wiring issue, a test-inhibit flag left set from the last maintenance, or an incorrectly configured voltage threshold. This is the specific failure every outage RCA should check for because it's silent until it matters.",
        },
        {
          title: "Paralleling faults",
          body:
            "Multi-gen sites rely on paralleling switchgear to synchronize generators. If one gen is slightly out of phase, the system can fail to parallelize — leaving you with only the gens that came online cleanly. Test every generator in rotation, including paralleling scenarios.",
        },
      ],
    },
    {
      kind: "fill-blank",
      prompt: "Match the component to the job:",
      sentence:
        "The {0} switch decides whether to transfer between utility and generator (takes seconds). The {1} switch swaps between two live AC sources (takes milliseconds). The UPS carries the load for roughly {2} to 30 seconds while the generator spins up.",
      blanks: [
        { answer: "ATS", hint: "automatic transfer switch", alternates: ["automatic transfer", "ats"] },
        { answer: "STS", hint: "static transfer switch", alternates: ["static transfer", "sts"] },
        { answer: "10", hint: "a number", alternates: ["ten"] },
      ],
      reveal:
        "**ATS** handles utility↔generator (seconds). **STS** handles live-source↔live-source (milliseconds). The UPS exists for the ~10–30 seconds in between. Knowing which device does what means you can point at the right panel when the wrong thing alarms.",
    },
    {
      kind: "flip-cards",
      intro: "Two recall beats on fuel and scheduling:",
      cards: [
        {
          front: "How much on-site fuel does a datacenter typically keep, and why not more?",
          back:
            "**24–72 hours** at full rated load, depending on Tier level and local fuel-delivery contracts. More sounds safer but costs money, storage space, and gets worse with time — diesel degrades in a tank over months. Most sites pair a 24–72h tank with **contracted emergency fuel delivery** for longer outages.",
        },
        {
          front: "What does a successful 'monthly test' actually prove?",
          back:
            "That **today**, this generator, on these batteries, with this fuel, this coolant, and this ATS, can take full load and sustain it. It proves *nothing* about next month — which is why the test is monthly. Reliability isn't a spec sheet; it's a continuously re-verified property.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A site holds monthly no-load generator tests (the engine starts and runs without load for 30 minutes). Facilities insists this is sufficient. What's the critical gap, and why is no-load testing dangerously misleading?",
      choices: [
        { label: "A", text: "No-load tests are fine — if the engine starts, it'll handle load" },
        { label: "B", text: "No-load testing proves the engine runs, but not that the ATS actually transfers the real load, that the alternator handles full kW with proper voltage/frequency regulation, or that paralleling works. Generators can run happily at no-load and fail under real load from fuel starvation, cooling issues, or ATS problems. Monthly tests must include **load transfer** — ideally real DC load, or a load bank if that's not feasible" },
        { label: "C", text: "Only yearly load tests are needed" },
        { label: "D", text: "Skip tests entirely if the engine is new" },
      ],
      correctAnswer: "B",
      explanation:
        "This is one of the most common real-world disasters: \"our generators test perfectly\" followed by a real outage in which they fail to carry load because the test never included load. Every serious DC testing program includes periodic load-bank testing (if not monthly, then at least quarterly) and ATS transfer verification. The engine running is necessary, not sufficient.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A storm knocks out utility at 03:15. The UPS alarm lights up; the generator cranks for 20 seconds and fails to start. Your UPS is rated 10 minutes at full load. What do you do in the next 5 minutes, and how do you avoid being the IC who panics?",
      hint: "You have an explicit runtime budget. Use it as a timeline.",
      answer:
        "The UPS just gave you a 10-minute budget. Treat it like a clock. First, **open the incident now** — page the on-call IC and facilities lead, open a bridge, start the log. Second, **call the generator maintenance vendor's emergency line** (this is pre-negotiated in every serious DC's contract — response time often 30 min or less). Third, **attempt a manual generator start** at the panel yourself if trained — batteries, fuel valve, emergency-run switch. Fourth, **plan load shedding proactively**: if the gen won't start in the next 5 minutes, you need to decide *which* systems to de-energize before the UPS cliff. Training jobs are the obvious candidate; latency-critical customer-facing services may get priority. Fifth, **talk to the customer comms lead** — an impending outage that's visible *before* it happens is dramatically less bad than one that surprises customers. What you *don't* do: panic, improvise, or repeatedly crank the generator until the starter motor fails too.",
    },
    {
      kind: "knowledge-check",
      question:
        "A new engineer proposes that since the generator tests perfectly every month, the UPS batteries only need testing annually instead of quarterly. What's wrong with that reasoning?",
      answer:
        "The UPS and the generator solve **different problems**, and each has its own failure modes. A healthy generator doesn't help if the UPS battery string can't deliver its rated kW in the first place — because the UPS is carrying the load during those 10–30 seconds before the gen picks up. If the battery is degraded, load voltage sags, protective relays trip, or the UPS itself drops the load before the gen is ever relevant. Battery capacity degrades *continuously* with age, cycle count, and temperature; annual testing is nowhere near fast enough to catch strings that have fallen out of spec. Industry practice: **quarterly capacity / impedance testing minimum**, continuous BMS monitoring for Li-ion, and more frequent tests for strings that are past their mid-life mark. Generator reliability and UPS reliability are two independent probabilities — you want both high, measured separately.",
    },
  ],
};

// ── pwr-m03 Cooling Architecture ───────────────────────────────────────────

const pwrS5: ChapterSection = {
  id: "pwr-s5",
  topicId: "power-cooling",
  title: "Heat is the Enemy",
  subtitle: "Every watt of compute becomes a watt of heat. Where it goes decides whether your cluster runs or throttles.",
  icon: "◎",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Here's the uncomfortable truth: **every watt of electricity delivered to a server ends up as heat inside the building.** CPUs, GPUs, PSUs — they're all converting electricity to compute *and* to waste heat. A 10 MW datacenter is a 10 MW space heater. If you don't remove that heat faster than you generate it, inlet temperatures climb, GPUs thermal-throttle, jobs slow, and eventually silicon shuts itself down to protect itself. Cooling isn't a comfort problem; it's a **performance and availability problem**.",
    },
    { kind: "heading", level: 3, text: "The thermodynamics you actually need" },
    {
      kind: "bullets",
      items: [
        "**Every watt in becomes a watt of heat out.** A GPU drawing 700 W radiates 700 W of heat into the room. That heat must leave the building somehow.",
        "**Heat moves from hot to cold.** Cooling is the art of putting cold air / water in the right place to carry the heat away at the right rate.",
        "**Temperature is cumulative downstream.** The air leaving the back of a hot row is the air entering the front of the next row if mixing isn't controlled — this is why containment exists.",
        "**Humidity matters.** Too dry: static discharges zap gear. Too humid: condensation on cold components. Target: **40–60% RH**.",
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "ASHRAE TC 9.9 — the industry thermal envelope",
    },
    {
      kind: "prose",
      html:
        "The reference every DC designer knows is **ASHRAE TC 9.9** — a thermal-guidelines spec that lays out recommended and allowable ranges for server inlet air. The recommended range has expanded over the years as operators learned to run warmer, saving cooling cost. Today:",
    },
    {
      kind: "table",
      headers: ["ASHRAE class", "Recommended inlet", "Allowable inlet", "Where you see it"],
      rows: [
        ["A1", "18–27°C / 64–80°F", "15–32°C / 59–90°F", "Tightly controlled enterprise"],
        ["A2", "10–35°C / 50–95°F", "10–35°C / 50–95°F", "General DC"],
        ["**A3 / A4**", "27°C+ / 80°F+", "Up to 40–45°C / 104–113°F", "Hyperscale \"free cooling\" optimized"],
        ["**H1 (2021)**", "~22°C max recommended", "—", "High-density compute (GPU / HPC)"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Running warmer saves money — up to a point",
      body:
        "Every degree you can safely raise your cold-aisle setpoint saves measurable cooling cost. Google famously runs data halls at inlet temps many operators would consider risky — **77°F/25°C or warmer**. The savings are real. But **GPU clusters are different**: H100s under training load with bad cooling *do* throttle, and throttling is a measurable revenue hit. High-density AI DCs tend toward the cooler end of the recommended range.",
    },
    { kind: "heading", level: 3, text: "What GPUs actually do when they overheat" },
    {
      kind: "collapsible",
      intro: "Thermal response progresses in stages — each with a specific signature:",
      items: [
        {
          title: "Stage 1 — Silent margin (below 85°C)",
          body:
            "GPU is happy. Full clocks, full performance. `nvidia-smi` shows a fan running below 60%. This is where you want to live.",
        },
        {
          title: "Stage 2 — Thermal throttling (~85–95°C)",
          body:
            "GPU reduces clock speed to limit power and heat. Performance drops silently — the job still runs, just slower. You see it as **reduced tokens/sec** on training, not as an alert. Catching throttling requires monitoring `nvidia-smi --query-gpu=clocks.current.graphics,temperature.gpu`.",
        },
        {
          title: "Stage 3 — Hard thermal limit (~95–100°C H100, varies)",
          body:
            "GPU clocks drop dramatically and the chip may signal thermal emergency. Driver logs record thermal events. Training jobs see a large perf cliff.",
        },
        {
          title: "Stage 4 — Shutdown (~105°C+)",
          body:
            "GPU emergency-halts to save itself. Training job fails; the host may show PCIe errors or 'GPU fell off the bus.' Recovery usually requires a reboot; in severe cases, thermal damage.",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "Inlet vs outlet temperature — the first diagnostic",
    },
    {
      kind: "prose",
      html:
        "The **single most useful cooling number** is the delta between server inlet and outlet air. Inlet should be your setpoint (say 22°C). Outlet is whatever inlet + server dissipation gives you (commonly 10–15°C above inlet). When inlet starts climbing toward outlet, you have **recirculation** — hot air from the back of the rack is mixing back into the front intake. That's a containment or airflow problem, not a cooling-capacity problem.",
    },
    {
      kind: "fill-blank",
      prompt: "Match heat-related symptoms to causes:",
      sentence:
        "A GPU sustains 90°C under load while the rack's inlet air is 22°C. The job's throughput is lower than expected but nothing has alarmed. This is called thermal {0}, and the likely first check is whether the server's intake path is {1} by cables, missing {2} panels, or a failed {3}.",
      blanks: [
        { answer: "throttling", hint: "perf-reducing response", alternates: ["throttle"] },
        { answer: "blocked", hint: "airflow problem", alternates: ["obstructed"] },
        { answer: "blanking", hint: "rack airflow hygiene", alternates: ["blank"] },
        { answer: "fan", hint: "server cooling component", alternates: ["fans"] },
      ],
      reveal:
        "The scenario describes **thermal throttling** — the GPU silently slows to stay under the hard thermal limit. The first physical checks: is the server's intake **blocked** by messy cabling? Is the rack missing **blanking** panels that are letting hot air recirculate? Has a **fan** failed, leaving uneven internal airflow? You can diagnose all three without involving the cooling plant.",
    },
    {
      kind: "flip-cards",
      intro: "Two high-value recall checks:",
      cards: [
        {
          front: "What's the 'recommended' ASHRAE A1 inlet temperature range?",
          back:
            "**18–27°C (64–80°F)**. Allowable goes wider (15–32°C) but recommended is the band you should actually design to. Modern GPU-heavy DCs often sit near the middle (~22°C) for margin.",
        },
        {
          front: "What number gets paid attention to for cooling efficiency?",
          back:
            "**Delta-T**: (outlet temp − inlet temp) across a row or unit. A well-ducted GPU rack delivers a healthy ΔT (e.g. 12–18°C). Low ΔT with a high inlet means **recirculation / bypass**; the cooling system is working but the air is short-circuiting.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You're told the CRAH supply temperature is 18°C, but server inlets in row 4 are reading 28°C and climbing. The CRAH is healthy and blowing cold. What's happening, and where do you look?",
      choices: [
        { label: "A", text: "The CRAH is lying — replace its temperature sensor" },
        { label: "B", text: "There's an airflow problem between the CRAH and the server inlets — most likely hot-aisle air recirculating back to the cold aisle due to missing blanking panels, gaps in containment, or a cable blocking an intake. Cold air is leaving the CRAH but isn't reaching the server fronts because it's mixing with hot exhaust on the way" },
        { label: "C", text: "You need more cooling capacity" },
        { label: "D", text: "The servers are miscalibrated" },
      ],
      correctAnswer: "B",
      explanation:
        "When cold air leaves the CRAH at 18°C and arrives at servers at 28°C, you lost 10°C somewhere — and that heat came from hot-aisle air mixing into the cold-aisle supply. Fix: physical walk of row 4 for missing blanking panels, unsealed containment curtains, cable trays blocking intakes, and rack doors left open. Throwing more cooling at a mixing problem wastes energy and doesn't fix anything; the cold gets short-circuited before it does any work.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A customer complains their training job is 12% slower than expected on a specific row of GPU servers. Dashboards show no alerts — GPU utilization is normal, no PCIe errors, no NVLink flaps. What cooling-side thing could be silently costing them 12%, and how would you confirm?",
      hint: "Throttling doesn't ring an alarm; it just shows up as slower work.",
      answer:
        "Thermal throttling is the top suspect. On each affected host, run `nvidia-smi --query-gpu=name,temperature.gpu,clocks.current.graphics,power.draw --format=csv` once a second during a load run and compare sustained clocks against the reference. If clocks are sitting 5–10% below spec while temps sit in the 85–92°C range, you're in classical throttling. Confirm: check `nvidia-smi -q | grep -i throttle` — modern driver exposes throttle reason codes. If confirmed, the next check is physical: inlet temps on those racks (what's *actually* arriving at the server front? a portable digital thermometer at the intake is fine); containment integrity (blanking panels? doors shut? cable obstructions?); and rack PDU amps (are these racks hotter-loaded than peers?). The 12% perf loss is the exact shape of a mild throttling problem, and it's entirely invisible to most alert rules because no single metric leaves its normal band.",
    },
    {
      kind: "knowledge-check",
      question:
        "A teammate proposes raising the cold-aisle setpoint from 22°C to 27°C across all halls to save cooling energy. Walk through why that's great advice for CPU-dense general-purpose racks and potentially dangerous for H100 GPU racks.",
      answer:
        "For **CPU-dense general-purpose racks**, 27°C inlet is well within ASHRAE's recommended range. CPUs and standard servers have plenty of thermal margin; the fans spin up slightly, the systems stay healthy, and the chiller plant does meaningfully less work — saving real money over a year. Modern hyperscalers run much warmer than 27°C in those halls for exactly this reason. For **H100 GPU racks** under sustained training load, the story flips. GPUs are already running near their silicon thermal ceiling: inlet 22°C ⇒ GPU ~78°C under load, headroom OK. Inlet 27°C ⇒ GPU ~83°C ⇒ edging into the throttle region. Once you're throttling, you lose 5–15% sustained performance — and at \$30k+ per H100 running an expensive training job, perf loss outweighs cooling savings by orders of magnitude. The disciplined plan: **bifurcate cold-aisle setpoints** — run general-purpose halls warm, run GPU halls cooler. Or run the whole building cooler and accept lower PUE. What you don't do is apply one global setpoint change without segmenting by workload sensitivity.",
    },
  ],
};

const pwrS6: ChapterSection = {
  id: "pwr-s6",
  topicId: "power-cooling",
  title: "Air, Water, and Immersion",
  subtitle: "CRAC vs CRAH, hot-cold aisles, direct-to-chip — and why GPU racks are finally forcing the industry wet.",
  icon: "◇",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "For decades, datacenters cooled themselves with air. CPUs produced enough heat to push air cooling to its limits, but it was enough. Then GPUs arrived. An 8× H100 rack dissipates **40–60+ kW**; immersion-cooled B200 racks push past **100 kW**. Air simply cannot carry that much heat out of a 19-inch cabinet at any reasonable noise level. The industry's reluctant, expensive transition to **liquid cooling** is the single biggest infrastructure change of the AI era — and it's happening in exactly the halls you work in.",
    },
    { kind: "heading", level: 3, text: "Air cooling — CRAC vs CRAH" },
    {
      kind: "table",
      headers: ["", "CRAC", "CRAH"],
      rows: [
        ["Full name", "**C**omputer **R**oom **A**ir **C**onditioner", "**C**omputer **R**oom **A**ir **H**andler"],
        ["Cooling source", "Self-contained refrigeration (compressor, DX)", "Chilled water from a central plant"],
        ["Good for", "Smaller DCs, colo, legacy sites", "Large DCs, hyperscale — more efficient at scale"],
        ["Typical capacity", "20–100 kW per unit", "50–300+ kW per unit"],
        ["Footprint", "Larger per kW", "Smaller per kW"],
      ],
    },
    {
      kind: "prose",
      html:
        "A CRAH is essentially a big fan plus a **chilled water coil** — water comes in cold (typically 6–10°C or 42–50°F), absorbs heat from the room air passing over the coil, and returns to the chiller plant a few degrees warmer. The **chiller plant** (compressors, cooling towers, pumps) is outside the DC floor — shared across many CRAHs, efficient at scale. Most hyperscale and serious AI-DC builds are CRAH-based.",
    },
    { kind: "heading", level: 3, text: "Hot aisle / cold aisle — the airflow discipline" },
    {
      kind: "prose",
      html:
        "Servers breathe front-to-back. You align racks so **all fronts face one aisle (cold)** and **all backs face another (hot)**. Cold aisle gets supply air from CRACs/CRAHs; hot aisle gets return air. The rule is: **no mixing**. Physical containment — ceiling-to-floor curtains, chimneys, whole-cold-aisle pods — is how you prevent hot exhaust from creeping back to cold intakes.",
    },
    {
      kind: "code",
      label: "TOP-DOWN VIEW — HOT/COLD AISLES",
      language: "text",
      code:
        "     COLD AISLE (supply)          HOT AISLE (return)          COLD AISLE          HOT\n  ┌──────────────────────────┬──────────────────────────┬────────────────────┐──\n  │  front → [RACK] ← back   │  back → [RACK] ← front   │  front → [RACK]    │ ...\n  │  front → [RACK] ← back   │  back → [RACK] ← front   │  front → [RACK]    │\n  │  front → [RACK] ← back   │  back → [RACK] ← front   │  front → [RACK]    │\n  └──────────────────────────┴──────────────────────────┴────────────────────┘\n                  ↑ CRAH supplies here         ↑ CRAH returns here",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The sins that kill hot/cold aisle efficiency",
      body:
        "**Missing blanking panels** — every empty U in a rack is a highway for hot air to loop back. Plastic blanking panels cost pennies each and add the highest-leverage efficiency improvement any retrofit can do. **Unsealed cable cutouts** in raised floor — hot air falls into them from above, cold air escapes. **Racks left open** during maintenance. **Reversed servers** (a single server turned 180° because someone was in a hurry) that exhaust into the cold aisle. Every one of these is a compounding 1–5% efficiency hit.",
    },
    { kind: "heading", level: 3, text: "Containment — the single biggest efficiency lever" },
    {
      kind: "collapsible",
      intro: "Two containment strategies exist in practice. Both beat no containment, by a lot.",
      items: [
        {
          title: "Cold-aisle containment",
          body:
            "Physical barriers **around the cold aisle** — doors at each end, a ceiling enclosing it from above. Cold supply air is bottled up around the server intakes; the rest of the room is at return (warm) temperature. Easier to retrofit; the room itself ends up warm.",
        },
        {
          title: "Hot-aisle containment",
          body:
            "Barriers **around the hot aisle** — doors, ceiling, sometimes chimney ducts per rack. Return air is captured and ducted to CRAHs without mixing. The rest of the room is at supply (cool) temperature — more pleasant for humans, easier to inspect gear. Slightly better thermodynamics in many designs.",
        },
        {
          title: "Rear-door heat exchangers",
          body:
            "Hybrid — the **back door of each rack has a water-cooled coil**. Hot exhaust passes through the coil on its way out, leaving the rack near cold-aisle temperature. Great fit for mid-density racks before you commit to full direct-to-chip. 40–50 kW per rack feasible.",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "Liquid cooling — what the AI era actually needs",
    },
    {
      kind: "prose",
      html:
        "Air maxes out around **30–40 kW per rack** practically. H100 racks routinely exceed that; B200 designs push past 100 kW. You can't brute-force-fan-speed your way to that density. The answer is to **move the heat with water, not air** — inside the server, as close to the heat source as possible.",
    },
    {
      kind: "table",
      headers: ["Approach", "How it works", "kW/rack", "Ops complexity"],
      rows: [
        ["**Rear-door HX**", "Water coil on the back door of each rack catches exhaust", "40–50 kW", "Low — keeps the rest air-cooled"],
        ["**Direct-to-chip (D2C)**", "**Cold plates** on CPUs and GPUs carry heat via internal coolant loop to a rack CDU (coolant distribution unit); CDU exchanges with facility water", "100+ kW", "Medium — leaks are the new failure mode; coolant quality matters"],
        ["**Immersion — single-phase**", "Whole server **submerged** in dielectric fluid; fluid circulates through a heat exchanger", "150+ kW, potential 250+ kW", "High — wet servers, new rack form factors, PPE for maintenance"],
        ["**Immersion — two-phase**", "Dielectric fluid boils at chip surface; vapor condenses and returns", "Very high (250+ kW)", "Very high — hermetic systems, handling protocols, regulatory"],
      ],
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "Liquid cooling's new failure modes",
      body:
        "Liquid cooling brings **leaks** into the equation — a failure mode CPUs have never had. Every direct-to-chip site needs leak detection (drip-pan sensors, water-sensitive tape, cameras), trained incident response (isolate the affected CDU, de-power the rack, drain the loop), and spare parts on-site. An immersion rack adds **fluid cost**, **recertification between chips** (dielectric interactions with solder, conformal coatings), and **a whole new PPE regime** for maintenance. The payoff is density; the cost is procedural complexity.",
    },
    {
      kind: "fill-blank",
      prompt: "Connect the density to the tech:",
      sentence:
        "Traditional air-cooled racks max out around {0} kW. Rear-door heat exchangers extend that to about {1} kW. Direct-to-chip cold plates push past {2} kW per rack. Immersion can exceed {3} kW.",
      blanks: [
        { answer: "30", hint: "kW, air cap", alternates: ["30-40", "40", "~30"] },
        { answer: "50", hint: "rear-door", alternates: ["40-50", "~50"] },
        { answer: "100", hint: "GPU D2C", alternates: ["~100", "100+"] },
        { answer: "200", hint: "immersion", alternates: ["250", "150", "150+", "~200"] },
      ],
      reveal:
        "Air ≈ **30** kW/rack practical cap; rear-door HX pushes to ~**50**; direct-to-chip gets you past **100**; immersion can exceed **200** kW/rack. The right cooling tech is a function of rack density — not the other way around.",
    },
    {
      kind: "flip-cards",
      intro: "Quick recalls on aisle and fluid discipline:",
      cards: [
        {
          front: "What's a 'blanking panel' and why does it matter so much?",
          back:
            "A cheap plastic panel that fills an empty U-space in a rack, preventing hot air from bypassing the servers and mixing back into the cold aisle. **Missing blanking panels are the #1 cheap fix for poor cooling efficiency.** Always audit a new or retrofitted rack.",
        },
        {
          front: "In direct-to-chip cooling, what's a CDU and why do you care?",
          back:
            "**Coolant Distribution Unit** — lives at the rack (or row) and isolates the internal server coolant loop from the facility water loop via a heat exchanger. If the CDU fails, *every* D2C rack behind it loses cooling simultaneously. Redundancy and monitoring of CDUs is as important as PDU redundancy.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You're building a new AI training hall that will host 8× H100 servers at 40–50 kW per rack. A hardware architect proposes a traditional air-cooled design with bigger CRAHs and higher fan speeds. What's the right pushback, and what's the better proposal?",
      choices: [
        { label: "A", text: "Agree — CRAHs are cheaper than liquid" },
        { label: "B", text: "Air cooling is capped around 30 kW/rack in practice; pushing higher needs extreme fan noise, wastes energy on overcooling the whole room, and still risks hotspots. The right proposal is **direct-to-chip cooling** with rack-level CDUs and hot-aisle containment, or at minimum **rear-door heat exchangers**. Facility water infrastructure is a real capex ask, but it's the only way to support the target density efficiently" },
        { label: "C", text: "Add more small CRAHs scattered throughout" },
        { label: "D", text: "Run GPUs at 50% TDP to fit within air limits" },
      ],
      correctAnswer: "B",
      explanation:
        "Trying to air-cool 40–50 kW racks is a lost cause: CRAHs burn energy, fans scream, blanking panels can't save you. Direct-to-chip with CDUs is the industry's answer — it moves the heat as a liquid (thousands of times more thermal capacity per volume than air) directly off the silicon. Yes, it's more expensive, and yes, it introduces leaks as a failure mode, but it's the only tech that scales.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You walk a data hall that has hot-aisle containment and mostly-full racks. Yet row 8 consistently runs 4°C warmer at the inlet than the rest of the hall. CRAH supply temperatures are uniform. What are the three most likely physical causes, and what's the simplest first check?",
      hint: "Containment fails in specific, visible ways.",
      answer:
        "Top three: (1) **Containment seal failure around row 8** — a gap in the roof of the hot-aisle pod, a door propped open for cable runs, missing brushes around top-of-rack cutouts. Hot air is escaping the hot aisle and drifting over to row 8's cold intake. (2) **Missing blanking panels** in row 8 specifically, more than in other rows — empty U-space is short-circuiting air inside those racks. (3) **Under-provisioned air delivery** — fewer perforated tiles or lower % opening in the raised floor in front of row 8 (if under-floor supply). The simplest first check is a physical walk of row 8 with a smoke pencil, flashlight, and blanking-panel count: look for light coming through hot-aisle walls, count missing 1U blanks, feel for hot spots at intake level. The complex check (re-engineering CRAH balancing) comes later, once you've ruled out the cheap physical causes.",
    },
    {
      kind: "knowledge-check",
      question:
        "Describe the tradeoffs between hot-aisle containment and cold-aisle containment, and explain why a new GPU-dense hall might choose one over the other.",
      answer:
        "**Cold-aisle containment** seals the cold aisle; the rest of the room runs at return (warm) temperatures. Advantages: simpler retrofit (you're adding walls/ceilings around existing cold aisles), and human-comfortable equipment areas stay cool because most of the hall is *not* the contained part — wait, no, that's backwards. Cold-aisle containment keeps the *cold* bottled up *inside* the pod; the *rest* of the room is warm. **Hot-aisle containment** seals the hot aisle and ducts return air to CRAHs; the rest of the room sits at supply (cool) temperatures — easier for humans to work in, and often slightly better thermodynamically because the CRAHs see hotter return (improving their own efficiency). For **GPU-dense builds**, hot-aisle containment is typically preferred because: (1) the rest of the hall stays cool — better for auxiliary gear and humans who need long equipment visits; (2) return-air temperature is maximized (hotter return = more efficient chiller operation, since the ΔT across the coil is higher); (3) rear-door heat exchangers or in-row cooling units fit naturally into a hot-aisle topology. The one place cold-aisle containment might still win is in legacy retrofits where carving out hot-aisle ductwork is prohibitive.",
    },
  ],
};

// ── pwr-m04 Efficiency & Environmental Response ────────────────────────────

const pwrS7: ChapterSection = {
  id: "pwr-s7",
  topicId: "power-cooling",
  title: "PUE, Density, and the Real Bill",
  subtitle: "Why 0.3 of PUE is \$20M/year, and how density flips every decision about where to build.",
  icon: "◩",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Power is the bill that never shrinks. Your compute fleet might cost \$200M in servers, but those servers will burn through **\$5–15M of electricity per year per 10 MW of load**. Shave 0.3 off your **PUE** and you just saved more money than your monthly AWS bill — forever. PUE isn't a nerdy plaque on the wall; it's the single metric that maps architectural choices to yearly dollars.",
    },
    { kind: "heading", level: 3, text: "PUE — the one formula that matters" },
    {
      kind: "code",
      label: "PUE DEFINITION",
      language: "text",
      code:
        "PUE  =  Total facility power\n        ─────────────────────\n            IT load power\n\n  Perfect theoretical:  PUE = 1.0\n  Best-in-class:        PUE ≈ 1.1  (Google, Meta, Microsoft)\n  Good new DC:          PUE ≈ 1.2\n  Average DC:           PUE ≈ 1.5\n  Legacy / small:       PUE ≥ 1.8",
    },
    {
      kind: "prose",
      html:
        "If the IT load (servers + network + storage) draws 10 MW, and the whole facility draws 12 MW, **PUE = 1.2**. The extra 2 MW is cooling plant, UPS losses, lighting, security, offices, etc. The lower the PUE, the less non-IT overhead you pay for — all of which still shows up on the utility bill.",
    },
    {
      kind: "table",
      headers: ["Load", "PUE", "Total annual energy", "Utility cost @ $0.07/kWh"],
      rows: [
        ["10 MW IT", "1.5", "131,400,000 kWh", "~\$9.2M/yr"],
        ["10 MW IT", "1.3", "113,900,000 kWh", "~\$8.0M/yr"],
        ["10 MW IT", "1.2", "105,100,000 kWh", "~\$7.4M/yr"],
        ["10 MW IT", "1.1", "96,400,000 kWh", "~\$6.7M/yr"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Every 0.1 of PUE ≈ $800k/year on a 10 MW DC",
      body:
        "Going from PUE 1.5 to 1.2 on a 10 MW footprint saves roughly **\$2.5M/year** forever. That pays for a lot of blanking panels, containment upgrades, and chiller plant optimization. When someone proposes a cap-ex cooling project with 2-year payback, it's almost always the right call.",
    },
    { kind: "heading", level: 3, text: "Where PUE leaks come from" },
    {
      kind: "collapsible",
      intro: "The overhead inside the 'non-IT' 0.2–0.5 of a typical PUE:",
      items: [
        {
          title: "Cooling plant — the biggest lever",
          body:
            "Chillers, cooling towers, pumps, CRAHs, CRACs. Typically **60–80% of the non-IT overhead**. Efficiency improvements: raising chilled-water setpoint, using free cooling (outside air / cooling tower only when ambient allows), variable-speed pumps and fans, better containment reducing required air volume.",
        },
        {
          title: "UPS losses",
          body:
            "Every online double-conversion UPS has some efficiency loss — typically **3–7%** of the power flowing through it, converted to heat. Modern high-efficiency UPS units approach 97% at their sweet-spot load; running them under-loaded loses efficiency fast.",
        },
        {
          title: "Transformers + distribution losses",
          body:
            "Each step-down from utility voltage to rack voltage costs 0.5–2% in heat. Modern builds collapse stages (e.g., 480V all the way to the rack-level PSU instead of going through multiple intermediate transformers) to reduce this.",
        },
        {
          title: "Lighting, security, offices",
          body:
            "Small in a well-run DC — but a legacy facility with old fluorescent fixtures running 24/7 can easily add 1% PUE overhead. Occupancy sensors + LED retrofit are universal wins.",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "Density — the tradeoff that rewires your decisions",
    },
    {
      kind: "prose",
      html:
        "Traditional racks run **5–15 kW** each — a 42U rack of 1U CPU servers. Modern AI racks run **40–60 kW** — 8× H100 servers plus networking. Extreme density runs **100+ kW** per rack. As density goes up, everything changes: circuit sizing, cooling topology, rack design, even where you build the building.",
    },
    {
      kind: "table",
      headers: ["Density", "Typical rack", "Cooling approach", "Site implications"],
      rows: [
        ["5–15 kW", "Traditional CPU compute", "Air + hot/cold aisle", "Most existing colo space works"],
        ["15–30 kW", "Dense CPU / mixed compute", "Air + containment + good airflow", "Some existing DCs qualify; most need upgrades"],
        ["30–60 kW", "GPU compute", "Rear-door HX or direct-to-chip", "New builds or major retrofits"],
        ["60–100+ kW", "Dense AI / B200-class", "Direct-to-chip mandatory", "Greenfield AI campuses, water infra needed"],
      ],
    },
    {
      kind: "fill-blank",
      prompt: "Apply the PUE math:",
      sentence:
        "A 10 MW IT load with PUE of {0} burns roughly \$9M/yr in electricity at a utility rate of \$0.07/kWh. Cut PUE to {1} and you save roughly \$2M/year — dominated by the {2} plant, which is typically 60–80% of the non-IT overhead.",
      blanks: [
        { answer: "1.5", hint: "average DC", alternates: ["1.5x"] },
        { answer: "1.2", hint: "good new DC", alternates: ["1.2x"] },
        { answer: "cooling", hint: "where heat goes", alternates: ["chiller", "hvac"] },
      ],
      reveal:
        "Going from PUE **1.5** to **1.2** on a 10 MW footprint saves roughly **\$2M/year** of utility spend, and most of the non-IT overhead lives in the **cooling** plant. That's why PUE-reduction projects almost always start with containment and chiller-plant optimization — they attack the biggest pile.",
    },
    {
      kind: "flip-cards",
      intro: "Density + efficiency recalls:",
      cards: [
        {
          front: "What's a typical 'good' PUE for a new DC build, and what does 'best-in-class' look like?",
          back:
            "**Good new DC: PUE ≈ 1.2.** Best-in-class (Google/Meta/Microsoft flagship builds): **PUE ≈ 1.1**. Below 1.1 requires aggressive free cooling, near-climate-optimized siting, and very high inlet temperatures.",
        },
        {
          front: "Why does free cooling become more valuable as you run the hall warmer?",
          back:
            "Free cooling (using outside air or cooling towers without mechanical refrigeration) works whenever **outside wet-bulb temperature is below your required supply temperature**. Running the hall warmer (say, 27°C setpoint instead of 20°C) means you can use free cooling for many more hours/year, potentially skipping the chiller entirely in cold climates.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You're optimizing a 20 MW existing DC currently at PUE 1.55. A vendor pitches a containment retrofit for \$3M that's projected to get you to PUE 1.35. What's the rough payback, and why is this kind of project almost always a green light?",
      choices: [
        { label: "A", text: "4 years — slow; probably not worth it" },
        { label: "B", text: "At 20 MW IT × 8760 h × (1.55 − 1.35) × \$0.07/kWh ≈ **\$2.5M/yr savings**. Payback ≈ **14 months**. And that saving is permanent — the retrofit pays for itself once and then keeps delivering for 10+ years. This is exactly the class of project PUE-reduction reviews exist to greenlight" },
        { label: "C", text: "10 years — reject" },
        { label: "D", text: "Negative payback — reject" },
      ],
      correctAnswer: "B",
      explanation:
        "PUE savings scale linearly with load and rate. 20 MW × 8,760 hr × 0.20 PUE gap × \$0.07/kWh ≈ \$2.45M/year. A \$3M project with \$2.5M/year savings and a 10+-year useful life is a slam-dunk — the ROI on physical containment is one of the best in datacenter capex.",
    },
    {
      kind: "think-about-it",
      scenario:
        "Your 10 MW DC runs at PUE 1.35. The finance team points at a \$400k/year gap vs. a similar facility at PUE 1.25 and asks you to close it. You have two proposed projects: (A) \$1M to upgrade chillers to variable-speed drives, projected 0.05 PUE gain; (B) \$300k to improve aisle containment and add blanking panels, projected 0.07 PUE gain. Which do you pick first, and why?",
      hint: "Look at cost-per-PUE-point and payback time.",
      answer:
        "Pick **(B)**. Containment + blanking panels is almost always the cheapest, fastest, lowest-risk PUE improvement — you don't even have to turn anything off to install most of it. $300k for 0.07 PUE ≈ \$4.3M per PUE point; 10 MW × 8760 × 0.07 × \$0.07 ≈ \$430k/yr savings → **payback ~8 months**. Chiller VSDs are a good project too, but they're capital-heavy and the payback is multi-year. The disciplined order: always do the physical, cheap, operationally-simple efficiency wins first (containment, blanking, setpoint tuning), *then* tackle capital projects. You may find that after (B) the PUE gap shrinks so much that (A) becomes lower priority than another retrofit target. Containment is to cooling what paying off the credit card is to finance: do it first, always.",
    },
    {
      kind: "knowledge-check",
      question:
        "A colleague argues that for an AI-heavy datacenter, PUE matters less than for a traditional cloud DC because \"the GPUs dominate everything anyway.\" Agree or disagree, and explain.",
      answer:
        "**Disagree — PUE matters *more* for AI, not less.** The argument confuses *share* with *absolute size*. Yes, GPUs dominate the IT load (often >70% of kW in a GPU hall). But the cooling required to move that heat is also proportionally larger — more chiller plant, more pumps, more fan work, more UPS losses over a bigger load. An AI datacenter running at PUE 1.5 is burning an enormous amount of non-IT overhead; cutting that 1.5 to 1.3 on a 50 MW GPU campus saves **\$10M/year or more** (50 MW × 8760 × 0.2 × \$0.07 ≈ \$6M/yr base, higher at dense-rack costs). The direct-to-chip cooling designs the industry is adopting are **PUE-motivated** exactly because AI scale makes every 0.1 of PUE worth a rounding error on the entire DC's feature list. If anything, the traditional cloud DC can afford PUE sloppiness (lower kW density, less cooling pressure); the AI DC cannot.",
    },
  ],
};

const pwrS8: ChapterSection = {
  id: "pwr-s8",
  topicId: "power-cooling",
  title: "When Things Go Wrong",
  subtitle: "Thermal events, water leaks, EPOs, and the incidents nobody forgets.",
  icon: "◪",
  estimatedMinutes: 9,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Most weeks a power-and-cooling tech has nothing dramatic happen. And then there's the week that makes the year's story. Thermal runaway in a GPU row. A coolant leak above a switchgear cabinet. Someone hits the red button (\"EPO\") by accident — or on purpose. Battery fire alarms. These events are **rare, high-stakes, and unforgiving** — they're the ones you drill for even if they never happen.",
    },
    { kind: "heading", level: 3, text: "Thermal incidents — the cascade" },
    {
      kind: "prose",
      html:
        "Cooling failures don't feel urgent at minute one — inlet temp creeps up by a degree or two, fans spin up. By minute 15 you're on the wrong side of a steep curve. Heat builds exponentially once the dissipation rate falls below the load rate, and by the time alarms are firing, you've already lost margin.",
    },
    {
      kind: "table",
      headers: ["Minute", "Symptom", "What's happening"],
      rows: [
        ["0", "CRAH trips / chiller fails", "Supply air temp starts rising"],
        ["2–5", "Inlet air warms by 3–5°C", "GPUs still within spec, no alerts"],
        ["5–10", "GPU temps rise; **mild throttling** begins", "Training jobs slow silently"],
        ["10–15", "Inlet warms by 10°C+; **significant throttling**", "Performance alerts fire (not temp alerts)"],
        ["15–25", "GPUs hit hard thermal limits", "Individual GPUs shut down; \"fell off the bus\" errors"],
        ["25+", "Cascading server shutdowns", "Whole racks going dark; fire-risk territory"],
      ],
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "The thermal-event runbook in one paragraph",
      body:
        "On a confirmed cooling failure: (1) notify the IC and facilities **now**; (2) identify scope — one CRAH or many, one row or a hall; (3) if scope is contained, stay on air and monitor inlet trend; (4) if scope is broad, **start load shedding proactively** — kill training jobs first, then any non-critical compute. You'd rather take a planned partial outage now than a cascading thermal shutdown in 10 minutes. (5) Coordinate with facilities on restore — do *not* restart compute until cooling is verifiably restored and inlet temps are back in spec.",
    },
    { kind: "heading", level: 3, text: "Water leaks — the one cooling failure mode that's new" },
    {
      kind: "prose",
      html:
        "Direct-to-chip and rear-door heat exchangers brought water into the server environment for the first time at scale. A dripping CDU above a live switchgear cabinet is the ugliest sentence in a DC operator's vocabulary. Detection and response protocols live in their own runbook.",
    },
    {
      kind: "collapsible",
      intro: "What a mature D2C / liquid-cooling site has in place:",
      items: [
        {
          title: "Leak detection",
          body:
            "Moisture-sensitive cable (runs along pipe routes and cabinet bottoms) that alarms the BMS on any detected wet. Drip pans under CDUs. Cameras at strategic points. Some sites add acoustic detection for high-pressure leaks.",
        },
        {
          title: "Isolation valves",
          body:
            "Rack-level and row-level manual shutoff valves that any trained tech can close in under 60 seconds. Valves are clearly labeled; valve location diagrams are posted at entry points.",
        },
        {
          title: "Containment trays / bunds",
          body:
            "Raised drip pans beneath pipe runs route any leak to a drain, not onto live equipment. In some aggressive designs, any hall with facility water has a wet/dry zoning plan separating water paths from critical electrical gear.",
        },
        {
          title: "Response playbook",
          body:
            "\"Small leak\" (drip into pan): notify, schedule. \"Active leak onto live gear\": de-energize affected rack **immediately**, isolate the loop, escalate to facilities, evacuate affected area, begin remediation with PPE. Practice the scenario — no one should be improvising when facility water is in contact with 480V bus.",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "EPO — the button you hope nobody ever touches",
    },
    {
      kind: "prose",
      html:
        "Every DC has an **Emergency Power Off** (EPO) system — usually red mushroom buttons at exits, with glass-break covers. Pushing one kills power to an entire hall (or section) immediately. It exists because **someone's life could depend on it** — firefighters entering a flooded room, an electrician about to cut a live cable, a fire at the ceiling.",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "EPO accidents are more common than you'd think",
      body:
        "People lean on them. Cleaning crews push mop handles into them. Contractors confuse them for door-release buttons. Every accidental EPO is a full-hall outage — **tens of millions of dollars of compute suddenly dark**. Good sites use break-glass covers, signage, and regular EPO walkthroughs so non-DC staff understand what those red buttons do.",
    },
    {
      kind: "heading",
      level: 3,
      text: "Battery events — Li-ion has its own category",
    },
    {
      kind: "prose",
      html:
        "Modern Li-ion UPSes have safety layers stacked on safety layers, but a battery-system fire is the one event nobody wants. **Thermal runaway** in a Li-ion cell cascades — one bad cell heats neighbors, which heat their neighbors. Detection uses **combined heat + gas + pressure sensors** in each cabinet; response is automatic isolation and active fire suppression (often with a specific Li-ion-rated agent, not just water).",
    },
    {
      kind: "fill-blank",
      prompt: "Reinforce incident-response vocabulary:",
      sentence:
        "On a sudden cooling failure, inlet air warms first and GPUs begin silently {0} before any temperature alarm fires. The disciplined early move is proactive load {1} — especially training jobs — so you take a planned partial outage instead of a cascading shutdown. If water is ever dripping onto live gear, you {2} the affected rack immediately, isolate the coolant loop, and escalate to facilities.",
      blanks: [
        { answer: "throttling", hint: "thermal response", alternates: ["throttle"] },
        { answer: "shedding", hint: "intentional load reduction", alternates: ["shed"] },
        { answer: "de-energize", hint: "kill power to", alternates: ["denergize", "power off", "power down", "deenergize"] },
      ],
      reveal:
        "On cooling failure, GPUs **throttle** silently first — the hint you only see in performance dashboards. Load **shedding** proactively buys time to restore cooling before the cascade. For active leaks on live gear, **de-energize** the rack *before* anything else — operator safety and equipment protection are both served by removing power first.",
    },
    {
      kind: "flip-cards",
      intro: "High-stakes recall — these you want automatic:",
      cards: [
        {
          front: "Why is 'hold back compute start until cooling is verified restored' a rule?",
          back:
            "Because the first thing the hall will try to do when cooling comes back is dissipate all the stored heat in the racks. If you start compute back up at the same time, you're adding load to a hall that's still getting back to spec — and you can cascade right back into a thermal event. Let cooling recover to setpoint, then bring compute back in staged waves.",
        },
        {
          front: "What's the rule about cleaning/maintenance crews and red EPO buttons?",
          back:
            "**They don't know what it is.** To a cleaner, it's a big red button like a door release. Signage, break-glass covers, and **walkthroughs with external crews on day one** are mandatory. Accidental EPOs from non-DC staff are one of the most recurring causes of preventable outages.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "At 03:12 a CRAH alarms offline in your GPU hall. Inlet temps in the affected row start rising at ~1°C per minute. Your incident commander asks for the first three moves. What's the right answer?",
      choices: [
        { label: "A", text: "Wait and see — don't panic, the alarm might be false" },
        { label: "B", text: "(1) Confirm scope — is it one CRAH or more, one row or hall-wide. (2) Notify facilities/chiller plant and page the cooling specialist. (3) Start proactive load-shed planning — identify training jobs that can be paused now, and which services need to stay up at all costs. You want the shed plan *ready* by the time you hit the 15-minute mark even if you haven't executed it yet. Do NOT cold-start compute restarts; the live problem is removing heat, not adding compute" },
        { label: "C", text: "Turn off the whole hall preemptively" },
        { label: "D", text: "Open all doors for natural cooling" },
      ],
      correctAnswer: "B",
      explanation:
        "Thermal incidents reward preparation. Scope + escalation + a ready shed plan means you can act instead of panic when things accelerate. Waiting wastes the initial window; turning everything off is an overreaction that creates a self-inflicted outage; opening doors doesn't meaningfully cool a 10 MW hall and ruins humidity control. The correct posture is: buy time, escalate, and be ready to shed load with a plan you've already built.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You arrive at a monthly walkthrough of a newly liquid-cooled GPU hall. Next to a CDU serving a 60 kW rack, you notice a drip pan with about half a cup of water in it. No leak alarms have fired. No techs are on the floor right now. What do you do, in what order, and what do you *not* do?",
      hint: "A wet drip pan is an unfired alarm's physical evidence.",
      answer:
        "This is a real event even without an alarm — the drip pan's job is to catch a leak, and it caught one. Do: (1) **Photograph it** and note exact position (timestamped). (2) **Check the leak-detection cable and BMS logs** — did the cable get wet and just not alarm (meaning the detection is broken), or has the leak been below threshold duration, or is it a recent drip after the last inspection cycle? (3) **Notify facilities and the liquid-cooling vendor on-call immediately**; don't wait for the morning. (4) **Inspect the CDU for visible seepage, loose fittings, degraded gaskets** — most leaks come from quick-disconnects and fittings, not pipes. (5) **Evaluate whether to de-energize the rack** based on the source of the water and how close it is to live components; err on the side of isolating the rack if in doubt. What you *don't* do: wipe the pan and continue the walkthrough like nothing happened, assume \"probably condensation\" without proof, or leave without creating a ticket. That half-cup is either the start of a trend or the tail of a cleared incident — and you can't tell which by looking. Every drop counts; every inspection cycle closes the loop.",
    },
    {
      kind: "knowledge-check",
      question:
        "A colleague argues that a power/cooling operator only needs to worry about their equipment staying up — software teams handle their own incident response. Why is this framing dangerous, and what's the right mental model for how power/cooling ops integrates with the rest of the org during incidents?",
      answer:
        "The framing is dangerous because **the outage the customer sees is the final effect, not the initial cause**. A cooling failure turns into: inlet temps rising → GPU throttling → training job latency spike → customer ticket (\"job 40% slower today\"). Nothing in that chain *starts* on the software side; everything is downstream of what the facilities team is looking at. If power/cooling ops operates in isolation, the software side is debugging user-visible symptoms for hours before anyone connects them to the underlying infrastructure event. The right mental model: **every significant facilities event has a proactive communication obligation to the SRE / ops / customer-facing teams** — \"CRAH-4 is offline, expect degraded GPU perf in row 8 for the next 20 minutes.\" That upstream notification collapses triage time on the software side from hours to minutes. In incident response, you want the facilities incident to be *visible* to the systems team before the systems team has to detective-work their way back to it. Integrated incident response — facilities and software on the same bridge, same status page — is the single biggest MTTR improvement a large DC can make. Your job isn't just \"keep the gear up,\" it's \"keep the gear up *and* tell the people running the workloads the instant anything is off.\"",
    },
  ],
};

// ── Registry ────────────────────────────────────────────────────────────────

export const POWER_CHAPTERS: ChapterSection[] = [
  pwrS1,
  pwrS2,
  pwrS3,
  pwrS4,
  pwrS5,
  pwrS6,
  pwrS7,
  pwrS8,
];
