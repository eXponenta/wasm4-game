import * as w4 from './../wasm4';
@unmanaged
export class Prng {
    constructor (
        public seed: u32 = 0
    ) {
        if (seed)
            this.setSeed(seed);
    }

    public setSeed(seed: u32): this {
        //w4.trace('use seed:' + seed.toString());
        NativeMath.seedRandom(seed);

        return this;
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

export const rnd = new Prng();