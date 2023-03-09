/* eslint-disable prefer-rest-params */
import { NS } from '@ns';

const A = 65;

export async function main(ns: NS): Promise<void> {
  if (arguments[0].args.length !== 3) {
    ns.tprintf(`usage: encryption.js [host] [contract] [mode]`);
    ns.exit();
  }

  const HOST = arguments[0].args[0];
  const CONTRACT = arguments[0].args[1];
  const MODE = arguments[0].args[2];

  const data = ns.codingcontract.getData(CONTRACT, HOST);
  ns.print(data);
  let answer;
  if (MODE === 1) answer = caesar(data[0], data[1]);
  else if (MODE === 2) answer = vigenere(data[0], data[1]);
  //else if (MODE === 3) answer = decompress_lz(data);
  else {
    ns.tprintf(`Invalid mode: ${MODE} Should be 1 or 2.`);
    ns.exit();
  }

  ns.print(answer);
  const result = ns.codingcontract.attempt(answer, CONTRACT, HOST);
  ns.tprint(result !== '' ? result : `Failed: ${answer}`);
}

/**
 * Rotates text.
 * @param {String} str Input text
 * @param {Number} rot Letters to rotate
 */
export function caesar(str: string, rot: number): string {
  const output = [];
  for (let i = 0; i < str.length; ++i) {
    if (str[i] === ' ') {
      output.push(' ');
      continue;
    }
    let value = str.charCodeAt(i) - A;
    value = ((value + 26 - rot) % 26) + A;
    output.push(String.fromCharCode(value));
  }

  return output.join('');
}

/**
 * Encrypts text with a Vigenère Cipher
 * @param {String} str
 * @param {String} key
 * @returns {String}
 */
export function vigenere(str: string, key: string): string {
  const fullkey = key.padEnd(str.length, key);
  const output = [];

  for (let i = 0; i < str.length; ++i) {
    const col = str.charCodeAt(i) - A;
    const row = fullkey.charCodeAt(i) - A;
    const value = ((col + row) % 26) + A;
    output.push(String.fromCharCode(value));
  }

  return output.join('');
}
