import { Rect } from '../math/Rect';
import * as w4 from './../wasm4';

//@unmanaged
export class Texture {
    constructor (
        public width: u8,
        public height: u8,
        public data: usize,
        public type: u32 = w4.BLIT_1BPP,
        public colors: u32 = 0x0123,
        public maskData: usize = 0
    ) {
    }
}

//@unmanaged
export class Frame extends Rect {
    constructor(
        public base: Texture,
        x: u32 = 0,
        y: u32 = 0,
        width: u32 = base.width,
        height: u32 = base.height,
        public anchorX: f32 = 0,
        public anchorY: f32 = 0
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

//@unmanaged
export class Sprite {
    public visible: bool = true;
    public x: i16 = 0;
    public y: i16 = 0;

    constructor (
        public frame: Frame,
        public anchorX: f32 = -1.,
        public anchorY: f32 = -1.,
    ) {

        if (anchorX < 0) {
            this.anchorX = frame.anchorX;
        }

        if (anchorY < 0) {
            this.anchorY = frame.anchorY;
        }
    }

    public getBounds(target: Rect): Rect {
        const frame = this.frame;

        target.x = this.x - i32(f32(frame.width) * this.anchorX);
        target.y = this.y - i32(f32(frame.height) * this.anchorY);

        target.width = this.frame.width;
        target.height = this.frame.height;

        return target;
    }

    public draw(): void {
        if (!this.visible) {
            return;
        }

        const frame: Frame = this.frame;
        const texture: Texture = frame.base;
        const data = texture.data;
        const maskData = texture.maskData;

        const x = this.x - i32(f32(frame.width) * this.anchorX);
        const y = this.y - i32(f32(frame.height) * this.anchorY);

        /*
        const flags =(
            w4.BLIT_FLIP_X |
            this.flipY & w4.BLIT_FLIP_Y
        );
        */

        // we have a mask, render it with last color
        // for this case colors MUST be a like 0x4321, 0 is always will be aplied for 1 colors
        // unpacked onto 0x10 and 0x4320
        if (maskData !== 0) {
            store<u16>(w4.DRAW_COLORS, (texture.colors & 0xf) << 4);   
            w4.blitSub(
                maskData, x, y,
                frame.width,
                frame.height,
                frame.x,
                frame.y,
                texture.width,
                w4.BLIT_1BPP
            );

            store<u16>(w4.DRAW_COLORS, texture.colors & 0xfff0);
        } else {               
            store<u16>(w4.DRAW_COLORS, texture.colors);
        }

        
        w4.blitSub(
            data, x, y,
            frame.width,
            frame.height,
            frame.x,
            frame.y,
            texture.width,
            texture.type
        );
    }
}

//@unmanaged
export class AnimationSprite extends Sprite {
    private _frameId: u8 = 0;

    constructor (
        public frames: StaticArray<Frame>,
        anchorX: f32 = -1.,
        anchroY: f32 = -1.   
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