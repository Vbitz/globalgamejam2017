/*
    Deadline Simulator

    Every x seconds the player fights off an advancing force. They have to accure resources by preforming actions to fight the force off.
    This is basicly a resource and time management game.
    Game Over state occours if the player does'nt have enough resources to fight off the wave.
    One interesting aspect is resources are consumed in the attack.
    
    Savegame Storage is stored in
*/
// TODO; Resource Generation
// TODO: Add Lose Condition
// TODO: Day/Night System
// TODO: Unit System
// TODO: World Generation
// TODO: Time Skips
// TODO: Hidden Units
// TODO: Better Mobile Display
function deleteSaveFile() {
    localStorage.clear();
    document.location.reload();
    return false;
}
var EventType;
(function (EventType) {
    EventType[EventType["ResourceProduction"] = 0] = "ResourceProduction";
    EventType[EventType["PrimaryRaid"] = 1] = "PrimaryRaid";
})(EventType || (EventType = {}));
;
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["Population"] = 0] = "Population";
    ResourceType[ResourceType["LandArea"] = 1] = "LandArea";
    ResourceType[ResourceType["Wood"] = 2] = "Wood";
    ResourceType[ResourceType["IronSword"] = 3] = "IronSword";
    ResourceType[ResourceType["Iron"] = 4] = "Iron";
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
var BuildingType;
(function (BuildingType) {
    BuildingType[BuildingType["Sawmill"] = 0] = "Sawmill";
    BuildingType[BuildingType["IronMine"] = 1] = "IronMine";
    BuildingType[BuildingType["Barracks"] = 2] = "Barracks";
    BuildingType[BuildingType["Swordsmith"] = 3] = "Swordsmith";
    BuildingType[BuildingType["WatchTower"] = 4] = "WatchTower";
})(BuildingType || (BuildingType = {}));
;
var UnitType;
(function (UnitType) {
    UnitType[UnitType["Hero"] = 0] = "Hero";
})(UnitType || (UnitType = {}));
;
function getResourcesForRaidLevel(raidLevel) {
    // Excel Formula: =ROUND((SIN(A2 / 0.5)+1) * 30, 0) * POWER(10, (ROUNDDOWN(A2 / 5, 0)) * 0.5)
    var value = Math.round((Math.sin(raidLevel / 0.5) + 1) * 30) * Math.pow(10, Math.floor(raidLevel / 5) * 0.5);
    value = Math.round(value);
    if (raidLevel == 1) {
        return value;
    }
    else {
        return value + getResourcesForRaidLevel(raidLevel - 1);
    }
}
function getDurationForRaidLevel(raidLevel) {
    // Excel Formula: =ROUND((SIN(A2 / 0.5)+1) * 4, 0) * 15
    var value = Math.round((Math.sin(raidLevel / 0.5) + 1) * 4) * 15;
    value = value * 1000;
    if (raidLevel == 1) {
        return value;
    }
    else {
        return value + getDurationForRaidLevel(raidLevel - 1);
    }
}
function dumpRaidProgression(maxCount) {
    var arr = new Array(60);
    arr.fill(0);
    console.table(arr.map(function (v, i) {
        return {
            level: i + 1,
            resources: getResourcesForRaidLevel(i + 1),
            duration: getDurationForRaidLevel(i + 1)
        };
    }));
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
    valueInSeconds -= (valueInSeconds % 60);
    if (valueInSeconds / 60 > 0) {
        ret = Math.round((valueInSeconds / 60) % 24).toString(10) + " Hours " + ret;
    }
    valueInSeconds -= (valueInSeconds / 60) % 24;
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
        this.PendingEventList = [];
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
        var baseLocationId = this.createRandomVillageLocation();
        this.addBuildingInLocation(BuildingType.Sawmill, 1);
        this.addBuildingInLocation(BuildingType.Swordsmith, 1);
        this.addBuildingInLocation(BuildingType.Barracks, 1);
        this.createRandomHeroInLocation();
        this.createPrimaryRaidEvent(1, time());
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
        this.PendingEventList.push({
            EventType: EventType.PrimaryRaid,
            EventDetails: {
                RaidLevel: raidLevel,
                ResourcesRequired: getResourcesForRaidLevel(raidLevel)
            },
            EventStartTime: startTime,
            EventDuration: getDurationForRaidLevel(raidLevel)
        });
    };
    SaveFile.prototype.hasEventPassed = function (event) {
        return (event.EventStartTime + event.EventDuration) < time();
    };
    SaveFile.prototype.complateEvent = function (event) {
        if (event.EventType == EventType.PrimaryRaid) {
            var details = event.EventDetails;
            this.createPrimaryRaidEvent(details.RaidLevel + 1, event.EventStartTime + event.EventDuration);
        }
    };
    SaveFile.prototype.getEventDetails = function (event) {
        // TODO: Make this return a Element with nice styling
        if (event.EventType == EventType.PrimaryRaid) {
            var details = event.EventDetails;
            return "Level = " + details.RaidLevel.toString(10) + " | Required Resources = " + details.ResourcesRequired.toString(10) + " Supplies";
        }
        else if (event.EventType == EventType.GetResource) {
            var details = event.EventDetails;
            return ResourceType[details.Type] + " X " + details.Count.toString(10);
        }
    };
    SaveFile.prototype.getRenderTable = function () {
        var _this = this;
        return this.Data.EventList.map((function (event) {
            return {
                "Event Type": EventType[event.EventType],
                "Time Remaining": printTime((event.EventStartTime + event.EventDuration) - time()),
                "Details": _this.getEventDetails(event)
            };
        }).bind(this));
    };
    SaveFile.prototype.update = function () {
        var _this = this;
        this.Data.EventList = this.Data.EventList.filter((function (event) {
            if (!_this.hasEventPassed(event)) {
                return true;
            }
            else {
                console.log("Completing: " + event);
                _this.complateEvent(event);
                return false;
            }
        }).bind(this));
        this.PendingEventList.forEach(function (event) { return _this.Data.EventList.push(event); });
        this.PendingEventList = [];
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
    if (data.length == 0) {
        return;
    }
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
        save.save();
    }
    else {
        save.load();
    }
    setInterval(function () {
        save.update();
        save.save();
        var rTable = save.getRenderTable();
        renderTable(document.querySelector("#currentDeadlineList"), rTable);
    }, 1000);
}
document.addEventListener("DOMContentLoaded", main);
