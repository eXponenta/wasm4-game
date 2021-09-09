import { Char } from "./nodes/char";
import { AnimationSprite, Sprite } from "./nodes/sprite";
import * as C from './constants';
import * as w4 from "./wasm4";
import { Chunk } from "./world/chunk";
import { charsFrames } from "./img/char";
import { oval } from "./utils";

C.setPalette();

const FRAME_DROP = 60 / C.FPS;

let lastTime: f64 = 0;
let currenTick: u32 = 0;
let currenChunk: Chunk;
let player: Char;

function regenerate (x: i32, y: i32): Chunk {
    if (currenChunk) {
        currenChunk.dispose();
    }

    currenChunk = new Chunk(x, y);
    currenChunk.setPlayer(player);

    player.x = (player.x + w4.SCREEN_SIZE) % w4.SCREEN_SIZE;
    player.y = (player.y + w4.SCREEN_SIZE) % w4.SCREEN_SIZE;

    w4.trace('regenerate' + x.toString() + ':' + y.toString());
    w4.trace('chunk size:' + currenChunk.objects.length.toString());
    return currenChunk;
}

function sortSpriteY(a: Sprite, b: Sprite): i32 {
    return i32(a.y - b.y);
}

export function start(): void {
    player = new Char(charsFrames);
    player.hit.width = 2;
    player.hit.height = 2;
    player.x = w4.SCREEN_SIZE / 2;
    player.y = -4;

    currenChunk = regenerate(0, 0);

    lastTime = w4.time();
}

function updateGame(): void {
    const time = w4.time();
    const delta = time - lastTime;
    lastTime = time;

    //w4.trace("delta time:" + delta.toString())

    const array = currenChunk.objects;
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

    player.move(dx, dy);
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
        const tree = array[treeIndex] as AnimationSprite;

        if (tree.frameId === 0 && gamepad & w4.BUTTON_1) {
            tree.frameId = 1;
        }
    }

    let wasGenerated = false;
    const px = player.x;
    const py = player.y;

    if (px > i32(w4.SCREEN_SIZE)) {
        currenChunk = regenerate(currenChunk.x + 1, currenChunk.y);
        wasGenerated = true;
    } else if (px < 0) {
        currenChunk = regenerate(currenChunk.x - 1, currenChunk.y);
        wasGenerated = true;
    }

    if (!wasGenerated) {
        if (py > i32(w4.SCREEN_SIZE)) {
            currenChunk = regenerate(currenChunk.x, currenChunk.y + 1);
        } else if (py < 0) {
            currenChunk = regenerate(currenChunk.x, currenChunk.y - 1);
        }
    }
}

export function update (): void {
    const w = 160 >> 2;

    
    for (let i = 0; i < 160 * w; i ++) {
        const isOddRow = (i / w) % 2;
        const color = isOddRow 
            ? (1 << 6) | (3 << 4) | (1 << 2) | 3 
            : (3 << 6) | (1 << 4) | (3 << 2) | 1;

        store<u8>(w4.FRAMEBUFFER + sizeof<u8>() * i, color);
    }
    

    const objects = currenChunk.objects;

    currenTick ++;
    if (currenTick % FRAME_DROP === 0) {
        updateGame();
    }

    store<u16>(w4.DRAW_COLORS, 0x22);
    for(let i = 0; i < objects.length; i ++) {
        const obj = objects[i];
        const bounds = obj.bounds;
        const h =  bounds.height / 4;

        oval(bounds.x, obj.y - h / 2, bounds.width, h);
    }

    for(let i = 0; i < objects.length; i ++) {
        objects[i].draw();
    }
    
}
