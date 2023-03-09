/* eslint-disable prefer-rest-params */
import { NS } from '@ns';
import { set_cache_resource, get_cache_resource } from '/scripts/util/cache';
import { Colors } from '/scripts/util/colors';
import { HacknetParams } from '/scripts/hacknet/hacknet_daemon';

export async function main(ns: NS): Promise<void> {
  if (arguments[0].args.length < 2) {
    ns.tprintf(`${Colors.cyan}usage: uphn [reserves] [minNodes]${Colors.reset}`);
    const p = get_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet');
    ns.tprintf(JSON.stringify(p));
    ns.exit();
  }

  const params: HacknetParams = {
    reserves: arguments[0].args[0],
    minNodes: arguments[0].args[1],
  };

  set_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet', params);
  const p = get_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet');
  ns.tprintf(JSON.stringify(p));
}
