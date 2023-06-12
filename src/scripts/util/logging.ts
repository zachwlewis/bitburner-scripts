import { NS } from '@ns';

export function disable_logs(ns: NS, ...functions: string[]): void {
  for (const fn of functions) ns.disableLog(fn);
}

export function enable_logs(ns: NS, ...functions: string[]): void {
  for (const fn of functions) ns.enableLog(fn);
}

export const formatMoney = (ns: NS, money: number): string => `$${ns.formatNumber(money, 2, 0, true)}`;
