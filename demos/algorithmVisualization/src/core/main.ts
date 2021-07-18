import { CommandMgr, setState, batState, ICommand, BatchCommand } from "./command.js";
enum CType {
    /** 熵值的变化 */
    entropy,
    /** 瓦片对象(图片)的变化 */
    tile,
    /** 选中状态的变化 */
    state,
}

type wfcCommand = { pos: number, ctype: CType, value: number };
let tileSize = 80;
let tileGap = 0;
let mapSize = 6;
let greyImgUrl = `../../../../res/info/grey.png`;

//加载json 文件
// tslint:disable-next-line: only-arrow-functions
function loadJson(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let xhr = new XMLHttpRequest();  //实例化XMLHttpRequest 对象
        xhr.open("GET", path);  //建立连接
        xhr.send(null);  //发送请求
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 || xhr.status == 0) {
                    resolve(xhr.responseText);//接收数据
                }
            }
        };
        xhr.onerror = (ev) => {
            reject();
        };
    });
}

// type:[0:top 1:bLeft 2:bRight]
// tslint:disable-next-line: only-arrow-functions
function setText(own: HTMLElement, testColor: string, type = 0, className = "") {
    let subfont = document.createElement(`font`);
    subfont.style.position = "absolute";
    subfont.style.color = testColor;
    subfont.size = "1";
    subfont.textContent = "1.00";
    // subfont.style.display = "none";
    subfont.className = className;
    switch (type) {
        case 0: subfont.style.right = `50%`; subfont.style.top = `0px`; subfont.size = "3"; break;
        case 1: subfont.style.left = `0px`; subfont.style.bottom = `0px`; break;
        case 2: subfont.style.right = `0px`; subfont.style.bottom = `0px`; break;
        default: let a;
    }
    own.appendChild(subfont);
    return subfont;
}

/** 设置 聚焦 */
// tslint:disable-next-line: only-arrow-functions
function setFocus(imgEle: HTMLImageElement, isSelect: boolean) {
    if (!imgEle) { return; }
    if (isSelect) {
        let _d = 2;
        imgEle.style.width = `${tileSize - _d * 2}px`;
        imgEle.style.height = `${tileSize - _d * 2}px`;
        imgEle.style.border = `${_d}px solid #f5ff14`;
    } else {
        imgEle.style.width = `${tileSize}px`;
        imgEle.style.height = `${tileSize}px`;
        imgEle.style.border = "";
    }
}

//瓦片 图片切换 命令
// tslint:disable-next-line: class-name
class commandTileImg implements ICommand {
    constructor(tile: HTMLImageElement, targetSrc: string, transform: string) {
        this.tile = tile;
        this.targetSrc = targetSrc;
        this.tarTransform = transform;
        this.lastSrc = this.tile.src;
        this.lastTransform = this.tile.style.transform;
        this.tile = tile;
    }
    private targetSrc: string;
    private tarTransform: string;
    private lastTransform: string;
    private lastSrc: string;
    private tile: HTMLImageElement;

    public execute() {
        this.tile.src = this.targetSrc;
        this.tile.style.transform = this.tarTransform;
    }
    public undo() {
        this.tile.src = this.lastSrc;
        this.tile.style.transform = this.lastTransform;
    }
}

//瓦片 亮度 命令
// tslint:disable-next-line: class-name
class commandTileLum implements ICommand {
    constructor(tile: HTMLImageElement, lum: number) {
        this.tile = tile;
        this.tarParent = tile.parentElement;
        this.textEle = this.tarParent.children.item(0) as HTMLFontElement;
        this.tarEnt = lum.toFixed(2);
        this.tarColor = this.getColorByLum(lum);
        if (!this.tarParent.style.background) {
            this.tarParent.style.background = this.getColorByLum(0);
        }
    }

    private tarParent: HTMLElement;
    private tile: HTMLImageElement;
    private textEle: HTMLFontElement;
    private tarColor: string;
    private lastColor: string;
    private tarEnt: string;
    private lastEnt: string;
    private inited = false;
    public execute() {
        if (!this.inited) {
            this.lastColor = this.tarParent.style.background;
            this.lastEnt = this.textEle.textContent;
            this.inited = true;
        }
        this.tarParent.style.background = this.tarColor;
        this.tile.style["mix-blend-mode"] = this.getBlendByColor(this.tarColor);
        this.textEle.style.display = this.getDisplayByColor(this.tarColor);
        this.textEle.textContent = this.tarEnt;
    }

    public undo() {
        this.tarParent.style.background = this.lastColor;
        this.tile.style["mix-blend-mode"] = this.getBlendByColor(this.lastColor);
        this.textEle.style.display = this.getDisplayByColor(this.lastColor);
        this.textEle.textContent = this.lastEnt;
    }

    private getColorByLum(lum: number) {
        return `rgb(${lum * 255} ${lum * 255} ${lum * 255})`;
    }

    private getBlendByColor(color: string) {
        return color == `rgb(0 0 0)` ? "" : "soft-light";
    }

    private getDisplayByColor(color: string) {
        return color == `rgb(0 0 0)` ? "none" : "";
    }
}

//瓦片 聚焦 命令
// tslint:disable-next-line: class-name
class commandTileFocus implements ICommand {
    public static lastFocu: HTMLImageElement;
    constructor(tile: HTMLImageElement) {
        this.tarTile = tile;
    }
    private tarTile: HTMLImageElement;
    private lastTile: HTMLImageElement;
    private inited = false;
    public execute() {
        if (!this.inited) {
            this.lastTile = commandTileFocus.lastFocu;
            this.inited = true;
        }
        if (this.tarTile) {
            setFocus(this.tarTile, true);
        }
        if (this.lastTile) {
            setFocus(this.lastTile, false);
        }
        //set lastFocus;
        commandTileFocus.lastFocu = this.tarTile;
    }
    public undo() {
        if (this.lastTile) {
            setFocus(this.lastTile, true);
        }
        if (this.tarTile) {
            setFocus(this.tarTile, false);
        }
    }

}

export class Main {
    private get isStop() { return this._isStop; }
    private set isStop(v) {
        this._isStop = v;
        if (this.btnCenter) { this.btnCenter.value = v ? "▷" : "||"; }
    }
    constructor() {
        this.init();
    }

    private resPath = `../../../../res/samples/`;
    private smpleName = `test`;
    private rootContain = document.getElementById("rootcont");
    private slideBar: HTMLInputElement = document.getElementById("play_sb") as HTMLInputElement;
    private btnLeft: HTMLInputElement = document.getElementById("btn_left") as HTMLInputElement;
    private btnCenter: HTMLInputElement = document.getElementById("btn_center") as HTMLInputElement;
    private btnRight: HTMLInputElement = document.getElementById("btn_right") as HTMLInputElement;
    private btnGenerate: HTMLInputElement = document.getElementById("btn_generate") as HTMLInputElement;
    private tilesViewEle: HTMLLIElement = document.getElementById("tiles_view") as HTMLLIElement;
    private timeRate = 1000;
    private slideRangeMax = 10000;
    // private AS = new aStar();
    private DivMap: { [key: string]: HTMLDivElement } = {};

    //生成地图
    private colorOpen = `#7777aa`;
    private colorClose = `#aa7777`;
    private colorMinSelect = `#77aa77`;

    // private color0 = "#dddddd";
    private color0 = "#ffffff";
    private color1 = "#555555";
    // private mapSize = mapTemp.length;

    private lastTime = -1;
    private playSpeed = 1;  // /s
    private progressNum = 0;
    private _isStop = false;
    private lastPerc = -1;
    private tileViewObj: any;

    private playFun_Smooth() {
        if (this.isStop) { return; }
        let cInst = CommandMgr.Instance;
        let delta = (Date.now() / this.timeRate) - this.lastTime;
        this.progressNum += delta * this.slideRangeMax / (cInst.length * this.playSpeed * 0.3);
        this.progressNum = this.progressNum > this.slideRangeMax ? this.slideRangeMax : this.progressNum;
        if (this.progressNum < this.slideRangeMax) {
            requestAnimationFrame(this.playFun_Smooth.bind(this));
        }
        this.commandsMoveByPercent(this.progressNum / this.slideRangeMax);
        this.slideBar.value = this.progressNum.toString();
        this.lastTime = Date.now() / this.timeRate;
    }

    private autoPlay() {
        this.isStop = false;
        this.lastTime = Date.now() / this.timeRate;
        this.playFun_Smooth();
    }

    private adjustSlideByComLen() {
        this.progressNum = (CommandMgr.Instance.index + 1) / CommandMgr.Instance.length * this.slideRangeMax;
        this.slideBar.value = this.progressNum.toString();
    }
    //0 - 1
    private commandsMoveByPercent(_perc: number) {
        let perc = _perc;
        if (this.lastPerc == perc) { return; }
        perc = perc < 0 ? 0 : perc > 1 ? 1 : perc;  //keep range in 0-1
        let num = CommandMgr.Instance.index + 1;
        let len = CommandMgr.Instance.length;
        if (perc == num / len) { return; }
        let temp = perc - num / len;
        //console.error(`-------: temp${temp.toFixed(4)} perc:${perc.toFixed(4)}`);
        let f = Math.floor(Math.abs(temp * len));

        for (let i = 0; i < f; i++) {
            if (temp > 0) {
                CommandMgr.Instance.recovery();
            } else {
                CommandMgr.Instance.undo();
            }
        }
        if (perc == 1) { CommandMgr.Instance.recovery(); }
        this.lastPerc = perc;
    }

    private colorByNum(num: number) {
        switch (num) {
            case 0: return this.colorClose; //for in closelist
            case 1: return this.colorOpen;   //for in openlist
            case 2: return this.colorMinSelect; //for selected min
            // case 3: return this.color_ff;
            default: return null;
        }
    }
    private init() {
        this.testImmutable();
        //-------------------------------

        //reg eventHandles
        this.slideBar.onmousedown = this.slideBar.ontouchstart = () => {
            this.isStop = true;
        };

        this.slideBar.onchange = () => {
            this.progressNum = Number(this.slideBar.value);
            let perp = Number(this.slideBar.value) / this.slideRangeMax;
            this.commandsMoveByPercent(perp);
        };

        this.slideBar.oninput = () => {
            this.progressNum = Number(this.slideBar.value);
            let perp = Number(this.slideBar.value) / this.slideRangeMax;
            this.commandsMoveByPercent(perp);
        };

        this.btnCenter.onclick = () => {
            if (this.isStop) {
                this.autoPlay();
            } else {
                this.isStop = true;
            }
        };

        this.btnLeft.onclick = () => {
            this.isStop = true;
            CommandMgr.Instance.undo();
            this.adjustSlideByComLen();
        };

        this.btnRight.onclick = () => {
            this.isStop = true;
            CommandMgr.Instance.recovery();
            this.adjustSlideByComLen();
        };

        this.btnGenerate.onclick = () => {
            let data = this.getWFC2DData();
            this.toGenerateMap(data);
        };

        //插入 编辑查看工具
        let _iframe = document.createElement("iframe") as HTMLIFrameElement;
        _iframe.style.width = "100%";
        _iframe.style.height = "500px";
        _iframe.src = `../2DMapEditor/index.html?swMode=1`;
        this.tilesViewEle.appendChild(_iframe);
        _iframe.onload = () => {
            _iframe.contentDocument["onEditorInited"] = () => {
                this.tileViewObj = _iframe.contentDocument["__wfc2dEdt__"];
            };
        };
    }

    private getWFC2DData() {
        let tvObj = this.tileViewObj;
        if (!tvObj) { return; }
        let currCfg: WFC.wfc2dData = tvObj.mergeConfig(tvObj.currTilePackage.config);
        let arr: string[] = [];
        for (let key in tvObj.viewTilesMap) {
            let val = tvObj.viewTilesMap[key];
            if (!val || val.isSelect) { continue; }
            for (let i = 0; i < 4; i++) {
                arr.push(`${key}_${i}`);
            }
        }

        while (arr.length > 0) {
            let k = arr.pop();
            delete currCfg.connectIdL[k];
            delete currCfg.connectIdR[k];
        }
        return currCfg;
    }

    private async toGenerateMap(_data: WFC.wfc2dData) {
        //wfc2D test
        let data: WFC.wfc2dData;
        // let jsonStr = await loadJson(`${this.resPath}${this.smpleName}/data.json`);
        // data = JSON.parse(jsonStr);
        data = _data;
        //瓦片 img 信息
        let tileImgRotates: [string, number][] = [];
        for (let key in data.tiles) {
            let _rTypes: number[] = data.tiles[key][2];
            let arr = [0].concat(_rTypes);
            arr.forEach((v) => {
                tileImgRotates.push([key, v]);
            });
        }
        // debugger;
        let wfc = new WFC.WFC2D(data);

        let proccessData: wfcCommand[] = [];
        WFC["onProcess"] = (pos: number, ctype: number, value: number) => {
            proccessData.push({ pos, ctype, value });
        };

        // let wfcResult = wfc.collapseSync(mapSize, mapSize);
        let wfcResult = await wfc.collapse(mapSize, mapSize);

        //地图筛选
        // this.AS.outFilter = (x, y) => {
        //     return mapTemp[y][x] != null && mapTemp[y][x] == 0;
        // };

        let imgEleArr: HTMLImageElement[] = [];
        let imgs = this.tileViewObj.currTilePackage.imgs;
        let imgBas64 = {};
        for (let key in imgs) {
            let val = imgs[key];
            let baseName = `${val.fileName.slice(0, val.fileName.length - 4)}`;
            imgBas64[baseName] = val.dataB64;
        }
        this.rootContain.style.width = this.rootContain.style.height = `${mapSize * (tileSize + tileGap) - tileGap}px`;
        for (let y = 0; y < mapSize; y++) {
            //if(y!=0 )continue;
            let li = document.createElement(`li`);
            li.style.display = `flex`;
            li.style.position = `relative`;
            li.style.height = `${tileSize}px`;
            li.style.width = this.rootContain.style.width;
            li.style.top = `${y * tileGap}px`;
            this.rootContain.appendChild(li);
            for (let x = 0; x < mapSize; x++) {
                let imgName: string;
                let rotate: number;
                [imgName, rotate] = wfcResult.shift();
                // let resN = data[].resName;
                let resN = imgName;
                // let texturePath = `${this.resPath}${this.smpleName}/${resN}.png`;
                // let texturePath = `${this.resPath}${this.smpleName}/${resN}.png`;
                let texturePath = imgBas64[resN];
                // this.genCell(li, x, y, rotate, texturePath);
                let imgEle = document.createElement("img");
                imgEle.src = greyImgUrl;
                // imgEle.style.transform = `rotate(${rotate * 90}deg)`;
                imgEleArr.push(imgEle);
                this.genCell(li, x, y, imgEle);
            }
        }

        let commandArr: ICommand[] = [];
        for (let i = 0, len = proccessData.length; i < len; i++) {
            let pV = proccessData[i];
            switch (pV.ctype) {
                case CType.tile:
                    let imgSrc = greyImgUrl;
                    let rtype = 0;
                    if (pV.value != -1) {
                        let temp = tileImgRotates[pV.value];
                        imgSrc = imgBas64[temp[0]];
                        rtype = temp[1];
                    }
                    commandArr.push(new commandTileFocus(imgEleArr[pV.pos]));
                    let comBat = new BatchCommand();
                    comBat.addComd(new commandTileImg(imgEleArr[pV.pos], imgSrc, `rotate(${rtype * 90}deg)`));
                    comBat.addComd(new commandTileLum(imgEleArr[pV.pos], 0));
                    commandArr.push(comBat);
                    // commandArr.push(new commandTileImg(imgEleArr[pV.pos], imgSrc, `rotate(${rtype * 90}deg)`));
                    // commandArr.push(new commandTileLum(imgEleArr[pV.pos], 0));
                    break;
                case CType.entropy:
                    commandArr.push(new commandTileFocus(imgEleArr[pV.pos]));
                    commandArr.push(new commandTileLum(imgEleArr[pV.pos], pV.value));
                    break;
                case CType.state:
                    break;
                default:
            }
        }

        //最后一个的选中状态处理
        if (proccessData.length > 0) {
            commandArr.push(new commandTileFocus(null));
        }

        for (let i = 0, len = commandArr.length; i < len; i++) {
            CommandMgr.Instance.execute(commandArr[i]);
        }

        //开始 播放
        this.commandsMoveByPercent(0); //goBack to frist location
        this.autoPlay(); //start play of process

    }

    private genCell(li: HTMLElement, x: number, y: number, imgEle: HTMLImageElement) {
        let subDiv = document.createElement("div");
        subDiv.style.position = "relative";
        subDiv.style.width = `${tileSize}px`;
        subDiv.style.height = `${tileSize}px`;
        subDiv.style.left = `${x * tileGap}px`;
        //subDiv.style.top = `${y * gap}px`;
        // subDiv.style.background = mapTemp[y][x] == 0 ? this.color0 : this.color1;
        subDiv.style.background = this.color0;
        li.appendChild(subDiv);

        //text
        setText(subDiv, `rgb(255 0 247)`, 0);

        //--------test add img-----------
        // let _img = document.createElement("img");
        // // _img.src = `./res/10${Math.floor(Math.random() * 3) + 1}.png`;
        // _img.src = `${resPath}`;
        let _img = imgEle;
        _img.style.width = `${tileSize}px`;
        _img.style.height = `${tileSize}px`;
        subDiv.appendChild(_img);
        //-------------------------------

        // setText(subDiv, `#00ff00`, `class_g`, 1);
        // setText(subDiv, `#ff0000`, `class_h`, 2);

        this.DivMap[`${x}_${y}`] = subDiv;
        subDiv["pos"] = { x, y };

        // subDiv.onclick = () => {
        //     if (mapTemp[subDiv["pos"].y][subDiv["pos"].x] == 1) { return; }
        //     if (this.points.length <= 0) {
        //         if (CommandMgr.Instance.length > 0) {
        //             //clear history when next try
        //             this.commandsMoveByPercent(0);
        //             CommandMgr.Instance.clear();
        //             this.isStop = true;
        //             this.progressNum = 0;
        //             this.slideBar.value = "0";
        //         }
        //         setState(subDiv, this.colorStart);
        //     } else {
        //         setState(subDiv, this.colorEnd);
        //     }

        //     this.points.push(subDiv["pos"]);
        //     if (this.points.length >= 2) {
        //         //clear history
        //         this.paths.length = 0;

        //         let result = this.AS["findPath"](this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.paths);
        //         if (!result) { console.warn(`find path fail!`); }
        //         for (let i = 0; i < this.paths.length; i += 2) {
        //             let _x = this.paths[i];
        //             let _y = this.paths[i + 1];
        //             setState(this.DivMap[`${_x}_${_y}`], this.colorClick);
        //         }

        //         this.paths.length = 0;
        //         this.points.length = 0;

        //         //开始 播放
        //         this.commandsMoveByPercent(0); //goBack to frist location
        //         this.autoPlay(); //start play of process

        //     }
        // };
    }

    private testImmutable() {
        let list = Immutable.List<number>([1, 2, 3]);
        console.log(`list : ${list.toArray()
            .toString()}`);
        let list2 = list.delete(1);
        console.log(`list : ${list.toArray()
            .toString()}`);
        console.log(`list2 : ${list2.toArray()
            .toString()}`);
    }
}

//create Main when systemJS import end
// tslint:disable-next-line: no-unused-expression
new Main();