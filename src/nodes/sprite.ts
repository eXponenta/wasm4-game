import { Rect } from '../math/Rect';
import * as w4 from './../wasm4';

@unmanaged
export class Frame extends Rect {
    constructor (
        width: u8,
        height: u8,
        public data: usize,
        public type: u32 = w4.BLIT_1BPP
    ) {
        super(0,0, width, height);
    }
}

@final
@unmanaged
export class Sprite {
    public x: f32 = 0;
    public y: f32 = 0;
   
    public flipX: u32 = 0;
    public flipY: u32 = 0;
    public hit: Rect;

    constructor (
        public readonly frame: Frame,
        public anchorX: f32 = 0.0,
        public anchorY: f64 = 0.0,
    ) {
        this.hit = new Rect(0,0, frame.width, frame.height);
    }

    public intersect (dest: Sprite): bool {
        this.updateBounds();
        dest.updateBounds();

        return this.hit.intersect(dest.hit);
    }

    public updateBounds(): void {
        this.hit.x = i32(this.x - f32(this.hit.width) * this.anchorX);
        this.hit.y = i32(this.y - f32(this.hit.height) * this.anchorY);
    }

    public draw(): void {
        const frame: Frame = this.frame;
        const x = this.x - f32(frame.width) * this.anchorX;
        const y = this.y - f32(frame.height) * this.anchorY;

        w4.blit(
            frame.data,
            i32(x),
            i32(y),
            frame.width,
            frame.height,
            (
                this.flipX & w4.BLIT_FLIP_X |
                this.flipY & w4.BLIT_FLIP_Y |
                frame.type
            )
        );
    }
}