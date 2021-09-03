var WFC;
(function (WFC) {
    /**
     * vector2
     * coordinate of the use 2d system
     * ---------->  x
     * |
     * |
     * v
     * y
     */
    var Vec2 = /** @class */ (function () {
        function Vec2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        return Vec2;
    }());
    var tagInpool = "_IsInPool_";
    var SlotPool = /** @class */ (function () {
        function SlotPool() {
            this.nodelist = [];
        }
        Object.defineProperty(SlotPool, "instance", {
            get: function () { return this._ins; },
            enumerable: false,
            configurable: true
        });
        SlotPool.prototype.new_one = function () {
            var result = this.nodelist.pop();
            if (!result) {
                result = new Slot();
            }
            result["tagInpool"] = false;
            return result;
        };
        SlotPool.prototype.delete_one = function (obj) {
            if (!obj || obj[tagInpool]) {
                return;
            }
            obj[tagInpool] = true;
            obj.models = [];
            this.nodelist.push(obj);
        };
        SlotPool._ins = new SlotPool();
        return SlotPool;
    }());
    var ModelPool = /** @class */ (function () {
        function ModelPool() {
            this.nodelist = [];
        }
        Object.defineProperty(ModelPool, "instance", {
            get: function () { return this._ins; },
            enumerable: false,
            configurable: true
        });
        ModelPool.prototype.new_one = function () {
            var result = this.nodelist.pop();
            if (!result) {
                result = new Model();
            }
            result["tagInpool"] = false;
            return result;
        };
        ModelPool.prototype.delete_one = function (obj) {
            if (!obj || obj[tagInpool]) {
                return;
            }
            obj[tagInpool] = true;
            obj.edges = [];
            this.nodelist.push(obj);
        };
        ModelPool._ins = new ModelPool();
        return ModelPool;
    }());
    /** Slot 插槽 */
    var Slot = /** @class */ (function () {
        function Slot() {
            /** Slot postion of world */
            this.position = new Vec2();
            /** is collapsed value be true */
            this.isCollapse = false;
            /** model's of current superposition */
            this.models = [];
            /** slots of neighbor  */
            this.neighbors = [];
            /** count map of neighbors modle*/
            this.neighborsMCountMap = {};
            /** id of solve process */
            this.solveID = -1;
            /** mark dirty of models */
            this.isDirtyModels = false;
            this._guid = Slot._guidCount++;
        }
        Object.defineProperty(Slot.prototype, "guid", {
            /** Globally Unique Identifier Of this object*/
            get: function () { return this._guid; },
            enumerable: false,
            configurable: true
        });
        /** get entropy of now */
        Slot.prototype.getEntropy = function () {
            if (!this.isDirtyModels) {
                return this._entropy;
            }
            this.refreshOfModles();
            return this._entropy;
        };
        /** collapse of this slot models */
        Slot.prototype.collapseNow = function () {
            //检查一下 自己，因为为了提高性能，每次震荡不是彻底的。
            var pass = this.smallerSelf();
            if (!pass) {
                return false;
            }
            //开始坍缩
            this.isCollapse = true;
            if (this.models.length < 2) {
                return true;
            }
            var _map = this.modelsMap;
            var totalP = 0;
            var ms = this.models;
            ms.forEach(function (v) {
                var _m = _map[v];
                if (_m) {
                    totalP += _m.probability;
                }
            });
            var selected = ms[0];
            var roll = Math.random() * totalP;
            var p = 0;
            for (var i = 0, len = ms.length; i < len; i++) {
                var mId = ms[i];
                var _m = _map[mId];
                if (!_m) {
                    continue;
                }
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
        };
        /**
         * transmit to neighbors
         * @param solveCount  current solveCount
         * @returns is success of transmit
         */
        Slot.prototype.transmit = function (solveCount) {
            var arr = [this];
            var filterMap = {};
            while (arr.length > 0) {
                var temp = [];
                for (var i = 0, len = arr.length; i < len; i++) {
                    var v = arr[i];
                    var success = this.smallerAround(v, solveCount, temp, filterMap);
                    if (!success) {
                        return false;
                    }
                }
                arr = temp;
            }
            return true;
        };
        Slot.prototype.refresh = function () {
            this.edgeLeftTestMapArr = [{}, {}, {}, {}];
            this.edgeRightTestMapArr = [{}, {}, {}, {}];
            this.neighborsMCountMap = {};
            this.isCollapse = false;
            this.isDirtyModels = true;
            this.solveID = -1;
            this.refreshOfModles();
        };
        /** get state capture of this slot  */
        Slot.prototype.capture = function (_cap) {
            var result = _cap;
            if (!result) {
                result = {};
            }
            result.isCollapse = this.isCollapse;
            result.solveID = this.solveID;
            // result.models = this.models.concat();
            if (!result.models) {
                result.models = [];
            }
            if (result.models.length > this.models.length) {
                result.models.length = 0;
            }
            for (var i = 0, len = this.models.length; i < len; i++) {
                result.models[i] = this.models[i];
            }
            return result;
        };
        /**
         * apply capture state to this slot
         * @param _cap capture data
         */
        Slot.prototype.applyCapture = function (_cap) {
            var _this = this;
            if (!_cap) {
                return;
            }
            this.neighborsMCountMap = {};
            _cap.models.forEach(function (v, i) {
                _this.models[i] = v;
            });
            this.isCollapse = _cap.isCollapse;
            this.solveID = _cap.solveID;
            this.isDirtyModels = true;
        };
        /** smaller neighbors  */
        Slot.prototype.smallerAround = function (slot, solveCount, out, filterMap) {
            slot.solveID = solveCount;
            var nbs = slot.neighbors;
            for (var i = 0, len = nbs.length; i < len; i++) {
                var _n = nbs[i];
                if (filterMap[_n._guid] || _n.solveID == solveCount || _n.isCollapse) {
                    continue;
                } //清理 已经坍缩的邻居
                filterMap[_n._guid] = true;
                //do smaller 
                var pass = _n.smallerSelf();
                if (!pass) {
                    return false;
                }
                if (_n.isDirtyModels) {
                    //is slot dirty ,so need transmit to next.
                    out.push(_n);
                }
            }
            return true;
        };
        /** smaller self */
        Slot.prototype.smallerSelf = function () {
            var arr = this.neighbors;
            var _map = this.neighborsMCountMap;
            for (var i = 0, len = arr.length; i < len; i++) {
                var _n = arr[i];
                var pass = void 0;
                //test-------
                // Slot.testsmallerCount++;
                var key = _n.guid;
                var lastNCount = _map[key];
                var currNCount = _n.models.length;
                _map[key] = currNCount;
                //smaller when dirty
                pass = currNCount == lastNCount ? this.models.length > 0 : pass = _n.smaller(this);
                //test-------
                // pass = _n.smaller(this);
                if (!pass) {
                    return false;
                }
            }
            return true;
        };
        Slot.prototype.refreshOfModles = function () {
            this.isDirtyModels = false;
            //run
            var _e = 0;
            var _map = this.modelsMap;
            var mLen = this.models.length;
            var lArr = this.edgeLeftTestMapArr;
            var rArr = this.edgeRightTestMapArr;
            for (var i = 0; i < mLen; i++) {
                var _m = _map[this.models[i]];
                //calculate ConnectTest
                for (var j = 0; j < 4; j++) {
                    var _edge = _m.edges[j];
                    var lCID = _edge.connectIdLeft;
                    if (lCID && lCID != -1) {
                        lArr[j][lCID] = mLen;
                    }
                    var rCID = _edge.connectIdRight;
                    if (rCID && rCID != -1) {
                        rArr[j][rCID] = mLen;
                    }
                }
                //entropy
                _e += _m.entropy;
            }
            // _e *= -1;
            this._entropy = _e;
        };
        Slot.prototype.getCloseEdgeIdx = function (neighbor) {
            var result;
            var _nPos = neighbor.position;
            var _selfPos = this.position;
            if (_nPos.y < _selfPos.y) { //上
                result = 1;
                // result = 0;
            }
            else if (_nPos.y > _selfPos.y) { //下
                result = 3;
                // result = 2;
            }
            else if (_nPos.x < _selfPos.x) { //左
                result = 2;
                // result = 3;
            }
            else if (_nPos.x > _selfPos.x) { //右
                result = 0;
                // result = 1;
            }
            return result;
        };
        /** smaller neighbor models by this*/
        Slot.prototype.smaller = function (neighbor) {
            var result;
            var _map = this.modelsMap;
            var mLen = this.models.length;
            var oldModelsLen = neighbor.models.length;
            //找到邻接边
            var selfEdgeIdx = this.getCloseEdgeIdx(neighbor);
            var neighborEdgeIdx = neighbor.getCloseEdgeIdx(this);
            var LeftTestMap = this.getConnectTestMap(selfEdgeIdx, true);
            var rightTestMap = this.getConnectTestMap(selfEdgeIdx, false);
            //筛选有效model
            var activeModel = [];
            neighbor.models.forEach(function (v) {
                var _m = _map[v];
                var _eInfo = _m.edges[neighborEdgeIdx];
                if (LeftTestMap[_eInfo.connectIdRight] == mLen || rightTestMap[_eInfo.connectIdLeft] == mLen) {
                    activeModel.push(v);
                }
            });
            neighbor.models = activeModel;
            //final 
            if (!neighbor.isDirtyModels) {
                var newModelsLen = neighbor.models.length;
                neighbor.isDirtyModels = oldModelsLen != newModelsLen;
            }
            if (neighbor.models.length == 1) {
                neighbor.isCollapse = true;
            }
            result = neighbor.models.length > 0;
            return result;
        };
        Slot.prototype.getConnectTestMap = function (edgeIdx, isLeft) {
            if (this.isDirtyModels) {
                this.refreshOfModles();
            }
            return isLeft ? this.edgeLeftTestMapArr[edgeIdx] : this.edgeRightTestMapArr[edgeIdx];
        };
        /** guid counter */
        Slot._guidCount = 0;
        return Slot;
    }());
    /** Models that can be displayed */
    var Model = /** @class */ (function () {
        function Model() {
        }
        return Model;
    }());
    /** edge of infomation descript */
    // tslint:disable-next-line: max-classes-per-file
    var EdgeInfo = /** @class */ (function () {
        function EdgeInfo(connectIdL, connectIdR) {
            if (connectIdL === void 0) { connectIdL = -1; }
            if (connectIdR === void 0) { connectIdR = -1; }
            this.connectIdLeft = connectIdL;
            this.connectIdRight = connectIdR;
        }
        return EdgeInfo;
    }());
    /** wave function collapse of 2d test*/
    // tslint:disable-next-line: max-classes-per-file
    var WFC2D = /** @class */ (function () {
        function WFC2D(_dataArr) {
            var _this = this;
            //current model Map
            this.modelMap = {};
            //current slot all list
            this.allSlots = [];
            this.activeSlotMap = new Map();
            this.modelIDResInfoMap = {};
            /** queue of backoff data */
            this.backoffCaptureQueue = [];
            /** state of Collapsing */
            this._isCollapsing = false;
            /** map of tileName - resID */
            this.tileNameIDMap = {};
            var connectIdL = _dataArr.connectIdL;
            var connectIdR = _dataArr.connectIdR;
            var totalWeight = 0;
            var idCount = 0;
            var idList = this.idList = [];
            var setModelFun = function (imgName, rot, weight) {
                var resId = idCount++;
                _this.modelIDResInfoMap[resId] = [imgName, rot];
                idList.push(resId);
                var _m = ModelPool.instance.new_one();
                _m.rotateType = rot;
                _m.probability = weight;
                _m.resId = resId;
                _this.modelMap[resId] = _m;
                var arr = _this.tileNameIDMap[imgName];
                if (!arr) {
                    arr = _this.tileNameIDMap[imgName] = [];
                }
                arr[rot] = resId;
                totalWeight += weight;
                //edgeInfo
                var r = imgName + "_" + (rot + 0) % 4;
                var t = imgName + "_" + (rot + 1) % 4;
                var l = imgName + "_" + (rot + 2) % 4;
                var b = imgName + "_" + (rot + 3) % 4;
                _m.edges = [
                    new EdgeInfo(connectIdL[r], connectIdR[r]),
                    new EdgeInfo(connectIdL[t], connectIdR[t]),
                    new EdgeInfo(connectIdL[l], connectIdR[l]),
                    new EdgeInfo(connectIdL[b], connectIdR[b]),
                ];
            };
            var _loop_1 = function (k) {
                var _a;
                var imgName = k;
                var suffix = void 0;
                var weight;
                var rotates = void 0;
                _a = _dataArr.tiles[k], suffix = _a[0], weight = _a[1], rotates = _a[2];
                setModelFun(imgName, 0, weight);
                if (rotates) {
                    rotates.forEach(function (v) {
                        setModelFun(imgName, v, weight);
                    });
                }
            };
            //modes
            for (var k in _dataArr.tiles) {
                _loop_1(k);
            }
            //calculate probability & Entropy
            for (var key in this.modelMap) {
                var _m = this.modelMap[key];
                _m.probability = _m.probability / totalWeight;
                var p = _m.probability;
                //calculate Entropy
                //i...n
                //H = -sum(pi * Log2pi + .... pn * Log2pn);
                _m.entropy = -p * Math.log2(p);
            }
        }
        Object.defineProperty(WFC2D.prototype, "isCollapseing", {
            /**
             * 是否正在 坍缩
             * state of Collapsing
             */
            get: function () {
                return this._isCollapsing;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 设置已知条件，明确的设定相应坐标为具体的瓦片。  set Known condition of which Tiles in this position.
         * @param stateData 状态信息 {坐标x, 坐标y, {具体的瓦片, 旋转类型(0=0 , 1=90 ,2=180 ,3=270)}[]}。
         */
        WFC2D.prototype.setKnown = function (stateData) {
            if (!stateData || stateData.length < 1)
                return;
            var arrX = [];
            for (var i = 0, len = stateData.length; i < len; i++) {
                var s = stateData[i];
                var tiles = s.tiles;
                if (!tiles || tiles.length < 1)
                    continue;
                for (var j = 0, len1 = tiles.length; j < len1; j++) {
                    var _tName = tiles[j][0];
                    var _rotType = tiles[j][1];
                    if (_tName == null || _rotType == null)
                        continue;
                    var rotArr = this.tileNameIDMap[_tName];
                    var resID = rotArr[_rotType];
                    if (resID == null)
                        continue;
                    var arrY = arrX[s.x];
                    if (!arrY) {
                        arrY = arrX[s.x] = [];
                    }
                    var arrIDs = arrY[s.y];
                    if (!arrIDs) {
                        arrIDs = arrY[s.y] = [];
                    }
                    arrIDs.push(resID);
                }
            }
            if (arrX.length < 1)
                arrX = null;
            this.KnownState = arrX;
        };
        /**
         * 清理 设定的已知条件 。clear all of setKnown
         */
        WFC2D.prototype.clearKnown = function () {
            this.KnownState = null;
        };
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
        WFC2D.prototype.collapseSync = function (width, height, backOffMaxNum, capQueueMaxLen, capRate) {
            // if (this.isCollapsing) { return; }
            this.startTime = Date.now();
            //init
            this.setCollapseInit(width, height, backOffMaxNum, capQueueMaxLen, capRate);
            //to do main process
            this.calculateSync();
            //抛出结果
            return this.resultCollapse();
        };
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
        WFC2D.prototype.collapse = function (width, height, backOffMaxNum, capQueueMaxLen, capRate, frameMaxTime) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                // if (this.isCollapsing) {
                //     reject();
                //     return;
                // }
                _this.startTime = Date.now();
                // tslint:disable-next-line: no-parameter-reassignment
                if (frameMaxTime == null) {
                    frameMaxTime = 0.333;
                }
                //init
                _this.setCollapseInit(width, height, backOffMaxNum, capQueueMaxLen, capRate);
                //to do main process
                _this.calculate()
                    .then(function () {
                    //抛出结果
                    resolve(_this.resultCollapse());
                })
                    .catch(reject);
            });
        };
        /** set init of Collapse*/
        WFC2D.prototype.setCollapseInit = function (width, height, backOffMaxNum, capQueueMaxLen, capRate) {
            // tslint:disable-next-line: no-parameter-reassignment
            if (backOffMaxNum == null) {
                backOffMaxNum = 50;
            }
            // tslint:disable-next-line: no-parameter-reassignment
            if (capQueueMaxLen == null) {
                capQueueMaxLen = 3;
            }
            // tslint:disable-next-line: no-parameter-reassignment
            if (capRate == null) {
                capRate = 0.02;
            }
            this.isComplete = false;
            this.backOffMaxNum = backOffMaxNum;
            this.capQueueMaxLen = capQueueMaxLen;
            this.capCycleRate = Math.min(Math.max(capRate, 0), 1);
            this.solveCount = 0;
            this.backOffCount = 0;
            this.capSlotCount = 0;
            this.currCapQueCount = 0;
            this.allSlots.length = 0;
            this.backoffCaptureQueue.forEach(function (v) {
                v.length = 0;
            });
            this.backoffCaptureQueue.length = 0;
            this.activeSlotMap.clear();
            this.width = width;
            this.height = height;
            this.setData(width, height);
        };
        /** get collapse result data*/
        WFC2D.prototype.resultCollapse = function () {
            var result = [];
            var arr = this.allSlots;
            var _map = this.modelIDResInfoMap;
            for (var i = 0, len = arr.length; i < len; i++) {
                var _s = arr[i];
                _s.modelsMap = null;
                var temp = _map[_s.models[0]];
                result.push(temp);
                SlotPool.instance.delete_one(_s);
            }
            this.allSlots.length = 0;
            // tslint:disable-next-line: max-line-length
            console.log("collapse complete! total time : " + (Date.now() - this.startTime) + ", solveCount : " + this.solveCount + " , backOffCount : " + this.backOffCount);
            return result;
        };
        /** set data before collapse */
        WFC2D.prototype.setData = function (width, height) {
            var _this = this;
            var idList = this.idList;
            var states = this.initialCapture = [];
            var kSta = this.KnownState;
            //生成slots
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var _s = SlotPool.instance.new_one();
                    _s.position.x = x;
                    _s.position.y = y;
                    if (!kSta || !kSta[x] || kSta[x][y] == null) {
                        _s.models = idList.concat(); //clone this array
                    }
                    else {
                        _s.models = kSta[x][y];
                        _s.isCollapse = true;
                    }
                    _s.modelsMap = this.modelMap;
                    _s.neighbors = [];
                    _s.refresh();
                    var curr = this.allSlots.push(_s);
                    //initial slot cap
                    states[curr - 1] = _s.capture();
                    if (_s.models.length > 1) {
                        this.activeSlotMap.set(_s.guid, _s);
                    }
                }
            }
            //设置 所有 slot 的邻居
            this.allSlots.forEach(function (v, i) {
                var pos = v.position;
                for (var k = 0; k < 4; k++) {
                    var _n = _this.getNeighbor(pos, k);
                    if (_n) {
                        v.neighbors.push(_n);
                    }
                }
            });
            //rate cap set
            this.capCycle = Math.floor(this.width * this.height * this.capCycleRate);
        };
        WFC2D.prototype.getNeighbor = function (pos, edgeIdx) {
            var result;
            var tarPosX = pos.x;
            var tarPosY = pos.y;
            // tslint:disable-next-line: switch-default
            switch (edgeIdx) {
                case 0:
                    tarPosY--;
                    break; //上
                case 1:
                    tarPosX++;
                    break; //右
                case 2:
                    tarPosY++;
                    break; //下
                case 3: tarPosX--; //左
            }
            //是否超出范围
            if (tarPosX < 0 || tarPosX > this.width || tarPosY < 0 || tarPosY > this.height) {
                return null;
            }
            // result = this.allSlots[tarPosY - 0][tarPosX - 0];
            result = this.allSlots[tarPosY * this.width + tarPosX];
            return result;
        };
        WFC2D.prototype.calculate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var time = 33.3;
                _this._isCollapsing = true;
                var fun = function () {
                    var curr = Date.now();
                    try {
                        while (!_this.isComplete) {
                            _this._doCollapse();
                            if (Date.now() - curr > time) {
                                setTimeout(function () {
                                    fun();
                                }, 0);
                                return;
                            }
                        }
                    }
                    catch (err) {
                        reject(err);
                        return;
                    }
                    //complete
                    _this._isCollapsing = false;
                    resolve(null);
                };
                fun();
            });
        };
        WFC2D.prototype.calculateSync = function () {
            while (!this.isComplete) {
                this._doCollapse();
            }
        };
        WFC2D.prototype._doCollapse = function () {
            //get one of minimum entropy 
            var _select;
            var isFirst = this.activeSlotMap.size == this.allSlots.length;
            if (!isFirst) {
                var _mini = Number.POSITIVE_INFINITY;
                var vs = this.activeSlotMap.values();
                var temp = void 0;
                while (true) {
                    temp = vs.next();
                    if (temp.done) {
                        break;
                    }
                    var t = temp.value;
                    var _e = t.getEntropy();
                    if (_e < _mini) {
                        _select = t;
                        _mini = _e;
                    }
                }
            }
            else {
                var rIdx = Math.floor(Math.random() * this.allSlots.length);
                _select = this.allSlots[rIdx];
            }
            if (!_select) {
                this.isComplete = true;
                return;
            }
            //坍缩 成具体model
            var success = _select.collapseNow();
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
        };
        WFC2D.prototype.captureAllSlot = function () {
            this.capSlotCount--;
            // skip to reduce expend
            if (this.capSlotCount > 0) {
                return;
            }
            this.capSlotCount = this.capCycle;
            //do cap
            var queue = this.backoffCaptureQueue;
            var states = this.currCapQueCount >= this.capQueueMaxLen ? queue.shift() : [];
            if (!states) {
                states = [];
            }
            this.allSlots.forEach(function (v, i) {
                states[i] = v.capture(states[i]);
            });
            queue.push(states);
            this.currCapQueCount = this.currCapQueCount >= this.capQueueMaxLen ? this.capQueueMaxLen : ++this.currCapQueCount;
        };
        //backOff to last state
        WFC2D.prototype._backOff = function () {
            var _this = this;
            this.backOffCount++;
            if (this.backOffCount > this.backOffMaxNum) {
                var msg = "backOff over the limit Max Count : " + this.backOffMaxNum + " , you need raise backOffMaxNum or capQueueMaxLen.";
                //alert(msg);
                throw new Error(msg);
            }
            var states = this.backoffCaptureQueue.pop();
            if (!states) {
                states = this.initialCapture;
            }
            this.allSlots.forEach(function (v, i) {
                v.applyCapture(states[i]);
                if (!v.isCollapse) {
                    _this.activeSlotMap.set(v.guid, v);
                }
                else {
                    _this.activeSlotMap.delete(v.guid);
                }
            });
            this.currCapQueCount--;
            if (this.currCapQueCount < 0) {
                this.currCapQueCount = 0;
            }
        };
        return WFC2D;
    }());
    WFC.WFC2D = WFC2D;
})(WFC || (WFC = {}));
//# sourceMappingURL=wfc2D.js.map