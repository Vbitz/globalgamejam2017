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
    document.location.reload();
    return false;
}
var EventType;
(function (EventType) {
    EventType[EventType["GetResource"] = 0] = "GetResource";
    EventType[EventType["PrimaryRaid"] = 1] = "PrimaryRaid";
})(EventType || (EventType = {}));
;
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["Troops"] = 0] = "Troops";
})(ResourceType || (ResourceType = {}));
;
function getResourcesForRaidLevel(isPrimary, raidLevel) {
    return (isPrimary ? 50 : 25) * raidLevel;
}
function getDurationForRaidLevel(isPrimary, raidLevel) {
    return (isPrimary ? 60 : 15) * raidLevel;
}
function time() {
    return +(new Date());
}
var SaveFile = (function () {
    function SaveFile() {
    }
    SaveFile.prototype.isNewGame = function () {
        return localStorage.getItem("saveData") != null;
    };
    SaveFile.prototype.createNewGame = function () {
        this.Data = {
            HasLost: false,
            EventList: []
        };
    };
    SaveFile.prototype.load = function () {
        this.Data = JSON.parse(localStorage.getItem("saveData"));
    };
    SaveFile.prototype.save = function () {
        localStorage.setItem("saveData", JSON.stringify(this.Data));
    };
    SaveFile.prototype.getEventList = function () {
        return this.Data.EventList;
    };
    SaveFile.prototype.createPrimaryRaidEvent = function (raidLevel, startTime) {
        this.Data.EventList.push({
            EventType: EventType.PrimaryRaid,
            EventDetails: {
                RaidLevel: raidLevel,
                ResourcesRequired: getResourcesForRaidLevel(true, raidLevel)
            },
            EventStartTime: startTime,
            EventDuration: getDurationForRaidLevel(true, raidLevel)
        });
    };
    return SaveFile;
}());
function main() {
    var save = new SaveFile();
    setInterval(function () {
    }, 1000);
}
document.addEventListener("DOMContentLoaded", main);
