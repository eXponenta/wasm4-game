import { FPS } from "../constants";
import { trace } from "../wasm4";
import { AnimationSprite, Sprite } from "./sprite";

export class Entity {
    constructor (
        public node: Sprite,
        public health: u32 = 1,
    ) {

    }

    public get x(): i32 {
        return this.node.x;
    }

    public get y(): i32 {
        return this.node.y;
    }

    public set x (v: i32) {
        this.node.x = v;
    }

    public set y (v: i32) {
        this.node.y = v;
    }

    public update (tick: u32, world: Entity[]): void {
    
    }

    public damage (): void {
    }
}

export class Tree extends Entity {
    private shakeStartTime: u32 = 0;
    private lastUpdateTick: u32 = 0;
    private _baseX: i32 = 0;

    public update (tick: u32, world: Entity[]): void {
        this.lastUpdateTick = tick;

        if (this.shakeStartTime > 0) {
            const delta: f32 = 4. * f32(tick - this.shakeStartTime) / 60.;

            this.x = i32(f32(this._baseX) + delta *  Mathf.sin(delta * 4.0 * Mathf.PI) * 2.0);

            if (delta > 1.) {
                this.x = this._baseX;
                this.shakeStartTime = 0;
            }
        }
    }

    public damage (): void {
        if (this.health === 0) {
            return;
        }

        this.health --;

        if (this.health === 0) {
            const node = this.node as AnimationSprite;

            node.frameId = 1;
            node.anchorX = node.frame.anchorX;
            node.anchorY = node.frame.anchorY;
    
            return;
        }

        this.shakeStartTime = this.lastUpdateTick;
        this._baseX = this.x;
    }
}