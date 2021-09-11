
import { _decorator, Component, Node, macro, dynamicAtlasManager } from 'cc';
import { DownList } from './downList';
const { ccclass, property } = _decorator;

@ccclass('AppMain')
export class AppMain extends Component {
    start() {
        //开启 动态合图
        macro.CLEANUP_IMAGE_CACHE = false;
        dynamicAtlasManager.enabled = true;
        let arr = [{ resName: "Circuit", horn: [["substrate", 0]] },
                    { resName: "Carcassonne", horn: [["1", 0]] },
                    { resName: "Summer", horn: [["grass 0", 0]] },
                    { resName: "Village", horn: [["village_3_0", 0]] },
                    { resName: "test", horn: [["3", 0]] }
                    ];
        DownList.dataArr = arr;
    };
}
