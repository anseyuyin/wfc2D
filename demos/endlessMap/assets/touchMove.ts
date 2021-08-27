
import { _decorator, Component, EventTouch, SystemEventType, Vec3, Vec2 } from 'cc';
import { TileMap } from './tileMap';
const { ccclass, property } = _decorator;

@ccclass('TouchMove')
export class TouchMove extends Component {
    private static readonly help_v2 = new Vec2();
    private static readonly help_v3 = new Vec3();
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    @property({ type: TileMap })
    tileMapObj: TileMap | null = null;

    private startPoint: Vec2 = new Vec2();
    private startPos: Vec3 = new Vec3();

    start() {
        // [3]
        this.node.on(SystemEventType.TOUCH_START, this.onStart, this);
        this.node.on(SystemEventType.TOUCH_MOVE, this.onMove, this);
        this.node.on(SystemEventType.TOUCH_END, this.onEnd, this);
        this.node.on(SystemEventType.TOUCH_CANCEL, (event: EventTouch) => {
            // console.log(` on touch canvas  TOUCH_CANCEL! touch point : ${event.getLocation().toString()}`)
        });
    }

    onStart(event: EventTouch) {
        // console.log(` on touch canvas  start! touch point : ${event.getLocation().toString()}`)
        event.getLocation(this.startPoint);
        this.startPos = this.tileMapObj?.node.position.clone() as Vec3;

    }

    onEnd(event: EventTouch) {
        //复位
        // this.tileMapObj?.node.setPosition(this.startPos);
    }

    onMove(event: EventTouch) {
        // console.log(` on touch canvas  TOUCH_MOVE! touch point : ${event.getLocation().toString()}`)
        let dtPos = TouchMove.help_v2;
        event.getLocation(dtPos);
        dtPos.subtract(this.startPoint);
        let dtPosV3 = TouchMove.help_v3;
        dtPosV3.set(dtPos.x, dtPos.y, 0);
        dtPosV3.add(this.startPos);

        this.tileMapObj?.node.setPosition(dtPosV3);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
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
