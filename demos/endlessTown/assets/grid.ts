
import { _decorator, Component, Node, Vec2, Vec3, Sprite, resources, SpriteFrame, UITransform, math, Layers, Mesh } from 'cc';
import { Eventer } from './eventer';
import { baseEvent, EventMgr } from './eventMgr';
import { wfcDataImg } from './wfcLoader';
const { ccclass, property } = _decorator;

export enum GridState {
    /** 空状态 */
    none,
    /** 坍缩中 */
    collapseing,
    /** 完成 */
    complete
}

@ccclass('Grid')
export class Grid extends Component {
    private static readonly helpV3 = new Vec3();
    private static readonly helpV2 = new Vec2();
    private static _poolArr: Grid[] = [];
    private static IN_POOL_TAG = "__inPoolTag__";
    private static posDataMap: Map<string, [string, number][]> = new Map();
    private static collapseingMap: Map<string, boolean> = new Map();
    private static _wfcPool: WFC.WFC2D[] = [];
    private static _TileEventMap: { [key: string]: number } = {};

    /** 坍缩完成 */
    public static readonly ON_COLLAPSED = "ON_COLLAPSED";
    /** 瓦块像素尺寸 */
    public static tileSize: number = 50;
    public static gridSize: number = 100;
    /** wfc 资源数据 */
    public static wfcDataImg: wfcDataImg;
    /** 事件管理对象 */
    public static eventer: Eventer = new Eventer();
    /** 连接角 */
    public static horn: [string, number][];
    public static top: [string, number][];
    public static right: [string, number][];
    public static bottom: [string, number][];
    public static left: [string, number][];

    public static poolNew(): Grid {
        let result: Grid = this._poolArr.pop() as Grid;
        if (!result) {
            let _node = new Node("grid");
            result = _node.addComponent(Grid);
        } else {
            delete (result as any)[this.IN_POOL_TAG];
        }
        return result;
    }

    public static poolDelete(val: Grid) {
        if (!val || (val as any)[this.IN_POOL_TAG]) return;
        this._poolArr.push(val);
    }

    private static getWFC() {
        let result;
        for (let i = 0, len = this._wfcPool.length; i < len; i++) {
            let val = this._wfcPool[i];
            if (!val.isCollapseing) {
                result = val;
                this._wfcPool.splice(i, 1);
                break;
            }
        }

        if (!result) {
            result = new WFC.WFC2D(Grid.wfcDataImg.config);
        }

        return result;
    }

    private static storeWFC(_wfc: WFC.WFC2D) {
        if (!_wfc) return;
        this._wfcPool.push(_wfc);
    }

    public static clear() {
        this.posDataMap.clear();
        this.posDataMap.clear();
        this._wfcPool.length = 0;
        this._poolArr.length = 0;
    }

    public static setEventTile(_map: { [key: string]: number }) {
        this._TileEventMap = _map;
    }

    private static getTileByWPos(_wPos: Vec2): [string, number] {
        let result: [string, number] = null as any;
        //获取 guid
        let gX = Math.floor(_wPos.x / Grid.gridSize);
        let gY = Math.floor(_wPos.y / Grid.gridSize);
        let gPosKey = `${gX}_${gY}`;
        let gridTs = this.posDataMap.get(gPosKey);
        if (!gridTs) return result;
        //获取瓦片
        let tileX = Math.floor((_wPos.x - (gX * Grid.gridSize)) / Grid.tileSize);
        let tileY = Math.floor((_wPos.y - (gY * Grid.gridSize)) / Grid.tileSize);
        let max = Grid.gridSize / Grid.tileSize;
        let _tileY = max - tileY - 1;
        let idx = tileX + max * _tileY;
        result = gridTs[idx];
        return result;
    }

    // public static ttt(_wPos: Vec2) {
    //     let result: [string, number] = null as any;
    //     //获取 guid
    //     let gX = Math.floor(_wPos.x / Grid.gridSize);
    //     let gY = Math.floor(_wPos.y / Grid.gridSize);
    //     let gPosKey = `${gX}_${gY}`;
    //     let gridTs = this.posDataMap.get(gPosKey);
    //     if (!gridTs) return result;
    //     //获取瓦片
    //     let tileX = Math.floor((_wPos.x - (gX * Grid.gridSize)) / Grid.tileSize);
    //     let tileY = Math.floor((_wPos.y - (gY * Grid.gridSize)) / Grid.tileSize);
    //     let max = Grid.gridSize / Grid.tileSize;
    //     let _tileY = max - tileY - 1;
    //     let idx = tileX + max * _tileY;
    //     result = gridTs[idx];
    //     //
    //     var root = ((Grid as any)["_r"] as Node);
    //     var gArr = root.getComponentsInChildren(Grid);
    //     for (let i = 0, len = gArr.length; i < len; i++) {
    //         let _g = gArr[i];
    //         if (!_g.getGridPosition().equals(new Vec2(gX, gY))) continue;
    //         let t = _g._wfcSpMap.get(`${tileX}_${tileY}`) as Sprite;
    //         t.node.active = false;
    //     }

    //     //add 
    //     return result;
    // }

    /**
     * 判断 区域是否连城一片
     * @param wpos 
     * @param size 
     * @returns 
     */
    public static judgeArea(wpos: Vec2, size: Vec2): boolean {
        if (size.x <= 1 && size.y <= 1) return true;
        let tragetTile: string = null as any;
        let v2 = Grid.helpV2;
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
                v2.x = wpos.x + x * Grid.tileSize;
                v2.y = wpos.y + y * Grid.tileSize;
                let arr = this.getTileByWPos(v2);
                // let arr = this.ttt(v2);
                if (arr == null) return false;
                let str: string;
                let num: number;
                [str, num] = arr;
                if (tragetTile == null) {
                    tragetTile = str;
                    continue;
                };
                if (tragetTile != str) return false;
            }
        }

        return true;
    }

    //--------------------------------------------------
    // private _size: number = 100;
    private _GridPos: Vec2 = new Vec2();
    private _sp: Sprite | null = null;
    private _wfc: WFC.WFC2D | null = null;
    private _wfcSpMap: Map<string, Sprite> = new Map();
    private _state: GridState = GridState.none;
    private _tileEvent = new baseEvent<{ pos: Vec2, tType: number, gPos: string }>({ pos: new Vec2(), tType: 0, gPos: "" });
    private _offTileEvent = new baseEvent<string>();

    private get wfc() {
        if (!this._wfc && Grid.wfcDataImg) {
            // this._wfc = new WFC.WFC2D(Grid.wfcDataImg.config);
            this._wfc = Grid.getWFC();
        }
        return this._wfc;
    }

    // /** 格子的尺寸 */
    // public get size() { return this._size; }
    // public set size(val: number) { this._size = val; }
    /** 状态 */
    public get state() {
        let key = this.getPosKey();
        if (Grid.posDataMap.has(key)) return GridState.complete;
        if (Grid.collapseingMap.has(key)) return GridState.collapseing;
        return GridState.none;
    }

    start() {
        this.node.on
        //create
        let tsize = Grid.tileSize;
        let len = Math.floor(Grid.gridSize / tsize);
        for (let y = 0; y < len; y++) {
            for (let x = 0; x < len; x++) {
                let posKey = `${x}_${y}`;
                let _n = new Node(posKey);
                _n.layer = Layers.Enum.UI_2D;
                _n.parent = this.node;
                this.node.addChild(_n);
                _n.setPosition((x + 0.5) * tsize, (y + 0.5) * tsize);
                let _sp = _n.addComponent(Sprite);
                _sp.sizeMode = Sprite.SizeMode.CUSTOM;
                this._wfcSpMap.set(posKey, _sp);
                let _ut = _n.getComponent(UITransform) as UITransform;
                _ut.width = tsize;
                _ut.height = tsize;

                // // let file = "imgs/01/spriteFrame";
                // resources.load<SpriteFrame>("test_plist/123/2", SpriteFrame, (err, spf) => {
                //     if (_sp) {
                //         _sp.spriteFrame = spf;
                //         if (_ut) {
                //             _ut.width = tsize;
                //             _ut.height = tsize;
                //             // _ut.setAnchorPoint(new Vec2(0, 0));
                //         }
                //     }
                // });
            }
        }
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    /**
     * 显示
     * @param completeNeighbor 已经完成的邻居(0 上,1 右,2 下,3 左)
     */
    show(completeNeighbor?: number[]) {
        let key = this.getPosKey();
        let data = Grid.posDataMap.get(key);
        if (data) {
            this.refrashDisplay();
        } else {
            //生成数据
            Grid.collapseingMap.set(key, true);
            let size = Math.floor(Grid.gridSize / Grid.tileSize);
            this.wfc?.clearKnown();

            let cnArr = this.calcaknown(completeNeighbor);
            let hasCN = cnArr && cnArr.length > 0;
            let baseCn = this.calcaHornknown(completeNeighbor);
            if (hasCN) {
                size += 2;
                baseCn = baseCn.concat(cnArr as any);
            }
            this.wfc?.setKnown(baseCn);
            try {
                this.wfc?.collapse(size, size, 1000).then((_d) => {
                    Grid.eventer.Emit(Grid.ON_COLLAPSED, key);  //派发事件
                    Grid.collapseingMap.delete(key);
                    if (_d.length < 1) {
                        console.error(`collapse 计算的返回值为空`);
                        return;
                    }
                    if (key == this.getPosKey()) {
                        if (hasCN) {
                            this.cutData(_d, size);
                        }
                        Grid.posDataMap.set(key, _d);
                        this.refrashDisplay();
                    }
                }).catch((err) => {
                    Grid.collapseingMap.delete(key);
                    console.error(err);
                });
            } catch (err) {
                console.error(err);
            }

        }

        this._state
    }

    hide() {
        this._wfcSpMap.forEach((val) => {
            if (val) {
                val.node.active = false;
            }
        });

        if (this._wfc && this._wfc?.isCollapseing) {
            Grid.storeWFC(this._wfc as any);
            this._wfc = null;
        }

        //off Tile 事件
        let key = this.getPosKey();
        this._offTileEvent.data = key;
        EventMgr.dispatchEvent("offTile", this._offTileEvent);
    }

    setGridPosition(pos: Vec2) {
        let _pos = Grid.helpV3;
        _pos.set(pos.x, pos.y, 0);
        _pos = _pos.multiplyScalar(Grid.gridSize);
        this.node.setPosition(_pos);
        this._GridPos.set(pos.x, pos.y);
        //set satete

    }

    getGridPosition() {
        return this._GridPos.clone();
    }

    hasData() {
        let key = this.getPosKey();
        return Grid.posDataMap.get(key) != null;
    }

    getPosKey() {
        let pos = this._GridPos;
        return `${pos.x}_${pos.y}`;
    }

    //刷新显示
    private refrashDisplay() {
        //test
        let key = this.getPosKey();
        console.log(`---- key : ${key}`);

        let data = Grid.posDataMap.get(key);
        let _map = this._wfcSpMap;
        if (!data || !_map) return;

        let size = Math.floor(Grid.gridSize / Grid.tileSize);
        for (let i = 0, len = data.length; i < len; i++) {
            let x = i % size;
            let y = Math.floor((len - 1 - i) / size);
            let key = `${x}_${y}`;
            let val = _map.get(key) as Sprite;
            if (!val) continue;
            let imgResStr = data[i][0];
            val.node.active = true;
            val.spriteFrame = Grid.wfcDataImg.imgs[imgResStr] as any;
            val.node.eulerAngles;
            let euler = Grid.helpV3;
            Vec3.set(euler, 0, 0, data[i][1] * -90);
            val.node.setRotationFromEuler(euler);

            //检查 目标地块触发
            if (Grid._TileEventMap[imgResStr] != null) {
                this._tileEvent.data.tType = Grid._TileEventMap[imgResStr];
                this._tileEvent.data.pos.x = (x + this._GridPos.x * size) * Grid.tileSize;
                this._tileEvent.data.pos.y = (y + this._GridPos.y * size) * Grid.tileSize;
                this._tileEvent.data.gPos = key;
                EventMgr.dispatchEvent("onTile", this._tileEvent);
            }

        }

        //test 
        // if ((this._GridPos.x % 2) ^ (this._GridPos.y % 2)) {
        // if ((this._GridPos.x % 2)) {
        //     this.node.active = false;
        // } else {
        //     this.node.active = true;
        // }
    }

    private calcaHornknown(completeNeighbor?: number[]) {
        let arr: { x: number; y: number; tiles: [string, number][]; }[] = [];
        if (!Grid.horn || Grid.horn.length < 1) return arr;
        let cnb = completeNeighbor;
        let rawSize = Math.floor(Grid.gridSize / Grid.tileSize);
        let max: number;
        let min: number;
        if (cnb && cnb.length > 0) {
            max = (rawSize + 2) - 2;
            min = 1;
        } else {
            min = 0;
            max = rawSize - 1;
        }
        //set horn
        arr.push({ x: min, y: min, tiles: Grid.horn });
        arr.push({ x: max, y: min, tiles: Grid.horn });
        arr.push({ x: max, y: max, tiles: Grid.horn });
        arr.push({ x: min, y: max, tiles: Grid.horn });

        //set edges
        let centerSize = rawSize - 2;
        if (centerSize < 1) return arr;

        for (let i = 0; i < centerSize; i++) {
            if (Grid.top) {  //top neighbor
                arr.push({ x: min + 1 + i, y: min, tiles: Grid.top });
            }
            if (Grid.right) {  //right neighbor
                arr.push({ x: max, y: min + 1 + i, tiles: Grid.right });
            }
            if (Grid.bottom) {  //bottom neighbor
                arr.push({ x: min + 1 + i, y: max, tiles: Grid.bottom });
            }
            if (Grid.left) {  //left neighbor
                arr.push({ x: min, y: min + 1 + i, tiles: Grid.left });
            }
        }

        return arr;
    }

    //计算 已知条件
    private calcaknown(completeNeighbor?: number[]) {
        let hasCN = completeNeighbor && completeNeighbor.length > 0;
        if (!hasCN) return null;

        let rawSize = Math.floor(Grid.gridSize / Grid.tileSize);
        let cSize = rawSize + 2;
        let knownArr: any[] = [];
        completeNeighbor?.forEach((val, i) => {
            let offsetX = 0;
            let offsetY = 0;
            let selfPos = this.getGridPosition();
            let arr: any[] = [];
            let key: string;
            let map = Grid.posDataMap;
            let _d: [string, number][];
            switch (val) {
                case 0:
                    offsetY++;
                    key = `${selfPos.x + offsetX}_${selfPos.y + offsetY}`;
                    _d = map.get(key) as any;
                    if (_d) {
                        let _y = 0;
                        let vY = rawSize - 1;
                        for (let i = 0; i < rawSize; i++) {
                            let vX = i;
                            let val = _d[vY * rawSize + vX];
                            arr.push({ x: i + 1, y: _y, tiles: [[val[0], val[1]]] });
                        }
                    }
                    break;
                case 1:
                    offsetX++;
                    key = `${selfPos.x + offsetX}_${selfPos.y + offsetY}`;
                    _d = map.get(key) as any;
                    if (_d) {
                        let _x = cSize - 1;
                        let vX = 0;
                        for (let i = 0; i < rawSize; i++) {
                            let vY = i;
                            let val = _d[vY * rawSize + vX];
                            arr.push({ x: _x, y: i + 1, tiles: [[val[0], val[1]]] });
                        }
                    }
                    break;
                case 2:
                    offsetY--;
                    key = `${selfPos.x + offsetX}_${selfPos.y + offsetY}`;
                    _d = map.get(key) as any;
                    if (_d) {
                        let _y = cSize - 1;
                        let vY = 0;
                        for (let i = 0; i < rawSize; i++) {
                            let vX = i;
                            let val = _d[vY * rawSize + vX];
                            arr.push({ x: i + 1, y: _y, tiles: [[val[0], val[1]]] });
                        }
                    }
                    break;
                case 3:
                    offsetX--;
                    key = `${selfPos.x + offsetX}_${selfPos.y + offsetY}`;
                    _d = map.get(key) as any;
                    if (_d) {
                        let _x = 0;
                        let vX = rawSize - 1;
                        for (let i = 0; i < rawSize; i++) {
                            let vY = i;
                            let val = _d[vY * rawSize + vX];
                            arr.push({ x: _x, y: i + 1, tiles: [[val[0], val[1]]] });
                        }
                    }

                    break;
            }
            knownArr = knownArr.concat(arr);
        });

        // //test
        // this.wfc?.setKnown([
        //     { x: 0, y: 0, tiles: [["wire", 1]] },
        //     { x: 1, y: 0, tiles: [["wire", 1]] },
        //     { x: 2, y: 0, tiles: [["wire", 1]] },
        //     { x: 3, y: 0, tiles: [["wire", 1]] },
        // ]);
        // this.wfc?.setKnown(knownArr);
        return knownArr;
    }

    //裁剪数据
    private cutData(_d: any[], size: number) {
        //裁剪数据
        let temp = _d.concat();
        _d.length = 0;
        temp.forEach((val, i) => {
            let x = i % size;
            let y = Math.floor((i) / size);
            if (0 < x && x < size - 1 && 0 < y && y < size - 1) {
                _d.push(val);
            }
        });
    }

}
