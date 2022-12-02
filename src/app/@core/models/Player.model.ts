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
    started:Boolean;
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

export interface BattingSession {
    batterName:string;
    runs:number;
    balls:number;
    fours:number;
    sixes:number;
    out:boolean;
    catchOrStumpedBy:string;
}

export interface BowlingSession {
    bowlerName:string;
    overs:number;
    dots:number;
    runs:number;
    wickets:number;
}

export interface InningsSession{
    match:string,
    bowlingSession:BowlingSession[];
    battingSession:BattingSession[]
}




export interface MatchDetails {
    team1: Team;
    team2: Team;
    matchNo: string;
}


