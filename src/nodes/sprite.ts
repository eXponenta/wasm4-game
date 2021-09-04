import { Rect } from '../math/Rect';
import * as w4 from './../wasm4';

@unmanaged
export class Texture {
    constructor (
        public width: u8,
        public height: u8,
        public data: usize,
        public type: u32 = w4.BLIT_1BPP,
        public colors: u16 = 0x0123
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

@unmanaged
export class Sprite {
    public x: i32 = 0;
    public y: i32 = 0;
   
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
        this.hit.x = this.x - i32(f32(this.hit.width) * this.anchorX);
        this.hit.y = this.y - i32(f32(this.hit.height) * this.anchorY);
    }

    public draw(): void {
        const frame: Frame = this.frame;
        const texture: Texture = frame.base;
        const data = texture.data;

        const x = this.x - i32(f32(frame.width) * this.anchorX);
        const y = this.y - i32(f32(frame.height) * this.anchorY);

        const flags =             (
            this.flipX & w4.BLIT_FLIP_X |
            this.flipY & w4.BLIT_FLIP_Y |
            texture.type
        );

        if (texture.colors) {
            store<u16>(w4.DRAW_COLORS, texture.colors);
        }

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

@unmanaged
export class AnimationSprite extends Sprite {
    private _frameId: u8 = 0;

    constructor (
        public frames: StaticArray<Frame>,
        anchorX: f32 = 0,
        anchroY: f32 = 0   
    ) {
        super(frames[0], anchorX, anchroY);
    }

    set frameId (v: u8) {
        this._frameId = v % u8(this.frames.length);
        this.frame = this.frames[this._frameId];
    }

    get frameId (): u8 {
        return this._frameId;
    }
}