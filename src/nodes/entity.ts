import { Rect } from "../math/Rect";
import { saw } from "../math/saw";
import { AnimationSprite, Sprite } from "./sprite";

const tmpRectForHIT1 = new Rect(0,0,0,0);
const tmpRectForHIT2 = new Rect(0,0,0,0);

export class Entity {
    public node: Sprite | null;
    public health: u32 = 1;
    public id: u32 = 0;
    public hit: Rect | null;
    public obstacle: bool = true;

    public init(
        node: Sprite,
        health: u32 = 1,
        id: u32 = 0
    ): void {
        this.node = node;
        this.health = health;
        this.id = id;
    }
    
    public intersect (dest: Entity): bool {
        if (dest.hit === null || !dest.obstacle) {
            return false;
        }

        const hitA = dest.getHitbox(tmpRectForHIT1);
        const hitB = this.getHitbox(tmpRectForHIT2);

        return hitA.intersect(hitB);
    }

    public getHitbox(target: Rect): Rect {
        const node = this.node!;

        if (this.hit === null) {
            return node.getBounds(target);
        }

        const hit = this.hit!;

        hit.x = this.x - i32(f32(hit.width) * node.anchorX);
        hit.y = this.y - i32(f32(hit.height) * node.anchorY);

        return target.copyFrom(hit);
    }

    public get x(): i32 {
        return this.node!.x;
    }

    public get y(): i32 {
        return this.node!.y;
    }

    public set x (v: i32) {
        this.node!.x = i16(v);
    }

    public set y (v: i32) {
        this.node!.y = i16(v);
    }

    public update (tick: u32, world: Entity[]): void {
    
    }

    public damage (ammout: u32 = 1): void  {
    }

    public attack(): void {

    }

    public get sizeOfBytes(): u32 {
        return offsetof<Entity>() + offsetof<Sprite>();
    }
}

export class Tree extends Entity {
    
    private shakeStartTime: u32 = 0;
    private lastUpdateTick: u32 = 0;
    private _baseX: i32 = 0;
    private _blinkTime: u8 = 0;

    public init(
        node: Sprite,
        health: u32 = 1,
        id: u32 = 0
    ): void {
        super.init(node, health, id);

        if (!this.hit) {
            this.hit = new Rect(0,0,0,0);
        }

        const sprite = node as AnimationSprite;

        sprite.frameId = 0;
        sprite.syncAnchors();

        this.hit!.width = node.frame.width / 4;
        this.hit!.height = node.frame.height / 8;
        this.obstacle = true;

        if (this.health === 0) {
            this.kill();
        }
    }

    private kill(): void {
        const node = this.node as AnimationSprite;
                
        if(this.hit !== null) {
            this.hit!.dispose();
            this.hit = null;
            this.obstacle = false;
        }

        node.frameId = 1;
        node.syncAnchors();
    }

    public update (tick: u32, world: Entity[]): void {
        this.lastUpdateTick = tick;

        if (this.shakeStartTime > 0) {
            const delta: f32 = 4. * f32(tick - this.shakeStartTime) / 60.;

            this.x = i32(f32(this._baseX) + (1. - delta) *  saw(delta * 4.0 * Mathf.PI) * 2.0);

            if (delta > 1.) {
                this.x = this._baseX;
                this.shakeStartTime = 0;
            }
        }

        if (this._blinkTime > 0) {
            this._blinkTime --;
            this.node!.visible = !bool(this._blinkTime % 2);

            if (this._blinkTime === 0) {
                this.kill();
            }
        }
    }

    public damage (ammout: u32 = 1): void {
        if (this.health === 0) {
            return;
        }

        this.health -= min(this.health, ammout);

        if (this.health === 0) {
            this._blinkTime = 10;
            return;
        }

        this.shakeStartTime = this.lastUpdateTick;
        this._baseX = this.x;
    }
}