import io from "socket.io-client";
export var clientInitializer = function (serverUrl) {
    return io(serverUrl, {
        query: {
            auth: true
        },
        transports: ['websocket'],
        withCredentials: true
    });
};
export default {
    clientInitializer: clientInitializer
};
