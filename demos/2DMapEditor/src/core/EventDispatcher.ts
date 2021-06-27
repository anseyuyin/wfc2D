export class EventDispatcher {
    private events: { [eType: string]: { callers: any[]; cfun(): any; }[] } = {};
    /**
     * 监听事件添加
     * @param eventType 事件类型
     * @param _cfun 事件触发回调方法 (Warn: 不要使用 func.bind() , 它会导致相等判断失败)
     * @param caller 回调方法执行者
     */
    public on(eventType: string, _cfun: (...args: any[]) => void, caller: any) {
        let eArr = this.events[eventType];
        let tempft: { callers: any[]; cfun(): any; } = null;
        if (!eArr) {
            eArr = this.events[eventType] = [];
        } else {
            for (let ft of eArr) {
                if (ft.cfun == _cfun) {
                    tempft = ft;
                    break;
                }
            }
        }

        if (!tempft) {
            eArr.push({ cfun: _cfun, callers: [caller] });
        } else {
            let idx = tempft.callers.lastIndexOf(caller);
            if (idx == -1) {
                tempft.callers.push(caller);
            }
        }
    }

    /**
     * 使用 EventDispatcher 对象注册指定类型，响应一次后自动移除。
     */
    public Once() {
        return null;
    }
    /**
     * 发出事件
     * @param eventType 事件类型
     * @param args 传递参数
     * @returns 如果有侦听者则值为 true，否则值为 false。
     */
    public dispatch(eventType: string, ...args: any[]): boolean {
        let arr = this.events[eventType];
        if (!arr) {
            return false;
        }
        for (let fT of arr) {
            for (let thisArg of fT.callers) {
                fT.cfun.apply(thisArg, args);
            }
        }
        return true;
    }

    /**
     * 移除事件监听者
     * @param eventType 事件类型
     * @param cFun 事件触发回调方法
     * @param caller 回调方法执行者
     */
    public off(eventType: string, cFun: () => any, caller: any) {
        let arr = this.events[eventType];
        if (!arr) {
            return;
        }
        for (let i = 0, len = arr.length; i < len; ++i) {
            if (cFun == arr[i].cfun) {
                let idx = arr[i].callers.lastIndexOf(caller);
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
    }

    /**
     * 移除所有监听者
     */
    public offAll() {
        this.events = {};
    }

    /**
     * 指定事件监听者的数量
     */
    public listenerCount(eventType: string) {
        return this.events[eventType] ? this.events[eventType].length : 0;
    }
}