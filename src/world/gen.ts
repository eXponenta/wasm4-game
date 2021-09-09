import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import { Prng } from '../math/random';
import { AnimationSprite } from '../nodes/sprite';
import { trees, brokedTrees } from '../img/tree_pack';
import { Entity, Tree } from '../nodes/entity';

export function fillChunk (chunk: Chunk, rnd: Prng): void {
    const array = chunk.objects;

    for(let i: u32 = 0; i < chunk.count; i++) {
        const treeType = rnd.randomRange(0, 3);
        const treeFrame = trees[treeType];
        const brokenFrame = brokedTrees[treeType];

        const offset: u32 = 38;
        const sprite = new AnimationSprite([treeFrame, brokenFrame], 0.5);
        
        sprite.x = rnd.randomRange<i32>(treeFrame.width / 2, w4.SCREEN_SIZE);
        sprite.y = rnd.randomRange<i32>(offset, w4.SCREEN_SIZE - offset);

        sprite.hit.width = sprite.frame.width / 4;
        sprite.hit.height = sprite.frame.height / 8;

        array[i] = new Tree(sprite, (3 - treeType) * 3);
    }
}