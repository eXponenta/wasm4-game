import * as w4 from './wasm4';

export const SEED = 1;
export const FPS = 30;

export const MIN_OBJ_PER_SCREEN = 3;
export const MAX_OBJ_PER_SCREEN = 50;
export const MAX_CHUNKS = 10;

export function setPalette(): void {    
    store<u32>(w4.PALETTE, 0x0, 0 * sizeof<u32>()) // 1
    store<u32>(w4.PALETTE, 0xffffff, 1 * sizeof<u32>()) // 2
    store<u32>(w4.PALETTE, 0x00ff00, 2 * sizeof<u32>()) // 3
    store<u32>(w4.PALETTE, 0xdfafaf, 3 * sizeof<u32>()) //4
}