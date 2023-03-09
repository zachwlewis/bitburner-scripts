/*
target_daemon.js

Identifies hosts that can be hacked and puts them into port 1.
Monitors the port and refill it when empty.
Relies on workers to pull targets and hack them.
*/

import { NS } from '@ns';
import { NetHost, unowned_hosts } from '/scripts/network/hosts';
import { disable_logs } from '/scripts/util/logging';
import { Colors } from '/scripts/util/colors';
import { AttackRequest, AttackResponse, AttackType, ensure_write, P_ATK_IN, P_ATK_OUT } from '/scripts/util/ports';
import { get_cache_resource, set_cache_resource } from '/scripts/util/cache';

interface TargetLog {
  host: string;
  attack: AttackType;
  money: number;
  difficulty: number;
}

export interface AttackParams {
  /** Percentage of money before executing `hack()`. */
  money: number;
  /** Maximum difficulty before executing `weaken()`. */
  difficulty: number;
  levelTarget: 'fixed' | 'dynamic';
  level: number;
}

const DEFAULT_PARAMS: AttackParams = {
  money: 0.95,
  difficulty: 0.5,
  levelTarget: 'dynamic',
  level: 0.5,
};

export async function main(ns: NS): Promise<void> {
  let params: AttackParams = getDaemonParams(ns);
  const ATK_IN = P_ATK_IN(ns);
  const ATK_OUT = P_ATK_OUT(ns);
  disable_logs(
    ns,
    'sleep',
    'getHackingLevel',
    'getServerRequiredHackingLevel',
    'getServerSecurityLevel',
    'getServerMoneyAvailable'
  );
  ns.clearLog();
  ns.print('start');

  let uptime = 1;
  let earnings = 0;
  let targets: AttackRequest[] = [];
  let logs: TargetLog[] = [];
  const attackerMap: Map<string, number> = new Map<string, number>();

  while (true) {
    // Process responses from attackers
    while (!ATK_OUT.empty()) {
      const response: AttackResponse = JSON.parse(<string>ATK_OUT.read());
      if (response.phase === 'start') {
        const count = attackerMap.get(response.host) ?? 0;
        attackerMap.set(response.host, count + 1);
      } else if (response.phase === 'end') {
        const count = attackerMap.get(response.host) ?? 0;
        attackerMap.set(response.host, Math.max(0, count - 1));
        if (response.type === 'hack') earnings += response.value ?? 0;
      }
    }

    const p = getDaemonParams(ns);
    if (
      p.money !== params.money ||
      p.difficulty !== params.difficulty ||
      p.levelTarget !== params.levelTarget ||
      p.level !== params.level
    ) {
      params = p;
      uptime = 1;
      earnings = 0;
    }

    if (ATK_IN.empty()) {
      // the port needs items
      if (targets.length === 0) {
        // targets needs to be updated
        [targets, logs] = getValidTargets(ns, params);
      }

      // Request hacking targets by writing to the attackers' port.
      while (targets.length > 0 && !ATK_IN.full()) {
        const packet = JSON.stringify(targets.pop());
        uptime += await ensure_write(ns, ATK_IN, packet);
      }
    }

    await ns.sleep(500);
    uptime += 0.5;

    // Print status
    ns.clearLog();
    ns.print('╭──╼ ATK.TARGETS ╾────────────────────────────────╌╌');
    for (const log of logs) {
      outputTarget(ns, log, attackerMap.get(log.host) || 0);
    }

    let workers = 0;
    attackerMap.forEach((value) => (workers += value));

    const earning_stats = ns.nFormat(earnings, '$0.00a').padEnd(10, ' ');
    const total_stats = ns.nFormat(earnings / uptime, '$0.00a');
    //╾╼
    ns.print('├──╼ TARGET_PARAMS ╾──────────────────────────────╌╌');
    ns.print(`│ Money         ${ns.nFormat(params.money, '0.00%')}`);
    ns.print(`│ Difficulty    ${params.difficulty}`);
    ns.print(`│ Level         ${paramHackingLevel(ns, params)} (${params.levelTarget})`);
    ns.print('├──╼ DAEMON_STATUS ╾──────────────────────────────╌╌');
    ns.print(`│ Workers       ${workers}`);
    ns.print(`│ Uptime        ${ns.tFormat(1000 * uptime, false)}`);
    ns.print(`│ Total         ${earning_stats} (${total_stats}/sec)`);
    ns.print('╰──────────────────────────────────────────────╼ END');
  }
}

const getAttackParams = (ns: NS, host: NetHost): AttackParams => ({
  level: ns.getServerRequiredHackingLevel(host.hostname),
  difficulty: ns.getServerSecurityLevel(host.hostname),
  money: ns.getServerMoneyAvailable(host.hostname),
  levelTarget: 'fixed',
});

const paramHackingLevel = (ns: NS, params: AttackParams): number => {
  if (params.levelTarget === 'dynamic') return Math.max(1, Math.floor(ns.getHackingLevel() * params.level));

  if (params.levelTarget === 'fixed') return params.level;

  return 0;
};

function getValidTargets(ns: NS, params: AttackParams): [AttackRequest[], TargetLog[]] {
  const level = Math.min(ns.getHackingLevel(), paramHackingLevel(ns, params));

  // All unowned hosts with money and meets hacking skill.
  const hosts = unowned_hosts(ns).filter(
    (host) => host.level <= level && host.money > 0 && ns.hasRootAccess(host.hostname)
  );

  const targets: AttackRequest[] = [];
  const logs: TargetLog[] = [];

  for (const host of hosts) {
    // Iterate all hosts not owned by the player that meet the hacking level
    // and have money.

    const hostParams = getAttackParams(ns, host);

    // How do we want to attack the target?
    // 1. Increase the money
    // 2. Reduce the difficulty
    // 3. Hack!

    const moneyPercent = hostParams.money / host.money;
    const difficultyDelta = hostParams.difficulty - host.difficulty;
    const attack = moneyPercent < params.money ? 'grow' : difficultyDelta > params.difficulty ? 'weaken' : 'hack';

    logs.push({
      host: host.hostname,
      attack: attack,
      money: moneyPercent,
      difficulty: difficultyDelta,
    });

    targets.push({
      host: host.hostname,
      stock: false,
      threads: 1,
      type: attack,
    });
  }

  return [targets, logs];
}

function outputTarget(ns: NS, log: TargetLog, workers: number): void {
  let mode = '';
  let color = '';

  switch (log.attack) {
    case 'grow':
      mode = `${Colors.brightRed}▲${Colors.black}▼●${Colors.reset}`;
      color = Colors.red;
      break;
    case 'hack':
      mode = `${Colors.black}▲▼${Colors.brightGreen}●${Colors.reset}`;
      color = Colors.green;
      break;
    case 'weaken':
      mode = `${Colors.black}▲${Colors.brightYellow}▼${Colors.black}●${Colors.reset}`;
      color = Colors.yellow;
      break;
  }
  const host = log.host.padEnd(18, ' ');
  const money = ns.nFormat(log.money, '0.00%').padStart(8, ' ');
  const difficulty = ns.nFormat(log.difficulty, '0.00').padStart(8, ' ');
  const wkr = workers.toString().padStart(8, ' ');

  ns.print(`├╼ ${mode} ${host} ${color}${money} ${difficulty}${wkr}${Colors.reset}`);
}

function getDaemonParams(ns: NS): AttackParams {
  const p = get_cache_resource<AttackParams>(ns, 'target_daemon_params', 'network');
  if (!p) set_cache_resource<AttackParams>(ns, 'target_daemon_params', 'network', DEFAULT_PARAMS);

  return p ?? DEFAULT_PARAMS;
}
