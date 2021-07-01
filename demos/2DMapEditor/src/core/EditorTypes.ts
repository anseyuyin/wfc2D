
export type connectIDMap = { [edge: string]: number };
export type neighborData = { left: string, right: string };
export type tileImg = { fileName: string, dataB64: string };
export type tilePackage = { imgs: tileImg[], config: tileConfig };
// tslint:disable-next-line: max-line-length
export type tileConfig = { tiles: { [resName: string]: any[] }, deactivate: { [resName: string]: boolean }, neighbor: neighborData[], connectIdR: connectIDMap, connectIdL: connectIDMap };
// tslint:disable-next-line: max-line-length
export type EleIDNames = "importFolderLi" | "importSampleLi" | "exportLi" | "tilesViewLi" | "tilesInfoLi" | "tilesSelectLi" | "tilesVSLi" | "SWOptionLi";