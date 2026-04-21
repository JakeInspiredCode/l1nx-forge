import type { MCQuestion } from "@/lib/types/campaign";

// fib-m01 "Fiber Fundamentals" — covers fib-s1 (The Glass Strand) + fib-s2 (Wavelengths, Grades & Why Fiber Wins)

export const FIB_M01_QUESTIONS: MCQuestion[] = [
  {
    id: "fib-m01-q01",
    question:
      "Reading outward from the center of a fiber cable, what is the correct order of the four concentric parts?",
    choices: [
      { label: "A", text: "Jacket → coating → cladding → core" },
      { label: "B", text: "**Core → cladding → coating → jacket.** The core carries the light; the cladding has a lower refractive index and reflects light back into the core via total internal reflection; the coating is a plastic layer applied at the factory to protect the glass; the jacket is the color-coded outer shell the tech handles" },
      { label: "C", text: "Core → coating → cladding → jacket" },
      { label: "D", text: "Cladding → core → jacket → coating" },
    ],
    correctAnswer: "B",
    explanation:
      "The order is critical to understand because each layer has a specific job. Core (light path) → cladding (reflects light back, lower refractive index) → coating (factory-applied plastic protection) → jacket (the outer shell you handle, color-coded for identification).",
  },
  {
    id: "fib-m01-q02",
    question:
      "Why is single-mode fiber able to run 80 km while multi-mode typically struggles past 400 m, even though both are just glass carrying light?",
    choices: [
      { label: "A", text: "Single-mode uses more powerful lasers" },
      { label: "B", text: "**Two mechanisms combine.** Modal dispersion: MM's 50/62.5 μm core allows several geometric paths of different lengths, so pulses arrive smeared and fast signals blur together. SM's 9 μm core allows essentially one path, keeping pulses crisp. Attenuation: SM at 1310/1550 nm sits in fiber's low-loss windows (~0.35 and 0.25 dB/km), while MM at 850 nm loses ~3 dB/km. Crisp pulses plus lower loss per km = much longer reach" },
      { label: "C", text: "Multi-mode fiber has lower quality glass" },
      { label: "D", text: "Single-mode bends less easily" },
    ],
    correctAnswer: "B",
    explanation:
      "The distance difference is a combined effect of dispersion (pulse distortion) and attenuation (power loss). MM loses on both axes at typical DC wavelengths; SM wins on both. That's the physics — not cable quality or laser power.",
  },
  {
    id: "fib-m01-q03",
    question:
      "A tech is handed an aqua patch cable and asked what kind of optic to pair with it. What's the correct answer and reasoning?",
    choices: [
      { label: "A", text: "LR optic at 1310 nm — single-mode" },
      { label: "B", text: "**Multi-mode optic at 850 nm (typically SR).** Aqua jacket = OM3 or OM4 multi-mode (50/125 μm). Multi-mode fiber needs multi-mode optics — the wavelength and core geometry must match. Plugging an SM optic onto MM fiber (or vice versa) is a guaranteed no-link condition" },
      { label: "C", text: "ZR optic for long-haul" },
      { label: "D", text: "Any optic will work — color is cosmetic" },
    ],
    correctAnswer: "B",
    explanation:
      "Aqua = OM3/OM4 multi-mode. Pair with a multi-mode optic (SR). Color coding is documentation you can read at a glance, not decoration. Mixing SM and MM at either end of a link is a classic 'link won't come up' cause.",
  },
  {
    id: "fib-m01-q04",
    question:
      "You need a 10G link between two switches that are **400 meters apart** across a data hall. You have OM4 (aqua) and OS2 (yellow) in stock, plus 10G-SR, 10G-LR, and 10G-ER optics. What's the most cost-effective correct call?",
    choices: [
      { label: "A", text: "OS2 with 10G-ER — future-proof" },
      { label: "B", text: "**OM4 with 10G-SR on both ends.** 10G-SR on OM4 is spec'd to 400 m — right at the edge but within envelope. SR optics are significantly cheaper than LR, and MM is the correct choice at this distance. SM with LR optics works too but pays a premium you don't need" },
      { label: "C", text: "OM4 with 10G-LR — LR means long reach" },
      { label: "D", text: "Combine SR on one end with LR on the other" },
    ],
    correctAnswer: "B",
    explanation:
      "10G-SR on OM4 reaches 400 m (300 m on OM3). At that distance MM is the cost-effective answer. Choice C is wrong: LR is a single-mode optic at 1310 nm and does not work on MM fiber. Choice D is a common trap — SR and LR are different wavelengths and fiber types and cannot talk to each other.",
  },
  {
    id: "fib-m01-q05",
    question:
      "Which of the following correctly maps optic-reach codes to their wavelength and fiber type?",
    choices: [
      { label: "A", text: "SR = 1310 nm / SM; LR = 850 nm / MM; ZR = 1550 nm / SM" },
      { label: "B", text: "**SR = 850 nm / multi-mode. LR = 1310 nm / single-mode. ER = 1550 nm / single-mode. ZR = 1550 nm / single-mode (often DWDM).** The letter tells you reach class; reach class tells you wavelength; wavelength tells you fiber type. You don't need to memorize the physics — just the shorthand" },
      { label: "C", text: "All reach codes use 850 nm; fiber type varies" },
      { label: "D", text: "Fiber type is always multi-mode; only wavelength varies" },
    ],
    correctAnswer: "B",
    explanation:
      "This is the single most useful shorthand in fiber. SR → 850 nm MM. LR → 1310 nm SM. ER/ZR → 1550 nm SM. Read the optic label, know the cable. The letter is always the tell.",
  },
  {
    id: "fib-m01-q06",
    question:
      "A junior tech is about to inspect a disconnected fiber strand and starts to look into the end to check for visible light. What do you say and why?",
    choices: [
      { label: "A", text: "It's fine if the far end is far away" },
      { label: "B", text: "**Do not look into any fiber.** The light in production fiber is invisible infrared (850, 1310, 1550 nm — past what the eye can see). Lasers in production equipment are strong enough to damage your retina **before you feel anything**; your blink reflex never fires because there's nothing to react to. Before inspecting any fiber with a scope, confirm the far end is disconnected or powered off, and always cap unused fibers immediately" },
      { label: "C", text: "Only MM fiber is dangerous — SM is safe" },
      { label: "D", text: "As long as the tech blinks, they're fine" },
    ],
    correctAnswer: "B",
    explanation:
      "Laser safety is non-negotiable. The light isn't visible and the blink reflex doesn't fire. Retinal damage happens in milliseconds. The rule is absolute: confirm the far end is dark before inspection, always use a scope with inline filters, and cap every unused fiber immediately.",
  },
  {
    id: "fib-m01-q07",
    question:
      "An installer proposes running OM4 between two data halls **2 km apart** because 'OM4 handles 100G and the cable is cheap.' What's wrong with this plan?",
    choices: [
      { label: "A", text: "Nothing — OM4 is rated for 100G" },
      { label: "B", text: "**OM4's 100G reach is 150 m, not 2 km.** Over 2 km, modal dispersion and attenuation will destroy the signal well before it arrives. This is single-mode territory: pull OS2 (yellow) and use 100G-LR4 optics (1310 nm, rated to 10 km). The 'OM4 is cheap' instinct is correct for a 50 m run — it's a categorical mismatch for 2 km" },
      { label: "C", text: "Use OM5 instead" },
      { label: "D", text: "Use higher-power SR optics to compensate" },
    ],
    correctAnswer: "B",
    explanation:
      "Fiber choice is bounded by distance, not price. 100G on OM4 reaches 150 m before dispersion and attenuation overwhelm the signal. 2 km demands single-mode with 1310 nm LR optics. Trying to 'push harder' with higher-power optics doesn't help — the signal arrives smeared, not dim.",
  },
  {
    id: "fib-m01-q08",
    question:
      "Why is copper (DAC) still the right choice for short links inside a rack, even though fiber is objectively better at distance and bandwidth?",
    choices: [
      { label: "A", text: "DAC supports higher bandwidth than fiber" },
      { label: "B", text: "**At short distances inside a rack, DAC is cheapest (no optics), lowest-latency (no optical conversion step), and needs no transceiver power budget.** Fiber's distance/bandwidth/EMI advantages matter at DC scale but not inside a 2-meter server-to-ToR link. DAC wins its niche decisively" },
      { label: "C", text: "DAC has better EMI immunity than fiber" },
      { label: "D", text: "DAC is used only in edge closets" },
    ],
    correctAnswer: "B",
    explanation:
      "Copper's advantages at short range — price, latency, power — are real and specific. For 1–7 m server-to-ToR links, DAC is unambiguously the right tool. Fiber's advantages (distance, bandwidth, EMI) don't apply at 2 meters.",
  },
  {
    id: "fib-m01-q09",
    question:
      "What's the core distinction between attenuation and dispersion as fiber-link failure modes?",
    choices: [
      { label: "A", text: "They're the same thing with different names" },
      { label: "B", text: "**Attenuation** is power loss per km — the signal gets weaker as it travels and eventually falls below receiver sensitivity. **Dispersion** is pulse distortion — the signal still reaches the other end, but pulses spread and overlap, so the receiver can't distinguish bits. Attenuation kills a link by lowering the amplitude below threshold; dispersion kills it by smearing the timing" },
      { label: "C", text: "Attenuation only affects SM; dispersion only affects MM" },
      { label: "D", text: "Both are caused entirely by connector losses" },
    ],
    correctAnswer: "B",
    explanation:
      "Two different failure modes matter because they call for different diagnostics. Attenuation is a power-budget problem solvable by cleaning connectors and shortening runs. Dispersion is a fundamental fiber-type problem — you can't 'fix' it on a given cable; you need a different fiber or wavelength.",
  },
  {
    id: "fib-m01-q10",
    question:
      "A tech plugs a single-mode yellow patch cord between two 10G-SR optics (which are designed for multi-mode at 850 nm). The switches log 'link down' on both sides. What's happening, and what's the one-cable fix?",
    choices: [
      { label: "A", text: "The optics have failed — order replacements" },
      { label: "B", text: "**Wavelength and core geometry mismatch.** 10G-SR launches at 850 nm into a 9 μm core it's not built for — almost no light couples through. 10G-SR is multi-mode only. The one-cable fix: replace the yellow SM patch with an aqua OM3/OM4 MM patch. (Alternatively, if the run actually needs SM for distance, replace the optics with 10G-LR.) No reboot needed; the optics are fine" },
      { label: "C", text: "The switch configurations are wrong" },
      { label: "D", text: "The fiber is bent — reseat" },
    ],
    correctAnswer: "B",
    explanation:
      "Mixing SM fiber with MM optics (or vice versa) is one of the most common 'link won't come up' causes. The fix is to match types. Don't replace the optics without understanding why — the fix is typically the patch cord.",
  },
];
