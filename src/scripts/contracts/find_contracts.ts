import { NS } from '@ns';
import { ContractType } from '/scripts/contracts/lib/contract_types';
import { Colors } from '/scripts/util/colors';

// Contract solvers
import { array_jumping_1, array_jumping_2 } from '/scripts/contracts/lib/arrayjumping';
import {
  min_path_sum_triangle,
  shortest_grid_path,
  unique_grid_paths2,
  unique_grid_paths_1,
} from '/scripts/contracts/lib/arraypaths';
import { compress_lz, compress_rle, decompress_lz } from '/scripts/contracts/lib/compression';
import { caesar, vigenere } from '/scripts/contracts/lib/encryption';
import { hamming_binary_to_int, hamming_int_to_binary } from '/scripts/contracts/lib/hamming';
import { merge_overlapping_intervals } from '/scripts/contracts/lib/intervals';
import { sanitize_parenthesis } from '/scripts/contracts/lib/parenthesis';
import { find_largest_prime_factor } from '/scripts/contracts/lib/primefactor';
import { spiralize_matrix } from '/scripts/contracts/lib/spiralize';
import { stock_trade_profit } from '/scripts/contracts/lib/stocktrader';
import { subarray_with_max_sum } from '/scripts/contracts/lib/subarray';
import { find_all_valid_expressions } from '/scripts/contracts/lib/validexpressions';
import { total_ways_to_sum_1, total_ways_to_sum_2 } from '/scripts/contracts/lib/waystosum';
import { generate_ip } from '/scripts/contracts/lib/generateip';
import { proper_2_coloring } from '/scripts/contracts/lib/coloring';

/** Describes a contract. */
interface Contract {
  host: string;
  file: string;
  type: ContractType;
}

/** Describes the result of a contract attempt. */
interface ContractResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer?: string | number | any[];
  success: boolean;
  result: string;
}

export async function main(ns: NS): Promise<void> {
  const FLAGS = ns.flags([['solve', false]]);
  const contracts: Contract[] = [];
  gatherContracts(ns, 'home', '', contracts);
  contracts.sort((a, b) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0));

  let currentType = '';
  ns.tprintf(`╭────────────────────╮`);
  ns.tprintf(`│  CODING_CONTRACTS  │`);
  ns.tprintf(`├────────────────────┴───────────────────────╌╌`);
  let first = true;
  for (const contract of contracts) {
    if (contract.type !== currentType) {
      currentType = contract.type;
      if (!first) ns.tprintf(`├────────────────────────────────────────────╌╌`);
      first = false;
      ns.tprintf(`│ ${Colors.brightWhite}${currentType}${Colors.reset}`);
      ns.tprintf(`├────────────────────────────────────────────╌╌`);
    }
    const result: ContractResult = FLAGS.solve ? attemptContract(ns, contract) : { success: true, result: '' };
    const color = result.success ? Colors.green : Colors.red;
    ns.tprintf(`├╼ ${color}${contract.host} ${contract.file}${Colors.reset}`);
    ns.tprintf(`│    ${result.result}`);
    if (!result.success) ns.tprintf(`│    ${result.answer || 'Unanswered'}`);
  }
  ns.tprintf(`╰────────────────────────────────────────────╌╌`);
}

function processResult(attempt: string): ContractResult {
  const success = attempt !== '';
  const result = success ? attempt : 'Contract failed.';
  return { success: success, result: result };
}

function attemptContract(ns: NS, contract: Contract): ContractResult {
  let result: ContractResult = {
    success: false,
    result: `${contract.type} not yet implemented.`,
  };
  const data = ns.codingcontract.getData(contract.file, contract.host);
  let answer;
  let attempt;
  switch (contract.type) {
    case 'Algorithmic Stock Trader I':
      answer = stock_trade_profit(1, data);
      break;
    case 'Algorithmic Stock Trader II':
      answer = stock_trade_profit(Math.ceil(data.length / 2), data);
      break;
    case 'Algorithmic Stock Trader III':
      answer = stock_trade_profit(2, data);
      break;
    case 'Algorithmic Stock Trader IV':
      answer = stock_trade_profit(data[0], data[1]);
      break;
    case 'Array Jumping Game':
      answer = array_jumping_1(data);
      break;
    case 'Array Jumping Game II':
      answer = array_jumping_2(data);
      break;
    case 'Compression I: RLE Compression':
      answer = compress_rle(data);
      break;
    case 'Compression II: LZ Decompression':
      answer = decompress_lz(data);
      break;
    case 'Compression III: LZ Compression':
      answer = compress_lz(data);
      break;
    case 'Encryption I: Caesar Cipher':
      answer = caesar(data[0], data[1]);
      break;
    case 'Encryption II: Vigenère Cipher':
      answer = vigenere(data[0], data[1]);
      break;
    case 'Find All Valid Math Expressions':
      answer = find_all_valid_expressions(data[0], data[1]);
      break;
    case 'Find Largest Prime Factor':
      answer = find_largest_prime_factor(data);
      break;
    case 'Generate IP Addresses':
      answer = generate_ip(data);
      break;
    case 'HammingCodes: Encoded Binary to Integer':
      answer = hamming_binary_to_int(data);
      break;
    case 'HammingCodes: Integer to Encoded Binary':
      answer = hamming_int_to_binary(data);
      break;
    case 'Merge Overlapping Intervals':
      answer = merge_overlapping_intervals(data);
      break;
    case 'Minimum Path Sum in a Triangle':
      answer = min_path_sum_triangle(data);
      break;
    case 'Proper 2-Coloring of a Graph':
      answer = proper_2_coloring(data[0], data[1]);
      break;
    case 'Sanitize Parentheses in Expression':
      answer = sanitize_parenthesis(data);
      break;
    case 'Shortest Path in a Grid':
      answer = shortest_grid_path(data);
      break;
    case 'Spiralize Matrix':
      answer = spiralize_matrix(data);
      break;
    case 'Subarray with Maximum Sum':
      answer = subarray_with_max_sum(data);
      break;
    case 'Total Ways to Sum':
      answer = total_ways_to_sum_1(data);
      break;
    case 'Total Ways to Sum II':
      answer = total_ways_to_sum_2(data[0], data[1]);
      break;
    case 'Unique Paths in a Grid I':
      answer = unique_grid_paths_1(data);
      break;
    case 'Unique Paths in a Grid II':
      answer = unique_grid_paths2(data);
      break;
    default:
      break;
  }

  if (answer !== undefined) {
    attempt = ns.codingcontract.attempt(answer, contract.file, contract.host);

    result = processResult(attempt);
    result.answer = answer;
  }

  return result;
}

/**
 * Gathers all coding contracts into an array.
 */
function gatherContracts(ns: NS, host: string, parent: string, output: Contract[]) {
  // Gather contracts on current host.
  const contracts = ns.ls(host, 'cct');
  for (const contract of contracts) {
    const type = <ContractType>ns.codingcontract.getContractType(contract, host);
    output.push({ host: host, file: contract, type: type });
  }

  // Gather contracts on children.
  const children = ns.scan(host);
  for (const child of children) {
    if (child !== parent) gatherContracts(ns, child, host, output);
  }

  return output;
}
