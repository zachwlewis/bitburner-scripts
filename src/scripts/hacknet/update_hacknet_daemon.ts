/* eslint-disable prefer-rest-params */
import { NS } from '@ns';
import { set_cache_resource, get_cache_resource } from '/scripts/util/cache';
import { Colors } from '/scripts/util/colors';
import { DEFAULT_PARAMS, HacknetParams } from '/scripts/hacknet/hacknet_daemon';

export async function main(ns: NS): Promise<void> {
  const FLAGS = ns.flags([
    ['reserves', -1],
    ['nodes', -1],
    ['help', false],
  ]);

  const params = get_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet') ?? DEFAULT_PARAMS;

  if (arguments[0].args.length === 0 || FLAGS['help']) {
    ns.tprintf(`${Colors.brightCyan}usage: uphn [--reserves <money>] [--nodes <count>] [--help]${Colors.reset}`);
    print_params(ns, params);
    ns.exit();
  }

  const reserves = parseFloat(FLAGS['reserves'] as string);
  const nodes = parseInt(FLAGS['nodes'] as string);
  if (reserves > 0) params.reserves = reserves;
  if (nodes > 0) params.minNodes = nodes;

  set_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet', params);
  const p = get_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet') ?? DEFAULT_PARAMS;
  print_params(ns, p);
}

function print_params(ns: NS, params: HacknetParams) {
  ns.tprintf(`${Colors.cyan}  Reserves $${ns.formatNumber(params.reserves, 2, 1000, true)}${Colors.reset}`);
  ns.tprintf(`${Colors.cyan}  Nodes     ${ns.formatNumber(params.minNodes, 0, 1000, true)}${Colors.reset}`);
}
