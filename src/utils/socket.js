// import io from 'socket.io-client';
const io = require('socket.io-client');
const socket = io.connect('https://api.tribata.in/');
// const socket = io.connect('https://delivery-b.digitalvichar.in/');

const connect = () => {
    
    return socket.connect()    
};
const disconnect = () => {
  return socket.disconnect();
};

export {
    connect,
    disconnect
}