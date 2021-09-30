
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class Eventer {
    private events: { [event: string]: Array<{ func: Function, thisArgs: Array<any> }> } = {};
    /**
     * 监听事件添加
     * @param event 事件类型
     * @param func 事件触发回调方法 (Warn: 不要使用 func.bind() , 它会导致相等判断失败)
     * @param thisArg 回调方法执行者
     */
    public On(event: string, func: (...args: Array<any>) => void, thisArg: any) {
        let arr = this.events[event];
        let FT: { func: Function, thisArgs: Array<any> } = null as any;
        if (!arr) {
            arr = this.events[event] = [];
        } else {
            for (let ft of arr) {
                if (ft.func == func) {
                    FT = ft;
                    break;
                }
            }
        }

        if (!FT)
            arr.push({ func, thisArgs: [thisArg] });
        else {
            let idx = FT.thisArgs.lastIndexOf(thisArg);
            if (idx == -1)
                FT.thisArgs.push(thisArg);
        }
    }
    /**
     * 发出事件
     * @param event 事件类型 
     * @param args 传递参数
     */
    public Emit(event: string, ...args: Array<any>) {
        let arr = this.events[event];
        if (!arr || arr.length < 1)
            return;
        let pArr = arr.concat();    //避免内循环错误
        for (let FT of pArr) {
            for (let thisArg of FT.thisArgs) {
                FT.func.apply(thisArg, args);
            }
        }
        pArr.length = 0;
    }

    /**
     * 移除事件监听者
     * @param event 事件类型
     * @param func 事件触发回调方法
     * @param thisArg 回调方法执行者
     */
    public RemoveListener(event: string, func: Function, thisArg: any) {
        let arr = this.events[event];
        if (!arr)
            return;
        for (let i = 0, len = arr.length; i < len; ++i) {
            if (func == arr[i].func) {
                let idx = arr[i].thisArgs.lastIndexOf(thisArg);
                if (idx != -1) {
                    arr[i].thisArgs.splice(idx, 1);
                    if (arr[i].thisArgs.length < 1)
                        arr.splice(i, 1);
                    if (arr.length < 1)
                        delete this.events[event];
                    break;
                }
            }
        }
    }

    /**
     * 移除所有监听者
     */
    public RemoveListenerAll() {
        this.events = {};
    }

    /**
     * 指定事件监听者的数量
     */
    public listenerCount(event: string) {
        return this.events[event] ? this.events[event].length : 0;
    }
}

