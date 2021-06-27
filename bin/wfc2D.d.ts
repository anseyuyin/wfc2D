declare namespace WFC {
    type edgeConnectIDMap = {
        [edge: string]: number;
    };
    export type wfc2dData = {
        tiles: {
            [rawName: string]: [string, number, number[]];
        };
        connectIdL: edgeConnectIDMap;
        connectIdR: edgeConnectIDMap;
    };
    export class WFC2D {
        constructor(_dataArr: wfc2dData);
        private idList;
        private modelMap;
        private allSlots;
        private activeSlotMap;
        private width;
        private height;
        private solveCount;
        private modelIDResInfoMap;
        private backoffCaptureQueue;
        private initialCapture;
        private backOffCount;
        private capQueueMaxLen;
        private backOffMaxNum;
        private capCycleRate;
        private capCycle;
        private capSlotCount;
        private isComplete;
        private currCapQueCount;
        private isCollapsing;
        private startTime;
        collapseSync(width: number, height: number, backOffMaxNum?: number, capQueueMaxLen?: number, capRate?: number): [string, number][];
        collapse(width: number, height: number, backOffMaxNum?: number, capQueueMaxLen?: number, capRate?: number, frameMaxTime?: number): Promise<[string, number][]>;
        private setCollapseInit;
        private resultCollapse;
        private setData;
        private getNeighbor;
        private calculate;
        private calculateSync;
        private _doCollapse;
        private captureAllSlot;
        private _backOff;
    }
    export {};
}
