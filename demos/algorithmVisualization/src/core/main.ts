import { CommandMgr, setState, batState } from "./command.js";

//temp map data
let mapTemp = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
[1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1],
[1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
[1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
[1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

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
function setText(own: HTMLElement, testColor: string, className: string, type: number) {
    let subfont = document.createElement(`font`);
    subfont.style.position = "absolute";
    subfont.style.color = testColor;
    subfont.size = "0.3";
    subfont.textContent = "-1";
    subfont.style.display = "none";
    subfont.className = className;
    switch (type) {
        case 0: subfont.style.right = `50%`; subfont.style.top = `0px`; subfont.size = "0.5"; break;
        case 1: subfont.style.left = `0px`; subfont.style.bottom = `0px`; break;
        case 2: subfont.style.right = `0px`; subfont.style.bottom = `0px`; break;
        default: let a;
    }
    own.appendChild(subfont);
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

    private color0 = "#dddddd";
    private color1 = "#555555";
    private mapSize = mapTemp.length;
    private size = 40;
    private gap = 1;

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

        // debugger;
        let wfc = new WFC.WFC2D(data);

        // let wfcResult = wfc.collapseSync(this.mapSize, this.mapSize);
        let wfcResult = await wfc.collapse(this.mapSize, this.mapSize);

        //地图筛选
        // this.AS.outFilter = (x, y) => {
        //     return mapTemp[y][x] != null && mapTemp[y][x] == 0;
        // };
        let imgs = this.tileViewObj.currTilePackage.imgs;
        let imgBas64 = {};
        for (let key in imgs) {
            let val = imgs[key];
            let baseName = `${val.fileName.slice(0, val.fileName.length - 4)}`;
            imgBas64[baseName] = val.dataB64;
        }
        this.rootContain.style.width = this.rootContain.style.height = `${this.mapSize * (this.size + this.gap) - this.gap}px`;
        for (let y = 0; y < this.mapSize; y++) {
            //if(y!=0 )continue;
            let li = document.createElement(`li`);
            li.style.display = `flex`;
            li.style.position = `relative`;
            li.style.height = `${this.size}px`;
            li.style.width = this.rootContain.style.width;
            li.style.top = `${y * this.gap}px`;
            this.rootContain.appendChild(li);
            for (let x = 0; x < this.mapSize; x++) {
                let imgName: string;
                let rotate: number;
                [imgName, rotate] = wfcResult.shift();
                // let resN = data[].resName;
                let resN = imgName;
                // let texturePath = `${this.resPath}${this.smpleName}/${resN}.png`;
                // let texturePath = `${this.resPath}${this.smpleName}/${resN}.png`;
                let texturePath = imgBas64[resN];
                this.genCell(li, x, y, rotate, texturePath);
            }
        }
    }

    private genCell(li: HTMLElement, x: number, y: number, rotateType: number, resPath: string) {
        let subDiv = document.createElement("div");
        subDiv.style.position = "relative";
        subDiv.style.width = `${this.size}px`;
        subDiv.style.height = `${this.size}px`;
        subDiv.style.left = `${x * this.gap}px`;
        //subDiv.style.top = `${y * this.gap}px`;
        subDiv.style.background = mapTemp[y][x] == 0 ? this.color0 : this.color1;
        li.appendChild(subDiv);

        //--------test add img-----------
        let _img = document.createElement("img");
        // _img.src = `./res/10${Math.floor(Math.random() * 3) + 1}.png`;
        _img.src = `${resPath}`;
        _img.style.width = `${this.size}px`;
        _img.style.height = `${this.size}px`;
        _img.style.transform = `rotate(${rotateType * 90}deg)`;
        subDiv.appendChild(_img);
        //-------------------------------

        setText(subDiv, `#ffff00`, `class_f`, 0);
        setText(subDiv, `#00ff00`, `class_g`, 1);
        setText(subDiv, `#ff0000`, `class_h`, 2);

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