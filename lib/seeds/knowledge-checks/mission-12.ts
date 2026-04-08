import type { MCQuestion } from "@/lib/types/campaign";

// Mission 12: "Troubleshooting II"
// Covers: GPU diagnosis (diag-003), boot triage scenarios, advanced incident response

export const MISSION_12_QUESTIONS: MCQuestion[] = [
  {
    id: "m12-q01",
    question: "`nvidia-smi` shows 'No devices were found.' The GPU was working yesterday. What's the most likely cause?",
    choices: [
      { label: "A", text: "The nvidia driver needs to be updated" },
      { label: "B", text: "The GPU has fallen off the PCIe bus — check `dmesg` for PCIe errors and `lspci` to see if it's still detected" },
      { label: "C", text: "Someone uninstalled the nvidia package" },
      { label: "D", text: "The monitor is not connected to the GPU" },
    ],
    correctAnswer: "B",
    explanation: "A GPU 'disappearing' from nvidia-smi usually means a PCIe bus error. Check `lspci | grep -i nvidia` (is it detected?), `dmesg | grep -i pcie` (bus errors?). May require reseat or RMA.",
  },
  {
    id: "m12-q02",
    question: "During boot triage, a server gets stuck at 'Waiting for storage device /dev/nvme0n1p2.' What layer of the boot process is failing?",
    choices: [
      { label: "A", text: "Firmware — POST failed" },
      { label: "B", text: "Bootloader — GRUB can't find its configuration" },
      { label: "C", text: "initramfs — it can't find or mount the root filesystem, likely because the NVMe drive isn't detected" },
      { label: "D", text: "systemd — a service that depends on the disk is timing out" },
    ],
    correctAnswer: "C",
    explanation: "initramfs is responsible for mounting the root filesystem. If the storage device isn't detected (NVMe driver missing, disk failed, wrong kernel parameter), initramfs waits and eventually drops to a shell.",
  },
  {
    id: "m12-q03",
    question: "`dmesg` shows 'EDAC MC0: 1 CE memory on DIMM 3A.' What should you do?",
    choices: [
      { label: "A", text: "Ignore it — correctable errors are handled by hardware" },
      { label: "B", text: "Reboot immediately to clear the error" },
      { label: "C", text: "Monitor the frequency — if CEs are increasing, the DIMM is degrading and needs RMA before it becomes uncorrectable" },
      { label: "D", text: "Replace all DIMMs in the server preventively" },
    ],
    correctAnswer: "C",
    explanation: "A single correctable error (CE) is fine — ECC memory caught and fixed it. But increasing CEs indicate DIMM degradation. Track the rate, identify the DIMM with `dmidecode -t memory`, and plan replacement.",
  },
  {
    id: "m12-q04",
    question: "You need to file an RMA for a failing DIMM. What command gets you the serial number and slot location?",
    choices: [
      { label: "A", text: "`free -h`" },
      { label: "B", text: "`cat /proc/meminfo`" },
      { label: "C", text: "`lspci -v`" },
      { label: "D", text: "`dmidecode -t memory` — shows physical DIMM details: slot, serial, part number, speed" },
    ],
    correctAnswer: "D",
    explanation: "`dmidecode -t memory` reads hardware info from the system's DMI table. It shows which physical slot each DIMM is in, its serial number, part number, and specs — all required for an RMA ticket.",
  },
  {
    id: "m12-q05",
    question: "A server shows GPU ECC uncorrectable errors. Why is this more serious than correctable errors?",
    choices: [
      { label: "A", text: "Uncorrectable errors make the GPU run hotter" },
      { label: "B", text: "Uncorrectable errors mean data in GPU memory was corrupted and could not be fixed — computation results are unreliable" },
      { label: "C", text: "Uncorrectable errors only affect display output" },
      { label: "D", text: "They indicate the GPU driver is outdated" },
    ],
    correctAnswer: "B",
    explanation: "Uncorrectable ECC errors mean GPU memory corruption that hardware couldn't fix. For training workloads, this means potentially corrupt model weights. The node must be pulled from production until the GPU is replaced.",
  },
  {
    id: "m12-q06",
    question: "A node has both a failing DIMM and GPU ECC errors. You need to drain workloads. What does 'draining' mean?",
    choices: [
      { label: "A", text: "Powering off the server immediately" },
      { label: "B", text: "Deleting all data from the server" },
      { label: "C", text: "Gracefully migrating running workloads to other nodes before taking the server offline for maintenance" },
      { label: "D", text: "Reducing the server's power consumption" },
    ],
    correctAnswer: "C",
    explanation: "Draining = gracefully moving workloads away. In a GPU cluster, this means the scheduler stops sending new jobs and waits for running jobs to checkpoint/complete before marking the node offline for repair.",
  },
  {
    id: "m12-q07",
    question: "A server won't boot. The BMC console shows no POST output at all — the screen stays blank. What layer is failing?",
    choices: [
      { label: "A", text: "Firmware/BIOS — the system isn't even initializing hardware" },
      { label: "B", text: "Bootloader — GRUB is corrupted" },
      { label: "C", text: "Kernel — panic during early init" },
      { label: "D", text: "systemd — critical service failure" },
    ],
    correctAnswer: "A",
    explanation: "No POST output = firmware never starts. Could be: dead motherboard, unseated CPU, no power to the board, or corrupted firmware. Check BMC sensor data for power/thermal readings. This is a hardware issue.",
  },
  {
    id: "m12-q08",
    question: "After diagnosing a hardware issue, you've identified the root cause and filed an RMA. What critical step do many new technicians skip?",
    choices: [
      { label: "A", text: "Rebooting the server one more time" },
      { label: "B", text: "Updating the server's hostname" },
      { label: "C", text: "Documenting the incident — capturing evidence (logs, commands run, timeline) for the incident ticket and post-mortem" },
      { label: "D", text: "Running a full disk scan" },
    ],
    correctAnswer: "C",
    explanation: "Documentation closes the loop. Capture: what symptoms appeared, what commands you ran, what evidence you found, the root cause, and the resolution. This builds the team's knowledge base and helps with recurring issues.",
  },
];
