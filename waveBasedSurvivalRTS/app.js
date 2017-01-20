// TODO: Basic system with nothing on the level (DONE)
// TODO: Flood fill map support
// TODO: Player charactor with non-turn based movement.
var Vector2 = (function () {
    function Vector2(x, y) {
        this.X = x;
        this.Y = y;
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
    function Rectangle(x, y, w, h) {
        this.X = x;
        this.Y = y;
        this.Width = w;
        this.Height = h;
    }
    Rectangle.prototype.add = function (vec) {
        return new Rectangle(this.X + vec.X, this.Y + vec.Y, this.Width, this.Height);
    };
    return Rectangle;
}());
var TileType;
(function (TileType) {
    TileType[TileType["Floor"] = 0] = "Floor";
    TileType[TileType["Wall"] = 1] = "Wall";
})(TileType || (TileType = {}));
;
var SolidRenderBrush = (function () {
    function SolidRenderBrush(color) {
        this.RenderColor = color;
    }
    SolidRenderBrush.prototype.draw = function (ctx, rect) {
        ctx.fillStyle = this.RenderColor.Color;
        ctx.fillRect(rect.X, rect.Y, rect.Width, rect.Height);
    };
    return SolidRenderBrush;
}());
;
var TileInfo = (function () {
    function TileInfo(type, loadTileId, isSolid, isPassable) {
        this.Type = type;
        this.LoadTileID = loadTileId;
        this.IsSolid = isSolid;
        this.IsPassable = isPassable;
    }
    TileInfo.prototype.setColor = function (col) {
        this.Render = new SolidRenderBrush(col);
        return this;
    };
    TileInfo.prototype.getType = function () {
        return this.Type;
    };
    TileInfo.prototype.draw = function (ctx, rect) {
        this.Render.draw(ctx, rect);
    };
    return TileInfo;
}());
var allTiles = [
    new TileInfo(TileType.Floor, 0, false, true).setColor(new Color("white")),
    new TileInfo(TileType.Wall, 1, false, true).setColor(new Color("grey"))
];
function getTileInfoByType(type) {
    var ret = allTiles.filter(function (value) { return value.getType() == type; });
    if (ret.length == 1) {
        return ret[0];
    }
    else {
        throw new Error("Bad Tile Type");
    }
}
var TILE_SIZE = 32;
function forEach(width, height, mapData, cb) {
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            cb(x, y, mapData[x][y]);
        }
    }
}
// The turn based method is going to be implemented as runNextTurn(cb)
var Map = (function () {
    function Map(width, height, startTileType) {
        this.Width = width;
        this.Height = height;
        this.MapData = [];
        for (var x = 0; x < width; x++) {
            this.MapData.push([]);
            for (var y = 0; y < height; y++) {
                this.MapData[x].push({
                    type: startTileType
                });
            }
        }
    }
    /*
        I don't have any clue what the map save format will look like but for now I will just
        declare it staticly or even use csv
    */
    Map.prototype.draw = function (ctx) {
        var self = this;
        forEach(this.Width, this.Height, this.MapData, function (x, y, tile) {
            getTileInfoByType(tile.type).draw(ctx, self.levelToScreen(new Vector2(x, y)));
        });
    };
    Map.prototype.levelToScreen = function (localLocation) {
        return new Rectangle(localLocation.X * TILE_SIZE, localLocation.Y * TILE_SIZE, TILE_SIZE, TILE_SIZE).add(new Vector2(60, 60));
    };
    Map.prototype.setTile = function (x, y, type) {
        this.MapData[x][y] = {
            type: type
        };
    };
    Map.prototype.loadFromDocument = function (documentStr) {
    };
    return Map;
}());
var DijkstraMap = (function () {
    function DijkstraMap(owner) {
        this.Owner = owner;
        this.MapData = [];
        for (var x = 0; x < this.Owner.Width; x++) {
            this.MapData.push([]);
            for (var y = 0; y < this.Owner.Height; y++) {
                this.MapData[x].push(0);
            }
        }
    }
    DijkstraMap.prototype.initWithCallback = function (cb) {
    };
    DijkstraMap.prototype.drawDebug = function (ctx) {
        var self = this;
        forEach(this.Owner.Width, this.Owner.Height, this.MapData, function (x, y, value) {
            var ret = self.Owner.levelToScreen(new Vector2(x, y));
        });
    };
    return DijkstraMap;
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
function main() {
    var mainCanvas = document.querySelector("#mainCanvas");
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    var ctx = mainCanvas.getContext("2d");
    var renderableList = [];
    var map = new Map(48, 24, TileType.Floor);
    for (var x = 0; x < 48; x++) {
        for (var y = 0; y < 24; y++) {
            if (x == 0 || x == 47 || y == 0 || y == 23) {
                map.setTile(x, y, TileType.Wall);
            }
        }
    }
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
}
window.addEventListener("DOMContentLoaded", main);