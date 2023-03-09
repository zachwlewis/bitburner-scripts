/* eslint-disable prefer-rest-params */
import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  if (arguments[0].args.length !== 3) {
    ns.tprintf(`usage: spiralize.js [host] [contract] [mode]`);
    ns.exit();
  }

  const HOST = arguments[0].args[0];
  const CONTRACT = arguments[0].args[1];
  const MODE = arguments[0].args[2];

  const data = ns.codingcontract.getData(CONTRACT, HOST);
  ns.print(data);

  let answer = 0;

  if (MODE === 1) answer = stock_trade_profit(1, data);
  else if (MODE === 2) answer = stock_trade_profit(Math.ceil(data.length / 2), data);
  else if (MODE === 3) answer = stock_trade_profit(2, data);
  else if (MODE === 4) {
    answer = stock_trade_profit(<number>data[0], <number[]>data[1]);
  } else {
    ns.tprintf(`invalid mode: ${MODE} - must be 1, 2, 3 or 4.`);
    ns.exit();
  }

  ns.print(answer);
  const result = ns.codingcontract.attempt(answer, CONTRACT, HOST);
  ns.tprintf(`Result: ${result}`);
}

export function stock_trade_profit(maxTrades: number, stockPrices: number[]): number {
  let i, j, k;

  let tempStr = '[0';
  for (i = 0; i < stockPrices.length; i++) {
    tempStr += ',0';
  }
  tempStr += ']';
  let tempArr = '[' + tempStr;
  for (i = 0; i < maxTrades - 1; i++) {
    tempArr += ',' + tempStr;
  }
  tempArr += ']';

  const highestProfit = JSON.parse(tempArr);

  for (i = 0; i < maxTrades; i++) {
    for (j = 0; j < stockPrices.length; j++) {
      // Buy / Start
      for (k = j; k < stockPrices.length; k++) {
        // Sell / End
        let profit;
        const sell_profit = stockPrices[k] - stockPrices[j];
        if (i > 0 && j > 0 && k > 0) {
          profit = Math.max(
            highestProfit[i][k],
            highestProfit[i - 1][k],
            highestProfit[i][k - 1],
            highestProfit[i - 1][j - 1] + sell_profit
          );
        } else if (i > 0 && j > 0) {
          profit = Math.max(
            highestProfit[i][k],
            highestProfit[i - 1][k],
            highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]
          );
        } else if (i > 0 && k > 0) {
          profit = Math.max(
            highestProfit[i][k],
            highestProfit[i - 1][k],
            highestProfit[i][k - 1],
            stockPrices[k] - stockPrices[j]
          );
        } else if (j > 0 && k > 0) {
          profit = Math.max(highestProfit[i][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
        } else {
          profit = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
        }
        highestProfit[i][k] = profit;
      }
    }
  }
  return highestProfit[maxTrades - 1][stockPrices.length - 1];
}
