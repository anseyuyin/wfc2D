export declare type connectIDMap = {
    [edge: string]: number;
};
export declare type neighborData = {
    left: string;
    right: string;
};
export declare type tileImg = {
    fileName: string;
    dataB64: string;
};
export declare type tilePackage = {
    imgs: tileImg[];
    config: tileConfig;
};
export declare type tileConfig = {
    tiles: {
        [resName: string]: any[];
    };
    deactivate: {
        [resName: string]: boolean;
    };
    neighbor: neighborData[];
    connectIdR: connectIDMap;
    connectIdL: connectIDMap;
};
export declare type EleIDNames = "importFolderLi" | "importSampleLi" | "exportLi" | "tilesViewLi" | "tilesInfoLi" | "tilesSelectLi" | "tilesVSLi" | "SWOptionLi";
