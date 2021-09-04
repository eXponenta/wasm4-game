import { AnimationSprite, Frame, Sprite } from "./sprite";

const enum DIR {
    DOWN = 0,
    UP = 1,
    RIGHT = 2,
    LEFT = 3,
}
@unmanaged
export class Char extends AnimationSprite {
    private _lastDir: DIR = DIR.DOWN;
    private _localFrame: u8 = 0;
    private _dx: i32 = 0;
    private _dy: i32 = 0;

    constructor (frames: StaticArray<Frame>) {
        super(frames, 0.5, 1);
    }

    public update (tick: u32, world: Sprite[]): void {
        this._beginMove(world);
        this._animate(tick);
        this._endMove();
    }

    private _animate(tick: u32): void {
        if (this._dy === 0 && this._dx === 0) {
            this._localFrame = 0;
            this.frameId = u8(this._lastDir * 4);
            return;
        }

        if (tick % 8 === 0) {
            this._localFrame = (this._localFrame + 1) % 4;
        }

        let dir: i32 = this._lastDir;

        if (this._dx > 0) {
            dir = DIR.RIGHT;
        } else if (this._dx < 0) {
            dir = DIR.LEFT;
        }

        if (this._dy < 0) {
            dir = DIR.UP;
        } else if (this._dy > 0) {
            dir = DIR.DOWN;
        }

        this._lastDir = dir;

        this.frameId = 4 * u8(dir) + this._localFrame;

    }

    private _beginMove (world: Sprite[]): void {        
        const lastX = this.x;
        const lastY = this.y;

        const targetX = this._dx + this.x;
        const targetY = this._dy + this.y;

        let intersectX: bool = false;
        let intersectY: bool = false;

        for(let i = 0; i < world.length; i ++) {        
            const other = world[i];

            if (other === this) {
                continue;
            }

            if (!intersectX) {
                this.x = targetX;
                intersectX = intersectX || this.intersect(other);

                this.x = lastX;
            }

            if (!intersectY) {
                this.y = targetY;
                intersectY = intersectY || this.intersect(other);

                this.y = lastY;
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
        this.x += this._dx;
        this.y += this._dy;

        this._dx = this._dy = 0;
    }

    public move (dx: i32, dy: i32): void {
        this._dx = dx;
        this._dy = dy;
    }
}