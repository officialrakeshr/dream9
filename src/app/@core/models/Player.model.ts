export interface Player {
    roleList?: { value: string; name: string; inactive: boolean; }[];
    assignedRole?: string;
    name:string;
    active: string;
    team: string;
}

export interface Tournament {
    id: number;
    matchNo: string;
    team1: string;
    team2: string;
    completed:boolean;
    enable11:boolean;
}

export interface Player {
    id: number;
    name: string;
    team: string;
    active: string;
}

export interface Team {
    players: Player[];
    name: string;
}




export interface MatchDetails {
    team1: Team;
    team2: Team;
    matchNo: string;
}


