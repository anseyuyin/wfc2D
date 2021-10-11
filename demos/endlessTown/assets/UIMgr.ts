
import { _decorator, Component, Node, eventManager } from 'cc';
import { EventMgr } from './eventMgr';
const { ccclass, property } = _decorator;

@ccclass('UIMgr')
export class UIMgr extends Component {
    private _mapComplete : boolean = false;
    private _UIComplete : boolean = false;
    private _GridShowCount = 0;

    start () {
        this.startUITime();
        //监听 地图整理 完毕。
        EventMgr.addListener("gridShow",this.onGridShow,this);
    }

    private onGridShow(){
        this._GridShowCount++;
        if(this._GridShowCount >= 4){
            this._mapComplete = true;
            this.ckCloseUI();
        }
    }

    private startUITime(){
        setTimeout(() => {
            this._UIComplete = true;
            this.ckCloseUI();
        }, 3000);
    }

    private ckCloseUI(){
        if(!this._mapComplete || !this._UIComplete) return;
        this.node.active = false;
    }
}

