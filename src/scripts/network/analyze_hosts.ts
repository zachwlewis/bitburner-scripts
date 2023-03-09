import { NS } from '@ns';
import { unowned_hosts } from '/scripts/network/hosts';

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
    out.push(ns.nFormat(hackTime, '0.0').padStart(10));
    out.push(`${ns.nFormat(hackMoney, '$0.00a').padStart(10)}`);
    out.push(ns.nFormat(weakenTime, '0.0').padStart(10));
    out.push(ns.nFormat(growTime, '0.0').padStart(10));
    out.push(ns.nFormat(totalTime, '0.0').padStart(10));
    const mps = hackMoney / totalTime;
    out.push(`${ns.nFormat(mps, '$0.00a')}/sec`.padStart(15));

    ns.tprintf(out.join(''));
  }
}
