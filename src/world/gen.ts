import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import * as C from './../constants';
import { Prng } from '../math/random';
import { AnimationSprite, Frame, Sprite } from '../nodes/sprite';
import { treeTexture } from '../img/tree';

const treeFrame = new Frame(treeTexture);
const treeBrokenFrame = new Frame(treeTexture, 0, 13, 16, 3);

export function fillChunk (chunk: Chunk, rnd: Prng): void {
    const array = chunk.objects;

    for(let i: u32 = 0; i < chunk.count; i++) {

        const sprite = new AnimationSprite([treeFrame, treeBrokenFrame], 0.5, 1);
        
        sprite.frameId = rnd.random() > 0.8 ? 1 : 0;
        sprite.x = rnd.randomRange<i32>(8, w4.SCREEN_SIZE);
        sprite.y = rnd.randomRange<i32>(16, w4.SCREEN_SIZE - 16);

        sprite.hit.width = sprite.frame.width / 4;
        sprite.hit.height = sprite.frame.height / 8;

        array[i] = sprite;
    }
}