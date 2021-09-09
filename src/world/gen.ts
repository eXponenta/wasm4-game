import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import { Prng } from '../math/random';
import { AnimationSprite, Frame } from '../nodes/sprite';
import { treeTexture } from '../img/tree';
import { trees } from '../img/tree_pack';

const treeFrame = trees[0];// new Frame(treeTexture);
const treeBrokenFrame = trees[1];// new Frame(treeTexture, 0, 13, 16, 3);

export function fillChunk (chunk: Chunk, rnd: Prng): void {
    const array = chunk.objects;

    for(let i: u32 = 0; i < chunk.count; i++) {
        const treeFrame = trees[rnd.randomRange(0, 3)];
        const sprite = new AnimationSprite([treeFrame, treeFrame], 0.5, 1);
        
        sprite.frameId = rnd.random() > 0.8 ? 1 : 0;
        sprite.x = rnd.randomRange<i32>(8, w4.SCREEN_SIZE);
        sprite.y = rnd.randomRange<i32>(16, w4.SCREEN_SIZE - 16);

        sprite.hit.width = sprite.frame.width / 4;
        sprite.hit.height = sprite.frame.height / 8;

        array[i] = sprite;
    }
}