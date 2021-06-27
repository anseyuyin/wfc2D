import { EventDispatcher } from "./EventDispatcher.js";

export class EventManager {
    private static eventDisp = new EventDispatcher();

    /**
     * 派发事件
     * @param eventType 
     * @param ev 
     */
    public static dispatchEvent<K extends keyof IEventMap>(eventType: K, ev: IEventMap[K]) {
        this.eventDisp.dispatch(eventType, ev);
    }

    /**
     * 添加事件监听
     * @param eventType 
     * @param listener 
     * @param thisArg 
     */
    public static addListener<K extends keyof IEventMap>(eventType: K, listener: (ev: IEventMap[K]) => any, thisArg: any) {
        this.eventDisp.on(eventType, listener, thisArg);
    }

    /**
     * 移除事件监听
     * @param eventType 
     * @param listener 
     * @param thisArg 
     */
    public static removeListener<K extends keyof IEventMap>(eventType: K, listener: (...p) => any, thisArg: any) {
        this.eventDisp.off(eventType, listener, thisArg);
    }

}

export interface IEventMap {
    /** 编辑查看tile */
    "view_editor": { id: number };
    /** 选中 tile 编辑*/
    "select_editor": { resName: string, rotateType: number };
    /** 选中 tile预览 */
    "select_over": { resName: string, rotateType: number };
    /** 选中 tile预览 离开*/
    "select_over_leave": null;
}