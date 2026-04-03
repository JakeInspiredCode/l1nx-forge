// ═══════════════════════════════════════════════════════════════
// TERMINAL SIMULATOR — Command Database
// Simulated GPU compute node: gpu-rack12-node07
//
// Groups match the COMMAND_GROUPS in app/terminal/page.tsx:
//   System → Memory & CPU → Disk & Storage → GPU & Drivers →
//   BMC / IPMI → Network Config → Network Debug →
//   Processes & Services → Logs & Debug → Terminal
// ═══════════════════════════════════════════════════════════════

export const HOSTNAME = "gpu-rack12-node07";
export const USER = "ops";
export const PROMPT_USER = "ops@node07";

export interface TerminalCommand {
  output: string;
  description?: string;
}

export const TERMINAL_COMMANDS: Record<string, TerminalCommand> = {

  // ── System ──

  pwd: {
    output: "/home/ops",
    description: "Print working directory",
  },
  ls: {
    output: "Desktop  Documents  scripts  logs  .bashrc  .ssh",
    description: "List directory contents",
  },
  "ls -la": {
    output: `total 48
drwxr-xr-x  6 ops dcteam 4096 Mar 29 08:00 .
drwxr-xr-x  3 root root  4096 Jan 10 12:00 ..
-rw-------  1 ops dcteam  220 Jan 10 12:00 .bash_history
-rw-r--r--  1 ops dcteam 3526 Jan 10 12:00 .bashrc
drwx------  2 ops dcteam 4096 Jan 10 12:00 .ssh
drwxr-xr-x  2 ops dcteam 4096 Mar 29 07:00 Desktop
drwxr-xr-x  2 ops dcteam 4096 Mar 28 14:00 Documents
drwxr-xr-x  2 ops dcteam 4096 Mar 29 08:00 scripts
drwxr-xr-x  2 ops dcteam 4096 Mar 29 06:00 logs`,
    description: "Detailed file listing with hidden files",
  },
  "cat /etc/hostname": {
    output: "gpu-rack12-node07",
    description: "Show hostname",
  },
  uptime: {
    output: " 08:42:31 up 47 days,  3:21,  2 users,  load average: 0.42, 0.38, 0.31",
    description: "System uptime and load averages",
  },
  "uname -a": {
    output: "Linux gpu-rack12-node07 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 x86_64 GNU/Linux",
    description: "Full kernel and system information",
  },
  whoami: {
    output: "ops",
    description: "Current user",
  },
  hostname: {
    output: "gpu-rack12-node07",
    description: "System hostname",
  },

  // ── Memory & CPU ──

  "free -h": {
    output: `              total        used        free      shared  buff/cache   available
Mem:          128Gi       89Gi       2.1Gi       1.2Gi        37Gi        36Gi
Swap:          16Gi       0.3Gi       15Gi`,
    description: "Memory usage",
  },
  "dmidecode -t memory": {
    output: `# dmidecode 3.4
Handle 0x0044, DMI type 17, 92 bytes
Memory Device
        Size: 64 GB
        Locator: DIMM 2B
        Bank Locator: P0_Node0_Channel0_Dimm1
        Type: DDR5
        Speed: 4800 MT/s
        Manufacturer: Samsung
        Serial Number: S4E93AB2110847
        Part Number: M321R8GA0BB0-CQKZJ

Handle 0x0046, DMI type 17, 92 bytes
Memory Device
        Size: 64 GB
        Locator: DIMM 3A
        Bank Locator: P0_Node0_Channel1_Dimm0
        Type: DDR5
        Speed: 4800 MT/s
        Manufacturer: Samsung
        Serial Number: S4E93AB2110912
        Part Number: M321R8GA0BB0-CQKZJ`,
    description: "DIMM details for RMA tickets",
  },
  lscpu: {
    output: `Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
CPU(s):                112
Thread(s) per core:    2
Core(s) per socket:    56
Socket(s):             1
Model name:            Intel(R) Xeon(R) w9-3495X
CPU MHz:               1900.000
CPU max MHz:           4800.0000
L1d cache:             48K
L1i cache:             32K
L2 cache:              2048K
L3 cache:              107520K
NUMA node0 CPU(s):     0-111`,
    description: "CPU topology and core count",
  },
  "cat /proc/cpuinfo | head -20": {
    output: `processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model name	: Intel(R) Xeon(R) w9-3495X
stepping	: 4
cpu MHz		: 1900.000
cache size	: 107520 KB
physical id	: 0
siblings	: 112
cpu cores	: 56
bogomips	: 3800.00
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm avx avx2 avx512f`,
    description: "CPU information",
  },
  "top -bn1": {
    output: `top - 08:42:31 up 47 days,  3:21,  2 users,  load average: 0.42, 0.38, 0.31
Tasks: 214 total,   3 running, 211 sleeping,   0 stopped,   0 zombie
%Cpu(s): 48.5 us,  1.2 sy,  0.0 ni, 50.1 id,  0.0 wa,  0.1 hi,  0.1 si
MiB Mem : 131072.0 total,  2150.4 free, 91136.0 used,  37785.6 buff/cache
MiB Swap:  16384.0 total, 16076.8 free,    307.2 used.  36864.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 8921 root      20   0  183264  12840   4096 S  97.2   0.0  12:01.44 training-worker
 8922 root      20   0  183264  12740   4096 S  96.8   0.0  11:58.21 training-worker
 2891 nobody    20   0   19284   5120   3072 S   0.3   0.0   2:41.08 node_exporter
 1042 root      20   0   15420   6084   5120 S   0.0   0.0   0:12.34 sshd`,
    description: "One-shot process and load snapshot",
  },
  vmstat: {
    output: `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2  0 307200 2201600 1024000 37683200  0    0   128   512 3842 8201 49  1 50  0  0
 3  0 307200 2198400 1024000 37683200  0    0    64   256 3901 8342 48  1 50  0  0
 2  0 307200 2195200 1024000 37683200  0    0   192   384 3856 8190 49  1 50  0  0`,
    description: "Virtual memory, swap, I/O, and CPU stats",
  },

  // ── Disk & Storage ──

  "df -hT": {
    output: `Filesystem     Type   Size  Used Avail Use% Mounted on
/dev/sda2      ext4   100G   67G   28G  71% /
/dev/nvme0n1p1 xfs    3.5T  2.8T  700G  80% /mnt/ai-data
tmpfs          tmpfs   64G  1.2G   63G   2% /dev/shm
/dev/sdb1      xfs    1.8T  1.1T  700G  61% /mnt/checkpoints`,
    description: "Filesystem usage with types",
  },
  "lsblk -f": {
    output: `NAME        FSTYPE LABEL UUID                                 MOUNTPOINT
sda
├─sda1      vfat         A1B2-C3D4                             /boot/efi
└─sda2      ext4         a1b2c3d4-e5f6-7890-abcd-ef1234567890 /
nvme0n1
└─nvme0n1p1 xfs          f0e1d2c3-b4a5-9687-fedc-ba0987654321 /mnt/ai-data
sdb
└─sdb1      xfs          11223344-5566-7788-99aa-bbccddeeff00 /mnt/checkpoints`,
    description: "Block devices with filesystem info",
  },
  "smartctl -a /dev/sda": {
    output: `SMART overall-health self-assessment test result: PASSED
  5 Reallocated_Sector_Ct   0x0033   100   100   010    Pre-fail  Always       -       0
197 Current_Pending_Sector  0x0012   100   100   000    Old_age   Always       -       0
198 Offline_Uncorrectable   0x0010   100   100   000    Old_age   Offline      -       0
  9 Power_On_Hours          0x0032   098   098   000    Old_age   Always       -       11284`,
    description: "SMART disk health summary",
  },
  "smartctl -a /dev/sda | grep -E 'Health|Reallocated|Pending'": {
    output: `SMART overall-health self-assessment test result: PASSED
  5 Reallocated_Sector_Ct   0x0033   100   100   010    Pre-fail  Always       -       0
197 Current_Pending_Sector  0x0012   100   100   000    Old_age   Always       -       0`,
    description: "SMART disk health check",
  },
  mount: {
    output: `sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
/dev/sda2 on / type ext4 (rw,relatime,errors=remount-ro)
/dev/nvme0n1p1 on /mnt/ai-data type xfs (rw,relatime,attr2,inode64,logbufs=8)
/dev/sdb1 on /mnt/checkpoints type xfs (rw,relatime,attr2,inode64)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
nfsd on /proc/fs/nfsd type nfsd (rw,relatime)`,
    description: "All mounted filesystems and their options",
  },
  iostat: {
    output: `Linux 6.1.0-18-amd64 (gpu-rack12-node07)   03/29/2026  _x86_64_

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
          48.52    0.00    1.23    0.04    0.00   50.21

Device             tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda              12.45       128.30       256.40    5242880   10485760
nvme0n1         842.10     52428.80     26214.40  214748364  107374182
sdb               8.20        64.00       512.00    2621440   20971520`,
    description: "Disk I/O throughput per device",
  },
  "iostat -xz": {
    output: `Linux 6.1.0-18-amd64 (gpu-rack12-node07)   03/29/2026  _x86_64_

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
          48.52    0.00    1.23    0.04    0.00   50.21

Device   r/s     w/s     rkB/s    wkB/s   rrqm/s wrqm/s  %util  await
sda      4.20    8.25    128.30   256.40   0.12   1.84    2.1    1.42
nvme0n1  342.1  500.0  52428.80 26214.40   0.00   0.00   68.4    0.22
sdb      3.10    5.10     64.00   512.00   0.08   2.10    1.8    1.88`,
    description: "Extended disk I/O stats (utilization, await)",
  },
  "find /var -size +100M": {
    output: `/var/log/syslog    142M
/var/log/nvidia-persistenced.log    187M`,
    description: "Large files in /var",
  },
  "find /var -type f -size +100M -mmin -60": {
    output: `/var/log/syslog    142M
/var/log/nvidia-persistenced.log    187M`,
    description: "Large files modified in the last hour",
  },

  // ── GPU & Drivers ──

  "nvidia-smi": {
    output: `+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.129.03   Driver Version: 535.129.03   CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA H100 80GB    On   | 00000000:17:00.0 Off |                    0 |
| N/A   42C    P0    72W / 700W |    312MiB / 81559MiB |      3%      Default |
|   1  NVIDIA H100 80GB    On   | 00000000:31:00.0 Off |                    0 |
| N/A   39C    P0    68W / 700W |    128MiB / 81559MiB |      0%      Default |
|   2  NVIDIA H100 80GB    On   | 00000000:4B:00.0 Off |                    0 |
| N/A   44C    P0    75W / 700W |  78432MiB / 81559MiB |     97%      Default |
|   3  NVIDIA H100 80GB    On   | 00000000:65:00.0 Off |                    0 |
| N/A   41C    P0    70W / 700W |  78432MiB / 81559MiB |     96%      Default |
+-------------------------------+----------------------+----------------------+`,
    description: "GPU status, temperatures, and utilization",
  },
  lspci: {
    output: `00:00.0 Host bridge: Intel Corporation Device 09a2
00:01.0 PCI bridge: Intel Corporation Device 09a3
17:00.0 3D controller: NVIDIA Corporation H100 80GB HBM3 (rev a1)
31:00.0 3D controller: NVIDIA Corporation H100 80GB HBM3 (rev a1)
4b:00.0 3D controller: NVIDIA Corporation H100 80GB HBM3 (rev a1)
65:00.0 3D controller: NVIDIA Corporation H100 80GB HBM3 (rev a1)
73:00.0 Ethernet controller: Mellanox Technologies ConnectX-7 (rev 01)
74:00.0 Non-Volatile memory controller: Samsung Electronics NVMe SSD (rev 01)`,
    description: "PCI devices — GPUs, NICs, NVMe controllers",
  },
  lsmod: {
    output: `Module                  Size  Used by
nvidia_uvm           1282048  2
nvidia_drm             73728  0
nvidia_modeset       1216512  1 nvidia_drm
nvidia              56397824  478 nvidia_uvm,nvidia_modeset
i40e                  335872  0
ixgbe                 352256  0
mlx5_core             598016  0
nvme                   45056  3
nvme_core              98304  5 nvme
dm_mod                155648  0`,
    description: "Loaded kernel modules (GPU drivers, NICs, NVMe)",
  },

  // ── BMC / IPMI ──

  "ipmitool sensor list": {
    output: `Inlet Temp       | 22.000     | degrees C  | ok    | na    | na    | na    | 42.0  | 47.0  | na
Exhaust Temp     | 38.000     | degrees C  | ok    | na    | na    | na    | 70.0  | 75.0  | na
CPU1 Temp        | 52.000     | degrees C  | ok    | na    | na    | na    | 90.0  | 95.0  | na
CPU2 Temp        | 49.000     | degrees C  | ok    | na    | na    | na    | 90.0  | 95.0  | na
Fan1 RPM         | 8400.000   | RPM        | ok    | na    | 600.0 | na    | na    | na    | na
Fan2 RPM         | 8200.000   | RPM        | ok    | na    | 600.0 | na    | na    | na    | na
PSU1 Power       | 820.000    | Watts      | ok    | na    | na    | na    | 1400  | 1500  | na
PSU2 Power       | 790.000    | Watts      | ok    | na    | na    | na    | 1400  | 1500  | na
System Board Pwr | 1610.000   | Watts      | ok    | na    | na    | na    | 2800  | 3000  | na
DIMM Thrm Mrgn   | 42.000     | degrees C  | ok    | na    | na    | na    | 5.0   | 2.0   | na`,
    description: "IPMI hardware sensor readings",
  },
  "ipmitool sensor list | head -10": {
    output: `Inlet Temp       | 22.000     | degrees C  | ok    | na    | na    | na    | 42.0  | 47.0  | na
Exhaust Temp     | 38.000     | degrees C  | ok    | na    | na    | na    | 70.0  | 75.0  | na
CPU1 Temp        | 52.000     | degrees C  | ok    | na    | na    | na    | 90.0  | 95.0  | na
CPU2 Temp        | 49.000     | degrees C  | ok    | na    | na    | na    | 90.0  | 95.0  | na
Fan1 RPM         | 8400.000   | RPM        | ok    | na    | 600.0 | na    | na    | na    | na
Fan2 RPM         | 8200.000   | RPM        | ok    | na    | 600.0 | na    | na    | na    | na
PSU1 Power       | 820.000    | Watts      | ok    | na    | na    | na    | 1400  | 1500  | na
PSU2 Power       | 790.000    | Watts      | ok    | na    | na    | na    | 1400  | 1500  | na
System Board Pwr | 1610.000   | Watts      | ok    | na    | na    | na    | 2800  | 3000  | na
DIMM Thrm Mrgn   | 42.000     | degrees C  | ok    | na    | na    | na    | 5.0   | 2.0   | na`,
    description: "IPMI hardware sensor readings",
  },
  "ipmitool chassis status": {
    output: `System Power         : on
Power Overload       : false
Power Interlock      : inactive
Main Power Fault     : false
Power Control Fault  : false
Power Restore Policy : previous
Last Power Event     : command
Chassis Intrusion    : inactive
Front-Panel Lockout  : inactive
Drive Fault          : false
Cooling/Fan Fault    : false`,
    description: "Chassis power and fault status via IPMI",
  },
  "ipmitool sel list": {
    output: `   1 | 03/29/2026 | 06:15:01 | Temperature #0x30 | Upper Non-critical going high | Asserted
   2 | 03/29/2026 | 06:15:44 | Temperature #0x30 | Upper Non-critical going high | Deasserted
   3 | 03/29/2026 | 07:00:03 | OEM record dc | 000000 | Asserted
   4 | 03/29/2026 | 08:31:12 | Memory #0x44 | Correctable ECC | Asserted`,
    description: "IPMI System Event Log — hardware alerts history",
  },

  // ── Network Config ──

  "ip addr show": {
    output: `1: lo: <LOOPBACK,UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP> mtu 9000
    inet 10.42.15.107/24 brd 10.42.15.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP> mtu 9000
    inet 10.42.16.107/24 brd 10.42.16.255 scope global eth1`,
    description: "Network interfaces and IP addresses",
  },
  "ip a": {
    output: `1: lo: <LOOPBACK,UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP> mtu 9000
    inet 10.42.15.107/24 brd 10.42.15.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP> mtu 9000
    inet 10.42.16.107/24 brd 10.42.16.255 scope global eth1`,
    description: "Network interfaces and IP addresses (short form)",
  },
  "ss -tlnp": {
    output: `State    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
LISTEN   0       128     0.0.0.0:22         0.0.0.0:*         users:(("sshd",pid=1042,fd=3))
LISTEN   0       128     0.0.0.0:9100       0.0.0.0:*         users:(("node_exporter",pid=2891,fd=3))
LISTEN   0       128     0.0.0.0:8080       0.0.0.0:*         users:(("health-agent",pid=3201,fd=5))`,
    description: "Listening TCP ports and processes",
  },
  "ethtool eth0": {
    output: `Settings for eth0:
        Supported ports: [ FIBRE ]
        Supported link modes: 100000baseSR4/Full
        Speed: 100000Mb/s
        Duplex: Full
        Auto-negotiation: on
        Link detected: yes
        Transceiver: internal`,
    description: "NIC speed, duplex, and link status",
  },
  nslookup: {
    output: `Server:		10.42.0.2
Address:	10.42.0.2#53

Name:	gpu-rack12-node07.dc.internal
Address: 10.42.15.107`,
    description: "DNS resolution for this host",
  },
  "nslookup gpu-rack12-node07": {
    output: `Server:		10.42.0.2
Address:	10.42.0.2#53

Name:	gpu-rack12-node07.dc.internal
Address: 10.42.15.107`,
    description: "DNS resolution",
  },

  // ── Network Debug ──

  "ping -c 3 10.42.15.1": {
    output: `PING 10.42.15.1 (10.42.15.1) 56(84) bytes of data.
64 bytes from 10.42.15.1: icmp_seq=1 ttl=64 time=0.214 ms
64 bytes from 10.42.15.1: icmp_seq=2 ttl=64 time=0.198 ms
64 bytes from 10.42.15.1: icmp_seq=3 ttl=64 time=0.201 ms

--- 10.42.15.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 0.198/0.204/0.214/0.007 ms`,
    description: "Test network connectivity to gateway",
  },
  "traceroute 10.42.15.1": {
    output: `traceroute to 10.42.15.1 (10.42.15.1), 30 hops max, 60 byte packets
 1  10.42.15.1 (10.42.15.1)  0.312 ms  0.284 ms  0.271 ms`,
    description: "Trace network path to gateway",
  },
  "tcpdump -c 5 -i eth0": {
    output: `tcpdump: verbose output suppressed, use -v for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
08:42:31.001 IP 10.42.15.107.22 > 10.42.15.200.49182: Flags [P.], seq 1:129, ack 1, len 128
08:42:31.002 IP 10.42.15.200.49182 > 10.42.15.107.22: Flags [.], ack 129, win 501
08:42:31.150 IP 10.42.15.107.9100 > 10.42.15.50.38412: Flags [P.], seq 1:2048, ack 1, len 2047
08:42:31.151 IP 10.42.15.50.38412 > 10.42.15.107.9100: Flags [.], ack 2048, win 501
08:42:31.300 ARP, Request who-has 10.42.15.1 tell 10.42.15.107, length 28
5 packets captured`,
    description: "Capture 5 packets on eth0",
  },
  "iptables -L -n": {
    output: `Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     tcp  --  10.42.0.0/16         0.0.0.0/0            tcp dpt:22
ACCEPT     tcp  --  10.42.0.0/16         0.0.0.0/0            tcp dpt:9100
DROP       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:8080

Chain FORWARD (policy DROP)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination`,
    description: "Firewall rules",
  },

  // ── Processes & Services ──

  "ps aux --sort=-%cpu": {
    output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root      8921 97.2  0.1 183264 12840 ?       Sl   08:30 12:01 /opt/ai/training-worker
root      8922 96.8  0.1 183264 12740 ?       Sl   08:30 11:58 /opt/ai/training-worker
nobody    2891  0.3  0.0  19284  5120 ?       Ssl  Feb10   2:41 /usr/bin/node_exporter
root      1042  0.0  0.0  15420  6084 ?       Ss   Feb10   0:12 sshd: /usr/sbin/sshd -D`,
    description: "Processes sorted by CPU usage",
  },
  "ps aux --sort=-%cpu | head -5": {
    output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root      8921 97.2  0.1 183264 12840 ?       Sl   08:30 12:01 /opt/ai/training-worker
root      8922 96.8  0.1 183264 12740 ?       Sl   08:30 11:58 /opt/ai/training-worker
nobody    2891  0.3  0.0  19284  5120 ?       Ssl  Feb10   2:41 /usr/bin/node_exporter
root      1042  0.0  0.0  15420  6084 ?       Ss   Feb10   0:12 sshd: /usr/sbin/sshd -D`,
    description: "Top CPU-consuming processes",
  },
  "systemctl status sshd": {
    output: `● sshd.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)
     Active: active (running) since Mon 2026-02-10 05:21:31 UTC; 47 days ago
   Main PID: 1042 (sshd)
      Tasks: 1 (limit: 154428)
     Memory: 5.2M
        CPU: 12.431s
     CGroup: /system.slice/ssh.service
             └─1042 sshd: /usr/sbin/sshd -D`,
    description: "SSH service status",
  },

  // ── Logs & Debug ──

  "dmesg -T | tail": {
    output: `[Sun Mar 29 08:30:01 2026] nvidia 0000:4b:00.0: GPU training job allocated 78GB VRAM
[Sun Mar 29 08:31:12 2026] EDAC MC0: 0 CE on DIMM 2B (channel:0 slot:1)
[Sun Mar 29 08:35:44 2026] XFS (nvme0n1p1): Ending clean mount
[Sun Mar 29 08:40:01 2026] nvidia 0000:65:00.0: GPU training job allocated 78GB VRAM
[Sun Mar 29 08:42:30 2026] eth0: link up at 100000Mbps/Full`,
    description: "Recent kernel messages with timestamps",
  },
  "dmesg -T | tail -5": {
    output: `[Sun Mar 29 08:30:01 2026] nvidia 0000:4b:00.0: GPU training job allocated 78GB VRAM
[Sun Mar 29 08:31:12 2026] EDAC MC0: 0 CE on DIMM 2B (channel:0 slot:1)
[Sun Mar 29 08:35:44 2026] XFS (nvme0n1p1): Ending clean mount
[Sun Mar 29 08:40:01 2026] nvidia 0000:65:00.0: GPU training job allocated 78GB VRAM
[Sun Mar 29 08:42:30 2026] eth0: link up at 100000Mbps/Full`,
    description: "Recent kernel messages with timestamps",
  },
  "journalctl -b -p err": {
    output: `Mar 29 06:15:01 gpu-rack12-node07 CRON[4521]: pam_unix(cron:session): session closed for user root
Mar 29 07:00:03 gpu-rack12-node07 nvidia-persistenced[1187]: Failed to query device status for GPU 0000:4B:00.0 (retrying)
Mar 29 07:00:05 gpu-rack12-node07 nvidia-persistenced[1187]: Device query recovered for GPU 0000:4B:00.0
Mar 29 08:31:12 gpu-rack12-node07 kernel: EDAC MC0: 0 CE on DIMM 2B (channel:0 slot:1)`,
    description: "Error-level journal entries since last boot",
  },
  "journalctl -b -p err --no-pager | tail -10": {
    output: `Mar 29 06:15:01 gpu-rack12-node07 CRON[4521]: pam_unix(cron:session): session closed for user root
Mar 29 07:00:03 gpu-rack12-node07 nvidia-persistenced[1187]: Failed to query device status for GPU 0000:4B:00.0 (retrying)
Mar 29 07:00:05 gpu-rack12-node07 nvidia-persistenced[1187]: Device query recovered for GPU 0000:4B:00.0
Mar 29 08:31:12 gpu-rack12-node07 kernel: EDAC MC0: 0 CE on DIMM 2B (channel:0 slot:1)`,
    description: "Error-level journal entries since last boot",
  },
  "lsof | grep deleted": {
    output: `COMMAND    PID   USER   FD   TYPE DEVICE    SIZE/OFF NODE NAME
rsyslogd  1285   root    7w   REG  8,2  4831838208 1048589 /var/log/syslog.1 (deleted)
nginx     3842   www    12w   REG  8,2   209715200 1048603 /var/log/nginx/access.log.2 (deleted)`,
    description: "Find deleted files still held open by processes",
  },

  // ── Terminal ──

  help: {
    output: `Available commands:
  System:        pwd, ls, ls -la, uptime, uname -a, whoami, hostname
  Memory & CPU:  free -h, dmidecode -t memory, lscpu, cat /proc/cpuinfo | head -20,
                 top -bn1, vmstat
  Disk:          df -hT, lsblk -f, smartctl -a /dev/sda, mount, iostat,
                 find /var -size +100M
  GPU:           nvidia-smi, lspci, lsmod
  BMC / IPMI:    ipmitool sensor list, ipmitool chassis status, ipmitool sel list
  Network:       ip addr show, ss -tlnp, ethtool eth0, nslookup
  Net Debug:     ping -c 3 10.42.15.1, traceroute 10.42.15.1,
                 tcpdump -c 5 -i eth0, iptables -L -n
  Processes:     ps aux --sort=-%cpu, systemctl status sshd
  Logs:          dmesg -T | tail, journalctl -b -p err, lsof | grep deleted
  Terminal:      clear, help`,
    description: "Show available commands",
  },
};
