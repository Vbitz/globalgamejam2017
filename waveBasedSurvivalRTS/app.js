// TODO: Basic system with nothing on the level (DONE)
// TODO: Flood fill map support
// TODO: Player charactor with non-turn based movement.
var Vector2 = (function () {
    function Vector2(x, y) {
        this.X = x;
        this.Y = y;
    }
    Vector2.prototype.hash = function () {
        // TODO: Better hashing method if this turns out to be a problem
        return this.X.toString(10) + ":" + this.Y.toString(10);
    };
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
    TileInfo.prototype.getIsSolid = function () {
        return this.IsSolid;
    };
    TileInfo.prototype.getIsPassable = function () {
        return this.IsPassable;
    };
    TileInfo.prototype.draw = function (ctx, rect) {
        this.Render.draw(ctx, rect);
    };
    return TileInfo;
}());
var allTiles = [
    new TileInfo(TileType.Floor, 0, false, true).setColor(new Color("white")),
    new TileInfo(TileType.Wall, 1, false, false).setColor(new Color("grey"))
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
    Map.prototype.getTileWithInfo = function (x, y) {
        return getTileInfoByType(this.MapData[x][y].type);
    };
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
    Map.prototype.createPathfindingMap = function (xL, yL, maxSteps) {
        if (maxSteps === void 0) { maxSteps = Number.MAX_VALUE; }
        var self = this;
        var map = new DijkstraMap(this.Width, this.Height, true);
        map.updateWithCallback(function (x, y, initalValue) {
            if (!self.getTileWithInfo(x, y).getIsPassable()) {
                return undefined;
            }
            if (x == xL && y == yL) {
                return 0;
            }
            else {
                return initalValue;
            }
        });
        map.propigateMap(maxSteps);
        return map;
    };
    Map.prototype.loadFromDocument = function (documentStr) {
    };
    return Map;
}());
var DijkstraMap = (function () {
    function DijkstraMap(w, h, inverse) {
        this.Width = w;
        this.Height = h;
        this.Inverse = inverse;
        this.InitalValue = inverse ? Number.MAX_VALUE : 0;
        this.PropigateTileList = [];
        this.MapData = [];
        for (var x = 0; x < this.Width; x++) {
            this.MapData.push([]);
            for (var y = 0; y < this.Height; y++) {
                this.MapData[x].push(this.InitalValue);
            }
        }
    }
    DijkstraMap.prototype.updateWithCallback = function (cb) {
        var _this = this;
        forEach(this.Width, this.Height, this.MapData, function (x, y, currentValue) {
            _this.MapData[x][y] = cb(x, y, currentValue);
        });
    };
    DijkstraMap.prototype.propigateMap = function (maxSteps) {
        var _this = this;
        if (maxSteps === void 0) { maxSteps = Number.MAX_VALUE; }
        var self = this;
        if (this.PropigateTileList.length == 0) {
            forEach(this.Width, this.Height, this.MapData, function (x, y, currentValue) {
                if (currentValue == _this.InitalValue) {
                    if (!self.isTileInital(x - 1, y) ||
                        !self.isTileInital(x + 1, y) ||
                        !self.isTileInital(x, y - 1) ||
                        !self.isTileInital(x, y + 1)) {
                        _this.PropigateTileList.push(new Vector2(x, y));
                    }
                }
            });
        }
        var currentSteps = 0;
        while (this.PropigateTileList.length > 0 && currentSteps < maxSteps) {
            var nextTile = this.PropigateTileList.shift();
            var nextTileX = nextTile.X;
            var nextTileY = nextTile.Y;
            if (!this.isTileInital(nextTileX, nextTileY)) {
                continue;
            }
            var lowestValue = 0;
            if (this.Inverse) {
                lowestValue = Math.min(this.getValueAtPoint(nextTileX - 1, nextTileY), this.getValueAtPoint(nextTileX + 1, nextTileY), this.getValueAtPoint(nextTileX, nextTileY - 1), this.getValueAtPoint(nextTileX, nextTileY + 1));
            }
            else {
                lowestValue = Math.max(this.getValueAtPoint(nextTileX - 1, nextTileY), this.getValueAtPoint(nextTileX + 1, nextTileY), this.getValueAtPoint(nextTileX, nextTileY - 1), this.getValueAtPoint(nextTileX, nextTileY + 1));
            }
            if (lowestValue == this.InitalValue) {
                this.PropigateTileList.push(nextTile);
            }
            else {
                this.setTileAtPoint(nextTileX, nextTileY, lowestValue);
                this.PropigateTileList.push(new Vector2(nextTileX - 1, nextTileY));
                this.PropigateTileList.push(new Vector2(nextTileX + 1, nextTileY));
                this.PropigateTileList.push(new Vector2(nextTileX, nextTileY - 1));
                this.PropigateTileList.push(new Vector2(nextTileX, nextTileY + 1));
            }
            currentSteps++;
        }
        return this.PropigateTileList.length == 0;
    };
    DijkstraMap.prototype.getValueAtPoint = function (x, y) {
        // if (x < 0 || x > this.Width - 1 || y < 0 || y < this.Height - 1) {
        //     return this.InitalValue;
        // }
        return this.MapData[x][y];
    };
    DijkstraMap.prototype.isTileInital = function (x, y) {
        return this.getValueAtPoint(x, y) == this.InitalValue;
    };
    DijkstraMap.prototype.setTileAtPoint = function (x, y, value) {
        this.MapData[x][y] = value;
    };
    DijkstraMap.prototype.draw = function (ctx, transformCallback) {
        var self = this;
        forEach(this.Width, this.Height, this.MapData, function (x, y, value) {
            var rect = transformCallback(new Vector2(x, y));
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            var value = self.getValueAtPoint(x, y);
            if (value != self.InitalValue) {
                ctx.fillText(value.toString(10), rect.X + 16, rect.Y + 16);
            }
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
            else {
                if (Math.random() > 0.8) {
                    map.setTile(x, y, TileType.Wall);
                }
            }
        }
    }
    renderableList.push(map);
    var pathFindingMap = map.createPathfindingMap(5, 5, 1);
    setTimeout(function propigateMapAgain() {
        if (!pathFindingMap.propigateMap(1)) {
            setTimeout(propigateMapAgain, 1000);
        }
    }, 1000);
    function update() {
        ctx.fillStyle = "cornflowerBlue";
        ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        renderableList.forEach(function (renderable) {
            renderable.draw(ctx);
        });
        pathFindingMap.draw(ctx, map.levelToScreen.bind(map));
        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
}
window.addEventListener("DOMContentLoaded", main);
