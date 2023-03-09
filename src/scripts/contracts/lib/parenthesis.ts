export function sanitize_parenthesis(expression: string): string[] {
  if (expression.length === 0) return [''];

  function sanitary(value: string): boolean {
    let open = 0;
    for (const char of value) {
      if (char === '(') open++;
      else if (char === ')') open--;
      if (open < 0) return false;
    }
    return open === 0;
  }

  const queue = [expression];
  const tested = new Set();
  tested.add(expression);
  let found = false;
  const solution = [];
  while (queue.length > 0) {
    expression = queue.shift() ?? '';
    if (sanitary(expression)) {
      solution.push(expression);
      found = true;
    }
    if (found) continue;
    for (let i = 0; i < expression.length; i++) {
      if (expression.charAt(i) !== '(' && expression.charAt(i) !== ')') continue;
      const stripped = expression.slice(0, i) + expression.slice(i + 1);
      if (!tested.has(stripped)) {
        queue.push(stripped);
        tested.add(stripped);
      }
    }
  }
  return solution;
}
