
import { _decorator, Component, Node, macro, dynamicAtlasManager, TiledMap } from 'cc';
import { DownList } from './downList';
import { TileMap } from './tileMap';
import { WfcLoader } from './wfcLoader';
const { ccclass, property } = _decorator;

@ccclass('AppMain')
export class AppMain extends Component {
    async start() {
        //开启 动态合图
        macro.CLEANUP_IMAGE_CACHE = false;
        dynamicAtlasManager.enabled = true;
        let dirPath = `https://anseyuyin.github.io/wfc2D/res/configs/`;
        let _dataUrl = `${dirPath}endlessMap.cfg.json`;
        let req = await WfcLoader.xhrLoad(_dataUrl, "json");
        let datas: { resName: string }[] = req.response;
        if (!datas || datas.length < 1) return;
        DownList.dataArr = datas as any;
        //开始 展示第一个
        var tile = this.node.scene.getComponentInChildren<TileMap>(TileMap);
        tile?.setRes(datas[0]);
    };
}
