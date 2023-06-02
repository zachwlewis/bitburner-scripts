/* eslint-disable prefer-rest-params */
import { NS } from '@ns';
import { set_cache_resource, get_cache_resource } from '/scripts/util/cache';
import { Colors } from '/scripts/util/colors';
import { DEFAULT_PARAMS, ProcessParams } from '/scripts/network/process_daemon';

export async function main(ns: NS): Promise<void> {
  const params = get_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network') ?? DEFAULT_PARAMS;

  const FLAGS = ns.flags([
    ['count', -1],
    ['threads', -1],
    ['reserve', -1],
    ['onlyHome', false],
    ['help', false],
  ]);

  if (arguments[0].args.length === 0 || FLAGS['help']) {
    ns.tprintf(
      `${Colors.brightCyan}usage: proc [--count <number>] [--threads <number>] [--reserve <ram>] [--onlyHome] [--help]${Colors.reset}`
    );
    print_params(ns, params);
    ns.exit();
  }

  const count = parseInt(FLAGS['count'] as string);
  const threads = parseInt(FLAGS['threads'] as string);
  const reserve = parseInt(FLAGS['reserve'] as string);

  if (count > 0) params.count = count;
  if (threads > 0) params.threads = threads;
  if (reserve > 0) params.homeReserve = reserve;
  params.onlyHome = FLAGS['onlyHome'] as boolean;

  set_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network', params);
  const p = get_cache_resource<ProcessParams>(ns, 'process_daemon_params', 'network');
  ns.tprintf(JSON.stringify(p));
}

function print_params(ns: NS, params: ProcessParams) {
  ns.tprintf(`${Colors.cyan}  Count     ${ns.formatNumber(params.count, 2, 1000, true)}${Colors.reset}`);
  ns.tprintf(`${Colors.cyan}  Threads   ${ns.formatNumber(params.threads, 2, 1000, true)}${Colors.reset}`);
  ns.tprintf(`${Colors.cyan}  Reserve   ${ns.formatRam(params.homeReserve, 2)}${Colors.reset}`);
  ns.tprintf(`${Colors.cyan}  Only Home ${params.onlyHome}${Colors.reset}`);
}
