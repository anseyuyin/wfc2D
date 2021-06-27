export declare class Tile {
    img: HTMLImageElement;
    htmlEleRoot: HTMLElement;
    onTileClick: (_t: Tile) => any;
    onTileOver: (_t: Tile) => any;
    onTileLeave: (_t: Tile) => any;
    onActiveCkboxChange: (_t: Tile) => any;
    constructor(size: number, parent: HTMLElement, edgeSize?: number);
    private static IDCount;
    protected bgFrameColor: string;
    private _id;
    private _size;
    private _rotateType;
    private _edgeSize;
    private _isSelect;
    private bgFrame;
    private activeCKbox;
    private _resName;
    private _active;
    private _isEnableckbox;
    get isSelect(): boolean;
    set rotateType(rotateType: number);
    get rotateType(): number;
    set resName(val: string);
    get resName(): string;
    getID(): number;
    get active(): boolean;
    set active(val: boolean);
    setSelect(select: boolean): void;
    setImgUrl(_src: string): void;
    setBGFrameColor(color: string): void;
    disableActiveCkbox(): void;
    enableActiveCkbox(): void;
    private onclickActiveCheckbox;
}
export declare class TileView extends Tile {
    onBoderEnter: (tile: TileView, edgeIdx: number) => any;
    onBoderLeave: (tile: TileView, edgeIdx: number) => any;
    constructor(size: number, root: HTMLElement);
    private static colorList;
    private eleTop;
    private eleRight;
    private eleBottom;
    private eleLeft;
    private edges;
    setBoderColor(edgeIdx: number, colorType: number): void;
}
export declare class TileSelect extends Tile {
    constructor(size: number, root: HTMLElement);
    private closeBtn;
}
