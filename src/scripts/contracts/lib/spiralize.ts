export function spiralize_matrix(data: number[][]): number[] {
  const spiral = [];
  const m = data.length;
  const n = data[0].length;
  let u = 0;
  let d = m - 1;
  let l = 0;
  let r = n - 1;
  let k = 0;
  while (true) {
    // Up
    for (let col = l; col <= r; col++) {
      spiral[k] = data[u][col];
      ++k;
    }
    if (++u > d) {
      break;
    }
    // Right
    for (let row = u; row <= d; row++) {
      spiral[k] = data[row][r];
      ++k;
    }
    if (--r < l) {
      break;
    }
    // Down
    for (let col = r; col >= l; col--) {
      spiral[k] = data[d][col];
      ++k;
    }
    if (--d < u) {
      break;
    }
    // Left
    for (let row = d; row >= u; row--) {
      spiral[k] = data[row][l];
      ++k;
    }
    if (++l > r) {
      break;
    }
  }

  return spiral;
}
