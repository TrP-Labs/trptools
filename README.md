<img src="https://raw.githubusercontent.com/Ticko-Grey/trptools/master/Content/SiteContent/icon.png" alt="drawing" width="150"/>
# TrP Tools

## What's TrP Tools?
TrP Tools is an open source web service which aims to provide easy to use tools to the [TrP community](https://www.roblox.com/groups/4572671/Trolleybuses-Fan-Group)
## Host your own instance
This tutorial assumes you have git and npm installed already. 

Here are some tutorials to install those if you need to:
[npm installation tutorial](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
[git installation tutorial](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 

Steps to host your own instance:
1) Clone the repo with ``git clone https://github.com/Ticko-Grey/trptools``
2) Install the packages with ``npm install``
3) Run the server with ``node .``
Please note that the database is not included with this repository and your instance will not have data from the trptools.tickogrey.com instance

Also note that by default the port for index.js is 444, You will want to change this to 443 or 80 to host on the web
## License
TrP Tools is licensed under the [GNU GPL v3.0](https://choosealicense.com/licenses/gpl-3.0/) license
## 3rd party licenses
Source code for this software is NOT included in the TrP Tools repository, However they are required for the software to properly function.
Client dependencies:
- [AJV - MIT](https://ajv.js.org/license.html)
- [jQuery - MIT](https://jquery.com/license/)
- [Google material design icons - Apache 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE)
Server dependencies:
- [Socket.IO - MIT](https://github.com/socketio/socket.io/blob/main/LICENSE)
- [noblox.js - MIT](https://github.com/noblox/noblox.js/blob/master/LICENSE)
- [express - MIT](https://github.com/expressjs/express/blob/master/LICENSE)