import { State } from './state';
import * as w4 from './wasm4';

export const FPS = 30;
export const STATE_SAVE_PERIOD = 30;
export const MIN_OBJ_PER_SCREEN = 4;
export const MAX_OBJ_PER_SCREEN = 14;
export const MAX_CHUNKS = 15;
export const STATE = State.create();

export function setPalette(): void {    
    store<u32>(w4.PALETTE, 0x16290d, 0 * sizeof<u32>()) // 1 gray
    store<u32>(w4.PALETTE, 0x388f00, 1 * sizeof<u32>()) // 2 green
    store<u32>(w4.PALETTE, 0x867720, 2 * sizeof<u32>()) // 3 dirt
    store<u32>(w4.PALETTE, 0x7abe12, 3 * sizeof<u32>()) //4 light green
}
