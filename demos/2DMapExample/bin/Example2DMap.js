System.register([], function (exports_1, context_1) {
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
    var Example2DMap;
    var __moduleName = context_1 && context_1.id;
    function xhrLoad(url, type) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.responseType = type;
            req.open("GET", url);
            req.send();
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        resolve(req);
                    }
                    else {
                        reject();
                    }
                }
            };
        });
    }
    return {
        setters: [],
        execute: function () {
            Example2DMap = (function () {
                function Example2DMap() {
                    this.currImgMap = {};
                    this.dataMap = {};
                    this.dataLoginMap = {};
                    this.wfc2dMap = {};
                    this.resLoaded = false;
                    this.toRadian = Math.PI / 180;
                    this.filesID = "";
                    this.isCalculateing = false;
                    this.init();
                }
                Example2DMap.prototype.init = function () {
                    console.log("init");
                    this.setUI();
                    this.initCanvas();
                    this.refrashCanvas();
                };
                Example2DMap.prototype.setUI = function () {
                    var _this = this;
                    this.fileEle = document.getElementById("selectFiles");
                    this.fileEle.onchange = this.onFileChange.bind(this);
                    this.selectOptionEle = document.getElementById("selectOption");
                    this.importFilesEle = document.getElementById("importFiles");
                    this.importFilesEle.onclick = this.onStart.bind(this);
                    this.importFilesEle.onclick(null);
                    this.tileSizeEle = document.getElementById("tilePixel");
                    this.tileXCountEle = document.getElementById("tileXCount");
                    this.tileXCountEle.onchange = function () {
                        _this.refrashCanvas();
                    };
                    this.tileYCountEle = document.getElementById("tileYCount");
                    this.tileYCountEle.onchange = function () {
                        _this.refrashCanvas();
                    };
                    this.backoffMaxEle = document.getElementById("backoffMax");
                    this.backoffQueueMaxEle = document.getElementById("backoffQueueMax");
                    this.backoffCapRateEle = document.getElementById("backoffCapRate");
                };
                Example2DMap.prototype.initCanvas = function () {
                    var canvas = this.canvasEle = document.getElementById("viewCanvas");
                    var context = this.context2D = canvas.getContext("2d");
                };
                Example2DMap.prototype.calculate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var samplesName, wfc2d, mapSizeX, mapSizeY, cSize, backoffMax, backoffQueueMax, capRate, imgMap, halfCSize, y, x, imgName, rotate, rot;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (this.isCalculateing) {
                                        return [2];
                                    }
                                    if (!this.resLoaded) {
                                        alert("resource is loading , wait.");
                                        return [2];
                                    }
                                    this.isCalculateing = true;
                                    samplesName = this.selectOptionEle.value;
                                    if (!samplesName) {
                                        samplesName = this.filesID;
                                    }
                                    wfc2d = this.wfc2dMap[samplesName];
                                    if (!wfc2d) {
                                        wfc2d = this.wfc2dMap[samplesName] = new WFC.WFC2D(this.currConfig);
                                    }
                                    mapSizeX = Number(this.tileXCountEle.value);
                                    mapSizeY = Number(this.tileYCountEle.value);
                                    cSize = Number(this.tileSizeEle.value);
                                    backoffMax = Number(this.backoffMaxEle.value);
                                    backoffQueueMax = Number(this.backoffQueueMaxEle.value);
                                    capRate = Number(this.backoffCapRateEle.value);
                                    return [4, wfc2d.collapse(mapSizeX, mapSizeY, backoffMax, backoffQueueMax, capRate)];
                                case 1:
                                    imgMap = _b.sent();
                                    halfCSize = cSize * 0.5;
                                    this.context2D.resetTransform();
                                    this.context2D.fillStyle = "#aaffff";
                                    this.context2D.fillRect(0, 0, cSize * mapSizeX, cSize * mapSizeY);
                                    for (y = 0; y < mapSizeY; y++) {
                                        for (x = 0; x < mapSizeX; x++) {
                                            imgName = void 0;
                                            rotate = void 0;
                                            _a = imgMap.shift(), imgName = _a[0], rotate = _a[1];
                                            this.context2D.resetTransform();
                                            rot = rotate * 90 * this.toRadian;
                                            this.context2D.translate(x * cSize + halfCSize, y * cSize + halfCSize);
                                            this.context2D.rotate(rot);
                                            this.context2D.translate(-halfCSize, -halfCSize);
                                            this.context2D.drawImage(this.currImgMap[imgName], 0, 0, cSize, cSize);
                                        }
                                    }
                                    this.isCalculateing = false;
                                    return [2];
                            }
                        });
                    });
                };
                Example2DMap.prototype.refrashCanvas = function () {
                    var mapSizeX = Number(this.tileXCountEle.value);
                    var mapSizeY = Number(this.tileYCountEle.value);
                    var cSize = Number(this.tileSizeEle.value);
                    this.canvasEle.width = cSize * mapSizeX;
                    this.canvasEle.height = cSize * mapSizeY;
                };
                Example2DMap.prototype.onStart = function () {
                    var samplesName = this.selectOptionEle.value;
                    if (samplesName) {
                        this.toLoadImport();
                    }
                    else if (this.currConfig && this.currImgMap) {
                        this.calculate();
                    }
                };
                Example2DMap.prototype.toLoadImport = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var samplesName, d, basePath, _dataUrl, req, data, cSize, imgPormies, _loop_1, this_1, k;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.resLoaded = false;
                                    samplesName = this.selectOptionEle.value;
                                    if (this.dataLoginMap[samplesName]) {
                                        return [2];
                                    }
                                    d = this.dataMap[samplesName];
                                    if (!d) return [3, 1];
                                    this.currConfig = d.config;
                                    this.currImgMap = d.imgMap;
                                    return [3, 4];
                                case 1:
                                    this.dataLoginMap[samplesName] = true;
                                    basePath = "../../res/samples/";
                                    _dataUrl = "" + basePath + samplesName + "/data.json";
                                    return [4, xhrLoad(_dataUrl, "json")];
                                case 2:
                                    req = _a.sent();
                                    data = req.response;
                                    if (!data) {
                                        alert("\u6CA1\u627E\u5230 " + _dataUrl + "!");
                                        return [2];
                                    }
                                    this.currConfig = data;
                                    cSize = Number(this.tileSizeEle.value);
                                    imgPormies = [];
                                    _loop_1 = function (k) {
                                        var _temp = data.tiles[k];
                                        var url = "" + basePath + samplesName + "/" + k + _temp[0];
                                        var img = new Image();
                                        img.width = img.height = cSize;
                                        img.src = url;
                                        this_1.currImgMap[k] = img;
                                        var loadPormise = new Promise(function (resolve, reject) {
                                            img.onload = resolve;
                                            img.onerror = reject;
                                        });
                                        imgPormies.push(loadPormise);
                                    };
                                    this_1 = this;
                                    for (k in data.tiles) {
                                        _loop_1(k);
                                    }
                                    return [4, Promise.all(imgPormies)];
                                case 3:
                                    _a.sent();
                                    this.dataMap[samplesName] = { config: this.currConfig, imgMap: this.currImgMap };
                                    delete this.dataLoginMap[samplesName];
                                    _a.label = 4;
                                case 4:
                                    this.resLoaded = true;
                                    this.calculate();
                                    return [2];
                            }
                        });
                    });
                };
                Example2DMap.prototype.onFileChange = function (ev) {
                    var files = this.fileEle.files;
                    this.setDataByFileList(files);
                };
                Example2DMap.prototype.setDataByFileList = function (fileL) {
                    var _this = this;
                    this.resLoaded = false;
                    var files = fileL;
                    var _imgMap = {};
                    var _config;
                    var floderName = "";
                    var ckEnd = function () {
                        _this.resLoaded = true;
                        waitCount--;
                        if (waitCount > 0) {
                            return;
                        }
                        console.log("file \u52A0\u8F7D\u5B8C\u6BD5");
                        if (!_config) {
                            alert("get config by data.json fial!");
                            return;
                        }
                        _this.currConfig = _config;
                        _this.currImgMap = _imgMap;
                        _this.selectOptionEle.value = "";
                    };
                    var cSize = Number(this.tileSizeEle.value);
                    var waitCount = 0;
                    var filesID = "";
                    var _loop_2 = function (i, len) {
                        var f = files.item(i);
                        filesID += f.name;
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
                        else if (arr[1] == "json" && f.name == "data.json") {
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
                                var _name = f.name.substring(0, f.name.length - 4);
                                var _img = _imgMap[_name] = new Image();
                                _img.width = _img.height = cSize;
                                _img.src = str;
                            }
                            else {
                                _config = JSON.parse(this.result);
                            }
                            ckEnd();
                        };
                        waitCount++;
                    };
                    for (var i = 0, len = files.length; i < len; i++) {
                        var state_1 = _loop_2(i, len);
                        if (state_1 === "break")
                            break;
                    }
                    this.filesID = filesID;
                };
                return Example2DMap;
            }());
            exports_1("Example2DMap", Example2DMap);
        }
    };
});
//# sourceMappingURL=Example2DMap.js.map