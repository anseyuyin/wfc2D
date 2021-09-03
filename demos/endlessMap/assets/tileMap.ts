
import { _decorator, Component, Node, Rect, UITransform, Canvas, Director, math, Vec2, tweenUtil, Layers, System } from 'cc';
import { Grid, GridState } from './grid';
import { WfcLoader } from './wfcLoader';
const { ccclass, property } = _decorator;

@ccclass('TileMap')
export class TileMap extends Component {
    private static readonly helpV2: Vec2 = new Vec2();
    private static readonly helpRect: Rect = new Rect();
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    private _gridSize = 1000;
    @property
    private get gridSize() { return this._gridSize; };
    private set gridSize(val) {
        this._gridSize = val;
    };

    private grids: Grid[] = [];
    private _canvas: Canvas | null = null;
    private _gridMap: Map<string, Grid> = new Map();
    private _inited = false;
    private _OffsetList: Vec2[] = [];

    start() {
        this.init();
    }



    update(deltaTime: number) {
        if (!this._inited) return;
        this.ckBorderOver();
    }

    private async init() {
        if (this._inited) return;
        let s = Director.instance.getScene();
        this._canvas = s?.getComponentInChildren(Canvas) as Canvas;

        //获取资源
        // let path = `../../../res/samples/Circuit`;
        // let resName = "Circuit";
        let resName = "Summer";
        let path = `https://anseyuyin.github.io/wfc2D/res/samples/${resName}/`;
        let data = await WfcLoader.getWFC(path);
        this._gridSize = 1000;
        Grid.wfcDataImg = data as any;
        Grid.tileSize = 50;
        Grid.horn = [["grass 0",0]];

        // let c = data?.config as WFC.wfc2dData;
        // //test cacle wfc
        // let _wfc = new WFC.WFC2D(c);
        // let wfcResult = await _wfc.collapse(10, 10);

        this._OffsetList.push(new Vec2(0, 1));
        this._OffsetList.push(new Vec2(1, 0));
        this._OffsetList.push(new Vec2(0, -1));
        this._OffsetList.push(new Vec2(-1, 0));
        this._inited = true;
    }

    /** 检查是否超出了边界 */
    private ckBorderOver() {

        let bound = TileMap.helpRect;
        let pos = this.node.position;
        let canvasUITrans = this._canvas?.node.getComponent(UITransform) as UITransform;
        let halfW = canvasUITrans.width * 0.5;
        let halfH = canvasUITrans.height * 0.5;
        bound.set(-(pos.x + halfW), -(pos.y + halfH), canvasUITrans.width, canvasUITrans.height);
        //over scale 保障平滑
        let overScale = 0.5;
        bound.width     += halfW * overScale;
        bound.height    += halfH * overScale;
        bound.x         -= halfW * overScale;
        bound.y         -= halfH * overScale;

        //console.log(bound.toString());
        let xMin = Math.floor(bound.x / this._gridSize);
        let xMax = Math.floor((bound.x + bound.width) / this._gridSize);
        let yMin = Math.floor(bound.y / this._gridSize);
        let yMax = Math.floor((bound.y + bound.height) / this._gridSize);


        let _size = TileMap.helpV2;
        _size.x = xMax - xMin + 1;
        _size.y = yMax - yMin + 1;
        let gridPosArr: number[] = [];
        let addMap: Map<string, boolean> = new Map();
        let deleteMap: Map<string, boolean> = new Map();

        this._gridMap.forEach((v, k) => {
            deleteMap.set(k, true);
        });
        // 
        for (let i = 0; i < _size.x; i++) {
            for (let j = 0; j < _size.y; j++) {
                let x = i + xMin;
                let y = j + yMin;
                gridPosArr.push(x, y);
                let posKey = `${x}_${y}`;
                if (this._gridMap.has(posKey)) {
                    deleteMap.delete(posKey);
                } else {
                    addMap.set(posKey, true);
                }
            }
        }

        //删除超出的grid
        let _ks = deleteMap.keys();
        while (true) {
            let v = _ks.next();
            if (v.done) break;
            let _g = this._gridMap.get(v.value);
            _g?.hide();
            if (_g && _g.node.parent) {
                _g.node.parent.removeChild(_g.node);
            }
            Grid.poolDelete(_g as Grid);

            this._gridMap.delete(v.value);
        }

        //增加新增grid
        _ks = addMap.keys();
        while (true) {
            let v = _ks.next();
            if (v.done) break;
            let _g = Grid.poolNew();
            this.node.addChild(_g.node);
            _g.size = this._gridSize;
            _g.node.layer = Layers.Enum.UI_2D;
            let _arr = v.value.split("_");
            _g.setGridPosition(new Vec2(Number(_arr[0]), Number(_arr[1])));
            // _g.show();
            this._gridMap.set(v.value, _g);
        }

        if (addMap.size > 0) {
            this.showGridpass();
        }

        // console.log(gridPosArr.toString());
    }

    //显示 grid 
    private showGridpass() {
        //to show
        this._gridMap.forEach(async (val) => {
            // let pos = val.getGridPosition();
            // if(0 <= pos.x && pos.x < 5 && 0 <= pos.y && pos.y < 5) {

            // }else{
            //     return;
            // }

            let cN: number[] = null as any;
            let _key = val.getPosKey();
            if (!val.hasData()) {
                cN = [];
                let needWaits: string[] = [];
                //检查等待
                while (true) {
                    this.ckNeighbors(val, needWaits, cN);
                    if (needWaits.length < 1) break;
                    //等待处理中的邻居
                    await this.toWaitNeighbor(needWaits);
                    if (_key != val.getPosKey()) break;    //grid 物是人非了，不需要 show了
                    //再次检查 是否还要等 
                }
                //设置已经完成的邻居
            }
            val.show(cN);

        });
    }

    private ckNeighbors(_g: Grid, OutNeedWaits: string[], OutCompleteNeighbors: number[]) {
        OutNeedWaits.length = 0;
        OutCompleteNeighbors.length = 0;
        let len = 4;
        let pos = _g.getGridPosition();
        for (let i = 0; i < len; i++) {
            let v2 = this._OffsetList[i];
            let _nkey = `${pos.x + v2.x}_${pos.y + v2.y}`;
            let nGrid = this._gridMap.get(_nkey) as Grid;
            if (!nGrid) continue;
            if (nGrid.state == GridState.complete) {
                OutCompleteNeighbors.push(i);
            }
            if (nGrid.state == GridState.collapseing) {
                OutNeedWaits.push(_nkey);
            }
        }
    }

    private toWaitNeighbor(waits: string[]) {
        let _resolve: Function;
        let _p = new Promise((resolve) => {
            _resolve = resolve;
        });

        let map: { [key: string]: boolean } = {};
        waits.forEach((val) => { map[val] = true });
        let obj = {
            onCollapsed: (key: string) => {
                delete map[key];
                if (Object.keys(map).length < 1) {
                    Grid.eventer.RemoveListener(Grid.ON_COLLAPSED, obj.onCollapsed, obj);
                    _resolve();
                }
            }
        }
        Grid.eventer.On(Grid.ON_COLLAPSED, obj.onCollapsed, obj);

        return _p;
    }
}