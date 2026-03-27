import { ForgeCard, TopicId, CardType, Difficulty, Tier } from "../types";

const today = new Date().toISOString().split("T")[0];

function c(
  id: string, topicId: TopicId, type: CardType, tier: Tier, difficulty: Difficulty,
  front: string, back: string, steps?: string[]
): ForgeCard {
  return {
    id, topicId, type, front, back, difficulty, tier, steps,
    easeFactor: 2.5, interval: 0, repetitions: 0, dueDate: today, lastReview: null,
  };
}

const linuxT1Continued: ForgeCard[] = [
  c("linux-021","linux","easy",1,1,"What does `dmesg` show?","Kernel ring buffer messages — hardware detection, driver loading, boot messages. `dmesg -T` shows human-readable timestamps. Critical for hardware troubleshooting."),
  c("linux-022","linux","easy",1,1,"How do you check CPU info on Linux?","`lscpu` shows CPU architecture, cores, threads, sockets, cache. Also: `cat /proc/cpuinfo` for detailed per-core info. In a GPU server, verifying CPU topology matters for NUMA alignment."),
  c("linux-023","linux","easy",1,1,"What is NUMA and why does it matter for GPU servers?","Non-Uniform Memory Access — CPUs have faster access to local memory than remote. GPU servers need NUMA-aware scheduling so GPUs access the closest CPU's memory. `numactl --hardware` shows topology."),
  c("linux-024","linux","easy",1,1,"How do you mount a filesystem?","`mount /dev/sdb1 /mnt/data` — attaches the device to the directory. `mount -t nfs server:/share /mnt/nfs` for NFS. `umount /mnt/data` to unmount."),
  c("linux-025","linux","easy",1,1,"What is swap space and how do you check it?","Virtual memory extension on disk. When RAM is full, inactive pages move to swap. `swapon --show` or `free -h` shows swap usage. Excessive swap = performance problem."),
  c("linux-026","linux","easy",1,1,"How do you set environment variables persistently?","For current user: add `export VAR=value` to `~/.bashrc` or `~/.profile`. System-wide: `/etc/environment` or `/etc/profile.d/custom.sh`. Run `source ~/.bashrc` to reload."),
  c("linux-027","linux","easy",1,1,"What does `sar` do?","System Activity Reporter — collects and reports system performance data (CPU, memory, I/O, network). Part of `sysstat` package. `sar -u 1 5` shows CPU usage every 1 second, 5 times."),
  c("linux-028","linux","easy",1,1,"How do you create a compressed tar archive?","`tar -czf archive.tar.gz /path/to/dir` — `-c` create, `-z` gzip, `-f` filename. Extract: `tar -xzf archive.tar.gz`. Use `-j` for bzip2, `--zstd` for zstd compression."),
  c("linux-029","linux","easy",1,1,"What is the `/proc` filesystem?","A virtual filesystem providing process and kernel information as files. `/proc/cpuinfo`, `/proc/meminfo`, `/proc/[pid]/status`. Not stored on disk — generated dynamically by the kernel."),
  c("linux-030","linux","easy",1,1,"How do you check network interface configuration?","`ip addr show` (modern) or `ifconfig` (legacy). Shows IP addresses, MAC addresses, MTU, and interface status. `ip link show` for link-layer info only."),
  c("linux-031","linux","easy",1,1,"What does `strace` do?","`strace` traces system calls made by a process. `strace -p PID` attaches to running process. `strace -c command` shows call summary. Invaluable for debugging why a process hangs or fails."),
  c("linux-032","linux","easy",1,1,"How do you check I/O performance on Linux?","`iostat -x 1` shows extended I/O statistics per device every second. Key metrics: `%util` (device saturation), `await` (average I/O wait time), `r/s` and `w/s` (operations/sec)."),
  c("linux-033","linux","easy",1,1,"What is `systemd` and how is it different from SysVinit?","`systemd` is the modern init system — manages services as units, supports parallel startup, dependency management, cgroups, and journaling. SysVinit used sequential shell scripts in `/etc/init.d/`."),
  c("linux-034","linux","easy",1,1,"How do you add a user to a group?","`usermod -aG groupname username` — `-a` appends (critical — without it, replaces all groups), `-G` specifies supplementary group. Verify with `groups username`."),
  c("linux-035","linux","easy",1,1,"What does `lsof` do?","Lists open files — since everything in Linux is a file, this shows open network connections, files, devices. `lsof -i :80` shows processes on port 80. `lsof -p PID` shows files for a process."),
  c("linux-036","linux","easy",1,1,"How do you check the routing table?","`ip route show` or `route -n`. Shows default gateway, network routes, and interface associations. `ip route add` and `ip route del` for modifications."),
  c("linux-037","linux","easy",1,1,"What are cgroups?","Control Groups — a Linux kernel feature for limiting, accounting, and isolating resource usage (CPU, memory, I/O) of process groups. Foundation of container technology (Docker, Kubernetes)."),
  c("linux-038","linux","easy",1,1,"How do you check if a service is running and enabled at boot?","`systemctl status servicename` shows current state. `systemctl is-active servicename` returns active/inactive. `systemctl is-enabled servicename` returns enabled/disabled."),
  c("linux-039","linux","easy",1,1,"What is an LVM?","Logical Volume Manager — abstraction layer over physical disks. Physical Volumes (PV) -> Volume Groups (VG) -> Logical Volumes (LV). Allows resizing, snapshots, and spanning multiple disks."),
  c("linux-040","linux","easy",1,1,"How do you check for zombie processes?","`ps aux | grep Z` — zombie processes show `Z` in the STAT column. They're dead processes whose parent hasn't read their exit status. Usually harmless unless accumulating."),
  c("linux-041","linux","easy",1,1,"What does `tcpdump` do?","`tcpdump` captures network packets. `tcpdump -i eth0 port 80` captures HTTP traffic on eth0. `-w file.pcap` saves for Wireshark analysis. Essential for network troubleshooting."),
  c("linux-042","linux","easy",1,1,"How do you schedule a one-time task?","`at` command. `echo 'command' | at 2:00 AM` schedules for 2 AM. `atq` lists pending jobs. `atrm` removes jobs. Different from `cron` which is recurring."),
  c("linux-043","linux","easy",1,1,"What is the purpose of `/etc/hosts`?","Static hostname-to-IP mapping, checked before DNS. Used for local overrides, testing, and environments where DNS isn't available. Format: `IP hostname alias`."),
  c("linux-044","linux","easy",1,1,"How do you recursively change ownership of a directory?","`chown -R user:group /path/to/dir` — `-R` recurses through all subdirectories and files. Be careful running this on system directories."),
  c("linux-045","linux","easy",1,1,"What is the OOM Killer?","Out Of Memory Killer — kernel mechanism that terminates processes when the system runs out of memory. Selects victims based on `oom_score`. `dmesg | grep -i oom` shows kills. Critical to monitor in GPU servers with large memory footprints."),
  c("linux-046","linux","easy",1,1,"How do you check the uptime of a system?","`uptime` shows how long the system has been running, number of users, and load averages (1, 5, 15 minutes). Load average > number of CPU cores = overloaded."),
  c("linux-047","linux","easy",1,1,"What does `rsync` do vs `scp`?","Both copy files remotely. `rsync` is superior: delta transfers (only changed bytes), resume capability, preserves permissions/timestamps, compression. `rsync -avz source dest`. `scp` does full copies every time."),
  c("linux-048","linux","easy",1,1,"What is SELinux?","Security-Enhanced Linux — mandatory access control system. Enforces security policies beyond standard permissions. Modes: Enforcing, Permissive, Disabled. `getenforce` shows current mode. Common in RHEL/CentOS."),
  c("linux-049","linux","easy",1,1,"How do you check which packages are installed?","Debian/Ubuntu: `dpkg -l` or `apt list --installed`. RHEL/CentOS: `rpm -qa` or `yum list installed`. Pipe to `grep` to find specific packages."),
  c("linux-050","linux","easy",1,1,"What is the difference between `/tmp` and `/var/tmp`?","`/tmp` is cleared on reboot (typically tmpfs in RAM). `/var/tmp` persists across reboots. Use `/tmp` for ephemeral data, `/var/tmp` for data that should survive restarts."),
];

export default linuxT1Continued;
