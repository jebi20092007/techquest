import { CellInfo, CellType, PowerUpDefinition, PowerUpType, TokenItem } from '../types/game';

// Exact cell mapping from specifications
export const TOKEN_CELL_IDS = [2, 5, 8, 12, 15, 17, 20, 23, 26, 30, 33, 37, 39];
export const POWERUP_CELL_IDS = [4, 11, 18, 25, 32, 38];
export const CHALLENGE_CELL_IDS = [7, 14, 21, 28, 35];
export const PENALTY_CELL_IDS = [10, 24, 34];
export const SAFE_CELL_IDS = [1, 3, 6, 9, 13, 16, 19, 22, 27, 29, 31, 36];
export const FINISH_CELL_ID = 40;

/**
 * Validates the cell mapping programmatically:
 * 1. Exactly 40 cells
 * 2. Every cell from 1 to 40 is mapped exactly once
 * 3. No overlaps across categories
 */
export function validateCellMapping(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allIds = [
    ...TOKEN_CELL_IDS,
    ...POWERUP_CELL_IDS,
    ...CHALLENGE_CELL_IDS,
    ...PENALTY_CELL_IDS,
    ...SAFE_CELL_IDS,
    FINISH_CELL_ID,
  ];

  if (allIds.length !== 40) {
    errors.push(`Expected 40 cells in total, but found ${allIds.length}`);
  }

  const seen = new Set<number>();
  for (const id of allIds) {
    if (id < 1 || id > 40) {
      errors.push(`Cell ID ${id} is out of bounds (1-40)`);
    }
    if (seen.has(id)) {
      errors.push(`Duplicate cell assignment for ID ${id}`);
    }
    seen.add(id);
  }

  for (let i = 1; i <= 40; i++) {
    if (!seen.has(i)) {
      errors.push(`Missing cell ID ${i}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate perimeter coordinates for 11x11 grid:
 * - Top row: 1–11 (row 1, col 1..11)
 * - Right column: 12–21 (row 2..11, col 11)
 * - Bottom row: 22–31 (row 11, col 10..1)
 * - Left column: 32–40 (row 10..2, col 1)
 */
export function getCellGridPosition(cellId: number): { row: number; col: number } {
  if (cellId >= 1 && cellId <= 11) {
    // Top row, left to right
    return { row: 1, col: cellId };
  } else if (cellId >= 12 && cellId <= 21) {
    // Right column, top to bottom
    const offset = cellId - 11; // 12 -> 1, 21 -> 10
    return { row: 1 + offset, col: 11 };
  } else if (cellId >= 22 && cellId <= 31) {
    // Bottom row, right to left
    const offset = cellId - 21; // 22 -> 1 (col 10), 31 -> 10 (col 1)
    return { row: 11, col: 11 - offset };
  } else if (cellId >= 32 && cellId <= 40) {
    // Left column, bottom to top
    const offset = cellId - 31; // 32 -> 1 (row 10), 40 -> 9 (row 2)
    return { row: 11 - offset, col: 1 };
  }
  return { row: 1, col: 1 };
}

// Cell category metadata
function getCellType(cellId: number): CellType {
  if (cellId === FINISH_CELL_ID) return 'finish';
  if (TOKEN_CELL_IDS.includes(cellId)) return 'token';
  if (POWERUP_CELL_IDS.includes(cellId)) return 'powerup';
  if (CHALLENGE_CELL_IDS.includes(cellId)) return 'challenge';
  if (PENALTY_CELL_IDS.includes(cellId)) return 'penalty';
  return 'safe';
}

function getCellName(cellId: number, type: CellType): string {
  switch (type) {
    case 'finish':
      return 'The Singularity';
    case 'token':
      return `Data Cache #${cellId}`;
    case 'powerup':
      return `Overclock Node #${cellId}`;
    case 'challenge':
      return `Algorithm Gate #${cellId}`;
    case 'penalty':
      return `Memory Leak #${cellId}`;
    case 'safe':
    default:
      return `Neutral Buffer #${cellId}`;
  }
}

function getCellDescription(type: CellType): string {
  switch (type) {
    case 'finish':
      return 'Exact landing finishes the quest!';
    case 'token':
      return 'Collect a unique Computer Science Data Token (+5 pts).';
    case 'powerup':
      return 'Claim a tactical power-up from the shared supply.';
    case 'challenge':
      return 'Solve an algorithmic question (+8 pts; -5 on 1st fail, 1 retry).';
    case 'penalty':
      return 'Memory corruption causes -5 points unless shielded!';
    case 'safe':
    default:
      return 'Resting cell. No hazards or mutations.';
  }
}

// Generate the 40 cells
export const BOARD_CELLS: CellInfo[] = Array.from({ length: 40 }, (_, idx) => {
  const id = idx + 1;
  const type = getCellType(id);
  const { row, col } = getCellGridPosition(id);
  return {
    id,
    type,
    name: getCellName(id, type),
    description: getCellDescription(type),
    gridRow: row,
    gridCol: col,
  };
});

// The 13 unique Computer Science Tokens
export const GAME_TOKENS: Record<number, TokenItem> = {
  2: {
    id: 'TOK_02',
    cellId: 2,
    name: 'Pointer Crystal',
    category: 'Memory & References',
    description: 'Stores direct hardware memory address references for instant dereferencing.',
    symbol: '💎',
  },
  5: {
    id: 'TOK_05',
    cellId: 5,
    name: 'Hash Key Core',
    category: 'Hashing & Tables',
    description: 'Provides deterministic O(1) average lookup indexing via cryptographic hashing.',
    symbol: '🔑',
  },
  8: {
    id: 'TOK_08',
    cellId: 8,
    name: 'Array Segment',
    category: 'Contiguous Memory',
    description: 'Contiguous memory chunk enabling direct arithmetic index offsets.',
    symbol: '🧱',
  },
  12: {
    id: 'TOK_12',
    cellId: 12,
    name: 'Binary Node',
    category: 'Hierarchical Trees',
    description: 'Dual-child branch structure used for logarithmic BST traversals.',
    symbol: '🌿',
  },
  15: {
    id: 'TOK_15',
    cellId: 15,
    name: 'Graph Edge',
    category: 'Network Graphs',
    description: 'Directional weighted relationship connecting disparate vertex states.',
    symbol: '🕸️',
  },
  17: {
    id: 'TOK_17',
    cellId: 17,
    name: 'Stack Frame',
    category: 'LIFO Execution',
    description: 'Call-stack context frame tracking local registers and return pointers.',
    symbol: '🥞',
  },
  20: {
    id: 'TOK_20',
    cellId: 20,
    name: 'Queue Ticket',
    category: 'FIFO Scheduling',
    description: 'Fair scheduling token guaranteeing first-come first-served processing.',
    symbol: '🎫',
  },
  23: {
    id: 'TOK_23',
    cellId: 23,
    name: 'Heap Root',
    category: 'Priority Queues',
    description: 'Maintains heap-order invariant for instant O(1) minimum/maximum inspection.',
    symbol: '⛰️',
  },
  26: {
    id: 'TOK_26',
    cellId: 26,
    name: 'Trie Leaf',
    category: 'Prefix Trees',
    description: 'String retrieval automaton node providing instant prefix searches.',
    symbol: '🍃',
  },
  30: {
    id: 'TOK_30',
    cellId: 30,
    name: 'B-Tree Block',
    category: 'Disk Storage',
    description: 'Multi-way balanced search tree block optimized for block-device caching.',
    symbol: '📦',
  },
  33: {
    id: 'TOK_33',
    cellId: 33,
    name: 'Cache Line',
    category: 'CPU Hardware',
    description: '64-byte L1 cache line preventing latency-heavy main memory stalls.',
    symbol: '⚡',
  },
  37: {
    id: 'TOK_37',
    cellId: 37,
    name: 'Bit Mask',
    category: 'Bit Manipulation',
    description: 'Bitwise bitfield pattern enabling parallel flag evaluations in 1 cycle.',
    symbol: '🎭',
  },
  39: {
    id: 'TOK_39',
    cellId: 39,
    name: 'Matrix Cell',
    category: 'Linear Algebra',
    description: 'Two-dimensional tensor coordinate for spatial transformations.',
    symbol: '📐',
  },
};

// Power-up definitions (6 types)
export const POWERUP_DEFINITIONS: Record<PowerUpType, PowerUpDefinition> = {
  extra_move: {
    type: 'extra_move',
    name: 'Extra Move',
    description: 'Immediately roll the dice again without ending your turn.',
    iconName: 'Dices',
    color: '#38bdf8', // sky-400
  },
  shield: {
    type: 'shield',
    name: 'Firewall Shield',
    description: 'Blocks the next penalty cell from draining 5 points.',
    iconName: 'ShieldCheck',
    color: '#10b981', // emerald-500
  },
  skip_turn: {
    type: 'skip_turn',
    name: 'Skip Opponent',
    description: "Suspends the next eligible player's upcoming turn in the circular queue.",
    iconName: 'ClockAlert',
    color: '#f59e0b', // amber-500
  },
  double_score: {
    type: 'double_score',
    name: 'Double Score',
    description: 'Doubles the point value of your next collected Data Token (+10 pts).',
    iconName: 'Sparkles',
    color: '#a855f7', // purple-500
  },
  reverse_move: {
    type: 'reverse_move',
    name: 'Reverse Move',
    description: 'Step backwards by exactly 3 cells along your doubly-linked path.',
    iconName: 'RotateCcw',
    color: '#ec4899', // pink-500
  },
  bonus_token: {
    type: 'bonus_token',
    name: 'Bonus Token',
    description: 'Select and instantly acquire any uncollected Computer Science token.',
    iconName: 'Gift',
    color: '#fbbf24', // yellow-400
  },
};

export const INITIAL_POWERUP_SUPPLY_PER_TYPE = 3;
