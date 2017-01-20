// TODO: Basic system with nothing on the level
// TODO: Player charactor with non-turn based movement.


interface Renderable {
    // TODO: Add keypress handler
    draw(ctx: CanvasRenderingContext2D);
}

class Vector2 {
    public X: number;
    public Y: number;

    constructor(x: number, y: number) {

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
}

enum TileType { 
    Floor,
    Wall
}

class TileInfo {
    private Type: TileType;
    private LoadTileID: number;
    private IsSolid: boolean;
    private IsPassable: boolean;

    constructor(type: TileType, loadTileId: number, isSolid: boolean, isPassable: boolean) {
        this.Type = type;
        this.LoadTileID = loadTileId;
        this.IsSolid = isSolid;
        this.IsPassable = isPassable;
    }
}

var allTiles: TileInfo[] = [
    new TileInfo(TileType.Floor, 0),
    new TileInfo(TileType.Wall, 1)
];

type MapTile = {
    type: TileType;
    
}

type MapData = MapTile[][];

class Map implements Renderable {
    public Width: number;
    public Height: number;
    private mapData: MapData;

    private static forEach(width: number, height: number, mapData: MapData, cb: (x: number, y: number, tile: MapTile) => void) {
        for (var x: number = 0; x < width; x++) {
            for (var y: number = 0; y < height; y++) {
                cb(x, y, mapData[x][y]);
            }
        }
    }

    constructor(width: number, height: number, startTileType: TileType) {
        this.Width = width;
        this.Height = height;
        this.mapData = [];
        for (var x: number = 0; x < width; x++) {
            this.mapData.push([]);
            for (var y: number = 0; y < height; y++) {
                this.mapData[x].push({
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

    }

    public loadFromDocument(documentStr: string) {

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

window.addEventListener("DOMContentLoaded", function () {
    var mainCanvas: HTMLCanvasElement = <HTMLCanvasElement> document.querySelector("#mainCanvas");
    mainCanvas.width =window.innerWidth;
    mainCanvas.height = window.innerHeight;
    var ctx: CanvasRenderingContext2D = mainCanvas.getContext("2d");

    var renderableList: Renderable[] = [];

    var map: Map = new Map();

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
});