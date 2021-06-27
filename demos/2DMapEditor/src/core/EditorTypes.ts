
export type connectIDMap = { [edge: string]: number };
export type neighborData = { left: string, right: string };
export type tileConfig = { tiles: { [resName: string]: any[] }, neighbor: neighborData[], connectIdR: connectIDMap, connectIdL: connectIDMap };
export type tileImg = { fileName: string, dataB64: string };
export type tilePackage = { imgs: tileImg[], config: tileConfig };
// tslint:disable-next-line: max-line-length
export type EleIDNames = "importFolderLi" | "importSampleLi" | "exportLi" | "tilesViewLi" | "tilesInfoLi" | "tilesSelectLi" | "tilesVSLi" | "SWOptionLi";