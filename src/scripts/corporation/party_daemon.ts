/*
party_daemon.js

automatically feed coffee and throw parties for workers.
*/

import { NS } from '@ns';

const party_fund = 500000;

export async function main(ns: NS): Promise<void> {
  while (true) {
    await ns.sleep(10000);
    const corp = ns.corporation.getCorporation();
    corp.divisions.forEach((value) => party(ns, value));
  }
}

function party(ns: NS, division: string): void {
  ns.corporation.getDivision(division).cities.forEach((city) => {
    const office = ns.corporation.getOffice(division, city);
    const needsCoffee = office.avgEnergy < 95;
    const needsParty = office.avgMorale < 95;
    if (needsCoffee) {
      ns.corporation.buyTea(division, city);
      ns.printf(`Low energy detected in ${division}, ${city} office.`);
    }
    if (needsParty) {
      ns.corporation.throwParty(division, city, party_fund);
      ns.printf(`Low morale detected in ${division}, ${city} office.`);
    }
  });
}
