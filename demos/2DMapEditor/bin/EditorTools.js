System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(",");
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
    exports_1("dataURLtoBlob", dataURLtoBlob);
    function blobToDataURL(blob, callback) {
        var a = new FileReader();
        a.onload = function (e) { callback(e.target.result); };
        a.readAsDataURL(blob);
    }
    exports_1("blobToDataURL", blobToDataURL);
    function getRightEdgeNum(rotate, dir) {
        return (rotate + dir + 2) % 4;
    }
    exports_1("getRightEdgeNum", getRightEdgeNum);
    function getImgBaseName(imgResName) {
        return imgResName.substring(0, imgResName.length - 4);
    }
    exports_1("getImgBaseName", getImgBaseName);
    function kv2ConnectID(neighbors) {
        var mapR = {};
        var mapL = {};
        neighbors.forEach(function (val) {
            var l = val.left;
            var r = val.right;
            var _tempL = mapL[l];
            if (!_tempL) {
                _tempL = mapL[l] = {};
            }
            _tempL[r] = true;
            var _tempR = mapR[r];
            if (!_tempR) {
                _tempR = mapR[r] = {};
            }
            _tempR[l] = true;
        });
        var rCount = 0;
        var connectIdR = {};
        var connectIdL = {};
        neighbors.forEach(function (val, i) {
            var l = val.left;
            var r = val.right;
            var rid = connectIdR[r];
            if (rid == null) {
                rid = connectIdL[l];
                if (rid == null) {
                    rid = ++rCount;
                }
                connectIdR[r] = rid;
            }
            var tempM = mapR[r];
            for (var k in tempM) {
                connectIdL[k] = rid;
            }
        });
        return { connectIdR: connectIdR, connectIdL: connectIdL };
    }
    exports_1("kv2ConnectID", kv2ConnectID);
    function connectID2KV(connectIdL, connectIdR) {
        var result = [];
        var idKVMap = {};
        for (var k in connectIdL) {
            var id = connectIdL[k];
            var arr = idKVMap[id];
            if (!arr) {
                arr = idKVMap[id] = [];
            }
            arr.push(k);
        }
        var _loop_1 = function (rK) {
            var id = connectIdR[rK];
            var arr = idKVMap[id];
            if (!arr) {
                return "continue";
            }
            arr.forEach(function (lK) {
                result.push({ left: lK, right: rK });
            });
        };
        for (var rK in connectIdR) {
            _loop_1(rK);
        }
        return result;
    }
    exports_1("connectID2KV", connectID2KV);
    function xhrLoad(url, type) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.responseType = type;
            req.open("GET", url);
            req.send();
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        resolve(req);
                    }
                    else {
                        reject();
                    }
                }
            };
        });
    }
    exports_1("xhrLoad", xhrLoad);
    function SetEleVisible(ID, isShow) {
        var Ele = document.getElementById(ID);
        if (Ele) {
            Ele.style.display = isShow ? "" : "none";
        }
    }
    exports_1("SetEleVisible", SetEleVisible);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=EditorTools.js.map