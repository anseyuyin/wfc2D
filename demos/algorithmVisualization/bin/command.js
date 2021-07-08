System.register([], function (exports_1, context_1) {
    "use strict";
    var StateData, RectSetCommand, BatchCommand, CommandMgr;
    var __moduleName = context_1 && context_1.id;
    function setState(ehtml, color, g, h) {
        if (g === void 0) { g = -1; }
        if (h === void 0) { h = -1; }
        var sta = new StateData(color, g, h);
        CommandMgr.Instance.execute(new RectSetCommand(ehtml, sta));
    }
    exports_1("setState", setState);
    function batState(States) {
        var batc = new BatchCommand();
        States.forEach(function (sub) {
            var sta = new StateData(sub.color, sub.g, sub.h);
            batc.addComd(new RectSetCommand(sub.ehtml, sta));
        });
        CommandMgr.Instance.execute(batc);
    }
    exports_1("batState", batState);
    return {
        setters: [],
        execute: function () {
            StateData = (function () {
                function StateData(color, g, h) {
                    if (g === void 0) { g = 0; }
                    if (h === void 0) { h = 0; }
                    this.color = color;
                    this.g = g;
                    this.h = h;
                }
                return StateData;
            }());
            exports_1("StateData", StateData);
            RectSetCommand = (function () {
                function RectSetCommand(htmle, sta) {
                    this.htmle = htmle;
                    this.sta = sta;
                    var _g = this.htmle.getElementsByClassName("class_g")[0];
                    var _h = this.htmle.getElementsByClassName("class_h")[0];
                    this.lastSta = new StateData(htmle.style.background, Number(_g.textContent), Number(_h.textContent));
                }
                RectSetCommand.prototype.execute = function () {
                    this.htmle.style.background = this.sta.color;
                    var fText = this.htmle.getElementsByClassName("class_f")[0];
                    var gText = this.htmle.getElementsByClassName("class_g")[0];
                    var hText = this.htmle.getElementsByClassName("class_h")[0];
                    fText.textContent = "" + (this.sta.g + this.sta.h);
                    gText.textContent = "" + this.sta.g;
                    hText.textContent = "" + this.sta.h;
                    fText.style.display = this.sta.g + this.sta.h < 0 ? "none" : "";
                    gText.style.display = this.sta.g < 0 ? "none" : "";
                    hText.style.display = this.sta.h < 0 ? "none" : "";
                };
                RectSetCommand.prototype.undo = function () {
                    this.htmle.style.background = this.lastSta.color;
                    var fText = this.htmle.getElementsByClassName("class_f")[0];
                    var gText = this.htmle.getElementsByClassName("class_g")[0];
                    var hText = this.htmle.getElementsByClassName("class_h")[0];
                    fText.textContent = "" + (this.lastSta.g + this.lastSta.h);
                    gText.textContent = "" + this.lastSta.g;
                    hText.textContent = "" + this.lastSta.h;
                    fText.style.display = this.lastSta.g + this.lastSta.h < 0 ? "none" : "";
                    gText.style.display = this.lastSta.g < 0 ? "none" : "";
                    hText.style.display = this.lastSta.h < 0 ? "none" : "";
                };
                return RectSetCommand;
            }());
            exports_1("RectSetCommand", RectSetCommand);
            BatchCommand = (function () {
                function BatchCommand() {
                    this.comds = [];
                }
                BatchCommand.prototype.addComd = function (comd) {
                    this.comds.push(comd);
                };
                BatchCommand.prototype.execute = function () {
                    this.comds.forEach(function (element) {
                        if (element) {
                            element.execute();
                        }
                    });
                };
                BatchCommand.prototype.undo = function () {
                    this.comds.forEach(function (element) {
                        if (element) {
                            element.undo();
                        }
                    });
                };
                return BatchCommand;
            }());
            exports_1("BatchCommand", BatchCommand);
            CommandMgr = (function () {
                function CommandMgr() {
                    this.currIdx = -1;
                    this.coms = [];
                }
                Object.defineProperty(CommandMgr, "Instance", {
                    get: function () {
                        if (!this._instance) {
                            this._instance = new CommandMgr();
                            document["commandMgr"] = this._instance;
                        }
                        return this._instance;
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(CommandMgr.prototype, "index", {
                    get: function () { return this.currIdx; },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(CommandMgr.prototype, "length", {
                    get: function () { return this.coms.length; },
                    enumerable: false,
                    configurable: true
                });
                CommandMgr.prototype.execute = function (com) {
                    if (!com) {
                        return;
                    }
                    this.coms.push(com);
                    com.execute();
                    this.currIdx = this.coms.length - 1;
                };
                CommandMgr.prototype.undo = function () {
                    if (this.currIdx < 0) {
                        return;
                    }
                    var com = this.coms[this.currIdx];
                    if (!com) {
                        return;
                    }
                    com.undo();
                    this.currIdx--;
                };
                CommandMgr.prototype.recovery = function () {
                    if (this.currIdx >= this.coms.length - 1) {
                        return;
                    }
                    this.currIdx++;
                    var com = this.coms[this.currIdx];
                    if (!com) {
                        return;
                    }
                    com.execute();
                };
                CommandMgr.prototype.clear = function () {
                    this.coms.length = 0;
                    this.currIdx = -1;
                };
                return CommandMgr;
            }());
            exports_1("CommandMgr", CommandMgr);
        }
    };
});
//# sourceMappingURL=command.js.map