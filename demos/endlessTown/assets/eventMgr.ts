import { Vec2 } from "cc";
import { Eventer } from "./eventer";


export class EventMgr {
    private static _eventHander: Eventer = new Eventer();

    static addListener<T extends keyof EventTypes>(eventKey: T, cb: (ev: EventTypes[T]) => void, thisObj: any) {
        this._eventHander.On(eventKey, cb, thisObj);
    }

    public static dispatchEvent<K extends keyof EventTypes>(eventType: K, ev: EventTypes[K]) {
        this._eventHander.Emit(eventType, ev);
    }

    public static removeListener<K extends keyof EventTypes>(eventType: K, listener: Function, thisArg: any) {
        this._eventHander.RemoveListener(eventType, listener, thisArg);
    }
}

export class baseEvent<T> {
    data: T;
    constructor(_data: T = null as any) {
        this.data = _data;
    }

}

export class EventTypes {
    "onTile": baseEvent<{ pos: Vec2, tType: number, gPos: string }>;
    "offTile": baseEvent<string>;
    "gridShow": baseEvent<string>;
}
