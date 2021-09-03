import { treeFrame } from "./img/tree";
import { Frame, Sprite } from "./nodes/sprite";
import * as w4 from "./wasm4";

const FPS = 30;
const FRAME_DROP = 60 / FPS;
let currenTick: u32 = 0;

const COUNT = 50;

store<u32>(w4.PALETTE, 0x0, 0 * sizeof<u32>()) // 1
store<u32>(w4.PALETTE, 0xffffff, 1 * sizeof<u32>()) // 2
store<u32>(w4.PALETTE, 0x00ff00, 2 * sizeof<u32>()) // 3
store<u32>(w4.PALETTE, 0x0000ff, 3 * sizeof<u32>()) //4

const array: Array<Sprite> = new Array<Sprite>(COUNT + 1);

const smiley = memory.data<u8>([
    0b11000011,
    0b10000001,
    0b00100100,
    0b00100100,
    0b00000000,
    0b00100100,
    0b10011001,
    0b11000011,
]);

const player = new Sprite(new Frame(8, 8, smiley, w4.BLIT_1BPP), 0.5, 1);
player.hit.width = 2;
player.hit.height = 2;
const spriteFrame = treeFrame;

for(let i = 0; i < COUNT; i++) {
    const sprite = new Sprite(spriteFrame, 0.5, 1);
    
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

    const lastX = player.x;
    const lastY = player.y;

    const targetX = lastX + f32(dx);
    const targetY = lastY + f32(dy);
    
    let intersectX: bool = false;
    let intersectY: bool = false;

    for(let i = 0; i < array.length; i ++) {        
        if (intersectX && intersectY) {
            break;
        }

        if (array[i] === player) {
            continue;
        }

        if (!intersectX) {
            player.x = targetX;
            intersectX = intersectX || player.intersect(array[i]);            

            player.x = lastX;
        }

        if (!intersectY) {
            player.y = targetY;
            intersectY = intersectY || player.intersect(array[i]);

            player.y = lastY;
        }
    }

    if (!intersectX) {
        player.x = targetX;
    }

    if (!intersectY) {
        player.y = targetY;
    }
}

export function update (): void {
    currenTick ++;

    if (currenTick % FRAME_DROP === 0) {
        updateGame();
    }

    for(let i = 0; i < array.length; i ++) {

        if (array[i] == player) {
            store<u16>(w4.DRAW_COLORS, 0x04);
        } else {
            // tree
            store<u16>(w4.DRAW_COLORS, 0x4230);
        }

        array[i].draw();
    }
}
