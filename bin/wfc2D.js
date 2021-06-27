var WFC;
(function (WFC) {
    var Vec2 = (function () {
        function Vec2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        return Vec2;
    }());
    var tagInpool = "_IsInPool_";
    var SlotPool = (function () {
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
    var ModelPool = (function () {
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
    var Slot = (function () {
        function Slot() {
            this.position = new Vec2();
            this.isCollapse = false;
            this.models = [];
            this.neighbors = [];
            this.neighborsMCountMap = {};
            this.solveID = -1;
            this.isDirtyModels = false;
            this._guid = Slot._guidCount++;
        }
        Object.defineProperty(Slot.prototype, "guid", {
            get: function () { return this._guid; },
            enumerable: false,
            configurable: true
        });
        Slot.prototype.getEntropy = function () {
            if (!this.isDirtyModels) {
                return this._entropy;
            }
            this.refreshOfModles();
            return this._entropy;
        };
        Slot.prototype.collapseNow = function () {
            var pass = this.smallerSelf();
            if (!pass) {
                return false;
            }
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
            ms.length = 0;
            ms.push(selected);
            this.isDirtyModels = true;
            return true;
        };
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
        Slot.prototype.capture = function (_cap) {
            var result = _cap;
            if (!result) {
                result = {};
            }
            result.isCollapse = this.isCollapse;
            result.solveID = this.solveID;
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
        Slot.prototype.smallerAround = function (slot, solveCount, out, filterMap) {
            slot.solveID = solveCount;
            var nbs = slot.neighbors;
            for (var i = 0, len = nbs.length; i < len; i++) {
                var _n = nbs[i];
                if (filterMap[_n._guid] || _n.solveID == solveCount || _n.isCollapse) {
                    continue;
                }
                filterMap[_n._guid] = true;
                var pass = _n.smallerSelf();
                if (!pass) {
                    return false;
                }
                if (_n.isDirtyModels) {
                    out.push(_n);
                }
            }
            return true;
        };
        Slot.prototype.smallerSelf = function () {
            var arr = this.neighbors;
            var _map = this.neighborsMCountMap;
            for (var i = 0, len = arr.length; i < len; i++) {
                var _n = arr[i];
                var pass = void 0;
                var key = _n.guid;
                var lastNCount = _map[key];
                var currNCount = _n.models.length;
                _map[key] = currNCount;
                pass = currNCount == lastNCount ? this.models.length > 0 : pass = _n.smaller(this);
                if (!pass) {
                    return false;
                }
            }
            return true;
        };
        Slot.prototype.refreshOfModles = function () {
            this.isDirtyModels = false;
            var _e = 0;
            var _map = this.modelsMap;
            var mLen = this.models.length;
            var lArr = this.edgeLeftTestMapArr;
            var rArr = this.edgeRightTestMapArr;
            for (var i = 0; i < mLen; i++) {
                var _m = _map[this.models[i]];
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
                _e += _m.entropy;
            }
            _e *= -1;
            this._entropy = _e;
        };
        Slot.prototype.getCloseEdgeIdx = function (neighbor) {
            var result;
            var _nPos = neighbor.position;
            var _selfPos = this.position;
            if (_nPos.y < _selfPos.y) {
                result = 1;
            }
            else if (_nPos.y > _selfPos.y) {
                result = 3;
            }
            else if (_nPos.x < _selfPos.x) {
                result = 2;
            }
            else if (_nPos.x > _selfPos.x) {
                result = 0;
            }
            return result;
        };
        Slot.prototype.smaller = function (neighbor) {
            var result;
            var _map = this.modelsMap;
            var mLen = this.models.length;
            var oldModelsLen = neighbor.models.length;
            var selfEdgeIdx = this.getCloseEdgeIdx(neighbor);
            var neighborEdgeIdx = neighbor.getCloseEdgeIdx(this);
            var LeftTestMap = this.getConnectTestMap(selfEdgeIdx, true);
            var rightTestMap = this.getConnectTestMap(selfEdgeIdx, false);
            var activeModel = [];
            neighbor.models.forEach(function (v) {
                var _m = _map[v];
                var _eInfo = _m.edges[neighborEdgeIdx];
                if (LeftTestMap[_eInfo.connectIdRight] == mLen || rightTestMap[_eInfo.connectIdLeft] == mLen) {
                    activeModel.push(v);
                }
            });
            neighbor.models = activeModel;
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
        Slot._guidCount = 0;
        return Slot;
    }());
    var Model = (function () {
        function Model() {
        }
        return Model;
    }());
    var EdgeInfo = (function () {
        function EdgeInfo(connectIdL, connectIdR) {
            if (connectIdL === void 0) { connectIdL = -1; }
            if (connectIdR === void 0) { connectIdR = -1; }
            this.connectIdLeft = connectIdL;
            this.connectIdRight = connectIdR;
        }
        return EdgeInfo;
    }());
    var WFC2D = (function () {
        function WFC2D(_dataArr) {
            var _this = this;
            this.modelMap = {};
            this.allSlots = [];
            this.activeSlotMap = new Map();
            this.modelIDResInfoMap = {};
            this.backoffCaptureQueue = [];
            this.isCollapsing = false;
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
                totalWeight += weight;
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
            for (var k in _dataArr.tiles) {
                _loop_1(k);
            }
            for (var key in this.modelMap) {
                var _m = this.modelMap[key];
                _m.probability = _m.probability / totalWeight;
                var p = _m.probability;
                _m.entropy = p * Math.log2(p);
            }
        }
        WFC2D.prototype.collapseSync = function (width, height, backOffMaxNum, capQueueMaxLen, capRate) {
            this.startTime = Date.now();
            this.setCollapseInit(width, height, backOffMaxNum, capQueueMaxLen, capRate);
            this.calculateSync();
            return this.resultCollapse();
        };
        WFC2D.prototype.collapse = function (width, height, backOffMaxNum, capQueueMaxLen, capRate, frameMaxTime) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.startTime = Date.now();
                if (frameMaxTime == null) {
                    frameMaxTime = 0.333;
                }
                _this.setCollapseInit(width, height, backOffMaxNum, capQueueMaxLen, capRate);
                _this.calculate()
                    .then(function () {
                    resolve(_this.resultCollapse());
                })
                    .catch(reject);
            });
        };
        WFC2D.prototype.setCollapseInit = function (width, height, backOffMaxNum, capQueueMaxLen, capRate) {
            if (backOffMaxNum == null) {
                backOffMaxNum = 50;
            }
            if (capQueueMaxLen == null) {
                capQueueMaxLen = 3;
            }
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
            console.log("collapse complete! total time : " + (Date.now() - this.startTime) + ", solveCount : " + this.solveCount + " , backOffCount : " + this.backOffCount);
            return result;
        };
        WFC2D.prototype.setData = function (width, height) {
            var _this = this;
            var idList = this.idList;
            var states = this.initialCapture = [];
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    var _s = SlotPool.instance.new_one();
                    _s.models = idList.concat();
                    _s.modelsMap = this.modelMap;
                    _s.position.x = j;
                    _s.position.y = i;
                    _s.neighbors = [];
                    _s.refresh();
                    var curr = this.allSlots.push(_s);
                    states[curr - 1] = _s.capture();
                    this.activeSlotMap.set(_s.guid, _s);
                }
            }
            this.allSlots.forEach(function (v, i) {
                var pos = v.position;
                for (var k = 0; k < 4; k++) {
                    var _n = _this.getNeighbor(pos, k);
                    if (_n) {
                        v.neighbors.push(_n);
                    }
                }
            });
            this.capCycle = Math.floor(this.width * this.height * this.capCycleRate);
        };
        WFC2D.prototype.getNeighbor = function (pos, edgeIdx) {
            var result;
            var tarPosX = pos.x;
            var tarPosY = pos.y;
            switch (edgeIdx) {
                case 0:
                    tarPosY--;
                    break;
                case 1:
                    tarPosX++;
                    break;
                case 2:
                    tarPosY++;
                    break;
                case 3: tarPosX--;
            }
            if (tarPosX < 0 || tarPosX > this.width || tarPosY < 0 || tarPosY > this.height) {
                return null;
            }
            result = this.allSlots[tarPosY * this.width + tarPosX];
            return result;
        };
        WFC2D.prototype.calculate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var time = 33.3;
                _this.isCollapsing = true;
                var fun = function () {
                    var curr = Date.now();
                    while (!_this.isComplete) {
                        _this._doCollapse();
                        if (Date.now() - curr > time) {
                            setTimeout(function () {
                                fun();
                            }, 0);
                            return;
                        }
                    }
                    _this.isCollapsing = false;
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
            var success = _select.collapseNow();
            if (success) {
                this.activeSlotMap.delete(_select.guid);
                success = _select.transmit(this.solveCount);
            }
            if (!success) {
                this._backOff();
                return;
            }
            this.captureAllSlot();
            this.solveCount++;
        };
        WFC2D.prototype.captureAllSlot = function () {
            this.capSlotCount--;
            if (this.capSlotCount > 0) {
                return;
            }
            this.capSlotCount = this.capCycle;
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
        WFC2D.prototype._backOff = function () {
            var _this = this;
            this.backOffCount++;
            if (this.backOffCount > this.backOffMaxNum) {
                var msg = "backOff over the limit Max Count : " + this.backOffMaxNum + " , you need raise backOffMaxNum or capQueueMaxLen.";
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