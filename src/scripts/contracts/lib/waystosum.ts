export function total_ways_to_sum_1(data: number): number {
  const ways = [1];
  ways.length = data + 1;
  ways.fill(0, 1);
  for (let i = 1; i < data; ++i) {
    for (let j = i; j <= data; ++j) {
      ways[j] += ways[j - i];
    }
  }
  return ways[data];
}

export function total_ways_to_sum_2(n: number, s: number[]): number {
  const ways = [1];
  ways.length = n + 1;
  ways.fill(0, 1);
  for (let i = 0; i < s.length; i++) {
    for (let j = s[i]; j <= n; j++) {
      ways[j] += ways[j - s[i]];
    }
  }
  return ways[n];
}
