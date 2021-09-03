namespace WFC {
    type ModelMap = { [resId: number]: Model };
    type connectTestMap = { [connectId: number]: number };
    type edgeConnectIDMap = { [edge: string]: number };
    type slotCapture = { models: number[], isCollapse: boolean, solveID: number };

    /**
     * vector2 
     * coordinate of the use 2d system
     * ---------->  x
     * |
     * |
     * v
     * y
     */
    class Vec2 {
        public x: number;
        public y: number;
        constructor(x: number = 0, y: number = 0) {
            this.x = x;
            this.y = y;
        }
    }

    interface IPool<T> {
        new_one(): T;
        delete_one(obj: T);
    }

    const tagInpool = "_IsInPool_";

    class SlotPool implements IPool<Slot>{
        private static _ins = new SlotPool();
        static get instance() { return this._ins; }

        private nodelist: Slot[] = [];
        public new_one(): Slot {
            let result = this.nodelist.pop();
            if (!result) {
                result = new Slot();
            }

            result["tagInpool"] = false;
            return result;
        }
        public delete_one(obj: Slot) {
            if (!obj || obj[tagInpool]) { return; }
            obj[tagInpool] = true;
            obj.models = [];
            this.nodelist.push(obj);
        }
    }

    class ModelPool implements IPool<Model>{
        private static _ins = new ModelPool();
        static get instance() { return this._ins; }

        private nodelist: Model[] = [];
        public new_one(): Model {
            let result = this.nodelist.pop();
            if (!result) {
                result = new Model();
            }

            result["tagInpool"] = false;
            return result;
        }
        public delete_one(obj: Model) {
            if (!obj || obj[tagInpool]) { return; }
            obj[tagInpool] = true;
            obj.edges = [];
            this.nodelist.push(obj);
        }
    }

    /** Slot 插槽 */
    class Slot {
        /** Globally Unique Identifier Of this object*/
        public get guid() { return this._guid; }

        /** model id Map */
        public modelsMap: ModelMap;
        /** Slot postion of world */
        public position: Vec2 = new Vec2();
        /** is collapsed value be true */
        public isCollapse: boolean = false;
        /** model's of current superposition */
        public models: number[] = [];
        /** slots of neighbor  */
        public neighbors: Slot[] = [];
        /** count map of neighbors modle*/
        public neighborsMCountMap = {};

        constructor() {
            this._guid = Slot._guidCount++;
        }

        /** guid counter */
        private static _guidCount = 0;
        /** guid of this object */
        private _guid: number;
        /** id of solve process */
        private solveID: number = -1;
        /** mark dirty of models */
        private isDirtyModels: boolean = false;
        /** can pass left connectId of models edges */
        private edgeLeftTestMapArr: connectTestMap[];
        /** can pass right connectId of models edges */
        private edgeRightTestMapArr: connectTestMap[];
        /** entropy of now */
        private _entropy: number;

        /** get entropy of now */
        public getEntropy(): number {
            if (!this.isDirtyModels) {
                return this._entropy;
            }
            this.refreshOfModles();
            return this._entropy;
        }

        /** collapse of this slot models */
        public collapseNow(): boolean {
            //检查一下 自己，因为为了提高性能，每次震荡不是彻底的。
            let pass = this.smallerSelf();
            if (!pass) { return false; }

            //开始坍缩
            this.isCollapse = true;
            if (this.models.length < 2) { return true; }
            let _map = this.modelsMap;
            let totalP: number = 0;
            let ms = this.models;
            ms.forEach((v) => {
                let _m = _map[v];
                if (_m) { totalP += _m.probability; }
            });

            let selected: number = ms[0];
            let roll = Math.random() * totalP;
            let p = 0;
            for (let i = 0, len = ms.length; i < len; i++) {
                let mId = ms[i];
                let _m = _map[mId];
                if (!_m) { continue; }
                p += _m.probability;
                if (p >= roll) {
                    selected = mId;
                    break;
                }
            }

            //final 
            ms.length = 0;
            ms.push(selected);
            this.isDirtyModels = true;
            return true;
        }

        /**
         * transmit to neighbors
         * @param solveCount  current solveCount
         * @returns is success of transmit
         */
        public transmit(solveCount: number): boolean {
            let arr: Slot[] = [this];
            let filterMap = {};
            while (arr.length > 0) {
                let temp = [];
                for (let i = 0, len = arr.length; i < len; i++) {
                    let v = arr[i];
                    let success = this.smallerAround(v, solveCount, temp, filterMap);
                    if (!success) { return false; }
                }
                arr = temp;
            }
            return true;
        }

        public refresh() {
            this.edgeLeftTestMapArr = [{}, {}, {}, {}];
            this.edgeRightTestMapArr = [{}, {}, {}, {}];
            this.neighborsMCountMap = {};
            this.isCollapse = false;
            this.isDirtyModels = true;
            this.solveID = -1;
            this.refreshOfModles();
        }

        /** get state capture of this slot  */
        public capture(_cap?: slotCapture): slotCapture {
            let result: slotCapture = _cap;
            if (!result) { result = {} as any; }

            result.isCollapse = this.isCollapse;
            result.solveID = this.solveID;

            // result.models = this.models.concat();

            if (!result.models) { result.models = []; }
            if (result.models.length > this.models.length) { result.models.length = 0; }

            for (let i = 0, len = this.models.length; i < len; i++) {
                result.models[i] = this.models[i];
            }

            return result;
        }

        /**
         * apply capture state to this slot
         * @param _cap capture data
         */
        public applyCapture(_cap: slotCapture) {
            if (!_cap) { return; }
            this.neighborsMCountMap = {};
            _cap.models.forEach((v, i) => {
                this.models[i] = v;
            });
            this.isCollapse = _cap.isCollapse;
            this.solveID = _cap.solveID;
            this.isDirtyModels = true;
        }

        /** smaller neighbors  */
        private smallerAround(slot: Slot, solveCount: number, out: Slot[], filterMap: { [id: number]: boolean }) {
            slot.solveID = solveCount;
            let nbs = slot.neighbors;
            for (let i = 0, len = nbs.length; i < len; i++) {
                let _n = nbs[i];
                if (filterMap[_n._guid] || _n.solveID == solveCount || _n.isCollapse) { continue; }//清理 已经坍缩的邻居
                filterMap[_n._guid] = true;
                //do smaller 
                let pass = _n.smallerSelf();
                if (!pass) { return false; }

                if (_n.isDirtyModels) {
                    //is slot dirty ,so need transmit to next.
                    out.push(_n);
                }

            }
            return true;
        }

        /** smaller self */
        private smallerSelf(): boolean {
            let arr: Slot[] = this.neighbors;
            let _map = this.neighborsMCountMap;
            for (let i = 0, len = arr.length; i < len; i++) {
                let _n = arr[i];
                let pass: boolean;
                //test-------
                // Slot.testsmallerCount++;
                let key = _n.guid;
                let lastNCount = _map[key];
                let currNCount = _n.models.length;
                _map[key] = currNCount;
                //smaller when dirty
                pass = currNCount == lastNCount ? this.models.length > 0 : pass = _n.smaller(this);
                //test-------
                // pass = _n.smaller(this);
                if (!pass) { return false; }
            }
            return true;
        }

        private refreshOfModles() {
            this.isDirtyModels = false;
            //run
            let _e = 0;
            let _map = this.modelsMap;
            let mLen = this.models.length;
            let lArr = this.edgeLeftTestMapArr;
            let rArr = this.edgeRightTestMapArr;
            for (let i = 0; i < mLen; i++) {
                let _m = _map[this.models[i]];
                //calculate ConnectTest
                for (let j = 0; j < 4; j++) {
                    let _edge = _m.edges[j];
                    let lCID = _edge.connectIdLeft;
                    if (lCID && lCID != -1) {
                        lArr[j][lCID] = mLen;
                    }

                    let rCID = _edge.connectIdRight;
                    if (rCID && rCID != -1) {
                        rArr[j][rCID] = mLen;
                    }
                }

                //entropy
                _e += _m.entropy;
            }
            // _e *= -1;
            this._entropy = _e;
        }

        private getCloseEdgeIdx(neighbor: Slot): number {
            let result: number;
            let _nPos = neighbor.position;
            let _selfPos = this.position;
            if (_nPos.y < _selfPos.y) {//上
                result = 1;
                // result = 0;
            } else if (_nPos.y > _selfPos.y) {//下
                result = 3;
                // result = 2;
            } else if (_nPos.x < _selfPos.x) {//左
                result = 2;
                // result = 3;
            } else if (_nPos.x > _selfPos.x) {//右
                result = 0;
                // result = 1;
            }
            return result;
        }
        /** smaller neighbor models by this*/
        private smaller(neighbor: Slot): boolean {
            let result: boolean;
            let _map = this.modelsMap;
            let mLen = this.models.length;
            let oldModelsLen = neighbor.models.length;
            //找到邻接边
            let selfEdgeIdx: number = this.getCloseEdgeIdx(neighbor);
            let neighborEdgeIdx: number = neighbor.getCloseEdgeIdx(this);
            let LeftTestMap = this.getConnectTestMap(selfEdgeIdx, true);
            let rightTestMap = this.getConnectTestMap(selfEdgeIdx, false);
            //筛选有效model
            let activeModel = [];
            neighbor.models.forEach((v) => {
                let _m = _map[v];
                let _eInfo = _m.edges[neighborEdgeIdx];
                if (LeftTestMap[_eInfo.connectIdRight] == mLen || rightTestMap[_eInfo.connectIdLeft] == mLen) {
                    activeModel.push(v);
                }
            });
            neighbor.models = activeModel;

            //final 
            if (!neighbor.isDirtyModels) {
                let newModelsLen = neighbor.models.length;
                neighbor.isDirtyModels = oldModelsLen != newModelsLen;
            }
            if (neighbor.models.length == 1) {
                neighbor.isCollapse = true;
            }
            result = neighbor.models.length > 0;
            return result;
        }

        private getConnectTestMap(edgeIdx: number, isLeft: boolean): connectTestMap {
            if (this.isDirtyModels) {
                this.refreshOfModles();
            }
            return isLeft ? this.edgeLeftTestMapArr[edgeIdx] : this.edgeRightTestMapArr[edgeIdx];
        }

    }

    /** Models that can be displayed */
    class Model {
        /** probability of show */
        public probability: number;
        /** entropy */
        public entropy: number;
        /** four edge of square */
        public edges: EdgeInfo[];
        /** resource ID of special object*/
        public resId: number;
        /** rotateType of image rotate (0=0 , 1=90 ,2=180 ,3=270) */
        public rotateType: number;
    }

    /** edge of infomation descript */
    // tslint:disable-next-line: max-classes-per-file
    class EdgeInfo {
        /**direction of the rotate (0=right , 1=top ,2=left ,3=bottom) */
        public dirOfRotate: number;
        /** flag to check between edge can connect of left */
        public connectIdLeft: number;
        /** flag to check between edge can connect of right */
        public connectIdRight: number;

        public constructor(connectIdL: number = -1, connectIdR: number = -1) {
            this.connectIdLeft = connectIdL;
            this.connectIdRight = connectIdR;
        }
    }

    /** struct type of init  */
    // export type _wfc2dData = { resName: string, weight: number, edges: { t: number, r: number, b: number, l: number } };
    export type wfc2dData = { tiles: { [rawName: string]: [string, number, number[]] }, connectIdL: edgeConnectIDMap, connectIdR: edgeConnectIDMap };

    /** wave function collapse of 2d test*/
    // tslint:disable-next-line: max-classes-per-file
    export class WFC2D {
        constructor(_dataArr: wfc2dData) {
            let connectIdL = _dataArr.connectIdL;
            let connectIdR = _dataArr.connectIdR;

            let totalWeight = 0;
            let idCount = 0;
            let idList: number[] = this.idList = [];
            let setModelFun = (imgName: string, rot: number, weight: number) => {
                let resId = idCount++;
                this.modelIDResInfoMap[resId] = [imgName, rot];
                idList.push(resId);
                let _m = ModelPool.instance.new_one();
                _m.rotateType = rot;
                _m.probability = weight;
                _m.resId = resId;
                this.modelMap[resId] = _m;
                let arr = this.tileNameIDMap[imgName];
                if (!arr) {
                    arr = this.tileNameIDMap[imgName] = [];
                }
                arr[rot] = resId;
                totalWeight += weight;
                //edgeInfo
                let r = `${imgName}_${(rot + 0) % 4}`;
                let t = `${imgName}_${(rot + 1) % 4}`;
                let l = `${imgName}_${(rot + 2) % 4}`;
                let b = `${imgName}_${(rot + 3) % 4}`;
                _m.edges = [
                    new EdgeInfo(connectIdL[r], connectIdR[r]),
                    new EdgeInfo(connectIdL[t], connectIdR[t]),
                    new EdgeInfo(connectIdL[l], connectIdR[l]),
                    new EdgeInfo(connectIdL[b], connectIdR[b]),
                ];
            };

            //modes
            for (let k in _dataArr.tiles) {
                let imgName = k;
                let suffix: string;
                let weight: number;
                let rotates: number[];
                [suffix, weight, rotates] = _dataArr.tiles[k];
                setModelFun(imgName, 0, weight);
                if (rotates) {
                    rotates.forEach((v) => {
                        setModelFun(imgName, v, weight);
                    });
                }
            }

            //calculate probability & Entropy
            for (let key in this.modelMap) {
                let _m = this.modelMap[key];
                _m.probability = _m.probability / totalWeight;
                let p = _m.probability;
                //calculate Entropy
                //i...n
                //H = -sum(pi * Log2pi + .... pn * Log2pn);
                _m.entropy = -p * Math.log2(p);
            }
        }
        /** id list of models */
        private idList: number[];
        //current model Map
        private modelMap: ModelMap = {};
        //current slot all list
        private allSlots: Slot[] = [];
        private activeSlotMap: Map<number, Slot> = new Map();
        private width: number;
        private height: number;
        /** count of solve process */
        private solveCount: number;
        private modelIDResInfoMap: { [modelId: number]: [string, number] } = {};
        /** queue of backoff data */
        private backoffCaptureQueue: slotCapture[][] = [];
        /** initial state capture of slot */
        private initialCapture: slotCapture[];
        /** current count of backOff */
        private backOffCount: number;
        /** max lentgh of capture Slot data Queue*/
        private capQueueMaxLen: number;
        /** max Count of backOff action */
        private backOffMaxNum: number;
        /** percent of tiles total , sampling rate of capture slot data (xx%)*/
        private capCycleRate: number;
        /** cycle of capture slot data  */
        private capCycle: number;
        /** counter of capture */
        private capSlotCount: number;
        /** collapse is complete */
        private isComplete: boolean;
        /** count of current captrue queue */
        private currCapQueCount: number;
        /** state of Collapsing */
        private _isCollapsing: boolean = false;
        /** start time of collapse */
        private startTime: number;
        /** state of Known data */
        private KnownState: number[][][];
        /** map of tileName - resID */
        private tileNameIDMap: { [tileName: string]: number[] } = {};

        /**
         * 是否正在 坍缩 
         * state of Collapsing
         */
        public get isCollapseing(){
            return this._isCollapsing;
        }

        /**
         * 设置已知条件，明确的设定相应坐标为具体的瓦片。  set Known condition of which Tiles in this position. 
         * @param stateData 状态信息 {坐标x, 坐标y, {具体的瓦片, 旋转类型(0=0 , 1=90 ,2=180 ,3=270)}[]}。
         */
        public setKnown(stateData: { x: number, y: number, tiles: [string, number][] }[]) {
            if (!stateData || stateData.length < 1) return;
            let arrX: number[][][] = [];
            for (let i = 0, len = stateData.length; i < len; i++) {
                let s = stateData[i];
                let tiles = s.tiles;
                if (!tiles || tiles.length < 1) continue;
                for (let j = 0, len1 = tiles.length; j < len1; j++) {
                    let _tName = tiles[j][0];
                    let _rotType = tiles[j][1];
                    if (_tName == null || _rotType == null) continue;
                    let rotArr = this.tileNameIDMap[_tName];
                    let resID = rotArr[_rotType];
                    if (resID == null) continue;
                    let arrY = arrX[s.x];
                    if (!arrY) {
                        arrY = arrX[s.x] = [];
                    }
                    let arrIDs = arrY[s.y];
                    if (!arrIDs) {
                        arrIDs = arrY[s.y] = [];
                    }

                    arrIDs.push(resID);
                }
            }
            if (arrX.length < 1) arrX = null;
            this.KnownState = arrX;
        }

        /**
         * 清理 设定的已知条件 。clear all of setKnown
         */
        public clearKnown() {
            this.KnownState = null;
        }

        /**
         * （同步版） 执行 坍塌,生成地图数据
         * (sync ver) calculate once collapse
         * @param width             地图宽度 width of map.
         * @param height            地图高度 height of map.
         * @param backOffMaxNum     遇到失败时，返回到前状态重试的最大次数 Max times of back off last state on collapse error.
         * @param capQueueMaxLen    缓存前状态队列的最大长度 queue max length of capture last state.
         * @param capRate           缓存率0-1 范围，决定间隔多少次坍塌周期缓存一次 rate of captrue (range 0 - 1), set cycle of capture state.   
         * @returns  
         */
        public collapseSync(width: number, height: number, backOffMaxNum?: number, capQueueMaxLen?: number, capRate?: number): [string, number][] {
            // if (this.isCollapsing) { return; }
            this.startTime = Date.now();
            //init
            this.setCollapseInit(width, height, backOffMaxNum, capQueueMaxLen, capRate);

            //to do main process
            this.calculateSync();

            //抛出结果
            return this.resultCollapse();
        }

        /**
         * 执行 坍塌,生成地图数据
         * calculate once collapse
         * @param width             地图宽度 width of map.
         * @param height            地图高度 height of map.
         * @param backOffMaxNum     遇到失败时，返回到前状态重试的最大次数 Max times of back off last state on collapse error.
         * @param capQueueMaxLen    缓存前状态队列的最大长度 queue max length of capture last state.
         * @param capRate           缓存率0-1 范围，决定间隔多少次坍塌周期缓存一次 rate of captrue (range 0 - 1), set cycle of capture state.   
         * @param frameMaxTime      每帧最大计算耗时(单位 秒) max time of spend on one frame. (calculation be split to more frame)
         * @returns  
         */
        // tslint:disable-next-line: max-line-length
        public collapse(width: number, height: number, backOffMaxNum?: number, capQueueMaxLen?: number, capRate?: number, frameMaxTime?: number): Promise<[string, number][]> {
            return new Promise((resolve, reject) => {
                // if (this.isCollapsing) {
                //     reject();
                //     return;
                // }
                this.startTime = Date.now();
                // tslint:disable-next-line: no-parameter-reassignment
                if (frameMaxTime == null) { frameMaxTime = 0.333; }

                //init
                this.setCollapseInit(width, height, backOffMaxNum, capQueueMaxLen, capRate);

                //to do main process
                this.calculate()
                    .then(() => {
                        //抛出结果
                        resolve(this.resultCollapse());
                    })
                    .catch(reject);
            });
        }

        /** set init of Collapse*/
        private setCollapseInit(width: number, height: number, backOffMaxNum?: number, capQueueMaxLen?: number, capRate?: number) {
            // tslint:disable-next-line: no-parameter-reassignment
            if (backOffMaxNum == null) { backOffMaxNum = 50; }
            // tslint:disable-next-line: no-parameter-reassignment
            if (capQueueMaxLen == null) { capQueueMaxLen = 3; }
            // tslint:disable-next-line: no-parameter-reassignment
            if (capRate == null) { capRate = 0.02; }
            this.isComplete = false;
            this.backOffMaxNum = backOffMaxNum;
            this.capQueueMaxLen = capQueueMaxLen;
            this.capCycleRate = Math.min(Math.max(capRate, 0), 1);
            this.solveCount = 0;
            this.backOffCount = 0;
            this.capSlotCount = 0;
            this.currCapQueCount = 0;
            this.allSlots.length = 0;
            this.backoffCaptureQueue.forEach((v) => {
                v.length = 0;
            });
            this.backoffCaptureQueue.length = 0;
            this.activeSlotMap.clear();
            this.width = width;
            this.height = height;
            this.setData(width, height);
        }

        /** get collapse result data*/
        private resultCollapse() {
            let result: [string, number][] = [];
            let arr = this.allSlots;
            let _map = this.modelIDResInfoMap;
            for (let i = 0, len = arr.length; i < len; i++) {
                let _s = arr[i];
                _s.modelsMap = null;
                let temp = _map[_s.models[0]];
                result.push(temp);
                SlotPool.instance.delete_one(_s);
            }
            this.allSlots.length = 0;
            // tslint:disable-next-line: max-line-length
            console.log(`collapse complete! total time : ${Date.now() - this.startTime}, solveCount : ${this.solveCount} , backOffCount : ${this.backOffCount}`);
            return result;
        }

        /** set data before collapse */
        private setData(width: number, height: number) {
            let idList = this.idList;
            let states = this.initialCapture = [];
            let kSta = this.KnownState;
            //生成slots
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let _s: Slot = SlotPool.instance.new_one();
                    _s.position.x = x;
                    _s.position.y = y;
                    if (!kSta || !kSta[x] || kSta[x][y] == null) {
                        _s.models = idList.concat();    //clone this array
                    } else {
                        _s.models = kSta[x][y];
                        _s.isCollapse = true;
                    }
                    _s.modelsMap = this.modelMap;
                    _s.neighbors = [];
                    _s.refresh();
                    let curr = this.allSlots.push(_s);
                    //initial slot cap
                    states[curr - 1] = _s.capture();
                    if (_s.models.length > 1) {
                        this.activeSlotMap.set(_s.guid, _s);
                    }
                }
            }

            //设置 所有 slot 的邻居
            this.allSlots.forEach((v, i) => {
                let pos = v.position;
                for (let k = 0; k < 4; k++) {
                    let _n = this.getNeighbor(pos, k);
                    if (_n) {
                        v.neighbors.push(_n);
                    }
                }
            });

            //rate cap set
            this.capCycle = Math.floor(this.width * this.height * this.capCycleRate);
        }

        private getNeighbor(pos: Vec2, edgeIdx: number): Slot {
            let result: Slot;
            let tarPosX: number = pos.x;
            let tarPosY: number = pos.y;
            // tslint:disable-next-line: switch-default
            switch (edgeIdx) {
                case 0: tarPosY--; break;   //上
                case 1: tarPosX++; break;   //右
                case 2: tarPosY++; break;   //下
                case 3: tarPosX--;          //左
            }
            //是否超出范围
            if (tarPosX < 0 || tarPosX > this.width || tarPosY < 0 || tarPosY > this.height) {
                return null;
            }
            // result = this.allSlots[tarPosY - 0][tarPosX - 0];
            result = this.allSlots[tarPosY * this.width + tarPosX];
            return result;
        }

        private calculate() {
            return new Promise((resolve, reject) => {
                let time = 33.3;
                this._isCollapsing = true;
                let fun = () => {
                    let curr = Date.now();
                    try{
                        while (!this.isComplete) {
                            this._doCollapse();
                            if (Date.now() - curr > time) {
                                setTimeout(() => {
                                    fun();
                                }, 0);
                                return;
                            }
                        }
                    }catch(err){
                        reject(err);
                        return;
                    }
                    
                    //complete
                    this._isCollapsing = false;
                    resolve(null);
                };
                fun();
            });
        }

        private calculateSync() {
            while (!this.isComplete) {
                this._doCollapse();
            }
        }

        private _doCollapse() {
            //get one of minimum entropy 
            let _select: Slot;
            let isFirst = this.activeSlotMap.size == this.allSlots.length;
            if (!isFirst) {
                let _mini = Number.POSITIVE_INFINITY;
                let vs = this.activeSlotMap.values();
                let temp: IteratorResult<Slot, any>;
                while (true) {
                    temp = vs.next();
                    if (temp.done) { break; }
                    let t = temp.value;
                    let _e = t.getEntropy();
                    if (_e < _mini) {
                        _select = t;
                        _mini = _e;
                    }
                }
            } else {
                let rIdx = Math.floor(Math.random() * this.allSlots.length);
                _select = this.allSlots[rIdx];
            }

            if (!_select) {
                this.isComplete = true;
                return;
            }

            //坍缩 成具体model
            let success = _select.collapseNow();
            //transmit to around
            if (success) {
                this.activeSlotMap.delete(_select.guid);
                success = _select.transmit(this.solveCount);
            }
            //check
            if (!success) {
                //err backoff
                this._backOff();
                return;
            }

            //capture slot state
            this.captureAllSlot();

            //solve once add
            this.solveCount++;
            //success, to next
        }

        private captureAllSlot() {
            this.capSlotCount--;
            // skip to reduce expend
            if (this.capSlotCount > 0) {
                return;
            }
            this.capSlotCount = this.capCycle;
            //do cap
            let queue = this.backoffCaptureQueue;
            let states = this.currCapQueCount >= this.capQueueMaxLen ? queue.shift() : [];
            if (!states) { states = []; }
            this.allSlots.forEach((v, i) => {
                states[i] = v.capture(states[i]);
            });

            queue.push(states);
            this.currCapQueCount = this.currCapQueCount >= this.capQueueMaxLen ? this.capQueueMaxLen : ++this.currCapQueCount;
        }

        //backOff to last state
        private _backOff() {
            this.backOffCount++;
            if (this.backOffCount > this.backOffMaxNum) {
                let msg = `backOff over the limit Max Count : ${this.backOffMaxNum} , you need raise backOffMaxNum or capQueueMaxLen.`;
                //alert(msg);
                throw new Error(msg);
            }

            let states = this.backoffCaptureQueue.pop();
            if (!states) { states = this.initialCapture; }
            this.allSlots.forEach((v, i) => {
                v.applyCapture(states[i]);
                if (!v.isCollapse) {
                    this.activeSlotMap.set(v.guid, v);
                } else {
                    this.activeSlotMap.delete(v.guid);
                }
            });
            this.currCapQueCount--;
            if (this.currCapQueCount < 0) { this.currCapQueCount = 0; }
        }
    }
}