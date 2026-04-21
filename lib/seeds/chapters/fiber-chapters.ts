import type { ChapterSection } from "@/lib/types/chapter";

// ═══════════════════════════════════════════════════════════════════════════
// Operation Light Path — Fiber Optics chapters (fib-s1 .. fib-s8)
// Each mission (fib-m01..fib-m04) pulls from 2 chapter sections.
// Instructional design mirrors Power & Cooling: why-this-matters intros,
// collapsible drill-downs, fill-blank reinforcement, flip-to-recall cards,
// and inline MCQ checks.
// ═══════════════════════════════════════════════════════════════════════════

// ── fib-m01 Fiber Fundamentals ─────────────────────────────────────────────

const fibS1: ChapterSection = {
  id: "fib-s1",
  topicId: "fiber",
  title: "The Glass Strand",
  subtitle: "What fiber actually is — and why the core size decides everything else.",
  icon: "◎",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "You will pull fiber, plug fiber, coil fiber, and occasionally break fiber. Understanding what it actually is keeps you from doing something that looks fine but **silently degrades the link** — bending it too tight, mixing incompatible types, or looking into an active one and damaging your eye. The fundamentals are quick. A tech who grasps them makes fewer silent mistakes.",
    },
    {
      kind: "prose",
      html:
        "A single fiber is a **hair-thin strand of glass** (silica) with three concentric parts, plus an outer jacket once it's cabled. Light travels down the center. The surrounding layers exist to keep that light trapped in the center and to protect the glass from snapping in your hands.",
    },
    { kind: "heading", level: 3, text: "Core, cladding, coating, jacket" },
    {
      kind: "code",
      label: "CROSS-SECTION",
      language: "text",
      code:
        "        ┌─────────────────────┐\n        │       JACKET        │ outer cable shell (handleable)\n        │  ┌───────────────┐  │\n        │  │    COATING    │  │ protective plastic (factory)\n        │  │  ┌─────────┐  │  │\n        │  │  │ CLADDING│  │  │ glass with LOWER refractive index\n        │  │  │  ┌───┐  │  │  │\n        │  │  │  │CORE│ │  │  │ glass that CARRIES the light\n        │  │  │  └───┘  │  │  │\n        │  │  └─────────┘  │  │\n        │  └───────────────┘  │\n        └─────────────────────┘",
    },
    {
      kind: "prose",
      html:
        "Light travels down the **core**. The **cladding** has a slightly lower refractive index, so light striking the core/cladding boundary reflects back inward — this is **total internal reflection**, and it's the whole trick. The **coating** is a plastic layer applied at the factory. The **jacket** is the color-coded outer shell you actually handle.",
    },
    {
      kind: "prose",
      html:
        "Fiber sizes are written as **core/cladding** in micrometers: `9/125`, `50/125`, `62.5/125`. The cladding is almost always **125 μm**. The core is what varies — and that core size is what determines the fiber's entire personality.",
    },
    { kind: "heading", level: 3, text: "Single-mode vs. multi-mode — the big split" },
    {
      kind: "prose",
      html:
        "This is the single most important distinction in fiber. It drives wavelength, transceiver choice, reach, and cost.",
    },
    {
      kind: "table",
      headers: ["", "Single-Mode (SM)", "Multi-Mode (MM)"],
      rows: [
        ["**Core size**", "~9 μm", "50 μm or 62.5 μm"],
        ["**Light source**", "Laser", "Laser (VCSEL) or LED (legacy)"],
        ["**Wavelengths**", "1310 nm, 1550 nm", "850 nm (primarily)"],
        ["**Reach**", "10 km, 40 km, 80 km+", "300–400 m typical"],
        ["**Cost**", "Expensive optics, cheap fiber", "Cheap optics, pricier fiber"],
        ["**Typical jacket**", "Yellow", "Aqua (OM3/OM4), lime (OM5), orange (OM1/OM2)"],
        ["**Used for**", "Hall-to-hall, cross-campus, long haul", "Inside the data hall, server-to-ToR"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Mental model — one path vs many paths",
      body:
        "Single-mode has a core so small that light can only travel **one path** down it — no dispersion, long reach, narrow beam. Multi-mode has a wider core that lets light **bounce along several paths (modes)**. Multi-mode is cheaper to drive but dispersion limits distance: the faster pulses start overlapping and the receiver can't tell them apart anymore.",
    },
    {
      kind: "collapsible",
      intro:
        "Open each item for the detail behind the mental model:",
      items: [
        {
          title: "Why the core size matters so much",
          body:
            "A 9 μm core is narrow enough that there's essentially **one geometric path** for light. With 50 μm, light entering at different angles takes different-length paths through the glass, arriving at different times — that's **modal dispersion**. It's not about power; it's about pulse distortion. Modes arrive smeared, so fast signals blur together.",
        },
        {
          title: "Why SM uses lasers, MM can use cheaper sources",
          body:
            "SM's tiny core needs a narrow, coherent beam — only a laser focuses that tight. MM's wider core tolerates the broader beam from a **VCSEL** (vertical-cavity surface-emitting laser), which is much cheaper to manufacture. Legacy MM used LEDs; modern MM uses VCSELs.",
        },
        {
          title: "Why SM runs farther",
          body:
            "No modal dispersion + lower attenuation at SM wavelengths (1310/1550 nm sit in fiber's low-loss windows) = light can travel tens of kilometers before the receiver loses the signal. MM at 850 nm attenuates faster *and* disperses, so ~400 m is the practical ceiling.",
        },
        {
          title: "Why MM is still everywhere in the DC",
          body:
            "Inside a data hall almost every link is shorter than 100 m. At those distances the MM optic's lower cost wins — you're buying thousands of transceivers. SM is reserved for the runs that actually need it: hall-to-hall, building-to-building, metro.",
        },
        {
          title: "The 125 μm cladding — why it's standard",
          body:
            "The cladding diameter matters for connectors, not light. Every LC/SC/MPO ferrule is precision-machined to hold a 125 μm strand. Standardizing the cladding means one connector family fits all SM and MM, regardless of core size.",
        },
        {
          title: "Jacket colors are documentation",
          body:
            "Yellow = SM, aqua = OM3/OM4, lime = OM5, orange = legacy OM1/OM2. The color isn't decoration — it's how a tech 30 feet up a ladder identifies the cable. Some sites add secondary colors (red = management, blue = production), but the jacket-color-by-grade convention is universal.",
        },
      ],
    },
    {
      kind: "heading", level: 3, text: "Name the parts",
    },
    {
      kind: "fill-blank",
      prompt:
        "Reading outward from the center of a fiber cable, fill in the four concentric parts:",
      sentence:
        "Light travels down the {0}. Around it sits the {1}, which has a lower refractive index and reflects light back inward. Outside that is a plastic {2} applied at the factory. The outermost layer you actually handle is the color-coded {3}.",
      blanks: [
        { answer: "core", hint: "center, carries light", alternates: ["Core"] },
        { answer: "cladding", hint: "reflects light", alternates: ["Cladding"] },
        { answer: "coating", hint: "plastic, factory-applied", alternates: ["Coating"] },
        { answer: "jacket", hint: "outer cable shell", alternates: ["Jacket", "outer jacket"] },
      ],
      reveal:
        "Core → cladding → coating → jacket. Core carries light, cladding reflects it via total internal reflection, coating protects the glass, jacket is the color-coded outer shell you see.",
    },
    {
      kind: "flip-cards",
      intro:
        "Two quick recall beats — try the front, flip to check.",
      cards: [
        {
          front: "Core sizes: single-mode vs multi-mode?",
          back:
            "**SM: ~9 μm** (one path, lasers only). **MM: 50 μm or 62.5 μm** (several paths, cheaper optics). Cladding is **125 μm** on both.",
        },
        {
          front: "Why does multi-mode have a distance limit?",
          back:
            "**Modal dispersion**. Light takes several paths through the wider core; paths of different lengths arrive at slightly different times, smearing the pulses. Past a few hundred meters the receiver can't tell fast pulses apart anymore.",
        },
        {
          front: "What's the visual quickest way to identify SM vs MM?",
          back:
            "**Jacket color**. Yellow = SM (OS2). Aqua = OM3/OM4. Lime green = OM5. Orange = legacy OM1/OM2.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You're handed a patch cable with an **aqua jacket** and LC connectors for a link inside the data hall. What does the jacket color tell you about the fiber, and what type of optic does it pair with?",
      choices: [
        { label: "A", text: "Aqua = single-mode; pair with an LR optic at 1310 nm" },
        { label: "B", text: "Aqua = OM3 or OM4 multi-mode (50/125 μm). Pair with a multi-mode optic — typically SR at 850 nm — since MM cables need MM-matched optics to link up" },
        { label: "C", text: "Aqua is cosmetic; any optic will work" },
        { label: "D", text: "Aqua = OS2 single-mode; pair with an ER optic" },
      ],
      correctAnswer: "B",
      explanation:
        "Jacket color is a reliable shorthand. Aqua means OM3 or OM4 — 50/125 μm multi-mode. Pair it with an 850 nm multi-mode optic (almost always SR). Mixing an SM optic onto MM fiber (or vice versa) is one of the classic \"link won't come up\" causes — the wavelength and core geometry simply don't match.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A junior tech plugs a single-mode (yellow) patch cord between two 10G-SR optics — which are designed for multi-mode. The switches show \"link down\" on both sides. Before they start rebooting things, what's the one sentence explanation and the one-cable fix?",
      hint: "SR optics are a specific wavelength designed for a specific core size.",
      answer:
        "The optics launch at **850 nm into a 9 μm core** they're not built for — wavelength is wrong and the geometry doesn't match, so almost no light couples through. 10G-SR is multi-mode only. The fix is one cable swap: replace the yellow SM patch with an aqua OM3/OM4 MM patch (or, if the run needs SM, replace the optics with 10G-LR and use the SM cable). Don't reboot; the optics are fine, the pairing is wrong.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain in one paragraph why single-mode fiber reaches 80 km while multi-mode struggles past 400 m — even though they're both \"just glass carrying light.\"",
      answer:
        "Two mechanisms combine. **Modal dispersion** is the big one: MM's wider core (50 or 62.5 μm) lets light travel several geometric paths of different lengths, so pulses arrive smeared and fast signals blur together past a few hundred meters. SM's 9 μm core allows essentially one path, so pulses stay crisp. **Attenuation** is the second: SM operates at 1310/1550 nm, which sit in fiber's lowest-loss windows (~0.35 and 0.25 dB/km), while MM at 850 nm loses ~3 dB/km. Put together: SM keeps its pulses sharp *and* loses less power per km. That's how the same physical glass gets two wildly different reach envelopes.",
    },
  ],
};

const fibS2: ChapterSection = {
  id: "fib-s2",
  topicId: "fiber",
  title: "Wavelengths, Grades & Why Fiber Wins",
  subtitle: "The three numbers that show up constantly — 850, 1310, 1550 — plus the OM/OS grades you'll read off every jacket.",
  icon: "◐",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Fiber choice is a **three-variable match**: wavelength, grade, optic. Get any one wrong and the link either refuses to come up or comes up flaky. This chapter gives you the shorthand — once you can read `10G-SR`, `OM4`, or `1310 nm` off a spec sheet and know exactly what cable and optic you need, you stop relying on other people for basic cable decisions. You'll also learn the one safety rule that applies every time you see a disconnected fiber: don't look into it.",
    },
    { kind: "heading", level: 3, text: "Three wavelengths you'll see daily" },
    {
      kind: "prose",
      html:
        "Light in fiber is measured in **nanometers (nm)**. Three numbers dominate operational work:",
    },
    {
      kind: "table",
      headers: ["Wavelength", "Fiber type", "What it drives"],
      rows: [
        ["**850 nm**", "Multi-mode", "Virtually every MM link inside the DC. If you see an SR (Short Reach) optic, it runs here."],
        ["**1310 nm**", "Single-mode", "Short-to-medium SM reach (up to ~10 km). LR optics run here."],
        ["**1550 nm**", "Single-mode", "Long-reach SM (40, 80 km+). ER and ZR optics. Also used in DWDM to pack many wavelengths on one fiber."],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Shorthand you can trust",
      body:
        "**SR** → 850 nm on multi-mode. **LR** → 1310 nm on single-mode. **ER / ZR** → 1550 nm on single-mode. That's it. You don't need to memorize the physics; you need to read the optic label and know what fiber it demands.",
    },
    { kind: "heading", level: 3, text: "OM grades — multi-mode, laser-optimized" },
    {
      kind: "table",
      headers: ["Grade", "Core", "Jacket", "Typical reach class", "Use"],
      rows: [
        ["**OM1**", "62.5/125", "Orange", "Lowest bandwidth", "Legacy — avoid for new installs"],
        ["**OM2**", "50/125", "Orange", "Low", "Legacy — avoid for new installs"],
        ["**OM3**", "50/125", "Aqua", "Laser-optimized", "10G to 300m, 40G/100G to 100m"],
        ["**OM4**", "50/125", "Aqua (or Erika violet)", "Higher", "10G to 400m, 40G/100G to 150m"],
        ["**OM5**", "50/125", "Lime green", "Wideband (WBMMF)", "Supports SWDM — more lanes per fiber"],
      ],
    },
    { kind: "heading", level: 3, text: "OS grades — single-mode" },
    {
      kind: "table",
      headers: ["Grade", "Jacket", "Attenuation", "Use"],
      rows: [
        ["**OS1**", "Yellow", "0.5–1.0 dB/km", "Legacy indoor"],
        ["**OS2**", "Yellow", "0.4 dB/km @ 1310 nm", "Current standard — indoor and outdoor"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Rule of thumb — modern DC defaults",
      body:
        "Inside the data hall, expect **OM4** (sometimes OM3) for short intra-rack and intra-hall runs. For anything between halls, between buildings, or pushing distance, expect **OS2**. If you see OM1 or OM2 orange on a new install, something's wrong — they're legacy.",
    },
    { kind: "heading", level: 3, text: "Why fiber — not copper — at DC scale" },
    {
      kind: "collapsible",
      intro:
        "Copper still wins for short, intra-rack links. Fiber wins for everything else — three reasons:",
      items: [
        {
          title: "Distance",
          body:
            "Copper Ethernet maxes out at **100 m** for most speeds. Fiber runs hundreds of meters (MM) to **tens of kilometers** (SM). A DC spans more than 100 m; fiber is the only option for anything crossing a hall.",
        },
        {
          title: "Bandwidth",
          body:
            "A single fiber strand carries **100 Gbps today** and scales via WDM (wavelength-division multiplexing) to terabits. Copper pairs struggle past 10–25 Gbps — beyond that you're stacking cables, not upgrading them.",
        },
        {
          title: "EMI immunity",
          body:
            "Fiber carries **light, not electricity**. Lightning, electrical noise, ground loops — none of it affects the signal. Critical in dense power environments where copper near a PDU bus can pick up interference.",
        },
        {
          title: "When copper still wins",
          body:
            "**DAC (Direct Attach Copper)** for short server-to-ToR links inside a rack — cheaper, lower latency, no transceiver power budget. That's its niche, and it's a real one.",
        },
      ],
    },
    {
      kind: "heading",
      level: 3,
      text: "Attenuation and dispersion — the two ways a link dies",
    },
    {
      kind: "prose",
      html:
        "**Attenuation** is signal loss as light travels. Measured in **dB/km**. Caused by absorption (glass impurities) and scattering. Longer runs = more attenuation. At some point the received signal falls below what the optic can detect, and the link dies.",
    },
    {
      kind: "prose",
      html:
        "**Dispersion** is signal **distortion** over distance. Pulses spread out; fast pulses overlap; the receiver can no longer tell them apart. Dispersion is why multi-mode can't do long runs even though light technically reaches the other end — the signal is there, but it's unreadable.",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Laser safety — never look into a fiber",
      body:
        "The light in production fiber is **invisible** — 850, 1310, and 1550 nm are all infrared, past what the eye can see. Lasers in production equipment are strong enough to damage your retina **before you feel anything**; your blink reflex never fires because there's nothing to react to. Before you inspect any fiber with a scope, confirm the other end is disconnected or powered off. Cap unused fibers immediately. The color-coded dust caps exist for a reason.",
    },
    {
      kind: "fill-blank",
      prompt:
        "Match the optic reach code to its wavelength and fiber type:",
      sentence:
        "An **SR** optic runs at {0} nm on {1}-mode fiber. An **LR** optic runs at {2} nm on {3}-mode fiber. A **ZR** optic runs at {4} nm on single-mode fiber, often in a DWDM system.",
      blanks: [
        { answer: "850", hint: "multi-mode default" },
        { answer: "multi", hint: "many paths", alternates: ["Multi", "MM", "mm"] },
        { answer: "1310", hint: "SM short-medium" },
        { answer: "single", hint: "one path", alternates: ["Single", "SM", "sm"] },
        { answer: "1550", hint: "SM long-haul" },
      ],
      reveal:
        "SR = 850 nm / multi-mode. LR = 1310 nm / single-mode. ZR = 1550 nm / single-mode. The letter tells you reach; the reach tells you wavelength; the wavelength tells you fiber type.",
    },
    {
      kind: "flip-cards",
      intro:
        "Quick recall on the two death modes of a link.",
      cards: [
        {
          front: "Attenuation — in one line?",
          back:
            "**Power loss per km**. The signal gets weaker as it travels. Eventually it falls below the receiver's sensitivity threshold and the link dies.",
        },
        {
          front: "Dispersion — in one line?",
          back:
            "**Pulses smearing**. The signal still reaches the other end, but pulses overlap and the receiver can't tell bits apart. This is what kills MM at long distances.",
        },
        {
          front: "What color is the OS2 jacket?",
          back: "**Yellow**. Current-standard single-mode, indoor and outdoor.",
        },
        {
          front: "If a cable is lime green, what is it?",
          back:
            "**OM5** (wideband multi-mode, WBMMF). Supports SWDM for more lanes per fiber at higher speeds.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You need to run a 10G link between two switches that are **400 meters apart**, cross-hall. You have both OM4 (aqua) and OS2 (yellow) in stock, plus 10G-SR, 10G-LR, and 10G-ER optics. What's the disciplined call?",
      choices: [
        { label: "A", text: "OM4 with 10G-SR at both ends. 10G-SR on OM4 is spec'd to 400 m — right at the edge but within the envelope. SM works too but uses pricier LR optics you don't need for that distance" },
        { label: "B", text: "OS2 with 10G-ER. ER is overkill but future-proof" },
        { label: "C", text: "OM4 with 10G-LR, since LR means Long Reach" },
        { label: "D", text: "Combine an SR optic on one end with an LR on the other" },
      ],
      correctAnswer: "A",
      explanation:
        "10G-SR on OM4 reaches **400 m** (and 300 m on OM3). At this distance MM is the cost-effective call — SR optics are significantly cheaper than LR. Choice C is wrong because LR is a single-mode optic; plugging it into MM fiber doesn't work. Choice D is a common trap: SR and LR are different wavelengths and fiber types; they can't talk to each other.",
    },
    {
      kind: "think-about-it",
      scenario:
        "An installer proposes running OM4 between two data halls **2 km** apart because \"OM4 handles 100G and the cable is cheap.\" What's wrong with this plan, and what's the actual right-sized proposal?",
      hint: "OM4's 100G reach is 150 m, not 2 km. What physics does 2 km demand?",
      answer:
        "OM4's 100G reach is **150 m, not 2 km**. Over 2 km, MM dispersion and attenuation will shred the signal well before it gets there. This is single-mode territory: pull **OS2 (yellow)** and use **100G-LR4** optics (1310 nm, rated to 10 km). The cable-per-meter is similar; the optics are pricier, but they're the only ones that work at this distance. The \"OM4 is cheap\" instinct is correct for a 50 m run — it's a categorical mismatch for 2 km.",
    },
    {
      kind: "knowledge-check",
      question:
        "You're explaining to a new tech why we can't \"just use OM4 everywhere to keep it simple\" — specifically, why OS2 exists at all in a modern DC. Give them the short answer in terms of attenuation and dispersion.",
      answer:
        "OM4 is 50/125 multi-mode, running at 850 nm, with meaningful modal dispersion and ~3 dB/km of attenuation. Past a few hundred meters the pulses smear and the signal weakens enough that even a sensitive receiver can't lock on — it's a physics limit, not a budget one. OS2 is 9/125 single-mode, running at 1310 or 1550 nm in the fiber's low-loss windows (~0.35 and 0.25 dB/km) with essentially no modal dispersion because only one path exists. That combination is the only way to reach hall-to-hall, campus, or metro distances. OS2 exists for the runs where OM4 physically can't deliver a readable signal — not to be fancy, but to solve an actual distance problem that MM can't.",
    },
  ],
};

// ── fib-m02 Connectors & Transceivers ─────────────────────────────────────

const fibS3: ChapterSection = {
  id: "fib-s3",
  topicId: "fiber",
  title: "Connectors, Polish & Polarity",
  subtitle: "LC, SC, MPO — plus the blue-vs-green rule that saves connectors and the MPO polarity that silently kills links.",
  icon: "◇",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Every fiber ends in a connector, and every connector plugs into something. Pick the wrong one and the link does not come up — or, worse, it *does* come up but is subtly degraded. DC techs deal with this matrix every day: what cable, what connector, what optic, what speed. Knowing the pieces makes the decisions fast. And knowing **UPC vs APC** and **MPO polarity** will save you from two of the most embarrassing silent failures in the trade.",
    },
    { kind: "heading", level: 3, text: "Connector families you'll encounter" },
    {
      kind: "table",
      headers: ["Connector", "Latch", "Fibers", "Where you'll see it"],
      rows: [
        ["**LC** (Lucent Connector)", "Push-pull", "1 or 2 (duplex)", "Dominant in modern DCs. Almost every patch cord is LC-LC duplex."],
        ["**SC** (Subscriber Connector)", "Push-pull", "1 or 2", "Older installs, carrier handoffs, service provider demarcs."],
        ["**FC / ST**", "Screw / bayonet", "1", "Legacy. Telco demarcs, old carrier gear. Rare in modern DCs."],
        ["**MPO / MTP**", "Push-on", "8, 12, 16, or 24 in one ferrule", "40G, 100G, 400G parallel optics and high-density trunks. Rectangular ferrule."],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "MPO vs MTP — same keyway, different tolerances",
      body:
        "**MPO** is the generic standard. **MTP** is US Conec's branded, tighter-tolerance version. They **mate with each other**, but MTP has better alignment and pin retention. When you see \"MTP\" on a spec sheet, it's MPO plus better engineering — no need to overthink it.",
    },
    {
      kind: "collapsible",
      intro:
        "Quick deep-dive on each family:",
      items: [
        {
          title: "LC — the default",
          body:
            "Small form factor, square push-pull latch, **1.25 mm ferrule**. Duplex LC is two ferrules clipped side-by-side — one TX, one RX. Fits the SFP, SFP+, SFP28, QSFP28 (for LR4 optics), etc. If you see a patch cord in the DC, it's almost certainly LC.",
        },
        {
          title: "SC — the older cousin",
          body:
            "Larger than LC, push-pull, **2.5 mm ferrule**. Common on legacy equipment and carrier demarcs. Rarely used for new builds inside a DC, but every tech sees them at some point.",
        },
        {
          title: "MPO — the parallel-optics workhorse",
          body:
            "12-fiber is the classic layout; 24-fiber for higher density; 8 and 16 for newer form factors. One rectangular ferrule. Breakout modules fan MPO → multiple LC duplex pairs. 40G-SR4, 100G-SR4, and 400G-SR8 optics plug directly into MPO.",
        },
        {
          title: "Simplex vs duplex",
          body:
            "**Simplex** = one fiber in one connector, one direction. **Duplex** = two fibers joined (one TX, one RX). In the DC, duplex is the default — every link needs both directions. MPO carries many fibers and is inherently \"multiplex.\"",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Polish — UPC (blue) vs APC (green)" },
    {
      kind: "prose",
      html:
        "Some connectors are **blue**, some are **green**. That's not decoration — it tells you the end-face geometry, and mixing them damages both connectors.",
    },
    {
      kind: "table",
      headers: ["", "UPC (Ultra Physical Contact)", "APC (Angled Physical Contact)"],
      rows: [
        ["**End face**", "Polished flat (slight dome)", "Polished at **8° angle**"],
        ["**Color code**", "Blue (SM) or beige (MM)", "Green"],
        ["**Reflectance**", "Higher", "Lower (better)"],
        ["**Typical use**", "Most DC links", "High-sensitivity — RF over fiber, PON, DWDM"],
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Never mate UPC to APC",
      body:
        "The 8° angled face of an APC will **not sit flat** against the flat UPC face. They touch at wrong angles, **damage each other's end faces**, and perform badly even if the link technically comes up. If a patch cable is green on one end and blue on the other (it exists — hybrid patches), those are two different endpoints by design. Never plug a cable's two ends into the same adapter type.",
    },
    { kind: "heading", level: 3, text: "MPO polarity — the gotcha" },
    {
      kind: "prose",
      html:
        "A 12-fiber MPO has 12 positions. For a link to work, **TX fibers at one end must land on RX fibers at the other**. Straight-through cabling would cross TX → TX, which doesn't work. The industry defines three polarity methods to solve this:",
    },
    {
      kind: "code",
      label: "THE THREE MPO POLARITY TYPES",
      language: "text",
      code:
        "  TYPE A — Straight-through\n  pin 1  →  pin 1\n  pin 2  →  pin 2          needs a polarity flip somewhere\n  ...                       else (in a patch cord or adapter)\n  pin 12 →  pin 12\n\n  TYPE B — Reversed\n  pin 1  →  pin 12\n  pin 2  →  pin 11         the cable itself does the flip\n  ...\n  pin 12 →  pin 1\n\n  TYPE C — Pair-flipped\n  pin 1  ↔  pin 2          pairs are crossed at the cable level\n  pin 3  ↔  pin 4          (1↔2, 3↔4, 5↔6, ...)\n  ...",
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "Rule of thumb — most modern DCs use Type B",
      body:
        "If you're pulling pre-terminated MPO trunks and a 100G link won't come up, **polarity is the first thing to check**. The optic will typically report `rx LOS` (loss of signal) even though light is getting through — just on the wrong fibers. Grab a **VFL** (visual fault locator — a pocket red laser) and shine into fiber 1 at one end. Whichever fiber glows at the far end tells you the polarity type instantly.",
    },
    {
      kind: "fill-blank",
      prompt:
        "Apply the color and polish rules:",
      sentence:
        "A blue LC connector is polished {0}; a green LC connector is polished at an {1}° angle. Mating a blue to a green will {2} both end faces. MPO trunks in most modern data centers use Type {3} polarity, which has the cable itself do the TX/RX flip.",
      blanks: [
        { answer: "flat", hint: "UPC geometry", alternates: ["UPC", "straight"] },
        { answer: "8", hint: "APC angle in degrees" },
        { answer: "damage", hint: "physical harm", alternates: ["ruin", "scratch", "destroy"] },
        { answer: "B", hint: "reversed polarity", alternates: ["b"] },
      ],
      reveal:
        "Blue = UPC = flat. Green = APC = 8°. Mixing them damages both. Most modern DCs standardize on Type B MPO polarity (the cable itself reverses pin 1↔12, 2↔11, etc.).",
    },
    {
      kind: "flip-cards",
      intro:
        "Two quick recall beats on the connector family.",
      cards: [
        {
          front: "What is a duplex LC?",
          back:
            "Two LC ferrules clipped side-by-side — **one TX, one RX**. The most common patch cord end in a modern DC.",
        },
        {
          front: "How many fibers in a standard MPO?",
          back:
            "**12** is the classic count. 24 for higher density. 8 and 16 exist for newer optics (400G QSFP-DD uses 16-fiber MPO for SR8).",
        },
        {
          front: "How do you quickly check MPO polarity without a switch?",
          back:
            "**Visual Fault Locator (VFL)** — a pocket red laser at 650 nm (visible light). Shine into fiber 1 at one end; watch which fiber glows at the far end.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A 100G-SR4 trunk just installed between two racks won't come up. Both optics power on, no alarms, DDM shows the transmitters are laughing. The switch logs show `rx LOS` on both ends. What's the most likely cause and the fastest check?",
      choices: [
        { label: "A", text: "Both optics are dead. Swap both." },
        { label: "B", text: "**MPO polarity mismatch** — the TX fibers at one end aren't landing on the RX fibers at the other, so each optic is transmitting happily but nothing is arriving at its own receiver. Fastest check: grab a VFL, shine into fiber 1 at one end, see which fiber glows at the other end. If it's not the polarity type the trunk was supposed to be, order a polarity-flip patch or swap the trunk" },
        { label: "C", text: "Wrong wavelength — 100G-SR4 needs LR optics" },
        { label: "D", text: "The fiber is bent; reseat it" },
      ],
      correctAnswer: "B",
      explanation:
        "TX transmitting + RX LOS on both ends is the signature of polarity mismatch. Both optics are lighting up; light is reaching the other fiber — but arriving on the wrong lane. VFL is the 10-second diagnostic. Choice A is a waste of optics; C is a wavelength confusion; D doesn't explain the symmetric failure.",
    },
    {
      kind: "think-about-it",
      scenario:
        "A new hire opens a drawer and finds a patch cable with a **green connector on one end and a blue connector on the other**. They ask if it's defective and plug the green end into a green adapter on the panel, then try to plug the blue end into a blue adapter on the same side of the panel. What's going on, and what's the correct usage?",
      hint: "Hybrid patches exist on purpose. The color isn't the cable's identity — it's each end's identity.",
      answer:
        "It's a **hybrid UPC-APC patch**, on purpose. Those cables exist when one side of a link uses APC (green) — often because it's hooked into a DWDM system or a PON feed — and the other side uses UPC (blue) on standard DC equipment. Each end is designed for a specific adapter type. The correct usage is **green end → green adapter at the APC side of the link**, **blue end → blue adapter at the UPC side of the link**. Never plug both ends into the same type of adapter; the mismatch at one end will damage the face. The cable's color change is documentation, not a defect.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain in one paragraph why MPO polarity is a real operational problem — why you can't just \"plug it in and see if it works,\" and why a VFL matters more than a tester for this specific failure.",
      answer:
        "An MPO trunk carries 12 parallel fibers in one ferrule. For a 100G-SR4 link, the optic lights up four of them as TX and expects four different ones to arrive as RX. If the polarity is wrong, the TX at end A lands on a TX-expected fiber at end B (instead of the RX-expected one) — so light is passing through the fiber perfectly, but each optic's receiver sees nothing. Both transmitters look healthy on DDM; both receivers report LOS. A link tester that only checks \"is there light somewhere\" will falsely report a working cable, because light *is* getting through. A VFL is decisive: shine red light into fiber 1 at one end, and which fiber lights up at the other end tells you the polarity type instantly. Polarity is a wiring-diagram problem, not a power problem, so it needs a wiring-diagram tool.",
    },
  ],
};

const fibS4: ChapterSection = {
  id: "fib-s4",
  topicId: "fiber",
  title: "Transceivers — SFP to OSFP",
  subtitle: "The optic matrix: form factor, speed, reach code, and when to skip optics entirely for DAC or AOC.",
  icon: "◓",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "A **transceiver** (optic, module, pluggable — same thing) is the device that converts electrical signals from the switch or NIC into light and back. Every link in the DC needs two of them, one at each end, matched to the fiber. This is the chapter where the alphabet soup — SFP, QSFP, QSFP28, QSFP-DD, SR4, LR4, ZR — stops being intimidating. You read the label, you know the cable, the speed, and the reach. That's the whole skill.",
    },
    { kind: "heading", level: 3, text: "Form factors — the alphabet" },
    {
      kind: "table",
      headers: ["Form factor", "Speed", "Lanes", "Typical use"],
      rows: [
        ["**SFP**", "1 Gbps", "1", "1G Ethernet, legacy"],
        ["**SFP+**", "10 Gbps", "1", "10G Ethernet"],
        ["**SFP28**", "25 Gbps", "1", "25G Ethernet — server-to-ToR"],
        ["**QSFP+**", "40 Gbps", "4 × 10G", "40G Ethernet, breakout to 4×10G"],
        ["**QSFP28**", "100 Gbps", "4 × 25G", "100G Ethernet, breakout to 4×25G"],
        ["**QSFP56**", "200 Gbps", "4 × 50G", "200G Ethernet"],
        ["**QSFP-DD**", "400 Gbps", "8 × 50G", "400G, backward compatible with QSFP28"],
        ["**OSFP**", "400 / 800 Gbps", "8 × 50G/100G", "400G and 800G, NOT backward compatible with QSFP"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "QSFP = Quad SFP — the name is the math",
      body:
        "**QSFP28** is literally *four SFP28s in one package* — four lanes × 25 Gbps = 100 Gbps usable. **QSFP-DD** (Double Density) doubles the lane count to 8. Once you see the pattern, every new form factor makes sense: add letters, add lanes, add speed.",
    },
    { kind: "heading", level: 3, text: "Reach codes" },
    {
      kind: "table",
      headers: ["Code", "Meaning", "Typical reach", "Fiber"],
      rows: [
        ["**SR**", "Short Reach", "100–400 m", "Multi-mode (850 nm)"],
        ["**LR**", "Long Reach", "10 km", "Single-mode (1310 nm)"],
        ["**ER**", "Extended Reach", "40 km", "Single-mode (1550 nm)"],
        ["**ZR**", "Extremely long", "80+ km", "Single-mode, often DWDM"],
        ["**SR4 / LR4**", "4 lanes", "Varies by base", "SR4 = MPO multi-mode; LR4 = LC single-mode with 4 wavelengths"],
      ],
    },
    {
      kind: "prose",
      html:
        "A **100G-SR4** is a QSFP28 optic running over **four lanes of multi-mode** fiber via an **MPO** connector. A **100G-LR4** is the same 100G QSFP28 over a **single LC duplex pair** of single-mode, using **four wavelengths** multiplexed onto the same fiber. The \"4\" means *four lanes* — the lanes just happen physically (four fibers) or via WDM (four colors on one pair).",
    },
    { kind: "heading", level: 3, text: "DAC, AOC, optical — pick the right hammer" },
    {
      kind: "collapsible",
      intro:
        "Not every short link needs a full optical transceiver. Three options:",
      items: [
        {
          title: "DAC (Direct Attach Copper)",
          body:
            "A **copper cable with integrated transceiver ends** — no optics, no fiber. Typically up to **~7 m**. Cheapest option for server-to-ToR links inside a rack, lowest latency (no optical conversion). Comes as passive (short) or active (longer). The default for intra-rack 10G / 25G / 100G links.",
        },
        {
          title: "AOC (Active Optical Cable)",
          body:
            "A **fiber cable with integrated transceiver ends, permanently bonded**. Reach up to ~100 m. Lighter and more flexible than DAC over long pulls. The trade: one end dies → **you replace the whole cable**. Cannot be reterminated or split.",
        },
        {
          title: "Optical transceiver + fiber patch",
          body:
            "Separate optics and fiber. Most flexible — swap fibers without touching optics, and vice versa. Required for anything beyond AOC reach. Higher cost per link, but the parts are independently replaceable and the fiber is structured.",
        },
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Picking the right hammer",
      body:
        "**DAC inside the rack. AOC across the row** (if budget allows). **Optical** for anything longer, or any run that'll ever be re-patched or reterminated. Don't use AOC for anything that crosses panels — one bad connector means replacing the whole cable.",
    },
    { kind: "heading", level: 3, text: "Coded vs generic optics" },
    {
      kind: "prose",
      html:
        "Vendor optics carry a **vendor ID in their firmware**. Some switches (Cisco, Juniper, Arista) **refuse** to accept optics whose ID doesn't match the chassis brand. \"Coded\" optics from third parties include the ID matching the target switch to pass this check. A generic optic will **fail to come up** on a picky switch even though it's physically and electrically fine.",
    },
    {
      kind: "prose",
      html:
        "When you order third-party optics, you'll see SKUs like \"Cisco-coded,\" \"Arista-coded,\" \"Juniper-coded.\" Pick the code that matches your switch. **MSA** (Multi-Source Agreement) means the physical and electrical spec is standardized — but the vendor-lock firmware check is separate from MSA compliance. An optic can be 100% MSA-compliant and still refuse to come up because of the code byte.",
    },
    { kind: "heading", level: 3, text: "DDM / DOM — reading optic health" },
    {
      kind: "prose",
      html:
        "Modern optics support **Digital Diagnostic Monitoring** (aka DOM). The switch queries the optic for live telemetry — TX power, RX power, temperature, bias current, supply voltage. Any of these out of range means the optic is dying, overheating, or receiving a bad signal.",
    },
    {
      kind: "code",
      label: "READING DDM ON DIFFERENT SWITCHES",
      language: "bash",
      code:
        "# Cisco IOS-XE / NX-OS\nshow interface Ethernet1/1 transceiver details\n\n# Arista EOS\nshow interface Ethernet1/1 transceiver dom\n\n# Linux host — NIC-attached optic\nethtool -m eth0            # full optic info + DDM\nethtool -m eth0 | grep -E 'TX power|RX power|Temperature'",
    },
    {
      kind: "fill-blank",
      prompt:
        "Decode the optic labels. For each label, name the form factor, lanes, speed, and fiber type:",
      sentence:
        "A **100G-SR4** is a {0} optic running at {1} Gbps across {2} lanes on {3}-mode fiber via an MPO connector. A **100G-LR4** is the same form factor and speed, but runs on a single {4} duplex pair of {5}-mode fiber using four multiplexed wavelengths.",
      blanks: [
        { answer: "QSFP28", hint: "100G form factor", alternates: ["qsfp28"] },
        { answer: "100", hint: "label says 100G" },
        { answer: "4", hint: "the \"4\" in SR4" },
        { answer: "multi", hint: "MPO + 850 nm", alternates: ["Multi", "MM"] },
        { answer: "LC", hint: "standard duplex connector", alternates: ["lc"] },
        { answer: "single", hint: "LR = long reach", alternates: ["Single", "SM"] },
      ],
      reveal:
        "100G-SR4 = QSFP28, 100G, 4 lanes, multi-mode via MPO. 100G-LR4 = QSFP28, 100G, 4 lanes, single-mode via LC duplex using four wavelengths (WDM). Same form factor and speed; different fiber and connector strategy.",
    },
    {
      kind: "flip-cards",
      intro:
        "Quick recall on the three cable-strategy options.",
      cards: [
        {
          front: "DAC — when to use it?",
          back:
            "**Inside a rack, short links (≤7 m)**. Cheapest, lowest latency, no optical conversion. The default for server-to-ToR 25G/100G in the same rack.",
        },
        {
          front: "AOC — when to use it?",
          back:
            "**Across the row, up to ~100 m**. Fiber cable with integrated transceiver ends. Lighter than DAC at length. Trade: one end dies, replace the whole cable.",
        },
        {
          front: "What does QSFP-DD stand for, and how many lanes?",
          back:
            "**Quad SFP — Double Density**. Eight lanes instead of four. Used for 400G. Backward-compatible with QSFP28 ports at 100G.",
        },
        {
          front: "What does DDM / DOM report?",
          back:
            "**TX power, RX power, temperature, bias current, supply voltage**. Any out of range = optic dying, overheating, or receiving bad signal.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "You need to connect a server's NIC to the ToR switch **2 meters away, at 100G**. Budget is tight and you don't anticipate ever breaking this cable down. What's the right call?",
      choices: [
        { label: "A", text: "100G-SR4 optics on both ends with an MPO patch cable" },
        { label: "B", text: "100G-LR4 optics with OS2 single-mode" },
        { label: "C", text: "A **100G DAC** (Direct Attach Copper). At 2 m inside a rack, DAC is the cheapest option (no optics), lowest latency, and needs no transceiver power budget. The \"don't need to break it down\" criterion rules out the only reason you'd pick AOC or optical over DAC" },
        { label: "D", text: "100G AOC — the optical version is always better" },
      ],
      correctAnswer: "C",
      explanation:
        "Inside a single rack at 2 m, DAC is strictly the cheapest, lowest-latency, most power-efficient choice. AOC makes sense at longer runs across a row (up to ~100 m); SR4 optics are wasted inside a rack; LR4 is wildly wrong for 2 m. The only time you skip DAC inside a rack is when you need flexible re-patching (rare) or you need longer than ~7 m (then AOC).",
    },
    {
      kind: "think-about-it",
      scenario:
        "You drop in a third-party 100G-SR4 QSFP28 optic on a fresh Cisco switch. It's the exact same part number as a Cisco-branded optic a colleague used last week, but the switch reports `unsupported transceiver` and keeps the port down. The optic is physically fine. What's the most likely cause and the fix?",
      hint: "MSA compliance and vendor firmware check are two different things.",
      answer:
        "The optic is probably **not \"Cisco-coded\"** — even though it's MSA-compliant and physically identical, the vendor-ID byte in its firmware doesn't match what Cisco expects, so Cisco refuses to bring the port up. The fix is either (a) order a Cisco-coded variant from the third-party vendor (most reputable third parties sell the same optic in multiple coding flavors), (b) enable the `service unsupported-transceiver` override on the switch if policy allows it, or (c) use Cisco-branded optics. Don't swap the optic to another port and expect a different result — every Cisco port runs the same vendor check.",
    },
    {
      kind: "knowledge-check",
      question:
        "A colleague says \"an optic is an optic; MSA means they all work anywhere.\" Why is that wrong in a practical sense, and what does an MSA actually guarantee?",
      answer:
        "MSA (Multi-Source Agreement) standardizes the **physical form factor, electrical interface, and pinout** — any MSA-compliant QSFP28 will fit any QSFP28 port and electrically signal correctly. What MSA does **not** cover is the **vendor firmware check** many switches enforce. Cisco, Arista, and Juniper each look at an ID byte in the optic's EEPROM and refuse to enable ports that present an unexpected value. A third-party optic can be 100% MSA-compliant and still be rejected by the switch. That's why third-party SKUs are sold in \"Cisco-coded,\" \"Arista-coded,\" and \"Juniper-coded\" variants — same hardware, different ID byte. The practical rule: MSA means it'll fit and signal, not that the switch will accept it.",
    },
  ],
};

// ── fib-m03 Cable Management ──────────────────────────────────────────────

const fibS5: ChapterSection = {
  id: "fib-s5",
  topicId: "fiber",
  title: "Trunks, Patches & Bend Radius",
  subtitle: "The two-layer pattern that keeps DCs sane, and the bend rule every tech breaks once.",
  icon: "◔",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "A DC with good cable management stays healthy for years. A DC with bad cable management is a drag on every team — techs can't trace links, cables get pinched, airflow chokes, and simple changes turn into risky ones. Your cabling work is **visible for the life of the equipment**. Getting bend radius and slack right isn't aesthetic — a too-tight bend introduces loss that shows up in DDM readings a month later and gets blamed on the optic.",
    },
    { kind: "heading", level: 3, text: "Trunks and patches — two different jobs" },
    {
      kind: "table",
      headers: ["", "Trunk cable", "Patch cable (jumper)"],
      rows: [
        ["**Length**", "Long (10s–100s of m)", "Short (0.5–10 m)"],
        ["**Format**", "Often MPO, high fiber count", "Duplex LC typical"],
        ["**Termination**", "Factory, pre-terminated", "Factory, sold by length"],
        ["**Handled**", "Installed once, left in place", "Moved during MACs (moves/adds/changes)"],
        ["**Route**", "Between patch panels, halls, rows", "Patch panel ↔ active equipment"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The two-layer pattern",
      body:
        "**Trunks handle the permanent infrastructure. Patches handle the flexibility.** Trunks run between patch panels and get left alone. Patch cords are what you pull in and out during moves, adds, and changes. The trunk-and-patch pattern lets you rearrange connections without ever re-pulling long cables — which is why every DC is built this way.",
    },
    { kind: "heading", level: 3, text: "Bend radius — the rule every new tech breaks once" },
    {
      kind: "prose",
      html:
        "Fiber does not like tight bends. A sharp curve creates **macro-bending loss** — light leaks out at the bend because the angle exceeds the total-internal-reflection threshold. Bad enough bends **crack the glass inside the jacket**, permanently destroying the fiber. The cable still looks fine from the outside; the link is just broken.",
    },
    {
      kind: "code",
      label: "MINIMUM BEND RADIUS",
      language: "text",
      code:
        "  Static (installed, not moving):    10 × cable outer diameter\n  Dynamic (being pulled or flexed):  20 × cable outer diameter\n\n  For a 3 mm duplex LC patch cable:\n    Static:  10 × 3 mm = 30 mm   (golf-ball sized)\n    Dynamic: 20 × 3 mm = 60 mm   (baseball sized)",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "\"Bend-insensitive fiber\" is not \"bend-proof fiber\"",
      body:
        "Modern **BIF** (bend-insensitive fiber) tolerates tighter bends than standard fiber — often down to 7.5 mm or even 5 mm radius — but **still has limits**. Always check the cable spec before you route it around a tight corner. And never bet on BIF unless you know for a fact the cable is BIF; most DC cables still aren't.",
    },
    {
      kind: "collapsible",
      intro:
        "What actually happens inside a too-tightly-bent fiber:",
      items: [
        {
          title: "Macro-bending loss (the subtle one)",
          body:
            "At a bend, some light rays hit the core/cladding boundary at an angle less than the critical angle and **leak into the cladding instead of reflecting back**. The fiber \"works\" but with measurable attenuation loss — 0.5–3 dB per sharp bend. Enough of these, or one bad one on a marginal link, and the receiver falls below sensitivity.",
        },
        {
          title: "Stress-induced microcracks (the silent killer)",
          body:
            "A tight bend over time causes **microcracks in the glass**. The fiber continues to work — then fails catastrophically weeks or months later when a microcrack propagates. By the time it fails, nobody remembers who bent it.",
        },
        {
          title: "Jacket indentation from zip-ties (the avoidable one)",
          body:
            "**Never over-tighten zip-ties on fiber.** A compressed jacket squeezes the cladding and creates the same effect as a bend. Use hook-and-loop (Velcro) straps for fiber. If you use zip-ties at all, they should be snug enough to hold but loose enough to slide along the cable.",
        },
        {
          title: "What \"tight corner\" looks like",
          body:
            "A 3 mm patch cable turning a **90° corner over a sharp panel edge** often bends tighter than 30 mm. Use a **bend-radius guide** (a curved plastic fitting) at every edge. A guide forces a gentle arc even when the tech routing the cable is in a hurry.",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Slack management — not too tight, not too loose" },
    {
      kind: "prose",
      html:
        "You need slack in a cable for three reasons: to let equipment slide out for service, to allow future reconfiguration, and to keep tension off the connectors. The wrong amount bites both directions.",
    },
    {
      kind: "table",
      headers: ["Failure mode", "Symptom", "Fix"],
      rows: [
        ["**Too tight**", "Strain on connectors; eventual connector damage; no service slack", "Add a service loop in the rear cable manager"],
        ["**Too loose**", "Tangled mess; hard to trace; blocked airflow", "Coil the excess into a neat figure-8 or small loop"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The \"3–6 inches of pull-out\" rule",
      body:
        "The right slack is \"enough to pull the server forward 3–6 inches without tension on the connector.\" That's about **150 mm** of slack per cable, coiled into a neat loop in the rear cable manager. A small figure-eight beats a tight coil (which violates bend radius) and a bird's-nest (which blocks airflow and traps heat).",
    },
    {
      kind: "fill-blank",
      prompt:
        "Apply the bend-radius math to a 3 mm duplex LC patch cable:",
      sentence:
        "The minimum **static** bend radius is {0} mm — about the size of a {1} ball. The minimum **dynamic** bend radius (during pulling or flexing) is {2} mm. Over-tightened zip-ties cause the same kind of loss as a {3} bend. For fiber, use {4} straps instead.",
      blanks: [
        { answer: "30", hint: "10 × 3 mm" },
        { answer: "golf", hint: "small sports ball", alternates: ["Golf"] },
        { answer: "60", hint: "20 × 3 mm" },
        { answer: "tight", hint: "adjective for too-sharp", alternates: ["sharp", "too-tight"] },
        { answer: "Velcro", hint: "hook-and-loop brand", alternates: ["velcro", "hook-and-loop"] },
      ],
      reveal:
        "3 mm patch: 30 mm static / 60 mm dynamic. Tight zip-ties squeeze the jacket and cause macro-bending loss. Use Velcro / hook-and-loop for fiber — never over-tightened zip-ties.",
    },
    {
      kind: "flip-cards",
      intro:
        "Two quick recall beats on routing.",
      cards: [
        {
          front: "Trunk vs patch — what's each for?",
          back:
            "**Trunk** = long, often multi-fiber MPO, **installed once** between patch panels. **Patch** = short LC duplex, **moved during MACs** between panel and equipment.",
        },
        {
          front: "Why the 80° angled bends at a panel edge can silently kill a link",
          back:
            "That kind of bend often exceeds minimum radius. It causes **macro-bending loss** (0.5–3 dB per bend) — not enough to fail the link today, but enough to eat the budget for a marginal run, or to develop into microcracks weeks later.",
        },
        {
          front: "How much slack per cable behind a rackmount server?",
          back:
            "Enough to **pull the server forward 3–6 inches** (~150 mm) without tension on the connector. Coiled neatly into a figure-8 or small loop in the rear cable manager.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A tech cleans up a rack by replacing loose coils with tightly-wound **3-inch diameter loops** (≈76 mm) secured with zip-ties, then zip-ties every bundle firmly against the vertical cable manager. The rack looks beautiful. Two weeks later, three links on that rack develop intermittent CRC errors. What happened?",
      choices: [
        { label: "A", text: "The zip-ties caused electrical interference" },
        { label: "B", text: "**Two bend-radius problems at once.** 76 mm diameter = 38 mm radius, tight but within spec for a 3 mm patch cable — so not the loops themselves. The bigger issue is the **tightly-zip-tied bundles**: over-compressed jackets act like distributed micro-bends, each adding a fraction of a dB of loss. Multiple links crossed the marginal budget and started erroring. Replace zip-ties with Velcro (hook-and-loop) and loosen every bundle" },
        { label: "C", text: "The optics aged out simultaneously" },
        { label: "D", text: "The patch cords are defective from the factory" },
      ],
      correctAnswer: "B",
      explanation:
        "Over-tight zip-ties are the single most common cause of post-cleanup link degradation. Compressed fiber jackets create distributed macro-bending loss — each cable loses a little power, then a little more, until some marginal links cross the threshold. The fix is always the same: hook-and-loop straps, never over-tightened. A neat rack that errors isn't neat — it's a hidden time bomb.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You inherit a rack that works but looks terrible — cables draped, no clear trunk/patch separation, some cables running through the hot aisle to the front of a neighboring rack. Your manager wants a cleanup done over the weekend. Before you touch anything, what are the three things you check or document?",
      hint: "The risk in a cleanup is accidentally pulling a cable that's currently carrying production traffic.",
      answer:
        "First: **label every cable end-to-end before you touch anything**, so you know what each one connects. Second: **check optical power / DDM on every link** (`show interface transceiver` or `ethtool -m`) — you want a baseline *before* so you can verify *after* that no link regressed. Third: **confirm change-management approval** for the work — a cleanup is still a change, and accidentally unplugging a production link during a Saturday rearrangement is still a P1. With those three in hand, you can re-route cables through proper managers, replace zip-ties with Velcro, and add service loops — and prove afterward that nothing got worse in the process.",
    },
    {
      kind: "knowledge-check",
      question:
        "Explain why the trunk-and-patch pattern exists and why a DC that skips it (running cables directly from switch ports to servers) ends up slower to change, more fragile, and harder to troubleshoot over time.",
      answer:
        "Trunks are the **permanent infrastructure layer** — they're pulled once, tested, and left alone. Patches are the **flexible layer** — short cords between a patch panel and active equipment, designed to be moved during moves/adds/changes (MACs). Skipping the pattern and running direct cables from switch to server means every change requires re-pulling a full-length cable, which is slow (more work per change), risky (more opportunities to disturb other cables), and destroys the \"troubleshooting decoupling point\" a patch panel provides. When a link goes down in a direct-wired topology, you have to trace the whole physical run; with trunks and patches, you can isolate the link at the panel in under a minute. The pattern also makes trunks **test-once-leave-alone** — you certify them at install time and never re-characterize, while patches are cheap commodities you swap freely. Skipping it feels simpler on day one and painful by month six.",
    },
  ],
};

const fibS6: ChapterSection = {
  id: "fib-s6",
  topicId: "fiber",
  title: "Labels, Color, Panels & Breakouts",
  subtitle: "If it's not labeled, it's invisible — plus the patch-panel architecture and breakout cables that make dense DCs possible.",
  icon: "◕",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "In a densely populated rack, a cable that isn't labeled is a cable you can't safely touch. When a link fails at 02:00 and you're staring at 48 identical aqua jumpers, the only thing standing between you and a wrong-cable-unplugged outage is the **label**. This chapter is about the documentation disciplines that turn a rack from chaos to navigable: labels, jacket colors, structured cabling, and the breakout cables that take one dense port and fan it out into four or eight usable ones.",
    },
    { kind: "heading", level: 3, text: "Labels — both ends, near the connector" },
    {
      kind: "prose",
      html:
        "Label **every** cable, patch cord, and port. If a cable isn't labeled, a future tech can't safely touch it — and \"let's just trace it\" is how outages start.",
    },
    {
      kind: "code",
      label: "WHAT GOES ON A LABEL",
      language: "text",
      code:
        "  Format: <source>  →  <destination>\n\n  Example:\n    SRV-R12-07:NIC2  →  TOR-R12-A:Eth1/7\n\n  Labels go on BOTH ENDS, close to the connector,\n  on a heat-shrink sleeve or printed flag tag —\n  NOT in the middle of the cable (invisible when installed).",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "Use a real label printer — not a Sharpie",
      body:
        "Cheap label makers and handwritten tags do not survive data hall conditions. Use a **fiber-optic-rated label printer** (Brady, Brother). The labels need to be heat- and solvent-resistant, legible from 6 feet up a ladder, and firmly attached so they don't slide down the cable. A good labeling kit is one of the cheapest ways to make a whole rack serviceable for years.",
    },
    { kind: "heading", level: 3, text: "Color coding — part of the documentation" },
    {
      kind: "prose",
      html:
        "Jacket color tells a ladder-height tech what kind of fiber they're looking at. In modern practice:",
    },
    {
      kind: "table",
      headers: ["Jacket color", "Means"],
      rows: [
        ["**Aqua**", "OM3 or OM4 multi-mode"],
        ["**Lime green**", "OM5 multi-mode (wideband)"],
        ["**Yellow**", "OS2 single-mode (current standard)"],
        ["**Orange**", "OM1 or OM2 legacy multi-mode"],
        ["**Erika violet**", "OM4+ (some vendors)"],
      ],
    },
    {
      kind: "prose",
      html:
        "Some sites also use jacket color to indicate **network segment** — e.g., red for management, blue for production, white for storage. This layer is site-specific. Check your site's cabling standard before you order, or you'll end up with a pile of green OS2 patches that nobody knows what to do with.",
    },
    { kind: "heading", level: 3, text: "Patch panels and structured cabling" },
    {
      kind: "prose",
      html:
        "A **patch panel** is a passive device that terminates incoming cables into a clean, labeled set of ports. Active equipment (switches, servers) **never** connects directly to trunk cables — it connects via patch cords to the patch panel, which connects (internally or via trunks) to the rest of the infrastructure.",
    },
    {
      kind: "collapsible",
      intro:
        "The distribution hierarchy — not every DC uses every level:",
      items: [
        {
          title: "MDA (Main Distribution Area)",
          body:
            "The **central patch panel infrastructure** for a data hall. Where trunks from every row converge. Losing the MDA affects everything. Typically lives in a dedicated cabinet or room with access control.",
        },
        {
          title: "HDA (Horizontal Distribution Area)",
          body:
            "An intermediate patch panel zone closer to the racks — typically one per row. Trunks run from MDA to HDA, then patches run from HDA to the equipment within the row.",
        },
        {
          title: "ZDA / EDA (Zone / Equipment Distribution Area)",
          body:
            "Even-closer-in distribution points — end-of-row or top-of-rack panels. Smaller facilities may collapse ZDA / EDA into a single top-of-rack panel.",
        },
        {
          title: "TIA-942 — the standards document",
          body:
            "The industry standard for DC structured cabling. Techs rarely memorize it, but architects and cable installers design to it. When someone says a build is \"TIA-942 compliant,\" that's what they mean — pathways, separation, redundancy, distribution zones all meet the spec.",
        },
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "Why patch panels matter operationally",
      body:
        "Moves, adds, and changes happen **at the patch level** without disturbing trunks. Trunks can be tested once and left alone. Troubleshooting has a known, accessible **decoupling point**. Without patch panels you'd trace a fault through 80 meters of trunk; with them, you isolate to either \"before panel\" or \"after panel\" in a minute.",
    },
    { kind: "heading", level: 3, text: "Breakout cables — one dense port, many usable ones" },
    {
      kind: "prose",
      html:
        "A **breakout cable** takes one high-density connector and splits it into multiple lower-density connectors. This is how a switch with 32 QSFP28 ports can effectively serve 128 servers at 25G.",
    },
    {
      kind: "table",
      headers: ["From", "To", "Speed per breakout leg"],
      rows: [
        ["1× QSFP+ (40G)", "4× SFP+ (LC duplex)", "10G each"],
        ["1× QSFP28 (100G)", "4× SFP28 (LC duplex)", "25G each"],
        ["1× QSFP-DD (400G)", "8× SFP56 (LC duplex)", "50G each"],
        ["1× OSFP (800G)", "8× SFP112 (LC duplex)", "100G each"],
      ],
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The switch has to be told the port is in breakout mode",
      body:
        "Simply plugging in a breakout cable **does nothing** until the switch port is configured for breakout. On Cisco: `interface breakout module X port Y map 4x25G` (or equivalent). On Arista: `interface Ethernet1/1/1-4` after enabling breakout. If you plug a breakout cable into a port still in single-channel mode, all four/eight legs stay dark, and new techs spend an hour thinking the cable is bad.",
    },
    { kind: "heading", level: 3, text: "Cable management hardware" },
    {
      kind: "bullets",
      items: [
        "**Vertical cable managers** — rails on either side of a rack with guides and hooks; where cable volume is routed between rack units.",
        "**Horizontal cable managers** — 1U or 2U units between server groups with fingers or ducts; where a row of server tails converges.",
        "**Cable management arms** — attached to the back of a server to support cables as the server slides out for service. Must respect bend radius during slide-out.",
        "**D-rings, brush guards, bend-radius guides** — small parts that route cables cleanly over the edge of patch panels and into vertical runs. Cheap, outsized impact.",
      ],
    },
    {
      kind: "fill-blank",
      prompt:
        "Apply the labeling, color, and breakout knowledge:",
      sentence:
        "Every cable gets labeled on {0} end(s), near the {1}, using a fiber-rated label printer. The jacket colors tell you: {2} = OM3/OM4 multi-mode, {3} = OS2 single-mode, and {4} = OM5 wideband. A 100G-SR4 breakout cable splits a QSFP28 port into {5} SFP28 LC duplex pairs at {6} Gbps each.",
      blanks: [
        { answer: "both", hint: "not just one", alternates: ["2", "two"] },
        { answer: "connector", hint: "where the cable plugs in", alternates: ["connectors"] },
        { answer: "aqua", hint: "bluish-green", alternates: ["Aqua"] },
        { answer: "yellow", hint: "SM color", alternates: ["Yellow"] },
        { answer: "lime", hint: "bright green", alternates: ["Lime", "lime green"] },
        { answer: "4", hint: "QSFP28 = 4 lanes", alternates: ["four"] },
        { answer: "25", hint: "100 / 4" },
      ],
      reveal:
        "Both ends, near the connector. Aqua = OM3/OM4. Yellow = OS2. Lime = OM5. 100G-SR4 → 4× 25G SFP28 breakout.",
    },
    {
      kind: "flip-cards",
      intro:
        "Quick recall on the documentation rules.",
      cards: [
        {
          front: "If a cable isn't labeled, what's the operational rule?",
          back:
            "**Don't touch it without tracing it.** Tracing a cable end-to-end in a live rack is slow and risky. The label is what makes a cable safe to handle. Unlabeled = invisible = dangerous.",
        },
        {
          front: "A 400G QSFP-DD breakout fans out to how many legs at what speed?",
          back:
            "**8 legs × 50G each** (SFP56 LC duplex). The port has to be configured for breakout mode on the switch before any leg comes up.",
        },
        {
          front: "What is MDA and why does it matter?",
          back:
            "**Main Distribution Area** — the central patch panel room where all trunks converge. Losing the MDA affects the whole hall, so it's in a locked cabinet with restricted access.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A new tech plugs a 100G-SR4 breakout cable (QSFP28 → 4× SFP28 LC) into the switch and the four servers. All four server NICs show no link after 10 minutes. The MPO end on the switch shows DDM telemetry normally. What's the most likely explanation?",
      choices: [
        { label: "A", text: "The breakout cable is defective — swap it" },
        { label: "B", text: "The four SFP28 optics at the server end are dead" },
        { label: "C", text: "**The switch port hasn't been configured for breakout mode.** By default a QSFP28 port runs as a single 100G channel; plugging a breakout cable into it doesn't split anything until the interface is reconfigured (e.g., `interface breakout module X port Y map 4x25G`). The MPO end shows DDM because the optic is live — it's the logical split that's missing" },
        { label: "D", text: "The cable is plugged in backwards" },
      ],
      correctAnswer: "C",
      explanation:
        "The breakout-mode misconfiguration is one of the most common \"new build\" failures. The physical layer is fine, the optics are fine, the cable is fine — the switch is just treating the port as a single 100G channel. Once the port is configured for 4× 25G, all four legs come up instantly.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You inherit a rack where **none** of the cables are labeled, but they all work. Your manager says \"if it works, don't fix it.\" What's the case for pushing back and spending half a day labeling? Give two specific operational risks of leaving it as-is.",
      hint: "Think about the next person, and think about the next incident.",
      answer:
        "**Risk 1 — the next tech.** The first person who has to change anything in that rack starts by tracing cables by hand, which is slow and increases the odds of tugging the wrong cable and causing an unplanned outage. A half-day of labeling now saves every subsequent MAC from that risk, forever. **Risk 2 — the next incident.** At 02:00 during a P1, with the NOC on a bridge and everyone pressured to act fast, an unlabeled rack is where mistakes happen. The ops team will unplug the wrong cable trying to \"isolate\" a link, turning one outage into two. Labels aren't aesthetic overhead; they're insurance against both tempo-related errors and accidental damage during routine work. Push back: the labels will pay for themselves the first time someone has to touch that rack.",
    },
    {
      kind: "knowledge-check",
      question:
        "A colleague argues that jacket color coding is \"nice to have\" but redundant if labels are good. Explain why color still matters and what specifically it communicates that a label cannot.",
      answer:
        "A label gives you endpoint information — which switch, which port, which rack. Color gives you **physical properties of the fiber itself**, readable at a glance from 6 feet away without pulling out a flashlight. Aqua instantly tells you it's OM3/OM4 multi-mode; yellow says OS2 single-mode. That distinction matters for fast decisions — \"is this the right kind of fiber for the optic I'm about to install?\" — and for spotting misplaced cables (a yellow cable in a patch field full of aqua is visible immediately, even without reading labels). Color is also what guides cable procurement: when a tech pulls a spare from a drawer, they can grab the right type without checking part numbers. Labels and colors carry different information at different distances and at different levels of detail, and good cabling discipline uses both. Eliminating color coding is how you end up with a tech plugging a single-mode jumper into multi-mode optics and spending an hour on \"why won't this link come up.\"",
    },
  ],
};

// ── fib-m04 Inspection & Troubleshooting ──────────────────────────────────

const fibS7: ChapterSection = {
  id: "fib-s7",
  topicId: "fiber",
  title: "Inspect Before You Connect",
  subtitle: "70–85% of fiber link issues are contamination. Walk in with a clean kit and fix most of them in under five minutes.",
  icon: "◒",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "The industry estimate is that **70–85% of fiber link issues trace back to contamination** — a dirty connector, a fingerprint on an end face, a speck of dust that slipped past a missing dust cap. This is not hype. A tech who arrives at a broken-link ticket with a scope, a click cleaner, and the discipline to inspect *before* plugging fixes most problems in under five minutes without touching the switch configuration or the cables themselves. That's not a trivia fact — it's the most operationally valuable single skill in fiber work.",
    },
    {
      kind: "callout",
      variant: "warning",
      title: "The Golden Rule — inspect before you connect",
      body:
        "**Every time.** Before plugging any fiber into any port or any connector into any adapter, inspect the end face with a scope. It takes **10 seconds**. Skipping it guarantees you'll contaminate the port — because if the connector is dirty, the act of plugging it in deposits debris onto the mating surface and the opposing connector. Now you have **two dirty connectors to clean**.",
    },
    { kind: "heading", level: 3, text: "What actually gets on end faces" },
    {
      kind: "bullets",
      items: [
        "**Dust** — airborne, especially in unoccupied or under-construction areas. The single biggest source.",
        "**Skin oils** — from touching the ferrule with bare fingers. Even a brief touch leaves enough oil to cause loss.",
        "**Dust cap residue** — plastic flakes from repeatedly re-seating the same cap. Cheap caps shed over time.",
        "**Pigtail debris** — lint and paper fiber from open cable bags nearby.",
        "**Moisture** — rare in climate-controlled DCs but not impossible (a cold cable carried through a warm hall can condense).",
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "The scale of the problem",
      body:
        "A fiber **core is 9 μm wide**. A **human hair is 50–100 μm** — up to ten times wider than the core. A single piece of airborne dust can be many times wider than the core. One small speck in the wrong spot **blocks the entire signal**. The physics doesn't care about how it got there.",
    },
    { kind: "heading", level: 3, text: "Cleaning tools — what works and what doesn't" },
    {
      kind: "collapsible",
      intro:
        "The three legitimate cleaning approaches, plus what NOT to use:",
      items: [
        {
          title: "One-click cleaners (click cleaners) — the default",
          body:
            "Pen-shaped tools that advance a fresh strip of cleaning fabric with each click. Press the cleaner against the end face, click, and a clean section wipes the ferrule. Come in variants for **LC, SC, and MPO**. Fast, dry, no solvents, good for most contamination. Not always sufficient for heavy oil contamination; can wear the ferrule if overused. **90% of your cleaning will be done with these.**",
        },
        {
          title: "Reel cleaners (cassettes)",
          body:
            "A small box with a cleaning strip you pull across; you drag the connector across the strip. Cheaper per use than click cleaners at scale; slightly more fiddly. Common in installer kits.",
        },
        {
          title: "Wet-dry cleaning — for stubborn contamination",
          body:
            "Apply a **fiber-safe solvent** (specifically formulated cleaners — **not** hardware-store isopropyl; water content matters) to a lint-free wipe, clean the connector wet, then follow with a dry click. Reserved for skin oil, index-matching gel, or other contamination that dry cleaning can't shift.",
        },
        {
          title: "What NOT to use — ever",
          body:
            "**Compressed air** (dust particles can scratch the ferrule, and the can itself sprays propellant). **Your shirt** (fibers and skin oil). **Paper towels** (lint). **Alcohol wipes from the first-aid kit** (wrong alcohol blend, too much water, carries debris). All of these cause more contamination than they remove.",
        },
      ],
    },
    { kind: "heading", level: 3, text: "Inspection scopes and what you're looking at" },
    {
      kind: "prose",
      html:
        "A **fiberscope (video probe)** is a handheld tool with a camera tip that shows the end face on a screen. Modern scopes (Fluke, EXFO, VIAVI) include **automatic pass/fail analysis per IEC 61300-3-35** — the scope tells you if the end face is clean or not. Manual (optical) scopes are lower cost and require judgment, but still effective.",
    },
    {
      kind: "table",
      headers: ["Zone", "Region of the end face", "Tolerance for defects"],
      rows: [
        ["**A**", "Core", "**None.** No contamination or defects allowed."],
        ["**B**", "Cladding", "Very limited — a few small defects outside the critical area."],
        ["**C**", "Epoxy ring", "Moderate — cosmetic defects allowed."],
        ["**D**", "Ferrule (outer edge)", "Cosmetic defects acceptable."],
      ],
    },
    {
      kind: "callout",
      variant: "troubleshooting",
      title: "If the scope still flags dirt after three cleaning attempts",
      body:
        "The connector is **damaged** — a scratch, a pit, or an embedded contaminant the click cleaner can't shift. Stop cleaning. **Discard the patch cord** or have the fiber reterminated. Clean cycles past three start damaging the ferrule in their own right.",
    },
    {
      kind: "fill-blank",
      prompt:
        "Apply the golden rule and the cleaning decision tree:",
      sentence:
        "Before plugging any fiber in, you {0} the end face with a scope. If it shows contamination, use a {1} cleaner first (dry). If dry cleaning doesn't resolve the contamination after two or three attempts, try a {2} clean — a fiber-safe solvent followed by a dry click. If the scope still flags the connector after three attempts, it's {3} — discard or reterminate. Never use compressed {4} to clean a fiber.",
      blanks: [
        { answer: "inspect", hint: "the golden rule verb", alternates: ["Inspect", "check", "scope"] },
        { answer: "click", hint: "one-click fabric-strip tool", alternates: ["Click", "one-click"] },
        { answer: "wet", hint: "solvent-based", alternates: ["Wet", "wet-dry"] },
        { answer: "damaged", hint: "physically broken", alternates: ["Damaged", "broken", "scratched"] },
        { answer: "air", hint: "common wrong-answer tool", alternates: ["Air"] },
      ],
      reveal:
        "Inspect → dry click → wet-dry (if needed) → if still bad after 3, it's damaged. Never compressed air.",
    },
    {
      kind: "flip-cards",
      intro:
        "Quick recall on the cleaning workflow.",
      cards: [
        {
          front: "The single most important fiber-handling rule?",
          back:
            "**Inspect before you connect.** Every time. 10 seconds with a scope saves you from doubling your cleaning work by dirtying both the connector and the mating port.",
        },
        {
          front: "Default cleaning tool?",
          back:
            "**One-click cleaner.** Pen-shaped tool that advances a fresh cleaning strip with each click. 90% of your cleaning happens with this.",
        },
        {
          front: "Which fiberscope zone has zero tolerance for defects?",
          back:
            "**Zone A — the core (9 μm).** Any contamination or defect here fails the end face. Zones B, C, D have progressively looser tolerance.",
        },
        {
          front: "Why not compressed air?",
          back:
            "Dust particles the air is moving can **scratch the ferrule**; the can itself can spray propellant onto the end face. It creates contamination, it doesn't remove it.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A 10G link is flapping up and down every few minutes. You've confirmed the switch port is enabled and the optic type matches the fiber type. What's the very first thing you do — and why before anything else?",
      choices: [
        { label: "A", text: "Swap the optic first — optics degrade" },
        { label: "B", text: "Open a ticket for the cable installer" },
        { label: "C", text: "**Inspect and clean both end faces.** 70–85% of link issues are contamination. It's a 2-minute check with a scope and click cleaner. Swapping optics or escalating before doing this wastes 10–30 minutes and usually doesn't help, because the new optic will flap for the same reason" },
        { label: "D", text: "Reboot the switch" },
      ],
      correctAnswer: "C",
      explanation:
        "The contamination-first discipline is the most valuable habit in fiber work. Before touching optics, cables, or configs, inspect and clean. The rule is universal across vendors and speeds. Only after clean end faces still show the problem do you move to optic swap, cable swap, and DDM analysis.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You're handed a patch cord to use for a critical link. The dust cap is on, but the cap is scuffed and a little loose. You're in a hurry. What's the disciplined sequence — and what's the specific failure mode you'd create by just plugging it in?",
      hint: "Dust caps wear out. A loose cap is often worse than no cap at all.",
      answer:
        "**Inspect it anyway.** A scuffed cap is a signal that plastic flakes have probably shed onto the end face already, and a loose cap means dust has had free access for however long it's been like that. Remove the cap, scope the end face, and click-clean if it's dirty. If you skip this step and plug it in, you transfer contamination onto the **mating port** inside the optic — which means now you have two dirty surfaces, and cleaning the inside of an optic with a connector already plugged in is hard (you'd need to pull the optic out, clean the port end, and re-scope). The 10 seconds you save by skipping inspection costs you 15 minutes of port-cleaning later. And discard the bad cap — a better cap costs nothing.",
    },
    {
      kind: "knowledge-check",
      question:
        "A colleague justifies using a shirt-corner to \"quick-wipe\" a fiber connector because \"the scope showed just a little dust.\" Walk through why this is worse than leaving the dust there, using specifics about what the shirt deposits.",
      answer:
        "The shirt deposits **three distinct contaminants**: (1) **textile fibers (lint)** — thread-sized particles, far larger than the 9 μm fiber core, that sit on the end face and block signal directly; (2) **skin oils** from whatever parts of the shirt have been touched — oils are the worst contamination because they're sticky and attract more dust over time, and they don't dry-clean off; and (3) **micro-abrasive particles** — detergent residue, fabric sizing, pocket lint — that can **scratch the ferrule** permanently. The original dust speck was loose and click-cleanable in a dry stroke; after a shirt wipe you have embedded oil, embedded fibers, and possibly a scratched ferrule, which means a click cleaner no longer works and you need wet-dry — or, if you scratched the glass, you need to discard the connector. The shirt wipe converted a 30-second fix into a 10-minute wet-clean or a discard-and-reterminate event.",
    },
  ],
};

const fibS8: ChapterSection = {
  id: "fib-s8",
  topicId: "fiber",
  title: "Power, Budget & Diagnosis",
  subtitle: "Read the dBm number, know the link budget, and run the four diagnostic playbooks for the other 15–30% of problems.",
  icon: "◑",
  estimatedMinutes: 10,
  blocks: [
    {
      kind: "why-this-matters",
      body:
        "Once contamination is ruled out, the remaining fiber problems — bent runs, polarity errors, dying optics, over-budget links — are the harder ones. This chapter gives you the tools to diagnose them: **optical power meters** for absolute readings, **link budgets** for knowing when \"close to the edge\" means trouble, **VFLs** for fast polarity and break-finding, and **OTDRs** for when you need to know which meter of cable is broken. Then it walks through the four common failure patterns with specific playbooks.",
    },
    { kind: "heading", level: 3, text: "Optical power and dBm" },
    {
      kind: "prose",
      html:
        "An **Optical Power Meter (OPM)** measures how much light is arriving at the receive end of a fiber, expressed in **dBm** — decibel-milliwatts, a logarithmic scale referenced to 1 mW.",
    },
    {
      kind: "code",
      label: "dBm — THE LOG SCALE",
      language: "text",
      code:
        "    0 dBm  =  1 mW       (a lot of light)\n  -10 dBm  =  0.1 mW     (typical TX output)\n  -20 dBm  =  0.01 mW    (starting to be marginal)\n  -30 dBm  =  0.001 mW   (most receivers can't lock)\n\n  Every -10 dB = 1/10 the power.\n  Every  -3 dB = roughly half the power.",
    },
    {
      kind: "table",
      headers: ["Optic type", "TX output", "RX sensitivity (minimum)"],
      rows: [
        ["**10G-SR**", "-7.3 to -1 dBm", "-11.1 dBm"],
        ["**10G-LR**", "-8.2 to +0.5 dBm", "-14.4 dBm"],
        ["**100G-SR4**", "-8 to +2.4 dBm per lane", "-10.3 dBm"],
        ["**100G-LR4**", "-4.3 to +4.5 dBm (total)", "-10.6 dBm"],
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "How to read a link in 10 seconds",
      body:
        "Compare RX power to the optic's **minimum RX sensitivity**. A 10G-SR link with RX = **-8 dBm** has about 3 dB of headroom — healthy. RX = **-13 dBm** is below the -11.1 dBm minimum — the link will flap or fail. Anything within 2 dB of sensitivity is \"marginal\" — it works today but won't survive any additional loss (dirty connector, aged optic, temperature drift).",
    },
    { kind: "heading", level: 3, text: "Link loss budget — simple version" },
    {
      kind: "bullets",
      items: [
        "**Fiber** — ~0.35 dB/km (SM, 1310 nm), ~0.25 dB/km (SM, 1550 nm), ~3 dB/km (MM, 850 nm)",
        "**Connector pair (mated)** — ~0.3–0.75 dB per pair. Dirty connectors add much more.",
        "**Splice (fusion)** — ~0.1 dB",
        "**Splice (mechanical)** — ~0.3 dB",
      ],
    },
    {
      kind: "prose",
      html:
        "**Link budget** is the maximum loss the optics tolerate from TX output to RX sensitivity. Add up the losses along your path. If you're under budget with headroom, the link will work. If you're at the edge, cleaner connectors buy you 0.5–1 dB back — sometimes enough to save a marginal run.",
    },
    {
      kind: "code",
      label: "WORKED EXAMPLE — 300 m OM4 RUN AT 10G-SR",
      language: "text",
      code:
        "  10G-SR budget (typical)        ~7.0 dB\n\n  Fiber:    0.3 km × 3 dB/km  =   0.9 dB\n  Connector pairs × 4 (both    \n    ends + 2 patch-panel mates) =   2.0 dB\n  Margin (temp, aging):          1.0 dB\n  ──────────────────────────────────────\n  Total expected loss:           3.9 dB\n  Headroom:                     ~3.1 dB    ← comfortable",
    },
    { kind: "heading", level: 3, text: "Visual Fault Locator — pocket red laser" },
    {
      kind: "prose",
      html:
        "A **VFL** is a pocket-sized red laser (650 nm — visible to the eye) that injects light into a fiber. Cheap, fast, invaluable.",
    },
    {
      kind: "collapsible",
      intro:
        "Three uses you'll reach for constantly:",
      items: [
        {
          title: "Trace a fiber end-to-end",
          body:
            "Plug VFL into one end of a fiber at a patch panel. Walk to the other panel. The fiber glowing red is the one you plugged into. Beats tracing by hand in a bundle of 48 aqua jumpers.",
        },
        {
          title: "Confirm MPO polarity",
          body:
            "Shine VFL into fiber 1 at one end of an MPO trunk. Look at which fiber glows at the far end (Type B reverses to fiber 12, Type A goes to fiber 1). Instant polarity diagnosis without a switch.",
        },
        {
          title: "Find a break in a short run",
          body:
            "The red glow **escapes at the crack point** and lights up the cable jacket visibly at the break. Works well for short runs (< 5 km) and for breaks close to either end. Does not work through most patch-panel adapters — a break behind a panel you can only isolate to \"before or after the panel.\"",
        },
      ],
    },
    {
      kind: "callout",
      variant: "info",
      title: "VFL limitations",
      body:
        "A VFL tells you **light is present**, not **how much**. It does not quantify loss, does not work for long runs (the red dims and the diagnostic degrades past 5 km), and doesn't detect the subtle problems an OTDR catches — connector loss, micro-bend, fiber degradation. It's a go/no-go tool, which is why every fiber toolkit has one.",
    },
    { kind: "heading", level: 3, text: "OTDR — brief introduction" },
    {
      kind: "prose",
      html:
        "An **Optical Time-Domain Reflectometer** sends a pulse down the fiber and measures reflections back to build a **distance-vs-loss graph**. It shows exactly where every connector, splice, and break sits along the run, how much loss each contributes, and whether the fiber itself has degraded. OTDRs are expensive, require training, and are typically used by **installation teams and senior techs** for commissioning and hard troubleshooting. As a Tier 1 tech, you should know what it is and when to ask for it — usually when VFL has failed and the run is longer than a few hundred meters.",
    },
    { kind: "heading", level: 3, text: "Four common failure patterns — the playbooks" },
    {
      kind: "collapsible",
      intro:
        "Click through the four patterns you'll diagnose weekly. Each one is a fast, ordered sequence.",
      items: [
        {
          title: "Link won't come up — no light detected",
          body:
            "**1.** Verify the optic is seated and the port is enabled. **2.** Swap the patch cord for a known-good one. **3.** Check polarity (VFL into the TX fiber, verify light appears where expected at the other end). **4.** Inspect and clean both end faces. **5.** Confirm optic type matches fiber type (SR optic on SM fiber is a guaranteed no-link).",
        },
        {
          title: "Link flaps up and down, or runs with errors",
          body:
            "**1.** Inspect and clean both end faces — always first suspect. **2.** Read TX and RX power via DDM (`show interface transceiver`, `ethtool -m`). Is RX below the optic's sensitivity? **3.** Check for bent or pinched fiber along the run (visible kinks, over-tight zip-ties). **4.** Swap the optic — optics degrade and die, especially after temperature cycling.",
        },
        {
          title: "Link comes up but at lower speed than expected",
          body:
            "**1.** Check optic and switch port speed configuration — speed mismatch is surprisingly common. **2.** Check for **breakout mode misconfiguration** — one side expects breakout, other side expects single channel. **3.** Verify the optic's own speed spec matches (a 25G optic on a 100G port won't negotiate 100G).",
        },
        {
          title: "RX power is zero but TX is normal at the other end",
          body:
            "**1.** Break in the fiber. Use **VFL** to localize if the run is short; call for an **OTDR** if the run is long. **2.** Wrong polarity — TX is leaving, but it's landing on the far-end TX fiber, not the RX. **3.** Disconnect at a patch panel somewhere in between — walk the trace to every panel.",
        },
      ],
    },
    {
      kind: "fill-blank",
      prompt:
        "Apply the dBm and budget knowledge to a 10G-SR link:",
      sentence:
        "The optic's minimum RX sensitivity is about {0} dBm. An RX reading of -8 dBm gives about {1} dB of headroom — that's healthy. An RX reading of -13 dBm is {2} sensitivity — the link will flap or fail. If you're at the edge, cleaning both {3}s can buy you back 0.5–1 dB. If a link won't come up at all, the first suspect is always {4}.",
      blanks: [
        { answer: "-11.1", hint: "from the 10G-SR row of the table", alternates: ["-11", "-11.1 dBm"] },
        { answer: "3", hint: "-8 - (-11) = 3" },
        { answer: "below", hint: "relative to -11.1 dBm", alternates: ["under", "worse than"] },
        { answer: "connector", hint: "contaminated end face", alternates: ["connectors", "end face"] },
        { answer: "contamination", hint: "70–85% of issues", alternates: ["dirty connector", "dirty connectors", "dirt"] },
      ],
      reveal:
        "10G-SR: -11.1 dBm sensitivity. RX = -8 dBm = ~3 dB headroom (healthy). RX = -13 dBm is below sensitivity (failing). Clean connectors buy 0.5–1 dB back. Contamination is always the first suspect.",
    },
    {
      kind: "flip-cards",
      intro:
        "Quick recall on the three diagnostic tools.",
      cards: [
        {
          front: "OPM — what does it tell you?",
          back:
            "**Optical Power Meter.** Measures power arriving at the receive end in dBm. Compare to the optic's RX sensitivity to know if the link is healthy, marginal, or dead.",
        },
        {
          front: "VFL — when do you reach for it?",
          back:
            "**Trace a fiber, confirm MPO polarity, or find a break in a short run.** Pocket red laser (650 nm). Tells you light is present, not how much — go/no-go only.",
        },
        {
          front: "OTDR — when do you need one?",
          back:
            "**Long run, subtle loss, or VFL failed to localize.** Builds a distance-vs-loss graph showing every connector, splice, and break along the fiber. Expensive, training required — usually a senior tech or installer tool.",
        },
        {
          front: "First move on a flapping link?",
          back:
            "**Inspect and clean both end faces.** Every time. Before DDM readings, before optic swaps, before escalation.",
        },
      ],
    },
    {
      kind: "mcq-inline",
      question:
        "A 10G-SR link reports RX power of **-13 dBm** and is erroring intermittently. The TX side shows a normal -3 dBm output. Is the link healthy, and what's the right next action?",
      choices: [
        { label: "A", text: "Healthy — -13 dBm is well above zero" },
        { label: "B", text: "**Unhealthy.** 10G-SR minimum RX sensitivity is **-11.1 dBm**. At -13 dBm the receiver is below its sensitivity threshold by ~2 dB, which is exactly why the link is erroring. First action: **inspect and clean both end faces** — a dirty connector can easily account for 2+ dB of excess loss. If clean doesn't fix it, check for bent/pinched fiber, then swap the optic" },
        { label: "C", text: "Borderline — no action needed" },
        { label: "D", text: "The TX power is wrong; swap the far-end optic" },
      ],
      correctAnswer: "B",
      explanation:
        "Receiver sensitivity is a hard cliff, not a suggestion. -13 dBm on 10G-SR is below -11.1 dBm minimum — the link works when noise is low and drops when anything shifts (temperature, a small additional loss). The cleaning-first discipline is the right first move because contamination accounts for most of these situations and it costs nothing to check.",
    },
    {
      kind: "think-about-it",
      scenario:
        "You walk up to a patch field to troubleshoot a 100G-LR4 link that's been flapping since yesterday. DDM shows TX is healthy at both ends, RX power is -9 dBm (minimum is -10.6, so about 1.6 dB of headroom). Both scope images look clean. What's your next diagnostic move, and what's the *wrong* move — the one a junior tech would make?",
      hint: "1.6 dB of margin on an LR4 link on OS2 fiber is not generous — but if everything looks clean, what else could be eating dB?",
      answer:
        "Margin is tight (1.6 dB), both ends are clean, TX power is fine. Two main culprits left: (1) **excess loss along the run** — a sharp bend, over-tightened zip-tie, damaged patch panel adapter, or a connector inside a panel you haven't scoped yet. Walk the full run and scope every connector at every panel — the panels are where cleaning discipline slips. (2) **Temperature-correlated behavior** — if flapping happens mostly at certain times of day, thermal drift on a borderline optic is the cause; swap the optic. The **wrong move** a junior would make: declare the link \"probably fine\" because 1.6 dB is \"positive margin\" and defer the ticket. 1.6 dB on an LR4 means any additional loss (a fingerprint, a zip-tie that's slightly tighter than yesterday, a 2 °C temperature rise) tips the link below sensitivity. Flapping links don't get better on their own; the margin is already consumed. Either find the extra loss today, or the ticket comes back in 48 hours with both sides in LOS.",
    },
    {
      kind: "knowledge-check",
      question:
        "A senior tech tells you: \"Before you even open your scope, know your budget.\" Why is that framing useful, and how does knowing the link budget change the *order* of what you check on a marginal link?",
      answer:
        "The budget is your upper bound on tolerable loss — once you know it, every DDM reading becomes a **diagnostic number, not a raw value**. If a 10G-SR link has ~7 dB of total budget and you're seeing 6 dB of loss, you know you're **1 dB from disaster**, which changes your priorities: you stop asking \"is this link working?\" and start asking \"where can I buy back a dB?\" That reframing puts **cleaning connectors first** (worth 0.5–1 dB each), then **checking every mated pair along the run** (each is ~0.5 dB, and dirt or misalignment can triple that), then **checking for physical abuse** (bends, tight zip-ties, old patches). You don't reach for an optic swap or an OTDR until after you've recovered every easy dB, because optics are expensive and OTDRs are slow, and most of the time the budget is being eaten by things a click cleaner fixes. Knowing the budget also tells you when a link is **genuinely over-spec** (too long, too many mated pairs for the optic class) — then no amount of cleaning helps, and the fix is a different optic class or a re-cabled run. Without the budget in your head, you're guessing; with it, you're working through a prioritized, evidence-driven sequence.",
    },
  ],
};

export const FIBER_CHAPTERS: ChapterSection[] = [
  fibS1,
  fibS2,
  fibS3,
  fibS4,
  fibS5,
  fibS6,
  fibS7,
  fibS8,
];
