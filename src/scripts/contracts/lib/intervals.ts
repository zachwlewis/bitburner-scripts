/* eslint-disable prefer-rest-params */
import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  if (arguments[0].args.length !== 2) {
    ns.tprintf(`usage: intervals.js [host] [contract]`);
    ns.exit();
  }

  const HOST = arguments[0].args[0];
  const CONTRACT = arguments[0].args[1];

  const data = ns.codingcontract.getData(CONTRACT, HOST);
  const answer = merge_overlapping_intervals(data);
  ns.print(answer);
  const result = ns.codingcontract.attempt(answer, CONTRACT, HOST);
  ns.tprint(result);
}

export function merge_overlapping_intervals(intervals: number[][]): number[][] {
  intervals.sort(([a], [b]) => a - b);

  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const [imin, imax] = intervals[i];
      const [jmin, jmax] = intervals[j];

      if (jmin <= imax) {
        intervals[i] = [imin, Math.max(imax, jmax)];
        intervals.splice(j, 1);
        j = i;
      }
    }
  }
  return intervals;
}
