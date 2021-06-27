System.register([], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var whiteImg, Tile, TileView, TileSelect;
    var __moduleName = context_1 && context_1.id;
    function makeStyle(ele, w, h, bgColor, position, border) {
        if (bgColor === void 0) { bgColor = "#ffffff"; }
        if (position === void 0) { position = "relative"; }
        if (border === void 0) { border = "none"; }
        ele.style.width = w + "px";
        ele.style.height = h + "px";
        ele.style.background = bgColor;
        ele.style.position = position;
        ele.style.border = border;
    }
    return {
        setters: [],
        execute: function () {
            whiteImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAySURBVFhH7c0xAQAwEAOh+jeduuCXwwBvR4qZYqaYKWaKmWKmmClmiplippgpZoqR7QMs0K5PppfCWAAAAABJRU5ErkJggg==";
            Tile = (function () {
                function Tile(size, parent, edgeSize) {
                    var _this = this;
                    if (edgeSize === void 0) { edgeSize = 4; }
                    this.bgFrameColor = "#ff4488ff";
                    this._id = -1;
                    this._rotateType = 0;
                    this._isSelect = false;
                    this._active = true;
                    this._isEnableckbox = false;
                    this._edgeSize = edgeSize;
                    this._id = Tile.IDCount++;
                    this._size = size;
                    var ele = this.htmlEleRoot = document.createElement("div");
                    makeStyle(ele, size, size, "#ffffff00");
                    parent.appendChild(ele);
                    ele.onclick = function () {
                        if (_this.onTileClick) {
                            _this.onTileClick(_this);
                        }
                    };
                    ele.onpointerover = function () {
                        if (_this.onTileOver) {
                            _this.onTileOver(_this);
                        }
                    };
                    ele.onpointerleave = function () {
                        if (_this.onTileLeave) {
                            _this.onTileLeave(_this);
                        }
                    };
                    this.bgFrame = document.createElement("div");
                    makeStyle(this.bgFrame, size, size, "#ffffff00", "absolute");
                    ele.appendChild(this.bgFrame);
                    this.img = document.createElement("img");
                    var imgSize = this._size - this._edgeSize * 2;
                    makeStyle(this.img, imgSize, imgSize, "#ffffff99", "absolute");
                    ele.appendChild(this.img);
                    this.img.style.left = this.img.style.top = this._edgeSize + "px";
                }
                Object.defineProperty(Tile.prototype, "isSelect", {
                    get: function () { return this._isSelect; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Tile.prototype, "rotateType", {
                    get: function () {
                        return this._rotateType;
                    },
                    set: function (rotateType) {
                        this._rotateType = rotateType;
                        this.img.style.transform = "rotate(" + rotateType * 90 + "deg)";
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(Tile.prototype, "resName", {
                    get: function () {
                        return this._resName;
                    },
                    set: function (val) {
                        this._resName = val;
                    },
                    enumerable: false,
                    configurable: true
                });
                Tile.prototype.getID = function () {
                    return this._id;
                };
                Object.defineProperty(Tile.prototype, "active", {
                    get: function () { return this._active; },
                    set: function (val) {
                        this._active = val;
                        this.img.style.filter = val ? "none" : "grayscale(100%)";
                        if (this.activeCKbox) {
                            this.activeCKbox.checked = val;
                        }
                    },
                    enumerable: false,
                    configurable: true
                });
                Tile.prototype.setSelect = function (select) {
                    this._isSelect = select;
                    this.bgFrame.style.background = this._isSelect ? this.bgFrameColor : "#ffffff00";
                };
                Tile.prototype.setImgUrl = function (_src) {
                    var src = _src;
                    if (!src) {
                        src = whiteImg;
                    }
                    this.img.src = src;
                };
                Tile.prototype.setBGFrameColor = function (color) {
                    this.bgFrameColor = color;
                };
                Tile.prototype.disableActiveCkbox = function () {
                    if (!this._isEnableckbox) {
                        return;
                    }
                    this._isEnableckbox = false;
                    this.activeCKbox.parentElement.removeChild(this.activeCKbox);
                    this.activeCKbox.checked = true;
                    this.activeCKbox.onchange(null);
                    this.activeCKbox = null;
                };
                Tile.prototype.enableActiveCkbox = function () {
                    var _this = this;
                    if (this._isEnableckbox) {
                        return;
                    }
                    this._isEnableckbox = true;
                    var activeCKbox = this.activeCKbox = document.createElement("input");
                    activeCKbox.type = "checkbox";
                    activeCKbox.style.right = "0px";
                    activeCKbox.style.position = "absolute";
                    activeCKbox.style.width = activeCKbox.style.height = "20px";
                    activeCKbox.onclick = this.onclickActiveCheckbox.bind(this);
                    this.htmlEleRoot.appendChild(activeCKbox);
                    activeCKbox.style.display = "none";
                    activeCKbox.checked = true;
                    var imgOver = false;
                    var activeCKboxOver = false;
                    var ckVisible = function () {
                        activeCKbox.style.display = imgOver || activeCKboxOver ? "" : "none";
                    };
                    this.img.onpointerleave = function () {
                        imgOver = false;
                        ckVisible();
                    };
                    this.img.onpointerenter = function () {
                        imgOver = true;
                        ckVisible();
                    };
                    activeCKbox.onpointerleave = function () {
                        activeCKboxOver = false;
                        ckVisible();
                    };
                    activeCKbox.onpointerenter = function () {
                        activeCKboxOver = true;
                        ckVisible();
                    };
                    activeCKbox.onchange = function (e) {
                        _this.active = activeCKbox.checked;
                        if (e != null && _this.onActiveCkboxChange) {
                            _this.onActiveCkboxChange(_this);
                        }
                    };
                };
                Tile.prototype.onclickActiveCheckbox = function () {
                };
                Tile.IDCount = 0;
                return Tile;
            }());
            exports_1("Tile", Tile);
            TileView = (function (_super) {
                __extends(TileView, _super);
                function TileView(size, root) {
                    var _this = _super.call(this, size, root) || this;
                    _this.edges = [];
                    _this.eleTop = document.createElement("div");
                    _this.eleRight = document.createElement("div");
                    _this.eleBottom = document.createElement("div");
                    _this.eleLeft = document.createElement("div");
                    var list = _this.edges = [_this.eleRight, _this.eleTop, _this.eleLeft, _this.eleBottom];
                    var bw = 10;
                    var bh = size - bw * 2;
                    list.forEach(function (val, i) {
                        var w = i % 2 ? size : bw;
                        var h = i % 2 ? bw : size;
                        makeStyle(val, w, h, TileView.colorList[0], "absolute");
                        if (i == 0) {
                            val.style.left = size - bw + "px";
                        }
                        if (i == 3) {
                            val.style.top = size - bw + "px";
                        }
                        _this.htmlEleRoot.appendChild(val);
                        val.onpointerenter = function (ev) {
                            if (_this.onBoderEnter) {
                                _this.onBoderEnter(_this, i);
                            }
                        };
                        val.onpointerleave = function (ev) {
                            if (_this.onBoderLeave) {
                                _this.onBoderLeave(_this, i);
                            }
                        };
                        val.onclick = function (ev) {
                            ev.cancelBubble = true;
                        };
                    });
                    return _this;
                }
                TileView.prototype.setBoderColor = function (edgeIdx, colorType) {
                    var idx = colorType < 0 ? 0 : colorType > TileView.colorList.length - 1 ? TileView.colorList.length - 1 : colorType;
                    this.edges[edgeIdx].style.background = TileView.colorList[idx];
                };
                TileView.colorList = ["#00000000", "#ffff3399", "#33aaff99"];
                return TileView;
            }(Tile));
            exports_1("TileView", TileView);
            TileSelect = (function (_super) {
                __extends(TileSelect, _super);
                function TileSelect(size, root) {
                    var _this = _super.call(this, size, root) || this;
                    _this.bgFrameColor = "#8844ffff";
                    return _this;
                }
                return TileSelect;
            }(Tile));
            exports_1("TileSelect", TileSelect);
        }
    };
});
//# sourceMappingURL=TileBase.js.map