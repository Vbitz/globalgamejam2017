// TODO: Basic system with nothing on the level (DONE)
// TODO: Flood fill map support
// TODO: Player charactor with non-turn based movement.

// TODO: Add camera support (maybe?)

interface Renderable {
    // TODO: Add keypress handler
    draw(ctx: CanvasRenderingContext2D);
}

class Vector2 {
    public X: number;
    public Y: number;

    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }
}

class Color {
    public Color: string;

    constructor(color: string) {
        this.Color = color;
    }

    public static fromRGB(r: number, g: number, b: number): Color {
        return new Color("rgb(" + r.toString(10) + ", " + g.toString(10) + ", " + b.toString(10) + ")");
    }
}

class Rectangle {
    public X: number;
    public Y: number;
    public Width: number;
    public Height: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.X = x;
        this.Y = y;
        this.Width = w;
        this.Height = h;
    }

    public add(vec: Vector2): Rectangle {
        return new Rectangle(this.X + vec.X, this.Y + vec.Y, this.Width, this.Height);
    }
}

enum TileType { 
    Floor,
    Wall
}

interface RenderBrush {
    draw(ctx: CanvasRenderingContext2D, rect: Rectangle);
};

class SolidRenderBrush implements RenderBrush {
    private RenderColor: Color;
    
    constructor(color: Color) {
        this.RenderColor = color;
    }

    public draw(ctx: CanvasRenderingContext2D, rect: Rectangle) {
        ctx.fillStyle = this.RenderColor.Color;
        ctx.fillRect(rect.X, rect.Y, rect.Width, rect.Height);
    }
};

class TileInfo {
    private Type: TileType;
    private LoadTileID: number;
    private IsSolid: boolean;
    private IsPassable: boolean;

    private Render: RenderBrush;

    constructor(type: TileType, loadTileId: number, isSolid: boolean, isPassable: boolean) {
        this.Type = type;
        this.LoadTileID = loadTileId;
        this.IsSolid = isSolid;
        this.IsPassable = isPassable;
    }

    public setColor(col: Color): TileInfo {
        this.Render = new SolidRenderBrush(col);
        return this;
    }

    public getType(): TileType {
        return this.Type;
    }

    public draw(ctx: CanvasRenderingContext2D, rect: Rectangle) {
        this.Render.draw(ctx, rect);
    }
}

var allTiles: TileInfo[] = [
    new TileInfo(TileType.Floor, 0, false, true).setColor(new Color("white")),
    new TileInfo(TileType.Wall, 1, false, true).setColor(new Color("grey"))
];

function getTileInfoByType(type: TileType) {
    var ret = allTiles.filter((value: TileInfo) => { return value.getType() == type; });
    if (ret.length == 1) {
        return ret[0];
    } else {
        throw new Error("Bad Tile Type");
    }
}

type MapTile = {
    type: TileType;
    
}

type TwoDMap<T> = T[][];

const TILE_SIZE: number = 32;

type MapForEachCallback<T> = (x: number, y: number, tile: T) => void;

function forEach<T>(width: number, height: number, mapData: TwoDMap<T>, cb: MapForEachCallback<T>) {
    for (var x: number = 0; x < width; x++) {
        for (var y: number = 0; y < height; y++) {
            cb(x, y, mapData[x][y]);
        }
    }
}

// The turn based method is going to be implemented as runNextTurn(cb)
class Map implements Renderable {
    public Width: number;
    public Height: number;
    private MapData: TwoDMap<MapTile>;

    constructor(width: number, height: number, startTileType: TileType) {
        this.Width = width;
        this.Height = height;
        this.MapData = [];
        for (var x: number = 0; x < width; x++) {
            this.MapData.push([]);
            for (var y: number = 0; y < height; y++) {
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
    public draw(ctx: CanvasRenderingContext2D) {
        var self = this;
        forEach(this.Width, this.Height, this.mapData, function (x: number, y: number, tile: MapTile) {
            getTileInfoByType(tile.type).draw(ctx, self.levelToScreen(new Vector2(x, y)));
        });
    }

    public levelToScreen(localLocation: Vector2): Rectangle {
        return new Rectangle(localLocation.X * TILE_SIZE, localLocation.Y * TILE_SIZE, TILE_SIZE, TILE_SIZE).add(new Vector2(60, 60));
    }

    public setTile(x: number, y: number, type: TileType) {
        this.mapData[x][y] = {
            type: type
        };
    }

    public loadFromDocument(documentStr: string) {

    }
}

class DijkstraMap {
    private MapData: TwoDMap<number>;
    private Owner: Map;

    constructor(owner: Map) {
        this.Owner = owner;
        this.MapData = [];
        for (var x: number = 0; x < this.Owner.Width; x++) {
            this.MapData.push([]);
            for (var y: number = 0; y < this.Owner.Height; y++) {
                this.MapData[x].push(0);
            }
        }
    }

    
    public drawDebug(ctx: CanvasRenderingContext2D) {
        var self = this;
        forEach(this.Owner.Width, this.Owner.Height, this.MapData, function (x: number, y: number, value: number) {
            
        });
    }
}

class TileEntity implements Renderable {
    private Location: Vector2;
    private Owner: Map;
    private RenderColor: Color;

    constructor(owner: Map, spawnLocation: Vector2) {
        this.Owner = owner;
        this.Location = spawnLocation;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        var baseRect: Rectangle = this.Owner.levelToScreen(this.Location);
    }
}

function main(): void {
    var mainCanvas: HTMLCanvasElement = <HTMLCanvasElement> document.querySelector("#mainCanvas");
    mainCanvas.width =window.innerWidth;
    mainCanvas.height = window.innerHeight;
    var ctx: CanvasRenderingContext2D = mainCanvas.getContext("2d");

    var renderableList: Renderable[] = [];

    var map: Map = new Map(48, 24, TileType.Floor);
    for (var x: number = 0; x < 48; x++) {
        for (var y: number = 0; y < 24; y++) {
            if (x == 0 || x == 47 || y == 0 || y == 23) {
                map.setTile(x, y, TileType.Wall);
            }
        }
    }

    renderableList.push(map);

    function update() {
        ctx.fillStyle = "cornflowerBlue";
        ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

        renderableList.forEach(function (renderable: Renderable) {
            renderable.draw(ctx);
        })

        window.requestAnimationFrame(update);
    }

    window.requestAnimationFrame(update);
}

window.addEventListener("DOMContentLoaded", main);