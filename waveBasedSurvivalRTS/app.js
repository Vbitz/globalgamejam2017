var Vector2 = (function () {
    function Vector2(x, y) {
    }
    return Vector2;
}());
var Rectangle = (function () {
    function Rectangle() {
    }
    return Rectangle;
}());
var TileType;
(function (TileType) {
    TileType[TileType["Grass"] = 0] = "Grass";
    TileType[TileType["Wall"] = 1] = "Wall";
    TileType[TileType["Floor"] = 2] = "Floor";
})(TileType || (TileType = {}));
var TileInfo = (function () {
    function TileInfo(type) {
        this.Type = type;
    }
    return TileInfo;
}());
var Map = (function () {
    function Map() {
    }
    /*
        I don't have any clue what the map save format will look like but I expect there will be
        a series of AI spawn points and
    */
    Map.prototype.draw = function (ctx) {
        ctx.font = "72px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText("Hello, World", 100, 100);
    };
    Map.prototype.loadFromDocument = function (documentStr) {
    };
    return Map;
}());
var TileEntity = (function () {
    function TileEntity() {
    }
    TileEntity.prototype.draw = function (ctx) {
    };
    return TileEntity;
}());
window.addEventListener("DOMContentLoaded", function () {
    var mainCanvas = document.querySelector("#mainCanvas");
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    var ctx = mainCanvas.getContext("2d");
    var renderableList = [];
    var map = new Map();
    renderableList.push(map);
    function update() {
        ctx.fillStyle = "cornflowerBlue";
        ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        renderableList.forEach(function (renderable) {
            renderable.draw(ctx);
        });
        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
});
