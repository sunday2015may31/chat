const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const path = require('path');

// Указываем, что файл должен быть именно там, где лежит server.js
const DB_FILE = path.join(__dirname, 'messages.json');
console.log("Файл будет создан здесь:", DB_FILE);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

io.on('connection', (socket) => {
    // Читаем при подключении
    if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        socket.emit('load history', JSON.parse(data));
    }

    socket.on('chat message', (msg) => {
        let messages = [];
        if (fs.existsSync(DB_FILE)) {
            messages = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
        messages.push(msg);
        
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(messages));
            console.log("Успешно записано в:", DB_FILE);
        } catch (err) {
            console.error("ОШИБКА ЗАПИСИ:", err);
        }
        
        io.emit('chat message', msg);
    });
});

server.listen(4000, () => console.log('Сервер запущен на http://localhost:4000'));