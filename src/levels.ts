import { WORLD } from './constants';

export interface QBlock { col: number; row: number; contents: 'coin' | 'mushroom'; }
export interface Tile { col: number; row: number; }
export interface Pipe { col: number; height: number; }
export interface GroundSpan { start: number; end: number; }

export interface LevelData {
  name: string;
  groundSpans: GroundSpan[];
  pipes: Pipe[];
  bricks: Tile[];
  qBlocks: QBlock[];
  coins: Tile[];
  goombas: number[];
  koopas: number[];
  fireFlowers?: Tile[];
  bowser?: { col: number };
  flagCol: number;
  playerStart: { col: number; row: number };
}

const W = WORLD.cols - 1; // rightmost column index

/**
 * 11 hand-crafted levels, each progressively harder.
 *
 * Conventions:
 *   - Row 15 is the top of the ground; row 16 is the bottom of the ground.
 *   - Player and enemies stand on top of the ground at row 14 (center y).
 *   - Pits are simply gaps in `groundSpans`.
 *   - Flag is placed near the right side; the level always ends with ground
 *     under the flag so the player can land on it.
 */
export const LEVELS: LevelData[] = [
  // 1 — tutorial + Bowser test arena (fire flower placed early so you can
  // grab it on your way to the boss).
  {
    name: '1-1 First Steps',
    groundSpans: [
      { start: 0, end: 30 },
      { start: 34, end: 60 },
      { start: 64, end: W }
    ],
    pipes: [{ col: 22, height: 2 }, { col: 28, height: 2 }],
    bricks: [
      { col: 40, row: 11 }, { col: 41, row: 11 }, { col: 43, row: 11 }, { col: 44, row: 11 }
    ],
    qBlocks: [
      { col: 42, row: 11, contents: 'mushroom' },
      { col: 50, row: 11, contents: 'coin' }
    ],
    coins: [
      { col: 5, row: 13 }, { col: 8, row: 13 }, { col: 12, row: 13 },
      { col: 40, row: 9 }, { col: 44, row: 9 }
    ],
    goombas: [25, 45, 55, 75],
    koopas: [],
    fireFlowers: [{ col: 15, row: 13 }],
    bowser: { col: 38 },
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 2 — introduces koopas + slightly more pits.
  {
    name: '1-2 Watch the Shells',
    groundSpans: [
      { start: 0, end: 20 },
      { start: 24, end: 38 },
      { start: 42, end: 58 },
      { start: 62, end: W }
    ],
    pipes: [{ col: 30, height: 3 }],
    bricks: [
      { col: 14, row: 11 }, { col: 15, row: 11 }, { col: 16, row: 11 },
      { col: 48, row: 11 }, { col: 49, row: 11 }, { col: 50, row: 11 }
    ],
    qBlocks: [
      { col: 15, row: 9, contents: 'mushroom' },
      { col: 49, row: 9, contents: 'coin' }
    ],
    coins: [
      { col: 10, row: 13 }, { col: 27, row: 13 }, { col: 45, row: 13 },
      { col: 70, row: 13 }, { col: 80, row: 13 }
    ],
    goombas: [12, 50, 70],
    koopas: [33, 65],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 3 — introduces the Fire Flower and Bowser test fight.
  {
    name: '1-3 Fire & Fury',
    groundSpans: [{ start: 0, end: W }],
    pipes: [{ col: 12, height: 2 }, { col: 60, height: 3 }],
    bricks: [
      // Raised platform for the fire flower.
      { col: 26, row: 11 }, { col: 27, row: 11 }, { col: 28, row: 11 }, { col: 29, row: 11 },
      // Cover for the Bowser arena entry.
      { col: 55, row: 11 }, { col: 56, row: 11 }
    ],
    qBlocks: [
      { col: 18, row: 11, contents: 'mushroom' },
      { col: 40, row: 11, contents: 'coin' }
    ],
    coins: [
      { col: 5, row: 13 }, { col: 9, row: 13 }, { col: 14, row: 13 },
      { col: 27, row: 9 }, { col: 28, row: 9 },
      { col: 38, row: 13 }, { col: 42, row: 13 }, { col: 46, row: 13 },
      { col: 52, row: 13 }, { col: 55, row: 9 }, { col: 56, row: 9 }
    ],
    // Two goombas + a koopa guard the fire flower platform.
    goombas: [22, 31, 50],
    koopas: [33],
    fireFlowers: [{ col: 28, row: 10 }],
    bowser: { col: 80 },
    flagCol: 96,
    playerStart: { col: 2, row: 14 }
  },

  // 4 — staircases up and down.
  {
    name: '1-4 Staircase Stomp',
    groundSpans: [{ start: 0, end: W }],
    pipes: [{ col: 18, height: 2 }],
    bricks: [
      // up staircase
      { col: 30, row: 14 },
      { col: 31, row: 14 }, { col: 31, row: 13 },
      { col: 32, row: 14 }, { col: 32, row: 13 }, { col: 32, row: 12 },
      { col: 33, row: 14 }, { col: 33, row: 13 }, { col: 33, row: 12 }, { col: 33, row: 11 },
      // gap then down staircase
      { col: 40, row: 14 }, { col: 40, row: 13 }, { col: 40, row: 12 }, { col: 40, row: 11 },
      { col: 41, row: 14 }, { col: 41, row: 13 }, { col: 41, row: 12 },
      { col: 42, row: 14 }, { col: 42, row: 13 },
      { col: 43, row: 14 },
      // big floating platform
      { col: 60, row: 10 }, { col: 61, row: 10 }, { col: 62, row: 10 }, { col: 63, row: 10 }
    ],
    qBlocks: [
      { col: 50, row: 11, contents: 'mushroom' },
      { col: 75, row: 11, contents: 'coin' }
    ],
    coins: [
      { col: 33, row: 10 }, { col: 40, row: 10 },
      { col: 60, row: 8 }, { col: 63, row: 8 }
    ],
    goombas: [10, 25, 50, 70, 85],
    koopas: [55, 78],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 5 — pit gauntlet.
  {
    name: '1-5 Mind the Gap',
    groundSpans: [
      { start: 0, end: 12 },
      { start: 16, end: 22 },
      { start: 26, end: 32 },
      { start: 36, end: 44 },
      { start: 48, end: 56 },
      { start: 60, end: 70 },
      { start: 74, end: W }
    ],
    pipes: [],
    bricks: [
      { col: 14, row: 11 }, { col: 24, row: 11 }, { col: 34, row: 11 },
      { col: 46, row: 11 }, { col: 58, row: 11 }, { col: 72, row: 11 }
    ],
    qBlocks: [
      { col: 14, row: 8, contents: 'mushroom' },
      { col: 34, row: 8, contents: 'coin' },
      { col: 58, row: 8, contents: 'coin' }
    ],
    coins: [
      { col: 5, row: 13 }, { col: 20, row: 13 }, { col: 40, row: 13 },
      { col: 52, row: 13 }, { col: 65, row: 13 }, { col: 80, row: 13 }
    ],
    goombas: [10, 28, 50, 80],
    koopas: [40, 65],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 6 — pipe forest.
  {
    name: '1-6 Pipe Forest',
    groundSpans: [{ start: 0, end: W }],
    pipes: [
      { col: 12, height: 2 }, { col: 18, height: 3 },
      { col: 26, height: 4 }, { col: 34, height: 3 },
      { col: 42, height: 5 }, { col: 52, height: 2 },
      { col: 60, height: 4 }, { col: 70, height: 3 },
      { col: 80, height: 2 }
    ],
    bricks: [],
    qBlocks: [
      { col: 30, row: 8, contents: 'mushroom' },
      { col: 56, row: 11, contents: 'coin' }
    ],
    coins: [
      { col: 13, row: 11 }, { col: 19, row: 10 }, { col: 27, row: 9 },
      { col: 35, row: 10 }, { col: 53, row: 11 }, { col: 71, row: 10 }
    ],
    goombas: [8, 22, 38, 50, 65, 78],
    koopas: [46, 84],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 7 — wide pits, requires running jumps.
  {
    name: '1-7 Leap of Faith',
    groundSpans: [
      { start: 0, end: 14 },
      { start: 21, end: 30 },
      { start: 37, end: 46 },
      { start: 53, end: 62 },
      { start: 69, end: W }
    ],
    pipes: [{ col: 28, height: 2 }, { col: 60, height: 3 }],
    bricks: [
      { col: 17, row: 10 }, { col: 18, row: 10 },
      { col: 33, row: 10 }, { col: 34, row: 10 },
      { col: 49, row: 10 }, { col: 50, row: 10 },
      { col: 65, row: 10 }, { col: 66, row: 10 }
    ],
    qBlocks: [
      { col: 18, row: 8, contents: 'mushroom' },
      { col: 50, row: 8, contents: 'coin' }
    ],
    coins: [
      { col: 17, row: 8 }, { col: 33, row: 8 }, { col: 49, row: 8 }, { col: 65, row: 8 },
      { col: 75, row: 13 }, { col: 82, row: 13 }
    ],
    goombas: [10, 25, 42, 58, 75, 86],
    koopas: [40, 78],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 8 — vertical-ish, lots of bricks to bounce on.
  {
    name: '1-8 Sky High',
    groundSpans: [{ start: 0, end: W }],
    pipes: [{ col: 8, height: 2 }],
    bricks: [
      { col: 14, row: 12 }, { col: 15, row: 12 },
      { col: 20, row: 10 }, { col: 21, row: 10 }, { col: 22, row: 10 },
      { col: 28, row: 8 }, { col: 29, row: 8 }, { col: 30, row: 8 },
      { col: 36, row: 6 }, { col: 37, row: 6 }, { col: 38, row: 6 },
      { col: 46, row: 8 }, { col: 47, row: 8 },
      { col: 54, row: 10 }, { col: 55, row: 10 }, { col: 56, row: 10 },
      { col: 64, row: 12 }, { col: 65, row: 12 },
      { col: 74, row: 10 }, { col: 75, row: 10 }, { col: 76, row: 10 },
      { col: 84, row: 12 }
    ],
    qBlocks: [
      { col: 21, row: 8, contents: 'mushroom' },
      { col: 37, row: 4, contents: 'coin' },
      { col: 75, row: 8, contents: 'coin' }
    ],
    coins: [
      { col: 14, row: 10 }, { col: 22, row: 8 }, { col: 29, row: 6 }, { col: 37, row: 4 },
      { col: 47, row: 6 }, { col: 55, row: 8 }, { col: 65, row: 10 }
    ],
    goombas: [12, 32, 50, 70, 88],
    koopas: [42, 80],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 9 — enemy swarm.
  {
    name: '1-9 Swarm',
    groundSpans: [
      { start: 0, end: 25 },
      { start: 29, end: 55 },
      { start: 59, end: W }
    ],
    pipes: [{ col: 35, height: 2 }, { col: 65, height: 2 }],
    bricks: [
      { col: 20, row: 11 }, { col: 21, row: 11 }, { col: 22, row: 11 },
      { col: 45, row: 11 }, { col: 46, row: 11 }, { col: 47, row: 11 },
      { col: 70, row: 11 }, { col: 71, row: 11 }, { col: 72, row: 11 }
    ],
    qBlocks: [
      { col: 21, row: 9, contents: 'mushroom' },
      { col: 71, row: 9, contents: 'coin' }
    ],
    coins: [
      { col: 5, row: 13 }, { col: 12, row: 13 }, { col: 18, row: 13 },
      { col: 40, row: 13 }, { col: 50, row: 13 },
      { col: 75, row: 13 }, { col: 82, row: 13 }, { col: 88, row: 13 }
    ],
    goombas: [10, 14, 18, 38, 42, 50, 60, 68, 75, 82, 88],
    koopas: [22, 46, 72],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 10 — koopa highway.
  {
    name: '1-10 Shell Highway',
    groundSpans: [{ start: 0, end: W }],
    pipes: [{ col: 30, height: 3 }, { col: 60, height: 3 }],
    bricks: [
      { col: 12, row: 11 }, { col: 13, row: 11 }, { col: 14, row: 11 },
      { col: 40, row: 11 }, { col: 41, row: 11 }, { col: 42, row: 11 }, { col: 43, row: 11 },
      { col: 70, row: 11 }, { col: 71, row: 11 }, { col: 72, row: 11 }
    ],
    qBlocks: [
      { col: 13, row: 9, contents: 'mushroom' },
      { col: 41, row: 9, contents: 'coin' },
      { col: 71, row: 9, contents: 'coin' }
    ],
    coins: [
      { col: 10, row: 13 }, { col: 25, row: 13 }, { col: 50, row: 13 },
      { col: 67, row: 13 }, { col: 85, row: 13 }
    ],
    goombas: [20, 50, 80],
    koopas: [8, 18, 36, 48, 58, 75, 88],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
  },

  // 11 — final boss arena.
  {
    name: '1-11 The Final Run',
    groundSpans: [
      { start: 0, end: 10 },
      { start: 14, end: 22 },
      { start: 26, end: 34 },
      { start: 38, end: 50 },
      { start: 54, end: 60 },
      { start: 64, end: 74 },
      { start: 78, end: W }
    ],
    pipes: [{ col: 40, height: 3 }, { col: 70, height: 4 }],
    bricks: [
      { col: 12, row: 10 },
      { col: 24, row: 10 }, { col: 25, row: 10 },
      { col: 36, row: 8 }, { col: 37, row: 8 },
      { col: 52, row: 10 }, { col: 53, row: 10 },
      { col: 62, row: 8 }, { col: 63, row: 8 },
      { col: 76, row: 10 }, { col: 77, row: 10 }
    ],
    qBlocks: [
      { col: 12, row: 8, contents: 'mushroom' },
      { col: 37, row: 6, contents: 'coin' },
      { col: 63, row: 6, contents: 'coin' },
      { col: 85, row: 11, contents: 'coin' }
    ],
    coins: [
      { col: 12, row: 8 }, { col: 24, row: 8 }, { col: 36, row: 6 },
      { col: 52, row: 8 }, { col: 62, row: 6 }, { col: 76, row: 8 },
      { col: 85, row: 13 }, { col: 90, row: 13 }
    ],
    goombas: [8, 18, 30, 45, 58, 68, 82],
    koopas: [20, 48, 72],
    fireFlowers: [{ col: 53, row: 9 }],
    bowser: { col: 90 },
    flagCol: 97,
    playerStart: { col: 2, row: 14 }
  }
];
