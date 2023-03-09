/* eslint-disable prefer-rest-params */
import { NS } from '@ns';
import { get_cache_resource, set_cache_resource } from '/scripts/util/cache';
import { Colors } from '/scripts/util/colors';
import { AttackParams } from '/scripts/network/target_daemon';

export async function main(ns: NS): Promise<void> {
  const flags = ns.flags([
    ['money', -1],
    ['difficulty', -1],
    ['fixed', -1],
    ['dynamic', -1],
    ['help', false],
  ]);

  const money = <number>flags.money;
  const difficulty = <number>flags.difficulty;
  const fixed = <number>flags.fixed;
  const dynamic = <number>flags.dynamic;

  const noValidFlags = money < 0 && difficulty < 0 && fixed < 0 && dynamic < 0;
  if (flags.help || noValidFlags) {
    ns.tprintf(
      `${Colors.cyan}usage: uptar {--money [moneyPercent]} {--difficulty [difficultyDelta]} {--fixed [value]|--dynamic [value]}${Colors.reset}`
    );
    ns.tprintf(JSON.stringify(get_cache_resource(ns, 'target_daemon_params', 'network')));
    ns.exit();
  }

  const params: AttackParams = get_cache_resource(ns, 'target_daemon_params', 'network') ?? {
    money: 0.95,
    difficulty: 0.5,
    levelTarget: 'dynamic',
    level: 0.5,
  };

  if (money >= 0) params.money = money;
  if (difficulty >= 0) params.difficulty = difficulty;
  if (fixed >= 0) {
    params.level = fixed;
    params.levelTarget = 'fixed';
  }
  if (dynamic >= 0) {
    params.level = dynamic;
    params.levelTarget = 'dynamic';
  }

  set_cache_resource<AttackParams>(ns, 'target_daemon_params', 'network', params);
  ns.tprintf(JSON.stringify(get_cache_resource(ns, 'target_daemon_params', 'network')));
}
