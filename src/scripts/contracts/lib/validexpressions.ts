export function find_all_valid_expressions(num: string, target: number): string[] {
  function helper(
    res: string[],
    path: string,
    num: string,
    target: number,
    pos: number,
    evaluated: number,
    multed: number
  ) {
    if (pos === num.length) {
      if (target === evaluated) {
        res.push(path);
      }
      return;
    }
    for (let i = pos; i < num.length; ++i) {
      if (i != pos && num[pos] == '0') {
        break;
      }
      const cur = parseInt(num.substring(pos, i + 1));
      if (pos === 0) {
        helper(res, path + cur, num, target, i + 1, cur, cur);
      } else {
        helper(res, path + '+' + cur, num, target, i + 1, evaluated + cur, cur);
        helper(res, path + '-' + cur, num, target, i + 1, evaluated - cur, -cur);
        helper(res, path + '*' + cur, num, target, i + 1, evaluated - multed + multed * cur, multed * cur);
      }
    }
  }

  if (num == null || num.length === 0) {
    return [];
  }
  const result: string[] = [];
  helper(result, '', num, target, 0, 0, 0);
  return result;
}
