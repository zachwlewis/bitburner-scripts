import { NS } from '@ns';

/*
A 'cycle' lasts 5 minutes and the current task for any given member on a cycle
is set by taking the cycle and their member index and modding by the number
of tasks in your list, so it should spread out tasks evenly among your members,
and each one should progress through the list of tasks, although when you start
only the first member will start on task 0.
Set 'upgradeEquipmentNames' to a list of the gear you want to purchase,
currently it gets a list of all equipment by type and includes all types.
Jobs are:
 [
  "Unassigned",
  "Mug People",
  "Deal Drugs",
  "Strongarm Civilians",
  "Run a Con",
  "Armed Robbery",
  "Traffick Illegal Arms",
  "Threaten & Blackmail",
  "Human Trafficking",
  "Terrorism",
  "Vigilante Justice",
  "Train Combat",
  "Train Hacking",
  "Train Charisma",
  "Territory Warfare"
]
 */

const DURATION = 5 * 60 * 1000; // 5 minutes

export async function main(ns: NS): Promise<void> {
  const newMemberNames = [
    'gm-0',
    'gm-1',
    'gm-2',
    'gm-3',
    'gm-4',
    'gm-5',
    'gm-6',
    'gm-7',
    'gm-8',
    'gm-9',
    'gm-10',
    'gm-11',
    'gm-12',
    'gm-13',
    'gm-14',
    'gm-15',
    'gm-16',
    'gm-17',
    'gm-18',
    'gm-19',
    'gm-20',
    'gm-21',
    'gm-22',
    'gm-23',
    'gm-24',
    'gm-25',
    'gm-26',
    'gm-27',
    'gm-28',
    'gm-29',
  ];
  ns.disableLog('ALL');

  // what gear will we buy after ascension?
  const equipmentNames = ns.gang.getEquipmentNames();
  const upgradeEquipmentNames = equipmentNames.filter((x) =>
    ['Weapon', 'Armor', 'Vehicle', 'Rootkit', 'Augmentation'].find((y) => ns.gang.getEquipmentType(x) === y)
  );

  let cycle = 0;

  // with 6 jobs and 12 members, we should have two members on each
  const cycleTasks = [
    'Train Combat',
    'Train Combat',
    'Terrorism',
    'Terrorism',
    'Human Trafficking',
    'Territory Warfare',
    'Vigilante Justice',
  ];

  while (true) {
    const memberNames = ns.gang.getMemberNames();
    ns.print(`Cycle ${cycle} activating for ${memberNames.length} gang members`);
    memberNames.forEach((name, index) => {
      const taskIndex = (cycle + index) % cycleTasks.length;
      if (taskIndex === 0) {
        const result = ns.gang.ascendMember(name);
        if (result)
          ns.print(
            `INFO: Ascended gang member ${name}:\n      Hack:${sf(result.hack)}, Str:${sf(result.str)}, Def:${sf(
              result.def
            )}, Dex:${sf(result.dex)}, Agi:${sf(result.agi)}`
          );
        purchaseEquipment(name);
      }
      ns.gang.setMemberTask(name, cycleTasks[taskIndex]);
    });

    // hire new members if possible and set them to first job for this cycle,
    // should be training probably
    if (ns.gang.canRecruitMember()) {
      newMemberNames.forEach((name) => {
        if (ns.gang.recruitMember(name)) {
          ns.print(`INFO: Recruited new gang member '${name}`);
          ns.gang.setMemberTask(name, cycleTasks[0]);
          purchaseEquipment(name);
        }
      });
    }

    const cycleEnd = new Date(new Date().valueOf() + DURATION).toLocaleTimeString();
    ns.print(`Next cycle at ${cycleEnd}`);
    await ns.sleep(DURATION); // wait 5 minutes
    cycle++;
  }

  /**
   * Purchase equipment for a gang member if we have the money
   */
  function purchaseEquipment(member_name: string): void {
    let { money } = ns.getPlayer();
    upgradeEquipmentNames.forEach((equipName) => {
      const cost = ns.gang.getEquipmentCost(equipName);
      if (money >= cost && ns.gang.purchaseEquipment(member_name, equipName)) money -= cost;
    });
  }

  /** Simple format for stats */
  function sf(value: number) {
    if (typeof value !== 'number') return '???';
    return Math.trunc(value * 1000) / 1000;
  }
}
