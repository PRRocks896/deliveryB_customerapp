// import io from 'socket.io-client';
const io = require('socket.io-client');
const socket = io.connect('https://api.tribata.in/');
// const socket = io.connect('http://192.168.0.104:3200/');

const connect = () => {
    
    return socket.connect()    
};
const disconnect = () => {
    socket.disconnect();
};

export {
    connect,
    disconnect
}