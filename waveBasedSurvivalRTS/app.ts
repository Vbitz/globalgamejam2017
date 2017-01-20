// TODO: Basic system with nothing on the level. (DONE)
// TODO: Flood fill map support. (DONE)
// TODO: Player charactor with turn based movement. (DONE)

// TODO: Add camera support (maybe?)

interface Renderable {
    // TODO: Add keypress handler

    mouseLeftClick(x: number, y: number);

    draw(ctx: CanvasRenderingContext2D);
}

class Vector2 {
    public X: number;
    public Y: number;

    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    public add(val: Vector2): Vector2 {
        return new Vector2(this.X + val.X, this.Y + val.Y);
    }

    public sub(val: Vector2): Vector2 {
        return new Vector2(this.X - val.X, this.Y - val.Y);
    }

    public mul(val: Vector2): Vector2 {
        return new Vector2(this.X * val.X, this.Y * val.Y);
    }

    public div(val: Vector2): Vector2 {
        return new Vector2(this.X / val.X, this.Y / val.Y);
    }

    public round(): Vector2 {
        return new Vector2(Math.round(this.X), Math.round(this.Y));
    }

    public floor(): Vector2 {
        return new Vector2(Math.floor(this.X), Math.floor(this.Y));
    }

    public clone(): Vector2 {
        return new Vector2(this.X, this.Y);
    }

    public distance(val: Vector2): number {
        return Math.sqrt(Math.pow(val.Y - this.Y, 2) + Math.pow(val.X - this.X, 2));
    }

    public hash(): string {
        // TODO: Better hashing method if this turns out to be a problem
        return this.X.toString(10) + ":" + this.Y.toString(10);
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

    public shrink(val: number): Rectangle {
        return new Rectangle(this.X + val, this.Y + val, this.Width - (val * 2), this.Height - (val * 2));
    }

    public contains(point: Vector2): boolean {
        return point.X > this.X && point.X < (this.X + this.Width) && point.Y > this.Y && point.Y < (this.Y + this.Height);
    }
}

function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}

type LoadImageCallback = (img: HTMLImageElement) => void;

function loadImageWithCallback(filename: string, cb: LoadImageCallback) {
    var img = document.createElement("img");
    img.src = filename;
    img.addEventListener("load", function () {
        cb(img);
    });
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

class TileMapRenderBrush implements RenderBrush {
    constructor(img: HTMLImageElement) {
        this.Image = img;
    }
}

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

    public getIsSolid(): boolean {
        return this.IsSolid;
    }

    public getIsPassable(): boolean {
        return this.IsPassable;
    }

    public draw(ctx: CanvasRenderingContext2D, rect: Rectangle) {
        this.Render.draw(ctx, rect);
    }
}

var allTiles: TileInfo[] = [
    new TileInfo(TileType.Floor, 0, false, true).setColor(new Color("white")),
    new TileInfo(TileType.Wall, 1, false, false).setColor(new Color("grey"))
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

type TwoDMap<TileType> = TileType[][];

type TransformCallback = (point: Vector2) => Rectangle;

const TILE_SIZE: number = 32;

type MapForEachCallback<TileType, ReturnValue> = (x: number, y: number, tile: TileType) => ReturnValue;

function forEach<TileType>(width: number, height: number, mapData: TwoDMap<TileType>, cb: MapForEachCallback<TileType, void>) {
    for (var x: number = 0; x < width; x++) {
        for (var y: number = 0; y < height; y++) {
            cb(x, y, mapData[x][y]);
        }
    }
}

type NextTurnCallback = () => void;

// The turn based method is going to be implemented as runNextTurn(cb)
class Map implements Renderable {
    public Width: number;
    public Height: number;
    private MapData: TwoDMap<MapTile>;
    private TileEntityList: TileEntity[];
    private NextTurnActionList: NextTurnCallback[];

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
        this.TileEntityList = [];
        this.NextTurnActionList = [];
    }

    public getTileWithInfo(x: number, y: number): TileInfo {
        return getTileInfoByType(this.MapData[x][y].type);
    }

    public addTileEntity(ent: TileEntity) {
        this.TileEntityList.push(ent);
    }

    /*
        I don't have any clue what the map save format will look like but for now I will just
        declare it staticly or even use csv
    */
    public draw(ctx: CanvasRenderingContext2D) {
        var self = this;
        forEach(this.Width, this.Height, this.MapData, function (x: number, y: number, tile: MapTile) {
            getTileInfoByType(tile.type).draw(ctx, self.levelToScreen(new Vector2(x, y)));
        });
        this.TileEntityList.forEach(function (te: TileEntity) {
            te.draw(ctx);
        });
    }

    public mouseLeftClick(x: number, y: number) {
        this.TileEntityList.forEach(function (te: TileEntity) {
            te.mouseLeftClick(x, y);
        });
    }

    public levelToScreen(localLocation: Vector2): Rectangle {
        return new Rectangle(localLocation.X * TILE_SIZE, localLocation.Y * TILE_SIZE, TILE_SIZE, TILE_SIZE).add(new Vector2(60, 60));
    }

    public screenToLevel(screenLocation: Vector2): Vector2 {
        var ret = screenLocation.clone();
        ret = ret.sub(new Vector2(60, 60)).div(new Vector2(TILE_SIZE, TILE_SIZE)).floor();
        if (ret.X < 0 || ret.Y < 0 || ret.X > this.Width - 1 || ret.Y > this.Height - 1) {
            return null;
        } else {
            return ret;
        }
    }

    public setTile(x: number, y: number, type: TileType) {
        this.MapData[x][y] = {
            type: type
        };
    }

    public createPathfindingMap(xL: number, yL: number, maxSteps: number = Number.MAX_VALUE): DijkstraMap {
        var self = this;
        var map: DijkstraMap = new DijkstraMap(this.Width, this.Height, true);
        map.updateWithCallback((x, y, initalValue) => {
            if (!self.getTileWithInfo(x, y).getIsPassable()) {
                return -1;
            }

            if (x == xL && y == yL) {
                return 0;
            } else {
                return initalValue;
            }
        });

        map.propigateMap(maxSteps);
        
        return map;
    }

    public getRandomValidSpawnLocation(): Vector2 {
        while (true) {
            var newLocation = new Vector2(rand(0, this.Width), rand(0, this.Height));
            if (this.getTileWithInfo(newLocation.X, newLocation.Y).getIsPassable()) {
                return newLocation;
            }
        }
    }

    public advanceTurn() {
        this.NextTurnActionList.forEach(function (cb: NextTurnCallback) {
            cb();
        });
        this.NextTurnActionList = [];
    }

    public scheduleForNextTurn(cb: NextTurnCallback) {
        this.NextTurnActionList.push(cb);
    }

    public loadFromDocument(documentStr: string) {

    }
}

class DijkstraMap {
    private MapData: TwoDMap<number>;

    private Width: number;
    private Height: number;
    
    private Inverse: boolean;
    private InitalValue: number;

    private PropigateTileList: Vector2[];

    constructor(w: number, h: number, inverse: boolean) {
        this.Width = w;
        this.Height = h;

        this.Inverse = inverse;
        this.InitalValue = inverse ? Number.MAX_VALUE : 0;

        this.PropigateTileList = [];

        this.MapData = [];
        for (var x: number = 0; x < this.Width; x++) {
            this.MapData.push([]);
            for (var y: number = 0; y < this.Height; y++) {
                this.MapData[x].push(this.InitalValue);
            }
        }
    }

    public updateWithCallback(cb: MapForEachCallback<number, number>) {
        forEach(this.Width, this.Height, this.MapData, (x, y, currentValue) => {
            this.MapData[x][y] = cb(x, y, currentValue);
        });
    }

    public propigateMap(maxSteps: number = Number.MAX_VALUE): boolean {
        var self = this;

        if (this.PropigateTileList.length == 0) {
            forEach(this.Width, this.Height, this.MapData, (x, y, currentValue) => {
                if (currentValue == this.InitalValue) {
                    if (self.isTileValid(x - 1, y    ) ||
                        self.isTileValid(x + 1, y    ) ||
                        self.isTileValid(x    , y - 1) ||
                        self.isTileValid(x    , y + 1)) {
                        this.PropigateTileList.push(new Vector2(x, y));
                    }
                }
            });
        }

        var currentSteps = 0;

        while (this.PropigateTileList.length > 0 && currentSteps < maxSteps) {
            var nextTile: Vector2 = this.PropigateTileList.shift();
            var nextTileX = nextTile.X;
            var nextTileY = nextTile.Y;
            
            if (!this.isTileInital(nextTileX, nextTileY)) {
                continue;
            }

            var lowestValue: number = 0;
            
            var valuesToCheck = [];

            if (this.getValueAtPoint(nextTileX - 1, nextTileY    ) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX - 1, nextTileY    ));
            }
            if (this.getValueAtPoint(nextTileX + 1, nextTileY    ) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX + 1, nextTileY    ));
            }
            if (this.getValueAtPoint(nextTileX    , nextTileY - 1) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX    , nextTileY - 1));
            }
            if (this.getValueAtPoint(nextTileX    , nextTileY + 1) >= 0) {
                valuesToCheck.push(this.getValueAtPoint(nextTileX    , nextTileY + 1));
            }

            if (this.Inverse) {
                lowestValue = Math.min.apply(Math, valuesToCheck);
            } else {
                lowestValue = Math.max.apply(Math, valuesToCheck);
            }

            if (lowestValue == this.InitalValue) {
                this.PropigateTileList.push(nextTile);
            } else {
                this.setTileAtPoint(nextTileX, nextTileY, lowestValue + (this.Inverse ? 1 : -1));
                this.PropigateTileList.push(new Vector2(nextTileX - 1, nextTileY    ));
                this.PropigateTileList.push(new Vector2(nextTileX + 1, nextTileY    ));
                this.PropigateTileList.push(new Vector2(nextTileX    , nextTileY - 1));
                this.PropigateTileList.push(new Vector2(nextTileX    , nextTileY + 1));
            }
            
            currentSteps++;
        }

        return this.PropigateTileList.length == 0;
    }

    public getValueAtPoint(x: number, y: number): number {
        return this.MapData[x][y];
    }

    private isTileInital(x: number, y: number): boolean {
        return this.getValueAtPoint(x, y) == this.InitalValue;
    }

    private isTileValid(x: number, y: number): boolean {
        return (this.getValueAtPoint(x, y) >= 0) && !this.isTileInital(x, y);
    }

    public setTileAtPoint(x: number, y: number, value: number) {
        this.MapData[x][y] = value;
    }

    public forEach(cb: MapForEachCallback<number, void>) {
        forEach(this.Width, this.Height, this.MapData, cb);
    }
    
    public draw(ctx: CanvasRenderingContext2D, transformCallback: TransformCallback) {
        var self = this;

        this.forEach(function (x: number, y: number, value: number) {
            var rect: Rectangle = transformCallback(new Vector2(x, y));
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            var value = self.getValueAtPoint(x, y);
            if (value != self.InitalValue) {
                ctx.fillText(value.toString(10), rect.X + 16, rect.Y + 16);
            }
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
        this.RenderColor = new Color("deepPink");
    }

    protected setLocation(newLocation: Vector2) {
        this.Location = newLocation;
    }

    public getLocation(): Vector2 {
        return this.Location;
    }

    protected setColor(newColor: Color) {
        this.RenderColor = newColor;
    }

    protected getOwner(): Map {
        return this.Owner;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        var baseRect: Rectangle = this.Owner.levelToScreen(this.Location);
        ctx.fillStyle = this.RenderColor.Color;
        ctx.fillRect(baseRect.X, baseRect.Y, baseRect.Width, baseRect.Height);
    }

    public mouseLeftClick(x: number, y: number) {

    }
}

class CharacterEntity extends TileEntity {
    private MovesPerTurn: number;
    private RenderMoveMap: number;

    private CurrentActions: number;

    protected CurrentActionMap: DijkstraMap;

    constructor(owner: Map, spawnLocation: Vector2) {
        super(owner, spawnLocation);

        this.MovesPerTurn = 5;
        this.CurrentActions = this.MovesPerTurn;
        this.CurrentActionMap = null;
    }

    protected setMovesPerTurn(movesPerTurn: number) {
        this.CurrentActions = this.CurrentActions + (movesPerTurn - this.MovesPerTurn);
        this.MovesPerTurn = movesPerTurn;
        this.recalculateCurrentActionMap();
    }

    protected getCurrentActions(): number {
        return this.CurrentActions;
    }

    protected recalculateCurrentActionMap() {
        var currentLocation = this.getLocation();
        this.CurrentActionMap = this.getOwner().createPathfindingMap(currentLocation.X, currentLocation.Y);
    }

    protected addActions(actions: number) {
        this.CurrentActions += actions;
        this.onUpdateActions();
    }

    protected onUpdateActions() {

    }

    protected subtractActions(actions: number) {
        this.CurrentActions -= actions;
        this.onUpdateActions();
    }

    public moveToPoint(newLocation: Vector2): boolean {
        var self = this;
        if (!this.getOwner().getTileWithInfo(newLocation.X, newLocation.Y).getIsPassable()) {
            return false;
        }
        if (this.CurrentActionMap.getValueAtPoint(newLocation.X, newLocation.Y) <= this.CurrentActions) {
            var actionsLost = this.CurrentActionMap.getValueAtPoint(newLocation.X, newLocation.Y);
            this.getOwner().scheduleForNextTurn(function () {
                self.addActions(actionsLost);
            });
            self.subtractActions(actionsLost);
            self.setLocation(newLocation);
            this.recalculateCurrentActionMap();
            return true;
        } else {
            return false;
        }
    }
}

class PlayerEntity extends CharacterEntity {
    private StatsUI: Label;

    constructor(owner: Map) {
        super(owner, owner.getRandomValidSpawnLocation());

        this.setMovesPerTurn(10);

        this.StatsUI = new Label(new Rectangle(100, 15, 150, 28), "Current Actions: " + this.getCurrentActions());
    }

    protected onUpdateActions() {
        this.StatsUI.setText("Current Actions: " + this.getCurrentActions());        
    }

    public mouseLeftClick(x: number, y: number) {
        var tileUnderClick: Vector2 = this.getOwner().screenToLevel(new Vector2(x, y));
        if (tileUnderClick != null) {
            this.moveToPoint(tileUnderClick);
        }
        // console.log(tileUnderClick.X, tileUnderClick.Y, this.getLocation().X, this.getLocation().Y);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);
        this.CurrentActionMap.forEach((x, y, currentValue) => {
            if (currentValue > 0 && currentValue <= this.getCurrentActions()) {
                var rect = this.getOwner().levelToScreen(new Vector2(x, y)).shrink(8);
                ctx.fillStyle = Color.fromRGB(100, 200, 200).Color;
                ctx.fillRect(rect.X, rect.Y, rect.Width, rect.Height);
                rect = rect.shrink(4);
                ctx.fillStyle = Color.fromRGB(50, 100, 100).Color;
                ctx.fillRect(rect.X, rect.Y, rect.Width, rect.Height);
            }
        });
    }

    public getStatsUI(): Label {
        return this.StatsUI;
    }
}

class UIElement implements Renderable {
    public draw(ctx: CanvasRenderingContext2D) {
        
    }

    public mouseLeftClick(x: number, y: number) {

    }
}

class Label extends UIElement {
    private Bounds: Rectangle;
    private Text: string;

    constructor(rect: Rectangle, text: string) {
        super();
        this.Bounds = rect;
        this.Text = text;
    }

    public getBounds(): Rectangle {
        return this.Bounds;
    }

    public setText(str: string) {
        this.Text = str;
    }
    
    public draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);
        ctx.fillStyle = "white";
        ctx.fillRect(this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
        ctx.fillStyle = "black";
        ctx.font = "16px sans-serif";
        ctx.fillText(this.Text, this.Bounds.X + 5, this.Bounds.Y + 20);
    }
}

type OnClickCallback = () => void;

class Button extends Label {
    private OnClick: OnClickCallback;

    constructor(rect: Rectangle, text: string, cb: OnClickCallback) {
        super(rect, text);
        this.OnClick = cb;
    }

    public mouseLeftClick(x: number, y: number) {
        super.mouseLeftClick(x, y);
        if (this.getBounds().contains(new Vector2(x, y))) {
            this.OnClick();
        }
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
            } else {
                if (Math.random() > 0.8) {
                    map.setTile(x, y, TileType.Wall);
                }
            }
        }
    }

    var player = new PlayerEntity(map);

    map.addTileEntity(player);

    renderableList.push(map);

    renderableList.push(new Button(new Rectangle(15, 15, 80, 28), "End Turn", () => {
        map.advanceTurn();
    }));

    renderableList.push(player.getStatsUI());

    mainCanvas.addEventListener("click", function (ev: MouseEvent) {
        renderableList.forEach(function (render: Renderable) {
            render.mouseLeftClick(ev.clientX, ev.clientY);
        });
    });

    function update() {
        ctx.fillStyle = "cornflowerBlue";
        ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

        renderableList.forEach(function (renderable: Renderable) {
            renderable.draw(ctx);
        });

        window.requestAnimationFrame(update);
    }

    window.requestAnimationFrame(update);
}

window.addEventListener("DOMContentLoaded", main);