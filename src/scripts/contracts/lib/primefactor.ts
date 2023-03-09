export function find_largest_prime_factor(value: number): number {
  let fac = 2;
  let n = value;
  while (n > (fac - 1) * (fac - 1)) {
    while (n % fac === 0) {
      n = Math.round(n / fac);
    }
    ++fac;
  }
  return n === 1 ? fac - 1 : n;
}
