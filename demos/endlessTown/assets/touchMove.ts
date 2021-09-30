
import { _decorator, Component, EventTouch, SystemEventType, Vec3, Vec2, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TouchMove')
export class TouchMove extends Component {
    private static readonly help_v2 = new Vec2();
    private static readonly help_v3 = new Vec3();
    private static readonly help_v3_1 = new Vec3();

    @property({ type: [Node] })
    mapRoots: Node[] = [];

    private startPoint: Vec2 = new Vec2();
    private startPos: Vec3 = new Vec3();
    private moveDir: Vec2 = new Vec2();
    private currMoveSpeed: number = 10;
    private maxSpeed: number = 1000;
    private minSpeed: number = 50;
    private dampingRate: number = 0.1;

    start() {
        // [3]
        this.node.on(SystemEventType.TOUCH_START, this.onStart, this);
        this.node.on(SystemEventType.TOUCH_MOVE, this.onMove, this);
        this.node.on(SystemEventType.TOUCH_END, this.onEnd, this);
        this.node.on(SystemEventType.TOUCH_CANCEL, (event: EventTouch) => {
            // console.log(` on touch canvas  TOUCH_CANCEL! touch point : ${event.getLocation().toString()}`)
        });
    }

    update(dt: number) {
        this.damper(dt);
        this.doMoveByDir(dt);
    }

    onStart(event: EventTouch) {
        // console.log(` on touch canvas  start! touch point : ${event.getLocation().toString()}`)
        event.getLocation(this.startPoint);

        this.mapRoots.forEach((val) => {
            Vec2.copy(this.startPos, val.position);
        });
        this.moveDir.set(0, 0);
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
        let dist = dtPos.length();
        if (dist < 1) return; //移动的很小 暂停 移动
        Vec2.copy(this.moveDir, dtPos);
        this.moveDir.normalize();
        // let dtPosV3 = TouchMove.help_v3;
        // dtPosV3.set(dtPos.x, dtPos.y, 0);
        // dtPosV3.add(this.startPos);
        // this.tileMapObj?.node.setPosition(dtPosV3);

        //set speed
        // this.currMoveSpeed = dist / 100 * this.maxSpeed;
    }

    doMoveByDir(dt: number) {
        if (this.moveDir.lengthSqr() == 0) {
            return;
        }
        let dtPos = TouchMove.help_v2;
        Vec2.multiplyScalar(dtPos, this.moveDir, dt * this.currMoveSpeed);
        let dtPosV3 = TouchMove.help_v3;
        dtPosV3.set(dtPos.x, dtPos.y, 0);

        this.mapRoots.forEach((val) => {
            let tempV3 = TouchMove.help_v3_1;
            Vec2.add(tempV3, dtPosV3, val.position);
            val.setPosition(tempV3);
        });
    }

    damper(dt: number) {
        this.currMoveSpeed -= this.dampingRate * this.currMoveSpeed;
        this.currMoveSpeed = Math.min(this.currMoveSpeed, this.maxSpeed);
        this.currMoveSpeed = Math.max(this.currMoveSpeed, this.minSpeed);
    }

}

