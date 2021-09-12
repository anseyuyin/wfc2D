
import { _decorator, Component, Node, Vec2, Vec3, Sprite, resources, SpriteFrame, UITransform, math, Layers, Mesh } from 'cc';
import { Eventer } from './eventer';
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
    private static _poolArr: Grid[] = [];
    private static IN_POOL_TAG = "__inPoolTag__";
    private static posDataMap: Map<string, [string, number][]> = new Map();
    private static collapseingMap: Map<string, boolean> = new Map();
    private static _wfcPool: WFC.WFC2D[] = [];

    /** 坍缩完成 */
    public static readonly ON_COLLAPSED = "ON_COLLAPSED";
    /** 瓦块像素尺寸 */
    public static tileSize: number = 50;
    /** wfc 资源数据 */
    public static wfcDataImg: wfcDataImg;
    /** 事件管理对象 */
    public static eventer: Eventer = new Eventer();
    /**  */
    public static horn: [string, number][];

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

    //--------------------------------------------------
    private _size: number = 100;
    private _GridPos: Vec2 = new Vec2();
    private _sp: Sprite | null = null;
    private _wfc: WFC.WFC2D | null = null;
    private _wfcSpMap: Map<string, Sprite> = new Map();
    private _state: GridState = GridState.none;

    private get wfc() {
        if (!this._wfc && Grid.wfcDataImg) {
            // this._wfc = new WFC.WFC2D(Grid.wfcDataImg.config);
            this._wfc = Grid.getWFC();
        }
        return this._wfc;
    }

    /** 格子的尺寸 */
    public get size() { return this._size; }
    public set size(val: number) { this._size = val; }
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
        let len = Math.floor(this._size / tsize);
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
     * @param completeNeighbor 已经完成的邻居(0 上,1 下,2 左,3 右)
     */
    show(completeNeighbor?: number[]) {
        let key = this.getPosKey();
        let data = Grid.posDataMap.get(key);
        if (data) {
            this.refrashDisplay();
        } else {
            //生成数据
            Grid.collapseingMap.set(key, true);
            let size = Math.floor(this._size / Grid.tileSize);
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
    }

    setGridPosition(pos: Vec2) {
        let _pos = Grid.helpV3;
        _pos.set(pos.x, pos.y, 0);
        _pos = _pos.multiplyScalar(this._size);
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

        let size = Math.floor(this._size / Grid.tileSize);
        for (let i = 0, len = data.length; i < len; i++) {
            let x = i % size;
            let y = Math.floor((len - 1 - i) / size);
            let key = `${x}_${y}`;
            let val = _map.get(key) as Sprite;
            if (!val) continue;
            val.node.active = true;
            val.spriteFrame = Grid.wfcDataImg.imgs[data[i][0]] as any;
            val.node.eulerAngles;
            let euler = Grid.helpV3;
            Vec3.set(euler, 0, 0, data[i][1] * -90);
            val.node.setRotationFromEuler(euler);
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
        let rawSize = Math.floor(this._size / Grid.tileSize);
        let max: number;
        if (cnb && cnb.length > 0) {
            max = (rawSize + 2) - 2;
        } else {
            max = rawSize - 1;
        }
        arr.push({ x: 0, y: 0, tiles: Grid.horn });
        arr.push({ x: max, y: 0, tiles: Grid.horn });
        arr.push({ x: max, y: max, tiles: Grid.horn });
        arr.push({ x: 0, y: max, tiles: Grid.horn });
        return arr;
    }

    //计算 已知条件
    private calcaknown(completeNeighbor?: number[]) {
        let hasCN = completeNeighbor && completeNeighbor.length > 0;
        if (!hasCN) return null;

        let rawSize = Math.floor(this._size / Grid.tileSize);
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
