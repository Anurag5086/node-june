const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const app = express()

const server = http.createServer(app)

const io = new Server(server)

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id)

    socket.on('join', (username) => {
        socket.username = username

        io.emit('user_joined', `${username} joined the chat`)
    })

    socket.on('send_message', (message) => {
        //await new Chat.create({
        //     username: socket.username,
        //     message
        // })
        io.emit('new_message', {
            username: socket.username,
            message
        })
    })

    socket.on('disconnect', () => {
        if(socket.username){
            io.emit('user_left', `${socket.username} left the chat!`)
        }
    })
})

server.listen(3000, () => {
    console.log("Server is running on port: 3000")
})