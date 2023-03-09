export function min_path_sum_triangle(data: number[][]): number {
  const n = data.length;
  const dp = data[n - 1].slice();
  for (let i = n - 2; i > -1; --i) {
    for (let j = 0; j < data[i].length; ++j) {
      dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j];
    }
  }
  return dp[0];
}

export function unique_grid_paths_1(data: number[]): number {
  const n = data[0]; // Number of rows
  const m = data[1]; // Number of columns
  const currentRow = [];
  currentRow.length = n;
  for (let i = 0; i < n; i++) {
    currentRow[i] = 1;
  }
  for (let row = 1; row < m; row++) {
    for (let i = 1; i < n; i++) {
      currentRow[i] += currentRow[i - 1];
    }
  }
  return currentRow[n - 1];
}

export function unique_grid_paths2(data: number[][]): number {
  const obstacleGrid = [];
  obstacleGrid.length = data.length;
  for (let i = 0; i < obstacleGrid.length; ++i) {
    obstacleGrid[i] = data[i].slice();
  }
  for (let i = 0; i < obstacleGrid.length; i++) {
    for (let j = 0; j < obstacleGrid[0].length; j++) {
      if (obstacleGrid[i][j] == 1) {
        obstacleGrid[i][j] = 0;
      } else if (i == 0 && j == 0) {
        obstacleGrid[0][0] = 1;
      } else {
        obstacleGrid[i][j] = (i > 0 ? obstacleGrid[i - 1][j] : 0) + (j > 0 ? obstacleGrid[i][j - 1] : 0);
      }
    }
  }
  return obstacleGrid[obstacleGrid.length - 1][obstacleGrid[0].length - 1];
}

export function shortest_grid_path(data: number[][]): string {
  // slightly adapted and simplified to get rid of MinHeap usage, and construct
  // a valid path from potential candidates
  // MinHeap replaced by simple array acting as queue (breadth first search)
  const columns = data[0].length;
  const rows = data.length;
  const dstY = rows - 1;
  const dstX = columns - 1;

  const distance: number[][] = JSON.parse(JSON.stringify(data));
  for (let i = 0; i < rows; ++i) for (let j = 0; j < columns; ++j) distance[i][j] = Infinity;

  const validPosition = (y: number, x: number): boolean =>
    y >= 0 && y < rows && x >= 0 && x < columns && data[y][x] == 0;

  // List in-bounds and passable neighbors
  function* neighbors(y: number, x: number) {
    if (validPosition(y - 1, x)) yield [y - 1, x]; // Up
    if (validPosition(y + 1, x)) yield [y + 1, x]; // Down
    if (validPosition(y, x - 1)) yield [y, x - 1]; // Left
    if (validPosition(y, x + 1)) yield [y, x + 1]; // Right
  }

  // Prepare starting point
  distance[0][0] = 0;

  // Simplified version. d < distance[yN][xN] should never happen for BFS if
  // d != infinity, so we skip changeweight and simplify implementation
  // algo always expands shortest path, distance != infinity means a <= length
  // path reaches it, only remaining case to solve is infinity
  let next: number[] | undefined = [0, 0];
  const queue: number[][] = [];
  while (next !== undefined) {
    const [y, x]: number[] = next;
    const currentDistance = distance[y][x] + 1;
    for (const [yN, xN] of neighbors(y, x)) {
      if (distance[yN][xN] > currentDistance) {
        queue.push([yN, xN]);
        distance[yN][xN] = currentDistance;
      }
    }
    next = queue.shift();
  }

  // No path at all?
  if (distance[dstY][dstX] == Infinity) return '';

  //trace a path back to start
  let path = '';
  let [yC, xC] = [dstY, dstX];
  while (xC != 0 || yC != 0) {
    const dist = distance[yC][xC];
    for (const [yF, xF] of neighbors(yC, xC)) {
      if (distance[yF][xF] == dist - 1) {
        path = (xC == xF ? (yC == yF + 1 ? 'D' : 'U') : xC == xF + 1 ? 'R' : 'L') + path;
        [yC, xC] = [yF, xF];
        break;
      }
    }
  }
  return path;
}
