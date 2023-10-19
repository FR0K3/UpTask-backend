const debug = require('debug')('uptask:app')
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./database/db.js');
const baseRoute = require('./routes/baseRoute.js');
dotenv.config();

// Instancia de api
const app = express();

// Enable JSON data
app.use(express.json())

// Database connection
db.connectDB();

// Enable CORS
const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.includes(origin))
            callback(null, true);
        else
            callback(new Error('Not allowed by CORS'));
    }
}
app.use(cors(corsOptions));


// Routes
app.use('/api', baseRoute);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    debug(`Listening on port ${PORT}`);
});

// SOCKET
const { Server } = require("socket.io");
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});

io.on("connection", (socket) => {
    debug("Connected to socket io");

    socket.on('open project', (project) => {
        socket.join(project);

    });

    socket.on('new task', task => {
        socket.to(task.project).emit('task added', task);
    });

    socket.on('delete task', task => {
        socket.to(task.project).emit('task deleted', task);
    });

    socket.on('update task', task => {
        socket.to(task.project._id).emit('task updated', task);
    });

    socket.on('complete task', task => {
        socket.to(task.project._id).emit('task completed', task);
    });
});