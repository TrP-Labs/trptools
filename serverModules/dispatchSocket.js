const socketIO = (server) => {
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Your Socket.IO logic here
        // For example:
        // socket.on('chat message', (msg) => {
        //     io.emit('chat message', msg);
        // });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

module.exports = socketIO;