export declare class EventDispatcher {
    private events;
    on(eventType: string, _cfun: (...args: any[]) => void, caller: any): void;
    Once(): any;
    dispatch(eventType: string, ...args: any[]): boolean;
    off(eventType: string, cFun: () => any, caller: any): void;
    offAll(): void;
    listenerCount(eventType: string): number;
}
