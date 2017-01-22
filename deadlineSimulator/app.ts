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

    BuildingCompleteEvent,

    BuildingUpgradeCompleteEvent,
};

type PrimaryRaidEvent = {
    RaidLevel: number;
    ResourcesRequired: number;
};

enum ResourceType {
    Population,
    
    LandArea,
    
    Forest,
    RawWood,
    Wood,

    IronSword,
    RawIron,
    Iron,

    SteelSword,
    Steel,

    Longbow,
    Arrow,

    IronSwordsman,
    Knight,
    Archer,
    
    WatchTower,
    Castle,
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

type BuildingEvent = {
    Type: BuildingType,
    NewLevel: number
};

type EventData = {
    Type: EventType;
    Location: string;
    Details: (ResourceProductionEvent | PrimaryRaidEvent);
    StartTime: number;
    Duration: number;
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
    
    Foundry,

    IronSwordsmith,
    SteelSwordsmith,
    BowMaker,

    Barracks,
    ArcheryRange,
    Castle,

    WatchTower,
    House
};

type BuildingData = {
    Type: BuildingType;
    Level: number;
};

type BuildCreateProductionEvent = {
    Inputs: ResourcePair[];
    Outputs: ResourcePair[];
    Duration: number,
    Repeat: boolean
};

type BuildingCreateInfo = {
    Inputs: ResourcePair[];
    Outputs: ResourcePair[];
    ProductionEvents: BuildCreateProductionEvent[];
};

var buildingCreationFunctions: {[key: number]: (level: number) => BuildingCreateInfo} = {};

buildingCreationFunctions[BuildingType.Sawmill] = (level) => {
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

buildingCreationFunctions[BuildingType.IronMine] = (level) => {
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

buildingCreationFunctions[BuildingType.Foundry] = (level) => {
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

buildingCreationFunctions[BuildingType.IronSwordsmith] = (level) => {
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

buildingCreationFunctions[BuildingType.SteelSwordsmith] = (level) => {
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

buildingCreationFunctions[BuildingType.BowMaker] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 150), resourcePair(ResourceType.Iron, 25), resourcePair(ResourceType.LandArea, 50)],
        Outputs: [],
        ProductionEvents: [{
            Inputs: [resourcePair(ResourceType.Steel, 5), resourcePair(ResourceType.Wood, 5)],
            Outputs: [resourcePair(ResourceType.Longbow, 5)],
            Duration: 120000,
            Repeat: true
        },{
            Inputs: [resourcePair(ResourceType.Wood, 5)],
            Outputs: [resourcePair(ResourceType.Arrow, 10)],
            Duration: 20000,
            Repeat: true
        }]
    };
};

buildingCreationFunctions[BuildingType.Barracks] = (level) => {
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

buildingCreationFunctions[BuildingType.WatchTower] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 100), resourcePair(ResourceType.Iron, 25),
            resourcePair(ResourceType.LandArea, 20), resourcePair(ResourceType.Population, 10)],
        Outputs: [resourcePair(ResourceType.WatchTower, 1)],
        ProductionEvents: []
    };
};

buildingCreationFunctions[BuildingType.House] = (level) => {
    return {
        Inputs: [resourcePair(ResourceType.Wood, 50), resourcePair(ResourceType.LandArea, 20)],
        Outputs: [resourcePair(ResourceType.Population, 25)],
        ProductionEvents: []
    };
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
            Level: buildingLevel
        });
        var buildingCreateInfo: BuildingCreateInfo = buildingCreationFunctions[buildingType](buildingLevel);
        buildingCreateInfo.Inputs.forEach(((pair: ResourcePair) => this.removeResourceInLocation(location, pair.Type, pair.Count)).bind(this));
        buildingCreateInfo.Outputs.forEach(((pair: ResourcePair) => this.addResourceInLocation(location, pair.Type, pair.Count)).bind(this));
        buildingCreateInfo.ProductionEvents.forEach(((prodEvent: BuildCreateProductionEvent) => {
            this.createResourceProductionEvent(location.Name, prodEvent.Inputs, prodEvent.Outputs, prodEvent.Repeat, currentTime, prodEvent.Duration);
        }).bind(this));
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
    }

    public createRandomHeroInLocation(locationName: string) {

    }

    public generateBasicData() {
        var currentTime = time();
        var baseLocationId = this.createRandomVillageLocation(currentTime);
        var baseLocation = this.getLocation(baseLocationId);
        this.addResourceInLocation(baseLocation, ResourceType.Wood, 500);
        this.addBuildingInLocation(baseLocation, BuildingType.IronMine, 1, currentTime);        // 100 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Sawmill, 1, currentTime);         // 50 wood
        this.addBuildingInLocation(baseLocation, BuildingType.IronSwordsmith, 1, currentTime);  // 150 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Barracks, 1, currentTime);        // 200 wood
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
            Location: locationName,
            Type: EventType.PrimaryRaid,
            Details: <PrimaryRaidEvent> {
                RaidLevel: raidLevel,
                ResourcesRequired: getResourcesForRaidLevel(raidLevel)
            },
            StartTime: startTime,
            Duration: getDurationForRaidLevel(raidLevel)
        })
    }

    public createResourceProductionEvent(locationName: string, inputs: ResourcePair[], outputs: ResourcePair[], repeats: boolean, startTime: number, duration: number) {
        this.PendingEventList.push({
            Location: locationName,
            Type: repeats ? EventType.PersistantResourceProductionEvent : EventType.OneTimeResourceProductionEvent,
            Details: <ResourceProductionEvent> {
                Inputs: inputs,
                Outputs: outputs
            },
            StartTime: startTime,
            Duration: duration
        });
    }

    public hasEventPassed(event: EventData): boolean {
        return (event.StartTime + event.Duration) < time();
    }

    public lose() {
        this.Data.HasLost = true;
        this.save();
        alert("You have been overrun.");
    }

    public getForceAmountInLocation(location: LocationData): number {
        return (this.getResourcesInLocation(location, ResourceType.IronSwordsman) * 25) +
                (this.getResourcesInLocation(location, ResourceType.Knight) * 50) +
                (this.getResourcesInLocation(location, ResourceType.Archer) * 40) +
                (this.getResourcesInLocation(location, ResourceType.WatchTower) * 200) + 100;
    }

    public complateEvent(event: EventData) {
        var location = this.getLocation(event.Location);
        if (event.Type == EventType.PrimaryRaid) {
            let details = <PrimaryRaidEvent> event.Details;
            if (details.ResourcesRequired > this.getForceAmountInLocation(location)) {
                this.lose();
            } else {
                this.createPrimaryRaidEvent(event.Location, details.RaidLevel + 1, event.StartTime + event.Duration);
            }
        } else if (event.Type == EventType.PersistantResourceProductionEvent || event.Type == EventType.OneTimeResourceProductionEvent) {
            let details = <ResourceProductionEvent> event.Details;

            details.Inputs.forEach(((pair: ResourcePair) => this.removeResourceInLocation(location, pair.Type, pair.Count)).bind(this));
            details.Outputs.forEach(((pair: ResourcePair) => this.addResourceInLocation(location, pair.Type, pair.Count)).bind(this));
            
            if (event.Type == EventType.PersistantResourceProductionEvent) {
                this.createResourceProductionEvent(event.Location, details.Inputs, details.Outputs,
                    true, event.StartTime + event.Duration, event.Duration);
            }
        }
    }

    public getEventDetails(event: EventData): string {
        // TODO: Make this return a Element with nice styling
        if (event.Type == EventType.PrimaryRaid) {
            let details = <PrimaryRaidEvent> event.Details;
            return "Level = " + details.RaidLevel.toString(10) + " | Required Force Amount = " + details.ResourcesRequired.toString(10);
        } else if (event.Type == EventType.OneTimeResourceProductionEvent || event.Type == EventType.PersistantResourceProductionEvent) {
            let details = <ResourceProductionEvent> event.Details;
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
                "Event Type": EventType[event.Type],
                "Time Remaining": printTime((event.StartTime + event.Duration) - time()),
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