export interface Player {
    roleList?: { value: string; name: string; inactive: boolean; }[];
    assignedRole?: string;
    name:string;
    active: string;
    team: string;
}

export interface Tournament {
    id?: number;
    matchNo: string;
    team1: string;
    team2: string;
    team1Id:any;
    team2Id:any;
    completed:boolean;
    enable11:boolean;
    started:boolean;
    matchdate: string;
    venue: string;
    matchtime:string;
    abandoned:boolean;
}

export interface Player {
    id: number;
    name: string;
    team: string;
    active: string;
    alias?:string;
    teamId?:string;
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

export interface Team{
    name:string;
}

export interface Substitute {
    lookUp: string;
    matchNo: string;
    username: string;
    total: number;
    free: number;
    used: number;
}

