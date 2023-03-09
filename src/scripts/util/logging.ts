import { NS } from '@ns';

export function disable_logs(ns: NS, ...functions: string[]): void {
  for (const fn of functions) ns.disableLog(fn);
}

export function enable_logs(ns: NS, ...functions: string[]): void {
  for (const fn of functions) ns.enableLog(fn);
}
