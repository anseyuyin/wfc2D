
import { ImageAsset, spriteAssembler, SpriteFrame, Texture2D, _decorator } from 'cc';
const { ccclass, property } = _decorator;

type imageMap = { [imgName: string]: SpriteFrame };
export type wfcDataImg = { config: WFC.wfc2dData, imgs: imageMap };

/** 加载 WFC 资源 */
export class WfcLoader {
    public static cacheMap: Map<string, any> = new Map();
    public static xhrLoad(url: string, type: XMLHttpRequestResponseType): Promise<XMLHttpRequest> {
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

    //请求加载资源
    public static async getWFC(path: string): Promise<wfcDataImg | null> {
        let result: wfcDataImg | null = null;
        let _dataUrl = `${path}data.json`;
        let req = await this.xhrLoad(_dataUrl, "json");
        let config: WFC.wfc2dData = req.response;
        if (!config) {
            alert(`没找到 ${_dataUrl}!`);
            return result;
        }

        //load img
        let imgPormies: Promise<any>[] = [];
        let imgs: imageMap = {};
        for (let k in config.tiles) {
            let _temp = config.tiles[k];
            let url = `${path}${k}${_temp[0]}`;
            let img = new Image();
            img.src = url;
            img.crossOrigin = "";   //跨越 设置，避免webgl 报错
            // img.width = img.height = cSize;
            let loadPormise = new Promise((resolve, reject) => {
                img.onload = () => {
                    //组装 成sprite
                    let spf = SpriteFrame.createWithImage(img);
                    imgs[k] = spf;
                    resolve(null);
                }
                img.onerror = reject;
            });
            imgPormies.push(loadPormise);
        }
        await Promise.all(imgPormies);
        result = { config, imgs };
        return result;
    }

}
