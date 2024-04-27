import io from "socket.io-client";
export const clientInitializer = (serverUrl:string) => {
    return io(serverUrl, {
        query: {
            auth: true
        },
        transports: ['websocket'],
        withCredentials: true
    });
}

export default {
    clientInitializer
};