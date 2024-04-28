import * as constants from '../constants';
import {LobbyClient} from 'boardgame.io/client';
import Lodash from 'lodash'
import {nanoid} from "nanoid/non-secure";
import {LOBBY_STATUS_IN_LOBBY} from "../constants";
import {
    gameGetSetupInfoProps,
    lobbiesCreateProps,
    lobbiesJoinProps,
    lobbiesKickUserProps,
    lobbiesPlayerLeftProps,
    lobbiesStartGameProps,
    lobbiesToggleReadyProps,
    Lobby,
    lobbySocketInitializerProps,
} from "../types";
import {Socket} from "socket.io";


export * as constants from '../constants'
export const lobbySocketInitializer = ({lobbyClientConfig, roomNamespace, gameName}: lobbySocketInitializerProps) => {
    const lobbyClient = new LobbyClient(lobbyClientConfig);
    const lobbies: Lobby[] = [];

    const socketRoomNamespace = (value: string, prefix: string = null) => {
        console.log('socketRoomNamespace:',roomNamespace + '-' + (prefix ? prefix + '-' : '') + value)
        return roomNamespace + '-' + (prefix ? prefix + '-' : '') + value
    }

    return async (socket: Socket) => {
        // const nanoid = await import('nanoid').catch((e)=>{console.log(e)});
        const triggerLobbyUpdate = (lobbyId: string) => {
            console.log('triggerLobbyUpdate', lobbyId)
            const lobby = Lodash.find(lobbies, {id: lobbyId});
            socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_UPDATED, lobby);
            socket.emit(constants.ON_LOBBY_UPDATED, lobby);
            socket.emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
        }

        const updateLobbyInLobbies = (lobby: Lobby) => {
            console.log('updateLobbyInLobbies',lobby)
            const lobbyIdx = lobbies.findIndex((cur)=>{
                return cur.id === lobby.id
            })
            lobbies[lobbyIdx] = lobby;
            triggerLobbyUpdate(lobby.id);
        }

        const lobbiesGetAll = () => {
            socket.join(socketRoomNamespace(gameName));
            socket.emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies)
        };

        const lobbiesCreate = async ({lobbyData, playerData}: lobbiesCreateProps) => {
            try{
                const lobby = {
                    id: nanoid(6),
                    host: playerData.id,
                    players: [
                        playerData
                    ],
                    maxPlayers: lobbyData.maxPlayers,
                    options: {},
                    status: LOBBY_STATUS_IN_LOBBY,
                    private: false,
                    gameOptions: {},
                    name: playerData.name + "'s lobby",
                } as Lobby
                lobbies.push(lobby)
                socket.join(socketRoomNamespace(lobby.id, 'lobby'));
                socket.to(socketRoomNamespace(gameName)).emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
                socket.emit(constants.ON_LOBBY_CREATED, lobby);
            } catch (e){
                socket.emit(constants.LOBBY_ERROR,{error_message: 'An unexpected error occurred while trying to create the lobby'})
                console.log(e);
            }
        };

        const lobbiesJoin = async ({lobbyId, playerData}: lobbiesJoinProps) => {
            // console.log("lobbiesJoin")
            const lobby = Lodash.find(lobbies, {id: lobbyId});

            if (!lobby) {
                socket.emit(constants.LOBBY_ERROR, {"error_message": constants.LOBBY_ERROR_DOESNT_EXIST})
                return;
            }

            if (!lobby.players) {
                socket.emit(constants.LOBBY_ERROR, {"error_message": constants.LOBBY_ERROR_NO_USERS})
                return;
            }
            // Is the lobby full?
            if (lobby.maxPlayers !== null && lobby.players.length >= lobby.maxPlayers) {
                socket.emit(constants.LOBBY_ERROR, {"error_message": constants.LOBBY_ERROR_FULL})
                return;
            }
            // Am I already part of this lobby?
            const player = Lodash.find(lobby.players, {id: playerData.id})
            if (!player) {
                // console.log("- pushed in")
                lobby.players.push({...playerData, ready: false});
            }

            // console.log("- joining completed")
            socket.join(socketRoomNamespace(lobbyId, 'lobby'));
            socket.emit(constants.ON_LOBBY_JOINED, lobby);
            updateLobbyInLobbies(lobby);
        };

        const lobbiesKickUser = async ({lobbyId, playerData, kickPlayerId}: lobbiesKickUserProps) => {
            const lobby = Lodash.find(lobbies, {id: lobbyId});

            if (playerData.id !== lobby.host) {
                socket.emit(constants.LOBBY_ERROR, {"error_message": constants.LOBBY_ERROR_ONLY_HOST_CAN_DO_THIS});
                return;
            }

            lobby.players.splice(lobby.players.findIndex(player => player.id === kickPlayerId), 1);
            updateLobbyInLobbies(lobby);
            socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_USER_KICKED, kickPlayerId);
        };

        const lobbiesToggleReady = async ({lobbyId, playerData}: lobbiesToggleReadyProps) => {
            const lobby = Lodash.find(lobbies, {id: lobbyId});
            const {players} = lobby;
            const curPlayerIdx = players.findIndex(player => player.id === playerData.id);
            players[curPlayerIdx].ready = !players[curPlayerIdx].ready;
            lobby.players = players;
            updateLobbyInLobbies(lobby);
        };

        const lobbiesStartGame = async ({lobbyId, playerData}: lobbiesStartGameProps) => {
            const lobby = Lodash.find(lobbies, {id: lobbyId});
            if(!lobby){
                socket.emit(constants.LOBBY_ERROR, {"error_message": constants.LOBBY_ERROR_DOESNT_EXIST})
                return;
            }
            if(lobby.host !== playerData.id){
                socket.emit(constants.LOBBY_ERROR, {"error_message": constants.LOBBY_ERROR_ONLY_HOST_CAN_DO_THIS})
            }
            let allReady = true;
            lobby.players.forEach((player)=>{
                if(!player.ready){
                    allReady = false;
                }
            })
            if(!allReady){
                socket.emit(constants.LOBBY_ERROR, {"error_message": constants.LOBBY_ERROR_ALL_PLAYERS_NOT_READY})
                return;
            }

            // Create the game
            const {matchID} = await lobbyClient.createMatch(gameName,{
                numPlayers: lobby.players.length,
                unlisted: lobby.private,
                setupData: lobby.gameOptions,

            }).catch((err) => {
                console.log()
                console.log('Err', err);
                throw err;
            });
            const {players: lobbyPlayers} = lobby;
            // console.log('match created, beginning adding players for: ', lobbyPlayers)
            // Once we have the game we need to join each user to it
            for (let i = 0; i < lobby.players.length; i++) {
                // console.log("Attempting to join player to game: ", lobbyPlayers[i])
                const {playerID, playerCredentials} = await lobbyClient.joinMatch(gameName, matchID, {
                    playerName: lobbyPlayers[i].name,
                    data: lobbyPlayers[i].metadata
                });
                lobbyPlayers[i].seat = playerID;
                lobbyPlayers[i].credentials = playerCredentials;
            }
            lobby.matchId = matchID;
            lobby.status = constants.LOBBY_STATUS_IN_GAME;
            lobby.players = lobbyPlayers;

            // update the memory
            updateLobbyInLobbies(lobby);

            // Now that all users have joined it we can just let the lobby know the game has started
            socket.emit(constants.ON_LOBBY_GAME_STARTED, lobby.id)
            socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_GAME_STARTED, lobby.id)
            // This will prompt all clients to ask the server for their game and player info
        };

        const gameGetSetupInfo = async ({lobbyId, playerData}: gameGetSetupInfoProps) => {
            const lobby = Lodash.find(lobbies, {id: lobbyId});

            const {
                matchID,
                players,
                setupData
            } = await lobbyClient.getMatch(gameName, lobby.matchId);
            socket.emit(constants.ON_LOBBY_GAME_CREDENTIALS, {
                matchID: matchID,
                playerCredentials: lobby.players[lobby.players.findIndex(player => player.id === playerData.id)].credentials,
                setupData: setupData,
                seat: lobby.players.findIndex(player => player.id === playerData.id),
                numPlayers: lobby.players.length,
                players
            })
        };
        const lobbiesPlayerLeft = async ({lobbyId, playerData}: lobbiesPlayerLeftProps) => {
            const lobby = Lodash.find(lobbies, {id: lobbyId});
            if (!lobby) {
                return;
            }
            if (lobby.status === constants.LOBBY_STATUS_IN_LOBBY) {
                if (lobby.host === playerData.id) {
                    Lodash.remove(lobbies, (lobby)=>{return lobby.id === lobbyId})
                    socket.to(socketRoomNamespace(gameName)).emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
                    socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_HOST_LEFT)
                } else {
                    lobby.players.splice(lobby.players.findIndex(player => player.id === playerData.id), 1);
                    socket.to(socketRoomNamespace(gameName)).emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
                    socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_PLAYER_LEFT, playerData.id)
                    // leave the lobby room before updating the rest of the players with the lobby
                    socket.leave(socketRoomNamespace(lobbyId, 'lobby'));
                    updateLobbyInLobbies(lobby);
                    socket.emit(constants.ON_LOBBY_PLAYER_LEFT, playerData.id);
                }
            } else {
                socket.emit(constants.LOBBY_ERROR, {"error_message": "You cant leave a game already in progress"})
            }
        }
        socket.on('connection', ()=>{
            socket.emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies)
        })
        socket.on(constants.EMIT_LOBBY_GET_ALL, lobbiesGetAll);
        socket.on(constants.EMIT_LOBBY_CREATE, lobbiesCreate);
        socket.on(constants.EMIT_LOBBY_JOIN, lobbiesJoin);
        socket.on(constants.EMIT_LOBBY_KICK_USER, lobbiesKickUser);
        socket.on(constants.EMIT_LOBBY_TOGGLE_READY, lobbiesToggleReady);
        socket.on(constants.EMIT_LOBBY_START_GAME, lobbiesStartGame);
        socket.on(constants.EMIT_LOBBY_LEAVE, lobbiesPlayerLeft);
        socket.on(constants.EMIT_LOBBY_GET_GAME_CREDENTIALS, gameGetSetupInfo);
    }
}
export default {
    constants,
    lobbySocketInitializer
}