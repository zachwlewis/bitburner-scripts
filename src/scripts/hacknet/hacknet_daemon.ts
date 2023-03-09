/*
hacknet_daemon.js

Determines the optimal hacknet upgrade and buys it.
*/

import { NS } from '@ns';
import { disable_logs } from '/scripts/util/logging';
import { get_cache_resource, set_cache_resource } from '/scripts/util/cache';

type UpgradeType = 'level' | 'ram' | 'cores' | 'node';

interface Upgrade {
  type: UpgradeType;
  cost: number;
}

interface NodeUpgrade {
  index: number;
  level: Upgrade;
  ram: Upgrade;
  cores: Upgrade;
  cheapest: Upgrade;
}

export interface HacknetParams {
  reserves: number;
  minNodes: number;
}

const DEFAULT_PARAMS: HacknetParams = {
  reserves: Infinity,
  minNodes: 6,
};

export async function main(ns: NS): Promise<void> {
  disable_logs(ns, 'getServerMoneyAvailable', 'sleep');
  const logs: string[] = [];

  while (true) {
    const params = getDaemonParams(ns);
    const nodeCount = ns.hacknet.numNodes();
    const nodes = gatherAllUpgrades(ns);
    const node = getUpgradeCandidate(nodes);
    const newNode: Upgrade = { type: 'node', cost: ns.hacknet.getPurchaseNodeCost() };

    const cheapestUpgrade = node ? node.cheapest : newNode;

    const mustBuyNode = nodeCount < params.minNodes;

    const targetUpgrade = mustBuyNode ? newNode : cheapestUpgrade.cost < newNode.cost ? cheapestUpgrade : newNode;

    const currentMoney = ns.getServerMoneyAvailable('home');
    const money = currentMoney - params.reserves;

    while (logs.length > 10) logs.shift();

    // Print status:
    ns.clearLog();
    ns.printf(`╭──╼ HACK.NET ╾──────────────────────────╌╌`);
    ns.printf(`│ Nodes: ${nodeCount}`);
    ns.printf(`│ Money: ${ns.nFormat(currentMoney, '$0.00a')}`);
    ns.printf(`│ Reserves: ${params.reserves === Infinity ? '∞' : ns.nFormat(params.reserves, '$0.00a')}`);
    ns.printf(`├──╼ LOGS ╾──────────────────────────────╌╌`);
    for (const log of logs) ns.printf(`│ ${log}`);
    ns.printf(`╰─────────────────────────────────────╼ END`);

    if (money < targetUpgrade.cost) {
      await ns.sleep(2000);
      continue;
    }

    // We can afford the target upgrade.
    const nodeIndex = node?.index ?? 0;
    switch (targetUpgrade.type) {
      case 'cores':
        logs.push(`Upgrading cores for hacknet-server-${nodeIndex}: ${ns.nFormat(targetUpgrade.cost, '$0.00a')}.`);
        ns.hacknet.upgradeCore(nodeIndex, 1);
        break;
      case 'level':
        logs.push(`Upgrading level for hacknet-server-${nodeIndex}: ${ns.nFormat(targetUpgrade.cost, '$0.00a')}.`);
        ns.hacknet.upgradeLevel(nodeIndex, 1);
        break;
      case 'node':
        logs.push(`Buying new node for ${ns.nFormat(targetUpgrade.cost, '$0.00a')}.`);
        ns.hacknet.purchaseNode();
        break;
      case 'ram':
        logs.push(`Upgrading RAM for hacknet-server-${nodeIndex}: ${ns.nFormat(targetUpgrade.cost, '$0.00a')}.`);
        ns.hacknet.upgradeRam(nodeIndex, 1);
        break;
    }
  }
}

function getDaemonParams(ns: NS): HacknetParams {
  const p = get_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet');
  if (!p) set_cache_resource<HacknetParams>(ns, 'hacknet_daemon_params', 'hacknet', DEFAULT_PARAMS);
  return p ?? DEFAULT_PARAMS;
}

/**
 * Gathers the cost to upgrade each node.
 * @param {NS} ns
 * @returns {NodeUpgrade[]} Upgrade information for all nodes.
 */
function gatherAllUpgrades(ns: NS): NodeUpgrade[] {
  const NODE_COUNT = ns.hacknet.numNodes();
  const nodeUpgrades: NodeUpgrade[] = [];
  for (let i = 0; i < NODE_COUNT; ++i) {
    const upgrades: Upgrade[] = [
      { type: 'level', cost: ns.hacknet.getLevelUpgradeCost(i, 1) },
      { type: 'ram', cost: ns.hacknet.getRamUpgradeCost(i, 1) },
      { type: 'cores', cost: ns.hacknet.getCoreUpgradeCost(i, 1) },
    ];
    nodeUpgrades.push({
      index: i,
      level: upgrades[0],
      ram: upgrades[1],
      cores: upgrades[2],
      cheapest: upgrades.reduce((p, c) => (p.cost < c.cost ? p : c)),
    });
  }

  return nodeUpgrades;
}

/**
 * Finds the node with the cheapest upgrade
 * @param nodes
 * @returns The node with the cheapest upgrade or null if no nodes are owned.
 */
function getUpgradeCandidate(nodes: NodeUpgrade[]): NodeUpgrade | null {
  if (nodes.length === 0) return null;
  return nodes.reduce((p, c) => (p.cheapest.cost < c.cheapest.cost ? p : c));
}
