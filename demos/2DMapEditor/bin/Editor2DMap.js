System.register(["./EditorTools.js", "./EventManager.js", "./TileBase.js"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var EditorTools_js_1, EventManager_js_1, TileBase_js_1, Editor2DMap;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (EditorTools_js_1_1) {
                EditorTools_js_1 = EditorTools_js_1_1;
            },
            function (EventManager_js_1_1) {
                EventManager_js_1 = EventManager_js_1_1;
            },
            function (TileBase_js_1_1) {
                TileBase_js_1 = TileBase_js_1_1;
            }
        ],
        execute: function () {
            Editor2DMap = (function () {
                function Editor2DMap() {
                    this.outwardName = "__wfc2dEdt__";
                    this.outwardEditorInited = "onEditorInited";
                    this.dataFile = "data.json";
                    this.editorFile = "editor.json";
                    this.exportFile = "export.zip";
                    this.rotateList = [0, 1, 2, 3];
                    this.size = 100;
                    this.vsTileSacle = 1.5;
                    this.gap = 10;
                    this.vsTiles = [];
                    this.viewIdNameMap = {};
                    this.ViewResNameIDMap = {};
                    this.resNameImgMap = {};
                    this.currSelectTiles = [];
                    this.currNeighborMap = {};
                    this.viewTilesMap = {};
                    this.neighborDirty = true;
                    this.isSwitchMode = false;
                    this.init();
                }
                Editor2DMap.prototype.genCellViewTile = function (li, x) {
                    var result;
                    result = new TileBase_js_1.TileView(this.size, li);
                    var subDiv = result.htmlEleRoot;
                    subDiv.style.left = x * this.gap + "px";
                    if (!this.isSwitchMode) {
                        result.setBGFrameColor("#8844ffff");
                    }
                    return result;
                };
                Editor2DMap.prototype.genCellSelectTile = function (root, x) {
                    var result;
                    result = new TileBase_js_1.TileSelect(this.size, root);
                    var subDiv = result.htmlEleRoot;
                    subDiv.style.left = x * this.gap + "px";
                    return result;
                };
                Editor2DMap.prototype.setInfo = function (resName, weight, rotateStatas) {
                    var _this = this;
                    this.infoEle.innerHTML = "\n            \u8D44\u6E90\u540D\uFF1A" + resName + "<br />\n            <br>\u6743\u91CD\u503C:<input type=\"text\" id=\"weightText\" value=\"" + weight + "\" /></br>\n            <br>\u53EF\u65CB\u8F6C:<input type=\"text\" id=\"rotateStatasText\" value=\"" + rotateStatas.toString() + "\" /></br>\n        ";
                    var weightText = document.getElementById("weightText");
                    var rotateStatasText = document.getElementById("rotateStatasText");
                    weightText.onchange = function () {
                        var newNum = Number(weightText.value);
                        if (isNaN(newNum)) {
                            return;
                        }
                        var baseName = EditorTools_js_1.getImgBaseName(_this.viewIdNameMap[_this.currViewID]);
                        var tconfig = _this.currTilePackage.config.tiles[baseName];
                        tconfig[1] = newNum;
                        _this.setSelectByID(_this.currViewID);
                    };
                    rotateStatasText.onchange = function () {
                        var str = rotateStatasText.value;
                        var arr;
                        try {
                            arr = JSON.parse("[" + str + "]");
                        }
                        catch (v) { }
                        if (!arr) {
                            return;
                        }
                        arr.length = arr.length > 3 ? 3 : arr.length;
                        arr.forEach(function (val, i) {
                            arr[i] = i + 1;
                        });
                        var baseName = EditorTools_js_1.getImgBaseName(_this.viewIdNameMap[_this.currViewID]);
                        var tconfig = _this.currTilePackage.config.tiles[baseName];
                        tconfig[2] = arr;
                        _this.setSelectByID(_this.currViewID);
                    };
                };
                Editor2DMap.prototype.init = function () {
                    var str = window.location.search;
                    if (str && str.indexOf("swMode=1") != -1) {
                        this.isSwitchMode = true;
                    }
                    this.setUI();
                    this.setVisible();
                    EventManager_js_1.EventManager.addListener("view_editor", this.onViewEditor, this);
                    EventManager_js_1.EventManager.addListener("select_editor", this.onSelectEditor, this);
                    EventManager_js_1.EventManager.addListener("select_over", this.onSelectOver, this);
                    EventManager_js_1.EventManager.addListener("select_over_leave", this.onSelectLeave, this);
                    var doc = this.importFilesEle.ownerDocument;
                    doc[this.outwardName] = this;
                    if (doc[this.outwardEditorInited]) {
                        doc[this.outwardEditorInited]();
                        delete doc[this.outwardEditorInited];
                    }
                };
                Editor2DMap.prototype.setUI = function () {
                    var _this = this;
                    var infoElement = this.infoEle = document.getElementById("tileInfocont");
                    infoElement.style.background = "#8899ffaa";
                    infoElement.style.border = "3px solid #4444aa";
                    var srootElement = document.getElementById("tileScont");
                    srootElement.style.height = this.size + "px";
                    this.selectEle = document.createElement("li");
                    this.selectEle.style.display = "flex";
                    this.selectEle.style.position = "relative";
                    this.selectEle.style.height = this.size + "px";
                    srootElement.appendChild(this.selectEle);
                    this.selectEle.parentElement.style.height = this.selectEle.parentElement.offsetHeight + "px";
                    var scrollSpeedScale = 1;
                    srootElement.onwheel = function (ev) {
                        console.log("wheelDelta : " + ev.deltaY);
                        srootElement.scroll(srootElement.scrollLeft + (ev.deltaY * scrollSpeedScale), 0);
                    };
                    this.fileEle = document.getElementById("selectFiles");
                    this.fileEle.onchange = this.onFileChange.bind(this);
                    this.selectOptionEle = document.getElementById("selectOption");
                    this.importFilesEle = document.getElementById("importFiles");
                    this.importFilesEle.onclick = this.onSelectImport.bind(this);
                    this.exportFileEle = document.getElementById("exportFiles");
                    this.exportFileEle.onclick = this.onExportClik.bind(this);
                    this.swOptionAllEle = document.getElementById("swOptionAll");
                    this.swOptionAllEle.onclick = function () { _this.allViewSelect(true); };
                    this.swOptionCancelEle = document.getElementById("swOptionCancel");
                    this.swOptionCancelEle.onclick = function () { _this.allViewSelect(false); };
                    this.viewEditorModeEle = document.getElementById("viewEditorMode");
                    this.viewEditorModeEle.onchange = function () { _this.allViewActiveCKbox(_this.viewDeActiveModeEle.checked); };
                    this.viewDeActiveModeEle = document.getElementById("viewDeActiveMode");
                    this.viewDeActiveModeEle.onchange = function () { _this.allViewActiveCKbox(_this.viewDeActiveModeEle.checked); };
                    this.setVSTiles();
                };
                Editor2DMap.prototype.setVisible = function () {
                    EditorTools_js_1.SetEleVisible("tilesViewLi", false);
                    EditorTools_js_1.SetEleVisible("tilesInfoLi", false);
                    EditorTools_js_1.SetEleVisible("tilesSelectLi", false);
                    EditorTools_js_1.SetEleVisible("tilesVSLi", false);
                    if (this.isSwitchMode) {
                        EditorTools_js_1.SetEleVisible("exportLi", false);
                    }
                    else {
                        EditorTools_js_1.SetEleVisible("SWOptionLi", false);
                    }
                };
                Editor2DMap.prototype.getViewContentMaxWSize = function () {
                    var vrootElement = document.getElementById("tileVcont");
                    var rootW = vrootElement.clientWidth;
                    return Math.floor((rootW + this.gap) / (this.size + this.gap));
                };
                Editor2DMap.prototype.setView = function (imgs) {
                    var _this = this;
                    var tiles = [];
                    var tLen = tiles.length = imgs.length;
                    var vrootElement = document.getElementById("tileVcont");
                    var maxWSize = this.viewContentMaxWSize = this.getViewContentMaxWSize();
                    var maxHSize = Math.floor(tLen / maxWSize) + 1;
                    var realHeight = maxHSize * (this.gap + this.size) - this.gap;
                    vrootElement.style.height = realHeight + "px";
                    vrootElement.parentElement.style.height = vrootElement.offsetHeight + "px";
                    var count = 0;
                    var x = 0;
                    var y = 0;
                    var liMap = {};
                    while (count < tLen) {
                        var _tImg = imgs[count];
                        x = count % maxWSize;
                        y = Math.floor(count / maxWSize);
                        var li = liMap[y];
                        if (!li) {
                            li = document.createElement("li");
                            liMap[y] = li;
                            li.style.display = "flex";
                            li.style.position = "relative";
                            li.style.height = this.size + "px";
                            li.style.width = vrootElement.style.width;
                            li.style.top = y * this.gap + "px";
                            vrootElement.appendChild(li);
                        }
                        var t = this.genCellViewTile(li, x);
                        t.resName = _tImg.fileName;
                        t.setImgUrl(_tImg.dataB64);
                        t.onTileClick = this.onViewTileClick.bind(this);
                        t.onTileOver = this.onViewTileOver.bind(this);
                        t.onBoderEnter = this.onBoderEnter.bind(this);
                        t.onBoderLeave = this.onBoderLeave.bind(this);
                        var id = t.getID();
                        this.viewTilesMap[EditorTools_js_1.getImgBaseName(t.resName)] = t;
                        this.viewIdNameMap[id] = _tImg.fileName;
                        this.resNameImgMap[_tImg.fileName] = _tImg;
                        this.ViewResNameIDMap[_tImg.fileName] = id;
                        count++;
                    }
                    window.onresize = function () {
                        _this.ckRefreshViewLayout();
                    };
                };
                Editor2DMap.prototype.ckRefreshViewLayout = function () {
                    var currSize = this.getViewContentMaxWSize();
                    if (currSize == this.viewContentMaxWSize || currSize > this.currTilePackage.imgs.length) {
                        return;
                    }
                    this.clearView();
                    this.setView(this.currTilePackage.imgs);
                };
                Editor2DMap.prototype.setVSTiles = function () {
                    var _this = this;
                    var tSize = this.size * this.vsTileSacle;
                    var vsElement = document.getElementById("tileVScont");
                    vsElement.style.width = vsElement.style.height = tSize * 3 + "px";
                    var parentSize = vsElement.offsetHeight;
                    var datas = [[1, 1], [2, 1], [1, 0], [0, 1], [1, 2]];
                    datas.forEach(function (arr, i) {
                        var _t = new TileBase_js_1.Tile(tSize, vsElement, 0);
                        _t.htmlEleRoot.style.position = "absolute";
                        _t.htmlEleRoot.style.left = parentSize - tSize * (3 - arr[0]) + "px";
                        _t.htmlEleRoot.style.top = parentSize - tSize * (3 - arr[1]) + "px";
                        _t.setSelect(false);
                        vsElement.appendChild(_t.htmlEleRoot);
                        _this.vsTiles.push(_t);
                        if (i > 0) {
                            _t.onTileClick = _this.onVSTileActiveCG.bind(_this);
                        }
                    });
                };
                Editor2DMap.prototype.getValidNeighborMap = function (key) {
                    var result = this.currNeighborMap[key];
                    if (!result) {
                        result = this.currNeighborMap[key] = {};
                    }
                    return result;
                };
                Editor2DMap.prototype.onVSTileActiveCG = function (tile) {
                    console.log("onVSTileActiveCG : " + tile.resName);
                    tile.active = !tile.active;
                    var idx = this.vsTiles.indexOf(tile);
                    var dir = idx - 1;
                    var _centerResName = this.viewIdNameMap[this.currViewID];
                    var _leftName = EditorTools_js_1.getImgBaseName(_centerResName) + "_" + dir;
                    var rEdgeID = EditorTools_js_1.getRightEdgeNum(tile.rotateType, dir);
                    var _rightName = EditorTools_js_1.getImgBaseName(tile.resName) + "_" + rEdgeID;
                    var _map = this.getValidNeighborMap(_leftName);
                    this.neighborDirty = true;
                    _map[_rightName] = tile.active;
                };
                Editor2DMap.prototype.onViewEditor = function (ev) {
                    console.log("onViewEditor : " + ev.id);
                    this.setSelectByID(ev.id);
                    this.clearVSEdges();
                    this.setVSCenterID(ev.id);
                };
                Editor2DMap.prototype.onSelectEditor = function (ev) {
                    this.setSelectEditor(ev.resName, ev.rotateType);
                };
                Editor2DMap.prototype.onSelectOver = function (ev) {
                    this.setSelectEditor(ev.resName, ev.rotateType);
                };
                Editor2DMap.prototype.onSelectLeave = function () {
                    if (!this.currSelectTile) {
                        this.clearVSEdges();
                        return;
                    }
                    this.setSelectEditor(this.currSelectTile.resName, this.currSelectTile.rotateType);
                };
                Editor2DMap.prototype.setSelectEditor = function (_selectResName, _rotateType) {
                    this.clearVSEdges();
                    var list = this.rotateList;
                    var _viewResName = this.viewIdNameMap[this.currViewID];
                    for (var i = 0, len = list.length; i < len; i++) {
                        var dir = list[i];
                        this.setVSEdge(_selectResName, _rotateType, dir);
                    }
                };
                Editor2DMap.prototype.setVSEdge = function (resName, rotateType, centerRotateT) {
                    var vsTile = this.vsTiles[centerRotateT + 1];
                    var t = this.resNameImgMap[resName];
                    vsTile.rotateType = rotateType;
                    vsTile.resName = resName;
                    vsTile.setImgUrl(t.dataB64);
                    var _viewResName = this.viewIdNameMap[this.currViewID];
                    var _nCenter = EditorTools_js_1.getImgBaseName(_viewResName) + "_" + centerRotateT;
                    var _map = this.getValidNeighborMap(_nCenter);
                    var _rEdgeID = EditorTools_js_1.getRightEdgeNum(vsTile.rotateType, centerRotateT);
                    var _nRight = EditorTools_js_1.getImgBaseName(resName) + "_" + _rEdgeID;
                    var isActive = _map[_nRight] ? true : false;
                    if (_map[_nRight] == null) {
                    }
                    vsTile.enableActiveCkbox();
                    vsTile.active = isActive;
                };
                Editor2DMap.prototype.setVSCenterID = function (tileID) {
                    this.currViewID = tileID;
                    var center = this.vsTiles[0];
                    var resName = this.viewIdNameMap[tileID];
                    var t = this.resNameImgMap[resName];
                    center.setImgUrl(t.dataB64);
                };
                Editor2DMap.prototype.setSelectByID = function (tileID) {
                    this.clearSelect();
                    var resName = this.viewIdNameMap[tileID];
                    var cfg = this.currTilePackage.config;
                    var arr = [];
                    for (var key in cfg.tiles) {
                        var val = cfg.tiles[key];
                        var _rN = "" + key + val[0];
                        arr.push(this.ViewResNameIDMap[_rN]);
                    }
                    this.setSelectArr(arr);
                };
                Editor2DMap.prototype.onExportClik = function () {
                    var _this = this;
                    console.log("onExportClik");
                    var tileP = this.currTilePackage;
                    if (!tileP) {
                        return;
                    }
                    var JSZip = globalThis.JSZip;
                    var saveAs = globalThis.saveAs;
                    var zip = new JSZip();
                    var data = this.mergeConfig(tileP.config);
                    var tiles = data.tiles;
                    var n = data.neighbor;
                    var dea = data.deactivate;
                    var limitTiles = {};
                    for (var k in tiles) {
                        if (dea[k]) {
                            continue;
                        }
                        limitTiles[k] = tiles[k];
                    }
                    data.tiles = limitTiles;
                    delete data.neighbor;
                    delete data.deactivate;
                    zip.file(this.dataFile, JSON.stringify(data));
                    data.neighbor = n;
                    data.deactivate = dea;
                    data.tiles = tiles;
                    var nL = data.connectIdL;
                    var nR = data.connectIdR;
                    delete data.connectIdL;
                    delete data.connectIdR;
                    zip.file(this.editorFile, JSON.stringify(data));
                    data.connectIdL = nL;
                    data.connectIdR = nR;
                    tileP.imgs.forEach(function (val, i) {
                        zip.file(val.fileName, EditorTools_js_1.dataURLtoBlob(val.dataB64), { base64: true });
                    });
                    zip.generateAsync({ type: "blob" })
                        .then(function (content) {
                        saveAs(content, _this.exportFile);
                    });
                };
                Editor2DMap.prototype.allViewSelect = function (isSelect) {
                    for (var k in this.viewTilesMap) {
                        var v = this.viewTilesMap[k];
                        if (!v) {
                            continue;
                        }
                        v.setSelect(isSelect);
                    }
                };
                Editor2DMap.prototype.allViewActiveCKbox = function (isEnable) {
                    for (var k in this.viewTilesMap) {
                        var v = this.viewTilesMap[k];
                        if (!v) {
                            continue;
                        }
                        isEnable ? v.enableActiveCkbox() : v.disableActiveCkbox();
                        v.active = v.active;
                    }
                };
                Editor2DMap.prototype.mergeConfig = function (_conf) {
                    if (!this.neighborDirty) {
                        return _conf;
                    }
                    this.neighborDirty = false;
                    var result = {};
                    result.tiles = _conf.tiles;
                    result.deactivate = _conf.deactivate;
                    var nArrLimit = [];
                    var nArr = [];
                    for (var _left in this.currNeighborMap) {
                        var _map = this.currNeighborMap[_left];
                        for (var _right in _map) {
                            var temp = { left: _left, right: _right };
                            if (_map[_right]) {
                                nArr.push(temp);
                                var L = _left.substring(0, _left.length - 2);
                                var R = _right.substring(0, _right.length - 2);
                                if (!_conf.deactivate[L] && !_conf.deactivate[R]) {
                                    nArrLimit.push(temp);
                                }
                            }
                        }
                    }
                    result.neighbor = nArr;
                    var _tempC = EditorTools_js_1.kv2ConnectID(nArrLimit);
                    result.connectIdL = _tempC.connectIdL;
                    result.connectIdR = _tempC.connectIdR;
                    return result;
                };
                Editor2DMap.prototype.neighborParse = function (neighbor) {
                    var _this = this;
                    neighbor.forEach(function (val) {
                        var _map = _this.getValidNeighborMap(val.left);
                        _map[val.right] = true;
                    });
                };
                Editor2DMap.prototype.setDefTileImg = function (imgFileName, conf) {
                    var idx = imgFileName.lastIndexOf(".");
                    var imgName = imgFileName.substring(0, idx);
                    var suffix = imgFileName.substring(idx);
                    conf.tiles[imgName] = [suffix, 1, [1, 2, 3]];
                };
                Editor2DMap.prototype.onFileChange = function (ev) {
                    var files = this.fileEle.files;
                    this.setDataByFileList(files);
                };
                Editor2DMap.prototype.setDataByFileList = function (fileL) {
                    var _this = this;
                    var files = fileL;
                    var _imgs = [];
                    var _config;
                    var floderName = "";
                    var ckEnd = function () {
                        _this.clearAll();
                        EditorTools_js_1.SetEleVisible("tilesViewLi", true);
                        if (!_this.isSwitchMode) {
                            EditorTools_js_1.SetEleVisible("tilesInfoLi", true);
                            EditorTools_js_1.SetEleVisible("tilesSelectLi", true);
                            EditorTools_js_1.SetEleVisible("tilesVSLi", true);
                        }
                        waitCount--;
                        if (waitCount > 0) {
                            return;
                        }
                        console.log("file \u52A0\u8F7D\u5B8C\u6BD5");
                        if (!_config) {
                            _config = {};
                        }
                        if (!_config.tiles) {
                            _config.tiles = {};
                            _imgs.forEach(function (v) {
                                _this.setDefTileImg(v.fileName, _config);
                            });
                        }
                        else {
                            var _imgNameMap_1 = {};
                            _imgs.forEach(function (v) {
                                var fn = v.fileName;
                                var imgName = fn.substring(0, fn.lastIndexOf("."));
                                _imgNameMap_1[imgName] = true;
                                if (_config.tiles[imgName] == null) {
                                    _this.setDefTileImg(v.fileName, _config);
                                }
                            });
                            for (var k in _config.tiles) {
                                if (_imgNameMap_1[k]) {
                                    continue;
                                }
                                delete _config.tiles[k];
                            }
                        }
                        if (!_config.connectIdL) {
                            _config.connectIdL = {};
                        }
                        if (!_config.connectIdR) {
                            _config.connectIdR = {};
                        }
                        if (!_config.deactivate) {
                            _config.deactivate = {};
                        }
                        if (!_config.neighbor) {
                            _config.neighbor = [];
                        }
                        _this.currTilePackage = { imgs: _imgs, config: _config };
                        _this.neighborParse(_this.currTilePackage.config.neighbor);
                        _this.setView(_imgs);
                        for (var k in _this.viewTilesMap) {
                            var v = _this.viewTilesMap[k];
                            if (!v) {
                                continue;
                            }
                            v.active = _config.deactivate[EditorTools_js_1.getImgBaseName(v.resName)] != true;
                        }
                        if (_this.isSwitchMode) {
                            _this.allViewSelect(true);
                        }
                    };
                    var waitCount = 0;
                    var _loop_1 = function (i, len) {
                        var f = files.item(i);
                        var path = f["webkitRelativePath"];
                        if (!path) {
                            console.error("browser not suppor webkitRelativePath!");
                            return "break";
                        }
                        var pathSpArr = path.split("/");
                        if (pathSpArr.length > 2) {
                            return "continue";
                        }
                        if (!floderName) {
                            floderName = pathSpArr[0];
                        }
                        var arr = f.type.split("/");
                        var isImg = false;
                        if (arr[0] == "image") {
                            isImg = true;
                        }
                        else if (arr[1] == "json" && f.name == this_1.editorFile) {
                        }
                        else {
                            return "continue";
                        }
                        console.log(f);
                        var reader = new FileReader();
                        if (isImg) {
                            reader.readAsDataURL(f);
                        }
                        else {
                            reader.readAsText(f);
                        }
                        reader.onloadend = function (p) {
                            if (isImg) {
                                var str = this.result;
                                _imgs.push({ fileName: f.name, dataB64: str });
                            }
                            else {
                                _config = JSON.parse(this.result);
                            }
                            ckEnd();
                        };
                        waitCount++;
                    };
                    var this_1 = this;
                    for (var i = 0, len = files.length; i < len; i++) {
                        var state_1 = _loop_1(i, len);
                        if (state_1 === "break")
                            break;
                    }
                };
                Editor2DMap.prototype.onSelectImport = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var resName, basePath, _dataUrl, req, data, tileKeys, fileUrls, promiseArr, allReq, fList;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    resName = this.selectOptionEle.value;
                                    basePath = "../../res/samples/";
                                    _dataUrl = "" + basePath + resName + "/" + this.editorFile;
                                    return [4, EditorTools_js_1.xhrLoad(_dataUrl, "json")];
                                case 1:
                                    req = _a.sent();
                                    data = req.response;
                                    if (!data) {
                                        alert("\u6CA1\u627E\u5230 " + _dataUrl + "!");
                                        return [2];
                                    }
                                    if (!data.tiles) {
                                        alert("\u6CA1\u6709\u6570\u636E tiles!");
                                    }
                                    tileKeys = Object.keys(data.tiles);
                                    fileUrls = [];
                                    tileKeys.forEach(function (v) {
                                        fileUrls.push("" + basePath + resName + "/" + v + data.tiles[v][0]);
                                    });
                                    fileUrls.push(_dataUrl);
                                    promiseArr = [];
                                    fileUrls.forEach(function (v) {
                                        promiseArr.push(EditorTools_js_1.xhrLoad(v, "blob"));
                                    });
                                    return [4, Promise.all(promiseArr)];
                                case 2:
                                    allReq = _a.sent();
                                    fList = {
                                        length: allReq.length,
                                        item: function (idx) {
                                            return fList[idx];
                                        },
                                    };
                                    allReq.forEach(function (v, i) {
                                        var f = fList[i] = v.response;
                                        var url = fileUrls[i];
                                        var _idx = url.lastIndexOf("/");
                                        f.name = url.substring(_idx + 1);
                                        f.webkitRelativePath = "" + resName + f.name;
                                    });
                                    this.setDataByFileList(fList);
                                    return [2];
                            }
                        });
                    });
                };
                Editor2DMap.prototype.clearSelect = function () {
                    this.currSelectTiles.length = 0;
                    var cs = [];
                    for (var i = 0, len = this.selectEle.children.length; i < len; i++) {
                        cs.push(this.selectEle.children.item(i));
                    }
                    while (cs.length > 0) {
                        this.selectEle.removeChild(cs.pop());
                    }
                };
                Editor2DMap.prototype.clearVSEdges = function () {
                    for (var i = 0; i < 4; i++) {
                        var vsTile = this.vsTiles[i + 1];
                        vsTile.disableActiveCkbox();
                        vsTile.setImgUrl("");
                    }
                };
                Editor2DMap.prototype.clearView = function () {
                    var vrootElement = document.getElementById("tileVcont");
                    var arr = [];
                    for (var i = 0, len = vrootElement.children.length; i < len; i++) {
                        arr.push(vrootElement.children.item(i));
                    }
                    arr.forEach(function (v) {
                        vrootElement.removeChild(v);
                    });
                    this.viewTilesMap = {};
                    this.viewIdNameMap = {};
                    this.resNameImgMap = {};
                    this.ViewResNameIDMap = {};
                };
                Editor2DMap.prototype.clearAll = function () {
                    this.clearView();
                    this.clearSelect();
                    this.clearVSEdges();
                    this.vsTiles[0].setImgUrl("");
                };
                Editor2DMap.prototype.setSelectArr = function (data) {
                    var len = data.length;
                    var count = 0;
                    for (var i = 0; i < len; i++) {
                        var resName = this.viewIdNameMap[data[i]];
                        var _tileImg = this.resNameImgMap[resName];
                        var list = [0];
                        var cfgRlist = this.currTilePackage.config.tiles[EditorTools_js_1.getImgBaseName(resName)][2];
                        if (cfgRlist) {
                            list = list.concat(cfgRlist);
                        }
                        for (var j = 0, len1 = list.length; j < len1; j++) {
                            var r = list[j];
                            var t = this.genCellSelectTile(this.selectEle, count);
                            t.resName = _tileImg.fileName;
                            t.setImgUrl(_tileImg.dataB64);
                            t.onTileClick = this.onSelectTileClick.bind(this);
                            t.onTileOver = this.onSelectPointOver.bind(this);
                            t.onTileLeave = this.onSelectPointLeave.bind(this);
                            this.currSelectTiles.push(t);
                            t.setSelect(false);
                            t.rotateType = r;
                            count++;
                        }
                    }
                    this.selectEle.style.width = count * (this.size + this.gap) + "px";
                };
                Editor2DMap.prototype.onViewTileClick = function (t) {
                    console.log("onViewTileClick : " + t);
                    if (this.viewEditorModeEle.checked) {
                        if (this.isSwitchMode) {
                            t.setSelect(!t.isSelect);
                        }
                        else {
                            this.allViewSelect(false);
                            t.setSelect(!t.isSelect);
                            var resName = this.viewIdNameMap[t.getID()];
                            var onlyName = resName.substr(0, resName.length - 4);
                            var _conf = this.currTilePackage.config.tiles[onlyName];
                            var temp = _conf[2] ? _conf[2] : [];
                            this.setInfo(resName, _conf[1], temp);
                            var ev = { id: t.getID() };
                            EventManager_js_1.EventManager.dispatchEvent("view_editor", ev);
                        }
                    }
                    else {
                        t.active = !t.active;
                        var deactivate = this.currTilePackage.config.deactivate;
                        var imgBaseN = EditorTools_js_1.getImgBaseName(t.resName);
                        t.active ? delete deactivate[imgBaseN] : deactivate[imgBaseN] = true;
                        this.neighborDirty = true;
                    }
                };
                Editor2DMap.prototype.onSelectTileClick = function (t) {
                    this.currSelectTiles.forEach(function (val) {
                        if (val) {
                            val.setSelect(false);
                        }
                    });
                    t.setSelect(true);
                    this.currSelectTile = t;
                    var ev = { resName: t.resName, rotateType: t.rotateType };
                    EventManager_js_1.EventManager.dispatchEvent("select_editor", ev);
                };
                Editor2DMap.prototype.onSelectPointOver = function (t) {
                    var ev = { resName: t.resName, rotateType: t.rotateType };
                    EventManager_js_1.EventManager.dispatchEvent("select_over", ev);
                };
                Editor2DMap.prototype.onSelectPointLeave = function (t) {
                    EventManager_js_1.EventManager.dispatchEvent("select_over_leave", null);
                };
                Editor2DMap.prototype.onViewTileOver = function (t) {
                    console.log("onViewTileOver : " + t);
                };
                Editor2DMap.prototype.onBoderEnter = function (tile, edgeIdx) {
                    if (this.isSwitchMode) {
                        return;
                    }
                    tile.setBoderColor(edgeIdx, 1);
                    this.lightRightEdges(tile, edgeIdx);
                };
                Editor2DMap.prototype.onBoderLeave = function (tile, edgeIdx) {
                    if (this.isSwitchMode) {
                        return;
                    }
                    tile.setBoderColor(edgeIdx, 0);
                    this.offLightEdges();
                };
                Editor2DMap.prototype.offLightEdges = function () {
                    for (var k in this.viewTilesMap) {
                        var t = this.viewTilesMap[k];
                        for (var i = 0; i < 4; i++) {
                            t.setBoderColor(i, 0);
                        }
                    }
                };
                Editor2DMap.prototype.lightRightEdges = function (tile, edgeIdx) {
                    var _conf = this.currTilePackage.config = this.mergeConfig(this.currTilePackage.config);
                    var edge = EditorTools_js_1.getImgBaseName(tile.resName) + "_" + edgeIdx;
                    var connectId = _conf.connectIdL[edge];
                    var edges = [];
                    if (connectId != null) {
                        var rMap = _conf.connectIdR;
                        for (var k in rMap) {
                            if (rMap[k] == connectId) {
                                edges.push(k);
                            }
                        }
                    }
                    connectId = _conf.connectIdR[edge];
                    if (connectId != null) {
                        var lMap = _conf.connectIdL;
                        for (var k in lMap) {
                            if (lMap[k] == connectId) {
                                edges.push(k);
                            }
                        }
                    }
                    for (var i = 0, len = edges.length; i < len; i++) {
                        var v = edges[i];
                        if (v == edge) {
                            continue;
                        }
                        var baseName = v.substr(0, v.length - 2);
                        var _edgeIdx = Number(v.substr(v.length - 1));
                        var t = this.viewTilesMap[baseName];
                        if (t) {
                            t.setBoderColor(_edgeIdx, 2);
                        }
                    }
                };
                return Editor2DMap;
            }());
            exports_1("Editor2DMap", Editor2DMap);
        }
    };
});
//# sourceMappingURL=Editor2DMap.js.map