import * as w4 from './../wasm4';

@final
@unmanaged
export class Sprite {
    public x: i32 = 0;
    public y: i32 = 0;

    public flipX: u32 = 0;
    public flipY: u32 = 0;

    constructor (
        public width: u32 = 0,
        public height: u32 = 0,
        public data: usize,
        public type: usize = w4.BLIT_1BPP
    ) {

    }

    public draw() {
        w4.blit(
            this.data,
            this.x,
            this.y,
            this.width,
            this.height,
            (
                this.flipX & w4.BLIT_FLIP_X |
                this.flipY & w4.BLIT_FLIP_Y |
                this.type
            )
        );
    }
}