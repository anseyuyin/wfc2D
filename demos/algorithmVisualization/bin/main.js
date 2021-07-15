System.register(["./command.js"], function (exports_1, context_1) {
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
    var command_js_1, CType, greyImgUrl, mapTemp, commandTileImg, commandTileColor, Main;
    var __moduleName = context_1 && context_1.id;
    function loadJson(path) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", path);
            xhr.send(null);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200 || xhr.status == 0) {
                        resolve(xhr.responseText);
                    }
                }
            };
            xhr.onerror = function (ev) {
                reject();
            };
        });
    }
    function setText(own, testColor, className, type) {
        var subfont = document.createElement("font");
        subfont.style.position = "absolute";
        subfont.style.color = testColor;
        subfont.size = "0.3";
        subfont.textContent = "-1";
        subfont.style.display = "none";
        subfont.className = className;
        switch (type) {
            case 0:
                subfont.style.right = "50%";
                subfont.style.top = "0px";
                subfont.size = "0.5";
                break;
            case 1:
                subfont.style.left = "0px";
                subfont.style.bottom = "0px";
                break;
            case 2:
                subfont.style.right = "0px";
                subfont.style.bottom = "0px";
                break;
            default: var a = void 0;
        }
        own.appendChild(subfont);
    }
    return {
        setters: [
            function (command_js_1_1) {
                command_js_1 = command_js_1_1;
            }
        ],
        execute: function () {
            (function (CType) {
                CType[CType["entropy"] = 0] = "entropy";
                CType[CType["tile"] = 1] = "tile";
                CType[CType["state"] = 2] = "state";
            })(CType || (CType = {}));
            greyImgUrl = "../../../../res/info/grey.png";
            mapTemp = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
            commandTileImg = (function () {
                function commandTileImg(tile, targetSrc, transform) {
                    this.tile = tile;
                    this.targetSrc = targetSrc;
                    this.tarTransform = transform;
                    this.lastSrc = this.tile.src;
                    this.lastTransform = this.tile.style.transform;
                    this.tile = tile;
                }
                commandTileImg.prototype.execute = function () {
                    this.tile.src = this.targetSrc;
                    this.tile.style.transform = this.tarTransform;
                };
                commandTileImg.prototype.undo = function () {
                    this.tile.src = this.lastSrc;
                    this.tile.style.transform = this.lastTransform;
                };
                return commandTileImg;
            }());
            commandTileColor = (function () {
                function commandTileColor() {
                }
                commandTileColor.prototype.execute = function () {
                    throw new Error("Method not implemented.");
                };
                commandTileColor.prototype.undo = function () {
                    throw new Error("Method not implemented.");
                };
                return commandTileColor;
            }());
            Main = (function () {
                function Main() {
                    this.resPath = "../../../../res/samples/";
                    this.smpleName = "test";
                    this.rootContain = document.getElementById("rootcont");
                    this.slideBar = document.getElementById("play_sb");
                    this.btnLeft = document.getElementById("btn_left");
                    this.btnCenter = document.getElementById("btn_center");
                    this.btnRight = document.getElementById("btn_right");
                    this.btnGenerate = document.getElementById("btn_generate");
                    this.tilesViewEle = document.getElementById("tiles_view");
                    this.timeRate = 1000;
                    this.slideRangeMax = 10000;
                    this.DivMap = {};
                    this.colorOpen = "#7777aa";
                    this.colorClose = "#aa7777";
                    this.colorMinSelect = "#77aa77";
                    this.color0 = "#dddddd";
                    this.color1 = "#555555";
                    this.mapSize = mapTemp.length;
                    this.size = 40;
                    this.gap = 1;
                    this.lastTime = -1;
                    this.playSpeed = 1;
                    this.progressNum = 0;
                    this._isStop = false;
                    this.lastPerc = -1;
                    this.init();
                }
                Object.defineProperty(Main.prototype, "isStop", {
                    get: function () { return this._isStop; },
                    set: function (v) {
                        this._isStop = v;
                        if (this.btnCenter) {
                            this.btnCenter.value = v ? "▷" : "||";
                        }
                    },
                    enumerable: false,
                    configurable: true
                });
                Main.prototype.playFun_Smooth = function () {
                    if (this.isStop) {
                        return;
                    }
                    var cInst = command_js_1.CommandMgr.Instance;
                    var delta = (Date.now() / this.timeRate) - this.lastTime;
                    this.progressNum += delta * this.slideRangeMax / (cInst.length * this.playSpeed * 0.3);
                    this.progressNum = this.progressNum > this.slideRangeMax ? this.slideRangeMax : this.progressNum;
                    if (this.progressNum < this.slideRangeMax) {
                        requestAnimationFrame(this.playFun_Smooth.bind(this));
                    }
                    this.commandsMoveByPercent(this.progressNum / this.slideRangeMax);
                    this.slideBar.value = this.progressNum.toString();
                    this.lastTime = Date.now() / this.timeRate;
                };
                Main.prototype.autoPlay = function () {
                    this.isStop = false;
                    this.lastTime = Date.now() / this.timeRate;
                    this.playFun_Smooth();
                };
                Main.prototype.adjustSlideByComLen = function () {
                    this.progressNum = (command_js_1.CommandMgr.Instance.index + 1) / command_js_1.CommandMgr.Instance.length * this.slideRangeMax;
                    this.slideBar.value = this.progressNum.toString();
                };
                Main.prototype.commandsMoveByPercent = function (_perc) {
                    var perc = _perc;
                    if (this.lastPerc == perc) {
                        return;
                    }
                    perc = perc < 0 ? 0 : perc > 1 ? 1 : perc;
                    var num = command_js_1.CommandMgr.Instance.index + 1;
                    var len = command_js_1.CommandMgr.Instance.length;
                    if (perc == num / len) {
                        return;
                    }
                    var temp = perc - num / len;
                    var f = Math.floor(Math.abs(temp * len));
                    for (var i = 0; i < f; i++) {
                        if (temp > 0) {
                            command_js_1.CommandMgr.Instance.recovery();
                        }
                        else {
                            command_js_1.CommandMgr.Instance.undo();
                        }
                    }
                    if (perc == 1) {
                        command_js_1.CommandMgr.Instance.recovery();
                    }
                    this.lastPerc = perc;
                };
                Main.prototype.colorByNum = function (num) {
                    switch (num) {
                        case 0: return this.colorClose;
                        case 1: return this.colorOpen;
                        case 2: return this.colorMinSelect;
                        default: return null;
                    }
                };
                Main.prototype.init = function () {
                    var _this = this;
                    this.testImmutable();
                    this.slideBar.onmousedown = this.slideBar.ontouchstart = function () {
                        _this.isStop = true;
                    };
                    this.slideBar.onchange = function () {
                        _this.progressNum = Number(_this.slideBar.value);
                        var perp = Number(_this.slideBar.value) / _this.slideRangeMax;
                        _this.commandsMoveByPercent(perp);
                    };
                    this.slideBar.oninput = function () {
                        _this.progressNum = Number(_this.slideBar.value);
                        var perp = Number(_this.slideBar.value) / _this.slideRangeMax;
                        _this.commandsMoveByPercent(perp);
                    };
                    this.btnCenter.onclick = function () {
                        if (_this.isStop) {
                            _this.autoPlay();
                        }
                        else {
                            _this.isStop = true;
                        }
                    };
                    this.btnLeft.onclick = function () {
                        _this.isStop = true;
                        command_js_1.CommandMgr.Instance.undo();
                        _this.adjustSlideByComLen();
                    };
                    this.btnRight.onclick = function () {
                        _this.isStop = true;
                        command_js_1.CommandMgr.Instance.recovery();
                        _this.adjustSlideByComLen();
                    };
                    this.btnGenerate.onclick = function () {
                        var data = _this.getWFC2DData();
                        _this.toGenerateMap(data);
                    };
                    var _iframe = document.createElement("iframe");
                    _iframe.style.width = "100%";
                    _iframe.style.height = "500px";
                    _iframe.src = "../2DMapEditor/index.html?swMode=1";
                    this.tilesViewEle.appendChild(_iframe);
                    _iframe.onload = function () {
                        _iframe.contentDocument["onEditorInited"] = function () {
                            _this.tileViewObj = _iframe.contentDocument["__wfc2dEdt__"];
                        };
                    };
                };
                Main.prototype.getWFC2DData = function () {
                    var tvObj = this.tileViewObj;
                    if (!tvObj) {
                        return;
                    }
                    var currCfg = tvObj.mergeConfig(tvObj.currTilePackage.config);
                    var arr = [];
                    for (var key in tvObj.viewTilesMap) {
                        var val = tvObj.viewTilesMap[key];
                        if (!val || val.isSelect) {
                            continue;
                        }
                        for (var i = 0; i < 4; i++) {
                            arr.push(key + "_" + i);
                        }
                    }
                    while (arr.length > 0) {
                        var k = arr.pop();
                        delete currCfg.connectIdL[k];
                        delete currCfg.connectIdR[k];
                    }
                    return currCfg;
                };
                Main.prototype.toGenerateMap = function (_data) {
                    return __awaiter(this, void 0, void 0, function () {
                        var data, tileImgRotates, _loop_1, key, wfc, proccessData, wfcResult, imgEleArr, imgs, imgBas64, key, val, baseName, y, li, x, imgName, rotate, resN, texturePath, imgEle, commandArr, i, len, pV, _com, imgSrc, rtype, temp, i, len;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    data = _data;
                                    tileImgRotates = [];
                                    _loop_1 = function (key) {
                                        var _rTypes = data.tiles[key][2];
                                        var arr = [0].concat(_rTypes);
                                        arr.forEach(function (v) {
                                            tileImgRotates.push([key, v]);
                                        });
                                    };
                                    for (key in data.tiles) {
                                        _loop_1(key);
                                    }
                                    wfc = new WFC.WFC2D(data);
                                    proccessData = [];
                                    WFC["onProcess"] = function (pos, ctype, value) {
                                        proccessData.push({ pos: pos, ctype: ctype, value: value });
                                    };
                                    return [4, wfc.collapse(this.mapSize, this.mapSize)];
                                case 1:
                                    wfcResult = _b.sent();
                                    imgEleArr = [];
                                    imgs = this.tileViewObj.currTilePackage.imgs;
                                    imgBas64 = {};
                                    for (key in imgs) {
                                        val = imgs[key];
                                        baseName = "" + val.fileName.slice(0, val.fileName.length - 4);
                                        imgBas64[baseName] = val.dataB64;
                                    }
                                    this.rootContain.style.width = this.rootContain.style.height = this.mapSize * (this.size + this.gap) - this.gap + "px";
                                    for (y = 0; y < this.mapSize; y++) {
                                        li = document.createElement("li");
                                        li.style.display = "flex";
                                        li.style.position = "relative";
                                        li.style.height = this.size + "px";
                                        li.style.width = this.rootContain.style.width;
                                        li.style.top = y * this.gap + "px";
                                        this.rootContain.appendChild(li);
                                        for (x = 0; x < this.mapSize; x++) {
                                            imgName = void 0;
                                            rotate = void 0;
                                            _a = wfcResult.shift(), imgName = _a[0], rotate = _a[1];
                                            resN = imgName;
                                            texturePath = imgBas64[resN];
                                            imgEle = document.createElement("img");
                                            imgEle.src = greyImgUrl;
                                            imgEleArr.push(imgEle);
                                            this.genCell(li, x, y, imgEle);
                                        }
                                    }
                                    commandArr = [];
                                    for (i = 0, len = proccessData.length; i < len; i++) {
                                        pV = proccessData[i];
                                        if (pV.value == -1) {
                                            debugger;
                                        }
                                        _com = void 0;
                                        switch (pV.ctype) {
                                            case CType.tile:
                                                imgSrc = greyImgUrl;
                                                rtype = 0;
                                                if (pV.value != -1) {
                                                    temp = tileImgRotates[pV.value];
                                                    imgSrc = imgBas64[temp[0]];
                                                    rtype = temp[1];
                                                }
                                                _com = new commandTileImg(imgEleArr[pV.pos], imgSrc, "rotate(" + rtype * 90 + "deg)");
                                                break;
                                            case CType.entropy:
                                                break;
                                            case CType.state:
                                                break;
                                            default:
                                        }
                                        if (_com) {
                                            commandArr.push(_com);
                                        }
                                    }
                                    for (i = 0, len = commandArr.length; i < len; i++) {
                                        command_js_1.CommandMgr.Instance.execute(commandArr[i]);
                                    }
                                    return [2];
                            }
                        });
                    });
                };
                Main.prototype.genCell = function (li, x, y, imgEle) {
                    var subDiv = document.createElement("div");
                    subDiv.style.position = "relative";
                    subDiv.style.width = this.size + "px";
                    subDiv.style.height = this.size + "px";
                    subDiv.style.left = x * this.gap + "px";
                    subDiv.style.background = mapTemp[y][x] == 0 ? this.color0 : this.color1;
                    li.appendChild(subDiv);
                    var _img = imgEle;
                    _img.style.width = this.size + "px";
                    _img.style.height = this.size + "px";
                    subDiv.appendChild(_img);
                    setText(subDiv, "#ffff00", "class_f", 0);
                    setText(subDiv, "#00ff00", "class_g", 1);
                    setText(subDiv, "#ff0000", "class_h", 2);
                    this.DivMap[x + "_" + y] = subDiv;
                    subDiv["pos"] = { x: x, y: y };
                };
                Main.prototype.testImmutable = function () {
                    var list = Immutable.List([1, 2, 3]);
                    console.log("list : " + list.toArray()
                        .toString());
                    var list2 = list.delete(1);
                    console.log("list : " + list.toArray()
                        .toString());
                    console.log("list2 : " + list2.toArray()
                        .toString());
                };
                return Main;
            }());
            exports_1("Main", Main);
            new Main();
        }
    };
});
//# sourceMappingURL=main.js.map