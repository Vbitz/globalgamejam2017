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
var LocationType;
(function (LocationType) {
    LocationType[LocationType["Town"] = 0] = "Town";
    LocationType[LocationType["City"] = 1] = "City";
    LocationType[LocationType["Village"] = 2] = "Village";
    LocationType[LocationType["Mountion"] = 3] = "Mountion";
    LocationType[LocationType["DungeonEntrance"] = 4] = "DungeonEntrance";
    LocationType[LocationType["DungeonLevel"] = 5] = "DungeonLevel";
})(LocationType || (LocationType = {}));
;
var UnitType;
(function (UnitType) {
    UnitType[UnitType["Hero"] = 0] = "Hero";
})(UnitType || (UnitType = {}));
;
function getResourcesForRaidLevel(isPrimary, raidLevel) {
    return (isPrimary ? 50 : 25) * raidLevel;
}
function getDurationForRaidLevel(isPrimary, raidLevel) {
    return ((isPrimary ? 60 : 15) * raidLevel * 1000);
}
function time() {
    return +(new Date());
}
function printTime(valueInMs) {
    var ret = "";
    var inverse = true;
    inverse = valueInMs < 0;
    if (inverse) {
        valueInMs = -valueInMs;
    }
    var valueInSeconds = valueInMs / 1000;
    ret = Math.round(valueInSeconds % 60).toString(10) + " Minutes";
    if (valueInSeconds / 60 > 0) {
        ret = Math.round((valueInSeconds / 60) % 60).toString(10) + " Hours " + ret;
    }
    if (valueInSeconds / 60 / 24 > 0) {
        ret = Math.round(valueInSeconds / 60 / 60).toString(10) + " Days " + ret;
    }
    if (inverse) {
        ret = "-" + ret;
    }
    return ret;
}
var SaveFile = (function () {
    function SaveFile() {
        this.createNewGame();
    }
    SaveFile.prototype.isNewGame = function () {
        return localStorage.getItem("saveData") == null;
    };
    SaveFile.prototype.createNewGame = function () {
        this.Data = {
            HasLost: false,
            EventList: [],
            LocationList: [],
            UnitList: []
        };
        this.generateBasicData();
    };
    SaveFile.prototype.generateBasicData = function () {
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
    SaveFile.prototype.getRenderTable = function () {
        return this.Data.EventList.map(function (eventInfo) {
            return {
                "Event Type": EventType[eventInfo.EventType],
                "Time Remaining": printTime((eventInfo.EventStartTime + eventInfo.EventDuration) - time())
            };
        });
    };
    return SaveFile;
}());
function e(type, attrs, value) {
    var newElement = document.createElement(type);
    for (var k in attrs) {
        newElement.setAttribute(k, attrs[k]);
    }
    if (value instanceof Array) {
        value.forEach(function (ele) { return newElement.appendChild(ele); });
    }
    else {
        newElement.textContent = value;
    }
    return newElement;
}
function renderTable(tableElement, data) {
    // Clear Content
    tableElement.innerHTML = "";
    tableElement.appendChild(e("thead", {}, [
        e("tr", {}, Object.keys(data[0]).map(function (heading) { return e("th", {}, heading); }))
    ]));
    tableElement.appendChild(e("tbody", {}, data.map(function (dataRow) {
        var arr = [];
        for (var k in dataRow) {
            arr.push(e("td", {}, dataRow[k]));
        }
        return e("tr", {}, arr);
    })));
}
function main() {
    var save = new SaveFile();
    window["save"] = save;
    if (save.isNewGame()) {
        save.createNewGame();
        save.createPrimaryRaidEvent(1, time());
        save.save();
    }
    else {
        save.load();
    }
    setInterval(function () {
        var rTable = save.getRenderTable();
        renderTable(document.querySelector("#currentDeadlineList"), rTable);
    }, 1000);
}
document.addEventListener("DOMContentLoaded", main);
