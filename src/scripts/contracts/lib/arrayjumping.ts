export function array_jumping_1(data: number[]): number {
  const n = data.length;
  let i = 0;
  for (let reach = 0; i < n && i <= reach; ++i) {
    reach = Math.max(i + data[i], reach);
  }
  const solution = i === n;
  return solution ? 1 : 0;
}

export function array_jumping_2(data: number[]): number | string {
  if (data[0] == 0) return '0';
  const n = data.length;
  let reach = 0;
  let jumps = 0;
  let lastJump = -1;
  while (reach < n - 1) {
    let jumpedFrom = -1;
    for (let i = reach; i > lastJump; i--) {
      if (i + data[i] > reach) {
        reach = i + data[i];
        jumpedFrom = i;
      }
    }
    if (jumpedFrom === -1) {
      jumps = 0;
      break;
    }
    lastJump = jumpedFrom;
    jumps++;
  }
  return jumps;
}
