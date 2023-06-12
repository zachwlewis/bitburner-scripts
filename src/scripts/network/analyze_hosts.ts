import { NS } from '@ns';
import { unowned_hosts } from '/scripts/network/hosts';
import { formatMoney } from '/scripts/util/logging';

export async function main(ns: NS): Promise<void> {
  for (const host of unowned_hosts(ns)) {
    if (host.money <= 1) continue;
    const hackTime = ns.getHackTime(host.hostname) * 0.001;
    const weakenTime = ns.getWeakenTime(host.hostname) * 0.001;
    const growTime = ns.getGrowTime(host.hostname) * 0.001;

    const hackMoney = ns.hackAnalyze(host.hostname) * host.money;

    const totalTime = hackTime + weakenTime + growTime;

    const out: string[] = [];
    out.push(host.hostname.padEnd(20));
    out.push(ns.formatNumber(hackTime, 1, 0, false).padStart(10));
    out.push(formatMoney(ns, hackMoney).padStart(10));
    out.push(ns.formatNumber(weakenTime, 1, 0, false).padStart(10));
    out.push(ns.formatNumber(growTime, 1, 0, false).padStart(10));
    out.push(ns.formatNumber(totalTime, 1, 0, false).padStart(10));
    const mps = hackMoney / totalTime;
    out.push(`${formatMoney(ns, mps)}/sec`.padStart(15));

    ns.tprintf(out.join(''));
  }
}
