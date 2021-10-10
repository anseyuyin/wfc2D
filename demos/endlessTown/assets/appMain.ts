
import { _decorator, Component, Node, macro, dynamicAtlasManager, TiledMap } from 'cc';
import { Grid } from './grid';
import { FloorType } from './item';
import { TileMap } from './tileMap';
const { ccclass, property } = _decorator;

@ccclass('AppMain')
export class AppMain extends Component {
    public static ItmeProbabilityMap : Map<FloorType, number> = new Map();
    public static CDNPath: string = `https://anseyuyin.github.io/wfc2D/`;
    public static Config: string = `
        { "resName": "Village", "horn": [
            [
                "village_3_0",
                0
            ]
        ],
        "top":[["village_3_0",0]],
        "right":[["village_3_0",0]],
        "bottom":[["village_3_0",0]],
        "left":[["village_3_0",0]]
    }
    `;

    async start() {
        var data = JSON.parse(AppMain.Config);
        //开始 展示第一个
        var tile = this.node.scene.getComponentInChildren<TileMap>(TileMap);
        tile?.setRes(data);

        //grid tile event set
        Grid.setEventTile({
            "village_3_0": FloorType.grass,
            "village_17_4": FloorType.beach
        });

        AppMain.ItmeProbabilityMap.set(FloorType.grass, 0.4);
        AppMain.ItmeProbabilityMap.set(FloorType.beach, 0.5);
    };
}

if (window && window.location && window.location.hostname.indexOf("github") == -1) {
    //set CNDPath of custom location Path
    AppMain.CDNPath = `http://127.0.0.1:5500/`;
}
