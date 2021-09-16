import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import { Prng, rnd } from '../math/random';
import { AnimationSprite } from '../nodes/sprite';
import { trees, brokedTrees } from '../img/tree_pack';
import { Entity, Tree } from '../nodes/entity';
import { Rect } from '../math/Rect';
import { MAX_CHUNKS, STATE } from '../constants';

export const CHUNKS: StaticArray<Chunk> = new StaticArray<Chunk>(MAX_CHUNKS * MAX_CHUNKS);

export function precomputeChunks(): void {
    let offset = 0;

    for(let i = 0; i < CHUNKS.length; i++) {
        const chunk = new Chunk(
            i % MAX_CHUNKS,
            i / MAX_CHUNKS
        );

        chunk.offset = offset;
        offset += chunk.count;

        CHUNKS[i] = chunk;
    }
}

export function fillChunk (chunk: Chunk): void {
    rnd.setSeed(chunk.seed);

    const array = new Array<Entity>(chunk.count + 1);

    for(let i: u16 = 0; i < chunk.count; i++) {
        const id = i + chunk.offset;
        const treeType = rnd.randomRange(0, 3);
        const treeFrame = trees[treeType];
        const brokenFrame = brokedTrees[treeType];

        const offset: u16 = 38;
        const sprite = new AnimationSprite([treeFrame, brokenFrame], 0.5);
        
        sprite.x = rnd.randomRange<i16>(i16(treeFrame.width / 2), i16(w4.SCREEN_SIZE));
        sprite.y = rnd.randomRange<i16>(offset, i16(w4.SCREEN_SIZE - offset));

        const ent = new Tree(sprite, (1 - STATE.getTreeState(id)) * (3 - treeType) * 3, id);
        ent.hit = new Rect(0,0, sprite.frame.width / 4, sprite.frame.height / 8);


        array[i] = ent;
    }

    chunk.objects = array;

}

export function saveChunkState(chunk: Chunk): void {
    const objects = chunk.objects!;

    for(let i = 0; i < objects.length; i ++) {
        const obj = objects[i];
        
        if (!(obj instanceof Tree)) {
            continue;
        }

        STATE.setTreeState(obj.id, obj.health === 0);
    }

    STATE.lastChunkId = chunk.id;
    STATE.save();
} 