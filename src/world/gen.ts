import { Chunk } from './chunk';
import * as w4 from './../wasm4';
import { Prng } from '../math/random';
import { AnimationSprite } from '../nodes/sprite';
import { trees, brokedTrees } from '../img/tree_pack';
import { Tree } from '../nodes/entity';
import { Rect } from '../math/Rect';
import { STATE } from '../constants';

export function fillChunk (chunk: Chunk, rnd: Prng): void {
    const array = chunk.objects;

    for(let i: u16 = 0; i < chunk.count; i++) {
        const id = i + chunk.id;
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

}

export function saveChunkState(chunk: Chunk): void {
    const objects = chunk.objects;

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