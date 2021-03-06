export declare class Editor2DMap {
    constructor();
    private readonly outwardName;
    private readonly outwardEditorInited;
    private readonly dataFile;
    private readonly editorFile;
    private readonly exportFile;
    private readonly rotateList;
    private size;
    private vsTileSacle;
    private gap;
    private selectEle;
    private fileEle;
    private selectOptionEle;
    private importFilesEle;
    private exportFileEle;
    private swOptionAllEle;
    private swOptionCancelEle;
    private viewEditorModeEle;
    private viewDeActiveModeEle;
    private infoEle;
    private vsTiles;
    private currTilePackage;
    private viewIdNameMap;
    private ViewResNameIDMap;
    private resNameImgMap;
    private currSelectTiles;
    private currSelectTile;
    private currViewID;
    private currNeighborMap;
    private viewTilesMap;
    private neighborDirty;
    private isSwitchMode;
    private viewContentMaxWSize;
    private genCellViewTile;
    private genCellSelectTile;
    private setInfo;
    private init;
    private setUI;
    private setVisible;
    private getViewContentMaxWSize;
    private setView;
    private ckRefreshViewLayout;
    private setVSTiles;
    private getValidNeighborMap;
    private onVSTileActiveCG;
    private onViewEditor;
    private onSelectEditor;
    private onSelectOver;
    private onSelectLeave;
    private setSelectEditor;
    private setVSEdge;
    private setVSCenterID;
    private setSelectByID;
    private onExportClik;
    private allViewSelect;
    private allViewActiveCKbox;
    private mergeConfig;
    private neighborParse;
    private setDefTileImg;
    private onFileChange;
    private setDataByFileList;
    private onSelectImport;
    private clearSelect;
    private clearVSEdges;
    private clearView;
    private clearAll;
    private setSelectArr;
    private onViewTileClick;
    private onSelectTileClick;
    private onSelectPointOver;
    private onSelectPointLeave;
    private onViewTileOver;
    private onBoderEnter;
    private onBoderLeave;
    private offLightEdges;
    private lightRightEdges;
}
