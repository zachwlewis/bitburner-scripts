import { NS } from '@ns';

import { Colors } from '/scripts/util/colors';

export async function main(ns: NS): Promise<void> {
  ns.tprintf(`Generating ${Colors.brightWhite}hosts.txt${Colors.reset}.`);
  ns.run('/scripts/network/hosts.js');
  const root_pid = ns.run('/scripts/network/root_daemon.js');
  ns.tprintf(
    `Starting ${Colors.yellow}root_daemon${Colors.reset}: PID ${Colors.brightPurple}${root_pid}${Colors.reset}`
  );
  //ns.tail(root_pid, 'home');

  const target_pid = ns.run('/scripts/network/target_daemon.js');
  ns.tprintf(
    `Starting ${Colors.yellow}target_daemon${Colors.reset}: PID ${Colors.brightPurple}${target_pid}${Colors.reset}`
  );

  ns.tail(target_pid, 'home');

  const manager_pid = ns.run('/scripts/network/process_daemon.js');
  ns.tprintf(
    `Starting ${Colors.yellow}process_daemon${Colors.reset}: PID ${Colors.brightPurple}${manager_pid}${Colors.reset}`
  );
  //ns.tail(manager_pid, 'home');

  ns.tprintf(`${Colors.brightCyan}Good luck, samurai!${Colors.reset}`);
}
