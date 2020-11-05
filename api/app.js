const express = require('express');
const config = require('config');
const PORT = config.get('port');
const cors = require('cors');
const app = express();
// const app2 = express();
app.use(express.static('public'))
app.use(express.static('files'))
app.use('/static', express.static('public'))
app.use(cors())
// app2.use(express.json());
app.use(express.json());

app.use('/api/user', require('./routes/user.routes'));
app.use('/api/register', require('./routes/sign.routes'));
app.use('/api/image', require('./routes/image.routes'));
app.use('/api/remind', require('./routes/remind.routes'));
app.use('/api/chat', require('./routes/message.routes'));

let server = require('http').Server(app);
let io = require('socket.io')(server);
require('./routes/chat_socketio')(io);

// app2.listen("3038", () => console.log('App on ' + "3038"));
app.listen(PORT, () => console.log('App on ' + PORT));
/*
{
      serveClient: false,
      // below are engine.IO options
      origins: '*:*',
      transports: ['polling'],
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false
    }
 */