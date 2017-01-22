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

    RawStone,
    Stone,

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
    Id: number,
    Type: BuildingType,
    NewLevel: number
};

type EventData = {
    Type: EventType;
    Location: string;
    Details: (ResourceProductionEvent | PrimaryRaidEvent | BuildingEvent);
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
    StoneQuarry,
    
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
    Id: number;
    Type: BuildingType;
    Level: number;
    IsUpgrading: boolean;
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
    BuildTime: number;
    UpgradeResources: ResourcePair[];
    UpgradeTime: number;
};

var buildingCreationFunctions: {[key: number]: (level: number) => BuildingCreateInfo} = {};

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
        },{
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
                resourcePair(ResourceType.Arrow, 25 * level)],
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

    public addBuildingInLocation(location: LocationData, buildingType: BuildingType, buildingLevel: number, useResources: boolean, currentTime: number) {
        location.Buildings.push({
            Id: Math.random(),
            Type: buildingType,
            Level: buildingLevel,
            IsUpgrading: false
        });
        var buildingCreateInfo: BuildingCreateInfo = this.getBuildingData(buildingType, buildingLevel);
        if (useResources) {
            buildingCreateInfo.Inputs.forEach(((pair: ResourcePair) => this.removeResourceInLocation(location, pair.Type, pair.Count)).bind(this));
        }
        buildingCreateInfo.Outputs.forEach(((pair: ResourcePair) => this.addResourceInLocation(location, pair.Type, pair.Count)).bind(this));
        buildingCreateInfo.ProductionEvents.forEach(((prodEvent: BuildCreateProductionEvent) => {
            this.createResourceProductionEvent(location.Name, prodEvent.Inputs, prodEvent.Outputs, prodEvent.Repeat, currentTime, prodEvent.Duration);
        }).bind(this));
    }

    public getBuildingInLocation(location: LocationData, buildingId: number) {
        return location.Buildings.filter((building: BuildingData) => {
            return building.Id == buildingId;
        })[0];
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

        this.addResourceInLocation(location, ResourceType.Forest,   5000);
        this.addResourceInLocation(location, ResourceType.LandArea, 1000);
        this.addResourceInLocation(location, ResourceType.Wood,     500);
        this.addResourceInLocation(location, ResourceType.RawIron,  1500);

        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        this.addBuildingInLocation(location, BuildingType.House, 1, true, currentTime); // 50 wood
        
        // 50 wood should be spare

        return locationName;
    }

    public generateBasicData() {
        var currentTime = time();
        
        var baseLocationId = this.createRandomVillageLocation(currentTime);
        
        var baseLocation = this.getLocation(baseLocationId);
        
        this.addResourceInLocation(baseLocation, ResourceType.Wood, 500);

        this.addBuildingInLocation(baseLocation, BuildingType.IronMine,         1, true, currentTime);  // 100 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Sawmill,          1, true, currentTime);  // 50 wood
        this.addBuildingInLocation(baseLocation, BuildingType.IronSwordsmith,   1, true, currentTime);  // 150 wood
        this.addBuildingInLocation(baseLocation, BuildingType.Barracks,         1, true, currentTime);  // 200 wood
        
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

    public createBuildingCompleteEvent(locationName: string, buildingType: BuildingType, startTime: number) {
        this.PendingEventList.push({
            Location: locationName,
            Type: EventType.BuildingCompleteEvent,
            Details: <BuildingEvent> {
                Id: null,
                Type: buildingType,
                NewLevel: 1
            },
            StartTime: startTime,
            Duration: this.getBuildingData(buildingType, 1).BuildTime
        });
    }

    public createBuildingUpgradeEvent(locationName: string, buildingId: number, startTime: number) {
        var buildingInfo = this.getBuildingInLocation(this.getLocation(locationName), buildingId);
        var buildingType = buildingInfo.Type;
        this.PendingEventList.push({
            Location: locationName,
            Type: EventType.BuildingCompleteEvent,
            Details: <BuildingEvent> {
                Id: buildingId,
                Type: buildingType,
                NewLevel: buildingInfo.Level + 1
            },
            StartTime: startTime,
            Duration: this.getBuildingData(buildingType, buildingInfo.Level + 1).UpgradeTime
        });
    }

    public doBuildingUpgrade(location: LocationData, buildingId: number, newLevel: number, currentTime: number) {
        var buildingCreateInfo: BuildingCreateInfo = this.getBuildingData(this.getBuildingInLocation(location, buildingId).Type, newLevel);

        buildingCreateInfo.Outputs.forEach(((pair: ResourcePair) => this.addResourceInLocation(location, pair.Type, pair.Count)).bind(this));
        buildingCreateInfo.ProductionEvents.forEach(((prodEvent: BuildCreateProductionEvent) => {
            this.createResourceProductionEvent(location.Name, prodEvent.Inputs, prodEvent.Outputs, prodEvent.Repeat, currentTime, prodEvent.Duration);
        }).bind(this));
        
        this.getBuildingInLocation(location, buildingId).Level = newLevel;
        this.getBuildingInLocation(location, buildingId).IsUpgrading = false;
    }

    public startBuildingUpgrade(location: LocationData, buildingId: number): boolean {
        var buildingInfo: BuildingData = this.getBuildingInLocation(location, buildingId);
        var buildingCreateInfo: BuildingCreateInfo = this.getBuildingData(buildingInfo.Type, buildingInfo.Level + 1);
        var missingResources = buildingCreateInfo.UpgradeResources.filter(((pair: ResourcePair) => {
            return this.getResourcesInLocation(location, pair.Type) >= pair.Count;
        }).bind(this));

        if (missingResources.length == 0) {
            
            return true;
        } else {
            
            return false;
        }
    }

    public startNewBuilding(location: LocationData, buildingType: BuildingType): boolean {

        return false;
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
        return (this.getResourcesInLocation(location, ResourceType.IronSwordsman) * 20) +
                (this.getResourcesInLocation(location, ResourceType.Knight) * 50) +
                (this.getResourcesInLocation(location, ResourceType.Archer) * 30) +
                (this.getResourcesInLocation(location, ResourceType.WatchTower) * 200) +
                (this.getResourcesInLocation(location, ResourceType.Castle) * 500) + 100;
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
        } else if (event.Type == EventType.BuildingCompleteEvent) {
            let details = <BuildingEvent> event.Details;

            this.addBuildingInLocation(location, details.Type, details.NewLevel, false, event.StartTime + event.Duration);
        } else if (event.Type == EventType.BuildingUpgradeCompleteEvent) {
            let details = <BuildingEvent> event.Details;

            this.doBuildingUpgrade(location, details.Id, details.NewLevel, event.StartTime + event.Duration);
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
        } else if (event.Type == EventType.BuildingCompleteEvent || event.Type == EventType.BuildingUpgradeCompleteEvent) {
            let details = <PrimaryRaidEvent> event.Details;
        }
    }

    public getBuildingData(type: BuildingType, level: number): BuildingCreateInfo {
        return buildingCreationFunctions[type](level);
    }

    public getBuildingUpgradeRequirements(type: BuildingType, newLevel: number): string {
        var ret = "";
        this.getBuildingData(type, newLevel).UpgradeResources.forEach((pair: ResourcePair) => {
            ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
        });
        return ret;
    }

    public getBuildingCreateRequirements(type: BuildingType, level: number): string {
        var ret = "";
        this.getBuildingData(type, level).Inputs.forEach((pair: ResourcePair) => {
            ret += ResourceType[pair.Type] + " X " + pair.Count.toString(10) + ", ";
        });
        return ret;
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
        return location.Buildings.map(((building: BuildingData) => {
            var upgradeButton: HTMLAnchorElement = document.createElement("a");
            upgradeButton.className = "btn btn-primary";
            upgradeButton.addEventListener("click", () => {

                event.preventDefault();
            });
            upgradeButton.textContent = "Upgrade";
            return {
                "Building Type": BuildingType[building.Type],
                "Building Level": building.Level.toString(10),
                "Upgrade Requirements": this.getBuildingUpgradeRequirements(building.Type, building.Level + 1),
                "Upgrade": building.IsUpgrading ? "Already Upgrading" : [upgradeButton]
            };
        }).bind(this));
    }

    public getCurrentLocationBuildingCreateTable(): {}[] {
        var location: LocationData = this.getLocation(this.getCurrentLocation());
        return [BuildingType.Sawmill, BuildingType.IronMine, BuildingType.StoneQuarry,
                BuildingType.Foundry, BuildingType.IronSwordsmith, BuildingType.SteelSwordsmith,
                BuildingType.BowMaker, BuildingType.Barracks, BuildingType.ArcheryRange,
                BuildingType.Castle, BuildingType.WatchTower,BuildingType.House
            ].map(((buildingType: BuildingType) => {
                var type: BuildingType = buildingType;
                var createButton: HTMLAnchorElement = document.createElement("a");
                createButton.className = "btn btn-primary";
                createButton.addEventListener("click", (() => {
                    this.startNewBuilding(location, type);
                    event.preventDefault();
                }).bind(this));
                createButton.textContent = "Create";
                return {
                    "Building Type": BuildingType[buildingType],
                    "Create Requirements": this.getBuildingCreateRequirements(buildingType, 1),
                    "Create": [createButton]
                };
            }).bind(this));
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
        renderTable(document.querySelector("#currentLocationBuildingCreateList"), save.getCurrentLocationBuildingCreateTable());

    }, 1000);
}

document.addEventListener("DOMContentLoaded", main);