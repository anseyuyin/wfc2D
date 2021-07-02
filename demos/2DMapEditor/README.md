# 瓦片编辑器
[编辑器链接](https://anseyuyin.github.io/wfc2D/demos/2DMapEditor/)
### 编辑器使用：

- ##### 准备素材的文件夹
![image](../../res/info/imgfolder.png)

- ##### 载入编辑的素材资源
![image](../../res/info/editorImport.png)

- ##### 编辑素材资源
![image](../../res/info/editorDetail.png)

- ##### 激活状态切换
##### 失活的瓦片，导出后不会参与逻辑运算，也可便于瓦片边连接错误筛查。

![image](../../res/info/stateSW.png)

- ##### 检查边的连接
![image](../../res/info/editorEdgeConnet.png)

- ##### 保存到本地
![image](../../res/info/editorDownload.png)


##### 保存的文件结构
```
 export.zip
    - data.json     //运行计算使用到的配置文件。
    - editor.json   //编辑器使用的配置文件。
    - images        //瓦片图片资源。
```
