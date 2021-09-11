
import { _decorator, Component, Node, JsonAsset, Scene, SceneAsset } from 'cc';
import { TileMap } from './tileMap';
const { ccclass, property } = _decorator;

@ccclass('MapResHandle')
export class MapResHandle extends Component {
    mapRes : string = "";

    onCellBtnClick(event: Event, customEventData: string){
        debugger;
        if(!customEventData) return;
        let data :  { resName: string, horn: any[] } = JSON.parse(customEventData);
        console.log(`resName : ${this.mapRes}`);
        //切换
        var tile = this.node.scene.getComponentInChildren<TileMap>(TileMap);
        tile?.clear();
        tile?.setRes(data);
    }
}
