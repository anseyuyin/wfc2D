
import { _decorator, Component, Node, Vec2, instantiate, math } from 'cc';
import { AppMain } from './appMain';
import { baseEvent, EventMgr } from './eventMgr';
import { Grid } from './grid';
import { FloorType, Item } from './item';
const { ccclass, property } = _decorator;

type itemDate = { rate: number, item: Item };

@ccclass('ItemMap')
export class ItemMap extends Component {
    private static readonly help_v2 = new Vec2();
    private static readonly ItemIdxTag = "__itemIdxTag__";
    private static readonly IsInPool = "__IsInPool__";
    private _poolMap: { [idx: number]: Item[] } = {};
    private _datas: itemDate[] = [];
    private _tileIdxMap: { [pos: string]: number } = {};
    private _tileStateMap: { [pos: string]: number[] } = {}; //单数组（节点遍历） 记录显示状态。
    private _waitIdxs: Map<FloorType, number[]> = new Map();
    private _helpArr: number[] = [];
    private _FloorTypeIdx: Map<FloorType, number[]> = new Map();
    private _FloorTypeProbs: Map<FloorType, number> = new Map();
    private _FloorTypeCount = 0;
    private _tileRectMap: { [pos: string]: string } = {};
    private _tileNodeMap: { [pos: string]: Item } = {};
    private _gridTilesMap: { [gPos: string]: string[] } = {};


    @property({ type: Node })
    itemRes: Node | null = null;

    private newOne(idx: number): Item {
        let arr = this._poolMap[idx];
        if (!arr) {
            arr = this._poolMap[idx] = [];
        }
        let result: Item = arr.pop() as Item;

        if (!result) {
            let n = instantiate(this._datas[idx].item.node);
            result = n.getComponent<Item>(Item) as Item;
        }
        delete (result as any)[ItemMap.IsInPool];
        (result as any)[ItemMap.ItemIdxTag] = idx;
        return result;
    }

    private deleteOne(_item: Item) {
        if (!_item || (_item as any)[ItemMap.IsInPool]) return;
        let idx: number = (_item as any)[ItemMap.ItemIdxTag];
        if (idx == null) return;
        (_item as any)[ItemMap.IsInPool] = true;
        let arr = this._poolMap[idx];
        if (arr) {
            arr = this._poolMap[idx] = [];
        }

        arr.push(_item);
    }

    start() {
        this._FloorTypeCount = Object.keys(FloorType).length;
        //items 
        if (this.itemRes) {
            let allWegiht: number = 0;
            let items: Item[] = [];
            this.itemRes.children.forEach((val) => {
                let _item = val.getComponent<Item>(Item);
                if (_item && _item.node.active) {
                    items.push(_item);
                    allWegiht += _item.weight;
                }
            });
            let len = items.length;

            for (let i = 0; i < len; i++) {
                let item = items[i];
                let rate = item.weight / allWegiht;
                this._datas.push({ rate, item });

                let ft = item.floorType;
                //_FloorTypeIdx
                let tArr = this._FloorTypeIdx.get(ft);
                if (tArr == null) {
                    tArr = [];
                    this._FloorTypeIdx.set(ft, tArr);
                    this._waitIdxs.set(ft, []);
                    this._FloorTypeProbs.set(ft, 0);
                }
                this._FloorTypeProbs.set(ft, this._FloorTypeProbs.get(ft) as number + rate);
                tArr.push(i);
            }
        }

        //事件监听
        EventMgr.addListener("onTile", this.onTile, this);
        EventMgr.addListener("offTile", this.onOffTile, this);

        // //tt
        // ((Grid as any)["_r"] as Node) = this.node.parent as Node;
        // setTimeout(() => {
        //     //    var arr  = Grid.ttt(new Vec2());
        //     let pos = new Vec2(0, 0);
        //     let idx = 8;
        //     let v = this.judgePlace(idx, new Vec2(0, 0));
        //     console.log(`judgePlace : ${v}`);
        //     //
        //     if(!v) return;
        //     let _item = this.newOne(idx);
        //     let _tNode = _item.node;
        //     this.node.addChild(_tNode);
        //     let _pos = _tNode.getPosition();
        //     _pos.x = pos.x; _pos.y = pos.y;
        //     _tNode.setPosition(_pos);
        // }, 500);
    }

    private onOffTile(ev: baseEvent<string>) {
        let arr = this._gridTilesMap[ev.data];
        if (!arr) return;
        delete this._gridTilesMap[ev.data];
        arr.forEach((val) => {
            let _item = this._tileNodeMap[val];
            if (_item) {
                if (_item.node.parent) {
                    _item.node.parent.removeChild(_item.node);
                }
                this.deleteOne(_item); //入池
            }
            delete this._tileNodeMap[val];
        });

        arr.length = 0;
    }

    private onTile(ev: baseEvent<{ pos: Vec2; tType: number; gPos: string }>) {
        // let a = true;
        // if (a) return;
        // console.log(`onTile : ${ev.data.pos.toString()} , ${ev.data.tType}`);

        let tType = ev.data.tType;
        // if (tType != FloorType.grass) return;
        // if (tType != FloorType.beach) return;
        let x = ev.data.pos.x;
        let y = ev.data.pos.y;
        let gPos = ev.data.gPos;
        let posKey = `${x}_${y}`;
        if (this._tileNodeMap[posKey]) return;   //当前位置已经有node 直接退出
        //测试 草地都刷上 花
        let _idx: number = 0;

        //检查是否有缓存
        let _states: number[] = null as any;
        let mapIdx = this._tileIdxMap[posKey];
        if (mapIdx != null && !isNaN(mapIdx) && mapIdx != -1) {   //已经有数据
            _idx = mapIdx;
            _states = this._tileStateMap[posKey];
        } else if (mapIdx != undefined && isNaN(mapIdx) || mapIdx == -1) {
            return;     //刷过数据 空块
        } else {
            //检查是否要刷一个
            let pMap = AppMain.ItmeProbabilityMap;
            let p = pMap.get(tType);
            if (p == null || p < Math.random()) {
                //no 保存空块
                this._tileIdxMap[posKey] = -1;
                return;
            }

            //yes 刷一个
            let temp = this._helpArr;
            temp.length = 0;
            let canPlace = false;
            // let maxTimes = this.getWaitCount(tType) + 3;    //设定上限次数
            // while (!canPlace && maxTimes > 0) {
            while (!canPlace) {
                // maxTimes--;
                //获取一个 要放置的 item
                _idx = this.getOneItemIdx(tType);
                // 判断尺寸是否合适
                canPlace = this.judgePlace(_idx, ev.data.pos);
                if (!canPlace) {
                    temp.push(_idx);
                }
            }

            if (temp.length != 0) {
                temp.forEach((val) => {
                    this.pushOneItemIdx(tType, val);
                });
            }
        }

        // _idx = 1;

        //刷itme
        let _item = this.newOne(_idx);
        let _tNode = _item.node;
        this.node.addChild(_tNode);
        let _pos = _tNode.getPosition();
        _pos.x = x; _pos.y = y;

        // _pos.x = x; _pos.y = y - 20;

        _tNode.setPosition(_pos);
        //记录 状态
        if (!_states) {
            let _i = this._datas[_idx];
            let _size = _i.item.size;
            //占用的 区域填空
            for (let _y = 0; _y < _size.y; _y++) {
                for (let _x = 0; _x < _size.x; _x++) {
                    let pk = `${x + Grid.tileSize * _x}_${y + Grid.tileSize * _y}`;
                    //清理覆盖其他rect
                    this.tryClearTile(pk);
                    this._tileIdxMap[pk] = NaN;
                    this._tileRectMap[pk] = posKey;
                }
            }
            _item.randomState();

            let _tSta: number[] = [];
            _item.getState(_tSta);
            this._tileStateMap[posKey] = _tSta;
        } else {
            _item.setState(_states);
        }

        //记录当前数据 到 map
        let arr = this._gridTilesMap[gPos];
        if (!arr) {
            arr = this._gridTilesMap[gPos] = [];
        }
        arr.push(posKey);
        this._tileNodeMap[posKey] = _item;
        this._tileIdxMap[posKey] = _idx;
    }

    private tryClearTile(poskey: string) {
        let pkey = this._tileRectMap[poskey];
        if (!pkey) return;
        let _item = this._tileNodeMap[pkey];
        if (!_item) return;
        //清理 _tileNodeMap
        delete this._tileNodeMap[pkey];
        //to pool
        if (_item.node.parent) {
            _item.node.parent.removeChild(_item.node);
        }
        this.deleteOne(_item);
        let x = _item.node.position.x;
        let y = _item.node.position.y;
        //clear rect
        let _size = _item.size;
        for (let _y = 0; _y < _size.y; _y++) {
            for (let _x = 0; _x < _size.x; _x++) {
                let pk = `${x + Grid.tileSize * _x}_${y + Grid.tileSize * _y}`;
                this._tileIdxMap[pk] = -1;
                delete this._tileRectMap[poskey];
            }
        }
    }

    private judgePlace(idx: number, pos: Vec2): boolean {
        let _i = this._datas[idx];
        let _s = _i.item.size;
        if (_s.x <= 1 && _s.y <= 1) return true;
        let tSize = Grid.tileSize;
        let sizeVal = _s.x * _s.y;
        //检查位置是否已经被占用,能否覆盖
        for (let y = 0; y < _s.y; y++) {
            for (let x = 0; x < _s.x; x++) {
                let posKey = `${pos.x + x * tSize}_${pos.y + y * tSize}`;
                let idx = this._tileIdxMap[posKey];
                if (idx == null || idx == -1) continue;
                if (isNaN(idx)) {
                    let pk = this._tileRectMap[posKey];
                    idx = this._tileIdxMap[pk];
                }

                if (isNaN(idx)) continue;
                //能否覆盖
                let _item = this._datas[idx];
                let _s = _item.item.size;
                if (sizeVal <= (_s.x * _s.y)) return false;
            }
        }

        //检查是否有合适的位置
        return Grid.judgeArea(pos, _s);
    }

    private getWaitCount(tType: FloorType) {
        let _waitArr = this._waitIdxs.get(tType) as number[];
        if (!_waitArr) return 0;
        return _waitArr.length;
    }

    private getOneItemIdx(tType: FloorType) {
        let _waitArr = this._waitIdxs.get(tType) as number[];
        let result = _waitArr.shift();
        if (result == null) {
            result = this.getRandomItemIdx(tType);
        }

        return result;
    }

    private pushOneItemIdx(tType: FloorType, _idx: number) {
        let _waitArr = this._waitIdxs.get(tType) as number[];
        _waitArr.push(_idx);
    }

    private getRandomItemIdx(tType: FloorType): number {
        let result: number = -1;
        if (!this._FloorTypeIdx.has(tType) || !this._FloorTypeProbs.has(tType)) return result;
        let arr = this._FloorTypeIdx.get(tType) as number[];
        let r = Math.random() * (this._FloorTypeProbs.get(tType) as number);
        // let len = this._datas.length;
        let len = arr.length;
        let curr = 0;
        for (let i = 0; i < len; i++) {
            let idx = arr[i];
            let _t = this._datas[idx];
            curr += _t.rate;
            if (curr >= r) {
                result = idx;
                break;
            }
        }
        return result;
    }
}

