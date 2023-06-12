/*
process_daemon.js

Responsible for spawning and killing attackers as requested.
*/

import { NS } from '@ns';
import { all_hosts, rooted_hosts } from '/scripts/network/hosts';
import { disable_logs } from '/scripts/util/logging';
import { set_cache_resource, get_cache_resource } from '/scripts/util/cache';
import { AttackRequest, ensure_write, P_ATK_IN } from '/scripts/util/ports';

const attackScript = '/scripts/network/attack_daemon.js';
const colorScript = '/scripts/util/colors.js';
const portScript = '/scripts/util/ports.js';

export interface ProcessParams {
  count: number;
  threads: number;
  homeReserve: number;
  onlyHome: boolean;
}

export const DEFAULT_PARAMS: ProcessParams = {
  count: 500,
  threads: 1,
  homeReserve: 32,
  onlyHome: false,
};

const KILL_COMMAND: AttackRequest = {
  host: '',
  stock: false,
  threads: 1,
  type: 'terminate',
};

export async function main(ns: NS): Promise<void> {
  const ATK_IN = P_ATK_IN(ns);

  disable_logs(ns, 'sleep', 'scp', 'exec', 'getServerMaxRam', 'getServerUsedRam');

  while (true) {
    const params = getDaemonParams(ns);
    let count = getProcessCount(ns, attackScript);
    const saturation = params.count === 0 ? 1 : count / params.count;
    ns.clearLog();
    ns.print(`${count}/${params.count} (${ns.formatPercent(saturation)})`);

    // #TODO: Kill hosts when we have too many.
    if (count > params.count) {
      await ensure_write(ns, ATK_IN, JSON.stringify(KILL_COMMAND));
      await ns.sleep(1000);
      continue;
    }

    if (count === params.count) {
      await ns.sleep(5000);
      continue;
    }

    for (const host of rooted_hosts(ns)) {
      // Copy scripts to remote hosts.
      if (params.onlyHome && host.hostname !== 'home') continue;
      // Don't run scripts on hacknet servers
      if (host.hostname.search('hacknet-server') >= 0) continue;
      if (host.hostname !== 'home') ns.scp([attackScript, colorScript, portScript], host.hostname);
      const scriptRam = ns.getScriptRam(attackScript, host.hostname);
      const maxRam = ns.getServerMaxRam(host.hostname);
      const usedRam = ns.getServerUsedRam(host.hostname);
      const reserveRam = host.hostname === 'home' ? params.homeReserve : 0;
      const freeRam = maxRam - reserveRam - usedRam;
      const maxProcesses = params.count - count;
      // Find number of processes we should start.
      const procCount = Math.min(maxProcesses, scriptRam === 0 ? 0 : Math.floor(freeRam / scriptRam));

      for (let i = 0; i < procCount; ++i) {
        const pid = ns.exec(
          attackScript,
          host.hostname,
          params.threads,
          '--threads',
          params.threads,
          crypto.randomUUID()
        );

        if (pid !== 0) count++;
      }

      if (count >= params.count) break;
    }

    await ns.sleep(500);
  }
}

function getProcessCount(ns: NS, script: string): number {
  let count = 0;
  all_hosts(ns).forEach((host) => {
    ns.ps(host.hostname).forEach((process) => {
      count += process.filename === script ? 1 : 0;
    });
  });

  return count;
}

function getDaemonParams(ns: NS): ProcessParams {
  const p = get_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network');
  if (!p) set_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network', DEFAULT_PARAMS);

  return p || DEFAULT_PARAMS;
}
