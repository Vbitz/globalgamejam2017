interface Renderable {
    draw(ctx: CanvasRenderingContext2D);
}

class Map implements Renderable {
    public draw(ctx:CanvasRenderingContext2D) {
        ctx.font = "72px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText("Hello, World", 100, 100);
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