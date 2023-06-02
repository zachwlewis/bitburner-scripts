import { NS } from '@ns';
import { NetHost, rooted_hosts } from '/scripts/network/hosts';
import { Colors } from '/scripts/util/colors';

export async function main(ns: NS): Promise<void> {
  //
  ns.run('/scripts/network/hosts.js');
  const hosts = rooted_hosts(ns);
  const playerHackingLevel = ns.getHackingLevel();
  for (const host of hosts) {
    if (host.isPurchased || host.hostname === 'home') continue;

    if (host.isBackdoored) {
      ns.tprint(`${Colors.green}Skipping ${host.hostname}: Already backdoored.${Colors.reset}`);
      continue;
    }

    if (playerHackingLevel < host.level) {
      ns.tprint(`${Colors.yellow}Skipping ${host.hostname}: Requires ${host.level} hacking.${Colors.reset}`);
      continue;
    }

    ns.tprint(`${Colors.brightCyan}Backdooring ${host.hostname}...${Colors.reset}`);
    const didConnect = await connect(ns, host);
    if (!didConnect) {
      ns.tprint(`${Colors.red}Unable to connect to ${host.hostname}.${Colors.reset}`);
      continue;
    }

    await ns.singularity.installBackdoor();
  }

  await ns.singularity.connect('home');
  ns.tprint(`${Colors.brightGreen}Done!${Colors.reset}`);
}

async function connect(ns: NS, host: NetHost): Promise<boolean> {
  for (const node of host.path.concat([host.hostname])) {
    const didConnect = await ns.singularity.connect(node);
    if (!didConnect) return false;
  }

  return true;
}
