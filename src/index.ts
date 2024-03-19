/*
    TrP Tools is an unofficial open source web service which aims to provide easy to use tools to the TrP community 
    Copyright (C) 2024 TickoGrey
    You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

import express from 'express';
import path from 'path';
import http from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

const app = express();
const server = http.createServer(app);
dotenv.config();

app.use(cookieParser())
app.set('view engine', 'ejs');

app.use('/public', express.static(__dirname + '/content/public', {
    extensions: ['html'],
}));

app.use('/tools', express.static(__dirname + '/content/tools', {
    extensions: ['html'],
}));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/content/index.html');
}); 

// Require module systems
app.use('/proxy', require(__dirname + '/serverModules/proxy.js'));
app.use('/auth', require(__dirname + '/serverModules/auth.js'));
app.use('/articles', require(__dirname + '/serverModules/articles.js'));

const socketIO = require(__dirname + '/serverModules/dispatchSocket.js');
socketIO(server);

// 404 Handler - This must come last
app.use(function(req, res) {
    res.status(404).sendFile(__dirname + '/Content/404.html');
});

server.listen(process.env.PORT);