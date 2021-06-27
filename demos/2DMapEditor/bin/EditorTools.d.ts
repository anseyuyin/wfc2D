import { connectIDMap, EleIDNames, neighborData } from "./EditorTypes";
export declare function dataURLtoBlob(dataurl: any): Blob;
export declare function blobToDataURL(blob: any, callback: any): void;
export declare function getRightEdgeNum(rotate: number, dir: number): number;
export declare function getImgBaseName(imgResName: string): string;
export declare function kv2ConnectID(neighbors: neighborData[]): {
    connectIdR: connectIDMap;
    connectIdL: connectIDMap;
};
export declare function connectID2KV(connectIdL: connectIDMap, connectIdR: connectIDMap): neighborData[];
export declare function xhrLoad(url: string, type: XMLHttpRequestResponseType): Promise<XMLHttpRequest>;
export declare function SetEleVisible(ID: EleIDNames, isShow: boolean): void;
