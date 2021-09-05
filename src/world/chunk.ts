import { MAX_CHUNKS, MAX_OBJ_PER_SCREEN, MIN_OBJ_PER_SCREEN, SEED, setPalette } from "../constants";
import { Prng } from "../math/random";
import { Char } from "../nodes/char";
import { Sprite } from "../nodes/sprite";
import { fillChunk } from "./gen";

@unmanaged
export class Chunk {
    public objects: Array<Sprite>;
    public readonly count: u32;
    public readonly seed: i32;

    private player: Char | null;

    constructor (
        public readonly x: i32 = 0,
        public readonly y: i32 = 0,
    ) {
        const seed = SEED + (this.y + MAX_CHUNKS / 2) * MAX_CHUNKS + (this.x + MAX_CHUNKS / 2);
        const rnd = new Prng (seed);

        this.count = rnd.randomRange<u32>(MIN_OBJ_PER_SCREEN, MAX_OBJ_PER_SCREEN); 
        this.objects = new Array<Sprite>(this.count + 1);
        this.seed = seed;

        fillChunk(this, rnd);
    }

    public setPlayer(player: Char): void {
        this.player = player;
        this.objects[this.objects.length - 1] = player;
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

        //heap.free(changetype<usize>(this.objects));
        heap.free(changetype<usize>(this));
    }
}