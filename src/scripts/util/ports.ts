import { NetscriptPort, NS } from '@ns';

export type AttackType = 'hack' | 'weaken' | 'grow' | 'terminate';

export interface AttackRequest {
  host: string;
  type: AttackType;
  threads: number;
  stock: boolean;
}

export interface AttackResponse {
  pid: number;
  host: string;
  type: AttackType;
  phase: 'start' | 'end';
  value?: number;
}

/** The port attackers read from. */
export const P_ATK_IN = (ns: NS): NetscriptPort => ns.getPortHandle(1);
/** The port that attackers write to. */
export const P_ATK_OUT = (ns: NS): NetscriptPort => ns.getPortHandle(2);

export async function ensure_write(ns: NS, port: NetscriptPort, value: string | number): Promise<number> {
  let elapsed = 0;

  while (!port.tryWrite(value)) {
    await ns.sleep(500);
    elapsed += 0.5;
  }

  return elapsed;
}

export async function main(ns: NS): Promise<void> {
  ns.exit();
}
