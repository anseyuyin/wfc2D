export interface ICommand {
    execute(): any;
    undo(): any;
}
export declare class BatchCommand implements ICommand {
    private comds;
    addComd(comd: ICommand): void;
    execute(): void;
    undo(): void;
}
export declare class CommandMgr {
    private static _instance;
    static get Instance(): CommandMgr;
    get index(): number;
    get length(): number;
    private currIdx;
    private coms;
    execute(com: ICommand): void;
    undo(): void;
    recovery(): void;
    clear(): void;
}
export declare function setState(ehtml: HTMLElement, color: string, g?: number, h?: number): void;
export declare function batState(States: {
    ehtml: HTMLElement;
    color: string;
    g: number;
    h: number;
}[]): void;
export declare class StateData {
    color: string;
    g: number;
    h: number;
    constructor(color: string, g?: number, h?: number);
}
export declare class RectSetCommand implements ICommand {
    htmle: HTMLElement;
    sta: StateData;
    constructor(htmle: HTMLElement, sta: StateData);
    private lastSta;
    execute(): void;
    undo(): void;
}
