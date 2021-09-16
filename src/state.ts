import * as w4 from './wasm4';
import { MAX_CHUNKS, MAX_OBJ_PER_SCREEN } from "./constants";

const SAVE_VERSION: u8 = 2;
const TREES_BYTES_SIZE: u32 = MAX_CHUNKS * MAX_CHUNKS * Math.ceil(MAX_OBJ_PER_SCREEN / 8.0);

@unmanaged
export class State {
    public version: u8 = SAVE_VERSION;
    public seed: u8;
    public lastChunkId: u8 = 0;
    //place for tree store

    public reset(): void {
        this.version = SAVE_VERSION;
        this.seed = u8(Math.random() * 256);
        this.lastChunkId = u8(MAX_CHUNKS * MAX_CHUNKS * Math.random());
        
        // fill tree buffer onot zero value        
        memory.fill(changetype<usize>(this) + offsetof<State>(), 0x0, TREES_BYTES_SIZE);
    }

    public setTreeState(id: u32, kill: bool): void {
        const storeIndex = id >> 3;
        const bitIndex = u8(id - (storeIndex << 3));

        if (storeIndex >= TREES_BYTES_SIZE) {
            throw new Error('Tree index greater that store size:' + id.toString());
        }

        const ptr = changetype<usize>(this) + offsetof<State>() + storeIndex;
        let byte = load<u8>(ptr);

        if (kill) {
            byte |= 1 << bitIndex;
        } else {
            byte &= ~(1 << bitIndex);
        }

        store<u8>(ptr, byte);

        this.save();
    }
    
    public getTreeState(id: u32): u8 {
        const storeIndex = id >> 3;
        const bitIndex = u8(id - (storeIndex << 3));

        if (storeIndex >= TREES_BYTES_SIZE) {
            throw new Error('Tree index greater that store size:' + id.toString());
        }

        const ptr = changetype<usize>(this) + offsetof<State>() + storeIndex;
        const byte = load<u8>(ptr);

        return (byte >> bitIndex) & 0x1;
    }

    public save(): void {
        const structSize = offsetof<State>();
        const treeSize = TREES_BYTES_SIZE;
        const ptr = changetype<usize>(this);

        w4.diskw(ptr, u32(structSize + treeSize));
    }

    public load(): void {
        const structSize = offsetof<State>();
        const treeSize = TREES_BYTES_SIZE;
        const ptr = changetype<usize>(this);

        const readed = w4.diskr(ptr, u32(structSize + treeSize));

        if (this.version !== SAVE_VERSION || u32(readed) !== u32(structSize + treeSize)) {
            w4.trace('Loaded state has invalid size or version:' + this.version.toString());
            this.reset();
        }
    }

    public dump(): void {
        w4.trace(
            'seed:' + this.seed.toString() + '\n' +
            'chunk:' + this.lastChunkId.toString() + '\n',
        );
    }

    public static create(): State {
        const size = offsetof<State>() + TREES_BYTES_SIZE;
        const ptr = heap.alloc(size);
        const state = changetype<State>(ptr);
        
        state.reset();

        return state;
    }
}
