/*
attack_daemon.js

Reads a target from PORT1 and hacks it, then waits for a new target.
*/

import { BasicHGWOptions, NS } from '@ns';
import { Colors } from '/scripts/util/colors';
import { AttackRequest, AttackResponse, ensure_write, P_ATK_IN, P_ATK_OUT } from '/scripts/util/ports';
//import { disable_logs } from "scripts/util/logging";

export async function main(ns: NS): Promise<void> {
  const FLAGS = ns.flags([['threads', 1]]);
  const ATK_IN = P_ATK_IN(ns);
  const ATK_OUT = P_ATK_OUT(ns);
  //disable_logs(ns, "grow", "weaken", "hack");

  while (true) {
    const input = ATK_IN.read();
    if (input === 'NULL PORT DATA') {
      await ATK_IN.nextWrite();
      continue;
    }

    const request: AttackRequest = JSON.parse(<string>input);
    ns.printf(
      `Starting ${Colors.brightWhite}${request.type}${Colors.reset} attack on ${Colors.brightCyan}${request.host}${Colors.reset}.`
    );

    const startResponse: AttackResponse = {
      pid: ns.pid,
      host: request.host,
      type: request.type,
      phase: 'start',
    };

    const endResponse: AttackResponse = {
      pid: ns.pid,
      host: request.host,
      type: request.type,
      phase: 'end',
    };

    await ensure_write(ns, ATK_OUT, JSON.stringify(startResponse));

    switch (request.type) {
      case 'grow':
        endResponse.value = await ns.grow(request.host, { threads: <number>FLAGS.threads, stock: request.stock });
        break;
      case 'hack':
        endResponse.value = await ns.hack(request.host, {
          threads: Math.min(<number>FLAGS.threads, 4),
          stock: request.stock,
        });
        break;
      case 'weaken':
        endResponse.value = await ns.weaken(request.host, { threads: <number>FLAGS.threads, stock: request.stock });
        break;
      case 'terminate':
        endResponse.value = 0;
        await ensure_write(ns, ATK_OUT, JSON.stringify(endResponse));
        ns.exit();
        break;
    }

    await ensure_write(ns, ATK_OUT, JSON.stringify(endResponse));

    // Maintain level by tacking on a GW to a hack.
    if (request.type === 'hack') {
      await ns.grow(request.host, { threads: <number>FLAGS.threads, stock: request.stock });
      await ns.weaken(request.host, { threads: <number>FLAGS.threads, stock: request.stock });
    }
  }
}
