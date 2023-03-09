import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  const flags = ns.flags([['threads', 1]]);

  while (true) await ns.weaken('n00dles', { threads: <number>flags.threads });
}
