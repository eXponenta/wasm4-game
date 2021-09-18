import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import { rnd } from '../math/random';
import { AnimationSprite } from '../nodes/sprite';
import { trees, brokedTrees } from '../img/tree_pack';
import { Entity, Tree } from '../nodes/entity';
import { MAX_CHUNKS, MAX_OBJ_PER_SCREEN, STATE } from '../constants';
import { Pool } from './pool';

export const CHUNKS: StaticArray<Chunk> = new StaticArray<Chunk>(MAX_CHUNKS * MAX_CHUNKS);
export const treePool = new Pool<Tree>(MAX_OBJ_PER_SCREEN);

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
    treePool.reset();

    const array = new Array<Entity>(chunk.count + 1);

    for(let i: u16 = 0; i < chunk.count; i++) {
        const id = i + chunk.offset;
        const treeType = rnd.randomRange(0, 3);
        const treeFrame = trees[treeType];
        const brokenFrame = brokedTrees[treeType];

        const offset: u16 = 38;

        const ent = treePool.get();

        if (!ent) {
            throw new Error('Pool overflow');
        }

        
        const health = (1 - STATE.getTreeState(id)) * (3 - treeType) * 3;

        let sprite = ent.node
        if (sprite === null)
            sprite = new AnimationSprite([treeFrame, brokenFrame], 0.5);
        
        (<AnimationSprite> sprite).frames[0] = treeFrame;
        (<AnimationSprite> sprite).frames[1] = brokenFrame;

        ent.init(sprite, health, id);

        ent.x = rnd.randomRange<i16>(i16(treeFrame.width / 2), i16(w4.SCREEN_SIZE));
        ent.y = rnd.randomRange<i16>(offset, i16(w4.SCREEN_SIZE - offset));

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