import * as w4 from './../wasm4';

@unmanaged
export class Frame {
    constructor (
        public width: u8,
        public height: u8,
        public data: usize,
        public type: u32 = w4.BLIT_1BPP
    ) {
    }
}

@final
@unmanaged
export class Sprite {
    public x: f32 = 0;
    public y: f32 = 0;

    public flipX: u32 = 0;
    public flipY: u32 = 0;

    constructor (
        public frame: Frame
    ) {
    }

    public draw(): void {
        const frame: Frame = this.frame;
        const x = this.x - f32(frame.width / 2);
        const y = this.y - f32(frame.height);

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