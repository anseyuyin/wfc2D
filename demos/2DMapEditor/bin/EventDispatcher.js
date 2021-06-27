System.register([], function (exports_1, context_1) {
    "use strict";
    var EventDispatcher;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            EventDispatcher = (function () {
                function EventDispatcher() {
                    this.events = {};
                }
                EventDispatcher.prototype.on = function (eventType, _cfun, caller) {
                    var eArr = this.events[eventType];
                    var tempft = null;
                    if (!eArr) {
                        eArr = this.events[eventType] = [];
                    }
                    else {
                        for (var _i = 0, eArr_1 = eArr; _i < eArr_1.length; _i++) {
                            var ft = eArr_1[_i];
                            if (ft.cfun == _cfun) {
                                tempft = ft;
                                break;
                            }
                        }
                    }
                    if (!tempft) {
                        eArr.push({ cfun: _cfun, callers: [caller] });
                    }
                    else {
                        var idx = tempft.callers.lastIndexOf(caller);
                        if (idx == -1) {
                            tempft.callers.push(caller);
                        }
                    }
                };
                EventDispatcher.prototype.Once = function () {
                    return null;
                };
                EventDispatcher.prototype.dispatch = function (eventType) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var arr = this.events[eventType];
                    if (!arr) {
                        return false;
                    }
                    for (var _a = 0, arr_1 = arr; _a < arr_1.length; _a++) {
                        var fT = arr_1[_a];
                        for (var _b = 0, _c = fT.callers; _b < _c.length; _b++) {
                            var thisArg = _c[_b];
                            fT.cfun.apply(thisArg, args);
                        }
                    }
                    return true;
                };
                EventDispatcher.prototype.off = function (eventType, cFun, caller) {
                    var arr = this.events[eventType];
                    if (!arr) {
                        return;
                    }
                    for (var i = 0, len = arr.length; i < len; ++i) {
                        if (cFun == arr[i].cfun) {
                            var idx = arr[i].callers.lastIndexOf(caller);
                            if (idx != -1) {
                                arr[i].callers.splice(idx, 1);
                                if (arr[i].callers.length < 1) {
                                    arr.splice(i, 1);
                                }
                                if (arr.length < 1) {
                                    delete this.events[eventType];
                                }
                                break;
                            }
                        }
                    }
                };
                EventDispatcher.prototype.offAll = function () {
                    this.events = {};
                };
                EventDispatcher.prototype.listenerCount = function (eventType) {
                    return this.events[eventType] ? this.events[eventType].length : 0;
                };
                return EventDispatcher;
            }());
            exports_1("EventDispatcher", EventDispatcher);
        }
    };
});
//# sourceMappingURL=EventDispatcher.js.map