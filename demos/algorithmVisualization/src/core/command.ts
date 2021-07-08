// tslint:disable-next-line: only-arrow-functions
export function setState(ehtml: HTMLElement, color: string, g = -1, h = -1) {
    let sta = new StateData(color, g, h);
    CommandMgr.Instance.execute(new RectSetCommand(ehtml, sta));
}

// tslint:disable-next-line: only-arrow-functions
export function batState(States: { ehtml: HTMLElement, color: string, g: number, h: number }[]) {
    let batc = new BatchCommand();
    States.forEach((sub) => {
        let sta = new StateData(sub.color, sub.g, sub.h);
        batc.addComd(new RectSetCommand(sub.ehtml, sta));
    });
    CommandMgr.Instance.execute(batc);
}

//命令模式 接口
export interface ICommand {
    execute();
    undo();
}

export class StateData {
    constructor(public color: string, public g = 0, public h = 0) {
    }
}

export class RectSetCommand implements ICommand {
    constructor(public htmle: HTMLElement, public sta: StateData) {
        let _g = this.htmle.getElementsByClassName("class_g")[0];
        let _h = this.htmle.getElementsByClassName("class_h")[0];
        this.lastSta = new StateData(htmle.style.background, Number(_g.textContent), Number(_h.textContent));
    }
    private lastSta: StateData;

    public execute() {
        this.htmle.style.background = this.sta.color;
        let fText = this.htmle.getElementsByClassName("class_f")[0];
        let gText = this.htmle.getElementsByClassName("class_g")[0];
        let hText = this.htmle.getElementsByClassName("class_h")[0];
        fText.textContent = `${this.sta.g + this.sta.h}`;
        gText.textContent = `${this.sta.g}`;
        hText.textContent = `${this.sta.h}`;
        (fText as HTMLElement).style.display = this.sta.g + this.sta.h < 0 ? "none" : "";
        (gText as HTMLElement).style.display = this.sta.g < 0 ? "none" : "";
        (hText as HTMLElement).style.display = this.sta.h < 0 ? "none" : "";

    }

    public undo() {
        this.htmle.style.background = this.lastSta.color;
        let fText = this.htmle.getElementsByClassName("class_f")[0];
        let gText = this.htmle.getElementsByClassName("class_g")[0];
        let hText = this.htmle.getElementsByClassName("class_h")[0];
        fText.textContent = `${this.lastSta.g + this.lastSta.h}`;
        gText.textContent = `${this.lastSta.g}`;
        hText.textContent = `${this.lastSta.h}`;
        (fText as HTMLElement).style.display = this.lastSta.g + this.lastSta.h < 0 ? "none" : "";
        (gText as HTMLElement).style.display = this.lastSta.g < 0 ? "none" : "";
        (hText as HTMLElement).style.display = this.lastSta.h < 0 ? "none" : "";
    }
}

export class BatchCommand implements ICommand {
    private comds: ICommand[] = [];
    public addComd(comd: ICommand) {
        this.comds.push(comd);
    }
    public execute() {
        this.comds.forEach((element) => {
            if (element) { element.execute(); }
        });
    }

    public undo() {
        this.comds.forEach((element) => {
            if (element) { element.undo(); }
        });
    }
}

export class CommandMgr {
    private static _instance: CommandMgr;
    static get Instance() {
        if (!this._instance) {
            this._instance = new CommandMgr();
            document["commandMgr"] = this._instance;// 暴露出去
        }
        return this._instance;
    }

    get index() { return this.currIdx; }
    get length() { return this.coms.length; }
    private currIdx = -1;
    private coms: ICommand[] = [];

    public execute(com: ICommand) {
        if (!com) { return; }
        this.coms.push(com);
        com.execute();
        this.currIdx = this.coms.length - 1;
    }

    public undo() {
        if (this.currIdx < 0) { return; }
        let com = this.coms[this.currIdx];
        if (!com) { return; }
        com.undo();
        this.currIdx--;
    }

    public recovery() {
        if (this.currIdx >= this.coms.length - 1) { return; }
        this.currIdx++;
        let com = this.coms[this.currIdx];
        if (!com) { return; }
        com.execute();
    }

    public clear() {
        this.coms.length = 0;
        this.currIdx = -1;
    }
}