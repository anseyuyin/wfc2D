declare namespace WFC {
    type edgeConnectIDMap = {
        [edge: string]: number;
    };
    /** struct type of init  */
    export type wfc2dData = {
        tiles: {
            [rawName: string]: [string, number, number[]];
        };
        connectIdL: edgeConnectIDMap;
        connectIdR: edgeConnectIDMap;
    };
    /** wave function collapse of 2d test*/
    export class WFC2D {
        constructor(_dataArr: wfc2dData);
        /** id list of models */
        private idList;
        private modelMap;
        private allSlots;
        private activeSlotMap;
        private width;
        private height;
        /** count of solve process */
        private solveCount;
        private modelIDResInfoMap;
        /** queue of backoff data */
        private backoffCaptureQueue;
        /** initial state capture of slot */
        private initialCapture;
        /** current count of backOff */
        private backOffCount;
        /** max lentgh of capture Slot data Queue*/
        private capQueueMaxLen;
        /** max Count of backOff action */
        private backOffMaxNum;
        /** percent of tiles total , sampling rate of capture slot data (xx%)*/
        private capCycleRate;
        /** cycle of capture slot data  */
        private capCycle;
        /** counter of capture */
        private capSlotCount;
        /** collapse is complete */
        private isComplete;
        /** count of current captrue queue */
        private currCapQueCount;
        /** state of Collapsing */
        private _isCollapsing;
        /** start time of collapse */
        private startTime;
        /** state of Known data */
        private KnownState;
        /** map of tileName - resID */
        private tileNameIDMap;
        /**
         * 是否正在 坍缩
         * state of Collapsing
         */
        get isCollapseing(): boolean;
        /**
         * 设置已知条件，明确的设定相应坐标为具体的瓦片。  set Known condition of which Tiles in this position.
         * @param stateData 状态信息 {坐标x, 坐标y, {具体的瓦片, 旋转类型(0=0 , 1=90 ,2=180 ,3=270)}[]}。
         */
        setKnown(stateData: {
            x: number;
            y: number;
            tiles: [string, number][];
        }[]): void;
        /**
         * 清理 设定的已知条件 。clear all of setKnown
         */
        clearKnown(): void;
        /**
         * （同步版） 执行 坍塌,生成地图数据
         * (sync ver) calculate once collapse
         * @param width             地图宽度 width of map.
         * @param height            地图高度 height of map.
         * @param backOffMaxNum     遇到失败时，返回到前状态重试的最大次数 Max times of back off last state on collapse error.
         * @param capQueueMaxLen    缓存前状态队列的最大长度 queue max length of capture last state.
         * @param capRate           缓存率0-1 范围，决定间隔多少次坍塌周期缓存一次 rate of captrue (range 0 - 1), set cycle of capture state.
         * @returns
         */
        collapseSync(width: number, height: number, backOffMaxNum?: number, capQueueMaxLen?: number, capRate?: number): [string, number][];
        /**
         * 执行 坍塌,生成地图数据
         * calculate once collapse
         * @param width             地图宽度 width of map.
         * @param height            地图高度 height of map.
         * @param backOffMaxNum     遇到失败时，返回到前状态重试的最大次数 Max times of back off last state on collapse error.
         * @param capQueueMaxLen    缓存前状态队列的最大长度 queue max length of capture last state.
         * @param capRate           缓存率0-1 范围，决定间隔多少次坍塌周期缓存一次 rate of captrue (range 0 - 1), set cycle of capture state.
         * @param frameMaxTime      每帧最大计算耗时(单位 秒) max time of spend on one frame. (calculation be split to more frame)
         * @returns
         */
        collapse(width: number, height: number, backOffMaxNum?: number, capQueueMaxLen?: number, capRate?: number, frameMaxTime?: number): Promise<[string, number][]>;
        /** set init of Collapse*/
        private setCollapseInit;
        /** get collapse result data*/
        private resultCollapse;
        /** set data before collapse */
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
