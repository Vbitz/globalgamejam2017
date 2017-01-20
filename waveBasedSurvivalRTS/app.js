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
    TileType[TileType["Floor"] = 0] = "Floor";
    TileType[TileType["Wall"] = 1] = "Wall";
})(TileType || (TileType = {}));
var TileInfo = (function () {
    function TileInfo(type, loadTileId, isSolid, isPassable) {
        this.Type = type;
        this.LoadTileID = loadTileId;
        this.IsSolid = isSolid;
        this.IsPassable = isPassable;
    }
    return TileInfo;
}());
var allTiles = [
    new TileInfo(TileType.Floor, 0),
    new TileInfo(TileType.Wall, 1)
];
var Map = (function () {
    function Map(width, height, startTileType) {
        this.Width = width;
        this.Height = height;
        this.mapData = [];
        for (var x = 0; x < width; x++) {
            this.mapData.push([]);
            for (var y = 0; y < height; y++) {
                this.mapData[x].push({
                    type: startTileType
                });
            }
        }
    }
    Map.forEach = function (width, height, mapData, cb) {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                cb(x, y, mapData[x][y]);
            }
        }
    };
    /*
        I don't have any clue what the map save format will look like but for now I will just
        declare it staticly or even use csv
    */
    Map.prototype.draw = function (ctx) {
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
