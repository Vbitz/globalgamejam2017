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
    ResourceType[ResourceType["RawStone"] = 8] = "RawStone";
    ResourceType[ResourceType["Stone"] = 9] = "Stone";
    ResourceType[ResourceType["SteelSword"] = 10] = "SteelSword";
    ResourceType[ResourceType["Steel"] = 11] = "Steel";
    ResourceType[ResourceType["Longbow"] = 12] = "Longbow";
    ResourceType[ResourceType["Arrow"] = 13] = "Arrow";
    ResourceType[ResourceType["IronSwordsman"] = 14] = "IronSwordsman";
    ResourceType[ResourceType["Knight"] = 15] = "Knight";
    ResourceType[ResourceType["Archer"] = 16] = "Archer";
    ResourceType[ResourceType["WatchTower"] = 17] = "WatchTower";
    ResourceType[ResourceType["Castle"] = 18] = "Castle";
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
    BuildingType[BuildingType["StoneQuarry"] = 2] = "StoneQuarry";
    BuildingType[BuildingType["Foundry"] = 3] = "Foundry";
    BuildingType[BuildingType["IronSwordsmith"] = 4] = "IronSwordsmith";
    BuildingType[BuildingType["SteelSwordsmith"] = 5] = "SteelSwordsmith";
    BuildingType[BuildingType["BowMaker"] = 6] = "BowMaker";
    BuildingType[BuildingType["Barracks"] = 7] = "Barracks";
    BuildingType[BuildingType["ArcheryRange"] = 8] = "ArcheryRange";
    BuildingType[BuildingType["Castle"] = 9] = "Castle";
    BuildingType[BuildingType["WatchTower"] = 10] = "WatchTower";
    BuildingType[BuildingType["House"] = 11] = "House";
})(BuildingType || (BuildingType = {}));
;
var buildingCreationFunctions = {};
buildingCreationFunctions[BuildingType.Sawmill] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 50), resourcePair(ResourceType.Forest, 1000)],
        Outputs: [resourcePair(ResourceType.RawWood, 500 * level)],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.RawWood, 10 * level)],
                Outputs: [resourcePair(ResourceType.Wood, 25 * (level * 5)), resourcePair(ResourceType.LandArea, 10 * level)],
                Duration: 60000,
                Repeat: true
            }],
        BuildTime: 240000,
        UpgradeResources: [resourcePair(ResourceType.Forest, 500 * level)],
        UpgradeTime: 60000 * level
    };
};
buildingCreationFunctions[BuildingType.IronMine] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 50), resourcePair(ResourceType.LandArea, 150)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.RawIron, 10 * level)],
                Outputs: [resourcePair(ResourceType.Iron, 10 * (level * 2))],
                Duration: 30000,
                Repeat: true
            }],
        BuildTime: 240000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 100 * level)],
        UpgradeTime: 100000 * level
    };
};
buildingCreationFunctions[BuildingType.StoneQuarry] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 25), resourcePair(ResourceType.LandArea, 400)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.RawStone, 10)],
                Outputs: [resourcePair(ResourceType.Stone, (10 * level))],
                Duration: 30000,
                Repeat: true
            }],
        BuildTime: 200000,
        UpgradeResources: [resourcePair(ResourceType.LandArea, 200 * level)],
        UpgradeTime: 100000 * level
    };
};
buildingCreationFunctions[BuildingType.Foundry] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 100), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Iron, (5 * level)), resourcePair(ResourceType.Wood, 20)],
                Outputs: [resourcePair(ResourceType.Steel, (5 * level))],
                Duration: 60000,
                Repeat: true
            }],
        BuildTime: 300000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 100 * level)],
        UpgradeTime: 100000 * level
    };
};
buildingCreationFunctions[BuildingType.IronSwordsmith] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 100), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Iron, (2 * level)), resourcePair(ResourceType.Wood, 5)],
                Outputs: [resourcePair(ResourceType.IronSword, (2 * level))],
                Duration: 60000,
                Repeat: true
            }],
        BuildTime: 200000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 50 * level)],
        UpgradeTime: 100000 * level
    };
};
buildingCreationFunctions[BuildingType.SteelSwordsmith] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 150), resourcePair(ResourceType.Iron, 25), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Steel, level), resourcePair(ResourceType.Wood, level * 2)],
                Outputs: [resourcePair(ResourceType.SteelSword, level)],
                Duration: 120000,
                Repeat: true
            }],
        BuildTime: 400000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 50 * level), resourcePair(ResourceType.Iron, 5)],
        UpgradeTime: 200000 * level
    };
};
buildingCreationFunctions[BuildingType.BowMaker] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 150), resourcePair(ResourceType.Iron, 25), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Iron, (5 * level)), resourcePair(ResourceType.Wood, 5)],
                Outputs: [resourcePair(ResourceType.Longbow, (5 * level))],
                Duration: 100000,
                Repeat: true
            }, {
                Inputs: [resourcePair(ResourceType.Wood, 5 * level)],
                Outputs: [resourcePair(ResourceType.Arrow, 10 * (level * 2))],
                Duration: 20000,
                Repeat: true
            }],
        BuildTime: 240000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 50 * level), resourcePair(ResourceType.Iron, 5)],
        UpgradeTime: 150000 * level
    };
};
buildingCreationFunctions[BuildingType.Barracks] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 150), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Population, level), resourcePair(ResourceType.IronSword, level)],
                Outputs: [resourcePair(ResourceType.IronSwordsman, level)],
                Duration: 100000,
                Repeat: true
            }],
        BuildTime: 200000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 50 * level)],
        UpgradeTime: 100000 * level
    };
};
buildingCreationFunctions[BuildingType.ArcheryRange] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 200), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
                Inputs: [
                    resourcePair(ResourceType.Population, level),
                    resourcePair(ResourceType.Longbow, level),
                    resourcePair(ResourceType.Arrow, 25 * level)
                ],
                Outputs: [resourcePair(ResourceType.Archer, level)],
                Duration: 100000,
                Repeat: true
            }],
        BuildTime: 300000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 100 * level)],
        UpgradeTime: 150000 * level
    };
};
buildingCreationFunctions[BuildingType.Castle] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Stone, 150), resourcePair(ResourceType.LandArea, 50),
            resourcePair(ResourceType.Archer, 10), resourcePair(ResourceType.Arrow, 1000)],
        Outputs: [resourcePair(ResourceType.Castle, level)],
        ProductionEvents: [{
                Inputs: [resourcePair(ResourceType.Population, level), resourcePair(ResourceType.SteelSword, level)],
                Outputs: [resourcePair(ResourceType.Knight, 1)],
                Duration: 200000,
                Repeat: true
            }],
        BuildTime: 600000,
        UpgradeResources: [resourcePair(ResourceType.Stone, 100 * level), resourcePair(ResourceType.Archer, level * 5), resourcePair(ResourceType.Arrow, 200 * level)],
        UpgradeTime: 200000 * level
    };
};
buildingCreationFunctions[BuildingType.WatchTower] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 100), resourcePair(ResourceType.Iron, 25),
            resourcePair(ResourceType.LandArea, 20), resourcePair(ResourceType.Archer, 5),
            resourcePair(ResourceType.Arrow, 100)],
        Outputs: [resourcePair(ResourceType.WatchTower, level)],
        ProductionEvents: [],
        BuildTime: 400000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 100 * level)],
        UpgradeTime: 200000 * level
    };
};
buildingCreationFunctions[BuildingType.House] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 50), resourcePair(ResourceType.LandArea, 20)],
        Outputs: [resourcePair(ResourceType.Population, 10 * level)],
        ProductionEvents: [],
        BuildTime: 100000,
        UpgradeResources: [resourcePair(ResourceType.Wood, 10 * level)],
        UpgradeTime: 60000 * level
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
    console.table(arr.map((v, i) => {
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
class NotEnoughResourcesError {
    constructor() {
        this.name = "NotEnoughResourcesError";
        this.message = "Not Enough Resources";
    }
}
class SaveFile {
    constructor() {
        this.PendingEventList = [];
        // this.createNewGame();
    }
    isNewGame() {
        return localStorage.getItem("saveData") == null;
    }
    createNewGame() {
        this.Data = {
            HasLost: false,
            EventList: [],
            LocationList: [],
            UnitList: [],
        };
        this.generateBasicData();
    }
    getLocation(locationName) {
        return this.Data.LocationList.filter((locationData) => locationData.Name == locationName)[0];
    }
    getResourcesInLocation(location, type) {
        if (location.ResourceAmounts[type] == undefined) {
            return 0;
        }
        else {
            return location.ResourceAmounts[type];
        }
    }
    addResourceInLocation(location, type, count) {
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
    }
    removeResourceInLocation(location, type, count) {
        return this.addResourceInLocation(location, type, -count);
    }
    addBuildingInLocation(location, buildingType, buildingLevel, useResources, currentTime) {
        location.Buildings.push({
            Id: Math.random(),
            Type: buildingType,
            Level: buildingLevel
        });
        var buildingCreateInfo = buildingCreationFunctions[buildingType](buildingLevel);
        if (useResources) {
            buildingCreateInfo.Inputs.forEach(((pair) => this.removeResourceInLocation(location, pair.Type, pair.Count)).bind(this));
        }
        buildingCreateInfo.Outputs.forEach(((pair) => this.addResourceInLocation(location, pair.Type, pair.Count)).bind(this));
        buildingCreateInfo.ProductionEvents.forEach(((prodEvent) => {
            this.createResourceProductionEvent(location.Name, prodEvent.Inputs, prodEvent.Outputs, prodEvent.Repeat, currentTime, prodEvent.Duration);
        }).bind(this));
    }
    getBuildingInLocation(location, buildingId) {
        return location.Buildings.filter((building) => {
            return building.Id == buildingId;
        })[0];
    }
    createRandomVillageLocation(currentTime) {
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
        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        // 50 wood should be spare
        return locationName;
    }
    createRandomHeroInLocation(locationName) {
    }
    generateBasicData() {
        var currentTime = time();
        var baseLocationId = this.createRandomVillageLocation(currentTime);
        var baseLocation = this.getLocation(baseLocationId);
        this.addResourceInLocation(baseLocation, ResourceType.Wood, 500);
        this.addBuildingInLocation(baseLocation, BuildingType.IronMine, 1, true, currentTime); // 100 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Sawmill, 1, true, currentTime); // 50 wood
        this.addBuildingInLocation(baseLocation, BuildingType.IronSwordsmith, 1, true, currentTime); // 150 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Barracks, 1, true, currentTime); // 200 wood
        this.createRandomHeroInLocation(baseLocationId);
        this.createPrimaryRaidEvent(baseLocationId, 1, currentTime);
    }
    load() {
        this.Data = JSON.parse(localStorage.getItem("saveData"));
    }
    save() {
        localStorage.setItem("saveData", JSON.stringify(this.Data));
    }
    getEventList() {
        return this.Data.EventList;
    }
    createPrimaryRaidEvent(locationName, raidLevel, startTime) {
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
    }
    createResourceProductionEvent(locationName, inputs, outputs, repeats, startTime, duration) {
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
    }
    createBuildingCompleteEvent(locationName, buildingType, startTime) {
        this.PendingEventList.push({
            Location: locationName,
            Type: EventType.BuildingCompleteEvent,
            Details: {
                Id: null,
                Type: buildingType,
                NewLevel: 1
            },
            StartTime: startTime,
            Duration: this.getBuildingData(buildingType, 1).BuildTime
        });
    }
    createBuildingUpgradeEvent(locationName, buildingId, startTime) {
        var buildingInfo = this.getBuildingInLocation(this.getLocation(locationName), buildingId);
        var buildingType = .Type;
        this.PendingEventList.push({
            Location: locationName,
            Type: EventType.BuildingCompleteEvent,
            Details: {
                Id: buildingId,
                Type: buildingType,
                NewLevel: 1
            },
            StartTime: startTime,
            Duration: this.getBuildingData(buildingType, 1).UpgradeTime
        });
    }
    doBuildingUpgrade(location, buildingId, newLevel) {
    }
    startBuildingUpgrade() {
    }
    hasEventPassed(event) {
        return (event.StartTime + event.Duration) < time();
    }
    lose() {
        this.Data.HasLost = true;
        this.save();
        alert("You have been overrun.");
    }
    getForceAmountInLocation(location) {
        return (this.getResourcesInLocation(location, ResourceType.IronSwordsman) * 20) +
            (this.getResourcesInLocation(location, ResourceType.Knight) * 50) +
            (this.getResourcesInLocation(location, ResourceType.Archer) * 30) +
            (this.getResourcesInLocation(location, ResourceType.WatchTower) * 200) +
            (this.getResourcesInLocation(location, ResourceType.Castle) * 500) + 100;
    }
    complateEvent(event) {
        var location = this.getLocation(event.Location);
        if (event.Type == EventType.PrimaryRaid) {
            let details = event.Details;
            if (details.ResourcesRequired > this.getForceAmountInLocation(location)) {
                this.lose();
            }
            else {
                this.createPrimaryRaidEvent(event.Location, details.RaidLevel + 1, event.StartTime + event.Duration);
            }
        }
        else if (event.Type == EventType.PersistantResourceProductionEvent || event.Type == EventType.OneTimeResourceProductionEvent) {
            let details = event.Details;
            details.Inputs.forEach(((pair) => this.removeResourceInLocation(location, pair.Type, pair.Count)).bind(this));
            details.Outputs.forEach(((pair) => this.addResourceInLocation(location, pair.Type, pair.Count)).bind(this));
            if (event.Type == EventType.PersistantResourceProductionEvent) {
                this.createResourceProductionEvent(event.Location, details.Inputs, details.Outputs, true, event.StartTime + event.Duration, event.Duration);
            }
        }
        else if (event.Type == EventType.BuildingCompleteEvent) {
            let details = event.Details;
            this.addBuildingInLocation(location, details.Type, details.NewLevel, false, event.StartTime + event.Duration);
        }
        else if (event.Type == EventType.BuildingUpgradeCompleteEvent) {
            let details = event.Details;
            this.doBuildingUpgrade(location, details.Id, details.NewLevel);
        }
    }
    getEventDetails(event) {
        // TODO: Make this return a Element with nice styling
        if (event.Type == EventType.PrimaryRaid) {
            let details = event.Details;
            return "Level = " + details.RaidLevel.toString(10) + " | Required Force Amount = " + details.ResourcesRequired.toString(10);
        }
        else if (event.Type == EventType.OneTimeResourceProductionEvent || event.Type == EventType.PersistantResourceProductionEvent) {
            let details = event.Details;
            var ret = "";
            ret += "Turns {";
            details.Inputs.forEach((pair) => {
                ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
            });
            ret += "} Into {";
            details.Outputs.forEach((pair) => {
                ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
            });
            ret += "}";
            return ret;
        }
        else if (event.Type == EventType.BuildingCompleteEvent || event.Type == EventType.BuildingUpgradeCompleteEvent) {
            let details = event.Details;
        }
    }
    getBuildingData(type, level) {
        return buildingCreationFunctions[type](level);
    }
    getBuildingUpgradeRequirements(type, newLevel) {
        var ret = "";
        buildingCreationFunctions[type](newLevel).UpgradeResources.forEach((pair) => {
            ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
        });
        return ret;
    }
    getEventTable() {
        return this.Data.EventList.map(((event) => {
            return {
                "Event Type": EventType[event.Type],
                "Time Remaining": printTime((event.StartTime + event.Duration) - time()),
                "Details": this.getEventDetails(event)
            };
        }).bind(this));
    }
    getCurrentLocation() {
        return "Testing Location";
    }
    getCurrentLocationResourceTable() {
        var location = this.getLocation(this.getCurrentLocation());
        return Object.keys(location.ResourceAmounts).map((rKey) => {
            return {
                "Resource Type": ResourceType[rKey],
                "Resource Amount": location.ResourceAmounts[rKey].toString(10)
            };
        });
    }
    getCurrentLocationBuildingTable() {
        var location = this.getLocation(this.getCurrentLocation());
        return location.Buildings.map(((building) => {
            var upgradeButton = document.createElement("a");
            upgradeButton.className = "btn btn-primary";
            upgradeButton.addEventListener("click", () => {
                event.preventDefault();
            });
            upgradeButton.textContent = "Upgrade";
            return {
                "Building Type": BuildingType[building.Type],
                "Building Level": building.Level.toString(10),
                "Upgrade Requirements": this.getBuildingUpgradeRequirements(building.Type, building.Level + 1),
                "Upgrade": [upgradeButton]
            };
        }).bind(this));
    }
    update() {
        if (this.Data.HasLost) {
            return;
        }
        this.Data.EventList = this.Data.EventList.filter(((event) => {
            if (!this.hasEventPassed(event)) {
                return true;
            }
            else {
                console.log("Completing: " + event);
                this.complateEvent(event);
                return false;
            }
        }).bind(this));
        this.PendingEventList.forEach((event) => this.Data.EventList.push(event));
        this.PendingEventList = [];
    }
}
function e(type, attrs, value) {
    var newElement = document.createElement(type);
    for (var k in attrs) {
        newElement.setAttribute(k, attrs[k]);
    }
    if (value instanceof Array) {
        value.forEach((ele) => newElement.appendChild(ele));
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
        e("tr", {}, Object.keys(data[0]).map((heading) => e("th", {}, heading)))
    ]));
    tableElement.appendChild(e("tbody", {}, data.map((dataRow) => {
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
