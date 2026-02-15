const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir la carpeta 'public' para los archivos HTML y JS del cliente
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Un dispositivo se ha conectado: ' + socket.id);

    // NUEVO: Cuando un camarógrafo se conecta y dice quién es (ej: "cam1")
    socket.on('registrar_camara', (nombreCamara) => {
        socket.join(nombreCamara); // Une a este celular a una "sala" específica
        console.log(`Cámara ${nombreCamara} registrada`);
    });

    // Cuando el productor envía una orden
    socket.on('orden_productor', (data) => {
        // data.camaraDestino puede ser "todos", "cam1", "cam2", etc.
        if (data.camaraDestino === 'todos') {
            io.emit('orden_camarografo', data); // Enviar a todos
        } else {
            // Enviar solo a la cámara específica
            io.to(data.camaraDestino).emit('orden_camarografo', data); 
        }
        console.log(`Orden enviada a ${data.camaraDestino}: ${data.accion}`);
    });

    socket.on('disconnect', () => {
        console.log('Dispositivo desconectado');
    });
});

// --- ESTO ES CRUCIAL PARA QUE FUNCIONE EN RENDER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});