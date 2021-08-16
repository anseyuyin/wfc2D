
import { _decorator, Component, Node, Rect, UITransform, Canvas, Director, math, Vec2, tweenUtil, Layers } from 'cc';
import { Grid } from './grid';
const { ccclass, property } = _decorator;

@ccclass('TileMap')
export class TileMap extends Component {
    private static readonly helpV2: Vec2 = new Vec2();
    private static readonly helpRect: Rect = new Rect();

    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    private _gridSize = 200;
    @property
    private get gridSize() { return this._gridSize; };
    private set gridSize(val) {
        this._gridSize = val;
    };

    private grids: Grid[] = [];
    private _canvas: Canvas | null = null;
    private _gridMap: Map<string, Grid> = new Map();

    start() {
        // [3]
        let s = Director.instance.getScene();
        this._canvas = s?.getComponentInChildren(Canvas) as Canvas;

    }

    update(deltaTime: number) {
        this.ckBorderOver();
    }

    /** 检查是否超出了边界 */
    private ckBorderOver() {

        let bound = TileMap.helpRect;
        let pos = this.node.position;
        let canvasUITrans = this._canvas?.node.getComponent(UITransform) as UITransform;
        let halfW = canvasUITrans.width * 0.5;
        let halfH = canvasUITrans.height * 0.5;
        bound.set(-(pos.x + halfW), -(pos.y + halfH), canvasUITrans.width, canvasUITrans.height);
        //console.log(bound.toString());
        let xMin = Math.floor(bound.x / this._gridSize);
        let xMax = Math.floor((bound.x + bound.width) / this._gridSize);
        let yMin = Math.floor(bound.y / this._gridSize);
        let yMax = Math.floor((bound.y + bound.height) / this._gridSize);

        let _size = TileMap.helpV2;
        _size.x = xMax - xMin + 1;
        _size.y = yMax - yMin + 1;
        let gridPosArr: number[] = [];
        let addMap: Map<string, boolean> = new Map();
        let deleteMap: Map<string, boolean> = new Map();

        this._gridMap.forEach((v, k) => {
            deleteMap.set(k, true);
        });
        debugger;
        for (let i = 0; i < _size.x; i++) {
            for (let j = 0; j < _size.y; j++) {
                let x = i + xMin;
                let y = j + yMin;
                gridPosArr.push(x, y);
                let posKey = `${x}_${y}`;
                if (this._gridMap.has(posKey)) {
                    deleteMap.delete(posKey);
                } else {
                    addMap.set(posKey, true);
                }
            }
        }

        //删除超出的grid
        let _ks = deleteMap.keys();
        while (true) {
            let v = _ks.next();
            if (v.done) break;
            let _g = this._gridMap.get(v.value);
            _g?.hide();
            if (_g && _g.node.parent) {
                _g.node.parent.removeChild(_g.node);
            }
            Grid.poolDelete(_g as Grid);

            this._gridMap.delete(v.value);
        }

        //增加新增grid
        _ks = addMap.keys();
        while (true) {
            let v = _ks.next();
            if (v.done) break;
            let _g = Grid.poolNew();
            this.node.addChild(_g.node);
            _g.size = this._gridSize;
            _g.node.layer = Layers.Enum.UI_2D;
            _g.show();
            let _arr = v.value.split("_");
            _g.setGridPosition(new Vec2(Number(_arr[0]), Number(_arr[1])));

            this._gridMap.set(v.value, _g);
        }


        console.log(gridPosArr.toString());
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
