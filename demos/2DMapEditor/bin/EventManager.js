System.register(["./EventDispatcher.js"], function (exports_1, context_1) {
    "use strict";
    var EventDispatcher_js_1, EventManager;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (EventDispatcher_js_1_1) {
                EventDispatcher_js_1 = EventDispatcher_js_1_1;
            }
        ],
        execute: function () {
            EventManager = (function () {
                function EventManager() {
                }
                EventManager.dispatchEvent = function (eventType, ev) {
                    this.eventDisp.dispatch(eventType, ev);
                };
                EventManager.addListener = function (eventType, listener, thisArg) {
                    this.eventDisp.on(eventType, listener, thisArg);
                };
                EventManager.removeListener = function (eventType, listener, thisArg) {
                    this.eventDisp.off(eventType, listener, thisArg);
                };
                EventManager.eventDisp = new EventDispatcher_js_1.EventDispatcher();
                return EventManager;
            }());
            exports_1("EventManager", EventManager);
        }
    };
});
//# sourceMappingURL=EventManager.js.map