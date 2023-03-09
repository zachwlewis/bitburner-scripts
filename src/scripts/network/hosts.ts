import { NS } from '@ns';
import { get_cache_resource, set_cache_resource } from '/scripts/util/cache';

/** A network host. */
export interface NetHost {
  hostname: string;
  ip: string;
  level: number;
  ports: number;
  money: number;
  difficulty: number;
  depth: number;
  isPurchased: boolean;
}

export async function main(ns: NS): Promise<void> {
  const hosts: NetHost[] = [];
  gatherHosts(ns, hosts);
  set_cache_resource<NetHost[]>(ns, 'hosts', 'network', hosts);
}

/** All hosts on the network. */
export const all_hosts = (ns: NS): NetHost[] => get_cache_resource<NetHost[]>(ns, 'hosts', 'network') || [];

/** All hosts the player owns. */
export const owned_hosts = (ns: NS): NetHost[] => all_hosts(ns).filter((value) => value.isPurchased);

/** All hosts the player doesn't own. */
export const unowned_hosts = (ns: NS): NetHost[] => all_hosts(ns).filter((value) => !value.isPurchased);

/** All hosts with root access. */
export const rooted_hosts = (ns: NS): NetHost[] => all_hosts(ns).filter((value) => ns.hasRootAccess(value.hostname));

/** Scans the network, returning a list of all hosts. */
function gatherHosts(ns: NS, output: NetHost[], host = 'home', parent = '', depth = 0) {
  // populate current host
  const server = ns.getServer(host);
  output.push({
    hostname: server.hostname,
    ip: server.ip,
    level: server.requiredHackingSkill,
    ports: server.numOpenPortsRequired,
    money: server.moneyMax,
    difficulty: server.minDifficulty,
    depth: depth,
    isPurchased: server.purchasedByPlayer,
  });

  const children = ns.scan(host);
  for (const child of children) {
    if (child !== parent) gatherHosts(ns, output, child, host, depth + 1);
  }
}
