const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function main(){
// open the database file
const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  // create our 'messages' table (you can ignore the 'client_offset' column for now)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT
    );
  `);

const io = new Server(server, {
    connectionStateRecovery: {}
  });
// socket stores no of users connected.
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});



io.on('connection', async (socket) => {
    console.log('USER connected-> '+ socket.client.id);
    socket.on('disconnect', () => {
        console.log('USER disconnected -> '+ socket.client.id);
    });
    socket.on('chat message',async (msg)=>{
        console.log('USER message-> '+socket.client.id+ 'sends mesage-> ' + msg);
        let result;
      try {
        // store the message in the database
        result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
      } catch (e) {
        // TODO handle the failure
        return;
      }
      // include the offset with the message
      io.emit('chat message', msg, result.lastID);
    });
    if (!socket.recovered) {
        console.log('USER message-> '+socket.client.id+ ' socket not recovered');
        // if the connection state recovery was not successful
        try {
          await db.each('SELECT id, content FROM messages WHERE id > ?',
            [socket.handshake.auth.serverOffset || 0],
            (_err, row) => {
              socket.emit('chat message', row.content, row.id);
            }
          )
        } catch (e) {
          // something went wrong
        }
      }
  });

  // this will emit the event to all connected sockets
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
}

main()
