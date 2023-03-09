/*
root_daemon

automatically gain root access on remote servers in the network.
*/

import { NS } from '@ns';
import { disable_logs } from '/scripts/util/logging';
import { unowned_hosts } from '/scripts/network/hosts';

export async function main(ns: NS): Promise<void> {
  disable_logs(
    ns,
    'disableLog',
    'fileExists',
    'brutessh',
    'ftpcrack',
    'relaysmtp',
    'httpworm',
    'sqlinject',
    'nuke',
    'sleep',
    'clearLog'
  );

  while (true) {
    let rootCount = 0;
    for (const host of unowned_hosts(ns)) {
      // Open as many ports as possible.
      const exposedPorts = exposePorts(ns, host.hostname);

      // Once we've opened ports, try to gain admin access.
      if (exposedPorts >= host.ports) {
        ns.nuke(host.hostname);
        rootCount++;
        //if (!server.backdoorInstalled) ns.installBackdoor(host);
      }
    }

    await ns.sleep(5000);
    ns.clearLog();
    ns.print(`SUCCESS: Root access on ${rootCount} servers.`);
  }
}

function exposePorts(ns: NS, host: string): number {
  let exposedPorts = 0;

  // expose ssh
  if (ns.fileExists('BruteSSH.exe')) {
    ns.brutessh(host);
    exposedPorts++;
  }

  // expose ftp
  if (ns.fileExists('FTPCrack.exe')) {
    ns.ftpcrack(host);
    exposedPorts++;
  }

  // expose smtp
  if (ns.fileExists('relaySMTP.exe')) {
    ns.relaysmtp(host);
    exposedPorts++;
  }

  // expose http
  if (ns.fileExists('HTTPWorm.exe')) {
    ns.httpworm(host);
    exposedPorts++;
  }

  // expose sql
  if (ns.fileExists('SQLInject.exe')) {
    ns.sqlinject(host);
    exposedPorts++;
  }

  return exposedPorts;
}
