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

function deleteSaveFile(): boolean {
    localStorage.clear();
    document.location.reload();
    return false;
}

enum EventType {
    PrimaryRaid,

    PersistantResourceProductionEvent,

    OneTimeResourceProductionEvent,
};

type PrimaryRaidEvent = {
    RaidLevel: number;
    ResourcesRequired: number;
};

enum ResourceType {
    Population,
    
    LandArea,
    
    RawWood,
    Wood,

    IronSword,
    RawIron,
    Iron,

    BasicSwordsman,
    WatchTower,
};

type ResourcePair = {
    Type: ResourceType;
    Count: number;
};

function resourcePair(type: ResourceType, count: number): ResourcePair {
    return {
        Type: type,
        Count: count
    };
}

type ResourceProductionEvent = {
    Outputs: ResourcePair[];
    Inputs: ResourcePair[];
};

type EventData = {
    EventType: EventType;
    EventLocation: string;
    EventDetails: (ResourceProductionEvent | PrimaryRaidEvent);
    EventStartTime: number;
    EventDuration: number;
};

enum LocationType {
    Town,
    City,
    Village,
    Mountion,
    DungeonEntrance,
    DungeonLevel
};

type ConnectionData = {
    DestinationName: string;
    DestinationDistance: number;
};

type TownLocationData = {};
type CityLocationData = {};
type VillageLocationData = {};
type MountionLocationData = {};
type DungeonEntranceLocationData = {};
type DungeonLevelLocationData = {};

type ResourceStockpile = {[key: number]: number};

enum BuildingType {
    Sawmill,
    IronMine,
    Barracks,
    Swordsmith,
    WatchTower,
    House
};

type BuildingData = {
    Type: BuildingType;
    Level: number;
    FreeActionSlots: number;
    BuildingData: {};
};

var buildingCreationFunctions: {[key: number]: (save: SaveFile, location: LocationData, level: number, currentTime: number) => void} = {};

buildingCreationFunctions[BuildingType.Sawmill] = (save, location, level, currentTime) => {
    if (level == 1) {
        save.removeResourceInLocation(location, ResourceType.Wood, 50);
        save.removeResourceInLocation(location, ResourceType.LandArea, 100);
    }
    
    save.createResourceProductionEvent(location.Name, [resourcePair(ResourceType.RawWood, 10)], [resourcePair(ResourceType.Wood, 25)], true, currentTime, 30000);
};

buildingCreationFunctions[BuildingType.IronMine] = (save, location, level, currentTime) => {
    if (level == 1) {
        save.removeResourceInLocation(location, ResourceType.Wood, 100);
        save.removeResourceInLocation(location, ResourceType.LandArea, 200);
    }
    
    save.createResourceProductionEvent(location.Name, [resourcePair(ResourceType.RawIron, 10)], [resourcePair(ResourceType.Iron, 10)], true, currentTime, 30000);
};

buildingCreationFunctions[BuildingType.Barracks] = (save, location, level, currentTime) => {
    if (level == 1) {
        save.removeResourceInLocation(location, ResourceType.Wood, 150);
        save.removeResourceInLocation(location, ResourceType.LandArea, 100);
    }
    
    save.createResourceProductionEvent(location.Name, [
        resourcePair(ResourceType.Population, 1),
        resourcePair(ResourceType.IronSword, 1)
    ], [
        resourcePair(ResourceType.BasicSwordsman, 1)
    ], true, currentTime, 100000);
};

buildingCreationFunctions[BuildingType.Swordsmith] = (save, location, level, currentTime) => {
    if (level == 1) {
        save.removeResourceInLocation(location, ResourceType.Wood, 150);
        save.removeResourceInLocation(location, ResourceType.LandArea, 100);
    }

    save.createResourceProductionEvent(location.Name, [
        resourcePair(ResourceType.Iron, 5),
        resourcePair(ResourceType.Wood, 5)
    ], [
        resourcePair(ResourceType.IronSword, 5)
    ], true, currentTime, 60000);
};

buildingCreationFunctions[BuildingType.WatchTower] = (save, location, level, currentTime) => {
    if (level == 1) {
        save.removeResourceInLocation(location, ResourceType.Wood, 100);
        save.removeResourceInLocation(location, ResourceType.Iron, 25);
        save.removeResourceInLocation(location, ResourceType.LandArea, 20);
        save.removeResourceInLocation(location, ResourceType.Population, 10);
    }
    
    save.addResourceInLocation(location, ResourceType.WatchTower, 1);
};

buildingCreationFunctions[BuildingType.House] = (save, location, level, currentTime) => {
    if (level == 1) {
        save.removeResourceInLocation(location, ResourceType.Wood, 50);
        save.removeResourceInLocation(location, ResourceType.LandArea, 20);
    }
    
    save.addResourceInLocation(location, ResourceType.Population, 25);
};

type LocationData = {
    Type: LocationType;
    Name: string;
    Connections: ConnectionData[];
    ResourceAmounts: ResourceStockpile;
    DropedItems: ItemData[];
    Buildings: BuildingData[];
    LocationData: (TownLocationData | CityLocationData | VillageLocationData | MountionLocationData | DungeonEntranceLocationData | DungeonLevelLocationData);
};

type ItemData = {

};

enum UnitType {
    Hero
};

type UnitData = {
    UnitType: UnitType;
    UnitName: string;
    UnitLocation: string;
    UnitStats: {
        AttackPower: number,
        Health: number,
    };
    UnitInventory: ItemData[];
};

type SaveFileData = {
    HasLost: boolean;
    EventList: EventData[];
    LocationList: LocationData[];
    UnitList: UnitData[];
};

function getResourcesForRaidLevel(raidLevel: number): number {
    // Excel Formula: =ROUND((SIN(A2 / 0.5)+1) * 30, 0) * POWER(10, (ROUNDDOWN(A2 / 5, 0)) * 0.5)
    var value = Math.round((Math.sin(raidLevel / 0.5) + 1) * 30) * Math.pow(10, Math.floor(raidLevel / 5) * 0.5);
    value = Math.round(value);
    if (raidLevel == 1) {
        return value;
    } else {
        return value + getResourcesForRaidLevel(raidLevel - 1);
    }
}

function getDurationForRaidLevel(raidLevel: number): number {
    // Excel Formula: =ROUND((SIN(A2 / 0.5)+1) * 4, 0) * 15
    var value = Math.round((Math.sin(raidLevel / 0.5) + 1) * 4) * 15;
    value = value * 1000;
    if (raidLevel == 1) {
        return value;
    } else {
        return value + getDurationForRaidLevel(raidLevel - 1);
    }
}

function dumpRaidProgression(maxCount: number) {
    var arr: number[] = new Array(60);
    arr.fill(0);
    console.table(arr.map((v:number, i: number) => {return {
        level: i + 1,
        resources: getResourcesForRaidLevel(i + 1),
        duration: getDurationForRaidLevel(i + 1)
    }}));
}

function time(): number {
    return +(new Date());
}

function printTime(valueInMs: number): string {
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

class NotEnoughResourcesError implements Error {
    public name: string = "NotEnoughResourcesError";
    public message: string = "Not Enough Resources";
}

class SaveFile {
    private Data: SaveFileData;
    private PendingEventList: EventData[] = [];

    constructor() {
        // this.createNewGame();
    }

    public isNewGame(): boolean {
        return localStorage.getItem("saveData") == null;
    }

    public createNewGame() {
        this.Data = {
            HasLost: false,
            EventList: [],
            LocationList: [],
            UnitList: [],
        };

        this.generateBasicData();
    }

    public getLocation(locationName: string): LocationData {
        return this.Data.LocationList.filter((locationData: LocationData) => locationData.Name == locationName)[0];
    }

    public getResourcesInLocation(location: LocationData, type: ResourceType): number {
        if (location.ResourceAmounts[type] == undefined) {
            return 0;
        } else {
            return location.ResourceAmounts[type];
        }
    }

    public addResourceInLocation(location: LocationData, type: ResourceType, count: number) {
        if (location.ResourceAmounts[type] == undefined) {
            location.ResourceAmounts[type] = 0;
        }
        console.log("addResourceInLocation", location.Name, ResourceType[type], count, location.ResourceAmounts[type])
        if (location.ResourceAmounts[type] + count >= 0) {
            location.ResourceAmounts[type] += count;
        } else {
            throw new NotEnoughResourcesError();
        }
    }

    public removeResourceInLocation(location: LocationData, type: ResourceType, count: number) {
        return this.addResourceInLocation(location, type, -count);
    }

    public addBuildingInLocation(location: LocationData, buildingType: BuildingType, buildingLevel: number, currentTime: number) {
        location.Buildings.push({
            Type: buildingType,
            FreeActionSlots: 1,
            BuildingData: {},
            Level: buildingLevel
        });
        buildingCreationFunctions[buildingType](this, location, buildingLevel, currentTime);
    }

    public createRandomVillageLocation(currentTime: number) {
        var locationName = "Testing Location";
        
        this.Data.LocationList.push({
            Type: LocationType.Village,
            Name: locationName,
            Connections: [],
            ResourceAmounts: {},
            DropedItems: [],
            Buildings: [],
            LocationData: <VillageLocationData> {}
        });

        var location = this.getLocation(locationName);

        this.addResourceInLocation(location, ResourceType.LandArea, 1000);
        this.addResourceInLocation(location, ResourceType.Wood, 500);
        this.addResourceInLocation(location, ResourceType.RawWood, 5000);
        this.addResourceInLocation(location, ResourceType.RawIron, 1500);
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, currentTime); // 50 wood
        
        // 50 wood should be spare

        return locationName;
    }

    public createRandomHeroInLocation(locationName: string) {

    }

    public generateBasicData() {
        var currentTime = time();
        var baseLocationId = this.createRandomVillageLocation(currentTime);
        var baseLocation = this.getLocation(baseLocationId);
        this.addResourceInLocation(baseLocation, ResourceType.Wood, 500);
        this.addBuildingInLocation(baseLocation, BuildingType.IronMine, 1, currentTime);    // 100 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Sawmill, 1, currentTime);     // 50 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Swordsmith, 1, currentTime);  // 150 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Barracks, 1, currentTime);    // 200 wood
        this.createRandomHeroInLocation(baseLocationId);
        this.createPrimaryRaidEvent(baseLocationId, 1, currentTime);
    }

    public load() {
        this.Data = JSON.parse(localStorage.getItem("saveData"));
    }

    public save() {
        localStorage.setItem("saveData", JSON.stringify(this.Data));
    }

    public getEventList(): EventData[] {
        return this.Data.EventList;
    }

    public createPrimaryRaidEvent(locationName: string, raidLevel: number, startTime: number) {
        this.PendingEventList.push({
            EventLocation: locationName,
            EventType: EventType.PrimaryRaid,
            EventDetails: <PrimaryRaidEvent> {
                RaidLevel: raidLevel,
                ResourcesRequired: getResourcesForRaidLevel(raidLevel)
            },
            EventStartTime: startTime,
            EventDuration: getDurationForRaidLevel(raidLevel)
        })
    }

    public createResourceProductionEvent(locationName: string, inputs: ResourcePair[], outputs: ResourcePair[], repeats: boolean, startTime: number, duration: number) {
        this.PendingEventList.push({
            EventLocation: locationName,
            EventType: repeats ? EventType.PersistantResourceProductionEvent : EventType.OneTimeResourceProductionEvent,
            EventDetails: <ResourceProductionEvent> {
                Inputs: inputs,
                Outputs: outputs
            },
            EventStartTime: startTime,
            EventDuration: duration
        });
    }

    public hasEventPassed(event: EventData): boolean {
        return (event.EventStartTime + event.EventDuration) < time();
    }

    public lose() {
        this.Data.HasLost = true;
        this.save();
        alert("You have been overrun.");
    }

    public getForceAmountInLocation(location: LocationData): number {
        return (this.getResourcesInLocation(location, ResourceType.BasicSwordsman) * 25) +
                (this.getResourcesInLocation(location, ResourceType.WatchTower) * 100) + 100;
    }

    public complateEvent(event: EventData) {
        var location = this.getLocation(event.EventLocation);
        if (event.EventType == EventType.PrimaryRaid) {
            let details = <PrimaryRaidEvent> event.EventDetails;
            if (details.ResourcesRequired > this.getForceAmountInLocation(location)) {
                this.lose();
            } else {
                this.createPrimaryRaidEvent(event.EventLocation, details.RaidLevel + 1, event.EventStartTime + event.EventDuration);
            }
        } else if (event.EventType == EventType.PersistantResourceProductionEvent || event.EventType == EventType.OneTimeResourceProductionEvent) {
            let details = <ResourceProductionEvent> event.EventDetails;

            details.Inputs.forEach(((pair: ResourcePair) => this.removeResourceInLocation(location, pair.Type, pair.Count)).bind(this));
            details.Outputs.forEach(((pair: ResourcePair) => this.addResourceInLocation(location, pair.Type, pair.Count)).bind(this));
            
            if (event.EventType == EventType.PersistantResourceProductionEvent) {
                this.createResourceProductionEvent(event.EventLocation, details.Inputs, details.Outputs,
                    true, event.EventStartTime + event.EventDuration, event.EventDuration);
            }
        }
    }

    public getEventDetails(event: EventData): string {
        // TODO: Make this return a Element with nice styling
        if (event.EventType == EventType.PrimaryRaid) {
            let details = <PrimaryRaidEvent> event.EventDetails;
            return "Level = " + details.RaidLevel.toString(10) + " | Required Force Amount = " + details.ResourcesRequired.toString(10);
        } else if (event.EventType == EventType.OneTimeResourceProductionEvent || event.EventType == EventType.PersistantResourceProductionEvent) {
            let details = <ResourceProductionEvent> event.EventDetails;
            var ret = "";
            ret += "Turns {";
            details.Inputs.forEach((pair: ResourcePair) => {
                ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
            });
            ret += "} Into {";
            details.Outputs.forEach((pair: ResourcePair) => {
                ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
            });
            ret += "}"
            return ret;
        }
    }

    public getEventTable(): {}[] {
        return this.Data.EventList.map(((event: EventData) => {
            return {
                "Event Type": EventType[event.EventType],
                "Time Remaining": printTime((event.EventStartTime + event.EventDuration) - time()),
                "Details": this.getEventDetails(event)
            };
        }).bind(this));
    }

    public getCurrentLocation(): string {
        return "Testing Location";
    }

    public getCurrentLocationResourceTable(): {}[] {
        var location = this.getLocation(this.getCurrentLocation());
        return Object.keys(location.ResourceAmounts).map((rKey: string) => {
            return {
                "Resource Type": ResourceType[rKey],
                "Resource Amount": location.ResourceAmounts[rKey].toString(10)
            };
        });
    }

    public getCurrentLocationBuildingTable(): {}[] {
        var location = this.getLocation(this.getCurrentLocation());
        return location.Buildings.map((building: BuildingData) => {
            return {
                "Building Type": BuildingType[building.Type],
                "Building Level": building.Level.toString(10),
            };
        });
    }

    public update() {
        if (this.Data.HasLost) {
            return;
        }
        this.Data.EventList = this.Data.EventList.filter(((event: EventData) => {
            if (!this.hasEventPassed(event)) {
                return true;
            } else {
                console.log("Completing: " + event);
                this.complateEvent(event);
                return false;
            }
        }).bind(this));
        this.PendingEventList.forEach((event: EventData) => this.Data.EventList.push(event));
        this.PendingEventList = [];
    }
}

function e(type: string, attrs: {[k: string]: string}, value: string | Element[]): Element {
    var newElement = document.createElement(type);
    
    for (var k in attrs) {
        newElement.setAttribute(k, attrs[k]);
    }

    if (value instanceof Array) {
        value.forEach((ele) => newElement.appendChild(ele));
    } else {
        newElement.textContent = value;
    }
    
    return newElement;
}

function renderTable(tableElement: Element, data: {}[]) {
    // Clear Content
    tableElement.innerHTML = "";

    if (data.length == 0) {
        return;
    }

    tableElement.appendChild(e("thead", {}, [
        e("tr", {}, Object.keys(data[0]).map((heading: string) => e("th", {}, heading)))
    ]));

    tableElement.appendChild(e("tbody", {}, data.map((dataRow: {}) => {
        var arr: Element[] = [];
        for (var k in dataRow) {
            arr.push(e("td", {}, dataRow[k]));
        }
        return e("tr", {}, arr);
    })));
}

function main() {
    var save: SaveFile = new SaveFile();
    window["save"] = save;

    if (save.isNewGame()) {
        save.createNewGame();
        save.save();
    } else {
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