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

function deleteSaveFile(): boolean {
    localStorage.clear();
    document.location.reload();
    return false;
}

enum EventType {
    ResourceProduction,
    PrimaryRaid,
};

type PrimaryRaidEvent = {
    RaidLevel: number;
    ResourcesRequired: number;
};

enum ResourceType {
    Population,
    LandArea,
    Wood,
    IronSword,
    Iron,
};

type GetResourceEvent = {
    Type: ResourceType;
    Count: number;
};

type EventData = {
    EventType: EventType;
    EventDetails: (GetResourceEvent | PrimaryRaidEvent);
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

class SaveFile {
    private Data: SaveFileData;
    private PendingEventList: EventData[] = [];

    constructor() {
        this.createNewGame();
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

    private getLocation(locationName: string): LocationData {
        return this.Data.LocationList.filter((locationData: LocationData) => locationData.Name == locationName)[0];
    }

    public addResourceToLocation(locationName: string, type: ResourceType, count: number) {
        var location: LocationData = this.getLocation(locationName);
        if (location.ResourceAmounts[type] !== undefined) {
            location.ResourceAmounts[type] = 0;
        }
        location.ResourceAmounts[type] += count;
    }

    public addBuildingInLocation(locationName: string, buildingType: BuildingType, buildingLevel: number) {

    }

    public createRandomVillageLocation() {
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
        this.addResourceToLocation(locationName, ResourceType.LandArea, 1000);
        this.addResourceToLocation(locationName, ResourceType.Wood, 50);
        this.addBuildingInLocation(locationName, BuildingType.House, 1);
        return locationName;
    }

    public generateBasicData() {
        var baseLocationId = this.createRandomVillageLocation();
        this.addBuildingInLocation(baseLocationId, BuildingType.IronMine, 1);
        this.addBuildingInLocation(baseLocationId, BuildingType.Sawmill, 1);
        this.addBuildingInLocation(baseLocationId, BuildingType.Swordsmith, 1);
        this.addBuildingInLocation(baseLocationId, BuildingType.Barracks, 1);
        this.createRandomHeroInLocation(baseLocationId);
        this.createPrimaryRaidEvent(1, time());
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

    public createPrimaryRaidEvent(raidLevel: number, startTime: number) {
        this.PendingEventList.push({
            EventType: EventType.PrimaryRaid,
            EventDetails: <PrimaryRaidEvent> {
                RaidLevel: raidLevel,
                ResourcesRequired: getResourcesForRaidLevel(raidLevel)
            },
            EventStartTime: startTime,
            EventDuration: getDurationForRaidLevel(raidLevel)
        })
    }

    public hasEventPassed(event: EventData): boolean {
        return (event.EventStartTime + event.EventDuration) < time();
    }

    public complateEvent(event: EventData) {
        if (event.EventType == EventType.PrimaryRaid) {
            let details = <PrimaryRaidEvent> event.EventDetails;
            this.createPrimaryRaidEvent(details.RaidLevel + 1, event.EventStartTime + event.EventDuration);
        }
    }

    public getEventDetails(event: EventData): string {
        // TODO: Make this return a Element with nice styling
        if (event.EventType == EventType.PrimaryRaid) {
            let details = <PrimaryRaidEvent> event.EventDetails;
            return "Level = " + details.RaidLevel.toString(10) + " | Required Resources = " + details.ResourcesRequired.toString(10) + " Supplies";
        } else if (event.EventType == EventType.GetResource) {
            let details = <GetResourceEvent> event.EventDetails;
            return ResourceType[details.Type] + " X " + details.Count.toString(10);
        }
    }

    public getRenderTable(): {}[] {
        return this.Data.EventList.map(((event: EventData) => {
            return {
                "Event Type": EventType[event.EventType],
                "Time Remaining": printTime((event.EventStartTime + event.EventDuration) - time()),
                "Details": this.getEventDetails(event)
            };
        }).bind(this));
    }

    public update() {
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

        var rTable = save.getRenderTable();

        renderTable(document.querySelector("#currentDeadlineList"), rTable);
    }, 1000);
}

document.addEventListener("DOMContentLoaded", main);