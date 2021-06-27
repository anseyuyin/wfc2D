
/** xmlhttpRequest 加载 */

// import { WFC2D, wfc2dData } from "../../lib/wfc2D.js";

// tslint:disable-next-line: only-arrow-functions
function xhrLoad(url: string, type: XMLHttpRequestResponseType): Promise<XMLHttpRequest> {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.responseType = type;
        req.open("GET", url);
        req.send();
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    resolve(req);
                } else {
                    reject();
                }
            }
        };
    });
}

type imageMap = { [imgName: string]: HTMLImageElement };

/** 2d map WaveFunctionCollapse 样例 */
export class Example2DMap {

    constructor() {
        this.init();
    }

    private canvasEle: HTMLCanvasElement;
    private context2D: CanvasRenderingContext2D;
    private fileEle: HTMLInputElement;
    private selectOptionEle: HTMLSelectElement;
    private importFilesEle: HTMLInputElement;
    private tileSizeEle: HTMLInputElement;
    private tileXCountEle: HTMLInputElement;
    private tileYCountEle: HTMLInputElement;

    private backoffMaxEle: HTMLInputElement;
    private backoffQueueMaxEle: HTMLInputElement;
    private backoffCapRateEle: HTMLInputElement;
    private currConfig: WFC.wfc2dData;
    private currImgMap: imageMap = {};
    private dataMap: { [dName: string]: { config: WFC.wfc2dData, imgMap: imageMap } } = {};
    private dataLoginMap: { [dName: string]: boolean } = {};

    private wfc2dMap: { [dName: string]: WFC.WFC2D } = {};
    private resLoaded = false;
    private toRadian = Math.PI / 180;
    private filesID = "";
    private isCalculateing = false;

    private init() {
        console.log(`init`);
        this.setUI();
        this.initCanvas();
        this.refrashCanvas();
    }

    private setUI() {
        //file load
        this.fileEle = document.getElementById("selectFiles") as HTMLInputElement;
        this.fileEle.onchange = this.onFileChange.bind(this);

        //file load
        this.selectOptionEle = document.getElementById("selectOption") as HTMLSelectElement;
        this.importFilesEle = document.getElementById("importFiles") as HTMLInputElement;
        this.importFilesEle.onclick = this.onStart.bind(this);
        //tile
        this.tileSizeEle = document.getElementById("tilePixel") as HTMLInputElement;

        this.tileXCountEle = document.getElementById("tileXCount") as HTMLInputElement;
        this.tileXCountEle.onchange = () => {
            this.refrashCanvas();
        };
        this.tileYCountEle = document.getElementById("tileYCount") as HTMLInputElement;
        this.tileYCountEle.onchange = () => {
            this.refrashCanvas();
        };
        //backoff
        this.backoffMaxEle = document.getElementById("backoffMax") as HTMLInputElement;
        this.backoffQueueMaxEle = document.getElementById("backoffQueueMax") as HTMLInputElement;
        this.backoffCapRateEle = document.getElementById("backoffCapRate") as HTMLInputElement;
    }

    private initCanvas() {
        //
        let canvas = this.canvasEle = document.getElementById("viewCanvas") as HTMLCanvasElement;
        let context = this.context2D = canvas.getContext("2d");
    }

    private async calculate() {
        if (this.isCalculateing) { return; }
        if (!this.resLoaded) {
            alert(`resource is loading , wait.`);
            return;
        }
        this.isCalculateing = true;
        let samplesName = this.selectOptionEle.value;
        if (!samplesName) { samplesName = this.filesID; }
        let wfc2d = this.wfc2dMap[samplesName];
        if (!wfc2d) {
            wfc2d = this.wfc2dMap[samplesName] = new WFC.WFC2D(this.currConfig);
        }
        let mapSizeX = Number(this.tileXCountEle.value);
        let mapSizeY = Number(this.tileYCountEle.value);
        let cSize = Number(this.tileSizeEle.value);
        let backoffMax = Number(this.backoffMaxEle.value);
        let backoffQueueMax = Number(this.backoffQueueMaxEle.value);
        let capRate = Number(this.backoffCapRateEle.value);
        let imgMap = await wfc2d.collapse(mapSizeX, mapSizeY, backoffMax, backoffQueueMax, capRate);

        let halfCSize = cSize * 0.5;
        //clear 
        this.context2D.resetTransform();
        this.context2D.fillStyle = `#aaffff`;
        this.context2D.fillRect(0, 0, cSize * mapSizeX, cSize * mapSizeY);

        // this.context2D.rotate(30 * this.toRadian);//旋转
        //draw
        for (let y = 0; y < mapSizeY; y++) {
            for (let x = 0; x < mapSizeX; x++) {
                let imgName: string;
                let rotate: number;
                [imgName, rotate] = imgMap.shift();
                //reset
                this.context2D.resetTransform();
                //adjust rotate
                let rot = rotate * 90 * this.toRadian;
                this.context2D.translate(x * cSize + halfCSize, y * cSize + halfCSize);
                this.context2D.rotate(rot);
                this.context2D.translate(-halfCSize, -halfCSize);
                this.context2D.drawImage(this.currImgMap[imgName], 0, 0, cSize, cSize);
            }
        }
        this.isCalculateing = false;
    }

    private refrashCanvas() {
        let mapSizeX = Number(this.tileXCountEle.value);
        let mapSizeY = Number(this.tileYCountEle.value);
        let cSize = Number(this.tileSizeEle.value);
        this.canvasEle.width = cSize * mapSizeX;
        this.canvasEle.height = cSize * mapSizeY;
    }

    /** 当选择加载导入样例 */
    private onStart() {
        let samplesName = this.selectOptionEle.value;
        if (samplesName) {
            this.toLoadImport();
        } else if (this.currConfig && this.currImgMap) {
            this.calculate();
        }
    }

    private async toLoadImport() {
        this.resLoaded = false;
        let samplesName = this.selectOptionEle.value;
        if (this.dataLoginMap[samplesName]) { return; }
        let d = this.dataMap[samplesName];
        if (d) {
            this.currConfig = d.config;
            this.currImgMap = d.imgMap;
        } else {
            this.dataLoginMap[samplesName] = true;
            let basePath = `../../res/samples/`;
            let _dataUrl = `${basePath}${samplesName}/data.json`;
            let req = await xhrLoad(_dataUrl, "json");
            let data: WFC.wfc2dData = req.response;
            if (!data) {
                alert(`没找到 ${_dataUrl}!`);
                return;
            }
            this.currConfig = data;
            let cSize = Number(this.tileSizeEle.value);

            //load img
            let imgPormies: Promise<any>[] = [];
            for (let k in data.tiles) {
                let _temp = data.tiles[k];
                let url = `${basePath}${samplesName}/${k}${_temp[0]}`;
                let img = new Image();
                img.width = img.height = cSize;
                img.src = url;
                this.currImgMap[k] = img;
                let loadPormise = new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                imgPormies.push(loadPormise);
            }

            await Promise.all(imgPormies);
            //add to map
            this.dataMap[samplesName] = { config: this.currConfig, imgMap: this.currImgMap };
            delete this.dataLoginMap[samplesName];
        }

        this.resLoaded = true;

        this.calculate();
    }

    /** 当加载本地文件夹时 */
    private onFileChange(ev) {
        let files = this.fileEle.files;
        this.setDataByFileList(files);
    }

    /** 设置 编辑资源，通过 文件列表信息 */
    private setDataByFileList(fileL: FileList) {
        this.resLoaded = false;
        let files = fileL;
        let _imgMap: imageMap = {};
        let _config: WFC.wfc2dData;
        let floderName: string = "";
        let ckEnd = () => {
            this.resLoaded = true;
            waitCount--;
            if (waitCount > 0) { return; }
            console.log(`file 加载完毕`);
            //fix
            if (!_config) {
                alert(`get config by data.json fial!`);
                return;
            }
            //add to map
            this.currConfig = _config;
            this.currImgMap = _imgMap;
            //计算
            this.selectOptionEle.value = "";
        };
        let cSize = Number(this.tileSizeEle.value);
        let waitCount = 0;
        let filesID = "";
        for (let i = 0, len = files.length; i < len; i++) {
            let f = files.item(i);
            filesID += f.name;
            let path: string = f["webkitRelativePath"];
            if (!path) {
                console.error(`browser not suppor webkitRelativePath!`);
                break;
            }
            let pathSpArr = path.split("/");
            if (pathSpArr.length > 2) { //不关心子文件夹的文件
                continue;
            }
            if (!floderName) { floderName = pathSpArr[0]; }
            let arr = f.type.split("/");
            let isImg = false;
            if (arr[0] == "image") {
                isImg = true;
            } else if (arr[1] == "json" && f.name == "data.json") {
                //是配置文件

            } else {
                continue;
            }
            console.log(f);
            /// read file content.
            let reader = new FileReader();
            if (isImg) {
                reader.readAsDataURL(f);
            } else {
                reader.readAsText(f);
            }
            reader.onloadend = function (p) {
                if (isImg) {
                    let str = this.result as string;
                    let _name = f.name.substring(0, f.name.length - 4);
                    let _img = _imgMap[_name] = new Image();
                    _img.width = _img.height = cSize;
                    _img.src = str;
                } else {
                    _config = JSON.parse(this.result as string);
                }

                ckEnd();
            };

            waitCount++;
        }

        this.filesID = filesID;
    }

}