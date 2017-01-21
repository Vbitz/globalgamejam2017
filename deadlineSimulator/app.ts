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
    return (isPrimary ? 60 : 15) * raidLevel;
}

function time(): number {
    return +(new Date());
}


class SaveFile {
    private Data: SaveFileData;

    public isNewGame(): boolean {
        return localStorage.getItem("saveData") != null;
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
}

function main() {
    var save: SaveFile = new SaveFile();
    
    

    setInterval(function () {
        
    }, 1000);
}

document.addEventListener("DOMContentLoaded", main);