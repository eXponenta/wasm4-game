import { MAX_CHUNKS, MAX_OBJ_PER_SCREEN, MIN_OBJ_PER_SCREEN, STATE } from "../constants";
import { Prng } from "../math/random";
import { Char } from "../nodes/char";
import { Entity } from "../nodes/entity";
import { Sprite } from "../nodes/sprite";
import { fillChunk } from "./gen";

@unmanaged
export class Chunk {
    public objects: Array<Entity> | null;
    public offset: u32 = 0;

    public readonly count: u32;
    public readonly seed: u32;
 
    private player: Char | null;

    constructor (
        public readonly x: u32 = 0,
        public readonly y: u32 = 0,
    ) {
        const offset = MAX_CHUNKS / 2;
        const seed = STATE.seed + ((this.y + offset) << 16 | (this.x + offset));
        const rnd = new Prng (seed);

        this.count = rnd.randomRange<u32>(MIN_OBJ_PER_SCREEN, MAX_OBJ_PER_SCREEN); 
        this.seed = seed;
    }

    public setPlayer(player: Char): void {
        this.player = player;
        this.objects![this.objects!.length - 1] = player;
    }

    public dispose(): void {
        /*
        for(let i = 0; i < this.objects.length; i ++) {
            if (this.objects[i] == <Sprite>(this.player)) {
                this.objects[i] = this.objects[(i + 1)  % this.objects.length];
            }
        }
        */

        this.player = null;
        this.objects = null;
    }

    public get id(): u8 {
        return u8(this.x << 4 | this.y);
    }
}