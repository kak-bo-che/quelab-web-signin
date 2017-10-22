# Quelab Signin Form
The UI for the login page is written in [React](https://reactjs.org/). It is
static and implemented as a single page app.
Sign in events are asynchronously accumulated and displayed via a websocket interface to a
local [MQTT](http://mqtt.org) [server](https://mosquitto.org).

## Installation
### Nodejs
The static webpage is built using webpack, which requires that nodejs v8 be installed
```
install node8
NODE_ENV=production npm run build -- -p
```
The page itself is served by the quelab_signin project as static resource.