
// tslint:disable-next-line: only-arrow-functions
function makeStyle(ele: HTMLElement, w: number, h: number, bgColor = "#ffffff", position = "relative", border = "none") {
    ele.style.width = `${w}px`;
    ele.style.height = `${h}px`;
    ele.style.background = bgColor;
    ele.style.position = position;
    ele.style.border = border;
}

// tslint:disable-next-line: max-line-length
let whiteImg = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAySURBVFhH7c0xAQAwEAOh+jeduuCXwwBvR4qZYqaYKWaKmWKmmClmiplippgpZoqR7QMs0K5PppfCWAAAAABJRU5ErkJggg==`;

export class Tile {
    public img: HTMLImageElement;
    public htmlEleRoot: HTMLElement;
    /** tile 被点击时 */
    public onTileClick: (_t: Tile) => any;
    /** tile 悬停 */
    public onTileOver: (_t: Tile) => any;
    /** tile 离开悬停 */
    public onTileLeave: (_t: Tile) => any;
    /** tile active change  */
    public onActiveCkboxChange: (_t: Tile) => any;
    constructor(size: number, parent: HTMLElement, edgeSize: number = 4) {
        this._edgeSize = edgeSize;
        this._id = Tile.IDCount++;
        this._size = size;
        let ele = this.htmlEleRoot = document.createElement("div");
        // makeStyle(ele, size, size, "#ff88aa");
        makeStyle(ele, size, size, "#ffffff00");
        parent.appendChild(ele);
        ele.onclick = () => {
            if (this.onTileClick) {
                this.onTileClick(this);
            }
        };
        ele.onpointerover = () => {
            if (this.onTileOver) {
                this.onTileOver(this);
            }
        };
        ele.onpointerleave = () => {
            if (this.onTileLeave) {
                this.onTileLeave(this);
            }
        };

        this.bgFrame = document.createElement("div");
        makeStyle(this.bgFrame, size, size, "#ffffff00", "absolute");
        ele.appendChild(this.bgFrame);

        //img
        this.img = document.createElement("img");
        let imgSize = this._size - this._edgeSize * 2;
        // makeStyle(this.img, imgSize, imgSize, "none", "absolute");
        makeStyle(this.img, imgSize, imgSize, "#ffffff99", "absolute");
        ele.appendChild(this.img);
        this.img.style.left = this.img.style.top = `${this._edgeSize}px`;
        //
        //this.setSelect(true);
        // this.setImgUrl(`/res/samples/test/2.png`);

    }

    private static IDCount = 0;
    protected bgFrameColor = "#ff4488ff";
    private _id = -1;
    private _size: number;
    private _rotateType: number = 0;
    private _edgeSize: number;
    private _isSelect = false;
    private bgFrame: HTMLElement;
    private activeCKbox: HTMLInputElement;
    private _resName: string;
    private _active: boolean = true;
    private _isEnableckbox = false;

    public get isSelect() { return this._isSelect; }

    /** rotateType of image rotate (0=0 , 1=90 ,2=180 ,3=270) */
    public set rotateType(rotateType: number) {
        this._rotateType = rotateType;
        this.img.style.transform = `rotate(${rotateType * 90}deg)`;
    }
    public get rotateType() {
        return this._rotateType;
    }
    /** 资源名 */
    public set resName(val: string) {
        this._resName = val;
    }
    public get resName() {
        return this._resName;
    }
    /** guid of tile in runtime */
    public getID() {
        return this._id;
    }

    /** is active of state   */
    public get active() { return this._active; }
    public set active(val) {
        this._active = val;
        this.img.style.filter = val ? "none" : `grayscale(100%)`;
        if (this.activeCKbox) {
            this.activeCKbox.checked = val;
        }
    }
    /**
     * set tile state On or Off
     * @param select state(bool)
     */
    public setSelect(select: boolean) {
        this._isSelect = select;
        this.bgFrame.style.background = this._isSelect ? this.bgFrameColor : "#ffffff00";
    }
    /**
     * set image src 
     * @param src image url or base64Data
     */
    public setImgUrl(_src: string) {
        let src = _src;
        if (!src) {
            src = whiteImg;
        }
        this.img.src = src;
    }
    /**
     * set frame edge bg color
     * @param color rgb
     */
    public setBGFrameColor(color: string) {
        this.bgFrameColor = color;
    }

    public disableActiveCkbox() {
        if (!this._isEnableckbox) { return; }
        this._isEnableckbox = false;
        this.activeCKbox.parentElement.removeChild(this.activeCKbox);
        this.activeCKbox.checked = true;
        this.activeCKbox.onchange(null);
        this.activeCKbox = null;
    }

    public enableActiveCkbox() {
        if (this._isEnableckbox) { return; }
        this._isEnableckbox = true;
        //ckbox
        let activeCKbox = this.activeCKbox = document.createElement("input");
        activeCKbox.type = "checkbox";
        activeCKbox.style.right = "0px";
        activeCKbox.style.position = "absolute";
        activeCKbox.style.width = activeCKbox.style.height = "20px";
        activeCKbox.onclick = this.onclickActiveCheckbox.bind(this);
        this.htmlEleRoot.appendChild(activeCKbox);
        activeCKbox.style.display = "none";
        activeCKbox.checked = true;

        //ckbox display logic 
        let imgOver = false;
        let activeCKboxOver = false;
        let ckVisible = () => {
            activeCKbox.style.display = imgOver || activeCKboxOver ? "" : "none";
        };

        this.img.onpointerleave = () => {
            imgOver = false;
            ckVisible();
        };
        this.img.onpointerenter = () => {
            imgOver = true;
            ckVisible();
        };

        activeCKbox.onpointerleave = () => {
            activeCKboxOver = false;
            ckVisible();
        };
        activeCKbox.onpointerenter = () => {
            activeCKboxOver = true;
            ckVisible();
        };
        activeCKbox.onchange = (e) => {
            // console.log(`activeCKbox.onchange : ${activeCKbox.checked} `);
            this.active = activeCKbox.checked;
            if (e != null && this.onActiveCkboxChange) {
                this.onActiveCkboxChange(this);
            }
        };
    }

    private onclickActiveCheckbox() {

    }
}

export class TileView extends Tile {
    public onBoderEnter: (tile: TileView, edgeIdx: number) => any;
    public onBoderLeave: (tile: TileView, edgeIdx: number) => any;
    constructor(size: number, root: HTMLElement) {
        super(size, root);

        //make borader
        this.eleTop = document.createElement("div");
        this.eleRight = document.createElement("div");
        this.eleBottom = document.createElement("div");
        this.eleLeft = document.createElement("div");
        // let list = [this.eleTop, this.eleRight, this.eleBottom, this.eleLeft];
        let list = this.edges = [this.eleRight, this.eleTop, this.eleLeft, this.eleBottom];
        let bw = 10;
        let bh = size - bw * 2;
        list.forEach((val, i) => {
            let w = i % 2 ? size : bw;
            let h = i % 2 ? bw : size;
            makeStyle(val, w, h, TileView.colorList[0], "absolute");
            // if(i == 1){
            //     val.style.left = `${size - bw}px`;
            // }
            if (i == 0) {
                val.style.left = `${size - bw}px`;
            }
            if (i == 3) {
                val.style.top = `${size - bw}px`;
            }
            this.htmlEleRoot.appendChild(val);
            //io events
            val.onpointerenter = (ev: PointerEvent) => {
                if (this.onBoderEnter) { this.onBoderEnter(this, i); }
            };

            val.onpointerleave = (ev: PointerEvent) => {
                if (this.onBoderLeave) { this.onBoderLeave(this, i); }
            };
            val.onclick = (ev: MouseEvent) => {
                ev.cancelBubble = true;
            };
        });

    }
    private static colorList = ["#00000000", "#ffff3399", "#33aaff99"];
    private eleTop: HTMLElement;
    private eleRight: HTMLElement;
    private eleBottom: HTMLElement;
    private eleLeft: HTMLElement;
    private edges: HTMLElement[] = [];

    public setBoderColor(edgeIdx: number, colorType: number) {
        let idx = colorType < 0 ? 0 : colorType > TileView.colorList.length - 1 ? TileView.colorList.length - 1 : colorType;
        this.edges[edgeIdx].style.background = TileView.colorList[idx];
    }

    // private onBoderEnter(edgeIdx: number) {
    //     this.setBoderColor(edgeIdx, 1);
    // }

    // private onBoderLeave(edgeIdx: number) {
    //     this.setBoderColor(edgeIdx, 0);
    // }
}

export class TileSelect extends Tile {
    constructor(size: number, root: HTMLElement) {
        super(size, root);
        this.bgFrameColor = "#8844ffff";
    }
    private closeBtn: HTMLElement;
}