/*
    Deadline Simulator

    Every x seconds the player fights off an advancing force. They have to accure resources by preforming actions to fight the force off.
    This is basicly a resource and time management game.
    Game Over state occours if the player does'nt have enough resources to fight off the wave.
    One interesting aspect is resources are consumed in the attack.
    
    Savegame Storage is stored in
*/
// TODO; [x] Resource Generation
// TODO: [x] Add Lose Condition
// TODO: Building Upgrades
// TODO: New Buildings
// TODO: Unit System
// TODO: Day/Night System
// TODO: Time Skips
// TODO: Hidden Events
// TODO: Better Mobile Display
// TODO: World Generation
// TODO: Message Display System
// TODO: Fix real time time skip
function deleteSaveFile() {
    localStorage.clear();
    document.location.reload();
    return false;
}
var EventType;
(function (EventType) {
    EventType[EventType["PrimaryRaid"] = 0] = "PrimaryRaid";
    EventType[EventType["PersistantResourceProductionEvent"] = 1] = "PersistantResourceProductionEvent";
    EventType[EventType["OneTimeResourceProductionEvent"] = 2] = "OneTimeResourceProductionEvent";
    EventType[EventType["BuildingCompleteEvent"] = 3] = "BuildingCompleteEvent";
    EventType[EventType["BuildingUpgradeCompleteEvent"] = 4] = "BuildingUpgradeCompleteEvent";
})(EventType || (EventType = {}));
;
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["Population"] = 0] = "Population";
    ResourceType[ResourceType["LandArea"] = 1] = "LandArea";
    ResourceType[ResourceType["Forest"] = 2] = "Forest";
    ResourceType[ResourceType["RawWood"] = 3] = "RawWood";
    ResourceType[ResourceType["Wood"] = 4] = "Wood";
    ResourceType[ResourceType["IronSword"] = 5] = "IronSword";
    ResourceType[ResourceType["RawIron"] = 6] = "RawIron";
    ResourceType[ResourceType["Iron"] = 7] = "Iron";
    ResourceType[ResourceType["SteelSword"] = 8] = "SteelSword";
    ResourceType[ResourceType["Steel"] = 9] = "Steel";
    ResourceType[ResourceType["Longbow"] = 10] = "Longbow";
    ResourceType[ResourceType["Arrow"] = 11] = "Arrow";
    ResourceType[ResourceType["IronSwordsman"] = 12] = "IronSwordsman";
    ResourceType[ResourceType["Knight"] = 13] = "Knight";
    ResourceType[ResourceType["Archer"] = 14] = "Archer";
    ResourceType[ResourceType["WatchTower"] = 15] = "WatchTower";
    ResourceType[ResourceType["Castle"] = 16] = "Castle";
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
    BuildingType[BuildingType["Foundry"] = 2] = "Foundry";
    BuildingType[BuildingType["IronSwordsmith"] = 3] = "IronSwordsmith";
    BuildingType[BuildingType["SteelSwordsmith"] = 4] = "SteelSwordsmith";
    BuildingType[BuildingType["BowMaker"] = 5] = "BowMaker";
    BuildingType[BuildingType["Barracks"] = 6] = "Barracks";
    BuildingType[BuildingType["ArcheryRange"] = 7] = "ArcheryRange";
    BuildingType[BuildingType["Castle"] = 8] = "Castle";
    BuildingType[BuildingType["WatchTower"] = 9] = "WatchTower";
    BuildingType[BuildingType["House"] = 10] = "House";
})(BuildingType || (BuildingType = {}));
;
var buildingCreationFunctions = {};
buildingCreationFunctions[BuildingType.Sawmill] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 50), resourcePair(ResourceType.Forest, 1000)],
        Outputs: [resourcePair(ResourceType.RawWood, 1000)],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.RawWood, 10)],
                Outputs: [resourcePair(ResourceType.Wood, 25), resourcePair(ResourceType.LandArea, 10)],
                Duration: 60000,
                Repeat: true
            }]
    };
};
buildingCreationFunctions[BuildingType.IronMine] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 50), resourcePair(ResourceType.LandArea, 150)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.RawIron, 10)],
                Outputs: [resourcePair(ResourceType.Iron, 10)],
                Duration: 30000,
                Repeat: true
            }]
    };
};
buildingCreationFunctions[BuildingType.Foundry] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 100), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Iron, 5), resourcePair(ResourceType.Wood, 20)],
                Outputs: [resourcePair(ResourceType.Steel, 5)],
                Duration: 60000,
                Repeat: true
            }]
    };
};
buildingCreationFunctions[BuildingType.IronSwordsmith] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 100), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Iron, 5), resourcePair(ResourceType.Wood, 5)],
                Outputs: [resourcePair(ResourceType.IronSword, 5)],
                Duration: 60000,
                Repeat: true
            }]
    };
};
buildingCreationFunctions[BuildingType.SteelSwordsmith] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 150), resourcePair(ResourceType.Iron, 25), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Steel, 5), resourcePair(ResourceType.Wood, 5)],
                Outputs: [resourcePair(ResourceType.IronSword, 5)],
                Duration: 120000,
                Repeat: true
            }]
    };
};
buildingCreationFunctions[BuildingType.BowMaker] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 150), resourcePair(ResourceType.Iron, 25), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Steel, 5), resourcePair(ResourceType.Wood, 5)],
                Outputs: [resourcePair(ResourceType.Longbow, 5)],
                Duration: 120000,
                Repeat: true
            }, {
                Inputs: [resourcePair(ResourceType.Wood, 5)],
                Outputs: [resourcePair(ResourceType.Arrow, 10)],
                Duration: 20000,
                Repeat: true
            }]
    };
};
buildingCreationFunctions[BuildingType.Barracks] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 150), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Population, 1), resourcePair(ResourceType.IronSword, 1)],
                Outputs: [resourcePair(ResourceType.IronSwordsman, 1)],
                Duration: 100000,
                Repeat: true
            }]
    };
};
buildingCreationFunctions[BuildingType.WatchTower] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 100), resourcePair(ResourceType.Iron, 25),
            resourcePair(ResourceType.LandArea, 20), resourcePair(ResourceType.Population, 10)],
        Outputs: [resourcePair(ResourceType.WatchTower, 1)],
        ProductionEvents: []
    };
};
buildingCreationFunctions[BuildingType.House] = function (level) {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 50), resourcePair(ResourceType.LandArea, 20)],
        Outputs: [resourcePair(ResourceType.Population, 25)],
        ProductionEvents: []
    };
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
        // this.createNewGame();
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
    SaveFile.prototype.getResourcesInLocation = function (location, type) {
        if (location.ResourceAmounts[type] == undefined) {
            return 0;
        }
        else {
            return location.ResourceAmounts[type];
        }
    };
    SaveFile.prototype.addResourceInLocation = function (location, type, count) {
        if (location.ResourceAmounts[type] == undefined) {
            location.ResourceAmounts[type] = 0;
        }
        console.log("addResourceInLocation", location.Name, ResourceType[type], count, location.ResourceAmounts[type]);
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
        var _this = this;
        location.Buildings.push({
            Type: buildingType,
            Level: buildingLevel
        });
        var buildingCreateInfo = buildingCreationFunctions[buildingType](buildingLevel);
        buildingCreateInfo.Inputs.forEach((function (pair) { return _this.removeResourceInLocation(location, pair.Type, pair.Count); }).bind(this));
        buildingCreateInfo.Outputs.forEach((function (pair) { return _this.addResourceInLocation(location, pair.Type, pair.Count); }).bind(this));
        buildingCreateInfo.ProductionEvents.forEach((function (prodEvent) {
            _this.createResourceProductionEvent(location.Name, prodEvent.Inputs, prodEvent.Outputs, prodEvent.Repeat, currentTime, prodEvent.Duration);
        }).bind(this));
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
        this.addResourceInLocation(location, ResourceType.Forest, 5000);
        this.addResourceInLocation(location, ResourceType.LandArea, 1000);
        this.addResourceInLocation(location, ResourceType.Wood, 500);
        this.addResourceInLocation(location, ResourceType.RawIron, 1500);
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
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
        this.addBuildingInLocation(baseLocation, BuildingType.IronSwordsmith, 1, currentTime); // 150 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Barracks, 1, currentTime); // 200 wood
        this.createRandomHeroInLocation(baseLocationId);
        this.createPrimaryRaidEvent(baseLocationId, 1, currentTime);
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
    SaveFile.prototype.createPrimaryRaidEvent = function (locationName, raidLevel, startTime) {
        this.PendingEventList.push({
            Location: locationName,
            Type: EventType.PrimaryRaid,
            Details: {
                RaidLevel: raidLevel,
                ResourcesRequired: getResourcesForRaidLevel(raidLevel)
            },
            StartTime: startTime,
            Duration: getDurationForRaidLevel(raidLevel)
        });
    };
    SaveFile.prototype.createResourceProductionEvent = function (locationName, inputs, outputs, repeats, startTime, duration) {
        this.PendingEventList.push({
            Location: locationName,
            Type: repeats ? EventType.PersistantResourceProductionEvent : EventType.OneTimeResourceProductionEvent,
            Details: {
                Inputs: inputs,
                Outputs: outputs
            },
            StartTime: startTime,
            Duration: duration
        });
    };
    SaveFile.prototype.hasEventPassed = function (event) {
        return (event.StartTime + event.Duration) < time();
    };
    SaveFile.prototype.lose = function () {
        this.Data.HasLost = true;
        this.save();
        alert("You have been overrun.");
    };
    SaveFile.prototype.getForceAmountInLocation = function (location) {
        return (this.getResourcesInLocation(location, ResourceType.IronSwordsman) * 25) +
            (this.getResourcesInLocation(location, ResourceType.Knight) * 50) +
            (this.getResourcesInLocation(location, ResourceType.Archer) * 40) +
            (this.getResourcesInLocation(location, ResourceType.WatchTower) * 200) + 100;
    };
    SaveFile.prototype.complateEvent = function (event) {
        var _this = this;
        var location = this.getLocation(event.Location);
        if (event.Type == EventType.PrimaryRaid) {
            var details = event.Details;
            if (details.ResourcesRequired > this.getForceAmountInLocation(location)) {
                this.lose();
            }
            else {
                this.createPrimaryRaidEvent(event.Location, details.RaidLevel + 1, event.StartTime + event.Duration);
            }
        }
        else if (event.Type == EventType.PersistantResourceProductionEvent || event.Type == EventType.OneTimeResourceProductionEvent) {
            var details = event.Details;
            details.Inputs.forEach((function (pair) { return _this.removeResourceInLocation(location, pair.Type, pair.Count); }).bind(this));
            details.Outputs.forEach((function (pair) { return _this.addResourceInLocation(location, pair.Type, pair.Count); }).bind(this));
            if (event.Type == EventType.PersistantResourceProductionEvent) {
                this.createResourceProductionEvent(event.Location, details.Inputs, details.Outputs, true, event.StartTime + event.Duration, event.Duration);
            }
        }
    };
    SaveFile.prototype.getEventDetails = function (event) {
        // TODO: Make this return a Element with nice styling
        if (event.Type == EventType.PrimaryRaid) {
            var details = event.Details;
            return "Level = " + details.RaidLevel.toString(10) + " | Required Force Amount = " + details.ResourcesRequired.toString(10);
        }
        else if (event.Type == EventType.OneTimeResourceProductionEvent || event.Type == EventType.PersistantResourceProductionEvent) {
            var details = event.Details;
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
    SaveFile.prototype.getEventTable = function () {
        var _this = this;
        return this.Data.EventList.map((function (event) {
            return {
                "Event Type": EventType[event.Type],
                "Time Remaining": printTime((event.StartTime + event.Duration) - time()),
                "Details": _this.getEventDetails(event)
            };
        }).bind(this));
    };
    SaveFile.prototype.getCurrentLocation = function () {
        return "Testing Location";
    };
    SaveFile.prototype.getCurrentLocationResourceTable = function () {
        var location = this.getLocation(this.getCurrentLocation());
        return Object.keys(location.ResourceAmounts).map(function (rKey) {
            return {
                "Resource Type": ResourceType[rKey],
                "Resource Amount": location.ResourceAmounts[rKey].toString(10)
            };
        });
    };
    SaveFile.prototype.getCurrentLocationBuildingTable = function () {
        var location = this.getLocation(this.getCurrentLocation());
        return location.Buildings.map(function (building) {
            return {
                "Building Type": BuildingType[building.Type],
                "Building Level": building.Level.toString(10)
            };
        });
    };
    SaveFile.prototype.update = function () {
        var _this = this;
        if (this.Data.HasLost) {
            return;
        }
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
        document.querySelector("#currentForceAmount").textContent = save.getForceAmountInLocation(save.getLocation(save.getCurrentLocation())).toString(10);
        renderTable(document.querySelector("#currentDeadlineList"), save.getEventTable());
        renderTable(document.querySelector("#currentLocationResourceList"), save.getCurrentLocationResourceTable());
        renderTable(document.querySelector("#currentLocationBuildingList"), save.getCurrentLocationBuildingTable());
    }, 1000);
}
document.addEventListener("DOMContentLoaded", main);
