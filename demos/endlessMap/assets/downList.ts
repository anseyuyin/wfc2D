
import { _decorator, Component, Node, Button, EventMouse, instantiate, Label, Vec3, UITransform, ScrollView, EventHandler } from 'cc';
import { MapResHandle } from './mapResHandle';
const { ccclass, property } = _decorator;

@ccclass('DownList')
export class DownList extends Component {

    public static dataArr: { resName: string, horn: any[] }[];
    private inited = false;
    private showSV = false;

    @property({ type: Node })
    content: Node | null = null;

    @property({ type: Button })
    btn: Node | null = null;

    private tryToInit() {
        if (this.inited || DownList.dataArr == null) return;
        this.inited = true;
        let templet = this.content?.getChildByName("template");
        let gapH = 20;
        DownList.dataArr.forEach((val, i) => {
            let _n = instantiate(templet) as Node;
            this.content?.addChild(_n);
            _n.active = true;
            let pos = _n.position;
            Vec3.set(pos, pos.x, -i * gapH, 0);
            _n.position = pos;
            let lab = _n.getComponent<Label>(Label) as Label;
            lab.string = val.resName;
            //add button
            let btn = _n.addComponent<Button>(Button);
            let mrh = _n.addComponent<MapResHandle>(MapResHandle);
            mrh.mapRes = val.resName;
            let cEvent : EventHandler = new EventHandler();
            cEvent.component = "MapResHandle";
            cEvent.handler = "onCellBtnClick";
            cEvent.target = _n;
            cEvent.customEventData = JSON.stringify(val);
            btn.clickEvents.push(cEvent);
        });
    }

    update() {
        this.tryToInit();
    }

    onBtnClick() {
        if (!this.inited) return;
        this.showSV = !this.showSV;
        if (this.content && this.content.parent && this.content.parent.parent) {
            this.content.parent.parent.active = this.showSV;

        }
    }
}
