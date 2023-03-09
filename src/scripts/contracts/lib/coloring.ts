export function proper_2_coloring(verts: number, edges: number[][]): number[] {
  // convert from edges to nodes
  const nodes: number[][] = new Array(verts).fill(0).map(() => []);
  for (const e of edges) {
    nodes[e[0]].push(e[1]);
    nodes[e[1]].push(e[0]);
  }
  // solution graph starts out undefined and fills in with 0s and 1s
  const solution = new Array(verts).fill(undefined);
  let oddCycleFound = false;
  // recursive function for DFS
  const traverse = (index: number, color: number) => {
    if (oddCycleFound) {
      // leave immediately if an invalid cycle was found
      return;
    }
    if (solution[index] === color) {
      // node was already hit and is correctly colored
      return;
    }
    if (solution[index] === (color ^ 1)) {
      // node was already hit and is incorrectly colored: graph is uncolorable
      oddCycleFound = true;
      return;
    }
    solution[index] = color;
    for (const n of nodes[index]) {
      traverse(n, color ^ 1);
    }
  };
  // repeat run for as long as undefined nodes are found, in case graph isn't fully connected
  while (!oddCycleFound && solution.some((e) => e === undefined)) {
    traverse(solution.indexOf(undefined), 0);
  }
  if (oddCycleFound) return []; // TODO: Bug #3755 in bitburner requires a string literal. Will this be fixed?
  return solution;
}
