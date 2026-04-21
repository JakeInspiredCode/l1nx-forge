import type { MCQuestion } from "@/lib/types/campaign";

// pwr-m03 "Cooling Architecture" — covers pwr-s5 (Heat is the Enemy) + pwr-s6 (Air, Water, Immersion)

export const PWR_M03_QUESTIONS: MCQuestion[] = [
  {
    id: "pwr-m03-q01",
    question:
      "A customer reports their training job is 12% slower on a specific GPU row, but dashboards show no alerts — utilization is normal, no PCIe errors. What's the most likely cooling-related cause, and how do you confirm?",
    choices: [
      { label: "A", text: "Network congestion — reroute traffic" },
      { label: "B", text: "Thermal throttling — the GPU is silently reducing clocks to stay under the hard thermal limit. Confirm with `nvidia-smi --query-gpu=clocks.current.graphics,temperature.gpu,power.draw` during the job; if clocks sit 5–10% below nominal while temps are 85–92°C, you're throttling. Then check physical: inlet temps at that row's intake, blanking panels, containment, rack PDU amps" },
      { label: "C", text: "Customer error" },
      { label: "D", text: "Cosmic rays" },
    ],
    correctAnswer: "B",
    explanation:
      "Throttling is invisible to most alert rules because no single metric leaves its normal band — utilization is still 'high,' power is 'near normal.' The smoking gun is clocks-vs-reference plus thermal throttle reason codes. The 12% pattern is the exact shape of a mild throttling problem.",
  },
  {
    id: "pwr-m03-q02",
    question:
      "Server inlet air in row 4 reads 28°C despite the CRAH supplying 18°C. The CRAH is healthy. What's happening?",
    choices: [
      { label: "A", text: "The CRAH sensor is broken" },
      { label: "B", text: "Airflow problem: cold supply air is mixing with hot exhaust before reaching the server fronts. Likely causes: missing blanking panels inside racks, gaps or openings in containment, unsealed cable cutouts, cable trays blocking server intakes, or rack doors left open. Fix by physical inspection and air-hygiene corrections, not by adding cooling capacity — the problem is mixing, not capacity" },
      { label: "C", text: "Need more cooling — add another CRAH" },
      { label: "D", text: "All servers are miscalibrated" },
    ],
    correctAnswer: "B",
    explanation:
      "A 10°C rise between CRAH supply and server inlet is a textbook recirculation signature. Throwing more cooling at a mixing problem wastes energy because the cold air is still short-circuiting to the hot aisle. Fix the physical path first; capacity checks come later if the problem persists.",
  },
  {
    id: "pwr-m03-q03",
    question:
      "Why is air cooling practically capped around 30 kW per rack, and what does the industry do at higher densities?",
    choices: [
      { label: "A", text: "Physics — heat can't exceed that" },
      { label: "B", text: "Above ~30 kW/rack the fan power, noise, and precision of airflow balancing required become impractical; hotspots and throttling are near-inevitable. The answer is moving heat as liquid — rear-door heat exchangers (40–50 kW), direct-to-chip cold plates with CDUs (100+ kW), and immersion (200+ kW). Liquid carries thousands of times more thermal capacity per volume than air" },
      { label: "C", text: "Above 30 kW, servers refuse to run" },
      { label: "D", text: "Air cooling works fine to 100 kW if CRAHs are larger" },
    ],
    correctAnswer: "B",
    explanation:
      "30 kW is the practical ceiling where the cost, noise, and reliability of air cooling start to diverge from economic sense. AI-era densities (40–100+ kW/rack) are the specific driver behind the industry's expensive shift toward direct-to-chip and immersion cooling.",
  },
  {
    id: "pwr-m03-q04",
    question:
      "What's a blanking panel, and why does it often deliver the single biggest per-dollar cooling efficiency improvement?",
    choices: [
      { label: "A", text: "A fan accessory" },
      { label: "B", text: "A cheap plastic (or metal) panel that fills empty U-space in a rack. Every empty U without a blank is a bypass path for hot exhaust to loop back into the cold aisle, raising inlet temps. Blanking panels cost a few dollars each and often recover several degrees of inlet; always a high-priority audit item for a new or retrofitted rack" },
      { label: "C", text: "A panel used only in raised-floor cutouts" },
      { label: "D", text: "A decorative cover" },
    ],
    correctAnswer: "B",
    explanation:
      "Blanking panels are the archetypal 'cheap fix with outsized impact.' A rack with 12 missing 1U blanks loses meaningful cooling efficiency; the fix takes an hour and a pocket of plastic panels. Every new rack build-out should include a completed blanking-panel audit as a done-criterion.",
  },
  {
    id: "pwr-m03-q05",
    question:
      "A hall has hot-aisle containment. Row 8 consistently runs 4°C warmer at the inlet than other rows. What's the likely cause and the cheapest first check?",
    choices: [
      { label: "A", text: "CRAH imbalance — reprogram the BMS" },
      { label: "B", text: "Containment leakage around row 8 is the leading candidate — gaps in the hot-aisle ceiling, door propped open, missing blanks inside racks, or unsealed cable cutouts. Simplest first check is a physical walk of row 8 with a flashlight and smoke pencil: look for light coming through hot-aisle walls, count missing blanks, feel for hot spots at intake level. Fix the leakage before chasing capacity issues" },
      { label: "C", text: "Replace every server's fans in row 8" },
      { label: "D", text: "Add a CRAH to row 8" },
    ],
    correctAnswer: "B",
    explanation:
      "A single row warmer than neighbors almost always means something physical is letting hot air get to cold intakes. Physical inspection with cheap tools finds the cause. CRAH rebalancing and added capacity are real tools but later in the ladder — they mask rather than fix a containment failure.",
  },
  {
    id: "pwr-m03-q06",
    question:
      "In a direct-to-chip cooling system, what's the role of the CDU, and why is its redundancy as important as PDU redundancy?",
    choices: [
      { label: "A", text: "CDU is just a pump" },
      { label: "B", text: "The Coolant Distribution Unit sits at the rack or row and isolates the internal (server-loop) coolant from the facility water loop via a heat exchanger. If the CDU fails, every D2C-cooled rack behind it loses active cooling *simultaneously* — even a hall full of perfectly-healthy servers — just like losing a PDU blacks out its downstream gear. Redundancy (N+1 or 2N CDUs) and monitoring are non-negotiable for serious liquid-cooled builds" },
      { label: "C", text: "CDU is optional" },
      { label: "D", text: "CDU only applies to immersion" },
    ],
    correctAnswer: "B",
    explanation:
      "The CDU is the equivalent single-point-of-cooling-failure that the PDU is for power. A single failed CDU can take out tens of racks. New liquid builds design N+1 CDUs per zone, with monitoring and leak detection. Treat CDU failures like power failures: planned runbooks, escalation, and redundancy.",
  },
  {
    id: "pwr-m03-q07",
    question:
      "Hot-aisle containment vs cold-aisle containment — which does a new AI-dense hall typically prefer, and why?",
    choices: [
      { label: "A", text: "Cold-aisle — always" },
      { label: "B", text: "Hot-aisle containment is usually preferred for GPU-dense builds. Reasons: (1) the rest of the hall stays at supply temperature, which is more comfortable for humans and auxiliary gear; (2) return-air temperature is maximized (hotter return = higher ΔT across the chiller coil = more efficient chiller operation); (3) rear-door heat exchangers and in-row cooling units integrate naturally with hot-aisle topologies. Cold-aisle containment retrofits are simpler in legacy spaces, but new builds skew hot-aisle" },
      { label: "C", text: "No containment — open flow is best" },
      { label: "D", text: "They're thermodynamically identical" },
    ],
    correctAnswer: "B",
    explanation:
      "Both strategies beat no containment by a lot. For new GPU builds with high density, hot-aisle has thermodynamic and ergonomic advantages. Cold-aisle containment is still fine (often cheaper to retrofit) — the point is 'pick one and commit,' not go with open airflow.",
  },
  {
    id: "pwr-m03-q08",
    question:
      "A colleague wants to raise the cold-aisle setpoint from 22°C to 27°C across all halls to save cooling energy. Good move for CPU-dense halls; why might it be dangerous for H100 racks?",
    choices: [
      { label: "A", text: "Safe everywhere — ASHRAE allows it" },
      { label: "B", text: "For general-purpose CPU halls, 27°C is within ASHRAE recommended and saves real cooling cost. For H100 GPU racks under sustained training load, the GPUs already sit near their silicon thermal ceiling: inlet 22°C → GPU ~78°C (headroom); inlet 27°C → GPU ~83°C → edging into throttling. Throttled GPUs lose 5–15% performance — which at \$30k+ per H100 running expensive training workloads dwarfs any cooling savings. Bifurcate setpoints by workload density, or run the whole hall cooler when GPU-heavy" },
      { label: "C", text: "Only safe if you add fans" },
      { label: "D", text: "Servers don't care about inlet temp" },
    ],
    correctAnswer: "B",
    explanation:
      "The answer is always workload-specific. CPU-dense gear can tolerate warmer inlets for real PUE savings; dense GPU gear cannot, because the performance cost of throttling dominates the cooling cost. Applying one global setpoint change without segmenting by workload is how well-intentioned efficiency projects hurt training throughput.",
  },
];
