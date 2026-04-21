import type { MCQuestion } from "@/lib/types/campaign";

// fib-m02 "Connectors & Transceivers" — covers fib-s3 (Connectors, Polish & Polarity) + fib-s4 (Transceivers)

export const FIB_M02_QUESTIONS: MCQuestion[] = [
  {
    id: "fib-m02-q01",
    question:
      "You see a patch cable with a green connector on one end and a blue connector on the other. What does this combination tell you?",
    choices: [
      { label: "A", text: "The cable is defective — the ends shouldn't be different colors" },
      { label: "B", text: "**It's a hybrid UPC-APC patch, intentional.** Green = APC (Angled Physical Contact, 8° polish), typically used on DWDM or PON systems. Blue = UPC (Ultra Physical Contact, flat polish), standard for most DC links. Each end must plug into an adapter that matches its polish type. Never plug both ends into the same adapter type — the angle mismatch will damage the end faces" },
      { label: "C", text: "It's a single-mode / multi-mode hybrid" },
      { label: "D", text: "The tech cables are from different vendors" },
    ],
    correctAnswer: "B",
    explanation:
      "Hybrid UPC-APC patches are common at the boundary between standard DC equipment and DWDM/PON gear. The two ends are designed for two different adapter types. Mismatching UPC to APC damages both ferrules and silently degrades performance.",
  },
  {
    id: "fib-m02-q02",
    question:
      "A newly installed 100G-SR4 trunk between two racks won't link up. Both optics show healthy TX power via DDM, but both ends report 'rx LOS' (loss of signal). What's the most likely cause and fastest check?",
    choices: [
      { label: "A", text: "Both optics are dead — swap them" },
      { label: "B", text: "**MPO polarity mismatch.** The TX fibers at one end aren't landing on the RX fibers at the other end, so each optic is transmitting happily but nothing arrives at its own receiver. Fastest check: VFL into fiber 1 at one end; watch which fiber glows at the far end. If it's not what the expected polarity type predicts, order a polarity-flip patch or swap the trunk" },
      { label: "C", text: "Wrong wavelength — SR4 needs LR optics" },
      { label: "D", text: "Fiber is bent — reseat" },
    ],
    correctAnswer: "B",
    explanation:
      "TX healthy + RX LOS on both ends is the textbook signature of polarity mismatch. Both transmitters work, light reaches the other fiber, but it arrives on the wrong lane. The VFL diagnostic takes 10 seconds. Most modern DCs standardize on Type B polarity.",
  },
  {
    id: "fib-m02-q03",
    question:
      "A new tech asks 'is MPO the same as MTP?' What's the correct answer?",
    choices: [
      { label: "A", text: "They're completely different — do not mate them" },
      { label: "B", text: "**MPO is the generic standard; MTP is US Conec's branded, tighter-tolerance version. They mate with each other.** MTP has better alignment and pin retention. If a spec sheet says 'MTP,' think of it as MPO with better engineering — same mechanical interface, same polarity rules, better performance. You can freely mix MTP and MPO in a link" },
      { label: "C", text: "MTP is single-mode only; MPO is multi-mode only" },
      { label: "D", text: "MTP supports only 12 fibers; MPO supports 24" },
    ],
    correctAnswer: "B",
    explanation:
      "MPO and MTP are fully mating-compatible. The branding difference is engineering tolerance, not interface. In practice, nobody cares which one is on which end — the cabling just works.",
  },
  {
    id: "fib-m02-q04",
    question:
      "You need a 100G link between a server NIC and the ToR switch **2 meters away** in the same rack. Budget is tight. What's the right choice?",
    choices: [
      { label: "A", text: "100G-SR4 with MPO patch" },
      { label: "B", text: "100G-LR4 with OS2 single-mode" },
      { label: "C", text: "**100G DAC (Direct Attach Copper).** At 2 m inside a rack, DAC is the cheapest option (no optics), lowest-latency (no optical conversion), and needs no transceiver power budget. AOC and optical only make sense at longer runs or when you need flexibility. DAC wins its niche decisively for 1–7 m server-to-ToR links" },
      { label: "D", text: "100G AOC — optical is always better" },
    ],
    correctAnswer: "C",
    explanation:
      "Inside a rack at ≤7 m, DAC is strictly the cheapest, lowest-latency, most power-efficient option. Optical transceivers add cost, power draw, and latency for no benefit at this distance. The rule of thumb: DAC inside the rack, AOC across the row, optical for anything longer.",
  },
  {
    id: "fib-m02-q05",
    question:
      "What does the number '4' in 100G-SR4 and 100G-LR4 actually refer to, and how does this differ between the two optic types?",
    choices: [
      { label: "A", text: "Four different vendors make them" },
      { label: "B", text: "**Four lanes.** In 100G-SR4, the four lanes are four parallel multi-mode fibers in an MPO connector. In 100G-LR4, the four lanes are four different wavelengths (WDM) multiplexed onto a single LC duplex pair of single-mode fiber. Same 4 × 25G electrical interface; different physical strategy for carrying the lanes" },
      { label: "C", text: "Four generations of the spec" },
      { label: "D", text: "Four meters minimum reach" },
    ],
    correctAnswer: "B",
    explanation:
      "The '4' always means four lanes; the lanes just travel differently depending on fiber. SR4 uses four physical fibers (MPO). LR4 uses four wavelengths on one fiber pair (WDM). Understanding this makes optic labels self-describing.",
  },
  {
    id: "fib-m02-q06",
    question:
      "A third-party 100G-SR4 QSFP28 optic is rejected by a fresh Cisco switch with 'unsupported transceiver.' It's MSA-compliant and physically identical to a Cisco-branded optic. What's the most likely cause?",
    choices: [
      { label: "A", text: "MSA compliance was faked" },
      { label: "B", text: "**It's not 'Cisco-coded.'** MSA standardizes form factor, pinout, and electrical interface — but NOT the vendor-ID byte in the optic's firmware. Cisco, Arista, and Juniper all read that ID and refuse to accept optics whose value doesn't match their expected set. The fix: order a Cisco-coded variant from the same third-party vendor (same hardware, different ID byte), enable an 'unsupported transceiver' override if policy permits, or use Cisco-branded optics" },
      { label: "C", text: "The optic is fundamentally incompatible at the electrical layer" },
      { label: "D", text: "The port is in breakout mode" },
    ],
    correctAnswer: "B",
    explanation:
      "MSA ≠ vendor acceptance. The physical and electrical specs are standardized; the vendor-ID check is a separate enforcement layer. Third-party optics come in Cisco-coded, Arista-coded, and Juniper-coded flavors — same hardware, different ID byte. Swapping optics on the same switch brand won't help unless the coding changes.",
  },
  {
    id: "fib-m02-q07",
    question:
      "You plug an AOC between two switches and the link works perfectly. A month later one end's transceiver dies. What's the operational reality?",
    choices: [
      { label: "A", text: "Replace just the dead transceiver end" },
      { label: "B", text: "**The whole AOC cable is now scrap.** AOC (Active Optical Cable) has transceivers permanently bonded to both ends; they cannot be replaced independently. One end failing means the entire cable is replaced. This is the trade-off AOC makes for its simplicity — the reason you choose optical-plus-fiber over AOC on longer or expensive runs is exactly this replaceability issue" },
      { label: "C", text: "The cable is automatically covered by warranty forever" },
      { label: "D", text: "You can reterminate the failed end" },
    ],
    correctAnswer: "B",
    explanation:
      "AOC trades part-level replaceability for convenience and cost. For short row-level runs where cables are cheap and you rarely re-patch, AOC is great. For runs crossing patch panels or where optic failures are expected, optical transceivers plus a structured fiber patch are more economical long-term.",
  },
  {
    id: "fib-m02-q08",
    question:
      "A tech runs 'show interface Ethernet1/1 transceiver details' and sees RX power of -15 dBm on an optic whose minimum sensitivity is -10.6 dBm. What does this tell them?",
    choices: [
      { label: "A", text: "The link is healthy" },
      { label: "B", text: "**RX is 4.4 dB below minimum sensitivity — the link will flap or fail.** DDM (Digital Diagnostic Monitoring) readings are a live diagnostic: compare RX power to the optic's minimum RX sensitivity. Anything below sensitivity will error; anything within 2 dB of sensitivity is marginal. First action: inspect and clean both end faces (can buy back ~0.5–1 dB per connector). If clean doesn't fix it, check for bent/pinched fiber, then check if the run is over spec (too long or too many mated pairs)" },
      { label: "C", text: "DDM readings are unreliable — ignore" },
      { label: "D", text: "The TX side must be dead" },
    ],
    correctAnswer: "B",
    explanation:
      "DDM is designed exactly for this — a live number that tells you if the link is above, at, or below its design envelope. -15 dBm on an optic rated to -10.6 dBm minimum is definitively failed, not marginal. Cleaning connectors is always first; it's cheap and fixes most margin problems.",
  },
];
