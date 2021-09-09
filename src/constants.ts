import * as w4 from './wasm4';

export const SEED = 1;
export const FPS = 30;

export const MIN_OBJ_PER_SCREEN = 3;
export const MAX_OBJ_PER_SCREEN = 5;
export const MAX_CHUNKS = 10;

export function setPalette(): void {    
    store<u32>(w4.PALETTE, 0x16290d, 0 * sizeof<u32>()) // 1 gray
    store<u32>(w4.PALETTE, 0x388f00, 1 * sizeof<u32>()) // 2 green
    store<u32>(w4.PALETTE, 0x867720, 2 * sizeof<u32>()) // 3 dirt
    store<u32>(w4.PALETTE, 0x7abe12, 3 * sizeof<u32>()) //4 light green
}