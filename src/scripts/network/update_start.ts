/* eslint-disable prefer-rest-params */
import { NS } from '@ns';
import { set_cache_resource, get_cache_resource } from '/scripts/util/cache';
import { Colors } from '/scripts/util/colors';
import { StartParams, getStartParams } from '/scripts/network/start';

export async function main(ns: NS): Promise<void> {
  const params = getStartParams(ns);

  const FLAGS = ns.flags([
    ['enable-hacknet', false],
    ['disable-hacknet', false],
    ['enable-gang', false],
    ['disable-gang', false],
    ['enable-party', false],
    ['disable-party', false],
    ['help', false],
  ]);

  if (arguments[0].args.length < 1 || FLAGS.help) {
    ns.tprintf(
      `${Colors.cyan}usage: upstart --[enable|disable]-hacknet --[enable|disable]-gang --[enable|disable]-party --help${Colors.reset}`
    );
    ns.tprintf(JSON.stringify(params));
    ns.exit();
  }

  if (FLAGS['enable-hacknet']) params.hacknetDaemon = true;
  else if (FLAGS['disable-hacknet']) params.hacknetDaemon = false;

  if (FLAGS['enable-gang']) params.gangDaemon = true;
  else if (FLAGS['disable-gang']) params.gangDaemon = false;

  if (FLAGS['enable-party']) params.partyDaemon = true;
  else if (FLAGS['disable-party']) params.partyDaemon = false;

  set_cache_resource<StartParams>(ns, 'start_params', 'network', params);
  const p = get_cache_resource<StartParams>(ns, 'start_params', 'network');
  ns.tprintf(JSON.stringify(p));
}
