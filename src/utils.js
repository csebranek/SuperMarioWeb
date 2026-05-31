import { TILE } from './constants';
/** Convert (col,row) → pixel position centered in the tile. */
export const tileCenter = (col, row) => ({
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2
});
