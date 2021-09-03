import { Rect } from '../math/Rect';
import * as w4 from './../wasm4';

@unmanaged
export class Texture {
    constructor (
        public width: u8,
        public height: u8,
        public data: usize,
        public type: u32 = w4.BLIT_1BPP
    ) {
    }
}

@unmanaged
export class Frame extends Rect {
    constructor(
        public base: Texture,
        x: u32 = 0,
        y: u32 = 0,
        width: u32 = base.width,
        height: u32 = base.height
    ) {
        super(x, y, i32(width), i32(height));
    }

    get isSubFrame(): bool {
        return (
            this.x !== 0 ||
            this.y !== 0 ||
            this.width !== this.base.width ||
            this.height !== this.base.height
        );
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
        public frame: Frame,
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
        const texture: Texture = frame.base;
        const data = texture.data;

        const x = i32(this.x - f32(frame.width) * this.anchorX);
        const y = i32(this.y - f32(frame.height) * this.anchorY);

        const flags =             (
            this.flipX & w4.BLIT_FLIP_X |
            this.flipY & w4.BLIT_FLIP_Y |
            texture.type
        );

        if (frame.isSubFrame) {
            w4.blitSub(
                data, x, y,
                frame.width,
                frame.height,
                frame.x,
                frame.y,
                texture.width,
                flags
            );
        } else {
            w4.blit(
                data, x, y,
                frame.width,
                frame.height,
                flags
            );
        }
    }
}