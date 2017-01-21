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
// TODO: Building Upgrades
// TODO: Day/Night System
// TODO: Unit System
// TODO: World Generation
// TODO: Time Skips
// TODO: Hidden Events
// TODO: Better Mobile Display
function deleteSaveFile() {
    localStorage.clear();
    document.location.reload();
    return false;
}
var EventType;
(function (EventType) {
    EventType[EventType["PrimaryRaid"] = 0] = "PrimaryRaid";
    EventType[EventType["PersistantResourceProductionEvent"] = 1] = "PersistantResourceProductionEvent";
    EventType[EventType["PersistantResourceEvent"] = 2] = "PersistantResourceEvent";
})(EventType || (EventType = {}));
;
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["Population"] = 0] = "Population";
    ResourceType[ResourceType["LandArea"] = 1] = "LandArea";
    ResourceType[ResourceType["RawWood"] = 2] = "RawWood";
    ResourceType[ResourceType["Wood"] = 3] = "Wood";
    ResourceType[ResourceType["IronSword"] = 4] = "IronSword";
    ResourceType[ResourceType["RawIron"] = 5] = "RawIron";
    ResourceType[ResourceType["Iron"] = 6] = "Iron";
    ResourceType[ResourceType["BasicSwordsman"] = 7] = "BasicSwordsman";
})(ResourceType || (ResourceType = {}));
;
function resourcePair(type, count) {
    return {
        Type: type,
        Count: count
    };
}
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
    BuildingType[BuildingType["House"] = 5] = "House";
})(BuildingType || (BuildingType = {}));
;
var buildingCreationFunctions = {};
buildingCreationFunctions[BuildingType.Sawmill] = function (save, location, level, currentTime) {
    save.removeResourceInLocation(location, ResourceType.Wood, 50);
    save.removeResourceInLocation(location, ResourceType.LandArea, 100);
    save.createResourceProductionEvent([resourcePair(ResourceType.RawWood, 10)], [resourcePair(ResourceType.Wood, 25)], true, currentTime, 30);
};
buildingCreationFunctions[BuildingType.IronMine] = function (save, location, level, currentTime) {
    save.removeResourceInLocation(location, ResourceType.Wood, 100);
    save.removeResourceInLocation(location, ResourceType.LandArea, 200);
    save.createResourceProductionEvent([resourcePair(ResourceType.RawIron, 10)], [resourcePair(ResourceType.Iron, 10)], true, currentTime, 30);
};
buildingCreationFunctions[BuildingType.Barracks] = function (save, location, level, currentTime) {
    save.removeResourceInLocation(location, ResourceType.Wood, 150);
    save.removeResourceInLocation(location, ResourceType.LandArea, 100);
    save.createResourceProductionEvent([
        resourcePair(ResourceType.Population, 1),
        resourcePair(ResourceType.IronSword, 1)
    ], [
        resourcePair(ResourceType.BasicSwordsman, 1)
    ], true, currentTime, 120);
};
buildingCreationFunctions[BuildingType.Swordsmith] = function (save, location, level, currentTime) {
    save.removeResourceInLocation(location, ResourceType.Wood, 150);
    save.removeResourceInLocation(location, ResourceType.LandArea, 100);
    save.createResourceProductionEvent([
        resourcePair(ResourceType.Iron, 5),
        resourcePair(ResourceType.Wood, 5)
    ], [
        resourcePair(ResourceType.IronSword, 5)
    ], true, currentTime, 120);
};
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
var NotEnoughResourcesError = (function () {
    function NotEnoughResourcesError() {
        this.name = "NotEnoughResourcesError";
        this.message = "Not Enough Resources";
    }
    return NotEnoughResourcesError;
}());
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
    SaveFile.prototype.getLocation = function (locationName) {
        return this.Data.LocationList.filter(function (locationData) { return locationData.Name == locationName; })[0];
    };
    SaveFile.prototype.addResourceInLocation = function (location, type, count) {
        if (location.ResourceAmounts[type] !== undefined) {
            location.ResourceAmounts[type] = 0;
        }
        if (location.ResourceAmounts[type] + count >= 0) {
            location.ResourceAmounts[type] += count;
        }
        else {
            throw new NotEnoughResourcesError();
        }
    };
    SaveFile.prototype.removeResourceInLocation = function (location, type, count) {
        return this.addResourceInLocation(location, type, -count);
    };
    SaveFile.prototype.addBuildingInLocation = function (location, buildingType, buildingLevel, currentTime) {
    };
    SaveFile.prototype.createRandomVillageLocation = function (currentTime) {
        var locationName = "Testing Location";
        this.Data.LocationList.push({
            Type: LocationType.Village,
            Name: locationName,
            Connections: [],
            ResourceAmounts: {},
            DropedItems: [],
            Buildings: [],
            LocationData: {}
        });
        var location = this.getLocation(locationName);
        this.addResourceInLocation(location, ResourceType.LandArea, 2000);
        this.addResourceInLocation(location, ResourceType.Wood, 250);
        this.addResourceInLocation(location, ResourceType.RawWood, 5000);
        this.addResourceInLocation(location, ResourceType.RawIron, 1500);
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
        // 50 wood should be spare
        return locationName;
    };
    SaveFile.prototype.createRandomHeroInLocation = function (locationName) {
    };
    SaveFile.prototype.generateBasicData = function () {
        var currentTime = time();
        var baseLocationId = this.createRandomVillageLocation(currentTime);
        var baseLocation = this.getLocation(baseLocationId);
        this.addResourceInLocation(baseLocation, ResourceType.Wood, 500);
        this.addBuildingInLocation(baseLocation, BuildingType.IronMine, 1, currentTime); // 100 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Sawmill, 1, currentTime); // 50 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Swordsmith, 1, currentTime); // 150 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Barracks, 1, currentTime); // 200 wood
        this.createRandomHeroInLocation(baseLocationId);
        this.createPrimaryRaidEvent(1, currentTime);
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
    SaveFile.prototype.createOneTimeResourceEvent = function (pair, startTime, duration) {
    };
    SaveFile.prototype.createResourceProductionEvent = function (inputs, outputs, repeats, startTime, duration) {
        this.PendingEventList.push({
            EventType: repeats ? EventType.PersistantResourceProductionEvent : EventType.OneTimeResourceProductionEvent,
            EventDetails: {
                Inputs: inputs,
                Outputs: outputs
            },
            EventStartTime: startTime,
            EventDuration: duration
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
        else if (event.EventType == EventType.OneTimeResourceProductionEvent || event.EventType == EventType.PersistantResourceProductionEvent) {
            var details = event.EventDetails;
            var ret = "";
            ret += "Turns {";
            details.Inputs.forEach(function (pair) {
                ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
            });
            ret += "} Into {";
            details.Outputs.forEach(function (pair) {
                ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
            });
            ret += "}";
            return ret;
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
