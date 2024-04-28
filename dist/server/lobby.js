var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as constants from '../constants';
import { LobbyClient } from 'boardgame.io/client';
import Lodash from 'lodash';
import { nanoid } from "nanoid/non-secure";
import { LOBBY_STATUS_IN_LOBBY } from "../constants";
import * as constants_1 from '../constants';
export { constants_1 as constants };
export var lobbySocketInitializer = function (_a) {
    var lobbyClientConfig = _a.lobbyClientConfig, roomNamespace = _a.roomNamespace, gameName = _a.gameName;
    var lobbyClient = new LobbyClient(lobbyClientConfig);
    var lobbies = [];
    var socketRoomNamespace = function (value, prefix) {
        if (prefix === void 0) { prefix = null; }
        console.log('socketRoomNamespace:', roomNamespace + '-' + (prefix ? prefix + '-' : '') + value);
        return roomNamespace + '-' + (prefix ? prefix + '-' : '') + value;
    };
    return function (socket) { return __awaiter(void 0, void 0, void 0, function () {
        var triggerLobbyUpdate, updateLobbyInLobbies, lobbiesGetAll, lobbiesCreate, lobbiesJoin, lobbiesKickUser, lobbiesToggleReady, lobbiesStartGame, gameGetSetupInfo, lobbiesPlayerLeft;
        return __generator(this, function (_a) {
            triggerLobbyUpdate = function (lobbyId) {
                console.log('triggerLobbyUpdate', lobbyId);
                var lobby = Lodash.find(lobbies, { id: lobbyId });
                socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_UPDATED, lobby);
                socket.emit(constants.ON_LOBBY_UPDATED, lobby);
                socket.emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
            };
            updateLobbyInLobbies = function (lobby) {
                console.log('updateLobbyInLobbies', lobby);
                var lobbyIdx = lobbies.findIndex(function (cur) {
                    return cur.id === lobby.id;
                });
                lobbies[lobbyIdx] = lobby;
                triggerLobbyUpdate(lobby.id);
            };
            lobbiesGetAll = function () {
                socket.join(socketRoomNamespace(gameName));
                socket.emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
            };
            lobbiesCreate = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var lobby;
                var lobbyData = _b.lobbyData, playerData = _b.playerData;
                return __generator(this, function (_c) {
                    try {
                        lobby = {
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
                        };
                        lobbies.push(lobby);
                        socket.join(socketRoomNamespace(lobby.id, 'lobby'));
                        socket.to(socketRoomNamespace(gameName)).emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
                        socket.emit(constants.ON_LOBBY_CREATED, lobby);
                    }
                    catch (e) {
                        socket.emit(constants.LOBBY_ERROR, { error_message: 'An unexpected error occurred while trying to create the lobby' });
                        console.log(e);
                    }
                    return [2 /*return*/];
                });
            }); };
            lobbiesJoin = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var lobby, player;
                var lobbyId = _b.lobbyId, playerData = _b.playerData;
                return __generator(this, function (_c) {
                    lobby = Lodash.find(lobbies, { id: lobbyId });
                    if (!lobby) {
                        socket.emit(constants.LOBBY_ERROR, { "error_message": constants.LOBBY_ERROR_DOESNT_EXIST });
                        return [2 /*return*/];
                    }
                    if (!lobby.players) {
                        socket.emit(constants.LOBBY_ERROR, { "error_message": constants.LOBBY_ERROR_NO_USERS });
                        return [2 /*return*/];
                    }
                    // Is the lobby full?
                    if (lobby.maxPlayers !== null && lobby.players.length >= lobby.maxPlayers) {
                        socket.emit(constants.LOBBY_ERROR, { "error_message": constants.LOBBY_ERROR_FULL });
                        return [2 /*return*/];
                    }
                    player = Lodash.find(lobby.players, { id: playerData.id });
                    if (!player) {
                        // console.log("- pushed in")
                        lobby.players.push(__assign(__assign({}, playerData), { ready: false }));
                    }
                    // console.log("- joining completed")
                    socket.join(socketRoomNamespace(lobbyId, 'lobby'));
                    socket.emit(constants.ON_LOBBY_JOINED, lobby);
                    updateLobbyInLobbies(lobby);
                    return [2 /*return*/];
                });
            }); };
            lobbiesKickUser = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var lobby;
                var lobbyId = _b.lobbyId, playerData = _b.playerData, kickPlayerId = _b.kickPlayerId;
                return __generator(this, function (_c) {
                    lobby = Lodash.find(lobbies, { id: lobbyId });
                    if (playerData.id !== lobby.host) {
                        socket.emit(constants.LOBBY_ERROR, { "error_message": constants.LOBBY_ERROR_ONLY_HOST_CAN_DO_THIS });
                        return [2 /*return*/];
                    }
                    lobby.players.splice(lobby.players.findIndex(function (player) { return player.id === kickPlayerId; }), 1);
                    updateLobbyInLobbies(lobby);
                    socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_USER_KICKED, kickPlayerId);
                    return [2 /*return*/];
                });
            }); };
            lobbiesToggleReady = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var lobby, players, curPlayerIdx;
                var lobbyId = _b.lobbyId, playerData = _b.playerData;
                return __generator(this, function (_c) {
                    lobby = Lodash.find(lobbies, { id: lobbyId });
                    players = lobby.players;
                    curPlayerIdx = players.findIndex(function (player) { return player.id === playerData.id; });
                    players[curPlayerIdx].ready = !players[curPlayerIdx].ready;
                    lobby.players = players;
                    updateLobbyInLobbies(lobby);
                    return [2 /*return*/];
                });
            }); };
            lobbiesStartGame = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var lobby, allReady, matchID, lobbyPlayers, i, _c, playerID, playerCredentials;
                var lobbyId = _b.lobbyId, playerData = _b.playerData;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            lobby = Lodash.find(lobbies, { id: lobbyId });
                            if (!lobby) {
                                socket.emit(constants.LOBBY_ERROR, { "error_message": constants.LOBBY_ERROR_DOESNT_EXIST });
                                return [2 /*return*/];
                            }
                            if (lobby.host !== playerData.id) {
                                socket.emit(constants.LOBBY_ERROR, { "error_message": constants.LOBBY_ERROR_ONLY_HOST_CAN_DO_THIS });
                            }
                            allReady = true;
                            lobby.players.forEach(function (player) {
                                if (!player.ready) {
                                    allReady = false;
                                }
                            });
                            if (!allReady) {
                                socket.emit(constants.LOBBY_ERROR, { "error_message": constants.LOBBY_ERROR_ALL_PLAYERS_NOT_READY });
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, lobbyClient.createMatch(gameName, {
                                    numPlayers: lobby.players.length,
                                    unlisted: lobby.private,
                                    setupData: lobby.gameOptions,
                                }).catch(function (err) {
                                    console.log();
                                    console.log('Err', err);
                                    throw err;
                                })];
                        case 1:
                            matchID = (_d.sent()).matchID;
                            lobbyPlayers = lobby.players;
                            i = 0;
                            _d.label = 2;
                        case 2:
                            if (!(i < lobby.players.length)) return [3 /*break*/, 5];
                            return [4 /*yield*/, lobbyClient.joinMatch(gameName, matchID, {
                                    playerName: lobbyPlayers[i].name,
                                    data: lobbyPlayers[i].metadata
                                })];
                        case 3:
                            _c = _d.sent(), playerID = _c.playerID, playerCredentials = _c.playerCredentials;
                            lobbyPlayers[i].seat = playerID;
                            lobbyPlayers[i].credentials = playerCredentials;
                            _d.label = 4;
                        case 4:
                            i++;
                            return [3 /*break*/, 2];
                        case 5:
                            lobby.matchId = matchID;
                            lobby.status = constants.LOBBY_STATUS_IN_GAME;
                            lobby.players = lobbyPlayers;
                            // update the memory
                            updateLobbyInLobbies(lobby);
                            // Now that all users have joined it we can just let the lobby know the game has started
                            socket.emit(constants.ON_LOBBY_GAME_STARTED, lobby.id);
                            socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_GAME_STARTED, lobby.id);
                            return [2 /*return*/];
                    }
                });
            }); };
            gameGetSetupInfo = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var lobby, _c, matchID, players, setupData;
                var lobbyId = _b.lobbyId, playerData = _b.playerData;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            lobby = Lodash.find(lobbies, { id: lobbyId });
                            return [4 /*yield*/, lobbyClient.getMatch(gameName, lobby.matchId)];
                        case 1:
                            _c = _d.sent(), matchID = _c.matchID, players = _c.players, setupData = _c.setupData;
                            socket.emit(constants.ON_LOBBY_GAME_CREDENTIALS, {
                                matchID: matchID,
                                playerCredentials: lobby.players[lobby.players.findIndex(function (player) { return player.id === playerData.id; })].credentials,
                                setupData: setupData,
                                seat: lobby.players.findIndex(function (player) { return player.id === playerData.id; }),
                                numPlayers: lobby.players.length,
                                players: players
                            });
                            return [2 /*return*/];
                    }
                });
            }); };
            lobbiesPlayerLeft = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var lobby;
                var lobbyId = _b.lobbyId, playerData = _b.playerData;
                return __generator(this, function (_c) {
                    lobby = Lodash.find(lobbies, { id: lobbyId });
                    if (!lobby) {
                        return [2 /*return*/];
                    }
                    if (lobby.status === constants.LOBBY_STATUS_IN_LOBBY) {
                        if (lobby.host === playerData.id) {
                            Lodash.remove(lobbies, function (lobby) { return lobby.id === lobbyId; });
                            socket.to(socketRoomNamespace(gameName)).emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
                            socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_HOST_LEFT);
                        }
                        else {
                            lobby.players.splice(lobby.players.findIndex(function (player) { return player.id === playerData.id; }), 1);
                            socket.to(socketRoomNamespace(gameName)).emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
                            socket.to(socketRoomNamespace(lobbyId, 'lobby')).emit(constants.ON_LOBBY_PLAYER_LEFT, playerData.id);
                            // leave the lobby room before updating the rest of the players with the lobby
                            socket.leave(socketRoomNamespace(lobbyId, 'lobby'));
                            updateLobbyInLobbies(lobby);
                            socket.emit(constants.ON_LOBBY_PLAYER_LEFT, playerData.id);
                        }
                    }
                    else {
                        socket.emit(constants.LOBBY_ERROR, { "error_message": "You cant leave a game already in progress" });
                    }
                    return [2 /*return*/];
                });
            }); };
            socket.on('connection', function () {
                socket.emit(constants.ON_LOBBY_RECEIVE_ALL, lobbies);
            });
            socket.on(constants.EMIT_LOBBY_GET_ALL, lobbiesGetAll);
            socket.on(constants.EMIT_LOBBY_CREATE, lobbiesCreate);
            socket.on(constants.EMIT_LOBBY_JOIN, lobbiesJoin);
            socket.on(constants.EMIT_LOBBY_KICK_USER, lobbiesKickUser);
            socket.on(constants.EMIT_LOBBY_TOGGLE_READY, lobbiesToggleReady);
            socket.on(constants.EMIT_LOBBY_START_GAME, lobbiesStartGame);
            socket.on(constants.EMIT_LOBBY_LEAVE, lobbiesPlayerLeft);
            socket.on(constants.EMIT_LOBBY_GET_GAME_CREDENTIALS, gameGetSetupInfo);
            return [2 /*return*/];
        });
    }); };
};
export default {
    constants: constants,
    lobbySocketInitializer: lobbySocketInitializer
};
