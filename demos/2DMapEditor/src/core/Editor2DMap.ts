import { connectID2KV, dataURLtoBlob, getImgBaseName, getRightEdgeNum, kv2ConnectID, SetEleVisible, xhrLoad } from "./EditorTools.js";
import { connectIDMap, neighborData, tileConfig, tileImg, tilePackage } from "./EditorTypes.js";
import { EventManager } from "./EventManager.js";
import { Tile, TileSelect, TileView } from "./TileBase.js";

/**  2DMap 编辑器  */
export class Editor2DMap {
    constructor() {
        this.init();
    }
    private readonly outwardName = "__wfc2dEdt__";
    private readonly outwardEditorInited = "onEditorInited";
    private readonly dataFile = "data.json";
    private readonly editorFile = "editor.json";
    private readonly exportFile = "export.zip";
    private readonly rotateList = [0, 1, 2, 3];
    /** 瓦片基础尺寸 */
    private size = 100;
    /** 比较瓦片 缩放值 */
    private vsTileSacle = 1.5;
    /** 瓦片基础 间距  */
    private gap = 10;
    private selectEle: HTMLElement;
    private fileEle: HTMLInputElement;
    private selectOptionEle: HTMLSelectElement;
    private importFilesEle: HTMLInputElement;
    private exportFileEle: HTMLInputElement;
    private swOptionAllEle: HTMLInputElement;
    private swOptionCancelEle: HTMLInputElement;
    private viewEditorModeEle: HTMLInputElement;
    private viewDeActiveModeEle: HTMLInputElement;
    private infoEle: HTMLElement;
    private vsTiles: Tile[] = [];
    private currTilePackage: tilePackage;
    private viewIdNameMap: { [id: number]: string } = {};
    private ViewResNameIDMap: { [resName: string]: number } = {};
    private resNameImgMap: { [resName: string]: tileImg } = {};
    private currSelectTiles: TileSelect[] = [];
    private currSelectTile: TileSelect;    //current selected vs tile
    private currViewID: number;
    private currNeighborMap: { [tileName: string]: { [tileName: string]: boolean } } = {};
    private viewTilesMap: { [baseName: string]: TileView } = {};
    private neighborDirty: boolean = true;
    /** 是开关控制模式, (为 否时 是编辑模式) */
    private isSwitchMode: boolean = false;
    private viewContentMaxWSize: number;
    /** 生成 view 瓦片单元 */
    private genCellViewTile(li: HTMLElement, x: number): TileView {
        let result: TileView;
        //root
        result = new TileView(this.size, li);
        let subDiv = result.htmlEleRoot;
        subDiv.style.left = `${x * this.gap}px`;    //设置
        if (!this.isSwitchMode) {
            result.setBGFrameColor("#8844ffff");
        }
        return result;
    }

    /** 生成 挑选筛选 瓦片单元 */
    private genCellSelectTile(root: HTMLElement, x: number): TileSelect {
        let result: TileSelect;
        result = new TileSelect(this.size, root);
        let subDiv = result.htmlEleRoot;
        subDiv.style.left = `${x * this.gap}px`;    //设置
        // result.enableActiveCkbox();
        return result;
    }

    /** 设置 瓦片单元的 配置信息 */
    private setInfo(resName: string, weight: number, rotateStatas: number[]) {
        this.infoEle.innerHTML = `
            资源名：${resName}<br />
            <br>权重值:<input type="text" id="weightText" value="${weight}" /></br>
            <br>可旋转:<input type="text" id="rotateStatasText" value="${rotateStatas.toString()}" /></br>
        `;
        //
        let weightText = document.getElementById("weightText") as HTMLInputElement;
        let rotateStatasText = document.getElementById("rotateStatasText") as HTMLInputElement;

        weightText.onchange = () => {
            let newNum = Number(weightText.value);
            if (isNaN(newNum)) { return; }
            let baseName = getImgBaseName(this.viewIdNameMap[this.currViewID]);
            let tconfig = this.currTilePackage.config.tiles[baseName];
            tconfig[1] = newNum;
            //重新刷新 select
            this.setSelectByID(this.currViewID);
        };
        rotateStatasText.onchange = () => {
            let str = rotateStatasText.value;
            //校验数据
            let arr: number[];
            try {
                arr = JSON.parse(`[${str}]`);
            } catch (v) { }

            if (!arr) { return; }
            //矫正数据
            arr.length = arr.length > 3 ? 3 : arr.length;
            arr.forEach((val, i) => {
                arr[i] = i + 1;
            });

            let baseName = getImgBaseName(this.viewIdNameMap[this.currViewID]);
            let tconfig = this.currTilePackage.config.tiles[baseName];
            tconfig[2] = arr;
            //重新刷新 select
            this.setSelectByID(this.currViewID);
        };
    }

    /** 初始化 */
    private init() {
        //模式确定
        let str = window.location.search;
        if (str && str.indexOf(`swMode=1`) != -1) {
            this.isSwitchMode = true;
        }
        // 
        this.setUI();
        //
        this.setVisible();
        //event
        //reg
        EventManager.addListener("view_editor", this.onViewEditor, this);
        EventManager.addListener("select_editor", this.onSelectEditor, this);
        EventManager.addListener("select_over", this.onSelectOver, this);
        EventManager.addListener("select_over_leave", this.onSelectLeave, this);

        //全局暴露
        let doc = this.importFilesEle.ownerDocument;
        doc[this.outwardName] = this;
        if (doc[this.outwardEditorInited]) {
            doc[this.outwardEditorInited]();
            delete doc[this.outwardEditorInited];
        }
    }

    /** 初始化设置UI */
    private setUI() {
        //this.setView([]);

        //info frame
        let infoElement = this.infoEle = document.getElementById("tileInfocont");
        infoElement.style.background = `#8899ffaa`;
        infoElement.style.border = `3px solid #4444aa`;

        //select frame
        let srootElement = document.getElementById("tileScont");
        srootElement.style.height = `${this.size}px`;
        this.selectEle = document.createElement("li");
        this.selectEle.style.display = `flex`;
        this.selectEle.style.position = `relative`;
        this.selectEle.style.height = `${this.size}px`;
        srootElement.appendChild(this.selectEle);
        this.selectEle.parentElement.style.height = `${this.selectEle.parentElement.offsetHeight}px`;
        //设置鼠标滚动
        let scrollSpeedScale = 1;
        srootElement.onwheel = (ev) => {
            console.log(`wheelDelta : ${ev.deltaY}`);
            srootElement.scroll(srootElement.scrollLeft + (ev.deltaY * scrollSpeedScale), 0);
        };

        //tileScont
        // this.setSelect([1, 1, 1, 1, 1, 1, 1]);

        //file load
        this.fileEle = document.getElementById("selectFiles") as HTMLInputElement;
        this.fileEle.onchange = this.onFileChange.bind(this);

        //file load
        this.selectOptionEle = document.getElementById("selectOption") as HTMLSelectElement;
        this.importFilesEle = document.getElementById("importFiles") as HTMLInputElement;
        this.importFilesEle.onclick = this.onSelectImport.bind(this);

        //filse export
        this.exportFileEle = document.getElementById("exportFiles") as HTMLInputElement;
        this.exportFileEle.onclick = this.onExportClik.bind(this);

        //sw option button
        this.swOptionAllEle = document.getElementById("swOptionAll") as HTMLInputElement;
        this.swOptionAllEle.onclick = () => { this.allViewSelect(true); };
        this.swOptionCancelEle = document.getElementById("swOptionCancel") as HTMLInputElement;
        this.swOptionCancelEle.onclick = () => { this.allViewSelect(false); };

        //viewClickEditorMode
        this.viewEditorModeEle = document.getElementById("viewEditorMode") as HTMLInputElement;
        this.viewEditorModeEle.onchange = () => { this.allViewActiveCKbox(this.viewDeActiveModeEle.checked); };
        this.viewDeActiveModeEle = document.getElementById("viewDeActiveMode") as HTMLInputElement;
        this.viewDeActiveModeEle.onchange = () => { this.allViewActiveCKbox(this.viewDeActiveModeEle.checked); };

        //vs tiles
        this.setVSTiles();
    }

    private setVisible() {
        SetEleVisible("tilesViewLi", false);
        SetEleVisible("tilesInfoLi", false);
        SetEleVisible("tilesSelectLi", false);
        SetEleVisible("tilesVSLi", false);
        if (this.isSwitchMode) {
            SetEleVisible("exportLi", false);
        } else {
            SetEleVisible("SWOptionLi", false);
        }
    }

    /** 获取 view容器 宽度的最大单位个数 */
    private getViewContentMaxWSize() {
        let vrootElement = document.getElementById("tileVcont");
        let rootW = vrootElement.clientWidth;
        return Math.floor((rootW + this.gap) / (this.size + this.gap));
    }

    /** 通过 图片信息数组 设置 View 列表 */
    private setView(imgs: tileImg[]) {
        let tiles = [];
        let tLen = tiles.length = imgs.length;
        let vrootElement = document.getElementById("tileVcont");
        // let maxWSize = Math.floor((rootW + this.gap) / (this.size + this.gap));
        let maxWSize = this.viewContentMaxWSize = this.getViewContentMaxWSize();
        let maxHSize = Math.floor(tLen / maxWSize) + 1;
        let realHeight = maxHSize * (this.gap + this.size) - this.gap;
        vrootElement.style.height = `${realHeight}px`;
        vrootElement.parentElement.style.height = `${vrootElement.offsetHeight}px`;
        let count = 0;
        let x = 0;
        let y = 0;
        let liMap = {};
        while (count < tLen) {
            let _tImg = imgs[count];
            x = count % maxWSize;
            y = Math.floor(count / maxWSize);
            let li: HTMLLIElement = liMap[y];
            if (!li) {
                li = document.createElement("li");
                liMap[y] = li;
                li.style.display = `flex`;
                li.style.position = `relative`;
                li.style.height = `${this.size}px`;
                li.style.width = vrootElement.style.width;
                li.style.top = `${y * this.gap}px`;
                // li.style.color = "#999999";
                vrootElement.appendChild(li);
            }
            let t = this.genCellViewTile(li, x);
            t.resName = _tImg.fileName;
            t.setImgUrl(_tImg.dataB64);
            t.onTileClick = this.onViewTileClick.bind(this);
            t.onTileOver = this.onViewTileOver.bind(this);
            t.onBoderEnter = this.onBoderEnter.bind(this);
            t.onBoderLeave = this.onBoderLeave.bind(this);
            // this.map[id]
            let id = t.getID();
            this.viewTilesMap[getImgBaseName(t.resName)] = t;
            this.viewIdNameMap[id] = _tImg.fileName;
            this.resNameImgMap[_tImg.fileName] = _tImg;
            this.ViewResNameIDMap[_tImg.fileName] = id;
            count++;
        }

        //监听刷新
        window.onresize = () => {
            this.ckRefreshViewLayout();
        };
    }

    /** 检查 viwe 变化的刷星 */
    private ckRefreshViewLayout() {
        let currSize = this.getViewContentMaxWSize();
        if (currSize == this.viewContentMaxWSize || currSize > this.currTilePackage.imgs.length) { return; }
        //clear
        this.clearView();
        //设置
        this.setView(this.currTilePackage.imgs);
    }

    /** 设置 所有详细比较 瓦片 */
    private setVSTiles() {
        let tSize = this.size * this.vsTileSacle;
        let vsElement = document.getElementById("tileVScont");
        vsElement.style.width = vsElement.style.height = `${tSize * 3}px`;
        let parentSize = vsElement.offsetHeight;
        let datas = [[1, 1], [2, 1], [1, 0], [0, 1], [1, 2]];
        datas.forEach((arr, i) => {
            let _t = new Tile(tSize, vsElement, 0);
            _t.htmlEleRoot.style.position = `absolute`;
            _t.htmlEleRoot.style.left = `${parentSize - tSize * (3 - arr[0])}px`;
            _t.htmlEleRoot.style.top = `${parentSize - tSize * (3 - arr[1])}px`;
            _t.setSelect(false);
            vsElement.appendChild(_t.htmlEleRoot);
            this.vsTiles.push(_t);
            if (i > 0) {
                _t.onTileClick = this.onVSTileActiveCG.bind(this);  //监听全区域
                // _t.onActiveCkboxChange = this.onVSTileActiveCG.bind(this);
            }
        });

    }

    /** 获取有效的邻居 map对象 */
    private getValidNeighborMap(key: string) {
        let result = this.currNeighborMap[key];
        if (!result) {
            result = this.currNeighborMap[key] = {};
        }
        return result;
    }

    /** 当比较瓦片单元 激活状态变化时 */
    private onVSTileActiveCG(tile: Tile) {
        console.log(`onVSTileActiveCG : ${tile.resName}`);
        tile.active = !tile.active;
        let idx = this.vsTiles.indexOf(tile);
        let dir = idx - 1;
        //left name
        let _centerResName = this.viewIdNameMap[this.currViewID];
        let _leftName = `${getImgBaseName(_centerResName)}_${dir}`;

        //right name
        let rEdgeID = getRightEdgeNum(tile.rotateType, dir);
        let _rightName = `${getImgBaseName(tile.resName)}_${rEdgeID}`;

        let _map = this.getValidNeighborMap(_leftName);
        this.neighborDirty = true;
        _map[_rightName] = tile.active;
    }

    /** 当view 瓦片被点击编辑时 */
    private onViewEditor(ev: { [id: string]: number }) {
        console.log(`onViewEditor : ${ev.id}`);
        //select set
        this.setSelectByID(ev.id);
        //clear center
        this.clearVSEdges();
        //VS set
        this.setVSCenterID(ev.id);
    }

    /** 当筛选 瓦片被点击编辑时 */
    private onSelectEditor(ev: { resName: string, rotateType: number }) {
        //set
        this.setSelectEditor(ev.resName, ev.rotateType);
    }

    /** 当筛选 瓦片被鼠标悬浮时 */
    private onSelectOver(ev: { resName: string, rotateType: number }) {
        //set
        this.setSelectEditor(ev.resName, ev.rotateType);
    }

    /** 当筛选 瓦片被鼠标悬浮离开时 */
    private onSelectLeave() {
        if (!this.currSelectTile) {
            this.clearVSEdges();
            return;
        }
        //set back
        this.setSelectEditor(this.currSelectTile.resName, this.currSelectTile.rotateType);
    }

    /** 设置筛选 瓦片进入选定编辑 */
    private setSelectEditor(_selectResName: string, _rotateType: number) {
        //clear history
        this.clearVSEdges();
        //
        // let list = [0];
        let list = this.rotateList;
        let _viewResName = this.viewIdNameMap[this.currViewID];
        // let cfgRlist = this.currTilePackage.config.tiles[getImgBaseName(_viewResName)][2];
        // if (cfgRlist) {
        //     list = list.concat(cfgRlist);
        // }
        //
        for (let i = 0, len = list.length; i < len; i++) {
            let dir = list[i];
            this.setVSEdge(_selectResName, _rotateType, dir);
        }
    }

    /** 设置 比较 瓦片指定边 */
    private setVSEdge(resName: string, rotateType: number, centerRotateT: number) {
        //get tile
        let vsTile = this.vsTiles[centerRotateT + 1];
        let t = this.resNameImgMap[resName];
        //当前位置旋转
        vsTile.rotateType = rotateType;
        vsTile.resName = resName;
        //资源
        vsTile.setImgUrl(t.dataB64);
        //get map
        let _viewResName = this.viewIdNameMap[this.currViewID];
        let _nCenter = `${getImgBaseName(_viewResName)}_${centerRotateT}`;
        let _map = this.getValidNeighborMap(_nCenter);
        //edge
        let _rEdgeID = getRightEdgeNum(vsTile.rotateType, centerRotateT);
        let _nRight = `${getImgBaseName(resName)}_${_rEdgeID}`;
        let isActive = _map[_nRight] ? true : false;
        //
        if (_map[_nRight] == null) {
            //当前位置 还没设置初始值
        }
        vsTile.enableActiveCkbox();
        vsTile.active = isActive;
    }

    /** 清理 比较 瓦片 中心位置*/
    private setVSCenterID(tileID: number) {
        this.currViewID = tileID;
        let center = this.vsTiles[0];
        let resName = this.viewIdNameMap[tileID];
        let t = this.resNameImgMap[resName];
        center.setImgUrl(t.dataB64);
    }

    /** 设置所有的 筛选 瓦片,通过 view 瓦片的id */
    private setSelectByID(tileID: number) {
        //clear history
        this.clearSelect();
        //set
        let resName = this.viewIdNameMap[tileID];
        let cfg = this.currTilePackage.config;
        let arr: number[] = [];
        for (let key in cfg.tiles) {
            let val = cfg.tiles[key];
            let _rN = `${key}${val[0]}`;
            //if (resName == _rN) { continue; }
            arr.push(this.ViewResNameIDMap[_rN]);
        }
        this.setSelectArr(arr);
    }

    /** 当 导出按钮被点击 */
    private onExportClik() {
        console.log("onExportClik");
        let tileP = this.currTilePackage;
        if (!tileP) { return; }
        let JSZip = globalThis.JSZip;
        let saveAs = globalThis.saveAs;

        let zip = new JSZip();
        let data = this.mergeConfig(tileP.config);

        //---------data.json 文件--------
        let tiles = data.tiles;
        let n = data.neighbor;
        let dea = data.deactivate;
        let limitTiles = {};
        for (let k in tiles) {
            if (dea[k]) { continue; }
            limitTiles[k] = tiles[k];
        }
        data.tiles = limitTiles;    //过滤deactivate
        delete data.neighbor;   //不导出 neighbor数据
        delete data.deactivate;   //不导出 deactivate
        zip.file(this.dataFile, JSON.stringify(data));
        data.neighbor = n;
        data.deactivate = dea;
        data.tiles = tiles;
        //------------------------------

        //---------editor.json 文件--------
        let nL = data.connectIdL;
        let nR = data.connectIdR;
        delete data.connectIdL;   //不导出 connectIdL
        delete data.connectIdR;   //不导出 connectIdR
        zip.file(this.editorFile, JSON.stringify(data));
        data.connectIdL = nL;
        data.connectIdR = nR;
        //------------------------------

        tileP.imgs.forEach((val, i) => {
            zip.file(val.fileName, dataURLtoBlob(val.dataB64), { base64: true });
        });
        zip.generateAsync({ type: "blob" })
            .then((content) => {
                saveAs(content, this.exportFile);
            });
    }

    private allViewSelect(isSelect: boolean) {
        for (let k in this.viewTilesMap) {
            let v = this.viewTilesMap[k];
            if (!v) { continue; }
            v.setSelect(isSelect);
        }
    }

    private allViewActiveCKbox(isEnable: boolean) {
        for (let k in this.viewTilesMap) {
            let v = this.viewTilesMap[k];
            if (!v) { continue; }
            isEnable ? v.enableActiveCkbox() : v.disableActiveCkbox();
            v.active = v.active;
        }
    }

    /** 合并整理 配置信息 */
    private mergeConfig(_conf: tileConfig): tileConfig {
        if (!this.neighborDirty) { return _conf; }
        this.neighborDirty = false;
        let result: tileConfig = {} as any;
        result.tiles = _conf.tiles;
        result.deactivate = _conf.deactivate;

        //tiles

        //neighbor merge
        let nArrLimit: neighborData[] = [];
        let nArr: neighborData[] = [];
        // let keys = Object.keys(this.currNeighborMap);
        for (let _left in this.currNeighborMap) {
            let _map = this.currNeighborMap[_left];
            for (let _right in _map) {
                let temp: neighborData = { left: _left, right: _right };
                if (_map[_right]) {
                    nArr.push(temp);
                    let L = _left.substring(0, _left.length - 2);
                    let R = _right.substring(0, _right.length - 2);
                    if (!_conf.deactivate[L] && !_conf.deactivate[R]) {
                        nArrLimit.push(temp);
                    }
                }
            }
        }
        result.neighbor = nArr;
        //convert 2 connectId
        let _tempC = kv2ConnectID(nArrLimit);
        result.connectIdL = _tempC.connectIdL;
        result.connectIdR = _tempC.connectIdR;
        return result;
    }

    /** 邻居解析 到 map*/
    private neighborParse(neighbor: neighborData[]) {
        neighbor.forEach((val) => {
            let _map = this.getValidNeighborMap(val.left);
            _map[val.right] = true;
        });
    }

    /** 通过 图片文件名 设置默认TileImg */
    private setDefTileImg(imgFileName: string, conf: tileConfig) {
        let idx = imgFileName.lastIndexOf(".");
        let imgName = imgFileName.substring(0, idx);
        let suffix = imgFileName.substring(idx);
        conf.tiles[imgName] = [suffix, 1, [1, 2, 3]];
    }

    /** 当加载本地文件夹时 */
    private onFileChange(ev) {
        let files = this.fileEle.files;
        this.setDataByFileList(files);
    }

    /** 设置 编辑资源，通过 文件列表信息 */
    private setDataByFileList(fileL: FileList) {
        let files = fileL;
        let _imgs: tileImg[] = [];
        let _config: tileConfig;
        let floderName: string = "";
        let ckEnd = () => {
            //clear
            this.clearAll();

            //set visible
            SetEleVisible("tilesViewLi", true);
            if (!this.isSwitchMode) {
                SetEleVisible("tilesInfoLi", true);
                SetEleVisible("tilesSelectLi", true);
                SetEleVisible("tilesVSLi", true);
            }
            //
            waitCount--;
            if (waitCount > 0) { return; }
            // config;
            // imgs;
            // debugger;
            console.log(`file 加载完毕`);

            //fix
            if (!_config) { _config = {} as any; }
            //ck fill null data
            if (!_config.tiles) {
                _config.tiles = {};
                _imgs.forEach((v) => {
                    this.setDefTileImg(v.fileName, _config);
                });
            } else {
                //检查实际图片 和 配置是否有差异
                let _imgNameMap = {};
                _imgs.forEach((v) => {
                    let fn = v.fileName;
                    let imgName = fn.substring(0, fn.lastIndexOf("."));
                    _imgNameMap[imgName] = true;
                    if (_config.tiles[imgName] == null) {
                        //补上新增加的图片
                        this.setDefTileImg(v.fileName, _config);
                    }
                });
                //去除不存在的图片（被删除了）
                for (let k in _config.tiles) {
                    if (_imgNameMap[k]) { continue; }
                    delete _config.tiles[k];
                }
            }

            if (!_config.connectIdL) { _config.connectIdL = {}; }
            if (!_config.connectIdR) { _config.connectIdR = {}; }
            if (!_config.deactivate) { _config.deactivate = {}; }

            // //set 2 neighbor kv
            // _config.neighbor = connectID2KV(_config.connectIdL, _config.connectIdR);

            if (!_config.neighbor) { _config.neighbor = []; }

            //make package
            this.currTilePackage = { imgs: _imgs, config: (_config as any) };
            this.neighborParse(this.currTilePackage.config.neighbor);
            //on
            this.setView(_imgs);

            //deactive
            for (let k in this.viewTilesMap) {
                let v = this.viewTilesMap[k];
                if (!v) { continue; }
                v.active = _config.deactivate[getImgBaseName(v.resName)] != true;
            }

            //def select state set
            if (this.isSwitchMode) {
                this.allViewSelect(true);
            }

        };
        let waitCount = 0;
        for (let i = 0, len = files.length; i < len; i++) {
            let f = files.item(i);
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
            } else if (arr[1] == "json" && f.name == this.editorFile) {
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
                    _imgs.push({ fileName: f.name, dataB64: str });
                } else {
                    _config = JSON.parse(this.result as string);
                }

                ckEnd();
            };

            waitCount++;
        }
    }

    /** 当选择加载导入样例 */
    private async onSelectImport() {
        let resName = this.selectOptionEle.value;
        let basePath = `../../res/samples/`;
        let _dataUrl = `${basePath}${resName}/${this.editorFile}`;
        let req = await xhrLoad(_dataUrl, "json");
        let data = req.response;
        if (!data) {
            alert(`没找到 ${_dataUrl}!`);
            return;
        }
        if (!data.tiles) {
            alert(`没有数据 tiles!`);
        }
        let tileKeys: any[] = Object.keys(data.tiles);
        let fileUrls: string[] = [];
        tileKeys.forEach((v) => {
            fileUrls.push(`${basePath}${resName}/${v}${data.tiles[v][0]}`);
        });
        fileUrls.push(_dataUrl);

        let promiseArr: Promise<XMLHttpRequest>[] = [];
        //加载成 bo
        fileUrls.forEach((v) => {
            promiseArr.push(xhrLoad(v, "blob"));
        });

        let allReq = await Promise.all(promiseArr);
        let fList: FileList = {
            length: allReq.length,
            item(idx: number) {
                return fList[idx];
            },
        };

        allReq.forEach((v, i) => {
            let f = fList[i] = v.response as any;
            let url = fileUrls[i];
            let _idx = url.lastIndexOf(`/`);
            f.name = url.substring(_idx + 1);
            f.webkitRelativePath = `${resName}${f.name}`;
        });
        this.setDataByFileList(fList);
    }

    /** 清理所有 筛选 瓦片 */
    private clearSelect() {
        this.currSelectTiles.length = 0;
        //
        let cs: Node[] = [];
        for (let i = 0, len = this.selectEle.children.length; i < len; i++) {
            cs.push(this.selectEle.children.item(i));
        }
        while (cs.length > 0) {
            this.selectEle.removeChild(cs.pop());
        }
    }

    /** 清理 比较 瓦片 */
    private clearVSEdges() {
        for (let i = 0; i < 4; i++) {
            let vsTile = this.vsTiles[i + 1];
            vsTile.disableActiveCkbox();
            vsTile.setImgUrl("");
        }
    }

    /** 清理 view  */
    private clearView() {
        //清理 tileVcont
        let vrootElement = document.getElementById("tileVcont");
        let arr = [];
        for (let i = 0, len = vrootElement.children.length; i < len; i++) {
            arr.push(vrootElement.children.item(i));
        }
        //
        arr.forEach((v) => {
            vrootElement.removeChild(v);
        });

        //
        this.viewTilesMap = {};
        this.viewIdNameMap = {};
        this.resNameImgMap = {};
        this.ViewResNameIDMap = {};
    }

    private clearAll() {
        this.clearView();
        this.clearSelect();
        this.clearVSEdges();
        //edge center
        this.vsTiles[0].setImgUrl("");
    }

    /** 设置 筛选瓦片 通过数组 */
    private setSelectArr(data: any[]) {
        let len = data.length;
        let count = 0;
        for (let i = 0; i < len; i++) {
            let resName = this.viewIdNameMap[data[i]];
            let _tileImg = this.resNameImgMap[resName];
            let list = [0];
            let cfgRlist = this.currTilePackage.config.tiles[getImgBaseName(resName)][2];
            if (cfgRlist) {
                list = list.concat(cfgRlist);
            }
            for (let j = 0, len1 = list.length; j < len1; j++) {
                let r = list[j];
                let t = this.genCellSelectTile(this.selectEle, count);
                t.resName = _tileImg.fileName;
                t.setImgUrl(_tileImg.dataB64);
                t.onTileClick = this.onSelectTileClick.bind(this);
                t.onTileOver = this.onSelectPointOver.bind(this);
                t.onTileLeave = this.onSelectPointLeave.bind(this);
                this.currSelectTiles.push(t);
                t.setSelect(false);
                t.rotateType = r;
                count++;
            }
        }
        this.selectEle.style.width = `${count * (this.size + this.gap)}px`;
    }

    /** 当 view 瓦片被点击 */
    private onViewTileClick(t: TileView) {
        console.log(`onViewTileClick : ${t}`);
        if (this.viewEditorModeEle.checked) {
            //编辑模式

            if (this.isSwitchMode) {
                t.setSelect(!t.isSelect);

            } else {
                this.allViewSelect(false);
                t.setSelect(!t.isSelect);
                //设置tile信息
                let resName = this.viewIdNameMap[t.getID()];
                let onlyName = resName.substr(0, resName.length - 4);
                let _conf = this.currTilePackage.config.tiles[onlyName];
                // this.setInfo(, 1, [1, 1]);
                let temp: number[] = _conf[2] ? _conf[2] : [];
                this.setInfo(resName, _conf[1], temp);

                //dis event
                let ev = { id: t.getID() };
                EventManager.dispatchEvent("view_editor", ev);
            }
        } else {
            //失活 激活模式
            t.active = !t.active;
            let deactivate = this.currTilePackage.config.deactivate;
            let imgBaseN = getImgBaseName(t.resName);
            t.active ? delete deactivate[imgBaseN] : deactivate[imgBaseN] = true;
            this.neighborDirty = true;
        }

    }

    /** 当 筛选瓦片被点击 */
    private onSelectTileClick(t: TileSelect) {
        this.currSelectTiles.forEach((val) => {
            if (val) {
                val.setSelect(false);
            }
        });
        t.setSelect(true);
        //record
        this.currSelectTile = t;

        //dis event
        let ev = { resName: t.resName, rotateType: t.rotateType };
        EventManager.dispatchEvent("select_editor", ev);
    }

    /**当 鼠标悬浮在 筛选瓦片上 */
    private onSelectPointOver(t: TileSelect) {
        let ev = { resName: t.resName, rotateType: t.rotateType };
        EventManager.dispatchEvent("select_over", ev);
    }

    /**当 鼠标从悬浮在筛选瓦片上离开 */
    private onSelectPointLeave(t: TileSelect) {
        EventManager.dispatchEvent("select_over_leave", null);
    }

    /**当 鼠标悬浮在view瓦片 */
    private onViewTileOver(t: TileView) {
        console.log(`onViewTileOver : ${t}`);
    }

    /**当 鼠标进入view瓦片的边区域 */
    private onBoderEnter(tile: TileView, edgeIdx: number) {
        if (this.isSwitchMode) { return; }
        tile.setBoderColor(edgeIdx, 1);
        this.lightRightEdges(tile, edgeIdx);
    }

    /**当 鼠标 从view瓦片的边区域离开 */
    private onBoderLeave(tile: TileView, edgeIdx: number) {
        if (this.isSwitchMode) { return; }
        tile.setBoderColor(edgeIdx, 0);
        this.offLightEdges();
    }

    /** 关掉所有亮边 */
    private offLightEdges() {
        for (let k in this.viewTilesMap) {
            let t = this.viewTilesMap[k];
            for (let i = 0; i < 4; i++) {
                t.setBoderColor(i, 0);
            }
        }
    }

    /** 点亮当前前指定左边相关联的 右边 */
    private lightRightEdges(tile: TileView, edgeIdx: number) {
        let _conf = this.currTilePackage.config = this.mergeConfig(this.currTilePackage.config);
        let edge = `${getImgBaseName(tile.resName)}_${edgeIdx}`;

        //left
        let connectId = _conf.connectIdL[edge];
        let edges: string[] = [];
        if (connectId != null) {
            let rMap = _conf.connectIdR;
            for (let k in rMap) {
                if (rMap[k] == connectId) {
                    edges.push(k);
                }
            }
        }

        //right
        connectId = _conf.connectIdR[edge];
        if (connectId != null) {
            let lMap = _conf.connectIdL;
            for (let k in lMap) {
                if (lMap[k] == connectId) {
                    edges.push(k);
                }
            }
        }

        //
        for (let i = 0, len = edges.length; i < len; i++) {
            let v = edges[i];
            if (v == edge) { continue; }
            let baseName = v.substr(0, v.length - 2);
            let _edgeIdx = Number(v.substr(v.length - 1));
            let t = this.viewTilesMap[baseName];
            if (t) {
                t.setBoderColor(_edgeIdx, 2);
            }
        }
    }
}