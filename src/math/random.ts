import * as w4 from './../wasm4';
import { SEED } from "../constants";

@unmanaged
export class Prng {
    constructor (
        public readonly seed: i32
    ) {

        w4.trace('use seed:' + seed.toString());
        NativeMath.seedRandom(seed);
    }

    public randomInt(): u32 {
        return Math.random() * u32.MAX_VALUE;
    }

    public random(): f32 {
        return Mathf.random();
    }

    public randomRange<T extends number>(a: T, b: T): T {
        const rnd = this.random();

        return ( f32(a) + rnd * f32(b - a)) as T;
    }
}

export const rnd = new Prng(SEED);