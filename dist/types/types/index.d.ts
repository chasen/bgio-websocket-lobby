export type Player = {
    id: string;
    name: string;
    metadata: Record<string, any>;
    ready: boolean;
    seat: string;
    credentials: string;
};
export type Lobby = {
    id: string;
    status: "IN_LOBBY" | "IN_GAME";
    name: string;
    host: string;
    private: boolean;
    players: Player[];
    maxPlayers: number;
    gameOptions: Record<string, any>;
    matchId?: string;
};
export type lobbySocketInitializerProps = {
    lobbyClientConfig: {
        server: string;
    };
    roomNamespace: string;
    gameName: string;
};
export type lobbiesCreateProps = {
    lobbyData: Record<string, any>;
    playerData: Player;
};
export type lobbiesJoinProps = {
    lobbyId: string;
    playerData: Player;
};
export type lobbiesKickUserProps = {
    lobbyId: string;
    playerData: Player;
    kickPlayerId: string;
};
export type lobbiesToggleReadyProps = {
    lobbyId: string;
    playerData: Player;
};
export type lobbiesStartGameProps = {
    lobbyId: string;
    playerData: Player;
};
export type gameGetSetupInfoProps = {
    lobbyId: string;
    playerData: Player;
};
export type lobbiesPlayerLeftProps = {
    lobbyId: string;
    playerData: Player;
};
