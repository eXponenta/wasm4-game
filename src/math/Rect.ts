//@unmanaged
export class Rect {
    constructor (
        public x: i32,
        public y: i32,
        public width: u32,
        public height: u32
    ) {}

    public get right(): i32 {
        return this.x + this.width;
    }

    public get bottom(): i32 {
        return this.y + this.height;
    }

    public intersect (rect: Rect): bool {
        if (this.x > rect.right)
            return false;

        if (this.y > rect.bottom)
            return false;
        
        if (rect.x > this.right)
            return false;

        if (rect.y > this.bottom)
            return false;

        return true;
    }

    public copyFrom(src: Rect): this {
        this.x = src.x;
        this.y = src.y;
        this.width = src.width;
        this.height = src.height;

        return this;
    }

    public dispose(): void {
        //heap.free(changetype<usize>(this));
    }
}