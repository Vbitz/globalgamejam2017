// TODO: Basic system with nothing on the level
// TODO: Player charactor with non-turn based movement.
var Vector2 = (function () {
    function Vector2(x, y) {
    }
    return Vector2;
}());
var Color = (function () {
    function Color(color) {
        this.Color = color;
    }
    Color.fromRGB = function (r, g, b) {
        return new Color("rgb(" + r.toString(10) + ", " + g.toString(10) + ", " + b.toString(10) + ")");
    };
    return Color;
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
    function TileInfo(type, loadTileId) {
        this.Type = type;
    }
    return TileInfo;
}());
var allTiles = [];
var Map = (function () {
    function Map() {
    }
    /*
        I don't have any clue what the map save format will look like but for now I will just
        declare it staticly or even use csv
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
    function TileEntity(owner, spawnLocation) {
        this.Owner = owner;
        this.Location = spawnLocation;
    }
    TileEntity.prototype.draw = function (ctx) {
        var baseRect = this.Owner.levelToScreen(this.Location);
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
