// TODO: Basic system with nothing on the level (DONE)
// TODO: Flood fill map support (DONE)
// TODO: Player charactor with turn based movement.
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Vector2 = (function () {
    function Vector2(x, y) {
        this.X = x;
        this.Y = y;
    }
    Vector2.prototype.add = function (val) {
        return new Vector2(this.X + val.X, this.Y + val.Y);
    };
    Vector2.prototype.sub = function (val) {
        return new Vector2(this.X - val.X, this.Y - val.Y);
    };
    Vector2.prototype.mul = function (val) {
        return new Vector2(this.X * val.X, this.Y * val.Y);
    };
    Vector2.prototype.div = function (val) {
        return new Vector2(this.X / val.X, this.Y / val.Y);
    };
    Vector2.prototype.round = function () {
        return new Vector2(Math.round(this.X), Math.round(this.Y));
    };
    Vector2.prototype.clone = function () {
        return new Vector2(this.X, this.Y);
    };
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
    Rectangle.prototype.shrink = function (val) {
        return new Rectangle(this.X + val, this.Y + val, this.Width - (val * 2), this.Height - (val * 2));
    };
    return Rectangle;
}());
function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
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
        this.TileEntityList = [];
    }
    Map.prototype.getTileWithInfo = function (x, y) {
        return getTileInfoByType(this.MapData[x][y].type);
    };
    Map.prototype.addTileEntity = function (ent) {
        this.TileEntityList.push(ent);
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
        this.TileEntityList.forEach(function (te) {
            te.draw(ctx);
        });
    };
    Map.prototype.mouseLeftClick = function (x, y) {
    };
    Map.prototype.levelToScreen = function (localLocation) {
        return new Rectangle(localLocation.X * TILE_SIZE, localLocation.Y * TILE_SIZE, TILE_SIZE, TILE_SIZE).add(new Vector2(60, 60));
    };
    Map.prototype.screenToLevel = function (screenLocation) {
        var ret = screenLocation.clone();
        ret = ret.sub(new Vector2(60, 60));
        ret = ret.div(new Vector2(TILE_SIZE, TILE_SIZE));
        ret = ret.round();
        return ret;
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
                return -1;
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
    Map.prototype.getRandomValidSpawnLocation = function () {
        while (true) {
            var newLocation = new Vector2(rand(0, this.Width), rand(0, this.Height));
            if (this.getTileWithInfo(newLocation.X, newLocation.Y).getIsPassable()) {
                return newLocation;
            }
        }
    };
    Map.prototype.advanceTurn = function () {
        this.NextTurnActionList.forEach(function (cb) {
            cb();
        });
    };
    Map.prototype.scheduleForNextTurn = function (cb) {
        this.NextTurnActionList.push(cb);
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
                    if (self.isTileValid(x - 1, y) ||
                        self.isTileValid(x + 1, y) ||
                        self.isTileValid(x, y - 1) ||
                        self.isTileValid(x, y + 1)) {
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
            var valuesToCheck = [];
            if (this.getValueAtPoint(nextTileX - 1, nextTileY) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX - 1, nextTileY));
            }
            if (this.getValueAtPoint(nextTileX + 1, nextTileY) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX + 1, nextTileY));
            }
            if (this.getValueAtPoint(nextTileX, nextTileY - 1) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX, nextTileY - 1));
            }
            if (this.getValueAtPoint(nextTileX, nextTileY + 1) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX, nextTileY + 1));
            }
            if (this.Inverse) {
                lowestValue = Math.min.apply(Math, valuesToCheck);
            }
            else {
                lowestValue = Math.max.apply(Math, valuesToCheck);
            }
            if (lowestValue == this.InitalValue) {
                this.PropigateTileList.push(nextTile);
            }
            else {
                this.setTileAtPoint(nextTileX, nextTileY, lowestValue + (this.Inverse ? 1 : -1));
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
        return this.MapData[x][y];
    };
    DijkstraMap.prototype.isTileInital = function (x, y) {
        return this.getValueAtPoint(x, y) == this.InitalValue;
    };
    DijkstraMap.prototype.isTileValid = function (x, y) {
        return (this.getValueAtPoint(x, y) >= 0) && !this.isTileInital(x, y);
    };
    DijkstraMap.prototype.setTileAtPoint = function (x, y, value) {
        this.MapData[x][y] = value;
    };
    DijkstraMap.prototype.forEach = function (cb) {
        forEach(this.Width, this.Height, this.MapData, cb);
    };
    DijkstraMap.prototype.draw = function (ctx, transformCallback) {
        var self = this;
        this.forEach(function (x, y, value) {
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
        this.RenderColor = new Color("deepPink");
    }
    TileEntity.prototype.setLocation = function (newLocation) {
        this.Location = newLocation;
    };
    TileEntity.prototype.getLocation = function () {
        return this.Location;
    };
    TileEntity.prototype.setColor = function (newColor) {
        this.RenderColor = newColor;
    };
    TileEntity.prototype.getOwner = function () {
        return this.Owner;
    };
    TileEntity.prototype.draw = function (ctx) {
        var baseRect = this.Owner.levelToScreen(this.Location);
        ctx.fillStyle = this.RenderColor.Color;
        ctx.fillRect(baseRect.X, baseRect.Y, baseRect.Width, baseRect.Height);
    };
    TileEntity.prototype.mouseLeftClick = function (x, y) {
    };
    return TileEntity;
}());
var CharacterEntity = (function (_super) {
    __extends(CharacterEntity, _super);
    function CharacterEntity(owner, spawnLocation) {
        var _this = _super.call(this, owner, spawnLocation) || this;
        _this.MovesPerTurn = 5;
        _this.CurrentActions = _this.MovesPerTurn;
        _this.CurrentActionMap = null;
        return _this;
    }
    CharacterEntity.prototype.setMovesPerTurn = function (movesPerTurn) {
        this.CurrentActions = this.CurrentActions + (movesPerTurn - this.MovesPerTurn);
        this.MovesPerTurn = movesPerTurn;
        this.recalculateCurrentActionMap();
    };
    CharacterEntity.prototype.getCurrentActions = function () {
        return this.CurrentActions;
    };
    CharacterEntity.prototype.recalculateCurrentActionMap = function () {
        var currentLocation = this.getLocation();
        this.CurrentActionMap = this.getOwner().createPathfindingMap(currentLocation.X, currentLocation.Y);
    };
    CharacterEntity.prototype.moveToPoint = function (newLocation) {
        var self = this;
        if (this.CurrentActionMap.getValueAtPoint(newLocation.X, newLocation.Y) <= this.CurrentActions) {
            var actionsLost = this.CurrentActionMap.getValueAtPoint(newLocation.X, newLocation.Y);
            this.getOwner().scheduleForNextTurn(function () {
                self.CurrentActions += actionsLost;
            });
            this.CurrentActions -= actionsLost;
            self.setLocation(newLocation);
            this.recalculateCurrentActionMap();
        }
        else {
            return false;
        }
    };
    return CharacterEntity;
}(TileEntity));
var PlayerEntity = (function (_super) {
    __extends(PlayerEntity, _super);
    function PlayerEntity(owner) {
        var _this = _super.call(this, owner, owner.getRandomValidSpawnLocation()) || this;
        _this.setMovesPerTurn(10);
        return _this;
    }
    PlayerEntity.prototype.mouseLeftClick = function (x, y) {
        var tileUnderClick = this.getOwner().screenToLevel(new Vector2(x, y));
        console.log(tileUnderClick.X, tileUnderClick.Y, this.getLocation().X, this.getLocation().Y);
    };
    PlayerEntity.prototype.draw = function (ctx) {
        var _this = this;
        _super.prototype.draw.call(this, ctx);
        this.CurrentActionMap.forEach(function (x, y, currentValue) {
            if (currentValue > 0 && currentValue < _this.getCurrentActions()) {
                var rect = _this.getOwner().levelToScreen(new Vector2(x, y)).shrink(8);
                ctx.fillStyle = "red";
                ctx.fillRect(rect.X, rect.Y, rect.Width, rect.Height);
            }
        });
    };
    return PlayerEntity;
}(CharacterEntity));
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
    map.addTileEntity(new PlayerEntity(map));
    renderableList.push(map);
    mainCanvas.addEventListener("click", function (ev) {
        renderableList.forEach(function (render) {
            render.mouseLeftClick(ev.clientX, ev.clientY);
        });
    });
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
