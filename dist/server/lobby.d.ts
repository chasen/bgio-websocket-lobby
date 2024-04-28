import * as constants from '../constants';
import { lobbySocketInitializerProps } from "../types";
import { Socket } from "socket.io";
export * as constants from '../constants';
export declare const lobbySocketInitializer: ({ lobbyClientConfig, roomNamespace, gameName }: lobbySocketInitializerProps) => (socket: Socket) => Promise<void>;
declare const _default: {
    constants: typeof constants;
    lobbySocketInitializer: ({ lobbyClientConfig, roomNamespace, gameName }: lobbySocketInitializerProps) => (socket: Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>) => Promise<void>;
};
export default _default;
