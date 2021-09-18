import { MAX_OBJ_PER_SCREEN } from "../constants";
import { Entity } from "../nodes/entity";

export class Pool<T extends Entity> {
    public readonly pool: StaticArray<T>;
    private index: i32 = -1;

    constructor (
        public readonly size: u32 = MAX_OBJ_PER_SCREEN
    ) {
        this.pool = new StaticArray<T>(size);

        for(let i: u32 = 0; i < this.size; i ++) {
            this.pool[i] = instantiate<T>();
        }
    }

    get (): T | null {
        if (this.index === this.size) {
            return null;
        }
        
        this.index ++;
        return this.pool[this.index];
    }

    store (obj: T): void {
        const index = this.pool.indexOf(obj);

        // object not from this store
        if (index === -1) {
            return;
        }

        // already stored back
        if (index > this.index) {
            return;
        }

        // swap latest freed with pooled
        // and shift index back
        if (this.index !== index) {
            const tmp = this.pool[this.index];
            this.pool[index] = tmp;
        }

        this.pool[this.index] = obj;

        this.index --;
    }

    reset (): void {
        this.index = 0;
    }
}