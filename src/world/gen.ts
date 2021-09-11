import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import { Prng } from '../math/random';
import { AnimationSprite, Sprite } from '../nodes/sprite';
import { trees, brokedTrees } from '../img/tree_pack';
import { Entity, Tree } from '../nodes/entity';
import { Rect } from '../math/Rect';

export function fillChunk (chunk: Chunk, rnd: Prng): void {
    const array = chunk.objects;

    for(let i: u16 = 0; i < chunk.count; i++) {
        const treeType = rnd.randomRange(0, 3);
        const treeFrame = trees[treeType];
        const brokenFrame = brokedTrees[treeType];

        const offset: u16 = 38;
        const sprite = new AnimationSprite([treeFrame, brokenFrame], 0.5);
        
        sprite.x = rnd.randomRange<i16>(i16(treeFrame.width / 2), i16(w4.SCREEN_SIZE));
        sprite.y = rnd.randomRange<i16>(offset, i16(w4.SCREEN_SIZE - offset));

        const ent = new Tree(sprite, (3 - treeType) * 3);
        ent.hit = new Rect(0,0, sprite.frame.width / 4, sprite.frame.height / 8);

        array[i] = ent;
    }

    w4.trace('Allocate bytes for Tree:' + (array.length * array[0].sizeOfBytes).toString())
}