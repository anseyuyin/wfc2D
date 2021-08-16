
import { _decorator, Component, Node, Vec2, Vec3, Sprite, resources, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Grid')
export class Grid extends Component {
    private static readonly helpV3 = new Vec3();
    private static _poolArr: Grid[] = [];
    private static IN_POOL_TAG = "__inPoolTag__";

    private _size: number = 100;
    private _GridPos: Vec2 = new Vec2();
    private _sp: Sprite | null = null;
    /** 格子的尺寸 */
    public get size() { return this._size; }
    public set size(val: number) { this._size = val; }

    public static poolNew(): Grid {
        let result: Grid = this._poolArr.pop() as Grid;
        if (!result) {
            let _node = new Node("grid");
            result = _node.addComponent(Grid);
        } else {
            delete (result as any)[this.IN_POOL_TAG];
        }
        return result;
    }

    public static poolDelete(val: Grid) {
        if (!val || (val as any)[this.IN_POOL_TAG]) return;
        this._poolArr.push(val);
    }

    start() {
        // [3]
        this._sp = this.addComponent(Sprite);
        let tran = this.node.getComponent(UITransform);
        resources.load<SpriteFrame>("imgs/01/spriteFrame", SpriteFrame, (err, spf) => {
            if (this._sp) {
                this._sp.spriteFrame = spf;
                if (tran) {
                    tran.width = this._size;
                    tran.height = this._size;
                    tran.setAnchorPoint(new Vec2(0,0));
                }
            }
        });
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    show() {

    }

    hide() {

    }

    setGridPosition(pos: Vec2) {
        let _pos = Grid.helpV3;
        _pos.set(pos.x, pos.y, 0);
        _pos = _pos.multiplyScalar(this._size);
        this.node.setPosition(_pos);
        this._GridPos.set(pos.x, pos.y);

    }

    getGridPosition() {
        return this._GridPos.clone();
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
