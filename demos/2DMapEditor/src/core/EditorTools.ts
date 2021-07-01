import { connectIDMap, EleIDNames, neighborData } from "./EditorTypes";

// tslint:disable-next-line: only-arrow-functions
export function dataURLtoBlob(dataurl) {
    let arr = dataurl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// tslint:disable-next-line: only-arrow-functions
export function blobToDataURL(blob, callback) {
    let a = new FileReader();
    a.onload = (e) => { callback(e.target.result); };
    a.readAsDataURL(blob);
}

/** 获取相对右边的 边编号值 */
// tslint:disable-next-line: only-arrow-functions
export function getRightEdgeNum(rotate: number, dir: number) {
    return (rotate + dir + 2) % 4;
}

/** 获取 图片资源的基础名（去掉后缀） */
// tslint:disable-next-line: only-arrow-functions
export function getImgBaseName(imgResName: string) {
    return imgResName.substring(0, imgResName.length - 4);
}

//左右 kv 数据转 连接ID数据
// tslint:disable-next-line: only-arrow-functions
export function kv2ConnectID(neighbors: neighborData[]): { connectIdR: connectIDMap, connectIdL: connectIDMap } {
    let mapR = {};
    let mapL = {};
    neighbors.forEach((val) => {
        let l = val.left;
        let r = val.right;
        //left
        let _tempL = mapL[l];
        if (!_tempL) {
            _tempL = mapL[l] = {};
        }
        _tempL[r] = true;

        //right
        let _tempR = mapR[r];
        if (!_tempR) {
            _tempR = mapR[r] = {};
        }
        _tempR[l] = true;

    });
    //r
    let rCount = 0;
    let connectIdR = {};
    let connectIdL = {};
    //梳理归纳connectId
    neighbors.forEach((val, i) => {
        let l = val.left;
        let r = val.right;
        //right
        let rid = connectIdR[r];
        let tempM: {} = mapR[r];
        if (rid == null) {
            for (let k in tempM) {
                rid = connectIdL[k];
                if (rid != null) { break; }
            }
            if (rid == null) {
                rid = ++rCount;
            }
            connectIdR[r] = rid;
        }
        for (let k in tempM) {
            connectIdL[k] = rid;
        }

    });

    return { connectIdR, connectIdL };
}

/** 连接ID数据 数据转 左右 kv */
// tslint:disable-next-line: only-arrow-functions
export function connectID2KV(connectIdL: connectIDMap, connectIdR: connectIDMap): neighborData[] {
    let result: neighborData[] = [];
    let idKVMap = {};
    for (let k in connectIdL) {
        let id = connectIdL[k];
        let arr: string[] = idKVMap[id];
        if (!arr) {
            arr = idKVMap[id] = [];
        }
        arr.push(k);
    }
    //
    for (let rK in connectIdR) {
        let id = connectIdR[rK];
        let arr: string[] = idKVMap[id];
        if (!arr) { continue; }
        arr.forEach((lK) => {
            result.push({ left: lK, right: rK });
        });
    }

    return result;
}

/** xmlhttpRequest 加载 */
// tslint:disable-next-line: only-arrow-functions
export function xhrLoad(url: string, type: XMLHttpRequestResponseType): Promise<XMLHttpRequest> {
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

/** 设置 指定Html元素 可见性 */
// tslint:disable-next-line: only-arrow-functions
export function SetEleVisible(ID: EleIDNames, isShow: boolean) {
    let Ele = document.getElementById(ID);
    if (Ele) {
        Ele.style.display = isShow ? "" : "none";
    }
}