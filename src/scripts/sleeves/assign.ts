import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const FLAGS = ns.flags([['task', '']]);

  const count = ns.sleeve.getNumSleeves();
  const task = FLAGS.task.toString().toLowerCase();

  for (let i = 0; i < count; ++i) {
    switch (task) {
      case 'hack':
      case 'hacking':
        ns.sleeve.travel(i, 'Volhaven');
        ns.sleeve.setToUniversityCourse(i, 'ZB Institute of Technology', 'Algorithms');
        break;
      case 'str':
      case 'strength':
        ns.sleeve.travel(i, 'Sector-12');
        ns.sleeve.setToGymWorkout(i, 'Powerhouse Gym', 'Strength');
        break;
      case 'def':
      case 'defense':
        ns.sleeve.travel(i, 'Sector-12');
        ns.sleeve.setToGymWorkout(i, 'Powerhouse Gym', 'Defense');
        break;
      case 'dex':
      case 'dexterity':
        ns.sleeve.travel(i, 'Sector-12');
        ns.sleeve.setToGymWorkout(i, 'Powerhouse Gym', 'Dexterity');
        break;
      case 'agi':
      case 'agility':
        ns.sleeve.travel(i, 'Sector-12');
        ns.sleeve.setToGymWorkout(i, 'Powerhouse Gym', 'Agility');
        break;
      case 'cha':
      case 'charisma':
        ns.sleeve.travel(i, 'Volhaven');
        ns.sleeve.setToUniversityCourse(i, 'ZB Institute of Technology', 'Leadership');
        break;
      case 'kill':
        ns.sleeve.setToCommitCrime(i, 'Homicide');
        break;
      case 'shock':
        ns.sleeve.setToShockRecovery(i);
        break;
      case 'upgrade':
        ns.tprint('Upgrading not yet supported.');
        break;
      case 'status':
        {
          const sTask = ns.sleeve.getTask(i);
          const sLoc = ns.sleeve.getSleeve(i).city;
          ns.tprint(`Sleeve ${i + 1}: ${sTask?.type ?? 'IDLE'} (${sLoc})`);
        }
        break;
      default:
        break;
    }
  }
}
