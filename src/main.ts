import { charTexture } from "./img/char";
import { treeTexture } from "./img/tree";
import { Char } from "./nodes/char";
import { AnimationSprite, Frame, Sprite, Texture } from "./nodes/sprite";
import * as w4 from "./wasm4";

const FPS = 30;
const FRAME_DROP = 60 / FPS;
let currenTick: u32 = 0;

const COUNT = 50;

store<u32>(w4.PALETTE, 0x0, 0 * sizeof<u32>()) // 1
store<u32>(w4.PALETTE, 0xffffff, 1 * sizeof<u32>()) // 2
store<u32>(w4.PALETTE, 0x00ff00, 2 * sizeof<u32>()) // 3
store<u32>(w4.PALETTE, 0xdfafaf, 3 * sizeof<u32>()) //4

const array: Array<Sprite> = new Array<Sprite>(COUNT + 1);

const charsFrames: StaticArray<Frame> = new StaticArray<Frame>(16);

for(let i: u32 = 0; i < 16; i ++) {
    charsFrames[i] = new Frame(charTexture, 16 * (i / 4), 16 * (i % 4), 16, 16);
}

const player = new Char(charsFrames);

player.hit.width = 2;
player.hit.height = 2;

const treeFrame = new Frame(treeTexture);
const treeBrokenFrame = new Frame(treeTexture, 0, 13, 16, 3);

for(let i = 0; i < COUNT; i++) {

    const sprite = new Sprite(
        Math.random() > 0.2 ? treeBrokenFrame : treeFrame, 0.5, 1);
    
    sprite.x = f32(i32(Math.random() * (w4.SCREEN_SIZE - 8))) + 8.;
    sprite.y = f32(i32(Math.random() * (w4.SCREEN_SIZE - 16))) + 16.;

    sprite.hit.width = sprite.frame.width / 4;
    sprite.hit.height = sprite.frame.height / 8;

    array[i] = sprite;
}

array[COUNT] = player;

player.x = f32(w4.SCREEN_SIZE / 2);
player.y = f32(w4.SCREEN_SIZE);

function sortSpriteY(a: Sprite, b: Sprite): i32 {
    return i32(a.y - b.y);
}

export function start(): void {

}

function updateGame(): void {
    
    const gamepad = load<u8>(w4.GAMEPAD1);

    let dx: i32 = 0;
    let dy: i32 = 0;

    if (gamepad & w4.BUTTON_RIGHT) {
        dx = 1;
    } else if (gamepad & w4.BUTTON_LEFT) {
        dx = -1;
    }

    if (gamepad & w4.BUTTON_UP) {
        dy = -1;
    } else if (gamepad & w4.BUTTON_DOWN) {
        dy = 1;
    }

    array.sort(sortSpriteY);

    player.move(f32(dx), f32(dy));
    player.update(currenTick, array);

    const RAD_SQ = 10 * 10;
    let minRad = 100000;
    let treeIndex = -1;

    for(let i = 0; i < array.length; i ++) {        
        const tree = array[i];

        if (tree === player) {
            continue;
        }

        const dx = player.x - tree.x;
        const dy = player.y - tree.y;

        const radSq = i32(dx * dx + dy * dy);

        if (minRad > radSq && radSq < RAD_SQ) {
            minRad = radSq;
            treeIndex = i;
        }
    }

    if (treeIndex > -1) {
        const tree = array[treeIndex];

        if (tree.frame !== treeBrokenFrame && gamepad & w4.BUTTON_1) {
            tree.frame = treeBrokenFrame;
        }
    }
}

export function update (): void {
    currenTick ++;

    if (currenTick % FRAME_DROP === 0) {
        updateGame();
    }

    for(let i = 0; i < array.length; i ++) {
        array[i].draw();
    }
}
