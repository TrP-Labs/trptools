# TrP Tools
<img src="https://raw.githubusercontent.com/Ticko-Grey/trptools/master/Content/SiteContent/icon.png" alt="drawing" width="150"/>

## What's TrP Tools?
TrP Tools is an unofficial open source web service which aims to provide easy to use tools to the [TrP community](https://www.roblox.com/groups/4572671/Trolleybuses-Fan-Group)
## Host your own instance
This tutorial assumes you have git and npm installed already. Doing this is **NOT** for beginners, its suggested you use [the official instance](https://trptools.com) instead

Here are some tutorials to install those if you need to:
[npm installation tutorial](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
[git installation tutorial](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 

Steps to host your own instance:
1) Clone the repo with ``git clone https://github.com/Ticko-Grey/trptools``
2) Install the packages with ``npm install``
3) [Install mongodb](https://www.mongodb.com/docs/manual/installation/) (not strictly required but many features will not work without it)
4) Create a .env file in the project directory (you can read an example under .env.example)
5) Run the server with ``node .``

Please note that the database is not included with this repository and your instance will not have data from the trptools.com instance
it's also suggested you use [nginx](https://nginx.org/en/docs/install.html) if you want ssl on your server, here's a config example:
```
server {
    listen 443 ssl;
    server_name trptools.com;

    # SSL support
    ssl_certificate fullchain.pem;
    ssl_certificate_key privkey.pem;

    location / {
        proxy_pass http://localhost:PORT;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```
## License
TrP Tools is licensed under the [GNU GPL v3.0](https://choosealicense.com/licenses/gpl-3.0/) license

Non-code assets in the repo are copyrighted and not covered by the GPL-3.0 license. you cannot use them under same terms.

You are allowed to host an unmodified instance of TrP Tools with them, but this does not give you permission to use it anywhere else, or make derivatives of it in any way.
## 3rd party licenses
Source code for this software is NOT included in the TrP Tools repository, However they are required for the software to properly function.

Client dependencies:
- [AJV - MIT](https://ajv.js.org/license.html)
- [jQuery - MIT](https://jquery.com/license/)
- [Google material design icons - Apache 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE)