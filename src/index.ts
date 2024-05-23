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
const rootDir : string = path.resolve(__dirname, '..');

app.use(cookieParser())

app.set('views', rootDir + '/content');
app.set('view engine', 'ejs');

app.use(express.json({limit: '8mb'}));

app.use('/public', express.static(rootDir + '/content/public', {
    extensions: ['html'],
}));

app.use('/tools', express.static(rootDir + '/content/tools', {
    extensions: ['html'],
}));

app.get('/', function(req, res){
    res.sendFile(rootDir + '/content/index.html');
}); 

// Require module systems
app.use('/proxy', require(__dirname + '/serverModules/proxy.js'));
app.use('/auth', require(__dirname + '/serverModules/auth.js'));
app.use('/articles', require(__dirname + '/serverModules/articles.js'));
app.use('/profiles', require(__dirname + '/serverModules/profiles.js'));

const socketIO = require(__dirname + '/serverModules/dispatchSocket.js');
socketIO(server);

// 404 Handler - This must come last
app.use(function(req, res) {
    res.status(404).sendFile(rootDir + '/content/404.html');
});

server.listen(process.env.PORT);