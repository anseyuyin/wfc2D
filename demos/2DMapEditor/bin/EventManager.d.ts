export declare class EventManager {
    private static eventDisp;
    static dispatchEvent<K extends keyof IEventMap>(eventType: K, ev: IEventMap[K]): void;
    static addListener<K extends keyof IEventMap>(eventType: K, listener: (ev: IEventMap[K]) => any, thisArg: any): void;
    static removeListener<K extends keyof IEventMap>(eventType: K, listener: (...p: any[]) => any, thisArg: any): void;
}
export interface IEventMap {
    "view_editor": {
        id: number;
    };
    "select_editor": {
        resName: string;
        rotateType: number;
    };
    "select_over": {
        resName: string;
        rotateType: number;
    };
    "select_over_leave": null;
}
