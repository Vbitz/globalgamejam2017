/*
    Deadline Simulator

    Every x seconds the player fights off an advancing force. They have to accure resources by preforming actions to fight the force off.
    This is basicly a resource and time management game.
    Game Over state occours if the player does'nt have enough resources to fight off the wave.
    One interesting aspect is resources are consumed in the attack.
    
    Savegame Storage is stored in
*/
function deleteSaveFile() {
    localStorage.clear();
    return false;
}
var SaveFile = (function () {
    function SaveFile() {
    }
    SaveFile.prototype.loadSaveFile = function () {
    };
    return SaveFile;
}());
function main() {
}
document.addEventListener("DOMContentLoaded", main);
