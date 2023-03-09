import { NS } from '@ns';
import { Colors } from '/scripts/util/colors';
export async function main(ns: NS): Promise<void> {
  const dc = `${Colors.brightWhite}dummy contracts${Colors.reset}`;
  const types = ns.codingcontract.getContractTypes();

  // Remove all dummy contracts from home machine.
  const dummyContracts = ns.ls('home', 'cct');
  dummyContracts.forEach((file) => ns.rm(file, 'home'));
  ns.tprintf(`Removing ${dc} from 'home'... ${Colors.yellow}done${Colors.reset}.`);

  // Create a dummy contract of each type.
  types.forEach((type) => ns.codingcontract.createDummyContract(type));
  ns.tprintf(`Generating ${dc} on 'home'... ${Colors.yellow}done${Colors.reset}.`);
  ns.tprintf(`${Colors.yellow}${types.length} ${dc} generated.`);
}
