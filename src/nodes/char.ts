import { AnimationSprite, Frame, Sprite } from "./sprite";

@unmanaged
export class Char extends AnimationSprite {
    private _isMove: bool = false;
    private _dir: u8 = 0; 
    private _localFrame: u8 = 0;

    private _dx: i32 = 0;
    private _dy: i32 = 0;

    constructor (frames: StaticArray<Frame>) {
        super(frames, 0.5, 1);
    }

    public update (tick: u32, world: Sprite[]): void {
        if (this._dy !== 0 || this._dx !== 0) {
            this._tryMove(world);
        }
    }

    private _tryMove (world: Sprite[]): void {        
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

        if (!intersectX) {
            this.x = targetX;
        }

        if (!intersectY) {
            this.y = targetY;
        }

        this._dx = 0;
        this._dy = 0;
    }

    public move (dx: i32, dy: i32): void {
        this._dx = dx;
        this._dy = dy;
    }
}