
import { _decorator, Component, Node, macro, dynamicAtlasManager } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AppMain')
export class AppMain {
    static init() {
        //开启 动态合图
        macro.CLEANUP_IMAGE_CACHE = false;
        dynamicAtlasManager.enabled = true;
    }
}

AppMain.init();
