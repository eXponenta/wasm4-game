import { Char } from "./nodes/char";
import * as C from './constants';
import { STATE } from "./constants";
import * as w4 from "./wasm4";
import { Chunk } from "./world/chunk";
import { charsFrames } from "./img/char";
import { oval } from "./utils";
import { Entity } from "./nodes/entity";
import { Rect } from "./math/Rect";
import { rnd } from "./math/random";
import { saveChunkState } from "./world/gen";

C.setPalette();

const FRAME_DROP = 60 / C.FPS;

let lastTime: f64 = 0;
let currenTick: u32 = 0;
let currenChunk: Chunk;
let player: Char;
let lastGamepad: usize = 0;

function regenerate (x: i32, y: i32): Chunk {
    if (currenChunk) {
        currenChunk.dispose();
    }

    x = (x + C.MAX_CHUNKS) % C.MAX_CHUNKS;
    y = (y + C.MAX_CHUNKS) % C.MAX_CHUNKS;

    currenChunk = new Chunk(x, y);
    currenChunk.setPlayer(player);

    player.x = (player.x + w4.SCREEN_SIZE) % w4.SCREEN_SIZE;
    player.y = (player.y + w4.SCREEN_SIZE) % w4.SCREEN_SIZE;

    w4.trace('regenerate' + x.toString() + ':' + y.toString());
    w4.trace('chunk size:' + currenChunk.objects.length.toString());
    return currenChunk;
}

function sortSpriteY(a: Entity, b: Entity): i32 {
    return i32(a.y - b.y);
}

export function start(): void {
    STATE.load();
    STATE.dump();
    rnd.setSeed(STATE.seed);

    player = new Char(charsFrames);
    player.node.x = i16(w4.SCREEN_SIZE / 2);
    player.node.y = -4;

    currenChunk = regenerate(
        (STATE.lastChunkId >> 4) & 0xf, 
        STATE.lastChunkId & 0xf
    );

    lastTime = w4.time();

    // save current state
    STATE.save();
}

function updateGame(): void {
    const time = w4.time();
    const delta = time - lastTime;
    lastTime = time;

    //w4.trace("delta time:" + delta.toString())
    const array = currenChunk.objects;

    const gamepad = load<u8>(w4.GAMEPAD1);
    const gamepadDiff = (lastGamepad ^ gamepad);
    const gamepadPressed = gamepadDiff & gamepad;
    const gamepadReleased = gamepadDiff & lastGamepad;
    lastGamepad = gamepad;

    for(let i:u8 = 0; i < 8; i ++) {
        if ((gamepadDiff >> i) & 0x1) {
            player.changeKeyState(1 << i, (gamepad >> i) & 0x1);
        }
    }

    array.sort(sortSpriteY);

    const RAD_SQ = 10 * 10;
    let minRad = 100000;
    let treeIndex = -1;

    for(let i = 0; i < array.length; i ++) {
        const object = array[i];

        object.update(currenTick, array);

        if (object === player) {
            continue;
        }

        const dx = player.x - object.x;
        const dy = player.y - object.y;

        const radSq = i32(dx * dx + dy * dy);

        if (minRad > radSq && radSq < RAD_SQ) {
            minRad = radSq;
            treeIndex = i;
        }
    }

    if (gamepadPressed & w4.BUTTON_1) {
        player.attack();

        if (treeIndex > -1) { 
            array[treeIndex].damage();
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

function gui (): void {
    store<u16>(w4.DRAW_COLORS, 0x01);
    
    w4.text('chunk:' + currenChunk.x.toString() + '-' + currenChunk.y.toString(), 0,0);
}

const boundsTmp = new Rect(0,0,0,0);

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

    if (currenTick % C.STATE_SAVE_PERIOD === 0) {
        saveChunkState(currenChunk);
    }

    store<u16>(w4.DRAW_COLORS, 0x22);
    for(let i = 0; i < objects.length; i ++) {
        const obj = objects[i];
        const bounds = obj.node.getBounds(boundsTmp);
        const h = max(bounds.height / 4, 4);

        oval(bounds.x, obj.y - h / 2, bounds.width, h);
    }

    for(let i = 0; i < objects.length; i ++) {
        objects[i].node.draw();
    }

    gui();
}
