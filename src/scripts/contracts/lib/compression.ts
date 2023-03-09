/* eslint-disable prefer-rest-params */
import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  if (arguments[0].args.length !== 3) {
    ns.tprintf(`usage: compression.js [host] [contract] [mode]`);
    ns.exit();
  }

  const HOST = arguments[0].args[0];
  const CONTRACT = arguments[0].args[1];
  const MODE = arguments[0].args[2];

  const data = ns.codingcontract.getData(CONTRACT, HOST);
  ns.print(data);
  let answer;
  if (MODE === 1) answer = compress_rle(data);
  else if (MODE === 2) answer = decompress_lz(data);
  else if (MODE === 3) answer = compress_lz(data);
  else {
    ns.tprintf(`Invalid mode: ${MODE} Should be 1, 2 or 3.`);
    ns.exit();
  }

  ns.print(answer);
  const result = ns.codingcontract.attempt(answer, CONTRACT, HOST);
  ns.tprint(result);
}

/**
 * Encodes a string using RLE Compression
 * @param {String} input The string to compress
 * @returns {String} The encoded string
 */
export function compress_rle(input: string): string {
  /*
    Compression I: RLE Compression

    Run-length encoding (RLE) is a data compression technique which encodes data
    as a series of runs of a repeated single character. Runs are encoded as a
    length, followed by the character itself. Lengths are encoded as a single
    ASCII digit; runs of 10 characters or more are encoded by splitting them into
    multiple runs.

    You are given the following input string:
        QWWee11CCxxxxxxxcctdd6666666666gghhhhhhhhhyyyyyhhhCCMM66ggggggggg88S5
    Encode it using run-length encoding with the minimum possible output length.

    Examples:
        aaaaabccc            ->  5a1b3c
        aAaAaA               ->  1a1A1a1A1a1A
        111112333            ->  511233
        zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)
    */
  let char = input[0];
  let char_run = 1;
  const encoded = [];
  for (let i = 1; i < input.length; ++i) {
    if (input[i] !== char) {
      // New character encountered. Save out current run.
      encoded.push(char_run.toString());
      encoded.push(char);
      char = input[i];
      char_run = 1;
      continue;
    }

    if (++char_run === 10) {
      // Run length too long. Save out run.
      encoded.push('9');
      encoded.push(char);
      char_run = 1;
    }
  }

  encoded.push(char_run.toString());
  encoded.push(char);

  return encoded.join('');
}

/**
 * Decompresses an LZ-compressed string.
 * @param {String} input The LZ-compressed string to decompress.
 * @returns {String} The decompressed string.
 */
export function decompress_lz(input: string): string {
  /*
    Compression II: LZ Decompression

    Lempel-Ziv (LZ) compression is a data compression technique which encodes
    data using references to earlier parts of the data. In this variant of LZ,
    data is encoded in two types of chunk. Each chunk begins with a length L,
    encoded as a single ASCII digit from 1 to 9, followed by the chunk data,
    which is either:

    1. Exactly L characters, which are to be copied directly into the
    uncompressed data.
    2. A reference to an earlier part of the uncompressed data. To do this,
    the length is followed by a second ASCII digit X: each of the L output
    characters is a copy of the character X places before it in the
    uncompressed data.

    For both chunk types, a length of 0 instead means the chunk ends immediately,
    and the next character is the start of a new chunk. The two chunk types
    alternate, starting with type 1, and the final chunk may be of either type.

    Example: decoding '5aaabb450723abb' chunk-by-chunk
        5aaabb           ->  aaabb
        5aaabb45         ->  aaabbaaab
        5aaabb450        ->  aaabbaaab
        5aaabb45072      ->  aaabbaaababababa
        5aaabb450723abb  ->  aaabbaaababababaabb
    */

  let output = '';
  let idx = 0;
  let copy = true;

  while (idx < input.length) {
    const length = Number(input[idx++]);

    if (length === 0) {
      copy = !copy;
      continue;
    }

    if (copy) {
      // Direct copy
      output += input.substr(idx, length);
      idx += length;
    } else {
      // Backreference
      const offset = output.length - Number(input[idx++]);
      for (let i = 0; i < length; ++i) output += output[offset + i];
    }

    copy = !copy;
  }

  return output;
}

export function compress_lz(input: string): string {
  let cur_state = Array.from(Array(10), () => Array(10).fill(null));
  let new_state = Array.from(Array(10), () => Array(10));

  function set(state: string[][], i: number, j: number, str: string) {
    const current = state[i][j];
    if (current == null || str.length < current.length) {
      state[i][j] = str;
    } else if (str.length === current.length && Math.random() < 0.5) {
      // if two strings are the same length, pick randomly so that
      // we generate more possible inputs to Compression II
      state[i][j] = str;
    }
  }

  // initial state is a literal of length 1
  cur_state[0][1] = '';

  for (let i = 1; i < input.length; ++i) {
    for (const row of new_state) {
      row.fill(null);
    }
    const c = input[i];

    // handle literals
    for (let length = 1; length <= 9; ++length) {
      const string = cur_state[0][length];
      if (string == null) {
        continue;
      }

      if (length < 9) {
        // extend current literal
        set(new_state, 0, length + 1, string);
      } else {
        // start new literal
        set(new_state, 0, 1, string + '9' + input.substring(i - 9, i) + '0');
      }

      for (let offset = 1; offset <= Math.min(9, i); ++offset) {
        if (input[i - offset] === c) {
          // start new backreference
          set(new_state, offset, 1, string + length + input.substring(i - length, i));
        }
      }
    }

    // handle backreferences
    for (let offset = 1; offset <= 9; ++offset) {
      for (let length = 1; length <= 9; ++length) {
        const string = cur_state[offset][length];
        if (string == null) {
          continue;
        }

        if (input[i - offset] === c) {
          if (length < 9) {
            // extend current backreference
            set(new_state, offset, length + 1, string);
          } else {
            // start new backreference
            set(new_state, offset, 1, string + '9' + offset + '0');
          }
        }

        // start new literal
        set(new_state, 0, 1, string + length + offset);

        // end current backreference and start new backreference
        for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
          if (input[i - new_offset] === c) {
            set(new_state, new_offset, 1, string + length + offset + '0');
          }
        }
      }
    }

    const tmp_state = new_state;
    new_state = cur_state;
    cur_state = tmp_state;
  }

  let result = null;

  for (let len = 1; len <= 9; ++len) {
    let string = cur_state[0][len];
    if (string == null) {
      continue;
    }

    string += len + input.substring(input.length - len, input.length);
    if (result == null || string.length < result.length) {
      result = string;
    } else if (string.length == result.length && Math.random() < 0.5) {
      result = string;
    }
  }

  for (let offset = 1; offset <= 9; ++offset) {
    for (let len = 1; len <= 9; ++len) {
      let string = cur_state[offset][len];
      if (string == null) {
        continue;
      }

      string += len + '' + offset;
      if (result == null || string.length < result.length) {
        result = string;
      } else if (string.length == result.length && Math.random() < 0.5) {
        result = string;
      }
    }
  }

  return result ?? '';
}
