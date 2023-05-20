# Developer

## Participating

You can post an issue or you can open a PR, if there is a functionality that you think will be relevant to the project.

Your code will be posted using the same license as this project.

## Running tests

> npm test

Or

> yarn test

## Build

> npm run build

Or

> yarn build

## Features

- [x] Room
  - [x] Connect to the users of the room
  - [x] Broadcast a message to the users of the room
    - [x] Text message
    - [x] Rename message
    - [x] Applicative message
  - [x] Send a message to specific user

- [x] Channel
  - [ ] Basic system for a channel system

- [ ] Room adminship
  - [ ] Free room
  - [ ] Administrated room

## TODO

- Figure why I cannot install peerjs using `npm install peerjs`
- Figure why I cannot link the package, it is related to peerjs
  - I had peerjs forked in the lerna workspace, it seem to be using a link system
- Put the tsconfig at strict
