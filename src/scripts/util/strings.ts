import { NS } from '@ns';

const FormattedNumberMatch = new RegExp('(\\d+\\.?\\d+)(\\w)?');
const NumberMultipliers = new Map<string, number>([
  ['k', 1e3],
  ['m', 1e6],
  ['b', 1e9],
  ['t', 1e12],
]);

export const parseFormattedNumber = (s: string): number => {
  const result = FormattedNumberMatch.exec(s);
  if (!result) {
    return 0;
  }

  const value = parseFloat(result[1]);
  const multiplier = NumberMultipliers.get(result[2]) ?? 1;
  return value * multiplier;
};
