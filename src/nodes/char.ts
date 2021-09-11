import { Rect } from '../math/Rect';
import * as w4 from './../wasm4';
import { Entity } from "./entity";
import { AnimationSprite, Frame, Sprite } from "./sprite";

const enum DIR {
    NONE = -1,
    DOWN = 0,
    UP = 1,
    RIGHT = 2,
    LEFT = 3,
}

const KEY_DIR_TABLE = [
    w4.BUTTON_DOWN, w4.BUTTON_UP,
    w4.BUTTON_RIGHT, w4.BUTTON_LEFT
];

const DIR_TABLE_X: StaticArray<i8> = [0, 0, 1, -1];
const DIR_TABLE_Y: StaticArray<i8> = [1, -1, 0, 0];

//@unmanaged
export class Char extends Entity {
    private _moveDir: DIR = DIR.NONE;
    private _lookDir: DIR = DIR.DOWN;
    private _dx: i16= 0;
    private _dy: i16 = 0;
    private _localFrame: u8 = 0;
    private _keys: Array<u8> = [];

    constructor (frames: StaticArray<Frame>) {
        super(new AnimationSprite(frames, 0.5, 14. / 16.));

        this.hit = new Rect(0,0,2,2);
    }

    public changeKeyState(key: u8, pressed: u8): void {
        if (key < 0xf) {
            return;
        }

        this._moveDir = DIR.NONE;

        if (pressed) {
            this._keys.push(key);
        } else {
            const idx = this._keys.indexOf(key);
            if (idx > -1)
                this._keys.splice(idx, 1);
        }

        if (this._keys.length > 0) {
            const last = this._keys[this._keys.length - 1];

            this._moveDir = KEY_DIR_TABLE.indexOf(last);
            this._lookDir = this._moveDir; 
        }
    }

    public update (tick: u32, world: Entity[]): void {
        this._beginMove(world);
        this._animate(tick);
        this._endMove();
    }

    private _animate(tick: u32): void {
        const node = this.node as AnimationSprite;

        if (this._moveDir === DIR.NONE) {
            this._localFrame = 0;
            node.frameId = u8(this._lookDir * 4);
            return;
        }

        if (tick % 8 === 0) {
            this._localFrame = (this._localFrame + 1) % 4;
        }

        node.frameId = 4 * u8(this._lookDir) + this._localFrame;
    }

    private _beginMove (world: Entity[]): void {
        const node = this.node;
        
        this._dx = 0;
        this._dy = 0;

        if (this._moveDir !== DIR.NONE) {
            this._dx = DIR_TABLE_X[this._moveDir];
            this._dy = DIR_TABLE_Y[this._moveDir];
        }

        const lastX = node.x;
        const lastY = node.y;

        const targetX = this._dx + node.x;
        const targetY = this._dy + node.y;

        let intersectX: bool = false;
        let intersectY: bool = false;

        for(let i = 0; i < world.length; i ++) {        
            const other = world[i];

            if (other === this) {
                continue;
            }

            if (!intersectX) {
                node.x = targetX;
                intersectX = intersectX || this.intersect(other);

                node.x = lastX;
            }

            if (!intersectY) {
                node.y = targetY;
                intersectY = intersectY || this.intersect(other);

                node.y = lastY;
            }
        }

        if (intersectX) {
            this._dx = 0;
        }

        if (intersectY) {
            this._dy = 0;
        }
    }

    private _endMove(): void {
        this.node.x += this._dx;
        this.node.y += this._dy;

        this._dx = this._dy = 0;
    }

    public attack(): void {
        (this.node as AnimationSprite).frameId = u8(this._lookDir * 4 + 1);
    }
}
