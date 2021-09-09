import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import { Prng } from '../math/random';
import { AnimationSprite, Frame } from '../nodes/sprite';
import { trees } from '../img/tree_pack';

export function fillChunk (chunk: Chunk, rnd: Prng): void {
    const array = chunk.objects;

    for(let i: u32 = 0; i < chunk.count; i++) {
        const treeFrame = trees[rnd.randomRange(0, 3)];
        const offset: u32 = 38;
        const sprite = new AnimationSprite([treeFrame, treeFrame]);
        
        sprite.frameId = rnd.random() > 0.8 ? 1 : 0;
        sprite.x = rnd.randomRange<i32>(treeFrame.width / 2, w4.SCREEN_SIZE);
        sprite.y = rnd.randomRange<i32>(offset, w4.SCREEN_SIZE - offset);

        sprite.hit.width = sprite.frame.width / 4;
        sprite.hit.height = sprite.frame.height / 8;

        array[i] = sprite;
    }
}