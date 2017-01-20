var Map = (function () {
    function Map() {
    }
    Map.prototype.draw = function (ctx) {
        ctx.font = "72px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText("Hello, World", 100, 100);
    };
    return Map;
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
