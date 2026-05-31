import { TILE, WORLD } from './constants';
export const LEVEL = {
    groundSpans: [
        { start: 0, end: 29 },
        { start: 33, end: 46 },
        { start: 50, end: 65 },
        { start: 70, end: WORLD.cols - 1 }
    ],
    pipes: [
        { col: 22, height: 2 },
        { col: 27, height: 2 },
        { col: 55, height: 3 }
    ],
    bricks: [
        // Floating platform.
        { col: 36, row: 11 },
        { col: 37, row: 11 },
        { col: 39, row: 11 },
        { col: 40, row: 11 },
        // Brick row near coins.
        { col: 73, row: 11 },
        { col: 77, row: 11 },
        // Staircase up.
        { col: 58, row: 14 },
        { col: 59, row: 14 }, { col: 59, row: 13 },
        { col: 60, row: 14 }, { col: 60, row: 13 }, { col: 60, row: 12 },
        { col: 61, row: 14 }, { col: 61, row: 13 }, { col: 61, row: 12 }, { col: 61, row: 11 }
    ],
    qBlocks: [
        { col: 38, row: 11, contents: 'coin' },
        { col: 42, row: 11, contents: 'mushroom' },
        { col: 75, row: 11, contents: 'coin' }
    ],
    coins: [
        { col: 5, row: 13 }, { col: 8, row: 13 }, { col: 12, row: 13 },
        { col: 36, row: 9 }, { col: 37, row: 9 }, { col: 39, row: 9 }, { col: 40, row: 9 },
        { col: 72, row: 13 }, { col: 80, row: 13 }, { col: 84, row: 13 }
    ],
    goombas: [25, 38, 52, 75, 82],
    koopas: [44, 60],
    flagCol: 95,
    playerStart: { col: 2, row: 14 }
};
/** Convert (col,row) → pixel position centered in the tile. */
export const tileCenter = (col, row) => ({
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2
});
