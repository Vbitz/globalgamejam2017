/*
    Deadline Simulator

    Every x seconds the player fights off an advancing force. They have to accure resources by preforming actions to fight the force off.
    This is basicly a resource and time management game.
    Game Over state occours if the player does'nt have enough resources to fight off the wave.
    One interesting aspect is resources are consumed in the attack. 
    
    Savegame Storage is stored in
*/

function deleteSaveFile(): boolean {
    localStorage.clear();
    document.location.reload();
    return false;
}

enum EventType {
    GetResource,
    PrimaryRaid
};

type PrimaryRaidEvent = {
    RaidLevel: number;
    ResourcesRequired: number;
};

enum ResourceType {
    Troops
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

type SaveFileData = {
    HasLost: boolean;
    EventList: EventData[];
};

function getResourcesForRaidLevel(isPrimary: boolean, raidLevel: number): number {
    return (isPrimary ? 50 : 25) * raidLevel;
}

function getDurationForRaidLevel(isPrimary: boolean, raidLevel: number): number {
    return ((isPrimary ? 60 : 15) * raidLevel * 1000);
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

    ret = Math.round(valueInSeconds % 60).toString(10) + " Seconds";
    if (valueInSeconds / 60 > 0) {
        ret = Math.round((valueInSeconds / 60) % 60).toString(10) + " Minutes " + ret;
    }
    if (valueInSeconds / 60 / 60 > 0) {
        ret = Math.round(valueInSeconds / 60 / 60).toString(10) + " Hours " + ret;
    }

    if (inverse) {
        ret = "-" + ret;
    }

    return ret;
}

class SaveFile {
    private Data: SaveFileData;

    constructor() {
        this.createNewGame();
    }

    public isNewGame(): boolean {
        return localStorage.getItem("saveData") == null;
    }

    public createNewGame() {
        this.Data = {
            HasLost: false,
            EventList: []
        };
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
        this.Data.EventList.push({
            EventType: EventType.PrimaryRaid,
            EventDetails: <PrimaryRaidEvent> {
                RaidLevel: raidLevel,
                ResourcesRequired: getResourcesForRaidLevel(true, raidLevel)
            },
            EventStartTime: startTime,
            EventDuration: getDurationForRaidLevel(true, raidLevel)
        })
    }

    public getRenderTable(): {}[] {
        return this.Data.EventList.map((eventInfo: EventData) => {
            return {
                "Event Type": EventType[eventInfo.EventType],
                "Time Remaining": printTime((eventInfo.EventStartTime + eventInfo.EventDuration) - time())
            };
        });
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
        save.createPrimaryRaidEvent(1, time());
        save.save();
    } else {
        save.load();
    }

    setInterval(function () {
        var rTable = save.getRenderTable();

        renderTable(document.querySelector("#currentDeadlineList"), rTable);
    }, 1000);
}

document.addEventListener("DOMContentLoaded", main);