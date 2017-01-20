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

class Rectangle {
    public X: number;
    public Y: number;
    public Width: number;
    public Height: number;
}

enum TileType { 
    Grass,
    Wall,
    Floor
}

class TileInfo {
    private Type: TileType;

    constructor(type: TileType) {
        this.Type = type;
    }
}

type MapTile = {
    type: TileType;
}

class Map implements Renderable {

    /*
        I don't have any clue what the map save format will look like but I expect there will be
        a series of AI spawn points and
    */
    public draw(ctx: CanvasRenderingContext2D) {
        ctx.font = "72px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText("Hello, World", 100, 100);
    }

    public loadFromDocument(documentStr: string) {

    }
}

class TileEntity implements Renderable {
    private location: Vector2;

    public draw(ctx: CanvasRenderingContext2D) {

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