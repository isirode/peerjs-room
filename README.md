# peerjs-room

Disclaimer: Not affiliated with the original peerjs providers.

This is a library based on PeerJS that allow to connect to a peerjs-server-room setup and to broadcast message to a room.

You can extend it by using the app message layer that is supported by the library.

It works this way:

- There is a JSON message, it indicates a type : Room or App
  - In the Room space : there is Text messages or Rename messages
- In the App space : you can do as you want

For instance, for a text message, you would have this:

```json
{
  "type": "Room",
  "from": {
    "peer": {
      "id": "that would be a guid here"
    },
    "name": "my username"
  },
  "payload": {
    "type": "Text",
    "payload": {
      "text": "A text message from an user to the room"
    }
  }
}
```

If the message is of type 'App', you can put anything you want inside the payload.

## Features

- [x] Connect to users present in a room
- [x] Message to users present in the room once connected
  - [x] Text messages
  - [x] Rename messages
  - [x] Applicative (technical) messages, that would be the type of messages for game, for instance

## Using the library

```typescript
import { LocalUser, Message, P2PRoom, RenameUserMessage, TextMessage, User, IClient, Peer as DomainPeer, PeerJSServerClient, RoomService } from 'peerjs-room';

// use the appropriates value here
const peerJSClient = new PeerJSServerClient({
  host: "hostname",
  port: 443,
  secure: true,
});

const roomService = new RoomService(peerJSClient);

// that up to you to define for now, it how you create your peerjs instance
const peer = await peerProvider();

const roomId = 'main-room';

const room: IRoom = await roomService.joinRoom(roomId, peer.id);

const localUser = {
  peer: new DomainPeer(peer),
  name: 'an username',
};

p2pRoom = new P2PRoom(localUser, room, animalNames);

// Info : only the last 3 events are of importance (message, rename, applicative message)
// The rest can be used to debug or inform the user (errors, connection established, connection closed)

// technical
p2pRoom.events.on('connectionEstablished', ({connection, user}) => {
  console.log(connection, user);
});
p2pRoom.events.on('connectionClosed', ({connection, user}) => {
  console.log(connection, user);
});
p2pRoom.events.on('connectionError', ({connection, user, error}) => {
  console.log(connection, user, error);
});
p2pRoom.events.on('missingConnections', ({missingConnections}) => {
  console.log(missingConnections);
});
p2pRoom.events.on('allConnected', ({clients}) => {
  console.log(clients);
});
// messaging
p2pRoom.events.on('textMessage', ({connection, user, text, textMessage, root}) => {
  console.log(connection, user, text, textMessage, root);
});
p2pRoom.events.on('renameUserMessage', ({connection, user, newName, formerName, renameUserMessage, root}) => {
  console.log(connection, user, newName, formerName, renameUserMessage, root);
});
// app
p2pRoom.events.on('appMessage', ({user, appMessage, root}) => {
  console.log(user, appMessage, root)
});
```

## Importing the project

It is not published yet, so you will need to follow the steps below:
- Clone the project
- Build it `npm run build`
- Link it `npm link`
- Or use the single liner `npm run local`
- Then, you can import it in your project using `npm link peerjs-room`

### Dependencies

You should not need to do any custom imports.

## Know issues

- I did not pushed the peerjs-server-room repository yet, so it is not usable
- It is a work in progress

## Partipating

Open the [DEVELOPER.md](./DEVELOPER.md) section.

## License

It is provided with the GNU LESSER GENERAL PUBLIC LICENSE.

This is WebRTC room system based on PeerJS.
Copyright (C) 2023  Isirode

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
