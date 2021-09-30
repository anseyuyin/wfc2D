
import { _decorator, Component, Node, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Combin')
export class Combin extends Component {
    private _currIdx: number = 0;

    // [2]
    @property({ type: [Node] })
    nodes: Node[] = [];


    get currIdx() { return this._currIdx; }
    set currIdx(val) {
        this._currIdx = val;
        this.nodes.forEach(val => val.active = false);
        this.nodes[val].active = true;
    }

    start() {
        // this.random();
    }

    random(){
        let len = this.nodes.length;
        this.currIdx = Math.floor(Math.random() * len);
    }

}
