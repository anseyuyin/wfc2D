# wfc2D
## 说明
通过波函数坍塌（Wave Function Collapse）算法，生成 2d 地图。

[![image](./res/info/cover.png)](https://anseyuyin.github.io/wfc2D/demos/2DMapExample/)

[样例](https://anseyuyin.github.io/wfc2D/demos/2DMapExample/) 

## 快速开始
- ##### 准备好演算数据
    获取方式一：直接测试样例 res/samples/*

    获取方式二：准备一个放置好素材的文件夹 ==> 使用 "[瓦片编辑器](https://github.com/anseyuyin/wfc2D/blob/main/demos/2DMapEditor/README.md) 打开编辑 ==> 保存

- ##### 在浏览器中使用
````html
//html 中加载js 文件
<script src="wfc2D.js"></script>
````
````javascript
//得到配置对象 (xxxloadJson 替换成自己的加载json的函数)
var jsonConf = xxxloadJson(`xxx/data.json`);
//创建 WFC2D
var wfc2d = new WFC.WFC2D(jsonConf);
//设定地图尺寸
var mapWidth = 100;
var mapHeigth = 100;
//计算生成 地图数据 ，返回数据类型 数组 [[string,number],.....]
var resultMap = wfc2d.collapse(mapWidth, mapHeigth);

//绘制地图的每个瓦片
var count = 0;
for (var y = 0; y < mapWidth; y++) {
    for (var x = 0; x < mapHeigth; x++) {
        var imgData = resultMap[count];
        //图片资源名 , 类型 string
        var imgName:  = imgData[0];
        //图片顺时针旋转次数（每次90度）, 类型 number 
        var rotate = imgData[1];
        //绘制 一个 瓦片到容器  (xxxDrawTile 替换成自己的绘制函数)
        xxxDrawTile(x , y , imgName , rotate);
    }
}

````

## 瓦片编辑器
[编辑器链接](https://anseyuyin.github.io/wfc2D/demos/2DMapEditor/)
[![image](./res/info/editor_course.gif)](https://anseyuyin.github.io/wfc2D/demos/2DMapEditor/)

## 参考

- [mxgmn/WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse)