export function generate_ip(data: string): string[] {
  const ret: string[] = [];
  for (let a = 1; a <= 3; ++a) {
    for (let b = 1; b <= 3; ++b) {
      for (let c = 1; c <= 3; ++c) {
        for (let d = 1; d <= 3; ++d) {
          if (a + b + c + d === data.length) {
            const A = parseInt(data.substring(0, a), 10);
            const B = parseInt(data.substring(a, a + b), 10);
            const C = parseInt(data.substring(a + b, a + b + c), 10);
            const D = parseInt(data.substring(a + b + c, a + b + c + d), 10);
            if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
              const ip = [A.toString(), '.', B.toString(), '.', C.toString(), '.', D.toString()].join('');
              if (ip.length === data.length + 3) {
                ret.push(ip);
              }
            }
          }
        }
      }
    }
  }
  return ret; //.toString(); // Answer expected is the string representation of this array
}
