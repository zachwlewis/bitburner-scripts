/* eslint-disable prefer-rest-params */
import { NS } from '@ns';
import { set_cache_resource, get_cache_resource } from '/scripts/util/cache';
import { Colors } from '/scripts/util/colors';
import { ProcessParams } from '/scripts/network/process_daemon';

export async function main(ns: NS): Promise<void> {
  if (arguments[0].args.length < 3) {
    ns.tprintf(`${Colors.cyan}usage: proc [count] [threads] [homeReserve]${Colors.reset}`);
    const p = get_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network');
    ns.tprintf(JSON.stringify(p));
    ns.exit();
  }

  const FLAGS = ns.flags([['onlyHome', false]]);

  const params: ProcessParams = {
    count: arguments[0].args[0],
    threads: arguments[0].args[1],
    homeReserve: arguments[0].args[2],
    onlyHome: <boolean>FLAGS.onlyHome,
  };

  set_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network', params);
  const p = get_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network');
  ns.tprintf(JSON.stringify(p));
}
