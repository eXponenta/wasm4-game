import { AnimationSprite, Frame, Sprite } from "./sprite";

@unmanaged
export class Char extends AnimationSprite {
    private _isMove: bool = false;
    private _dir: u8 = 0; 
    private _localFrame: u8 = 0;

    private targetX: f32 = 0;
    private targetY: f32 = 0;

    constructor (frames: StaticArray<Frame>) {
        super(frames, 0.5, 1);
    }

    public update (tick: u32, world: Sprite[]): void {
        this._tryMove(world);
    }

    private _tryMove (world: Sprite[]): void {        
        const lastX = this.x;
        const lastY = this.y;

        const targetX = this.targetX;
        const targetY = this.targetY;

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

        this.targetX = this.x;
        this.targetY = this.y;
    }

    public move (dx: f32, dy: f32): void {
        this.targetX = this.x + dx;
        this.targetY = this.y + dy;
    }
}