
import { _decorator, Component, Node, Sprite, resources, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestSp')
export class TestSp extends Component {
    start() {
        // [3]
        let _sp = this.node.getComponent(Sprite);
        resources.load<SpriteFrame>("imgs/01/spriteFrame", SpriteFrame, (err, spf) => {
            if (_sp) {
                _sp.spriteFrame = spf;
            }
        });
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
