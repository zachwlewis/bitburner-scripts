import { NS } from '@ns';
import { set_cache_resource, get_cache_resource } from '/scripts/util/cache';

import { Colors } from '/scripts/util/colors';

export interface StartParams {
  generateHosts: boolean;
  rootDaemon: boolean;
  targetDaemon: boolean;
  processDaemon: boolean;
  hacknetDaemon: boolean;
  gangDaemon: boolean;
  partyDaemon: boolean;
}

const DEFAULT_PARAMS: StartParams = {
  generateHosts: true,
  rootDaemon: true,
  targetDaemon: true,
  processDaemon: true,
  hacknetDaemon: false,
  gangDaemon: false,
  partyDaemon: false,
};

export async function main(ns: NS): Promise<void> {
  const params: StartParams = getStartParams(ns);

  if (params.generateHosts) {
    ns.tprintf(`Generating ${Colors.brightWhite}hosts.txt${Colors.reset}.`);
    ns.run('/scripts/network/hosts.js');
  }

  if (params.rootDaemon) {
    const root_pid = ns.run('/scripts/network/root_daemon.js');
    ns.tprintf(
      `Starting ${Colors.yellow}root_daemon${Colors.reset}: PID ${Colors.brightPurple}${root_pid}${Colors.reset}`
    );

    //ns.tail(root_pid, 'home');
  }

  if (params.targetDaemon) {
    const target_pid = ns.run('/scripts/network/target_daemon.js');
    ns.tprintf(
      `Starting ${Colors.yellow}target_daemon${Colors.reset}: PID ${Colors.brightPurple}${target_pid}${Colors.reset}`
    );

    //ns.tail(target_pid, 'home');
  }

  if (params.processDaemon) {
    const manager_pid = ns.run('/scripts/network/process_daemon.js');
    ns.tprintf(
      `Starting ${Colors.yellow}process_daemon${Colors.reset}: PID ${Colors.brightPurple}${manager_pid}${Colors.reset}`
    );
    //ns.tail(manager_pid, 'home');
  }

  if (params.hacknetDaemon) {
    const hacknet_pid = ns.run('/scripts/hacknet/hacknet_daemon.js');
    ns.tprintf(
      `Starting ${Colors.yellow}hacknet_daemon${Colors.reset}: PID ${Colors.brightPurple}${hacknet_pid}${Colors.reset}`
    );

    //ns.tail(hacknet_pid, 'home');
  }

  if (params.gangDaemon) {
    const gang_pid = ns.run('/scripts/gang/gang_daemon.js');
    ns.tprintf(
      `Starting ${Colors.yellow}gang_daemon${Colors.reset}: PID ${Colors.brightPurple}${gang_pid}${Colors.reset}`
    );

    //ns.tail(gang_pid, 'home');
  }

  if (params.partyDaemon) {
    const party_pid = ns.run('/scripts/corporation/party_daemon.js');
    ns.tprintf(
      `Starting ${Colors.yellow}party_daemon${Colors.reset}: PID ${Colors.brightPurple}${party_pid}${Colors.reset}`
    );

    //ns.tail(party_pid, 'home');
  }

  ns.tprintf(`${Colors.brightCyan}Good luck, samurai!${Colors.reset}`);
}

export function getStartParams(ns: NS): StartParams {
  const p = get_cache_resource<StartParams>(ns, 'start_params', 'network');
  if (!p) set_cache_resource<StartParams>(ns, 'start_params', 'network', DEFAULT_PARAMS);

  return p ?? DEFAULT_PARAMS;
}
