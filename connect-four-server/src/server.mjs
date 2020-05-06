/**
 * Name: Mark Danez Ricalde
 * UCID: 10171889
 * Tutorial section: B02
 */

import express from 'express';
import socketIO from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use('/', (req, res) => {
    res.send("<p>This is the Backend Server Page for Express</p>");
});

server.listen(8000, () => {
    console.log('Server listening on http://localhost:8000/');
});

let room = 0;
let dict = [];

io.on('connection', (socket) => {

    //Handles existing room connection
    socket.on('join existing room', (state) => {
        socket.join(state.roomId)
        console.log(`${state.playerId} joined game in ${state.roomId}`)
        socket.emit('give id', state.playerId);

        if (dict[state.roomId]) {
            let newState = {player1: dict[state.roomId].player1, player2: state.playerId, gameState: -1, playerTurn: dict[state.roomId].player1, roomId: state.roomId}
            if (newState.player1 === newState.player2) {
                socket.emit('give id', state.playerId + " (2)")
                newState.player2 = state.playerId + " (2)"
            }
            io.in(state.roomId).emit('start game', newState);
            console.log('Game started in ' + room + ' between ' + newState.player1 + ' and ' + newState.player2)
        } else{
            dict[state.roomId] = {player1: state.playerId};
        }
    })

    //Handles random room connection
    socket.on('join random room', (state) => {
        socket.join(`room${room}`);
        console.log(`${state.playerId} joined game in room${room}`)

        socket.emit('give id', state.playerId);

        if (dict[`room${room}`]) {
            let newState = {player1: dict[`room${room}`].player1, player2: state.playerId, gameState: -1, roomId: `room${room}`, playerTurn: dict[`room${room}`].player1}
            if (newState.player1 === newState.player2) {
                socket.emit('give id', state.playerId + " (2)")
                newState.player2 = state.playerId + " (2)"
            }
            io.in(`room${room}`).emit('start game', newState);
            console.log('Game started in ' + room + ' between ' + newState.player1 + ' and ' + newState.player2)
            room++;
        }
        else {
            dict[`room${room}`] = {player1: state.playerId};
        }
    })

    // Handles board moves by their column
    socket.on('board move', (move) => {
        socket.to(move.roomId).emit('board move', move.moveColumn);
    })
});
