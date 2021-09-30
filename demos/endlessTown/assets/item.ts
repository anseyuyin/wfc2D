
import { _decorator, Component, Node, Vec2, Enum } from 'cc';
import { Combin } from './combin';
const { ccclass, property } = _decorator;

export enum FloorType {
    /** 草地 */
    grass,
    /** 海滩 */
    beach
}
Enum(FloorType) //让属性检查面板能看到下拉列表

@ccclass('Item')
export class Item extends Component {
    private combins: Combin[] = [];

    @property
    size: Vec2 = new Vec2(1, 1);

    @property({ type: FloorType, })
    floorType: FloorType = FloorType.grass;

    @property
    weight: number = 100;

    onLoad() {
        this.combins = this.node.getComponentsInChildren(Combin).concat();
    }

    randomState(){
        this.combins.forEach((val,i)=>{
            if(val){
                val.random();
            }
        });
    }

    setState(_sta : number[]){
        this.combins.forEach((val,i)=>{
            if(val){
                val.currIdx = _sta[i];
            }
        });
    }

    getState(outSta : number[]){
        outSta.length = 0;
        this.combins.forEach((val,i)=>{
            if(val){
                outSta.push(val.currIdx);
            }
        });
    }   

}